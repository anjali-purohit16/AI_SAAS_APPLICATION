import React from 'react'
import { AiToolsData } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const AItools = () => {

  const navigate =useNavigate()
  const {user}=useUser()

  return (
    <div  id="aitools" className='px-4 sm:px-20 xl:px-32 bg-linear-to-b from-[#000000] to-[#333232ae] py-20'>
    <div className='text-center'>
    <h2 className='text-white text-[55px] font-semibold'>Powerful AI Tools</h2>
    <p className='text-yellow-400 text-[22px] max-w-lg mx-auto'>
    Everything you need to create, enhance, 
    and optimize your content with cutting-edge 
    Ai technology.
    </p>
    <div className='flex flex-wrap mt-10 justify-center'>
      {
       AiToolsData.map((tool,index)=>(
        <div key={index} onClick={()=>user && navigate(tool.path)} className='p-8 m-4 max-w-xs 
        rounded-lg bg-[#0e0ed575]
        shadow-lg border border-gray-200 hover:-translate-y-2 transition-all 
        duration-300 cursor-pointer' > 
         <div className='flex flex-row items-center gap-4 mb-6'>
           <tool.Icon className='w-12 h-12 p-1 text-white rounded-xl ' 
          style={{background:`linear-gradient(to bottom,${tool.bg.from},${tool.bg.to})`}} />
          <h3 className='mb-3 text-2xl font-semibold text-white'>
            {tool.title}</h3>
         </div>
          <p className='text-lg text-yellow-400 max-w-[95%]'>
            {tool.description}</p>
        </div>

      ))}
      
      </div>
    </div>
    </div>
  )
}

export default AItools