import React from 'react'

const LoginLeft = () => {
  return (
    <div className="hidden lg:flex lg:w-2/5 bg-[#F4F0EA] border-r border-[#D8D0C5] flex-col justify-between p-12 shrink-0 select-none">
        <div className='flex items-center gap-3'>
           <img src="/logo.svg" alt="Logo" className="size-9.5"/>
           <span className="text-4xl font-medium text-[#2C2A29]">Builder AI</span>
        </div>
        <div>
            <h2 className='text-3xl text-[#2C2A29] font-medium leading-snug mb-3 tracking-tight'>Build your presence on web</h2>
            <p className="text-[#7A7570]">
                Describe what you need, preview instantly, and customize your site in real-time. React with clean JSX, verified layouts, and instant code exports.
            </p>
            <p className='text-[#7A7570] text-sm mt-12'>Copyright {new Date().getFullYear()} BuilderAI</p>

        </div>
    </div>
  )
}

export default LoginLeft