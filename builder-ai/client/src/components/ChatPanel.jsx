import { BotIcon, BotMessageSquareIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import PromptInput from './PromptInput'

const ChatPanel = ({messages, onSend, loading}) => {

    const bottomRef = useRef(null)

    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior: "auto"})
    },[messages, loading])

  return (
    <div className="flex flex-col h-full bg-[#E6DFD5]">
         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                   <p className="text-[#635B54] text-sm text-center">Ask AI to modify your website</p> 
                </div>
            )}

            {messages.map((msg, i)=>(
                <div key={i}>
                    <div className="flex gap-2.5 items-start">
                        <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 bg-[#DCD3C7] border border-[#C0B4A5]">
                            {msg.role === "user" ? (
                                <UserIcon size={14} className='text-[#635B54]'/>
                            ) : (
                                <BotMessageSquareIcon size={14} className="text-[#9C5B42]"/>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="text-xs font-medium text-[#635B54] mb-1 uppercase tracking-wider">
                                {msg.role === "user" ? "You" : "AI"}
                            </p>
                            <p className="text-[13px] text-[#24211E] leading- tracking-wider whitespace-pre-wrap wrap-break-word">
                                {msg.content.split("- `/").map((text, i)=>(
                                    <span key={i} className="block mt-3">
                                        <span className={i === 0 ? "hidden" : ""}>- `/</span>
                                        {text}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex gap-2.5 items-start">
                    <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 bg-[#DCD3C7]">
                        <BotIcon size={13} className='text-[#9C5B42]'/>
                    </div>
                    <div className='flex-1'>
                        <p className="text-[11px] font-medium text-[#635B54] mb-2 uppercase tracking-wider">AI</p>
                        <div className='dot-loader'>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={bottomRef}/>
         </div>

         {/* Input */}
         <div className="p-3 border-t border-[#C0B4A5] bg-[#E6DFD5]">
            <PromptInput onSubmit={onSend} loading={loading} placeholder='Ask AI to modify...' autoFocus/>
         </div>
    </div>
  )
}

export default ChatPanel