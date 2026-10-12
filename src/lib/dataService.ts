// ====================================================================
// Beetorial Unified Persistent Data Service
// Seamlessly interfaces with Supabase RLS tables when credentials are provided
// and provides a fully verified, persistent local sandbox when running locally
// ====================================================================

import {
  Course,
  ClassSession,
  ClassAttendance,
  Homework,
  HomeworkSubmission,
  Enquiry,
  Payment,
  SupportTicket,
  Profile,
  AppRole,
  AuditLog,
} from '../types'
import { isSupabaseConfigured, supabase } from './supabase'
import { logSecurityEvent, getLocalAuditLogs } from './audit'

// Local storage persistent keys
const STORE_PREFIX = 'beetorial_db_'
const KEY_COURSES = `${STORE_PREFIX}courses`
const KEY_CLASSES = `${STORE_PREFIX}classes`
const KEY_ATTENDANCE = `${STORE_PREFIX}attendance`
const KEY_HOMEWORK = `${STORE_PREFIX}homework`
const KEY_SUBMISSIONS = `${STORE_PREFIX}submissions`
const KEY_ENQUIRIES = `${STORE_PREFIX}enquiries`
const KEY_PAYMENTS = `${STORE_PREFIX}payments`
const KEY_TICKETS = `${STORE_PREFIX}tickets`
const KEY_PROFILES = `${STORE_PREFIX}profiles`

// Initial Seed Data for Local Development & Sandbox
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Ananya Raman (Parent)',
    role: 'parent',
    phone: '+91 98765 43210',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    full_name: 'Aditi Raman (Student)',
    role: 'student',
    phone: '+91 98765 43211',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    full_name: 'Ms. Priya Sharma (Teacher)',
    role: 'teacher',
    phone: '+91 98765 43212',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    full_name: 'Vikram Patel (Admin)',
    role: 'admin',
    phone: '+91 98765 43213',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    full_name: 'Kavita Sundaram (Super Admin)',
    role: 'super_admin',
    phone: '+91 98765 43214',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    full_name: 'Rohan Verma (Support)',
    role: 'support',
    phone: '+91 98765 43215',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
]

const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-101',
    title: 'Mastering Fractions & Ratios',
    subject: 'Mathematics',
    grade_level: 'Grade 8',
    description: 'Foundational clarity in fractional arithmetic and ratio problem solving.',
    status: 'published',
    created_by: 'c0000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'crs-102',
    title: 'Cell Biology & Living Systems',
    subject: 'Science',
    grade_level: 'Grade 8',
    description: 'Interactive understanding of cellular structures, functions, and ecosystems.',
    status: 'published',
    created_by: 'c0000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'crs-103',
    title: 'Advanced Algebraic Expressions',
    subject: 'Mathematics',
    grade_level: 'Grade 9',
    description: 'Linear equations, factorization methods, and graphical interpretation.',
    status: 'draft',
    created_by: 'c0000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
]

