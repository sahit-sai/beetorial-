import React, { useEffect, useState } from 'react'
import { TrendingUp, Award, CalendarCheck, BookOpen, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { HomeworkSubmission } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

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

  return (
    <AppShell
      title="Aditi's Learning Progress & Milestones"
      subtitle="Detailed breakdown of concept mastery, attendance records and teacher feedback."
      activeRole="parent"
    >
      <div className="stat-grid">
        <Stat label="Average Score" value="92%" sub="Top quartile" icon={Award} kind="violet" />
        <Stat label="Concepts Mastered" value="14" sub="+3 this week" icon={BookOpen} kind="green" />
        <Stat label="Attendance Record" value="96%" sub="24 of 25 attended" icon={CalendarCheck} kind="blue" />
        <Stat label="Growth Velocity" value="+12%" sub="Month over month" icon={TrendingUp} kind="orange" />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading academic analytics..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel title="Subject Concept Breakdown" subtitle="Diagnostic tracking verified through session assignments.">
              <div className="skill-list" style={{ gap: '22px' }}>
                {[
                  { subject: 'Mathematics: Fractions & Mixed Numbers', pct: 92, status: 'Mastered' },
                  { subject: 'Mathematics: Ratios & Proportional Reasoning', pct: 78, status: 'Practising' },
                  { subject: 'Mathematics: Algebraic Expressions', pct: 74, status: 'Developing' },
                  { subject: 'Science: Cellular Structure & Mitosis', pct: 88, status: 'Mastered' },
                  { subject: 'English: Contextual Vocabulary & Inference', pct: 82, status: 'Proficient' },
                ].map((concept) => (
                  <div key={concept.subject} className="skill">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <b style={{ fontSize: '11px', color: 'var(--ink)' }}>{concept.subject}</b>
                        <span style={{ display: 'inline-block', marginLeft: '8px', fontSize: '9px', padding: '2px 6px', borderRadius: '5px', background: concept.pct >= 85 ? '#e6f8ec' : '#eeebff', color: concept.pct >= 85 ? '#24845a' : 'var(--purple)', fontWeight: 700 }}>
                          {concept.status}
                        </span>
                      </div>
                      <b style={{ fontSize: '11px', color: 'var(--ink)' }}>{concept.pct}%</b>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${concept.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Recent Teacher Feedback" subtitle="Evaluations from tutor Ms. Priya Sharma.">
              <div className="data-list">
                {submissions.map((sub) => (
                  <div key={sub.id} className="data-row" style={{ alignItems: 'flex-start' }}>
                    <div className="data-mark" style={{ marginTop: '2px' }}>
                      <Check size={16} />
                    </div>
                    <div className="data-main">
                      <b>Fractions Practice Sheet #4 · Score: {sub.score}/100</b>
                      <small style={{ marginTop: '4px', fontStyle: 'italic', color: '#555d78' }}>
                        "{sub.feedback || 'Good work on practice problems.'}"
                      </small>
                      <small style={{ marginTop: '6px', color: '#9299ad' }}>
                        Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
