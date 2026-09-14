import React from 'react'

const LoginLeft = () => {
  return (
    <div className="hidden lg:flex lg:w-2/5 bg-[#DCD3C7] border-r border-[#C0B4A5] flex-col justify-between p-12 shrink-0 select-none">
        <div className='flex items-center gap-3'>
           <img src="/logo.svg" alt="Logo" className="size-9.5"/>
           <span className="text-4xl font-medium text-[#24211E]">Builder AI</span>
        </div>
        <div>
            <h2 className='text-3xl text-[#24211E] font-medium leading-snug mb-3 tracking-tight'>Build your presence on web</h2>
            <p className="text-[#635B54]">
                Describe what you need, preview instantly, and customize your site in real-time. React with clean JSX, verified layouts, and instant code exports.
            </p>
            <p className='text-[#635B54] text-sm mt-12'>Copyright {new Date().getFullYear()} BuilderAI</p>

        </div>
    </div>
  )
}

export default LoginLeft