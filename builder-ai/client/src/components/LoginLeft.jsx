import React from 'react'

const LoginLeft = () => {
  return (
    <div
      className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 shrink-0 select-none border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="Logo" className="size-7 opacity-90" />
        <span className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
          BuilderAI
        </span>
      </div>

      <div>
        {/* Feature list */}
        <div className="space-y-5 mb-12">
          {[
            { icon: '⊞', title: 'Multi-page websites', desc: 'Full navbar routing with Home, About, Services, Contact.' },
            { icon: '◧', title: 'Real-time preview', desc: 'Sandpack-powered live preview as the AI writes code.' },
            { icon: '⟳', title: 'Version history', desc: 'Roll back to any previous revision with one click.' },
            { icon: '↓', title: 'Export & publish', desc: 'Download as ZIP or publish instantly with a public URL.' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span
                className="text-sm mt-0.5 size-6 flex items-center justify-center rounded-md shrink-0 border"
                style={{ color: 'var(--accent)', background: 'var(--accent-dim)', borderColor: 'rgba(139,131,247,0.2)' }}
              >
                {f.icon}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{f.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          © {new Date().getFullYear()} BuilderAI. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginLeft