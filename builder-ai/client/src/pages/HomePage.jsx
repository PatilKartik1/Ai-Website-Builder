import React, { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import PromptInput from '../components/PromptInput'
import { homeTags } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClockIcon,
  LogOutIcon,
  Trash2Icon,
  SearchIcon,
  SparklesIcon,
  Globe2Icon,
  LayoutDashboardIcon,
  SmartphoneIcon,
  PanelsTopLeftIcon,
  FolderOpenIcon,
  ArrowUpDownIcon,
} from 'lucide-react'
import moment from 'moment'

const PROJECT_TYPES = [
  {
    id: 'multi-page',
    label: 'Multi-page site',
    icon: PanelsTopLeftIcon,
    desc: 'A complete website with multiple pages',
    tag: '[Multi-Page Website]',
    placeholder: 'Create a modern agency website with Home, About Us, Services, and Contact pages...',
  },
  {
    id: 'landing',
    label: 'Landing page',
    icon: Globe2Icon,
    desc: 'A focused page built to convert',
    tag: '[Landing Page]',
    placeholder: 'Create a high-converting SaaS landing page with hero, features, pricing, and FAQ...',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
    desc: 'An app with navigation and data panels',
    tag: '[Dashboard / Web App]',
    placeholder: 'Create an analytics dashboard with sidebar navigation, metric cards, and user table...',
  },
  {
    id: 'tool',
    label: 'App or tool',
    icon: SmartphoneIcon,
    desc: 'An interactive tool or experience',
    tag: '[Interactive App / Tool]',
    placeholder: 'Create a fully functional calculator, quiz app, or interactive game...',
  },
]

const HomePage = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('multi-page')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const { user, projects, loadingProjects, generatingProject, loadProjects, handleGenerate, handleDelete, logout } =
    useAppContext()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const currentTypeConfig = PROJECT_TYPES.find((type) => type.id === selectedType) || PROJECT_TYPES[0]

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...(projects || [])]
      .filter((project) => (project.name || 'Untitled project').toLowerCase().includes(query))
      .sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      })
  }, [projects, search, sortBy])

  const onGenerateSubmit = (promptText) => {
    handleGenerate(`${currentTypeConfig.tag} ${promptText}`)
  }

  const onTagClick = (tag) => {
    handleGenerate(`${currentTypeConfig.tag} ${tag}`)
  }

  return (
    <div className="min-h-screen text-[var(--text-1)] font-sans" style={{ background: 'var(--bg)' }}>
      <nav className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border" style={{ background: 'var(--accent-dim)', borderColor: 'var(--border-md)' }}>
            <SparklesIcon size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <span className="block text-sm font-semibold tracking-tight">BuilderAI</span>
            <span className="hidden sm:block text-[11px]" style={{ color: 'var(--text-3)' }}>Your creative workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden sm:block text-sm" style={{ color: 'var(--text-2)' }}>Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</span>
          <button onClick={logout} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:text-[var(--text-1)]" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <LogOutIcon size={14} /> <span>Sign out</span>
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 pb-16">
        <section className="relative overflow-hidden pt-12 sm:pt-16 pb-10">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--accent-glow)' }} />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs mb-6" style={{ borderColor: 'var(--border-md)', background: 'var(--surface)', color: 'var(--text-2)' }}>
              <span className="size-1.5 rounded-full glow-pulse" style={{ background: 'var(--accent)' }} />
              AI-powered website studio
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
              Your next website starts <span style={{ color: 'var(--accent)' }}>with an idea.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Describe what you want to build. BuilderAI turns your prompt into a React project you can preview, edit, and publish.
            </p>
          </div>

          <div className="relative mx-auto mt-9 max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
              {PROJECT_TYPES.map((type) => {
                const selected = selectedType === type.id
                const TypeIcon = type.icon
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    aria-pressed={selected}
                    className="group rounded-xl border p-3.5 sm:p-4 text-left transition-all hover:-translate-y-0.5"
                    style={{
                      background: selected ? 'var(--accent-dim)' : 'var(--surface)',
                      borderColor: selected ? 'var(--accent)' : 'var(--border)',
                      boxShadow: selected ? '0 0 0 1px var(--accent-glow)' : 'none',
                    }}
                  >
                    <div className="mb-3 flex size-8 items-center justify-center rounded-lg" style={{ background: selected ? 'var(--accent-glow)' : 'var(--surface-2)', color: selected ? 'var(--accent)' : 'var(--text-2)' }}>
                      <TypeIcon size={17} />
                    </div>
                    <span className="block text-xs sm:text-sm font-medium" style={{ color: selected ? 'var(--accent)' : 'var(--text-1)' }}>{type.label}</span>
                    <span className="mt-1 hidden sm:block text-[11px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{type.desc}</span>
                  </button>
                )
              })}
            </div>

            <div className="rounded-2xl border p-2 sm:p-3 shadow-2xl" style={{ background: 'var(--surface)', borderColor: 'var(--border-md)', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
              <PromptInput
                onSubmit={onGenerateSubmit}
                loading={generatingProject}
                placeholder={currentTypeConfig.placeholder}
                variant="glass"
                autoFocus
              />
            </div>

            <div className="masked-marquee mt-4 overflow-hidden py-1">
              <div className="animate-marquee gap-2">
                {[...homeTags, ...homeTags].map((tag, i) => (
                  <button
                    key={`${tag}-${i}`}
                    onClick={() => onTagClick(tag)}
                    disabled={generatingProject}
                    className="shrink-0 rounded-full border px-3.5 py-2 text-xs transition-colors disabled:opacity-40"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 sm:mt-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpenIcon size={18} style={{ color: 'var(--accent)' }} />
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Your projects</h2>
                <span className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-2)' }}>{projects?.length || 0}</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-3)' }}>Pick up where you left off.</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 sm:w-64" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <SearchIcon size={15} style={{ color: 'var(--text-3)' }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." aria-label="Search projects" className="w-full bg-transparent py-2.5 text-xs outline-none placeholder:text-[var(--text-3)]" />
              </label>
              <label className="flex items-center gap-2 rounded-xl border px-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-2)' }}>
                <ArrowUpDownIcon size={14} />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort projects" className="max-w-28 bg-transparent py-2.5 text-xs outline-none">
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} />)}
            </div>
          ) : visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleProjects.map((project) => (
                <article
                  key={project._id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${project.name || 'untitled project'}`}
                  onClick={() => navigate(`/builder/${project._id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/builder/${project._id}`) } }}
                  className="group relative flex min-h-36 cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.background = 'var(--surface-2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border" style={{ background: 'var(--accent-dim)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
                      <Globe2Icon size={19} />
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${project.name || 'project'}`}
                      title="Delete project"
                      onClick={(e) => { e.stopPropagation(); handleDelete(project._id) }}
                      className="rounded-lg p-2 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                      style={{ color: 'var(--text-3)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2Icon size={15} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{project.name || 'Untitled project'}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                        <ClockIcon size={12} /> Updated {moment(project.updatedAt || project.createdAt).fromNow()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-md border px-2 py-1 font-mono text-[10px]" style={{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--bg)' }}>v{project.version ?? 1}</span>
                      <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--accent)' }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border px-5 py-12 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                <FolderOpenIcon size={22} />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{search ? 'No matching projects' : 'Your workspace is ready'}</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
                {search ? 'Try a different search term.' : 'Create your first website with the prompt above. Your projects will appear here.'}
              </p>
              {search && <button onClick={() => setSearch('')} className="mt-4 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--border-md)', color: 'var(--text-2)' }}>Clear search</button>}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default HomePage
