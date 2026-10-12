import React, { useEffect, useState } from 'react'
import { TrendingUp, Users, Award, BookOpen, Download } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { Stat } from '../../components/common/Stat'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { DataService } from '../../lib/dataService'
import { ClassSession, HomeworkSubmission, Profile } from '../../types'

export const AdminReports: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [c, s, p] = await Promise.all([
        DataService.getClasses(),
        DataService.getSubmissions(),
        DataService.getProfiles(),
      ])
      setClasses(c)
      setSubmissions(s)
      setProfiles(p)
      setLoading(false)
    }
    loadData()
  }, [])

  const completedClasses = classes.filter((c) => c.status === 'completed')
  const teachingHours = completedClasses.length * 1.5
  const graded = submissions.filter((s) => s.score != null)
  const avgScore =
    graded.length > 0
      ? Math.round(graded.reduce((acc, cur) => acc + (cur.score || 0), 0) / graded.length)
      : null
  const studentsCount = profiles.filter((p) => p.role === 'student').length

  // Build subject cohorts from real classes / submissions
  const subjectMap = new Map<string, { total: number; count: number }>()
  graded.forEach((sub) => {
    const key = sub.homework_id ? 'Course Work' : 'General'
    const cur = subjectMap.get(key) || { total: 0, count: 0 }
    subjectMap.set(key, { total: cur.total + (sub.score || 0), count: cur.count + 1 })
  })

  const cohortList = Array.from(subjectMap.entries()).map(([subj, data]) => ({
    subject: subj,
    score: Math.round(data.total / data.count),
    color: 'violet',
  }))

  return (
    <AppShell
      title="Academic Performance & Operations Reports"
      subtitle="Cohort progression analytics, tutor hours utilization and student retention."
      activeRole="admin"
    >
      <div className="stat-grid">
        <Stat
          label="Active Students"
          value={String(studentsCount)}
          sub={studentsCount > 0 ? 'Enrolled learners' : 'No active students'}
          icon={TrendingUp}
          kind="green"
        />
        <Stat
          label="Avg Score"
          value={avgScore !== null ? `${avgScore}%` : '—'}
          sub={avgScore !== null ? 'Across submissions' : 'No graded work'}
          icon={Award}
          kind="violet"
        />
        <Stat
          label="Teaching Hours"
          value={`${teachingHours} hrs`}
          sub={completedClasses.length > 0 ? `${completedClasses.length} sessions completed` : 'No sessions completed'}
          icon={BookOpen}
          kind="blue"
        />
        <Stat
          label="Total Cohorts"
          value={String(cohortList.length)}
          sub={cohortList.length > 0 ? 'Active tracks' : 'Pending classes'}
          icon={Users}
          kind="orange"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Generating academic reports..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Subject Cohort Performance"
              subtitle="Diagnostic test growth across student cohorts."
            >
              {cohortList.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No Cohort Performance Data"
                  description="Subject analytics and score distributions will populate once students complete graded homework and assessments."
                />
              ) : (
                <div className="skill-list">
                  {cohortList.map((c) => (
                    <div key={c.subject} className="skill">
                      <div>
                        <span>{c.subject}</span>
                        <b>{c.score}%</b>
                      </div>
                      <div className="progress">
                        <span className={c.color} style={{ width: `${c.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Report Downloads" subtitle="Audited reports for parents and academy directors.">
              <div className="data-list">
                {[
                  { name: 'Monthly Student Mastery Report', desc: 'Detailed skill breakdown across all enrolled learners.' },
                  { name: 'Tutor Utilization & Hours Audit', desc: 'Completed sessions, attendance and punctuality records.' },
                  { name: 'Admissions & Conversion Summary', desc: 'Enquiry to trial conversion velocity.' },
                ].map((r, i) => (
                  <div key={i} className="data-row" style={{ padding: '14px 0' }}>
                    <div className="data-main">
                      <b>{r.name}</b>
                      <small>{r.desc}</small>
                    </div>
                    <button
                      type="button"
                      className="subtle-button"
                      onClick={() => alert(`Downloading ${r.name} (CSV)...`)}
                    >
                      <Download size={13} /> Export
                    </button>
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
