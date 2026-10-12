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

// Initial Data: completely clean with zero dummy records
const INITIAL_PROFILES: Profile[] = []
const INITIAL_COURSES: Course[] = []
const INITIAL_CLASSES: ClassSession[] = []
const INITIAL_ATTENDANCE: ClassAttendance[] = []
const INITIAL_HOMEWORK: Homework[] = []
const INITIAL_SUBMISSIONS: HomeworkSubmission[] = []
const INITIAL_ENQUIRIES: Enquiry[] = []
const INITIAL_PAYMENTS: Payment[] = []
const INITIAL_TICKETS: SupportTicket[] = []

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
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (!error && data) return data
    }
    return getStore<Profile>(KEY_PROFILES, INITIAL_PROFILES)
  },

  async upsertProfile(profile: Profile): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('profiles').upsert(profile).select().single()
      if (data) return data
    }
    const list = getStore<Profile>(KEY_PROFILES, INITIAL_PROFILES)
    const filtered = list.filter((p) => p.id !== profile.id)
    setStore(KEY_PROFILES, [profile, ...filtered])
    return profile
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
