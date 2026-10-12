import React, { useState } from 'react'
import { Settings, ShieldCheck, Check, Key } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { isSupabaseConfigured } from '../../lib/supabase'
import { isPaymentProviderConfigured } from '../../lib/providers'

export const PlatformSettings: React.FC = () => {
  const isSupabase = isSupabaseConfigured()
  const isPayment = isPaymentProviderConfigured()
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <AppShell
      title="Platform Security Architecture & Provider Settings"
      subtitle="Verify external integrations, PostgreSQL fail-closed RLS policies and service key restrictions."
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
        <div className="dashboard-col">
          <Panel title="External Provider Configuration Status" subtitle="Gating guards prevent simulated live execution.">
            <div className="data-list">
              <div className="data-row" style={{ padding: '16px 0' }}>
                <div className="data-main">
                  <b>Supabase PostgreSQL & Auth Backend</b>
                  <small>
                    {isSupabase
                      ? 'Connected via VITE_SUPABASE_URL. Server-side RLS enforcement active.'
                      : 'Operating in Verified Sandbox Mode. Local persistent state enabled.'}
                  </small>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isSupabase ? '#e6f8ec' : '#fff4df',
                    color: isSupabase ? '#24845a' : '#93651a',
                    textTransform: 'uppercase',
                  }}
                >
                  {isSupabase ? 'Connected' : 'Sandbox Active'}
                </span>
              </div>

              <div className="data-row" style={{ padding: '16px 0' }}>
                <div className="data-main">
                  <b>Payment Gateway (Razorpay / Stripe)</b>
                  <small>
                    {isPayment
                      ? 'Live credentials verified. Webhook signature checking active.'
                      : 'Credentials not configured. Sandbox checkout enabled; real cards cannot be billed.'}
                  </small>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isPayment ? '#e6f8ec' : '#fff4df',
                    color: isPayment ? '#24845a' : '#93651a',
                    textTransform: 'uppercase',
                  }}
                >
                  {isPayment ? 'Connected' : 'Sandbox Guarded'}
                </span>
              </div>

              <div className="data-row" style={{ padding: '16px 0' }}>
                <div className="data-main">
                  <b>Video Classrooms (Google Meet / Zoom)</b>
                  <small>URL validation enforces secure HTTPS links from authorized conferencing providers.</small>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: '#e6f8ec',
                    color: '#24845a',
                    textTransform: 'uppercase',
                  }}
                >
                  Gated Active
                </span>
              </div>
            </div>
          </Panel>
        </div>

        <div className="dashboard-col">
          <Panel title="Security Guarantees" subtitle="Strict standards enforced by Beetorial core.">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ padding: '14px', background: '#f5f3ff', borderRadius: '10px', fontSize: '10px', color: '#5546e8', lineHeight: 1.7 }}>
                <b>Zero-Trust Browser Roles</b><br />
                User permissions are verified directly against the database profile and PostgreSQL RLS on every transaction. Roles sent from localStorage are never trusted for database mutations.
              </div>
              <div style={{ padding: '14px', background: '#f0fbf3', borderRadius: '10px', fontSize: '10px', color: '#278754', lineHeight: 1.7 }}>
                <b>No Service-Role Key Leaks</b><br />
                The Supabase <code>service_role</code> secret is excluded from client bundles. Administrative actions use secure stored procedures with caller JWT authentication.
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
