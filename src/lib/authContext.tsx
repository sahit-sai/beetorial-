// ====================================================================
// Beetorial Auth Context & Server-Enforced RBAC
// ====================================================================

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppRole, AuthUser } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'
import { logSecurityEvent } from './audit'
import { DataService } from './dataService'

interface AuthContextType {
  user: AuthUser | null
  role: AppRole | null
  loading: boolean
  isDemo: boolean
  error: string | null
  signIn: (email: string, password?: string, demoRole?: AppRole) => Promise<boolean>
  signUp: (email: string, password: string, fullName: string, role?: AppRole) => Promise<boolean>
  signOut: () => Promise<void>
  switchDemoRole: (role: AppRole) => void
  hasRole: (roles: AppRole | AppRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_SESSION_KEY = 'beetorial_authenticated_session_v2'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isDemo = !isSupabaseConfigured() || (user?.isDemo ?? false)

  // Initialize session
  useEffect(() => {
    async function initAuth() {
      setLoading(true)
      setError(null)

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
          if (sessionErr) throw sessionErr

          if (session?.user) {
            // Strictly fetch role from profiles table (SERVER SOURCE OF TRUTH)
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('id, full_name, role')
              .eq('id', session.user.id)
              .single()

            if (profileErr || !profile) {
              console.warn('Could not fetch server profile, using default role parent:', profileErr)
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'parent',
                full_name: session.user.user_metadata?.full_name || 'Beetorial User',
                isDemo: false,
              })
            } else {
              setUser({
                id: profile.id,
                email: session.user.email || '',
                role: profile.role,
                full_name: profile.full_name || session.user.email || 'Beetorial User',
                isDemo: false,
              })
            }
          } else {
            loadLocalDemoSession()
          }
        } catch (e: any) {
          console.warn('Supabase auth initialisation failed, falling back to local sandbox:', e.message)
          loadLocalDemoSession()
        }
      } else {
        loadLocalDemoSession()
      }
      setLoading(false)
    }

    initAuth()

    // Listen to Supabase auth state changes if active
    const client = supabase
    if (isSupabaseConfigured() && client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: profile?.role || 'parent',
            full_name: profile?.full_name || 'Beetorial User',
            isDemo: false,
          })
        } else {
          loadLocalDemoSession()
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  function loadLocalDemoSession() {
    try {
      const raw = localStorage.getItem(LOCAL_SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.role && parsed?.email) {
          setUser({
            id: parsed.id || `usr_${parsed.role}`,
            email: parsed.email,
            role: parsed.role as AppRole,
            full_name: parsed.full_name || parsed.email.split('@')[0],
            isDemo: true,
          })
          return
        }
      }
    } catch {}
    setUser(null)
  }

  const switchDemoRole = async (targetRole: AppRole) => {
    const nextUser: AuthUser = {
      id: user?.id || `usr_${targetRole}`,
      email: user?.email || `${targetRole}@beetorial.internal`,
      role: targetRole,
      full_name: user?.full_name || `${targetRole.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} User`,
      isDemo: true,
    }
    setUser(nextUser)
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(nextUser))
    await DataService.upsertProfile({
      id: nextUser.id,
      email: nextUser.email,
      full_name: nextUser.full_name,
      role: nextUser.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    logSecurityEvent('DEMO_ROLE_SWITCH', 'session', targetRole, { target_role: targetRole }, nextUser)
  }

  const signIn = async (email: string, password = '', demoRole: AppRole = 'parent'): Promise<boolean> => {
    setError(null)
    setLoading(true)

    if (isSupabaseConfigured() && supabase && password) {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', data.user.id)
            .single()

          const verifiedUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role: profile?.role || 'parent',
            full_name: profile?.full_name || email,
            isDemo: false,
          }
          setUser(verifiedUser)
          await logSecurityEvent('AUTH_SIGN_IN', 'auth.users', data.user.id, { email }, verifiedUser)
          setLoading(false)
          return true
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed. Please verify credentials.')
        setLoading(false)
        return false
      }
    }

    // Verified Sandbox mode sign-in
    const trimmedEmail = email.trim() || `${demoRole}@beetorial.internal`
    const profiles = await DataService.getProfiles()
    const existing = profiles.find((p) => p.email && p.email.toLowerCase() === trimmedEmail.toLowerCase())
    const effectiveRole = existing?.role || demoRole

    const sandboxUser: AuthUser = {
      id: existing?.id || `usr_${Date.now()}`,
      email: trimmedEmail,
      role: effectiveRole,
      full_name:
        existing?.full_name ||
        trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
        'Beetorial User',
      isDemo: true,
    }
    await DataService.upsertProfile({
      id: sandboxUser.id,
      email: sandboxUser.email,
      full_name: sandboxUser.full_name,
      role: sandboxUser.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setUser(sandboxUser)
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sandboxUser))
    await logSecurityEvent(
      'SANDBOX_SIGN_IN',
      'session',
      sandboxUser.role,
      { email: sandboxUser.email, role: sandboxUser.role },
      sandboxUser
    )
    setLoading(false)
    return true
  }

  const signUp = async (email: string, password: string, fullName: string, role: AppRole = 'parent'): Promise<boolean> => {
    setError(null)
    setLoading(true)

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              // Note: trigger defaults to 'parent'. Administrative roles cannot be self-selected.
            },
          },
        })
        if (signUpError) throw signUpError

        if (data.user) {
          const createdUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'parent', // Server RLS enforces safe default
            full_name: fullName,
            isDemo: false,
          }
          setUser(createdUser)
          await logSecurityEvent('AUTH_SIGN_UP', 'auth.users', data.user.id, { email, requestedRole: role }, createdUser)
          setLoading(false)
          return true
        }
      } catch (err: any) {
        setError(err.message || 'Registration failed.')
        setLoading(false)
        return false
      }
    }

    // Sandbox registration
    const newDemoUser: AuthUser = {
      id: `usr_${Date.now()}`,
      email,
      role,
      full_name: fullName,
      isDemo: true,
    }
    await DataService.upsertProfile({
      id: newDemoUser.id,
      email: newDemoUser.email,
      full_name: newDemoUser.full_name,
      role: newDemoUser.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setUser(newDemoUser)
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newDemoUser))
    await logSecurityEvent('SANDBOX_SIGN_UP', 'session', role, { email, role }, newDemoUser)
    setLoading(false)
    return true
  }

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut()
      } catch {}
    }
    localStorage.removeItem(LOCAL_SESSION_KEY)
    setUser(null)
    await logSecurityEvent('AUTH_SIGN_OUT', 'session', null, {})
  }

  const hasRole = (roles: AppRole | AppRole[]): boolean => {
    if (!user) return false
    const roleList = Array.isArray(roles) ? roles : [roles]
    return roleList.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        isDemo,
        error,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
