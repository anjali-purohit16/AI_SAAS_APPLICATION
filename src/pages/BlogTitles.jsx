import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const BlogTitles = () => {

    const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
    
    const [selectedCategory, setSelectedCategory] = useState('General')
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')

    const {getToken} = useAuth()
    
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedCategory}`

            const {data} = await axios.post('/api/ai/generate-blog-title', {prompt}, {headers: {Authorization: `Bearer ${await getToken()}`}})

            if (data.success) {
                setContent(data.content)
                setInput('');
                toast.success(data.message || "Blog title generated successfully!")
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to generate blog title")
        }
        finally {
        setLoading(false); 
        }
    }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-lg bg-linear-to-br  from-red-900 to-black text-white'>

        {/* left col */}
        <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-black rounded-lg border border-gray-200'>

            <div className='flex items-center gap-3'>
                <Sparkles className=' w-12  text-purple-600'/>
                <h1 className='text-xl font-semibold'>AI Title Generator</h1>
            </div>
            <p className='mt-6 text-xl font-medium'>Keyword</p>

            <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" className='w-full p-4  mt-2 outline-none  rounded-md border border-gray-200 text-white' placeholder='The future of artificial intelligence is...' required/>

            <p className='mt-4 text-xl font-medium'>Category</p>

            <div className='mt-3 flex gap-3 flex-wrap sm:max-w-[90%]'>
                {blogCategories.map((item)=>(
                    <span onClick={()=> setSelectedCategory(item)} className={`text-sm px-4 py-2 border rounded-full cursor-pointer ${selectedCategory === item ? 'bg-purple-50 text-purple-600' : 'text-white border-gray-300'} `} key={item}>{item}</span>
                ))}
            </div>
            <br />
            <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg  active:scale-75 cursor-pointer'>
                {
                    loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
                    : <Hash className='w-5'/>
                }
                Generate title
            </button>

        </form>

        {/* right col */}
        <div className='w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-200 min-h-[400px]'>

            <div className='flex items-center gap-3'>
                <Hash className='w-10 h-10 text-[#8E37EB]'/>
                <h1 className='text-xl font-semibold'>Generated Titles</h1>
            </div>

            {
                !content ? (
                    <div className='flex-1 flex justify-center items-center'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <Hash className='w-9 h-9'/>
                            <p className='text-lg '>Enter a topic and click “Generated title” to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='mt-3 h-full text-lg text-white'>
                        <div className='reset-tw'>
                            <Markdown>{content}</Markdown>
                        </div>
                    </div>
                )
            }

        </div>      
    </div>
  )
}

export default BlogTitles