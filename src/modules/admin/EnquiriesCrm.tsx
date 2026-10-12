import React, { useEffect, useState } from 'react'
import { MessageCircle, Plus, Search, X, Check, Mail, Phone } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { Enquiry } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { enquirySchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const EnquiriesCrm: React.FC = () => {
  const { user } = useAuth()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Form state
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [studentGrade, setStudentGrade] = useState('Grade 8')
  const [subject, setSubject] = useState('Mathematics')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const list = await DataService.getEnquiries()
      setEnquiries(list)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = enquirySchema.safeParse({
      parent_name: parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      student_grade: studentGrade,
      subject,
      notes,
    })

    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      const created = await DataService.createEnquiry(
        {
          parent_name: parentName,
          parent_email: parentEmail,
          parent_phone: parentPhone,
          student_grade: studentGrade,
          subject,
          notes,
        },
        user
      )

      setEnquiries([created, ...enquiries])
      setNotice(`Enquiry registered for ${created.parent_name}!`)
      setModalOpen(false)
      setParentName('')
      setParentEmail('')
      setParentPhone('')
      setNotes('')
    } catch (err: any) {
      setError(err.message || 'Failed to save enquiry.')
    }
  }

  const handleUpdateStatus = async (id: string, status: Enquiry['status']) => {
    await DataService.updateEnquiryStatus(id, status, user)
    setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status } : e)))
    setNotice(`Updated status to ${status.toUpperCase()}.`)
  }

  const filtered = enquiries.filter((e) => {
    const matchesFilter = filter === 'All' || e.status === filter
    const matchesSearch =
      e.parent_name.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.parent_email.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <AppShell
      title="Parent Enquiries & Admissions CRM"
      subtitle="Track leads, schedule diagnostic trials and assign tutors."
      activeRole="admin"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading CRM leads..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Parent Lead Intake"
              subtitle="All inbound enquiries across subjects and grade levels."
              action={
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setModalOpen(true)}
                  style={{ padding: '8px 12px', fontSize: '10px' }}
                >
                  <Plus size={13} /> Add Enquiry
                </button>
              }
            >
              <div className="filter-row">
                <div className="table-search">
                  <Search size={14} />
                  <input
                    placeholder="Search parent name, email or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['All', 'new', 'contacted', 'trial_booked', 'closed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className="subtle-button"
                      onClick={() => setFilter(st)}
                      style={{
                        background: filter === st ? 'var(--purple)' : '#ffffff',
                        color: filter === st ? '#ffffff' : 'var(--ink)',
                        borderColor: filter === st ? 'var(--purple)' : '#e9eaf4',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No Enquiries Found"
                  description={
                    search
                      ? `No enquiries matching "${search}".`
                      : filter !== 'All'
                      ? `No enquiries with status "${filter}".`
                      : 'There are currently no inbound parent enquiries registered.'
                  }
                  action={
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setModalOpen(true)}
                      style={{ padding: '8px 14px', fontSize: '10px' }}
                    >
                      <Plus size={12} /> Add Enquiry
                    </button>
                  }
                />
              ) : (
                <div className="data-list">
                  {filtered.map((enq) => (
                    <div key={enq.id} className="data-row" style={{ padding: '16px 0' }}>
                      <div className="data-mark" style={{ background: '#f0efff', color: 'var(--purple)' }}>
                        <MessageCircle size={16} />
                      </div>
                      <div className="data-main">
                        <b>{enq.parent_name} · {enq.subject} ({enq.student_grade || 'Grade 8'})</b>
                        <small style={{ marginTop: '3px' }}>
                          <Mail size={11} style={{ verticalAlign: 'middle' }} /> {enq.parent_email} {enq.parent_phone && `· 📞 ${enq.parent_phone}`}
                        </small>
                        <small style={{ marginTop: '5px', color: '#555d78' }}>
                          Note: "{enq.notes || 'No notes entered.'}"
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
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateEnquiry}>
            <div className="modal-head">
              <div>
                <h3>Add Parent Enquiry</h3>
                <p>Register a prospective tutoring consultation</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Parent Full Name
              <input required value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Meera S." />
            </label>

            <div className="form-grid-2">
              <label className="input-label">
                Parent Email
                <input type="email" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@example.com" />
              </label>

              <label className="input-label">
                Phone Number
                <input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+91 98765 00000" />
              </label>
            </div>

            <div className="form-grid-2">
              <label className="input-label">
                Student Grade
                <select value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)}>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </label>

              <label className="input-label">
                Subject Focus
                <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
              </label>
            </div>

            <label className="input-label">
              Inquiry Notes & Learning Needs
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Parent goals, current struggles, or schedule availability..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '7px',
                  border: '1px solid #e5e8f2',
                  borderRadius: '9px',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Save Lead to CRM
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
