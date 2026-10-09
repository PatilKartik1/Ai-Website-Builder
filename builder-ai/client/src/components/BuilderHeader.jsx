import React from 'react'
import {
  ArrowLeftIcon,
  Code2Icon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  GlobeIcon,
  HistoryIcon,
  Loader2Icon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import moment from 'moment'

const BuilderHeader = ({
  projectName,
  version,
  history = [],
  onRollback,
  showCode,
  publishing,
  onToggleShowCode,
  onOpenPreview,
  onPublish,
  onDownload,
  onBack,
  onLogout,
}) => {
  const [showHistory, setShowHistory] = useState(false)
  const historyRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false)
      }
    }
    if (showHistory) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showHistory])

  const sortedHistory = [...(history || [])].sort((a, b) => b.version - a.version)

  const btnBase =
    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border'
  const btnGhost =
    `${btnBase} border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-md)]`
    
  return (
    <header
      className="h-11 shrink-0 flex items-center justify-between px-3 border-b relative z-30"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Left: back + name + version */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg cursor-pointer transition-colors"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
          title="Back to Dashboard"
        >
          <ArrowLeftIcon size={15} />
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <img src="/logo.svg" alt="BuilderAI" className="size-4 opacity-70 shrink-0" />
          <span className="text-sm font-medium truncate max-w-36 md:max-w-52" style={{ color: 'var(--text-1)' }}>
            {projectName}
          </span>
        </div>

        {/* Version + History */}
        <div className="relative" ref={historyRef}>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border cursor-pointer transition-all font-mono"
            style={{
              background: showHistory ? 'var(--accent-dim)' : 'var(--surface-2)',
              borderColor: showHistory ? 'var(--accent)' : 'var(--border)',
              color: showHistory ? 'var(--accent)' : 'var(--text-2)',
            }}
            title="Version History"
          >
            <HistoryIcon size={10} />
            v{version}
          </button>

          {/* History Popover */}
          {showHistory && (
            <div
              className="absolute top-9 left-0 w-76 rounded-xl shadow-2xl p-3 z-50 text-xs border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-md)' }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-1)' }}>
                  <HistoryIcon size={13} style={{ color: 'var(--accent)' }} />
                  Version History
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded cursor-pointer transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
                >
                  <XIcon size={12} />
                </button>
              </div>

              {/* Current badge */}
              <div
                className="p-2 mb-2 rounded-lg border flex items-center justify-between"
                style={{ background: 'var(--accent-dim)', borderColor: 'rgba(139,131,247,0.2)' }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold font-mono" style={{ color: 'var(--accent)' }}>v{version}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                    >
                      Current
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-2)' }}>Live in editor</p>
                </div>
              </div>

              {/* Historical snapshots */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                {sortedHistory.length === 0 ? (
                  <p className="text-center py-5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                    No revisions yet. Snapshots are saved as you edit with AI.
                  </p>
                ) : (
                  sortedHistory.map((item, index) => {
                    const isCurrent = item.version === version
                    return (
                      <div
                        key={item.version || index}
                        className="p-2 rounded-lg border flex items-center justify-between gap-2 transition-all"
                        style={{
                          background: isCurrent ? 'var(--surface-2)' : 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          opacity: isCurrent ? 0.6 : 1,
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium font-mono" style={{ color: 'var(--text-1)' }}>v{item.version}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                              {item.timestamp ? moment(item.timestamp).fromNow() : ''}
                            </span>
                          </div>
                          <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-2)' }}>
                            {item.description || 'Saved snapshot'}
                          </p>
                        </div>

                        {!isCurrent && onRollback && (
                          <button
                            type="button"
                            onClick={() => {
                              onRollback(item.version)
                              setShowHistory(false)
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer border shrink-0"
                            style={{
                              background: 'var(--accent-dim)',
                              borderColor: 'rgba(139,131,247,0.2)',
                              color: 'var(--accent)',
                            }}
                          >
                            <RotateCcwIcon size={10} />
                            Restore
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleShowCode}
          className={`${btnBase} ${showCode
            ? 'border-[var(--accent)] text-[var(--accent)]'
            : 'border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-md)]'
          }`}
          style={showCode ? { background: 'var(--accent-dim)' } : { background: 'transparent' }}
        >
          {showCode ? <EyeIcon size={12} /> : <Code2Icon size={12} />}
          {showCode ? 'Preview' : 'Code'}
        </button>

        <button onClick={onOpenPreview} className={btnGhost} style={{ background: 'transparent' }}>
          <ExternalLinkIcon size={12} />
          Open
        </button>

        <button
          onClick={onPublish}
          disabled={publishing}
          className={`${btnBase} border-[var(--accent)] cursor-pointer`}
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          {publishing ? <Loader2Icon size={12} className="animate-spin" /> : <GlobeIcon size={12} />}
          Publish
        </button>

        <button onClick={onDownload} className={btnGhost} style={{ background: 'transparent' }}>
          <DownloadIcon size={12} />
          Export
        </button>

        <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border)' }} />

        <button
          onClick={onLogout}
          className="text-xs cursor-pointer transition-colors px-2 py-1"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}

export default BuilderHeader