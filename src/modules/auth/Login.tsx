import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Sparkles,
  ShieldCheck,
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
  support: 'Support',
}

function resolveRole(rawRole: string | null): AppRole {
  const clean = (rawRole || '').trim().toLowerCase()
  if (clean === 'student') return 'student'
  if (clean === 'teacher' || clean === 'tutor') return 'teacher'
  if (clean === 'super_admin' || clean === 'superadmin') return 'super_admin'
  if (clean === 'admin') return 'admin'
  if (clean === 'support') return 'support'
  return 'parent'
}

export const Login: React.FC = () => {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const roleParam = searchParams.get('role') || searchParams.get('portal')

  const { signIn, signUp, error: authError } = useAuth()
  const isSupabase = isSupabaseConfigured()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<AppRole>(() => resolveRole(roleParam))
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Keep role in sync with URL search parameter if changed
  useEffect(() => {
    if (roleParam) {
      setRole(resolveRole(roleParam))
    }
  }, [roleParam])

  // Smart role detection from typed email
  const handleEmailChange = (val: string) => {
    setEmail(val)
    const lower = val.toLowerCase()
    if (lower.includes('student') && role !== 'student') {
      setRole('student')
    } else if ((lower.includes('teacher') || lower.includes('tutor')) && role !== 'teacher') {
      setRole('teacher')
    } else if ((lower.includes('superadmin') || lower.includes('super_admin')) && role !== 'super_admin') {
      setRole('super_admin')
    } else if (lower.includes('admin') && !lower.includes('super') && role !== 'admin') {
      setRole('admin')
    } else if (lower.includes('support') && role !== 'support') {
      setRole('support')
    }
  }

  const handlePortalSelect = (selectedRole: AppRole) => {
    setRole(selectedRole)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('role', selectedRole)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Final check: if email hints a role that differs from current state
    let targetRole = role
    const lowerEmail = email.trim().toLowerCase()
    if (lowerEmail.includes('student')) targetRole = 'student'
    else if (lowerEmail.includes('teacher') || lowerEmail.includes('tutor')) targetRole = 'teacher'
    else if (lowerEmail.includes('superadmin') || lowerEmail.includes('super_admin')) targetRole = 'super_admin'
    else if (lowerEmail.includes('admin') && !lowerEmail.includes('super')) targetRole = 'admin'
    else if (lowerEmail.includes('support')) targetRole = 'support'

    if (mode === 'login') {
      const parsed = authLoginSchema.safeParse({ email, password })
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0].message)
        return
      }

      setSubmitting(true)
      const success = await signIn(email, password, targetRole)
      setSubmitting(false)

      if (success) {
        const dest = redirectParam ? decodeURIComponent(redirectParam) : ROLE_PATHS[targetRole]
        nav(dest)
      }
    } else {
      const parsed = authSignupSchema.safeParse({
        email,
        password,
        full_name: fullName,
        role: targetRole,
      })
      if (!parsed.success) {
        setValidationError(parsed.error.issues[0].message)
        return
      }

      setSubmitting(true)
      const success = await signUp(email, password, fullName, targetRole)
      setSubmitting(false)

      if (success) {
        const dest = redirectParam ? decodeURIComponent(redirectParam) : ROLE_PATHS[targetRole]
        nav(dest)
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
              ? `Sign in to access your verified ${ROLE_LABELS[role]} account.`
              : `Signing in to ${ROLE_LABELS[role]} workspace.`}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              background: '#f4f2ff',
              borderRadius: '9px',
              marginBottom: '14px',
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

          {/* Portal Switcher & Active Indicator */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '1.1px',
                color: '#858ca2',
                marginBottom: '7px',
              }}
            >
              <span>ACCESS PORTAL</span>
              <span style={{ color: 'var(--purple)', fontWeight: 700 }}>
                {ROLE_LABELS[role]} Workspace
              </span>
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {(['parent', 'student', 'teacher', 'admin', 'super_admin', 'support'] as AppRole[]).map((r) => {
                const active = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handlePortalSelect(r)}
                    style={{
                      border: `1px solid ${active ? 'var(--purple)' : '#e5e8f2'}`,
                      background: active ? '#eeecff' : '#ffffff',
                      color: active ? 'var(--purple)' : '#626a82',
                      fontSize: '10px',
                      fontWeight: active ? 800 : 600,
                      padding: '5px 9px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                )
              })}
            </div>
          </div>

          {mode === 'signup' && (
            <label className="input-label">
              Full Name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                required
              />
            </label>
          )}

          <label className="input-label">
            Email address
            <input
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
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
            {submitting
              ? 'Authenticating...'
              : mode === 'login'
              ? `Sign In to ${ROLE_LABELS[role]} Dashboard`
              : `Create ${ROLE_LABELS[role]} Account`}{' '}
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
                Verified Sandbox Mode: Instant switching between all roles with persistent local storage.
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
