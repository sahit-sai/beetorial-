import React, { useEffect, useState } from 'react'
import { BookOpen, Clock3, Plus, X, Check, Video } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { classSessionSchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const TeacherClasses: React.FC = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [courseTitle, setCourseTitle] = useState('Mathematics · Fractions & ratios')
  const [studentName, setStudentName] = useState('Aditi Raman')
  const [startsAt, setStartsAt] = useState('2026-10-15T17:00')
  const [endsAt, setEndsAt] = useState('2026-10-15T17:45')
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/demo-beetorial-class')

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await DataService.getClasses()
      setClasses(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = classSessionSchema.safeParse({
      student_id: 'b0000000-0000-0000-0000-000000000002',
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      meeting_url: meetingUrl,
    })

    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      const created = await DataService.createClass(
        {
          course_title: courseTitle,
          teacher_id: user?.id || 'c0000000-0000-0000-0000-000000000003',
          teacher_name: user?.full_name || 'Ms. Priya Sharma',
          student_id: 'b0000000-0000-0000-0000-000000000002',
          student_name: studentName,
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
                        <b>{cls.course_title || 'Mathematics · Fractions & ratios'}</b>
                        <small>Student: {cls.student_name || 'Aditi Raman'} · Status: {cls.status}</small>
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
              <select value={studentName} onChange={(e) => setStudentName(e.target.value)}>
                <option value="Aditi Raman">Aditi Raman (Grade 8)</option>
                <option value="Rahul Sharma">Rahul Sharma (Grade 6)</option>
                <option value="Meera K.">Meera K. (Grade 5)</option>
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
              Video Meeting Link (Google Meet / Zoom / Jitsi)
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/xyz-abcd-efg"
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Confirm & Save Session
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
