import React from 'react'
import { TrendingUp, Users, Award, BookOpen, Download } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { Stat } from '../../components/common/Stat'

export const AdminReports: React.FC = () => {
  return (
    <AppShell
      title="Academic Performance & Operations Reports"
      subtitle="Cohort progression analytics, tutor hours utilization and student retention."
      activeRole="admin"
    >
      <div className="stat-grid">
        <Stat label="Retention Rate" value="94.2%" sub="+2.1% this term" icon={TrendingUp} kind="green" />
        <Stat label="Avg Improvement" value="+18%" sub="In concept scores" icon={Award} kind="violet" />
        <Stat label="Teaching Hours" value="380 hrs" sub="Completed this month" icon={BookOpen} kind="blue" />
        <Stat label="Parent Net Promoter" value="84" sub="World-class satisfaction" icon={Users} kind="orange" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <Panel
            title="Subject Cohort Performance"
            subtitle="Diagnostic test growth across student cohorts."
          >
            <div className="skill-list">
              {[
                { subject: 'Grade 8 Mathematics (Fractions & Algebra)', score: 86, color: 'violet' },
                { subject: 'Grade 6 Science (Living Organisms)', score: 91, color: 'green' },
                { subject: 'Grade 5 English (Reading Comprehension)', score: 82, color: 'blue' },
                { subject: 'Grade 9 Foundation Coding', score: 88, color: 'violet' },
              ].map((c) => (
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
    </AppShell>
  )
}
