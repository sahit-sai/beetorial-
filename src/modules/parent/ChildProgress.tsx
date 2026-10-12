import React, { useEffect, useState } from 'react'
import { TrendingUp, Award, CalendarCheck, BookOpen, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { HomeworkSubmission } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'

export const ChildProgress: React.FC = () => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await DataService.getSubmissions()
      setSubmissions(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const scoredSubs = submissions.filter((s) => s.score != null)
  const avgScore = scoredSubs.length > 0
    ? `${Math.round(scoredSubs.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubs.length)}%`
    : '0%'

  return (
    <AppShell
      title="Student Learning Progress & Milestones"
      subtitle="Detailed breakdown of concept mastery, attendance records and teacher feedback."
      activeRole="parent"
    >
      <div className="stat-grid">
        <Stat label="Average Score" value={avgScore} sub={scoredSubs.length > 0 ? `${scoredSubs.length} graded` : 'Awaiting grades'} icon={Award} kind="violet" />
        <Stat label="Concepts Assessed" value={String(scoredSubs.length)} sub="From assignments" icon={BookOpen} kind="green" />
        <Stat label="Submissions" value={String(submissions.length)} sub="Total uploaded" icon={CalendarCheck} kind="blue" />
        <Stat label="Active Milestone" value={scoredSubs.length > 0 ? 'On Track' : 'Starting'} sub="Current term" icon={TrendingUp} kind="orange" />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading academic analytics..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel title="Subject Concept Breakdown" subtitle="Diagnostic tracking verified through session assignments.">
              {scoredSubs.length === 0 ? (
                <EmptyState
                  title="No concept assessments recorded"
                  description="Subject concept evaluations will appear here once assignments are reviewed and scored."
                />
              ) : (
                <div className="skill-list" style={{ gap: '22px' }}>
                  {scoredSubs.map((sub) => {
                    const pct = sub.score || 0
                    const status = pct >= 85 ? 'Mastered' : pct >= 70 ? 'Practising' : 'Developing'
                    return (
                      <div key={sub.id} className="skill">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <b style={{ fontSize: '11px', color: 'var(--ink)' }}>{sub.notes || 'Curriculum Assignment'}</b>
                            <span style={{ display: 'inline-block', marginLeft: '8px', fontSize: '9px', padding: '2px 6px', borderRadius: '5px', background: pct >= 85 ? '#e6f8ec' : '#eeebff', color: pct >= 85 ? '#24845a' : 'var(--purple)', fontWeight: 700 }}>
                              {status}
                            </span>
                          </div>
                          <b style={{ fontSize: '11px', color: 'var(--ink)' }}>{pct}%</b>
                        </div>
                        <div className="progress">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Recent Teacher Feedback" subtitle="Evaluations and feedback from assigned tutors.">
              {submissions.length === 0 ? (
                <EmptyState
                  title="No teacher feedback yet"
                  description="Tutor feedback and evaluation notes will appear here once homework is submitted and scored."
                />
              ) : (
                <div className="data-list">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="data-row" style={{ alignItems: 'flex-start' }}>
                      <div className="data-mark" style={{ marginTop: '2px' }}>
                        <Check size={16} />
                      </div>
                      <div className="data-main">
                        <b>{sub.student_name || 'Student'} · Score: {sub.score != null ? `${sub.score}/100` : 'Pending'}</b>
                        <small style={{ marginTop: '4px', fontStyle: 'italic', color: '#555d78' }}>
                          "{sub.feedback || 'Awaiting teacher evaluation.'}"
                        </small>
                        <small style={{ marginTop: '6px', color: '#9299ad' }}>
                          Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
