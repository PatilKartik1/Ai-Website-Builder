import React, { useMemo, useRef, useState } from 'react'
import {
  Check, FileCodeIcon, FileTextIcon, FolderOpenIcon,
  Lock, Pencil, Plus, Trash2, X,
} from 'lucide-react'

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
        existing = { name, path: fullPath, isDir: !isLast, children: [] }
        current.push(existing)
      }
      current = existing.children
    }
  }
  return root
}

function getFileIcon(name) {
  if (name.endsWith('.css')) return <FileTextIcon size={12} style={{ color: '#67e8f9', flexShrink: 0 }} />
  if (name.endsWith('.jsx') || name.endsWith('.js'))
    return <FileCodeIcon size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
  if (name.endsWith('.json')) return <FileTextIcon size={12} style={{ color: '#86efac', flexShrink: 0 }} />
  return <FileTextIcon size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
}

function TreeItem({ node, activeFile, onFileSelect, onDeleteFile, onRenameFile, depth = 0 }) {
  const isActive = node.path === activeFile
  const isCore = node.path === '/App.js' || node.path === '/styles.css'
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(node.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (node.isDir) {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1 text-[11px] font-medium select-none"
          style={{ paddingLeft: `${depth * 10 + 10}px`, color: 'var(--text-3)' }}
        >
          <FolderOpenIcon size={12} style={{ color: 'var(--accent)', opacity: 0.7, flexShrink: 0 }} />
          <span className="truncate">{node.name}</span>
        </div>
        {node.children.map((child) => (
          <TreeItem key={child.path} node={child} activeFile={activeFile} onFileSelect={onFileSelect}
            onDeleteFile={onDeleteFile} onRenameFile={onRenameFile} depth={depth + 1} />
        ))}
      </div>
    )
  }

  const handleRenameSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const trimmed = renameVal.trim()
    if (!trimmed || trimmed === node.name) { setIsRenaming(false); setRenameVal(node.name); return }
    const parts = node.path.split('/')
    parts[parts.length - 1] = trimmed
    if (onRenameFile) onRenameFile(node.path, parts.join('/'))
    setIsRenaming(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) { if (onDeleteFile) onDeleteFile(node.path); setConfirmDelete(false) }
    else setConfirmDelete(true)
  }

  return (
    <div
      className="group relative flex items-center justify-between py-[5px] rounded-md cursor-pointer text-[12px] transition-all"
      style={{
        paddingLeft: `${depth * 10 + 10}px`,
        paddingRight: '6px',
        background: isActive ? 'var(--accent-dim)' : 'transparent',
        color: isActive ? 'var(--accent)' : 'var(--text-2)',
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
      }}
      onClick={() => { if (!isRenaming && !confirmDelete) onFileSelect(node.path) }}
    >
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
          {getFileIcon(renameVal)}
          <input
            type="text" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus
            className="flex-1 rounded px-1.5 py-0.5 text-[11px] outline-none border"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--accent)', color: 'var(--text-1)' }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setIsRenaming(false); setRenameVal(node.name) } }}
          />
          <button type="submit" className="p-0.5 rounded cursor-pointer" style={{ color: '#4ade80' }}>
            <Check size={11} />
          </button>
          <button type="button" onClick={() => { setIsRenaming(false); setRenameVal(node.name) }}
            className="p-0.5 rounded cursor-pointer" style={{ color: 'var(--text-3)' }}>
            <X size={11} />
          </button>
        </form>
      ) : confirmDelete ? (
        <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px]" style={{ color: '#f87171' }}>Delete {node.name}?</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={handleDelete}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer text-white"
              style={{ background: '#ef4444' }}>Yes</button>
            <button type="button" onClick={() => setConfirmDelete(false)}
              className="px-1.5 py-0.5 rounded text-[10px] cursor-pointer border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface-2)' }}>No</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            {isCore ? (
              <span style={{ opacity: 0.3 }}><Lock size={10} style={{ color: 'var(--text-3)' }} /></span>
            ) : (
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsRenaming(true) }}
                  className="p-1 rounded cursor-pointer transition-colors" style={{ color: 'var(--text-3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>
                  <Pencil size={10} />
                </button>
                <button type="button" onClick={handleDelete}
                  className="p-1 rounded cursor-pointer transition-colors" style={{ color: 'var(--text-3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>
                  <Trash2 size={10} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const FileExplorer = ({ files = {}, activeFile, onFileSelect, onCreateFile, onDeleteFile, onRenameFile }) => {
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
      if (ok) { setNewPath(''); setIsCreating(false) }
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
          Files
          <span className="font-mono px-1 rounded border text-[9px]" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text-3)' }}>
            {fileKeys.length}
          </span>
        </span>
        <button
          type="button"
          onClick={() => { setIsCreating(!isCreating); setTimeout(() => inputRef.current?.focus(), 50) }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-all border"
          style={{
            background: isCreating ? 'var(--accent-dim)' : 'transparent',
            borderColor: isCreating ? 'var(--accent)' : 'transparent',
            color: isCreating ? 'var(--accent)' : 'var(--text-3)',
          }}
          onMouseEnter={(e) => { if (!isCreating) { e.currentTarget.style.color = 'var(--text-1)' } }}
          onMouseLeave={(e) => { if (!isCreating) { e.currentTarget.style.color = 'var(--text-3)' } }}
        >
          <Plus size={12} />
          New file
        </button>
      </div>

      {/* Create form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit}
          className="px-2 py-2 border-b flex items-center gap-1.5 shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--accent-dim)' }}>
          <input
            ref={inputRef} type="text" placeholder="/components/Card.jsx"
            value={newPath} onChange={(e) => setNewPath(e.target.value)}
            className="flex-1 rounded px-2 py-1 text-[11px] outline-none border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-md)', color: 'var(--text-1)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-md)')}
            onKeyDown={(e) => { if (e.key === 'Escape') { setIsCreating(false); setNewPath('') } }}
          />
          <button type="submit" className="p-1 rounded cursor-pointer" style={{ background: 'var(--accent)', color: '#fff' }}>
            <Check size={12} />
          </button>
          <button type="button" onClick={() => { setIsCreating(false); setNewPath('') }}
            className="p-1 rounded cursor-pointer" style={{ color: 'var(--text-3)' }}>
            <X size={12} />
          </button>
        </form>
      )}

      {/* Tree */}
      <div className="flex-1 py-2 overflow-y-auto hide-scrollbar space-y-0.5 px-1">
        {tree.map((node) => (
          <TreeItem key={node.path} node={node} activeFile={activeFile}
            onFileSelect={onFileSelect} onDeleteFile={onDeleteFile} onRenameFile={onRenameFile} />
        ))}
      </div>
    </div>
  )
}

export default FileExplorer