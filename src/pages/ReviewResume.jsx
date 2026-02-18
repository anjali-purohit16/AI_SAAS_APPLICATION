import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {

    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')

    const {getToken} = useAuth()
            
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            
            const formData = new FormData()
            formData.append('resume', input)

            const {data} = await axios.post('/api/ai/resume-review', formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

            if (data.success) {
                setContent(data.content)
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }


  return (
    <div className='h-full bg-linear-to-br  from-red-900 to-black overflow-y-scroll p-8 flex items-start flex-wrap gap-4 text-white'>

        {/* left col */}
        <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-5 bg-black rounded-lg border border-gray-200'>

            <div className='flex items-center gap-3'>
                <Sparkles className='w-8 text-[#d8ba0d]'/>
                <h1 className='text-2xl   text-white font-semibold'>Resume Review</h1>
            </div>
            <p className='mt-6 mb-4 text-lg font-medium'>Upload Resume</p>

            <input onChange={(e)=>setInput(e.target.files[0])} type="file" accept='application/pdf' className='w-full p-5  mt-2 outline-none text-normal rounded-md border border-gray-300 text-gray-500' required/>

            <p className='text-normal font-light mt-3'>Supports PDF resume only.</p>

            <button className='w-full flex justify-center active:scale-75 items-center gap-2 bg-linear-to-r from-[#e3cc49] to-[#705609] text-white px-4 py-3 mt-6 text-xl rounded-lg cursor-pointer'>
                {
                    loading ? <span className='w-4 h-2 my-1 rounded-full  border-2 border-t-transparent animate-spin'></span>
                    : <FileText className='w-10'/>
                }
                Review Resume
            </button>

        </form>

        {/* right col */}
        <div className='w-full max-w-lg p-4 bg-black text-white text-lg rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>

            <div className='flex items-center gap-3'>
                <FileText className='w-10 h-10 text-[#d8ba0d]'/>
                <h1 className='text-xl font-semibold'>Analysis Results</h1>
            </div>

            {
                !content ? (<div className='flex-1 flex justify-center items-center'>
                                <div className='text-sm flex flex-col items-center gap-5'>
                                    <FileText className='w-9 h-9'/>
                                    <p className='text-lg'>Upload a resume and click "Review Resume" to get started</p>
                                </div>
                            </div>) : (
                                <div className='mt-3 h-full overflow-y-scroll text-lg'>
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

export default ReviewResume