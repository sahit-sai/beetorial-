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
  const pendingGrading = submissions.filter((s) => s.score == null)

  return (
    <AppShell
      title="Teacher Workspace & Classroom"
      subtitle="Your scheduled classes, learners and lesson grading for the week."
      activeRole="teacher"
    >
      <div className="stat-grid">
        <Stat label="Active Classes" value="6" sub="2 happening today" icon={BookOpen} kind="violet" />
        <Stat label="My Students" value="84" sub="Across all subjects" icon={Users} kind="blue" />
        <Stat label="To Review" value={String(submissions.length)} sub="Homework submissions" icon={ClipboardList} kind="orange" />
        <Stat label="Attendance Rate" value="94%" sub="This month" icon={CalendarDays} kind="green" />
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
              {nextClass ? (
                <div className="lesson-row" style={{ padding: '14px 0' }}>
                  <div className="lesson-date">
                    <small>OCT</small>
                    <b>14</b>
                  </div>
                  <div className="lesson-info">
                    <b>{nextClass.course_title || 'Mathematics · Fractions & ratios'}</b>
                    <small>Learner: {nextClass.student_name || 'Aditi Raman'} · 1-on-1 Online</small>
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
                <div className="empty">No classes scheduled today.</div>
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
              <div className="data-list">
                {submissions.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="data-row">
                    <div className="data-mark" style={{ background: '#f0efff', color: 'var(--purple)' }}>
                      <ClipboardList size={16} />
                    </div>
                    <div className="data-main">
                      <b>{sub.student_name || 'Aditi Raman'} · Fractions Practice Sheet #4</b>
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
                    <b>Mark yesterday's session attendance</b>
                    <small>Aditi Raman marked present with notes.</small>
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
