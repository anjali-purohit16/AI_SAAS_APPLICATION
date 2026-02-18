import { PricingTable } from '@clerk/clerk-react'
import React from 'react'

const Plan = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#3c3b3b82] to-[#f1f0f0] py-12">

      {/* CENTER CONTENT */}
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-slate-100 text-[52px] font-semibold">
          Choose your Plan
        </h2>

        <p className="text-yellow-400 font-bold m-7  text-3xl max-w-lg mx-auto">
          Start for free and scale up as you grow.
          Find the perfect plan for your content creation needs.
        </p>
      </div>
       <div className="max-w-xl mx-auto mt-8">
        <PricingTable/>
       </div>
    </div>
  )
}

export default Plan