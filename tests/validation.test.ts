import { describe, it, expect } from 'vitest'
import {
  enquirySchema,
  courseSchema,
  classSessionSchema,
  homeworkSchema,
  gradeSubmissionSchema,
  roleAssignmentSchema,
  authLoginSchema,
} from '../src/lib/validation'

describe('Validation Schemas', () => {
  it('validates a correct enquiry', () => {
    const valid = {
      parent_name: 'Ananya Raman',
      parent_email: 'ananya@example.com',
      student_grade: 'Grade 8',
      subject: 'Mathematics',
      notes: 'Needs help with fractions',
    }
    const result = enquirySchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email in enquiry', () => {
    const invalid = {
      parent_name: 'Ananya',
      parent_email: 'not-an-email',
      student_grade: 'Grade 8',
      subject: 'Math',
    }
    const result = enquirySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('valid email')
    }
  })

  it('rejects class sessions where end time is before start time', () => {
    const invalidClass = {
      student_id: 'student-123',
      starts_at: '2026-10-14T17:00:00Z',
      ends_at: '2026-10-14T16:30:00Z',
    }
    const result = classSessionSchema.safeParse(invalidClass)
    expect(result.success).toBe(false)
  })

  it('validates grade submission with score in 0-100 bounds', () => {
    expect(gradeSubmissionSchema.safeParse({ score: 95, feedback: 'Great!' }).success).toBe(true)
    expect(gradeSubmissionSchema.safeParse({ score: 105, feedback: 'Invalid' }).success).toBe(false)
    expect(gradeSubmissionSchema.safeParse({ score: -5, feedback: 'Invalid' }).success).toBe(false)
  })

  it('validates role assignment with valid UUID and role', () => {
    const valid = {
      target_user_id: '11111111-1111-1111-1111-111111111111',
      new_role: 'teacher',
    }
    expect(roleAssignmentSchema.safeParse(valid).success).toBe(true)
    expect(roleAssignmentSchema.safeParse({ ...valid, new_role: 'god_mode' }).success).toBe(false)
  })

  it('validates login requires minimum password length', () => {
    expect(authLoginSchema.safeParse({ email: 'user@example.com', password: '123' }).success).toBe(false)
    expect(authLoginSchema.safeParse({ email: 'user@example.com', password: 'password123' }).success).toBe(true)
  })
})
