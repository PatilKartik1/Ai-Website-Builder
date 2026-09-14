import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import PromptInput from '../components/PromptInput'
import { homeTags } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon, Trash2Icon } from 'lucide-react'
import moment from "moment";

const HomePage = () => {

  const navigate = useNavigate()

  const {user, projects, loadingProjects, generatingProject, loadProjects, handleGenerate, handleDelete, logout} = useAppContext()

  useEffect(()=>{
    loadProjects()
  },[loadProjects])

  return (
    <div className="h-screen overflow-y-scroll text-[#171717] font-sans bg-[#FAFAFA]">
        {/* Nav */}
        <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="logo" className='size-6'/>
              <span className='text-xl font-semibold tracking-tight'>BuilderAI</span>
          </div>
          <div className='flex items-center gap-4 text-sm font-medium text-[#666666]'>
            <span>{user?.name}</span>
            <button onClick={logout} className='py-1.5 px-3 border border-[#E5E5E5] text-[#171717] hover:bg-[#E5E5E5] text-xs rounded-md cursor-pointer bg-transparent'>
              Sign out
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 mt-8 xl:mt-28">
          <div className="w-full max-w-2xl flex flex-col items-center">
              {/* Promo Badge */}
              <div className='flex items-center gap-2 p-1.5 pr-3 bg-[#F5F5F5] backdrop-blur-md rounded-full border border-[#E5E5E5] text-[13px] text-[#171717]'>
                <span className='px-3 py-1 text-[11px] bg-[#333333] text-[#F5F5F5] rounded-full font-medium tracking-wider'>PROMO</span>
                <span>Create your first project for free.</span>
              </div>

              {/* Title */}
              <h1 className='text-center text-4xl md:text-6xl font-medium mt-4 max-w-2xl text-[#171717]'>
                Let's build your app together
              </h1>
              <p className='text-center text-sm md:text-base max-w-xl mt-4 text-[#666666]   leading-relaxed'> 
                Describe your idea and watch AI design, structure and launch your website instantly. No coding required.
              </p>

              {/* Prompt input with glassmorphic variant */}
              <div className='w-full mt-6'>
                <PromptInput 
                onSubmit={handleGenerate}
                loading={generatingProject}
                placeholder='Create a portfolio website...'
                variant='glass'
                autoFocus/>
              </div>

              {/* Scrolling Marquee tags */}
              <div className="masked-marquee w-full mt-4 max-w-2xl overflow-hidden py-1">
                  <div className="animate-marquee gap-3">
                      {homeTags.map((tag, i)=>(
                        <button key={i}
                        onClick={()=> handleGenerate(tag)}
                        disabled={generatingProject}
                        className='px-4 py-1.5 border rounded-full text-sm text-[#171717] bg-[#F5F5F5] border-[#CCCCCC] hover:bg-[#E5E5E5] transition cursor-pointer shrink-0 font-medium'>
                          {tag}
                        </button>
                      ))}
                  </div>
              </div>

              {/* All Projects */}
              {!loadingProjects && projects.length > 0 && (
                <div className="mt-12 w-full">

                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E5E5]">
                      <p className='text-xs font-medium uppercase text-[#171717] tracking-widest'>All Projects</p>
                      <span className='text-xs text-[#171717] font-normal'>
                        {projects.length} {projects.length === 1 ? "project" : "projects"}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[80vh] overflow-y-auto pr-1">
                      {projects.map((p)=>(
                        <div key={p._id} className='bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-4 py-3 flex items-center justify-between group hover:border-[#333333] hover:bg-[#E5E5E5] cursor-pointer backdrop-blur-md transition-all' 
                        onClick={()=> navigate(`/builder/${p._id}`)}>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-[#171717] truncate">{p.name}</p>
                               <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-[#666666] flex items-center gap-1">
                                    <ClockIcon size={10}/>
                                    {moment(p.updatedAt || p.createdAt).fromNow() }
                                  </span>
                                  <span className="text-xs text-[#888888] font-medium">v{p.version}</span>
                               </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                onClick={(e)=>{
                                  e.stopPropagation();
                                  handleDelete(p._id)
                                }}
                                className='p-1.5 rounded-md text-[#404040] hover:text-red-400 hover:bg-[#E5E5E5] opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <Trash2Icon size={14}/>
                                </button>
                                <ArrowRightIcon size={14} className="text-[#404040] group-hover:text-[#171717]"/>
                            </div>
                        </div>
                      ))}
                    </div>
                </div>
              )}
              

          </div>
        </div>
    </div>
  )
}

export default HomePage