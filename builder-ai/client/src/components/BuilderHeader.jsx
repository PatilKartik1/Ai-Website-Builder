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
  LogOutIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import moment from 'moment'

const BuilderHeader = ({
  projectName,
  version,
  saveStatus = "saved",
  history = [],
  onRollback,
  viewMode = 'preview',
  onViewModeChange,
  publishing,
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
    'inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border'
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

        {/* Save state + Version History */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] whitespace-nowrap" aria-live="polite" title={{pending: "Changes waiting to save", saving: "Saving changes", saved: "All changes saved", error: "Save failed"}[saveStatus] || "Save status"}>
          <span className={`size-1.5 rounded-full ${saveStatus === "saved" ? "bg-emerald-400" : saveStatus === "error" ? "bg-red-400" : "bg-amber-400"}`} />
          <span style={{ color: saveStatus === "error" ? "#f87171" : "var(--text-3)" }}>
            {{pending: "Unsaved", saving: "Saving…", saved: "Saved", error: "Save failed"}[saveStatus] || "Save status"}
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
        <div className="inline-flex items-center gap-0.5 rounded-lg border p-0.5" role="group" aria-label="Workspace view" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
          {[
            { id: 'preview', label: 'Preview', icon: <EyeIcon size={12} /> },
            { id: 'split', label: 'Split', icon: <Code2Icon size={12} /> },
            { id: 'code', label: 'Code', icon: <Code2Icon size={12} /> },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onViewModeChange?.(mode.id)}
              aria-pressed={viewMode === mode.id}
              title={`${mode.label} view`}
              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors"
              style={{
                background: viewMode === mode.id ? 'var(--accent-dim)' : 'transparent',
                color: viewMode === mode.id ? 'var(--accent)' : 'var(--text-3)',
                border: viewMode === mode.id ? '1px solid rgba(139,131,247,0.25)' : '1px solid transparent',
              }}
            >
              {mode.icon}
              <span className="hidden lg:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        <button type="button" onClick={onOpenPreview} aria-label="Open preview in new tab" title="Open preview" className={btnGhost} style={{ background: 'transparent' }}>
          <ExternalLinkIcon size={12} />
          <span className="hidden sm:inline">Open</span>
        </button>

        <button
          type="button"
          aria-label="Publish website"
          onClick={onPublish}
          disabled={publishing}
          className={`${btnBase} border-[var(--accent)] cursor-pointer`}
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          {publishing ? <Loader2Icon size={12} className="animate-spin" /> : <GlobeIcon size={12} />}
          <span className="hidden sm:inline">Publish</span>
        </button>

        <button type="button" onClick={onDownload} aria-label="Export project" title="Export project" className={btnGhost} style={{ background: 'transparent' }}>
          <DownloadIcon size={12} />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border)' }} />

        <button
          type="button"
          onClick={onLogout}
          className="text-xs cursor-pointer transition-colors px-2 py-1"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <span className="hidden md:inline">Sign out</span>
          <span className="md:hidden" aria-hidden="true"><LogOutIcon size={14} /></span>
        </button>
      </div>
    </header>
  )
}

export default BuilderHeader