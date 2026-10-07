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
import React, { useEffect, useRef, useState } from 'react'
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
    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showHistory])

  // Sort history in descending order of version
  const sortedHistory = [...(history || [])].sort((a, b) => b.version - a.version)

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-white/10 bg-[#090b10]/90 backdrop-blur-xl text-zinc-100 relative z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer transition"
          title="Back to Dashboard"
        >
          <ArrowLeftIcon size={16} />
        </button>
        <img src="/logo.svg" alt="BuilderAI" className="size-5" />
        <span className="text-sm font-semibold truncate max-w-38 md:max-w-50 text-white">
          {projectName}
        </span>

        {/* Version Badge & History Dropdown Trigger */}
        <div className="relative" ref={historyRef}>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 font-medium transition cursor-pointer"
            title="View Revision History & Rollback"
          >
            <HistoryIcon size={11} className="text-amber-400" />
            <span>v{version}</span>
          </button>

          {/* History Popover */}
          {showHistory && (
            <div className="absolute top-8 left-0 w-80 bg-[#0d1017] border border-white/15 rounded-xl shadow-2xl p-3 z-50 text-xs text-zinc-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <HistoryIcon size={14} className="text-amber-400" />
                  <span>Version History</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
                >
                  <XIcon size={13} />
                </button>
              </div>

              {/* Current Version Card */}
              <div className="p-2 mb-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-amber-300">v{version}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                      Current Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Live in editor & preview</p>
                </div>
              </div>

              {/* Historical Snapshots */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5">
                {sortedHistory.length === 0 ? (
                  <p className="text-center py-4 text-zinc-500 text-[11px]">
                    No past revisions yet. Snapshots are created as you revise with AI.
                  </p>
                ) : (
                  sortedHistory.map((item, index) => {
                    const isCurrent = item.version === version
                    return (
                      <div
                        key={item.version || index}
                        className={`p-2 rounded-lg border transition flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-white/5 border-white/10 opacity-75'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white">v{item.version}</span>
                            <span className="text-[10px] text-zinc-500">
                              {item.timestamp ? moment(item.timestamp).fromNow() : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
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
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-[11px] font-medium transition cursor-pointer shrink-0"
                            title={`Restore v${item.version}`}
                          >
                            <RotateCcwIcon size={11} />
                            <span>Restore</span>
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

      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleShowCode}
          className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border text-xs font-medium rounded-lg cursor-pointer transition ${
            showCode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
              : 'border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 bg-zinc-900/80'
          }`}
        >
          {showCode ? (
            <>
              <EyeIcon size={13} /> Preview
            </>
          ) : (
            <>
              <Code2Icon size={13} /> Code
            </>
          )}
        </button>
        <button
          onClick={onOpenPreview}
          className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium rounded-lg cursor-pointer bg-zinc-900/80 transition"
        >
          <ExternalLinkIcon size={13} /> Open Preview
        </button>

        <button
          onClick={onPublish}
          disabled={publishing}
          className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium rounded-lg cursor-pointer bg-amber-500/10 transition"
        >
          {publishing ? <Loader2Icon size={13} className="animate-spin" /> : <GlobeIcon size={13} />} Publish
        </button>

        <button
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium rounded-lg cursor-pointer bg-zinc-900/80 transition"
        >
          <DownloadIcon size={13} /> Export
        </button>

        <button
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 text-xs font-medium rounded-lg cursor-pointer bg-zinc-900/80 transition"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}

export default BuilderHeader