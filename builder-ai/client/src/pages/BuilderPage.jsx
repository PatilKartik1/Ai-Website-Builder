import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import BuilderHeader from '../components/BuilderHeader';
import { FolderTreeIcon, MessageSquareIcon } from 'lucide-react';
import ChatPanel from '../components/ChatPanel';
import FileExplorer from '../components/FileExplorer';
import PreviewPanel from '../components/PreviewPanel';
import AgentProgressDashboard from '../components/AgentProgressDashboard';
import PublishModal from '../components/PublishModal';
import api from '../api/api';
import toast from 'react-hot-toast';
import { exportProjectZip } from '../utils/exportProject';

const BuilderPage = () => {

  const {id} = useParams()
  const navigate = useNavigate()
  const [leftTab, setLeftTab] = useState("chat");
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);

  const {activeProject, loadingActiveProject, activeFile, showCode, setActiveFile, setShowCode, loadProject, logout, chatLoading, handleChat} = useAppContext();



  useEffect(()=>{
    if(!id) return;
    loadProject(id)
  },[id])

   

  const handleOpenPreview = ()=>{
    if(!id) return;
    window.open(`/preview/${id}`, "_blank")
  }

  const handlePublish = async () => {
    if(!id) return;
    setPublishing(true)
    try {
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      setPublishUrl(url);
      toast.success("Website published successfully!")
    } catch (err) {
      console.error("Publish failed:", err);
      toast.error(err?.response?.data?.error || "Publish failed");
    }finally{
      setPublishing(false)
    }
  }

  const handleDownload = () => {
    if(!activeProject) return;
    exportProjectZip(activeProject)
  }

  if(loadingActiveProject || !activeProject){
    return <Loading />
  }

  return (
    <div className="h-screen flex flex-col bg-[#E6DFD5] overflow-hidden text-[#24211E] relative">
      {/* Top Bar Header */}
      <BuilderHeader
      projectName={activeProject.name}
      version={activeProject.version}
      showCode={showCode}
      publishing={publishing}
      onToggleShowCode={()=> setShowCode(!showCode)}
      onOpenPreview={handleOpenPreview}
      onPublish={handlePublish}
      onDownload={handleDownload}
      onBack={()=> navigate("/")}
      onLogout={logout} />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-[#C0B4A5] bg-[#E6DFD5]">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-[#C0B4A5]">
            <button onClick={()=> setLeftTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "chat" ? "text-[#24211E] border-b-2 border-[#9C5B42] font-semibold" : "text-[#635B54] hover:text-[#24211E]"}`}>
              <MessageSquareIcon size={13} /> Chat
            </button>

            <button onClick={()=> setLeftTab("files")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${ leftTab === "files" ? "text-[#24211E] border-b-2 border-[#9C5B42] font-semibold" : "text-[#635B54] hover:text-[#24211E]" }`}>
              <FolderTreeIcon size={13} /> Files
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {
              leftTab === 'chat' ? (
                <ChatPanel messages={activeProject.messages} onSend={handleChat} loading={chatLoading}/>
              ) : (
                <FileExplorer files={activeProject.files} activeFile={activeFile} onFileSelect={(path)=>{
                  setActiveFile(path);
                  setShowCode(true)
                }}/>
              )
            }

          </div>
        </div>

        {/* Preview / Code Area */}
        <div className="flex-1 overflow-hidden">
            {activeProject.status === "pending" || activeProject.status === "generating" || activeProject.status === "failed" ? (
              <AgentProgressDashboard project={activeProject}/>
            ) : (
              <PreviewPanel project={activeProject} activeFile={activeFile} showCode={showCode}/>
            )}
        </div>
      </div>

      {publishUrl && <PublishModal publishUrl={publishUrl} onClose={()=> setPublishUrl(null)}/>}
    </div>
  )
}

export default BuilderPage