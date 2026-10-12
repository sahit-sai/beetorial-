import React, { useState } from 'react'
import { GraduationCap, Search, Mail, Phone, Plus, X, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'

interface StudentRecord {
  id: string
  name: string
  grade: string
  parentName: string
  parentEmail: string
  subject: string
  status: 'active' | 'trial' | 'inactive'
}

const STORAGE_KEY = 'beetorial_admin_students'

function loadStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveStudents(data: StudentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export const StudentDirectory: React.FC = () => {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [students, setStudents] = useState<StudentRecord[]>(loadStudents)

  const [newName, setNewName] = useState('')
  const [newGrade, setNewGrade] = useState('Grade 8')
  const [newParent, setNewParent] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newSubject, setNewSubject] = useState('Mathematics')
  const [notice, setNotice] = useState<string | null>(null)

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const created: StudentRecord = {
      id: `STD-${Math.floor(100 + Math.random() * 899)}`,
      name: newName,
      grade: newGrade,
      parentName: newParent || 'Guardian',
      parentEmail: newEmail || 'guardian@example.com',
      subject: newSubject,
      status: 'active',
    }

    const next = [created, ...students]
    setStudents(next)
    saveStudents(next)
    setNotice(`Enrolled new student: ${newName}!`)
    setModalOpen(false)
    setNewName('')
    setNewParent('')
    setNewEmail('')
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Student Directory & Enrolments"
      subtitle="Complete register of active learners, guardians and subject enrollments."
      activeRole="admin"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel
            title="Enrolled Students Register"
            subtitle="Manage profiles, guardian connections and course tracks."
            action={
              <button
                type="button"
                className="button button-primary"
                onClick={() => setModalOpen(true)}
                style={{ padding: '8px 12px', fontSize: '10px' }}
              >
                <Plus size={13} /> Add Student
              </button>
            }
          >
            <div className="table-search" style={{ marginBottom: '16px' }}>
              <Search size={14} />
              <input
                placeholder="Search students, parents or subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '24px 0' }}>
                <EmptyState
                  icon={GraduationCap}
                  title="No students registered"
                  description="Enroll your first student using the 'Add Student' button above."
                  action={
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setModalOpen(true)}
                      style={{ padding: '8px 12px', fontSize: '10px' }}
                    >
                      <Plus size={13} /> Add Student
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="data-list">
                {filtered.map((s) => (
                  <div key={s.id} className="data-row" style={{ padding: '14px 0' }}>
                    <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                      <GraduationCap size={16} />
                    </div>
                    <div className="data-main">
                      <b>{s.name} ({s.grade}) · {s.subject}</b>
                      <small>
                        {s.id} · Guardian: {s.parentName} ({s.parentEmail})
                      </small>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        background: '#e6f8ec',
                        color: '#24845a',
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleAddStudent}>
            <div className="modal-head">
              <div>
                <h3>Add New Student</h3>
                <p>Register student record and parent details</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Student Full Name
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Student Name"
              />
            </label>

            <div className="form-grid-2">
              <label className="input-label">
                Grade Level
                <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)}>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </label>

              <label className="input-label">
                Primary Subject Track
                <input
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Mathematics & Science"
                />
              </label>
            </div>

            <label className="input-label">
              Parent / Guardian Name
              <input
                required
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
                placeholder="e.g. Guardian Name"
              />
            </label>

            <label className="input-label">
              Parent Contact Email
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="parent@example.com"
              />
            </label>

            <button className="button button-primary button-full" type="submit">
              Confirm Student Enrollment
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
