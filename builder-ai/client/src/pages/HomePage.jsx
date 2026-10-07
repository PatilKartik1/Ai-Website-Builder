import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import PromptInput from '../components/PromptInput'
import { homeTags } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon, Trash2Icon } from 'lucide-react'
import moment from "moment";

const PROJECT_TYPES = [
  {
    id: 'multi-page',
    label: 'Multi-Page Site',
    icon: '📑',
    desc: 'Home, About, Services, Contact with navbar routing',
    tag: '[Multi-Page Website]',
    placeholder: 'Create a modern agency website with Home, About Us, Services, and Contact pages...',
  },
  {
    id: 'landing',
    label: 'Landing Page',
    icon: '📄',
    desc: 'High-converting 1-page marketing site',
    tag: '[Landing Page]',
    placeholder: 'Create a high-converting SaaS landing page with hero, features, pricing, and FAQ...',
  },
  {
    id: 'dashboard',
    label: 'Web App / Dashboard',
    icon: '📊',
    desc: 'Sidebar navigation with metric cards & data tables',
    tag: '[Dashboard / Web App]',
    placeholder: 'Create an analytics dashboard with sidebar navigation, metric cards, charts, and user table...',
  },
  {
    id: 'tool',
    label: 'App / Game / Tool',
    icon: '🎮',
    desc: 'Interactive calculator, game, quiz, or task manager',
    tag: '[Interactive App / Tool]',
    placeholder: 'Create a fully functional interactive calculator, quiz app, or game...',
  },
]

const HomePage = () => {

  const navigate = useNavigate()
  const [selectedType, setSelectedType] = React.useState('multi-page')

  const {user, projects, loadingProjects, generatingProject, loadProjects, handleGenerate, handleDelete, logout} = useAppContext()

  useEffect(()=>{
    loadProjects()
  },[loadProjects])

  const currentTypeConfig = PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[0]

  const onGenerateSubmit = (promptText) => {
    handleGenerate(`${currentTypeConfig.tag} ${promptText}`)
  }

  const onTagClick = (tag) => {
    handleGenerate(`${currentTypeConfig.tag} ${tag}`)
  }

  return (
    <div className="h-screen overflow-y-scroll text-zinc-100 font-sans bg-transparent">
        {/* Nav */}
        <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#090b10]/60 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="logo" className='size-6'/>
              <span className='text-xl font-semibold tracking-tight text-white'>BuilderAI</span>
          </div>
          <div className='flex items-center gap-4 text-sm font-medium text-zinc-400'>
            <span className="text-zinc-200">{user?.name}</span>
            <button onClick={logout} className='py-1.5 px-3 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 text-xs rounded-lg cursor-pointer bg-white/5 transition'>
              Sign out
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 mt-8 xl:mt-24">
          <div className="w-full max-w-2xl flex flex-col items-center">
              {/* Promo Badge */}
              <div className='flex items-center gap-2 p-1.5 pr-3.5 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 text-[13px] text-zinc-300 shadow-lg shadow-black/20'>
                <span className='px-3 py-0.5 text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-medium tracking-wider'>PROMO</span>
                <span>Create your first project for free.</span>
              </div>

              {/* Title */}
              <h1 className='text-center text-4xl md:text-6xl font-medium mt-5 max-w-2xl text-white tracking-tight'>
                Let's build your app together
              </h1>
              <p className='text-center text-sm md:text-base max-w-xl mt-4 text-zinc-400 leading-relaxed'> 
                Describe your idea and watch AI design, structure and launch your website instantly. No coding required.
              </p>

              {/* Project Archetype Selector */}
              <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROJECT_TYPES.map((type) => {
                  const isSelected = selectedType === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`flex flex-col items-center sm:items-start text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10 text-white'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <span>{type.icon}</span>
                        <span className={isSelected ? 'text-amber-300 font-semibold' : ''}>
                          {type.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5 hidden sm:block w-full">
                        {type.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Prompt input with glassmorphic variant */}
              <div className='w-full mt-3'>
                <PromptInput 
                onSubmit={onGenerateSubmit}
                loading={generatingProject}
                placeholder={currentTypeConfig.placeholder}
                variant='glass'
                autoFocus/>
              </div>

              {/* Scrolling Marquee tags */}
              <div className="masked-marquee w-full mt-5 max-w-2xl overflow-hidden py-1">
                  <div className="animate-marquee gap-3">
                      {homeTags.map((tag, i)=>(
                        <button key={i}
                        onClick={()=> onTagClick(tag)}
                        disabled={generatingProject}
                        className='px-4 py-1.5 border rounded-full text-sm text-zinc-300 bg-zinc-900/70 border-white/10 hover:border-amber-500/40 hover:bg-zinc-800 hover:text-white transition cursor-pointer shrink-0 font-medium backdrop-blur-md'>
                          {tag}
                        </button>
                      ))}
                  </div>
              </div>

              {/* All Projects */}
              {!loadingProjects && projects.length > 0 && (
                <div className="mt-14 w-full">

                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                      <p className='text-xs font-semibold uppercase text-zinc-400 tracking-widest'>All Projects</p>
                      <span className='text-xs text-zinc-500 font-normal'>
                        {projects.length} {projects.length === 1 ? "project" : "projects"}
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[80vh] overflow-y-auto pr-1">
                      {projects.map((p)=>(
                        <div key={p._id} className='bg-zinc-900/70 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-amber-500/50 hover:bg-zinc-900/95 cursor-pointer backdrop-blur-xl transition-all shadow-sm' 
                        onClick={()=> navigate(`/builder/${p._id}`)}>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-zinc-100 group-hover:text-white truncate">{p.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                   <span className="text-xs text-zinc-400 flex items-center gap-1">
                                     <ClockIcon size={11}/>
                                     {moment(p.updatedAt || p.createdAt).fromNow() }
                                   </span>
                                   <span className="text-[11px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400 font-medium">v{p.version}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                onClick={(e)=>{
                                  e.stopPropagation();
                                  handleDelete(p._id)
                                }}
                                className='p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <Trash2Icon size={14}/>
                                </button>
                                <ArrowRightIcon size={14} className="text-zinc-500 group-hover:text-amber-400 transition-colors"/>
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