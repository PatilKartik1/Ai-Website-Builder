import React, { useEffect, useRef, useState } from 'react'
import { BotMessageSquareIcon, SparklesIcon, UserIcon, BotIcon } from 'lucide-react'
import PromptInput from './PromptInput'

const QUICK_SUGGESTIONS = [
  { label: 'Dark theme',       icon: '◑', prompt: 'Revamp the color palette into a sleek dark luxury aesthetic with deep backgrounds, gold accents, and premium typography.' },
  { label: 'Mobile nav',       icon: '≡', prompt: 'Make the navbar sticky on scroll with a responsive mobile hamburger drawer menu and smooth slide-in animation.' },
  { label: 'Animations',       icon: '✦', prompt: 'Add smooth hover micro-animations, subtle card border glows, and staggered fade-in animations throughout the site.' },
  { label: 'Contact form',     icon: '□', prompt: 'Add an interactive contact form with Name, Email, Subject, and Message fields with validation and a success state.' },
  { label: 'Testimonials',     icon: '❝', prompt: 'Add a modern testimonials section with avatar photos, star ratings, quotes, and customer names.' },
  { label: 'FAQ accordion',    icon: '?', prompt: 'Add a collapsible FAQ section with smooth expand/collapse animations answering common product questions.' },
]

const ChatPanel = ({ messages, onSend, loading }) => {
  const [promptValue, setPromptValue] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleChipClick = (prompt) => setPromptValue(prompt)
  const handleSend = (text) => {
    onSend(text)
    setPromptValue('')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'transparent' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 hide-scrollbar">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-center" style={{ color: 'var(--text-3)' }}>
              Ask AI to modify your website
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            {/* Avatar */}
            <div
              className="shrink-0 size-6 rounded-md flex items-center justify-center mt-0.5 border"
              style={{
                background: msg.role === 'user' ? 'var(--surface-2)' : 'var(--accent-dim)',
                borderColor: msg.role === 'user' ? 'var(--border)' : 'rgba(139,131,247,0.2)',
              }}
            >
              {msg.role === 'user' ? (
                <UserIcon size={12} style={{ color: 'var(--text-2)' }} />
              ) : (
                <BotMessageSquareIcon size={12} style={{ color: 'var(--accent)' }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </p>
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-1)' }}>
                {msg.content.split('- `/').map((text, idx) => (
                  <span key={idx} className="block">
                    <span className={idx === 0 ? 'hidden' : ''}>- `/</span>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5 items-start">
            <div
              className="shrink-0 size-6 rounded-md flex items-center justify-center mt-0.5 border"
              style={{ background: 'var(--accent-dim)', borderColor: 'rgba(139,131,247,0.2)' }}
            >
              <BotIcon size={12} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>
                AI
              </p>
              <div className="dot-loader">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom input area */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {/* Quick chips */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
              <SparklesIcon size={9} style={{ color: 'var(--accent)' }} />
              Quick edits
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleChipClick(item.prompt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-40 border"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                  e.currentTarget.style.background = 'var(--accent-dim)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-2)'
                  e.currentTarget.style.background = 'var(--surface-2)'
                }}
              >
                <span style={{ opacity: 0.7 }}>{item.icon}</span>
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