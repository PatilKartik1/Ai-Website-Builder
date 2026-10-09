import React, { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import PromptInput from '../components/PromptInput'
import { homeTags } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon, LogOutIcon, Trash2Icon } from 'lucide-react'
import moment from 'moment'

const PROJECT_TYPES = [
  {
    id: 'multi-page',
    label: 'Multi-Page',
    icon: '⊞',
    desc: 'Navbar + multiple pages',
    tag: '[Multi-Page Website]',
    placeholder: 'Create a modern agency website with Home, About Us, Services, and Contact pages...',
  },
  {
    id: 'landing',
    label: 'Landing Page',
    icon: '◧',
    desc: 'High-converting single page',
    tag: '[Landing Page]',
    placeholder: 'Create a high-converting SaaS landing page with hero, features, pricing, and FAQ...',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '▦',
    desc: 'Sidebar + data panels',
    tag: '[Dashboard / Web App]',
    placeholder: 'Create an analytics dashboard with sidebar navigation, metric cards, and user table...',
  },
  {
    id: 'tool',
    label: 'App / Tool',
    icon: '◈',
    desc: 'Interactive game or utility',
    tag: '[Interactive App / Tool]',
    placeholder: 'Create a fully functional calculator, quiz app, or interactive game...',
  },
]

const HomePage = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = React.useState('multi-page')

  const { user, projects, loadingProjects, generatingProject, loadProjects, handleGenerate, handleDelete, logout } =
    useAppContext()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const currentTypeConfig = PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[0]

  const onGenerateSubmit = (promptText) => {
    handleGenerate(`${currentTypeConfig.tag} ${promptText}`)
  }

  const onTagClick = (tag) => {
    handleGenerate(`${currentTypeConfig.tag} ${tag}`)
  }

  return (
    <div className="min-h-screen text-[var(--text-1)] font-sans" style={{ background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="logo" className="size-5 opacity-90" />
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-1)]">BuilderAI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-2)]">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors cursor-pointer"
          >
            <LogOutIcon size={13} />
            Sign out
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-24">
        <div className="w-full max-w-xl flex flex-col items-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-md)] bg-[var(--surface)] text-xs text-[var(--text-2)] mb-8">
            <span className="size-1.5 rounded-full bg-[var(--accent)] glow-pulse inline-block" />
            AI-powered website generation
          </div>

          {/* Title */}
          <h1 className="text-center text-[2.6rem] md:text-5xl font-semibold tracking-tight text-[var(--text-1)] leading-[1.1] mb-4">
            Build your website<br />
            <span style={{ color: 'var(--accent)' }}>with a single prompt</span>
          </h1>
          <p className="text-center text-sm text-[var(--text-2)] max-w-sm leading-relaxed mb-8">
            Describe your idea and watch AI design, structure and launch your React site instantly.
          </p>

          {/* Project Type Selector */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {PROJECT_TYPES.map((type) => {
              const isSelected = selectedType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className="flex flex-col items-start p-3 rounded-xl border transition-all cursor-pointer text-left"
                  style={{
                    background: isSelected ? 'var(--accent-dim)' : 'var(--surface)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    opacity: isSelected ? 1 : 0.8,
                  }}
                >
                  <span className="text-base mb-1.5 opacity-75">{type.icon}</span>
                  <span
                    className="text-xs font-medium leading-tight"
                    style={{ color: isSelected ? 'var(--accent)' : 'var(--text-1)' }}
                  >
                    {type.label}
                  </span>
                  <span className="text-[10px] mt-0.5 hidden sm:block" style={{ color: 'var(--text-3)' }}>
                    {type.desc}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Prompt Input */}
          <div className="w-full">
            <PromptInput
              onSubmit={onGenerateSubmit}
              loading={generatingProject}
              placeholder={currentTypeConfig.placeholder}
              variant="glass"
              autoFocus
            />
          </div>

          {/* Marquee Tags */}
          <div className="masked-marquee w-full mt-5 max-w-xl overflow-hidden py-1">
            <div className="animate-marquee gap-2.5">
              {homeTags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => onTagClick(tag)}
                  disabled={generatingProject}
                  className="px-3.5 py-1.5 rounded-full text-xs border transition cursor-pointer shrink-0 disabled:opacity-40"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-2)'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          {!loadingProjects && projects.length > 0 && (
            <div className="mt-16 w-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                  Recent Projects
                </p>
                <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-0.5">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/builder/${p._id}`)}
                    className="group flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-md)'
                      e.currentTarget.style.background = 'var(--surface-2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--surface)'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2.5 mt-0.5">
                        <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                          <ClockIcon size={10} />
                          {moment(p.updatedAt || p.createdAt).fromNow()}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono border"
                          style={{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                        >
                          v{p.version}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(p._id)
                        }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
                      >
                        <Trash2Icon size={13} />
                      </button>
                      <ArrowRightIcon
                        size={14}
                        className="transition-colors group-hover:opacity-100 opacity-30"
                        style={{ color: 'var(--accent)' }}
                      />
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