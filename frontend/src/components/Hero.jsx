import React from 'react'
import { useNavigate } from 'react-router-dom'
import assets from "../assets/assets";


const Hero = () => {
   const navigate=useNavigate()


  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full bg-black justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>
      <div className='text-center mb-6'>
          <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl text-yellow-500 font-semibold mx-auto leading-[1.2]'>Create amazing content <br/> with <span className='text-primary'>AI tools</span></h1>
          <p className="mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto text-xl sm:text-2xl text-white">
          Transform your content creation with our suite of premium AI tools.
          </p>
          
      </div>
      <div className='flex flex-wrap justify-center gap-4 max-sm:text-xs'>
        <button onClick={()=>navigate('/ai')} className='bg-primary text-white text-xl px-10   bg-red-900 py-3 rounded-lg active:scale-95 transition cursor-pointer'>
          Start creating now</button>
        <button
          onClick={() => {
            const element = document.getElementById("aitools");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className=' text-white px-10 py-5 rounded-lg border text-xl border-gray-500 hover:scale-105 active:scale-95 transition cursor-pointer'>
          Watch demo</button>
      </div>
      <div className='flex items-center gap-4 mt-8 mx-auto text-xl text-gray-600'>
        <img src={assets.user_group} alt="" className='h-8'/>Trusted by 1k+ people
      </div>
    </div>
  )
}

export default Hero