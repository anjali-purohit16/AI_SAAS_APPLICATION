import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";
import Groq from "groq-sdk";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
}); 


export const generateArticle = async (req, res) => {
  try {

    const userId = req.userId;
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
    const userId = req.userId;;
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required."
      });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message: "Limit reached. Upgrade to continue."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate exactly 5 catchy blog titles for: "${prompt}"

Return output strictly in this JSON format:
{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3",
    "Title 4",
    "Title 5"
  ]
}
`,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const rawText = response.text;

    // 🔥 Safe JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI response format error."
      });
    }

    const formattedContent = parsed.titles.join("\n\n");

    // ✅ Save STRING in DB (not object)
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${formattedContent}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    return res.json({
      success: true,
      content: formattedContent
    });

  } catch (error) {
    console.log("BLOG TITLE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



export const generateImage = async (req, res) => {
    try {
        const {userId} = req.auth();
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
        console.log(error)
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

    if (!resume) {
      return res.json({
        success: false,
        message: "Resume file not received",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Premium feature only",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume exceeds 5MB limit",
      });
    }

    // ✅ PDF TEXT EXTRACTION
    const dataBuffer = fs.readFileSync(resume.path);
    const result = await pdf(dataBuffer);

    const prompt = `
You are an expert ATS Resume Reviewer.

Analyze the resume and provide:
1. Overall Score (/10)
2. Strengths
3. Weaknesses
4. Missing Keywords
5. Formatting Suggestions
6. ATS Optimization Tips
7. Final Improvements

Resume:
${result.text}
`;

    // ✅ GROQ CALL
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      completion.choices[0]?.message?.content || "No response";

    // ✅ SAVE RESULT
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    // ✅ DELETE FILE (best-effort)
    try {
      fs.unlinkSync(resume.path);
    } catch (unlinkError) {
      console.error("Failed to delete resume file:", unlinkError);
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.log("FULL ERROR:", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};



