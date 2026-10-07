import React, { useEffect, useState } from 'react'
import { data, useParams } from 'react-router-dom'
import api from '../api/api'
import Loading from '../components/Loading'
import { AlertCircleIcon } from 'lucide-react'
import FullPagePreview from '../components/FullPagePreview'

const PublishPage = () => {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(()=>{
    if(!id) return;

    const fetchPublicProject = async ()=>{
      try {
        const {data} = await api.get(`/api/projects/public/${id}`)
        setProject(data)
      } catch (err) {
        console.error("Failed to load public project:", err);
        setError(err?.response?.data?.error || "This website is not available or is not published yet.");
      }finally{
        setLoading(false)
      }
    }
    
    fetchPublicProject();
    
  },[id])

  if(loading) {
    return <Loading />
  }

  if(error || !project){
    return (
       <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <div className='w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mb-4'>
          <AlertCircleIcon size={24} />
        </div>
        <h1 className='text-lg font-semibold text-white mb-1.5'>Website Unavailable</h1>
        <p className='text-sm text-zinc-400 max-w-sm leading-relaxed mb-6'>{error}</p>
        <div className='text-[10px] font-semibold uppercase tracking-widest text-zinc-500'>BuilderAI</div>
      </div>
    )
  }

  return (
    <FullPagePreview files={project.files}/>
  )
}

export default PublishPage