import React, { useState } from 'react'
import LoginLeft from '../components/LoginLeft';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AuthPage = ({mode}) => {

  const {login, register} = useAppContext()
  const navigate = useNavigate()

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if(mode === "login"){
        await login(email, password)
      }else{
        await register(name, email, password)
      }
      navigate("/")
    } catch (err) {
      setError(err.message || (mode === "login" ? "Invalid email or password" : "Registration failed"));
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex text-[#2C2A29] font-sans">
      {/* Left Panel - Branding */}
      <LoginLeft />

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          
          <div className="mb-10">
            <h1 className="text-3xl font-medium tracking-tight text-[#2C2A29] mb-1.5 font-sans">{isLogin ? "Sign in" : "Create an account"}</h1>
            <p className='text-sm text-[#7A7570]'>
              {isLogin ? "Enter your credentials to access your website builder." : "Get started by entering your registration details."}
            </p>
          </div>

        {error && <div className='mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded'>{error}</div>}

        <form className='space-y-6' onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-semibold text-[#7A7570] uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required className='w-full pl-2 py-2 border-b border-[#D8D0C5] focus:outline-none focus:border-zinc-950 text-sm text-[#2C2A29] bg-transparent placeholder-zinc-300 transition-colors' placeholder='John Doe'/>
            </div>
          )}
          <div>
              <label className="block text-[11px] font-semibold text-[#7A7570] uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className='w-full pl-2 py-2 border-b border-[#D8D0C5] focus:outline-none focus:border-zinc-950 text-sm text-[#2C2A29] bg-transparent placeholder-zinc-300 transition-colors' placeholder="you@example.com"/>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7A7570] uppercase tracking-widest mb-2">
                Password
              </label>
              <div className='relative'>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required className='w-full pl-2 py-2 border-b border-[#D8D0C5] focus:outline-none focus:border-zinc-950 text-sm text-[#2C2A29] bg-transparent placeholder-zinc-300 pr-8' 
                 placeholder="••••••••"/>
                 <button type="button" onClick={()=> setShowPassword(!showPassword)}className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9E9790] hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors">
                    {showPassword ? <EyeOffIcon size={14}/> : <EyeIcon size={14}/>}
                 </button>
              </div>
              
          </div>

          <button type="submit" disabled={loading} 
          className='w-full py-2.5 bg-[#A37059] hover:bg-[#8F5F4A] text-white font-medium disabled:opacity-40 flex items-center justify-center cursor-pointer mt-2 rounded-lg transition-colors'>
            {loading && <Loader2Icon className="animate-spin h-3.5 w-3.5 mr-2"/>}
            {isLogin ? "Sign in" : "Sign up"}
          </button>
          
        </form>

      <p className='text-sm text-[#7A7570] mt-8 pt-6 border-t border-[#D8D0C5] font-sans'>
        {isLogin ? (
          <>
            New to BuilderAI?{" "}
            <Link to="/register" className="text-[#2C2A29] font-medium hover:underline" >
              Create an account
            </Link>
          </>
        ) : (
          <>
          Already have an account?{" "}
            <Link to="/login" className="text-[#2C2A29] font-medium hover:underline" >
             Sign in here
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