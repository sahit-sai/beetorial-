// ====================================================================
// Beetorial Input Validation Schemas (Zod)
// ====================================================================

import { z } from 'zod'

export const appRoleSchema = z.enum([
  'parent',
  'student',
  'teacher',
  'admin',
  'super_admin',
  'support'
])

export const enquirySchema = z.object({
  parent_name: z.string().min(2, 'Parent name must be at least 2 characters'),
  parent_email: z.string().email('Please enter a valid email address'),
  parent_phone: z.string().optional(),
  student_grade: z.string().min(1, 'Please select or enter the student grade'),
  subject: z.string().min(2, 'Subject is required'),
  notes: z.string().optional(),
})

export const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  grade_level: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

export const classSessionSchema = z.object({
  course_id: z.string().optional(),
  teacher_id: z.string().optional(),
  student_id: z.string().min(1, 'Student selection is required'),
  starts_at: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start time'),
  ends_at: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end time'),
  meeting_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
}).refine(data => {
  return new Date(data.ends_at) > new Date(data.starts_at)
}, {
  message: 'End time must be after start time',
  path: ['ends_at']
})

export const homeworkSchema = z.object({
  class_id: z.string().optional(),
  title: z.string().min(3, 'Assignment title is required'),
  instructions: z.string().min(5, 'Instructions must be at least 5 characters'),
  due_at: z.string().optional(),
})

export const homeworkSubmissionSchema = z.object({
  submission_url: z.string().url('Must be a valid document or drive URL').optional().or(z.literal('')),
  notes: z.string().min(3, 'Please include student notes or completion comments'),
})

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  feedback: z.string().min(3, 'Constructive feedback is required'),
})

export const roleAssignmentSchema = z.object({
  target_user_id: z.string().uuid('Invalid user UUID'),
  new_role: appRoleSchema,
})

export const supportTicketSchema = z.object({
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  description: z.string().min(10, 'Please provide more details in the description'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export const authLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const authSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  role: appRoleSchema.default('parent'),
})
