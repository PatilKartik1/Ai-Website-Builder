import React, { useEffect, useRef, useState } from 'react'
import {ArrowRightIcon, CloudUploadIcon, Loader2Icon, MicIcon} from 'lucide-react'

const PromptInput = ({onSubmit, loading = false, placeholder = "Describe the website you want to build...", large = false, autoFocus = false, variant = "default"}) => {

    const [value, setValue] = useState("");
    const textareaRef = useRef(null)

    useEffect(()=>{
        if(autoFocus && textareaRef.current){
            textareaRef.current.focus();
        }
    },[autoFocus])

    const handleSubmit = (e)=>{
        if(e) e.preventDefault()
        const trimmed = value.trim()
        if(!trimmed || loading) return;
        onSubmit(trimmed)
        setValue("")
    }

    const handleKeyDown = (e)=>{
        if(e.key === "Enter" &&  !e.shiftKey){
            e.preventDefault();
            handleSubmit()
        }
    }

if(variant === "glass"){
    return (
        <form onSubmit={handleSubmit} className='max-w-2xl w-full bg-[#DCD3C7] rounded-xl border border-[#C0B4A5] shadow-xs focus-within:border-[#9C5B42] overflow-hidden mt-6 transition'>

            <textarea ref={textareaRef} value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={loading}
                rows={3} className='w-full p-4 pb-2 resize-none placeholder:text-[#857C73] outline-none bg-transparent text-[#24211E] text-base'/>

            <div className='flex items-center justify-between pb-3 px-3 gap-2'>
                <label htmlFor="file" className="border border-[#C0B4A5] text-[#635B54] hover:text-[#24211E] hover:border-[#B2A494] p-1.5 rounded-md cursor-pointer flex items-center justify-center">
                    <input type="file" id='file' hidden/>
                    <CloudUploadIcon size={18}/>
                </label>
                <div className='flex items-center justify-end gap-2'>
                    <button type='button' className="flex items-center justify-center p-1 text-[#635B54] hover:text-[#24211E] cursor-pointer">
                        <MicIcon size={18}/>
                    </button>

                    <button type='submit' 
                    disabled={!value.trim() || loading}
                    className="flex items-center justify-center p-1.5 rounded-full bg-[#9C5B42] text-white hover:bg-[#854B34] disabled:opacity-40 cursor-pointer transition-colors">
                        {loading ? <Loader2Icon size={18} className="animate-spin"/> : <ArrowRightIcon size={18}/>}
                    </button>
                </div>
            </div>

        </form>
    )
}

  return (
    <div className={`bg-white border border-zinc-200 rounded-xl flex items-end gap-2 focus-within:ring-1 focus-within:ring-zinc-300 transition ${large ? "p-4" : "p-3"}`}>

        <textarea ref={textareaRef} 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        onKeyDown={handleKeyDown} 
        placeholder={placeholder} 
        disabled={loading}
        rows={large ? 5 : 1} 
        className={`flex-1 bg-transparent border-none outline-none resize-none text-zinc-900 placeholder:text-zinc-400 ${large ? "text-base" : "text-sm"}`}/>

        <button
        onClick={()=> handleSubmit()}
        disabled={!value.trim() || loading}
        className='inline-flex items-center justify-center bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-40 cursor-pointer rounded-full shrink-0'
        style={{
            width: large ? 36 : 24,
             height: large ? 36 : 24,
        }}>
            {loading ? <Loader2Icon size={large ? 20 : 15} className="animate-spin"/> : <ArrowRightIcon size={large ? 20 : 15}/>}
        </button>
    </div>
  )
}

export default PromptInput