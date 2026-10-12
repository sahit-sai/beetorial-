import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, ClipboardList, CalendarDays, Plus, Clock3, ArrowRight } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { MeetingLauncher } from '../../components/providers/MeetingLauncher'
import { DataService } from '../../lib/dataService'
import { ClassSession, HomeworkSubmission } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'

export const TeacherDashboard: React.FC = () => {
  const nav = useNavigate()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [cls, subs] = await Promise.all([
        DataService.getClasses(),
        DataService.getSubmissions(),
      ])
      setClasses(cls)
      setSubmissions(subs)
      setLoading(false)
    }
    loadData()
  }, [])

  const nextClass = classes.find((c) => c.status === 'scheduled')
  const nextClassDate = nextClass ? new Date(nextClass.starts_at) : null
  const pendingGrading = submissions.filter((s) => s.score == null)
  const uniqueStudents = new Set(classes.map((c) => c.student_name).filter(Boolean)).size
  const completedClasses = classes.filter((c) => c.status === 'completed').length
  const attendanceRate = classes.length > 0 ? `${Math.round((completedClasses / classes.length) * 100)}%` : '0%'

  return (
    <AppShell
      title="Teacher Workspace & Classroom"
      subtitle="Your scheduled classes, learners and lesson grading for the week."
      activeRole="teacher"
    >
      <div className="stat-grid">
        <Stat label="Active Classes" value={String(classes.filter((c) => c.status === 'scheduled').length)} sub="Scheduled sessions" icon={BookOpen} kind="violet" />
        <Stat label="My Students" value={String(uniqueStudents)} sub="Enrolled learners" icon={Users} kind="blue" />
        <Stat label="To Review" value={String(pendingGrading.length)} sub="Pending grades" icon={ClipboardList} kind="orange" />
        <Stat label="Attendance Rate" value={attendanceRate} sub="Class completion" icon={CalendarDays} kind="green" />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading teaching workspace..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Next Scheduled Session"
              subtitle="Start or join the video classroom."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/teacher/classes')}>
                  Manage all classes <ArrowRight size={13} />
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
                    <b>{nextClass.course_title || 'Class Session'}</b>
                    <small>Learner: {nextClass.student_name || 'Enrolled Student'} · 1-on-1 Online</small>
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
                <div style={{ padding: '18px 0' }}>
                  <EmptyState
                    icon={BookOpen}
                    title="No classes scheduled today"
                    description="You have no upcoming sessions on the calendar. Schedule a lesson to start teaching."
                  />
                </div>
              )}
            </Panel>

            <Panel
              title="Recent Submissions for Grading"
              subtitle="Student worksheets ready for review and score logging."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/teacher/homework')}>
                  Grading Portal <ArrowRight size={13} />
                </button>
              }
            >
              {submissions.length === 0 ? (
                <div style={{ padding: '18px 0' }}>
                  <EmptyState
                    icon={ClipboardList}
                    title="No submissions awaiting review"
                    description="When students upload solutions for assignments, they will appear here for grading."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {submissions.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="data-row">
                      <div className="data-mark" style={{ background: '#f0efff', color: 'var(--purple)' }}>
                        <ClipboardList size={16} />
                      </div>
                      <div className="data-main">
                        <b>{sub.student_name || 'Enrolled Student'} · Assignment Solution</b>
                        <small style={{ marginTop: '3px' }}>Notes: "{sub.notes}"</small>
                      </div>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => nav('/teacher/homework')}
                        style={{ padding: '6px 10px', fontSize: '9px' }}
                      >
                        {sub.score != null ? 'Edit Grade' : 'Grade'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Teacher Quick Shortcuts" subtitle="Fast workflows for daily lesson tasks.">
              <div className="quick-actions">
                <button type="button" onClick={() => nav('/teacher/homework')}>
                  <span><ClipboardList size={16} /></span>
                  Create New Assignment
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/teacher/classes')}>
                  <span><BookOpen size={16} /></span>
                  Schedule New Class Session
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/teacher/attendance')}>
                  <span><CalendarDays size={16} /></span>
                  Record Class Attendance
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/teacher/messages')}>
                  <span><Users size={16} /></span>
                  Message Parents & Students
                  <ArrowRight size={14} />
                </button>
              </div>
            </Panel>

            <Panel title="Teaching Routine" subtitle="Daily checklist for student support.">
              <div className="todo-list">
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Verify camera & mic setup</b>
                    <small>Confirm test meeting link connects properly.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" defaultChecked />
                  <span>
                    <b>Mark completed session attendance</b>
                    <small>Keep parent records updated with attendance marks.</small>
                  </span>
                </label>
                <label className="todo">
                  <input type="checkbox" />
                  <span>
                    <b>Upload weekly progress notes</b>
                    <small>Parents receive updates automatically.</small>
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
