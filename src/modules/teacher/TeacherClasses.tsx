import React, { useEffect, useState } from 'react'
import { BookOpen, Clock3, Plus, X, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession, Profile } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { classSessionSchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const TeacherClasses: React.FC = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [courseTitle, setCourseTitle] = useState('')
  const [studentName, setStudentName] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [classList, profileList] = await Promise.all([
        DataService.getClasses(),
        DataService.getProfiles(),
      ])
      setClasses(classList)
      setStudents(profileList.filter((p) => p.role === 'student'))
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!startsAt || !endsAt) {
      setError('Please provide start and end times.')
      return
    }

    const parseResult = classSessionSchema.safeParse({
      student_id: 'std-selected',
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      meeting_url: meetingUrl || undefined,
    })

    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      const created = await DataService.createClass(
        {
          course_title: courseTitle,
          teacher_id: user?.id,
          teacher_name: user?.full_name || 'Teacher',
          student_id: 'std-1',
          student_name: studentName || 'Enrolled Student',
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          meeting_url: meetingUrl || null,
          meeting_provider: meetingUrl?.includes('meet.google') ? 'google_meet' : 'unconfigured',
          status: 'scheduled',
        },
        user
      )

      setClasses([...classes, created])
      setNotice(`New class scheduled: ${created.course_title}!`)
      setModalOpen(false)
      setCourseTitle('')
      setStudentName('')
      setStartsAt('')
      setEndsAt('')
      setMeetingUrl('')
    } catch (err: any) {
      setError(err.message || 'Failed to schedule class.')
    }
  }

  return (
    <AppShell
      title="Class Management & Video Rooms"
      subtitle="Schedule tutoring sessions, configure video room links and manage schedules."
      activeRole="teacher"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading classes..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Class Sessions Schedule"
              subtitle="All scheduled and completed lessons assigned to you."
              action={
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setModalOpen(true)}
                  style={{ padding: '8px 12px', fontSize: '10px' }}
                >
                  <Plus size={13} /> Schedule New Class
                </button>
              }
            >
              {classes.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={BookOpen}
                    title="No classes scheduled"
                    description="Use the 'Schedule New Class' button to set up your first online lesson."
                    action={
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setModalOpen(true)}
                        style={{ padding: '8px 12px', fontSize: '10px' }}
                      >
                        <Plus size={13} /> Schedule New Class
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="data-list">
                  {classes.map((cls) => {
                    const startTime = new Date(cls.starts_at)
                    return (
                      <div key={cls.id} className="lesson-row" style={{ padding: '16px 0', borderBottom: '1px solid #f0f1f7' }}>
                        <div className="lesson-date">
                          <small>{startTime.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</small>
                          <b>{startTime.getDate()}</b>
                        </div>
                        <div className="lesson-info">
                          <b>{cls.course_title || 'Class Session'}</b>
                          <small>Student: {cls.student_name || 'Enrolled Student'} · Status: {cls.status}</small>
                          <span>
                            <Clock3 size={13} /> {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                          </span>
                        </div>
                        <MeetingLauncher
                          meetingUrl={cls.meeting_url}
                          classTitle={cls.course_title}
                          classId={cls.id}
                          canEdit={true}
                          onEditMeeting={() => alert('Editing meeting links requires admin verification in production.')}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateClass}>
            <div className="modal-head">
              <div>
                <h3>Schedule Tutoring Class</h3>
                <p>Add a lesson with verified video classroom link</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Subject & Topic
              <input
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Mathematics · Linear Equations"
              />
            </label>

            <label className="input-label">
              Enrolled Student
              {students.length > 0 ? (
                <select value={studentName} onChange={(e) => setStudentName(e.target.value)}>
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.full_name}>
                      {s.full_name} ({s.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name..."
                />
              )}
            </label>

            <div className="form-grid-2">
              <label className="input-label">
                Starts At
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </label>

              <label className="input-label">
                Ends At
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </label>
            </div>

            <label className="input-label">
              Video Classroom Link (Optional)
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Confirm & Schedule Session
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
