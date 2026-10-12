import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import BuilderHeader from '../components/BuilderHeader'
import { FolderTreeIcon, MessageSquareIcon } from 'lucide-react'
import ChatPanel from '../components/ChatPanel'
import FileExplorer from '../components/FileExplorer'
import PreviewPanel from '../components/PreviewPanel'
import AgentProgressDashboard from '../components/AgentProgressDashboard'
import PublishModal from '../components/PublishModal'
import api from '../api/api'
import toast from 'react-hot-toast'
import { exportProjectZip } from '../utils/exportProject'

const BuilderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leftTab, setLeftTab] = useState('chat')
  const [viewMode, setViewMode] = useState('preview')
  const [publishing, setPublishing] = useState(false)
  const [publishUrl, setPublishUrl] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)

  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    showCode,
    saveStatus,
    setActiveFile,
    setShowCode,
    loadProject,
    logout,
    chatLoading,
    handleChat,
    handleRollback,
    createFile,
    deleteFile,
    renameFile,
  } = useAppContext()

  useEffect(() => {
    if (!id) return
    loadProject(id)
  }, [id])

  useEffect(() => {
    if (!isResizingSidebar) return

    const handlePointerMove = (event) => {
      if (event.clientX < 768) return
      setSidebarWidth(Math.min(480, Math.max(240, event.clientX)))
    }
    const handlePointerUp = () => setIsResizingSidebar(false)

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingSidebar])

  const handleOpenPreview = () => {
    if (!id) return
    window.open(`/preview/${id}`, '_blank')
  }

  const handlePublish = async () => {
    if (!id) return
    setPublishing(true)
    try {
      await api.post(`/api/projects/${id}/publish`)
      const url = `${window.location.origin}/publish/${id}`
      setPublishUrl(url)
      toast.success('Website published!')
    } catch (err) {
      console.error('Publish failed:', err)
      toast.error(err?.response?.data?.error || 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const handleDownload = () => {
    if (!activeProject) return
    exportProjectZip(activeProject)
  }

  if (loadingActiveProject || !activeProject) {
    return <Loading />
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-1)' }}
    >
      {/* Header */}
      <BuilderHeader
        projectName={activeProject.name}
        version={activeProject.version}
        saveStatus={saveStatus}
        history={activeProject.history}
        onRollback={handleRollback}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode)
          setShowCode(mode !== 'preview')
        }}
        publishing={publishing}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate('/')}
        onLogout={logout}
      />

      {/* Main */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <div
          className="w-full h-[42vh] min-h-0 shrink-0 flex flex-col border-b md:border-b-0 md:border-r md:h-auto md:w-[var(--builder-sidebar-width)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', '--builder-sidebar-width': `${sidebarWidth}px` }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {[
              { id: 'chat', icon: <MessageSquareIcon size={12} />, label: 'Chat' },
              { id: 'files', icon: <FolderTreeIcon size={12} />, label: 'Files' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer transition-colors"
                style={{
                  color: leftTab === tab.id ? 'var(--text-1)' : 'var(--text-3)',
                  borderBottom: leftTab === tab.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  background: 'transparent',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {leftTab === 'chat' ? (
              <ChatPanel messages={activeProject.messages} onSend={handleChat} loading={chatLoading} />
            ) : (
              <FileExplorer
                files={activeProject.files}
                activeFile={activeFile}
                onFileSelect={(path) => {
                  setActiveFile(path)
                  setViewMode('code')
                  setShowCode(true)
                }}
                onCreateFile={createFile}
                onDeleteFile={deleteFile}
                onRenameFile={renameFile}
              />
            )}
          </div>
        </div>

        <div
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuemin={240}
          aria-valuemax={480}
          aria-valuenow={sidebarWidth}
          tabIndex={0}
          onPointerDown={(event) => {
            if (window.innerWidth < 768) return
            event.preventDefault()
            setIsResizingSidebar(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') setSidebarWidth((width) => Math.max(240, width - 16))
            if (event.key === 'ArrowRight') setSidebarWidth((width) => Math.min(480, width + 16))
          }}
          className="hidden md:flex w-1 shrink-0 cursor-col-resize items-center justify-center outline-none transition-colors hover:bg-[var(--accent)] focus-visible:bg-[var(--accent)]"
          style={{ background: isResizingSidebar ? 'var(--accent)' : 'var(--border)', touchAction: 'none' }}
          title="Drag to resize sidebar; use arrow keys for fine adjustment"
        >
          <span className="h-8 w-px rounded-full bg-white/40" />
        </div>

        {/* Preview / Code Area */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden" style={{ background: 'var(--bg)' }}>
          {activeProject.status === 'pending' ||
          activeProject.status === 'generating' ||
          activeProject.status === 'failed' ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode} viewMode={viewMode} />
          )}
        </div>
      </div>

      {publishUrl && <PublishModal publishUrl={publishUrl} onClose={() => setPublishUrl(null)} />}
    </div>
  )
}

export default BuilderPage