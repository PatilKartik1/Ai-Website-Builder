import React, { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon, Loader2Icon } from 'lucide-react'

const PromptInput = ({
  onSubmit,
  loading = false,
  placeholder = 'Describe the website you want to build...',
  autoFocus = false,
  variant = 'default',
  value: controlledValue,
  onChange: controlledOnChange,
}) => {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const setValue = isControlled ? controlledOnChange : setInternalValue
  const textareaRef = useRef(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    if (isControlled && controlledValue && textareaRef.current) textareaRef.current.focus()
  }, [controlledValue, isControlled])

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const submitBtn = (size = 16) => (
    <button
      type="submit"
      onClick={() => handleSubmit()}
      disabled={!value.trim() || loading}
      className="flex items-center justify-center rounded-full shrink-0 cursor-pointer transition-all disabled:opacity-30"
      style={{
        background: 'var(--accent)',
        color: '#fff',
        width: size + 8,
        height: size + 8,
      }}
    >
      {loading ? <Loader2Icon size={size - 2} className="animate-spin" /> : <ArrowRightIcon size={size - 2} />}
    </button>
  )

  if (variant === 'glass') {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl overflow-hidden transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-md)',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-md)')}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          rows={3}
          className="w-full p-4 pb-2 resize-none outline-none bg-transparent text-sm leading-relaxed"
          style={{ color: 'var(--text-1)', caretColor: 'var(--accent)' }}
        />
        <div className="flex items-center justify-end pb-3 px-3">
          {submitBtn(16)}
        </div>
      </form>
    )
  }

  return (
    <div
      className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none text-sm"
        style={{ color: 'var(--text-1)', caretColor: 'var(--accent)' }}
      />
      {submitBtn(14)}
    </div>
  )
}

export default PromptInput