const INITIAL_CLASSES: ClassSession[] = [
  {
    id: 'cls-101',
    course_id: 'crs-101',
    course_title: 'Mathematics · Fractions & ratios',
    teacher_id: 'c0000000-0000-0000-0000-000000000003',
    teacher_name: 'Ms. Priya Sharma',
    student_id: 'b0000000-0000-0000-0000-000000000002',
    student_name: 'Aditi Raman',
    starts_at: new Date(Date.now() + 3600000 * 24).toISOString(),
    ends_at: new Date(Date.now() + 3600000 * 24 + 45 * 60000).toISOString(),
    meeting_url: 'https://meet.google.com/demo-beetorial-class',
    meeting_provider: 'google_meet',
    status: 'scheduled',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cls-102',
    course_id: 'crs-102',
    course_title: 'Science · Cell Biology',
    teacher_id: 'c0000000-0000-0000-0000-000000000003',
    teacher_name: 'Ms. Priya Sharma',
    student_id: 'b0000000-0000-0000-0000-000000000002',
    student_name: 'Aditi Raman',
    starts_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    ends_at: new Date(Date.now() - 3600000 * 48 + 45 * 60000).toISOString(),
    meeting_url: null,
    meeting_provider: 'unconfigured',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
]

const INITIAL_ATTENDANCE: ClassAttendance[] = [
  {
    id: 'att-101',
    class_id: 'cls-102',
    student_id: 'b0000000-0000-0000-0000-000000000002',
    student_name: 'Aditi Raman',
    status: 'present',
    notes: 'Active engagement in cell division exercises.',
    recorded_by: 'c0000000-0000-0000-0000-000000000003',
    recorded_at: new Date(Date.now() - 3600000 * 47).toISOString(),
  },
]

const INITIAL_HOMEWORK: Homework[] = [
  {
    id: 'hw-101',
    class_id: 'cls-101',
    title: 'Fractions Practice Sheet #4',
    instructions: 'Complete exercises 1 to 15 on page 42. Focus on unlike denominators.',
    due_at: new Date(Date.now() + 3600000 * 72).toISOString(),
    created_by: 'c0000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
]

const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'sub-101',
    homework_id: 'hw-101',
    student_id: 'b0000000-0000-0000-0000-000000000002',
    student_name: 'Aditi Raman',
    submission_url: 'https://beetorial.example/submissions/hw4.pdf',
    notes: 'Completed all questions, had a question on #14.',
    score: 92,
    feedback: 'Excellent reasoning on reciprocal multiplication. Review problem #14 step 2.',
    submitted_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
]

const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'ENQ-1042',
    parent_name: 'Ananya R.',
    parent_email: 'ananya@example.com',
    parent_phone: '+91 98765 43210',
    student_grade: 'Grade 8',
    subject: 'Mathematics',
    notes: 'Interested in personalized ratio and algebra support.',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ENQ-1041',
    parent_name: 'Rahul K.',
    parent_email: 'rahul@example.com',
    parent_phone: '+91 98765 22222',
    student_grade: 'Grade 6',
    subject: 'Science',
    notes: 'Looking for twice-weekly concept foundation sessions.',
    status: 'contacted',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ENQ-1040',
    parent_name: 'Meera S.',
    parent_email: 'meera@example.com',
    parent_phone: '+91 98765 33333',
    student_grade: 'Grade 5',
    subject: 'English',
    notes: 'Trial booked for reading comprehension and writing.',
    status: 'trial_booked',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
]

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-101',
    payer_id: 'a0000000-0000-0000-0000-000000000001',
    payer_name: 'Ananya Raman',
    amount_paise: 450000,
    currency: 'INR',
    provider: 'sandbox',
    provider_reference: 'SANDBOX_ORD_9812',
    description: 'Monthly 8-Session Mathematics Tutoring Plan',
    status: 'paid',
    is_verified: true,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'pay-102',
    payer_id: 'a0000000-0000-0000-0000-000000000001',
    payer_name: 'Ananya Raman',
    amount_paise: 250000,
    currency: 'INR',
    provider: 'sandbox',
    provider_reference: 'SANDBOX_ORD_9813',
    description: 'Specialized Science Concept Reinforcement Pack',
    status: 'pending',
    is_verified: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
]

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    user_name: 'Ananya Raman',
    user_role: 'parent',
    subject: 'Reschedule Tuesday session',
    description: 'Need to move Tuesday 5 PM session to Wednesday due to family conflict.',
    priority: 'medium',
    status: 'open',
    assigned_to: 'f0000000-0000-0000-0000-000000000006',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
]

// Helper Storage Getters/Setters
function getStore<T>(key: string, initial: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return initial
}

function setStore<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

