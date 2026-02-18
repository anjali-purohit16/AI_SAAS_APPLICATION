import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// import pdf from 'pdf-parse/lib/pdf-parse.js';
import { PDFParse } from "pdf-parse";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { prompt, length} = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 5) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const response = await AI.chat.completions.create({
  model: "gemini-3-flash-preview",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt }
  ],
  temperature: 0.7,
  max_tokens: length
});


const content = response.choices[0].message.content;


    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    res.json({ success: true, content });

  } catch (error) {

    console.log("FULL ERROR:", error);
    res.json({ success: false, message: error.message });

  }
};



export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;


        if (plan !== 'premium' && free_usage >=10) {
            return res.json({success: false, message: "Limit reached. Upgrade to continue."})
        }

        const response = await AI.chat.completions.create({
          model: "gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }
          ],
          temperature: 0.7,
           max_tokens: 200,
          });
        const content = response.choices[0].message.content;

        await sql` INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata:{
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({success: true, content})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
        
    }
}

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium sbuscriptions."})
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
            responseType: "arraybuffer",
        } )

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const {secure_url} = await cloudinary.uploader.upload(base64Image)

        await sql` INSERT INTO creations (user_id, prompt, content, type, publish)
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({success: true,content: secure_url})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
        
    }
}




export const removeImageBackground = async (req, res) => {
  try {

    const userId = req.userId;
    const image = req.file;
    const plan = req.plan;

    // ✅ ADD HERE
    if (!image) {
      return res.json({
        success:false,
        message:"Image not received from request"
      });
    }

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions."
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (
        ${userId},
        ${"Remove background from image"},
        ${secure_url},
        ${"image"}
      )
    `;

    res.json({ success: true, content: secure_url });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



export const removeImageObject = async (req, res) => {
    try {
        const userId = req.userId;
        const {object} = req.body;
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium sbuscriptions."})
        }

        const {public_id} = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

        res.json({success: true,content: imageUrl})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
        
    }
}


export const reviewResume = async (req, res) => {
    try {

        const userId = req.userId;
        const resume = req.file;
        const plan = req.plan;

        // Check file received
        if (!resume) {
            return res.json({
                success: false,
                message: "Resume file not received"
            });
        }

        // Check plan
        if (plan !== "premium") {
            return res.json({
                success: false,
                message: "This feature is only available for premium subscriptions."
            });
        }

        // File size check
        if (resume.size > 5 * 1024 * 1024) {
            return res.json({
                success: false,
                message: "Resume file size exceeds allowed size (5MB)."
            });
        }

        // Read PDF
        const dataBuffer = fs.readFileSync(resume.path);
        const parser = new PDFParse({
         data: dataBuffer
        });
        const result = await parser.getText();
        await parser.destroy(); // VERY IMPORTANT (memory cleanup)

        const prompt = `Review the following resume and provide constructive feedback:${result.text}`;

        // AI CALL
        const response = await AI.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: [{ role: "user", content: prompt }]
        });

        const content = response.choices[0].message.content;

        // Save in DB
        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        res.json({
            success: true,
            content
        });

    } catch (error) {

        console.log("FULL ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });

    }
};

