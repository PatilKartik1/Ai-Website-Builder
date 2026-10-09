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
  const [publishing, setPublishing] = useState(false)
  const [publishUrl, setPublishUrl] = useState(null)

  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    showCode,
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
        history={activeProject.history}
        onRollback={handleRollback}
        showCode={showCode}
        publishing={publishing}
        onToggleShowCode={() => setShowCode(!showCode)}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate('/')}
        onLogout={logout}
      />

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div
          className="w-[300px] shrink-0 flex flex-col border-r"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
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
                  setShowCode(true)
                }}
                onCreateFile={createFile}
                onDeleteFile={deleteFile}
                onRenameFile={renameFile}
              />
            )}
          </div>
        </div>

        {/* Preview / Code Area */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
          {activeProject.status === 'pending' ||
          activeProject.status === 'generating' ||
          activeProject.status === 'failed' ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode} />
          )}
        </div>
      </div>

      {publishUrl && <PublishModal publishUrl={publishUrl} onClose={() => setPublishUrl(null)} />}
    </div>
  )
}

export default BuilderPage