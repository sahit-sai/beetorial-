import React, { useState } from 'react'
import { GraduationCap, Check, X, ShieldCheck, FileText } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'

interface TutorApplication {
  id: string
  name: string
  subject: string
  degrees: string
  experience: string
  status: 'pending_review' | 'approved' | 'rejected'
}

const STORAGE_KEY = 'beetorial_tutor_applications'

export const TutorApprovals: React.FC = () => {
  const [applications, setApplications] = useState<TutorApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [notice, setNotice] = useState<string | null>(null)

  const handleDecision = (id: string, decision: 'approved' | 'rejected') => {
    const updated = applications.map((a) => (a.id === id ? { ...a, status: decision } : a))
    setApplications(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
    setNotice(`Application ${id} marked as ${decision.toUpperCase()}.`)
  }

  return (
    <AppShell
      title="Tutor Accreditation & Verification Queue"
      subtitle="Verify educator qualifications, identity documents and background checks before onboarding."
      activeRole="super_admin"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel title="Pending Educator Applications" subtitle="Review teaching credentials before enabling classroom access.">
            {applications.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No Pending Tutor Applications"
                description="There are currently no educator applications waiting for accreditation review or document verification."
              />
            ) : (
            <div className="data-list">
              {applications.map((app) => (
                <div key={app.id} className="data-row" style={{ padding: '16px 0' }}>
                  <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                    <GraduationCap size={16} />
                  </div>
                  <div className="data-main">
                    <b>{app.name} · {app.subject}</b>
                    <small style={{ marginTop: '3px' }}>
                      {app.degrees} · {app.experience}
                    </small>
                  </div>
                  {app.status === 'pending_review' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => handleDecision(app.id, 'approved')}
                        style={{ padding: '6px 12px', fontSize: '9px' }}
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        type="button"
                        className="subtle-button"
                        onClick={() => handleDecision(app.id, 'rejected')}
                        style={{ padding: '6px 10px', fontSize: '9px', color: '#c81e1e' }}
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        background: app.status === 'approved' ? '#e6f8ec' : '#fde8e8',
                        color: app.status === 'approved' ? '#24845a' : '#c81e1e',
                      }}
                    >
                      {app.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
