// ====================================================================
// Beetorial Platform Core TypeScript Type Definitions
// ====================================================================

export type AppRole = 'parent' | 'student' | 'teacher' | 'admin' | 'super_admin' | 'support'

export interface Profile {
  id: string
  full_name: string
  role: AppRole
  avatar_url?: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

export interface StudentParentLink {
  id: string
  student_id: string
  parent_id: string
  relationship: string
  created_at: string
}

export interface Organisation {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended'
  created_at: string
}

export interface Course {
  id: string
  organisation_id?: string | null
  title: string
  subject: string
  grade_level?: string | null
  description?: string | null
  status: 'draft' | 'published' | 'archived'
  created_by?: string | null
  created_at: string
}

export type EnquiryStatus = 'new' | 'contacted' | 'trial_booked' | 'closed'

export interface Enquiry {
  id: string
  parent_name: string
  parent_email: string
  parent_phone?: string | null
  student_grade?: string | null
  subject: string
  notes?: string | null
  status: EnquiryStatus
  assigned_to?: string | null
  created_at: string
}

export type ClassStatus = 'scheduled' | 'completed' | 'cancelled'
export type VideoMeetingProvider = 'google_meet' | 'zoom' | 'jitsi' | 'unconfigured'

export interface ClassSession {
  id: string
  course_id?: string | null
  course_title?: string
  teacher_id?: string | null
  teacher_name?: string
  student_id: string
  student_name?: string
  starts_at: string
  ends_at: string
  meeting_url?: string | null
  meeting_provider: VideoMeetingProvider
  status: ClassStatus
  created_at: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface ClassAttendance {
  id: string
  class_id: string
  student_id: string
  student_name?: string
  status: AttendanceStatus
  notes?: string | null
  recorded_by?: string | null
  recorded_at: string
}

export interface Homework {
  id: string
  class_id?: string | null
  title: string
  instructions?: string | null
  due_at?: string | null
  created_by?: string | null
  created_at: string
}

export interface HomeworkSubmission {
  id: string
  homework_id: string
  student_id: string
  student_name?: string
  submission_url?: string | null
  notes?: string | null
  score?: number | null
  feedback?: string | null
  submitted_at: string
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Payment {
  id: string
  payer_id: string
  payer_name?: string
  amount_paise: number // e.g., 450000 = ₹4,500.00
  currency: string
  provider: 'sandbox' | 'razorpay' | 'stripe'
  provider_reference?: string | null
  description?: string | null
  status: PaymentStatus
  is_verified: boolean
  created_at: string
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportTicket {
  id: string
  user_id?: string | null
  user_name?: string
  user_role?: AppRole
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  assigned_to?: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: number | string
  actor_id?: string | null
  actor_name?: string
  actor_role?: AppRole
  action: string
  resource_type: string
  resource_id?: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  role: AppRole
  full_name: string
  isDemo: boolean
}
