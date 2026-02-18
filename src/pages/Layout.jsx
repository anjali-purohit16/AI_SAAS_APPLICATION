import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { Menu, X } from 'lucide-react'
import {SignIn,useUser } from '@clerk/clerk-react'
import Sidebar from '../components/Sidebar'

const Layout = () => {
  const navigate=useNavigate()
  const[sidebar,setSidebar]=useState(false)
  const {user}=useUser()
  return user ? (
    <div className='flex flex-col items-start  justify-start h-screen '>
     
      <nav className='w-full px-10 min-h-20 flex items-center justify-between bg-black border-b border-gray-700'>
      <div className='flex flex-row gap-5 items-center'>
        <img src={assets.logo} className="w-10 sm:w-18 cursor-pointer" alt="" onClick={( )=>navigate('/')} />
        <h1 className="text-3xl font-bold  text-red-800 ">
        PromptPilot
        </h1>
        {
          sidebar?<X onClick={()=>setSidebar(false)} className='w-6 h-6 text-primary  sm:hidden'/>
            : <Menu onClick={()=>setSidebar(true)} className='w-6 h-6 text-primary sm:hidden'/>
        }</div>
        </nav>   

        <div className='flex-1 w-full  flex h-[calc(100vh-64px)]'>
          <Sidebar  sidebar={sidebar} setSidebar={setSidebar}/>
          <div className='flex-1 bg-[#3f90e059]  overflow-y-auto'>
            <Outlet/> 
          </div>
      </div> 
    </div>
  ):(
    <div className='flex items-center justify-center  h-screen'>
      <SignIn/>
    </div>
  )
}

export default Layout