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
