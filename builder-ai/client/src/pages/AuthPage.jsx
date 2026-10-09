import React, { useState } from 'react'
import LoginLeft from '../components/LoginLeft'
import { Link } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const AuthPage = ({ mode }) => {
  const { login, register } = useAppContext()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isLogin = mode === 'login'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err) {
      setError(err.message || (mode === 'login' ? 'Invalid email or password' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-0 py-2 border-b bg-transparent text-sm outline-none transition-colors placeholder-[var(--text-3)]'

  return (
    <div className="min-h-screen flex font-sans" style={{ background: 'var(--bg)', color: 'var(--text-1)' }}>
      {/* Left branding */}
      <LoginLeft />

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: 'var(--text-1)' }}>
              {isLogin ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {isLogin
                ? 'Welcome back. Enter your credentials below.'
                : 'Get started — it only takes a moment.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 px-3 py-2.5 rounded-lg text-xs border"
              style={{
                background: 'rgba(248,113,113,0.07)',
                borderColor: 'rgba(248,113,113,0.25)',
                color: '#f87171',
              }}>
              {error}
            </div>
          )}

          <form className="space-y-7" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className={inputClass}
                  style={{ borderColor: 'var(--border-md)', color: 'var(--text-1)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-md)')}
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
                style={{ borderColor: 'var(--border-md)', color: 'var(--text-1)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-md)')}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`${inputClass} pr-8`}
                  style={{ borderColor: 'var(--border-md)', color: 'var(--text-1)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-md)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
                >
                  {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 mt-2"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {loading && <Loader2Icon className="animate-spin" size={14} />}
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-sm mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            {isLogin ? (
              <>
                New here?{' '}
                <Link to="/register" className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage