import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, BookOpen, CalendarDays, Clock3, Check, ArrowRight, CreditCard, MessageCircle } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { PaymentModal } from '../../components/providers/PaymentModal'
import { DataService } from '../../lib/dataService'
import { ClassSession, Payment } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const ParentDashboard: React.FC = () => {
  const nav = useNavigate()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const classList = await DataService.getClasses()
      setClasses(classList)
      setLoading(false)
    }
    loadData()
  }, [])

  const completedCount = classes.filter((c) => c.status === 'completed').length
  const attendancePct = classes.length > 0 ? `${Math.round((completedCount / classes.length) * 100)}%` : '0%'
  const nextClass = classes.find((c) => c.status === 'scheduled')
  const nextClassDate = nextClass ? new Date(nextClass.starts_at) : null

  return (
    <AppShell
      title="Your child's learning, at a glance"
      subtitle="A clearer view of the progress, routines and support that help your child grow."
      activeRole="parent"
    >
      <div className="stat-grid">
        <Stat label="Learning progress" value={classes.length > 0 ? attendancePct : '0%'} sub={classes.length > 0 ? 'Active track' : 'No sessions yet'} icon={TrendingUp} kind="violet" />
        <Stat label="Lessons completed" value={String(completedCount)} sub={`${classes.length} total enrolled`} icon={BookOpen} kind="blue" />
        <Stat label="Attendance" value={attendancePct} sub={classes.length > 0 ? 'Recorded' : 'Awaiting classes'} icon={CalendarDays} kind="green" />
        <Stat
          label="Next lesson"
          value={nextClassDate ? nextClassDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'None'}
          sub={nextClass ? `${nextClassDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${nextClass.course_title || 'Session'}` : 'No upcoming classes'}
          icon={Clock3}
          kind="orange"
        />
      </div>

      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading child progress and schedule..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Weekly learning rhythm"
              subtitle="Small, consistent steps build lasting confidence."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/parent/progress')}>
                  Detailed progress <ArrowRight size={13} />
                </button>
              }
            >
              <div className="weekly-progress">
                <div className="week-head">
                  <div>
                    <b>Weekly session goal</b>
                    <small>{completedCount} of {Math.max(classes.length, 1)} sessions completed</small>
                  </div>
                  <strong>{classes.length > 0 ? attendancePct : '0%'}</strong>
                </div>
                <div className="progress large">
                  <span style={{ width: classes.length > 0 ? attendancePct : '0%' }} />
                </div>
                <div className="week-days">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i}>
                      <span className={i < completedCount ? 'day-done' : i === completedCount && nextClass ? 'day-next' : 'day-empty'}>
                        {i < completedCount ? <Check size={13} /> : i === completedCount && nextClass ? '•' : '—'}
                      </span>
                      <small>{d}</small>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel
              title="Upcoming live session"
              subtitle="Verified video link and lesson syllabus."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/parent/schedule')}>
                  Full calendar <ArrowRight size={13} />
                </button>
              }
            >
              {nextClass && nextClassDate ? (
                <div className="lesson-row" style={{ padding: '14px 0' }}>
                  <div className="lesson-date">
                    <small>{nextClassDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</small>
                    <b>{nextClassDate.getDate()}</b>
                  </div>
                  <div className="lesson-info">
                    <b>{nextClass.course_title || 'Tutoring Session'}</b>
                    <small>With {nextClass.teacher_name || 'Assigned Tutor'} · Online class</small>
                    <span>
                      <Clock3 size={13} /> {nextClassDate.toLocaleDateString()} at {nextClassDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </span>
                  </div>
                  <MeetingLauncher
                    meetingUrl={nextClass.meeting_url}
                    classTitle={nextClass.course_title}
                    classId={nextClass.id}
                  />
                </div>
              ) : (
                <div className="empty" style={{ textAlign: 'center', padding: '24px 12px' }}>
                  No sessions currently scheduled.
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Skill confidence index" subtitle="Areas evaluated across recent exercises.">
              {classes.length === 0 ? (
                <div className="empty" style={{ textAlign: 'center', padding: '24px 12px' }}>
                  Skill evaluations will appear here as lessons and homework exercises are completed.
                </div>
              ) : (
                <div className="skill-list">
                  {[
                    { name: 'Core Subject Concepts', score: parseInt(attendancePct) || 75, color: 'violet' },
                  ].map((x) => (
                    <div className="skill" key={x.name}>
                      <div>
                        <span>{x.name}</span>
                        <b>{x.score}%</b>
                      </div>
                      <div className="progress">
                        <span className={x.color} style={{ width: `${x.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Quick parental actions" subtitle="Shortcuts for common parental requests.">
              <div className="quick-actions">
                <button type="button" onClick={() => setPayModalOpen(true)}>
                  <span><CreditCard size={16} /></span>
                  Make Tuition Payment
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/parent/schedule')}>
                  <span><CalendarDays size={16} /></span>
                  View Session Schedule
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/parent/messages')}>
                  <span><MessageCircle size={16} /></span>
                  Message Assigned Tutor
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/parent/progress')}>
                  <span><TrendingUp size={16} /></span>
                  Download Monthly Report
                  <ArrowRight size={14} />
                </button>
              </div>
            </Panel>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={(payment: Payment) => {
          setNotice(`Payment order generated successfully (${payment.provider_reference}). Status: ${payment.status}.`)
        }}
      />
    </AppShell>
  )
}
