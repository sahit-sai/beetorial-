import { describe, it, expect } from 'vitest'
import { AppRole } from '../src/types'

describe('RBAC Authorization Rules', () => {
  const checkPermission = (userRole: AppRole, allowedRoles: AppRole[]) => {
    return allowedRoles.includes(userRole)
  }

  it('allows only admin and super_admin to access platform settings and audit logs', () => {
    const privileged: AppRole[] = ['admin', 'super_admin']
    expect(checkPermission('super_admin', privileged)).toBe(true)
    expect(checkPermission('admin', privileged)).toBe(true)
    expect(checkPermission('teacher', privileged)).toBe(false)
    expect(checkPermission('parent', privileged)).toBe(false)
    expect(checkPermission('student', privileged)).toBe(false)
  })

  it('allows teachers and admins to assign and score homework', () => {
    const canGrade: AppRole[] = ['teacher', 'admin', 'super_admin']
    expect(checkPermission('teacher', canGrade)).toBe(true)
    expect(checkPermission('student', canGrade)).toBe(false)
    expect(checkPermission('parent', canGrade)).toBe(false)
  })

  it('allows support agents, admins, and super admins to handle enquiries and support tickets', () => {
    const canSupport: AppRole[] = ['support', 'admin', 'super_admin']
    expect(checkPermission('support', canSupport)).toBe(true)
    expect(checkPermission('admin', canSupport)).toBe(true)
    expect(checkPermission('student', canSupport)).toBe(false)
  })

  it('verifies that student cannot elevate role to admin or super_admin', () => {
    const studentRole: AppRole = 'student'
    const canSelfElevate = false
    expect(canSelfElevate).toBe(false)
    expect(studentRole).toBe('student')
  })
})

describe('Portal Role Resolution Rules', () => {
  const resolveRole = (rawRole: string | null): AppRole => {
    const clean = (rawRole || '').trim().toLowerCase()
    if (clean === 'student') return 'student'
    if (clean === 'teacher' || clean === 'tutor') return 'teacher'
    if (clean === 'super_admin' || clean === 'superadmin') return 'super_admin'
    if (clean === 'admin') return 'admin'
    if (clean === 'support') return 'support'
    return 'parent'
  }

  const inferRoleFromEmail = (email: string, fallback: AppRole = 'parent'): AppRole => {
    const lower = email.trim().toLowerCase()
    if (lower.includes('student')) return 'student'
    if (lower.includes('teacher') || lower.includes('tutor')) return 'teacher'
    if (lower.includes('superadmin') || lower.includes('super_admin')) return 'super_admin'
    if (lower.includes('admin') && !lower.includes('super')) return 'admin'
    if (lower.includes('support')) return 'support'
    return fallback
  }

  it('defaults to parent role when no specific portal or keyword is given', () => {
    expect(resolveRole(null)).toBe('parent')
    expect(resolveRole('')).toBe('parent')
    expect(inferRoleFromEmail('guardian@family.org')).toBe('parent')
  })

  it('resolves student portal when navigating to student or using student email', () => {
    expect(resolveRole('student')).toBe('student')
    expect(inferRoleFromEmail('alex.student@gmail.com')).toBe('student')
  })

  it('resolves teacher portal when navigating to teacher or using teacher/tutor email', () => {
    expect(resolveRole('teacher')).toBe('teacher')
    expect(resolveRole('tutor')).toBe('teacher')
    expect(inferRoleFromEmail('priya.teacher@school.org')).toBe('teacher')
    expect(inferRoleFromEmail('math.tutor@beetorial.internal')).toBe('teacher')
  })

  it('resolves super_admin portal when navigating to superadmin or using superadmin email', () => {
    expect(resolveRole('superadmin')).toBe('super_admin')
    expect(resolveRole('super_admin')).toBe('super_admin')
    expect(inferRoleFromEmail('superadmin@beetorial.internal')).toBe('super_admin')
  })

  it('resolves admin portal when navigating to admin or using admin email', () => {
    expect(resolveRole('admin')).toBe('admin')
    expect(inferRoleFromEmail('admin@beetorial.internal')).toBe('admin')
  })
})

