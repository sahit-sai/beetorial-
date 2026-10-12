import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Users,
  MessageCircle,
  CalendarDays,
  Plus,
  ArrowRight,
  Check,
  Search,
  Wallet,
  BookOpen,
} from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { Enquiry } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../lib/authContext'
import { ClassSession, Profile } from '../../types'

export const AdminDashboard: React.FC = () => {
  const nav = useNavigate()
  const { user } = useAuth()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [enqList, classList, profileList] = await Promise.all([
        DataService.getEnquiries(),
        DataService.getClasses(),
        DataService.getProfiles(),
      ])
      setEnquiries(enqList)
      setClasses(classList)
      setProfiles(profileList)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleUpdateStatus = async (id: string, status: Enquiry['status']) => {
    await DataService.updateEnquiryStatus(id, status, user)
    setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status } : e)))
    setNotice(`Updated enquiry ${id} status to ${status.toUpperCase()}.`)
  }

  const activeStudentsCount = profiles.filter((p) => p.role === 'student').length
  const activeTutorsCount = profiles.filter((p) => p.role === 'teacher').length
  const scheduledClassesCount = classes.filter((c) => c.status === 'scheduled').length

  const filteredEnquiries = enquiries.filter(
    (e) =>
      filter === 'All' ||
      e.subject.toLowerCase().includes(filter.toLowerCase()) ||
      e.parent_name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <AppShell
      title="Academy Operations Overview"
      subtitle="Manage classes, tutors, student enrollments and incoming parent enquiries."
      activeRole="admin"
    >
      <div className="stat-grid">
        <Stat label="Active Students" value={String(activeStudentsCount)} sub="Enrolled accounts" icon={GraduationCap} kind="violet" />
        <Stat label="Active Tutors" value={String(activeTutorsCount)} sub="Accredited teachers" icon={Users} kind="blue" />
        <Stat label="Open Enquiries" value={String(enquiries.filter((e) => e.status !== 'closed').length)} sub="Awaiting response" icon={MessageCircle} kind="green" />
        <Stat label="Scheduled Classes" value={String(scheduledClassesCount)} sub="Upcoming sessions" icon={CalendarDays} kind="orange" />
      </div>

      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading academy metrics..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Incoming Parent Enquiries CRM"
              subtitle="Leads submitted via public website and marketing campaigns."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/admin/enquiries')}>
                  Full CRM Desk <ArrowRight size={13} />
                </button>
              }
            >
              <div className="filter-row">
                <div className="table-search">
                  <Search size={14} />
                  <input
                    placeholder="Search enquiries by parent or subject..."
                    value={filter === 'All' ? '' : filter}
                    onChange={(e) => setFilter(e.target.value || 'All')}
                  />
                </div>
                <button type="button" className="subtle-button" onClick={() => setFilter('All')}>
                  Clear
                </button>
              </div>

              {filteredEnquiries.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={MessageCircle}
                    title="No incoming enquiries"
                    description="Parent interest forms submitted through the website will appear here for admissions follow-up."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {filteredEnquiries.map((enq) => (
                    <div key={enq.id} className="data-row">
                      <div className="data-mark" style={{ background: '#f0efff', color: 'var(--purple)' }}>
                        <MessageCircle size={16} />
                      </div>
                      <div className="data-main">
                        <b>{enq.subject} · {enq.student_grade || 'Grade 8'}</b>
                        <small>
                          {enq.id} · Parent: {enq.parent_name} ({enq.parent_email})
                        </small>
                      </div>
                      <select
                        className="status-select"
                        value={enq.status}
                        onChange={(e) => handleUpdateStatus(enq.id, e.target.value as any)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="trial_booked">Trial booked</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Admin Operations Shortcuts" subtitle="Fast management tasks.">
              <div className="quick-actions">
                <button type="button" onClick={() => nav('/admin/students')}>
                  <span><GraduationCap size={16} /></span>
                  Student Directory
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/admin/tutors')}>
                  <span><Users size={16} /></span>
                  Tutor Management
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/admin/courses')}>
                  <span><BookOpen size={16} /></span>
                  Course Catalogue & Classes
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/admin/payments')}>
                  <span><Wallet size={16} /></span>
                  Payment Records & Ledger
                  <ArrowRight size={14} />
                </button>
              </div>
            </Panel>

            <Panel title="Platform Security & Role Enforcement" subtitle="PostgreSQL RLS verification.">
              <div className="note" style={{ margin: 0 }}>
                Server-enforced RBAC active. Admins can view and manage students, tutors and courses. Escalations to super administrator require multi-factor verification.
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
