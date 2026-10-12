import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { Logo } from '../../components/common/Logo'
import { AppRole } from '../../types'
import { useAuth } from '../../lib/authContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import { authLoginSchema, authSignupSchema } from '../../lib/validation'

const ROLE_PATHS: Record<AppRole, string> = {
  parent: '/parent',
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
  super_admin: '/super-admin',
  support: '/support',
}

const ROLE_LABELS: Record<AppRole, string> = {
  parent: 'Parent',
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super Admin',
  support: 'Support Agent',
}

export const Login: React.FC = () => {
  const nav = useNavigate()
  const { signIn, signUp, error: authError } = useAuth()
  const isSupabase = isSupabaseConfigured()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<AppRole>('parent')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (mode === 'login') {
      const parsed = authLoginSchema.safeParse({ email, password })
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0].message)
        return
      }

      setSubmitting(true)
      const success = await signIn(email, password, role)
      setSubmitting(false)

      if (success) {
        nav(ROLE_PATHS[role])
      }
    } else {
      const parsed = authSignupSchema.safeParse({
        email,
        password,
        full_name: fullName,
        role,
      })
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0].message)
        return
      }

      setSubmitting(true)
      const success = await signUp(email, password, fullName, role)
      setSubmitting(false)

      if (success) {
        nav(ROLE_PATHS[role])
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-top">
        <Logo />
        <Link to="/" className="text-link">
          ← Back to home
        </Link>
      </div>

      <div className="auth-layout">
        <div className="auth-pitch">
          <span className="eyebrow">WELCOME TO BEETORIAL</span>
          <h1>A little support can change everything.</h1>
          <p>
            Sign in to continue your learning journey, follow progress or manage your classroom.
          </p>
          <div className="auth-points">
            <div>
              <Check /> One connected learning space
            </div>
            <div>
              <Check /> Clear goals and visible progress
            </div>
            <div>
              <Check /> Server-enforced role authorization
            </div>
          </div>
          <div className="auth-decoration">
            <div className="dec-card">
              <GraduationCap />
              <b>Learning, together</b>
              <small>Student · Teacher · Parent</small>
            </div>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="feature-icon violet">
            <LockKeyhole />
          </span>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p>
            {isSupabase
              ? 'Sign in with your verified Supabase credentials.'
              : 'Choose a role to explore in Verified Sandbox Mode.'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              background: '#f4f2ff',
              borderRadius: '9px',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                border: 0,
                padding: '8px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--purple)' : '#7068a4',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(85,70,232,0.1)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                flex: 1,
                border: 0,
                padding: '8px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? 'var(--purple)' : '#7068a4',
                boxShadow: mode === 'signup' ? '0 2px 6px rgba(85,70,232,0.1)' : 'none',
              }}
            >
              Sign Up
            </button>
          </div>

          <label className="input-label">
            Target Role Workspace
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
            >
              {(['parent', 'student', 'teacher', 'admin', 'super_admin', 'support'] as AppRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>

          {mode === 'signup' && (
            <label className="input-label">
              Full Name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="e.g. Ananya Raman"
                required
              />
            </label>
          )}

          <label className="input-label">
            Email address
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="input-label">
            Password
            <span className="password-wrap">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (minimum 6 characters)"
                required
                minLength={6}
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          {(validationError || authError) && (
            <div className="error">{validationError || authError}</div>
          )}

          <button
            className="button button-primary button-full"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : `Open ${ROLE_LABELS[role]} Dashboard`}{' '}
            <ArrowRight size={16} />
          </button>

          <div className="demo-notice">
            {isSupabase ? (
              <>
                <ShieldCheck size={15} />
                Live Supabase Auth enabled. Verified roles are enforced via server policies.
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Verified Sandbox Mode: Instant switching between all 6 roles with persistent local storage.
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
