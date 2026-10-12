import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, BookOpen, ClipboardList, BookMarked, Clock3, ArrowRight, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession, Homework } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const StudentDashboard: React.FC = () => {
  const nav = useNavigate()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [cls, hw] = await Promise.all([
        DataService.getClasses(),
        DataService.getHomework(),
      ])
      setClasses(cls)
      setHomework(hw)
      setLoading(false)
    }
    loadData()
  }, [])

  const nextClass = classes.find((c) => c.status === 'scheduled')

  return (
    <AppShell
      title="Welcome back, Aditi!"
      subtitle="Your classes, homework tasks and study materials — all in one connected space."
      activeRole="student"
    >
      <div className="stat-grid">
        <Stat label="Current Confidence" value="78%" sub="+12% this month" icon={TrendingUp} kind="violet" />
        <Stat label="Lessons Completed" value="8" sub="On schedule" icon={BookOpen} kind="blue" />
        <Stat label="Pending Homework" value={String(homework.length)} sub="Due this week" icon={ClipboardList} kind="orange" />
        <Stat label="Study Resources" value="12" sub="Ready to review" icon={BookMarked} kind="green" />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading student portal..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Next Live Session"
              subtitle="Connect to video call with your teacher."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/student/classes')}>
                  All classes <ArrowRight size={13} />
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
                    <small>Tutor: {nextClass.teacher_name || 'Ms. Priya Sharma'}</small>
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
                <div className="empty">No live classes scheduled today.</div>
              )}
            </Panel>

            <Panel
              title="Active Assignments"
              subtitle="Submit worksheets and read teacher feedback."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/student/homework')}>
                  View all homework <ArrowRight size={13} />
                </button>
              }
            >
              <div className="data-list">
                {homework.map((hw) => (
                  <div key={hw.id} className="data-row">
                    <div className="data-mark" style={{ background: '#f0efff', color: 'var(--purple)' }}>
                      <ClipboardList size={16} />
                    </div>
                    <div className="data-main">
                      <b>{hw.title}</b>
                      <small>{hw.instructions}</small>
                    </div>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => nav('/student/homework')}
                      style={{ padding: '7px 11px', fontSize: '9px' }}
                    >
                      Submit <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Concept Confidence Meters" subtitle="Track your weekly progress across core subjects.">
              <div className="skill-list">
                {[
                  { name: 'Mathematics: Fractions & Ratios', score: 78, color: 'violet' },
                  { name: 'Science: Cell Structure & Functions', score: 86, color: 'green' },
                  { name: 'English: Grammar & Composition', score: 72, color: 'blue' },
                ].map((s) => (
                  <div className="skill" key={s.name}>
                    <div>
                      <span>{s.name}</span>
                      <b>{s.score}%</b>
                    </div>
                    <div className="progress">
                      <span className={s.color} style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Today's Focus Checklist" subtitle="Small steps every day.">
              <div className="todo-list">
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Review reciprocal fractions rule</b>
                    <small>Check page 42 in your mathematics guide.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Upload homework worksheet #4</b>
                    <small>Take a clear photo or scan as PDF.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" />
                  <span>
                    <b>Prepare 1 question for Ms. Priya</b>
                    <small>Write down any doubt from yesterday's exercise.</small>
                  </span>
                </label>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
