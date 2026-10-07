import React, { useEffect, useRef, useState } from 'react'
import {ArrowRightIcon, CloudUploadIcon, Loader2Icon, MicIcon} from 'lucide-react'

const PromptInput = ({
    onSubmit,
    loading = false,
    placeholder = "Describe the website you want to build...",
    large = false,
    autoFocus = false,
    variant = "default",
    value: controlledValue,
    onChange: controlledOnChange,
}) => {

    const [internalValue, setInternalValue] = useState("");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const setValue = isControlled ? controlledOnChange : setInternalValue;
    const textareaRef = useRef(null)

    useEffect(()=>{
        if(autoFocus && textareaRef.current){
            textareaRef.current.focus();
        }
    },[autoFocus])

    useEffect(()=>{
        if(isControlled && controlledValue && textareaRef.current){
            textareaRef.current.focus();
        }
    },[controlledValue, isControlled])

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
        <form onSubmit={handleSubmit} className='max-w-2xl w-full bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl shadow-black/40 focus-within:border-amber-500/70 focus-within:ring-1 focus-within:ring-amber-500/30 overflow-hidden mt-6 transition-all'>

            <textarea ref={textareaRef} value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={loading}
                rows={3} className='w-full p-4 pb-2 resize-none placeholder:text-zinc-500 outline-none bg-transparent text-zinc-100 text-base'/>

            <div className='flex items-center justify-between pb-3 px-3 gap-2'>
                <label htmlFor="file" className="border border-white/10 text-zinc-400 hover:text-zinc-100 hover:border-white/20 hover:bg-white/5 p-1.5 rounded-lg cursor-pointer flex items-center justify-center transition">
                    <input type="file" id='file' hidden/>
                    <CloudUploadIcon size={18}/>
                </label>
                <div className='flex items-center justify-end gap-2'>
                    <button type='button' className="flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg cursor-pointer transition">
                        <MicIcon size={18}/>
                    </button>

                    <button type='submit' 
                    disabled={!value.trim() || loading}
                    className="flex items-center justify-center p-2 rounded-full bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-40 cursor-pointer transition-all shadow-md shadow-amber-600/30">
                        {loading ? <Loader2Icon size={18} className="animate-spin"/> : <ArrowRightIcon size={18}/>}
                    </button>
                </div>
            </div>

        </form>
    )
}

  return (
    <div className={`bg-zinc-900/90 backdrop-blur-md border border-white/15 rounded-xl flex items-end gap-2 focus-within:border-amber-500/70 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all ${large ? "p-4" : "p-2.5"}`}>

        <textarea ref={textareaRef} 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        onKeyDown={handleKeyDown} 
        placeholder={placeholder} 
        disabled={loading}
        rows={large ? 5 : 1} 
        className={`flex-1 bg-transparent border-none outline-none resize-none text-zinc-100 placeholder:text-zinc-500 ${large ? "text-base" : "text-sm"}`}/>

        <button
        onClick={()=> handleSubmit()}
        disabled={!value.trim() || loading}
        className='inline-flex items-center justify-center bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-40 cursor-pointer rounded-full shrink-0 transition-all shadow-sm shadow-amber-600/30'
        style={{
            width: large ? 36 : 28,
            height: large ? 36 : 28,
        }}>
            {loading ? <Loader2Icon size={large ? 20 : 15} className="animate-spin"/> : <ArrowRightIcon size={large ? 20 : 15}/>}
        </button>
    </div>
  )
}

export default PromptInput