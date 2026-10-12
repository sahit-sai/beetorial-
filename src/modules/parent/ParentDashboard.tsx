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

  const nextClass = classes.find((c) => c.status === 'scheduled')

  return (
    <AppShell
      title="Your child's learning, at a glance"
      subtitle="A clearer view of the progress, routines and support that help your child grow."
      activeRole="parent"
    >
      <div className="stat-grid">
        <Stat label="Learning progress" value="78%" sub="+12% this month" icon={TrendingUp} kind="violet" />
        <Stat label="Lessons completed" value="8" sub="2 this week" icon={BookOpen} kind="blue" />
        <Stat label="Attendance" value="96%" sub="On track" icon={CalendarDays} kind="green" />
        <Stat label="Next lesson" value="Tomorrow" sub="5:00 PM · Mathematics" icon={Clock3} kind="orange" />
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
                    <small>4 of 5 sessions completed</small>
                  </div>
                  <strong>80%</strong>
                </div>
                <div className="progress large">
                  <span style={{ width: '80%' }} />
                </div>
                <div className="week-days">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i}>
                      <span className={i < 4 ? 'day-done' : i === 4 ? 'day-next' : 'day-empty'}>
                        {i < 4 ? <Check size={13} /> : i === 4 ? '•' : '—'}
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
              {nextClass ? (
                <div className="lesson-row" style={{ padding: '14px 0' }}>
                  <div className="lesson-date">
                    <small>OCT</small>
                    <b>14</b>
                  </div>
                  <div className="lesson-info">
                    <b>{nextClass.course_title || 'Mathematics · Fractions & ratios'}</b>
                    <small>With {nextClass.teacher_name || 'Ms. Priya Sharma'} · Online class</small>
                    <span>
                      <Clock3 size={13} /> Tomorrow, 5:00–5:45 PM IST
                    </span>
                  </div>
                  <MeetingLauncher
                    meetingUrl={nextClass.meeting_url}
                    classTitle={nextClass.course_title}
                    classId={nextClass.id}
                  />
                </div>
              ) : (
                <div className="empty">No sessions currently scheduled.</div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Skill confidence index" subtitle="Areas evaluated across recent exercises.">
              <div className="skill-list">
                {[
                  { name: 'Mathematics (Fractions & Ratios)', score: 78, color: 'violet' },
                  { name: 'Science (Cell Biology)', score: 86, color: 'green' },
                  { name: 'English (Reading Comprehension)', score: 72, color: 'blue' },
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
                  Message Ms. Priya Sharma
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
