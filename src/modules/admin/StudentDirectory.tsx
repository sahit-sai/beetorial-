import React, { useState } from 'react'
import { GraduationCap, Search, Mail, Phone, Plus, X, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'

interface StudentRecord {
  id: string
  name: string
  grade: string
  parentName: string
  parentEmail: string
  subject: string
  status: 'active' | 'trial' | 'inactive'
}

export const StudentDirectory: React.FC = () => {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [students, setStudents] = useState<StudentRecord[]>([
    {
      id: 'STD-101',
      name: 'Aditi Raman',
      grade: 'Grade 8',
      parentName: 'Ananya Raman',
      parentEmail: 'parent@beetorial.example',
      subject: 'Mathematics & Science',
      status: 'active',
    },
    {
      id: 'STD-102',
      name: 'Rahul Sharma',
      grade: 'Grade 6',
      parentName: 'Sanjay Sharma',
      parentEmail: 'sanjay@example.com',
      subject: 'Science Foundation',
      status: 'active',
    },
    {
      id: 'STD-103',
      name: 'Meera K.',
      grade: 'Grade 5',
      parentName: 'Kavita K.',
      parentEmail: 'kavita@example.com',
      subject: 'English Comprehension',
      status: 'trial',
    },
  ])

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
      parentName: newParent,
      parentEmail: newEmail,
      subject: newSubject,
      status: 'active',
    }

    setStudents([created, ...students])
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
                      background: s.status === 'active' ? '#e6f8ec' : '#fff8e6',
                      color: s.status === 'active' ? '#24845a' : '#c98a1f',
                    }}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleAddStudent}>
            <div className="modal-head">
              <div>
                <h3>Add New Student</h3>
                <p>Register a student profile with parent link</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Student Full Name
              <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Aryan Nair" />
            </label>

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
              Guardian Name
              <input required value={newParent} onChange={(e) => setNewParent(e.target.value)} placeholder="e.g. Meera Nair" />
            </label>

            <label className="input-label">
              Guardian Email Address
              <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="guardian@example.com" />
            </label>

            <label className="input-label">
              Focus Subject
              <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Mathematics" />
            </label>

            <button className="button button-primary button-full" type="submit">
              Save Student Profile
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
