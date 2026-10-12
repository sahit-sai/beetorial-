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
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../lib/authContext'

export const StudentDashboard: React.FC = () => {
  const nav = useNavigate()
  const { user } = useAuth()
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

  const completedClasses = classes.filter((c) => c.status === 'completed').length
  const nextClass = classes.find((c) => c.status === 'scheduled')
  const nextClassDate = nextClass ? new Date(nextClass.starts_at) : null

  return (
    <AppShell
      title={`Welcome back, ${user?.full_name || 'Learner'}!`}
      subtitle="Your classes, homework tasks and study materials — all in one connected space."
      activeRole="student"
    >
      <div className="stat-grid">
        <Stat label="Current Confidence" value={classes.length > 0 ? `${Math.min(100, 75 + completedClasses * 5)}%` : '0%'} sub="Academic track" icon={TrendingUp} kind="violet" />
        <Stat label="Lessons Completed" value={String(completedClasses)} sub={`${classes.length} total classes`} icon={BookOpen} kind="blue" />
        <Stat label="Pending Homework" value={String(homework.length)} sub={homework.length > 0 ? 'Assigned tasks' : 'All caught up'} icon={ClipboardList} kind="orange" />
        <Stat label="Scheduled Sessions" value={String(classes.filter((c) => c.status === 'scheduled').length)} sub="Upcoming" icon={BookMarked} kind="green" />
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
              {nextClass && nextClassDate ? (
                <div className="lesson-row" style={{ padding: '14px 0' }}>
                  <div className="lesson-date">
                    <small>{nextClassDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</small>
                    <b>{nextClassDate.getDate()}</b>
                  </div>
                  <div className="lesson-info">
                    <b>{nextClass.course_title || 'Live Tutoring Class'}</b>
                    <small>Tutor: {nextClass.teacher_name || 'Assigned Tutor'}</small>
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
                <div style={{ padding: '16px 0' }}>
                  <EmptyState
                    title="No live classes scheduled today"
                    description="Your next online class link will show up here once scheduled by your tutor."
                  />
                </div>
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
              {homework.length === 0 ? (
                <div style={{ padding: '16px 0' }}>
                  <EmptyState
                    icon={ClipboardList}
                    title="No assignments due"
                    description="Your tutors have not assigned any pending homework tasks."
                  />
                </div>
              ) : (
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
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Concept Confidence Meters" subtitle="Track your weekly progress across core subjects.">
              {classes.length === 0 ? (
                <div style={{ padding: '16px 0' }}>
                  <EmptyState
                    title="No subject data yet"
                    description="Subject mastery meters will show your progress as you attend classes and submit assignments."
                  />
                </div>
              ) : (
                <div className="skill-list">
                  {[
                    { name: 'Core Subject Concepts', score: 80, color: 'violet' },
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
              )}
            </Panel>

            <Panel title="Today's Focus Checklist" subtitle="Small steps every day.">
              <div className="todo-list">
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Review session notes</b>
                    <small>Go over key formulas and definitions.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" />
                  <span>
                    <b>Check assigned homework</b>
                    <small>Submit practice worksheets before the deadline.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" />
                  <span>
                    <b>Prepare 1 question for your tutor</b>
                    <small>Write down any doubt from the previous lesson.</small>
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
