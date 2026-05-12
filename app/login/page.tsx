'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Fuel, Eye, EyeOff, Loader } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="login-page" style={{ 
      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/fuel_station_premium_bg_1778580261359.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="login-card" style={{ 
        maxWidth: '400px', 
        padding: '2.5rem',
        backdropFilter: 'blur(16px) saturate(180%)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Fuel size={32} className="text-blue" />
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              letterSpacing: '-0.05em',
              color: 'var(--text-primary)'
            }}>
              Smart<span className="text-blue">Fuel</span>
            </span>
          </div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Please enter your details to sign in.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.75rem',
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ background: 'rgba(255,255,255,0.9)', height: '48px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'rgba(255,255,255,0.9)', height: '48px', paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              height: '52px', 
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
            }}
            disabled={loading}
          >
            {loading ? <Loader size={20} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
