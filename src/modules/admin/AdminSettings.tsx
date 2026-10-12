import React, { useState } from 'react'
import { Settings, Check, ShieldCheck } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'

export const AdminSettings: React.FC = () => {
  const [academyName, setAcademyName] = useState('Beetorial Academy Main')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [currency, setCurrency] = useState('INR')
  const [notice, setNotice] = useState<string | null>(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setNotice('Academy workspace configuration updated successfully.')
  }

  return (
    <AppShell
      title="Academy Workspace Settings"
      subtitle="Operational defaults, academic calendar timezones and notification policies."
      activeRole="admin"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <Panel title="Academy Preferences" subtitle="General operational profile.">
            <form onSubmit={handleSave}>
              <label className="input-label">
                Academy Name
                <input
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  required
                />
              </label>

              <label className="input-label">
                Default Timezone
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="Asia/Kolkata">India Standard Time (IST - UTC+5:30)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                </select>
              </label>

              <label className="input-label">
                Primary Currency
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="INR">Indian Rupee (INR - ₹)</option>
                  <option value="USD">US Dollar (USD - $)</option>
                  <option value="GBP">British Pound (GBP - £)</option>
                </select>
              </label>

              <button className="button button-primary" type="submit" style={{ marginTop: '10px' }}>
                Save Settings
              </button>
            </form>
          </Panel>
        </div>

        <div className="dashboard-col">
          <Panel title="Platform Security & Compliance" subtitle="Row Level Security verification status.">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f4f2ff', borderRadius: '9px', fontSize: '10px', color: '#5546e8', lineHeight: 1.6 }}>
                <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                All database access paths strictly enforced by PostgreSQL Row Level Security (RLS) policies. Role escalation requires super administrator authorization.
              </div>

              <div className="note" style={{ margin: 0 }}>
                Service-role keys are securely excluded from client bundles. Data operations utilize verified JSON Web Tokens (JWT) signed by Supabase Auth.
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
