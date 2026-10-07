import {
  Check,
  FileCodeIcon,
  FileTextIcon,
  FolderOpenIcon,
  Lock,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'

function buildTree(paths) {
  const root = []
  for (const filePath of paths.sort()) {
    const parts = filePath.split('/').filter(Boolean)
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]
      const isLast = i === parts.length - 1
      const fullPath = '/' + parts.slice(0, i + 1).join('/')
      let existing = current.find((n) => n.name === name)
      if (!existing) {
        existing = {
          name,
          path: fullPath,
          isDir: !isLast,
          children: [],
        }
        current.push(existing)
      }
      current = existing.children
    }
  }
  return root
}

function getFileIcon(name) {
  if (name.endsWith('.css')) return <FileTextIcon size={14} className="text-sky-400 shrink-0" />
  if (name.endsWith('.jsx') || name.endsWith('.js'))
    return <FileCodeIcon size={14} className="text-amber-400 shrink-0" />
  if (name.endsWith('.json')) return <FileTextIcon size={14} className="text-emerald-400 shrink-0" />
  return <FileTextIcon size={14} className="text-zinc-400 shrink-0" />
}

function TreeItem({
  node,
  activeFile,
  onFileSelect,
  onDeleteFile,
  onRenameFile,
  depth = 0,
}) {
  const isActive = node.path === activeFile
  const isCore = node.path === '/App.js' || node.path === '/styles.css'
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(node.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (node.isDir) {
    return (
      <div>
        <div
          className="flex items-center gap-2 py-1.5 px-2 text-xs text-zinc-400 select-none font-medium"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <FolderOpenIcon size={14} className="text-amber-400/90 shrink-0" />
          <span className="truncate">{node.name}</span>
        </div>
        {node.children.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  const handleRenameSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const trimmed = renameVal.trim()
    if (!trimmed || trimmed === node.name) {
      setIsRenaming(false)
      setRenameVal(node.name)
      return
    }

    // Replace the last path segment with the new name
    const parts = node.path.split('/')
    parts[parts.length - 1] = trimmed
    const newPath = parts.join('/')

    if (onRenameFile) {
      onRenameFile(node.path, newPath)
    }
    setIsRenaming(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      if (onDeleteFile) onDeleteFile(node.path)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <div
      className={`group relative flex items-center justify-between py-1 px-2 text-xs transition-colors rounded-lg cursor-pointer ${
        isActive
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium shadow-xs'
          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => {
        if (!isRenaming && !confirmDelete) onFileSelect(node.path)
      }}
    >
      {isRenaming ? (
        <form
          onSubmit={handleRenameSubmit}
          className="flex items-center gap-1 w-full py-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {getFileIcon(renameVal)}
          <input
            type="text"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            autoFocus
            className="flex-1 bg-black/60 border border-amber-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsRenaming(false)
                setRenameVal(node.name)
              }
            }}
          />
          <button
            type="submit"
            className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-white/10"
            title="Save"
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRenaming(false)
              setRenameVal(node.name)
            }}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
            title="Cancel"
          >
            <X size={12} />
          </button>
        </form>
      ) : confirmDelete ? (
        <div
          className="flex items-center justify-between w-full py-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] text-red-300 font-medium">Delete {node.name}?</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDelete}
              className="px-1.5 py-0.5 bg-red-500 text-white font-semibold rounded text-[10px] hover:bg-red-600 transition"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] hover:bg-zinc-700 transition"
            >
              No
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
          </div>

          {/* Action icons / Core Badge */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {isCore ? (
              <span title="Core system file" className="opacity-40">
                <Lock size={11} className="text-zinc-400" />
              </span>
            ) : (
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsRenaming(true)
                  }}
                  className="p-1 text-zinc-400 hover:text-amber-300 hover:bg-white/10 rounded transition"
                  title="Rename"
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1 text-zinc-400 hover:text-red-400 hover:bg-white/10 rounded transition"
                  title="Delete file"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const FileExplorer = ({
  files = {},
  activeFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newPath, setNewPath] = useState('')
  const inputRef = useRef(null)

  const fileKeys = useMemo(() => Object.keys(files), [files])
  const tree = useMemo(() => buildTree(fileKeys), [fileKeys])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!newPath.trim()) return

    if (onCreateFile) {
      const ok = await onCreateFile(newPath.trim())
      if (ok) {
        setNewPath('')
        setIsCreating(false)
      }
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Explorer Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Files
          </p>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono">
            {fileKeys.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreating(!isCreating)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
            isCreating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent'
          }`}
          title="Create New File"
        >
          <Plus size={13} />
          <span>New File</span>
        </button>
      </div>

      {/* Inline New File Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-2 border-b border-white/10 bg-amber-500/5 shrink-0 flex items-center gap-1.5"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g. /components/Card.jsx"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            className="flex-1 bg-black/60 border border-white/15 focus:border-amber-500/60 rounded px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewPath('')
              }
            }}
          />
          <button
            type="submit"
            className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition cursor-pointer"
            title="Create"
          >
            <Check size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false)
              setNewPath('')
            }}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Cancel"
          >
            <X size={13} />
          </button>
        </form>
      )}

      {/* Files Tree */}
      <div className="flex-1 py-2 overflow-y-auto hide-scrollbar space-y-0.5">
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
          />
        ))}
      </div>
    </div>
  )
}

export default FileExplorer