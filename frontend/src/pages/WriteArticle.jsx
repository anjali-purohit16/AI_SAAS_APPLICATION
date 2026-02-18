import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {

    const articleLength = [
        {length: 800, text: 'Short (500-800 words)'},
        {length: 1200, text: 'Medium (800-1200 words)'},
        {length: 1600, text: 'Long (1200+ words)'}
    ]

    const [selectedLength, setSelectedLength] = useState(articleLength[0])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')

    const {getToken} = useAuth()

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            const prompt = `Write an article about ${input} in ${selectedLength.text}`

            const {data} = await axios.post('/api/ai/generate-article', {prompt, length:selectedLength.length}, {
                headers:{Authorization: `Bearer ${await getToken()}`}
            })

            if (data.success) {
                setContent(data.content)
                setInput('');
            }else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        finally {
        setLoading(false); 
        }
    }



  return (
    <div className='h-full overflow-y-scroll bg-linear-to-br  from-red-900 to-black p-6 flex items-start flex-wrap gap-4  text-white'>

        {/* left col */}
        <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-black rounded-lg border border-gray-200'>
            <div className='flex items-center gap-3'>
                <Sparkles className='w-8  text-[#4A7AFF]'/>
                <h1 className='text-xl font-semibold'>Article Configuration</h1>
            </div>
            <p className='mt-6 text-sm font-bold'>Article Topic</p>

            <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-lg  text-white rounded-md border border-gray-300' placeholder='The future of artificial intelligence is...' required/>

            <p className='mt-4 text-sm font-medium'>Article Length</p>

            <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                {articleLength.map((item, index)=>(
                    <span onClick={()=> setSelectedLength(item)} className={`text-sm px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text ? 'bg-blue-50 text-blue-700' : 'text-white border-gray-300'} `} key={index}>{item.text}</span>
                ))}
            </div>
            <br />
            <button disabled={loading} className='w-full active:scale-75 flex justify-center items-center gap-2 bg-linear-to-r from-[#2f6ce5] to-[#031590] text-white px-4 py-4 mt-6 text-lg rounded-lg cursor-pointer'>
                {
                    loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
                    : <Edit className='w-7'/>
                }
                Generate article
            </button>

        </form>

        {/* right col */}
        <div className='w-full max-w-lg p-4 bg-black rounded-lg flex flex-col border border-gray-200 h-[80vh] overflow-hidden'>

    <div className='flex items-center gap-3'>
        <Edit className='w-5 h-5 text-[#2450c8]'/>
        <h1 className='text-xl font-semibold'>Generated Article</h1>
    </div>

    {!content ? (
        <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-white'>
                <Edit className='w-9 h-9'/>
                <p className='text-lg'>Enter a topic and click “Generate article ” to get started</p>
            </div>
        </div>
    ) : (
        <div className='mt-3 flex-1 overflow-y-auto text-lg text-white scrollbar-hide'>
            <div className='reset-tw'>
                <Markdown>{content}</Markdown>
            </div>
        </div>
    )}

</div>

        
    </div>
  )
}

export default WriteArticle