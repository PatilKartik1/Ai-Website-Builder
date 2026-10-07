import { BotIcon, BotMessageSquareIcon, SparklesIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import PromptInput from './PromptInput'

const QUICK_SUGGESTIONS = [
  {
    label: 'Dark Luxury',
    icon: '🎨',
    prompt:
      'Revamp the color palette into a sleek dark luxury aesthetic with gold accents, deep backgrounds, and elegant typography.',
  },
  {
    label: 'Sticky Mobile Nav',
    icon: '📱',
    prompt:
      'Make the navbar sticky on scroll with a responsive mobile hamburger drawer menu and smooth transitions.',
  },
  {
    label: 'Micro-Animations',
    icon: '✨',
    prompt:
      'Add smooth hover micro-animations, glowing card borders, and interactive button hover effects throughout the website.',
  },
  {
    label: 'Contact Form',
    icon: '📝',
    prompt:
      'Add an interactive contact form with fields for Name, Email, Subject, and Message, complete with validation and a success feedback state.',
  },
  {
    label: 'Testimonials',
    icon: '🌟',
    prompt:
      'Add a modern customer reviews and testimonials section with avatars, star ratings, and company badges.',
  },
  {
    label: 'FAQ Accordion',
    icon: '❓',
    prompt:
      'Add a collapsible FAQ accordion section answering common questions with smooth expand/collapse animations.',
  },
]

const ChatPanel = ({ messages, onSend, loading }) => {
  const [promptValue, setPromptValue] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, loading])

  const handleChipClick = (prompt) => {
    setPromptValue(prompt)
  }

  const handleSend = (text) => {
    onSend(text)
    setPromptValue('')
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 hide-scrollbar">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm text-center">Ask AI to modify your website</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <div className="flex gap-2.5 items-start">
              <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 bg-zinc-800/80 border border-white/10 shadow-xs">
                {msg.role === 'user' ? (
                  <UserIcon size={14} className="text-zinc-300" />
                ) : (
                  <BotMessageSquareIcon size={14} className="text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                  {msg.role === 'user' ? 'You' : 'AI'}
                </p>
                <div className="text-[13px] text-zinc-200 leading-relaxed tracking-normal whitespace-pre-wrap wrap-break-word">
                  {msg.content.split('- `/').map((text, idx) => (
                    <span key={idx} className="block mt-2">
                      <span className={idx === 0 ? 'hidden' : ''}>- `/</span>
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-start">
            <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 bg-zinc-800/80 border border-white/10">
              <BotIcon size={13} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                AI
              </p>
              <div className="dot-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area with Quick Revision Chips */}
      <div className="p-3 border-t border-white/10 bg-[#090b10]/80 backdrop-blur-md">
        {/* Chips */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <SparklesIcon size={10} className="text-amber-400" />
              <span>Revision Ideas</span>
            </span>
            <span className="text-[10px] text-zinc-500">Tap to fill</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleChipClick(item.prompt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-amber-300 text-[11px] whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <PromptInput
          value={promptValue}
          onChange={setPromptValue}
          onSubmit={handleSend}
          loading={loading}
          placeholder="Ask AI to modify..."
          autoFocus
        />
      </div>
    </div>
  )
}

export default ChatPanel