export const DataService = {
  // --- PROFILES / USERS ---
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (!error && data) return data
    }
    return getStore<Profile>(KEY_PROFILES, INITIAL_PROFILES)
  },

  async assignUserRole(targetUserId: string, newRole: AppRole, actor?: { id: string; role: AppRole; name?: string; full_name?: string }): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
      })
      if (!error) return true
      console.error('Supabase assign_user_role error:', error)
      return false
    }

    // Sandbox execution with server-enforcement simulation
    if (actor && !['admin', 'super_admin'].includes(actor.role)) {
      throw new Error('Access Denied: Only administrators can modify roles.')
    }
    if (actor && actor.role !== 'super_admin' && ['admin', 'super_admin'].includes(newRole)) {
      throw new Error('Access Denied: Only super administrators can grant administrative privileges.')
    }

    const profiles = getStore<Profile>(KEY_PROFILES, INITIAL_PROFILES)
    const updated = profiles.map(p => p.id === targetUserId ? { ...p, role: newRole, updated_at: new Date().toISOString() } : p)
    setStore(KEY_PROFILES, updated)

    await logSecurityEvent('ASSIGN_ROLE', 'profiles', targetUserId, { new_role: newRole }, { id: actor?.id, role: actor?.role, name: actor?.full_name || actor?.name })
    return true
  },

  // --- COURSES ---
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
      if (!error && data) return data
    }
    return getStore<Course>(KEY_COURSES, INITIAL_COURSES)
  },

  async createCourse(course: Omit<Course, 'id' | 'created_at'>, actor?: any): Promise<Course> {
    const newCourse: Course = {
      ...course,
      id: `crs-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('courses').insert(newCourse).select().single()
      if (!error && data) {
        await logSecurityEvent('CREATE_COURSE', 'courses', data.id, { title: data.title }, actor)
        return data
      }
    }
    const list = getStore<Course>(KEY_COURSES, INITIAL_COURSES)
    setStore(KEY_COURSES, [newCourse, ...list])
    await logSecurityEvent('CREATE_COURSE', 'courses', newCourse.id, { title: newCourse.title }, actor)
    return newCourse
  },

  async updateCourseStatus(courseId: string, status: 'draft' | 'published' | 'archived', actor?: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('courses').update({ status }).eq('id', courseId)
    }
    const list = getStore<Course>(KEY_COURSES, INITIAL_COURSES)
    setStore(KEY_COURSES, list.map(c => c.id === courseId ? { ...c, status } : c))
    await logSecurityEvent('UPDATE_COURSE_STATUS', 'courses', courseId, { status }, actor)
  },

  // --- CLASSES ---
  async getClasses(userId?: string, role?: AppRole): Promise<ClassSession[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('classes').select('*').order('starts_at', { ascending: true })
      if (!error && data) return data
    }
    const list = getStore<ClassSession>(KEY_CLASSES, INITIAL_CLASSES)
    if (!userId || !role || ['admin', 'super_admin'].includes(role)) return list
    if (role === 'teacher') return list.filter(c => c.teacher_id === userId)
    if (role === 'student') return list.filter(c => c.student_id === userId)
    return list
  },

  async createClass(session: Omit<ClassSession, 'id' | 'created_at'>, actor?: any): Promise<ClassSession> {
    const newSession: ClassSession = {
      ...session,
      id: `cls-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('classes').insert(newSession).select().single()
      if (!error && data) {
        await logSecurityEvent('CREATE_CLASS', 'classes', data.id, { starts_at: data.starts_at }, actor)
        return data
      }
    }
    const list = getStore<ClassSession>(KEY_CLASSES, INITIAL_CLASSES)
    setStore(KEY_CLASSES, [...list, newSession])
    await logSecurityEvent('CREATE_CLASS', 'classes', newSession.id, { starts_at: newSession.starts_at }, actor)
    return newSession
  },

  async updateClassStatus(classId: string, status: ClassSession['status'], actor?: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('classes').update({ status }).eq('id', classId)
    }
    const list = getStore<ClassSession>(KEY_CLASSES, INITIAL_CLASSES)
    setStore(KEY_CLASSES, list.map(c => c.id === classId ? { ...c, status } : c))
    await logSecurityEvent('UPDATE_CLASS_STATUS', 'classes', classId, { status }, actor)
  },

  // --- ATTENDANCE ---
  async getClassAttendance(classId: string): Promise<ClassAttendance[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('class_attendance').select('*').eq('class_id', classId)
      if (data) return data
    }
    const list = getStore<ClassAttendance>(KEY_ATTENDANCE, INITIAL_ATTENDANCE)
    return list.filter(a => a.class_id === classId)
  },

  async recordAttendance(attendance: Omit<ClassAttendance, 'id' | 'recorded_at'>, actor?: any): Promise<ClassAttendance> {
    const record: ClassAttendance = {
      ...attendance,
      id: `att-${Date.now().toString(36)}`,
      recorded_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('class_attendance').upsert(record, { onConflict: 'class_id,student_id' })
    }
    const list = getStore<ClassAttendance>(KEY_ATTENDANCE, INITIAL_ATTENDANCE)
    const filtered = list.filter(a => !(a.class_id === record.class_id && a.student_id === record.student_id))
    setStore(KEY_ATTENDANCE, [record, ...filtered])
    await logSecurityEvent('RECORD_ATTENDANCE', 'class_attendance', record.id, { status: record.status }, actor)
    return record
  },

  // --- HOMEWORK ---
  async getHomework(): Promise<Homework[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('homework').select('*').order('created_at', { ascending: false })
      if (data) return data
    }
    return getStore<Homework>(KEY_HOMEWORK, INITIAL_HOMEWORK)
  },

  async createHomework(hw: Omit<Homework, 'id' | 'created_at'>, actor?: any): Promise<Homework> {
    const newHw: Homework = {
      ...hw,
      id: `hw-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('homework').insert(newHw).select().single()
      if (data) {
        await logSecurityEvent('CREATE_HOMEWORK', 'homework', data.id, { title: data.title }, actor)
        return data
      }
    }
    const list = getStore<Homework>(KEY_HOMEWORK, INITIAL_HOMEWORK)
    setStore(KEY_HOMEWORK, [newHw, ...list])
    await logSecurityEvent('CREATE_HOMEWORK', 'homework', newHw.id, { title: newHw.title }, actor)
    return newHw
  },

  async getSubmissions(homeworkId?: string): Promise<HomeworkSubmission[]> {
    if (isSupabaseConfigured() && supabase) {
      const query = supabase.from('homework_submissions').select('*')
      if (homeworkId) query.eq('homework_id', homeworkId)
      const { data } = await query
      if (data) return data
    }
    const list = getStore<HomeworkSubmission>(KEY_SUBMISSIONS, INITIAL_SUBMISSIONS)
    return homeworkId ? list.filter(s => s.homework_id === homeworkId) : list
  },

  async submitHomework(submission: Omit<HomeworkSubmission, 'id' | 'submitted_at' | 'score' | 'feedback'>, actor?: any): Promise<HomeworkSubmission> {
    const newSub: HomeworkSubmission = {
      ...submission,
      id: `sub-${Date.now().toString(36)}`,
      submitted_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('homework_submissions').upsert(newSub).select().single()
      if (data) {
        await logSecurityEvent('SUBMIT_HOMEWORK', 'homework_submissions', data.id, {}, actor)
        return data
      }
    }
    const list = getStore<HomeworkSubmission>(KEY_SUBMISSIONS, INITIAL_SUBMISSIONS)
    const filtered = list.filter(s => !(s.homework_id === newSub.homework_id && s.student_id === newSub.student_id))
    setStore(KEY_SUBMISSIONS, [newSub, ...filtered])
    await logSecurityEvent('SUBMIT_HOMEWORK', 'homework_submissions', newSub.id, {}, actor)
    return newSub
  },

  async gradeSubmission(submissionId: string, score: number, feedback: string, actor?: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('homework_submissions').update({ score, feedback }).eq('id', submissionId)
    }
    const list = getStore<HomeworkSubmission>(KEY_SUBMISSIONS, INITIAL_SUBMISSIONS)
    setStore(KEY_SUBMISSIONS, list.map(s => s.id === submissionId ? { ...s, score, feedback } : s))
    await logSecurityEvent('GRADE_HOMEWORK', 'homework_submissions', submissionId, { score }, actor)
  },

  // --- ENQUIRIES CRM ---
  async getEnquiries(): Promise<Enquiry[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (data) return data
    }
    return getStore<Enquiry>(KEY_ENQUIRIES, INITIAL_ENQUIRIES)
  },

  async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at' | 'status'>, actor?: any): Promise<Enquiry> {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `ENQ-${Math.floor(1000 + Math.random() * 8999)}`,
      status: 'new',
      created_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('enquiries').insert(newEnquiry).select().single()
      if (data) {
        await logSecurityEvent('CREATE_ENQUIRY', 'enquiries', data.id, { subject: data.subject }, actor)
        return data
      }
    }
    const list = getStore<Enquiry>(KEY_ENQUIRIES, INITIAL_ENQUIRIES)
    setStore(KEY_ENQUIRIES, [newEnquiry, ...list])
    await logSecurityEvent('CREATE_ENQUIRY', 'enquiries', newEnquiry.id, { subject: newEnquiry.subject }, actor)
    return newEnquiry
  },

  async updateEnquiryStatus(enquiryId: string, status: Enquiry['status'], actor?: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('enquiries').update({ status }).eq('id', enquiryId)
    }
    const list = getStore<Enquiry>(KEY_ENQUIRIES, INITIAL_ENQUIRIES)
    setStore(KEY_ENQUIRIES, list.map(e => e.id === enquiryId ? { ...e, status } : e))
    await logSecurityEvent('UPDATE_ENQUIRY_STATUS', 'enquiries', enquiryId, { status }, actor)
  },

  // --- PAYMENTS & INVOICES ---
  async getPayments(payerId?: string): Promise<Payment[]> {
    if (isSupabaseConfigured() && supabase) {
      const query = supabase.from('payments').select('*').order('created_at', { ascending: false })
      if (payerId) query.eq('payer_id', payerId)
      const { data } = await query
      if (data) return data
    }
    const list = getStore<Payment>(KEY_PAYMENTS, INITIAL_PAYMENTS)
    return payerId ? list.filter(p => p.payer_id === payerId) : list
  },

  async createPaymentOrder(
    payment: Omit<Payment, 'id' | 'created_at' | 'status' | 'is_verified' | 'provider_reference'>,
    isConfiguredProvider: boolean,
    actor?: any
  ): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now().toString(36)}`,
      provider_reference: isConfiguredProvider ? `ORD_${Date.now()}` : `SANDBOX_ORD_${Date.now()}`,
      status: 'pending',
      // CRITICAL SECURITY CONSTRAINT: Client can NEVER mark payment as verified/paid directly!
      is_verified: false,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('payments').insert(newPayment).select().single()
      if (data) {
        await logSecurityEvent('CREATE_PAYMENT_ORDER', 'payments', data.id, { amount: data.amount_paise }, actor)
        return data
      }
    }

    const list = getStore<Payment>(KEY_PAYMENTS, INITIAL_PAYMENTS)
    setStore(KEY_PAYMENTS, [newPayment, ...list])
    await logSecurityEvent('CREATE_PAYMENT_ORDER', 'payments', newPayment.id, { amount: newPayment.amount_paise, sandbox: !isConfiguredProvider }, actor)
    return newPayment
  },

  // --- SUPPORT TICKETS ---
  async getTickets(): Promise<SupportTicket[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
      if (data) return data
    }
    return getStore<SupportTicket>(KEY_TICKETS, INITIAL_TICKETS)
  },

  async createTicket(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'status'>, actor?: any): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now().toString(36)}`,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('support_tickets').insert(newTicket).select().single()
      if (data) {
        await logSecurityEvent('CREATE_TICKET', 'support_tickets', data.id, { subject: data.subject }, actor)
        return data
      }
    }
    const list = getStore<SupportTicket>(KEY_TICKETS, INITIAL_TICKETS)
    setStore(KEY_TICKETS, [newTicket, ...list])
    await logSecurityEvent('CREATE_TICKET', 'support_tickets', newTicket.id, { subject: newTicket.subject }, actor)
    return newTicket
  },

  async updateTicketStatus(ticketId: string, status: SupportTicket['status'], actor?: any): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId)
    }
    const list = getStore<SupportTicket>(KEY_TICKETS, INITIAL_TICKETS)
    setStore(KEY_TICKETS, list.map(t => t.id === ticketId ? { ...t, status, updated_at: new Date().toISOString() } : t))
    await logSecurityEvent('UPDATE_TICKET_STATUS', 'support_tickets', ticketId, { status }, actor)
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
      if (data) return data
    }
    return getLocalAuditLogs()
  },
}
