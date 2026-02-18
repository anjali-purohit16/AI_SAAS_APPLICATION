import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {useClerk,UserButton,useUser} from '@clerk/clerk-react'

const Navbar = () => {
  const navigate =useNavigate()

  const{user}=useUser()
  const{openSignIn}=useClerk()

  return (
    <div className='fixed z-9 w-full backdrop-blur-2xl flex justify-between items-center p-4 sm:px-20 xl:px-32'>
      <div className='flex items-center gap-4'>
        <img src={assets.logo} alt="logo" className="w-25 sm:w-22 cursor-pointer" onClick={()=>navigate('/')} />
        <div className='flex items-center gap-6'>
         <h1 className="text-3xl text-red-700 font-bold text-primary">
         PromptPilot
        </h1>
        </div>
        
      </div>
    {
        user?<UserButton/>:(
      <button onClick={openSignIn} className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5'>
      Get started<ArrowRight className='w-4 h-4' /></button>
      )
      }
    </div>
  )
}

export default Navbar