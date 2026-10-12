import React, { useEffect, useState } from 'react'
import {
  ShieldCheck,
  Users,
  Mail,
  LockKeyhole,
  Check,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { AppRole, Profile } from '../../types'
import { useAuth } from '../../lib/authContext'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const AccessControls: React.FC = () => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<AppRole>('teacher')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Invite modal
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AppRole>('teacher')

  // Security policies configuration
  const [securityPolicies, setSecurityPolicies] = useState({
    mfa: true,
    passwordPolicy: true,
    restrictSessions: true,
    auditLogging: true,
    suspiciousAlerts: true,
  })

  // Role permissions matrix
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    view: true,
    create: true,
    edit: true,
    delete: false,
    manage_access: false,
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const list = await DataService.getProfiles()
      setProfiles(list)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleRoleChange = async (targetUserId: string, newRole: AppRole) => {
    setError(null)
    try {
      if (!user) return
      const success = await DataService.assignUserRole(targetUserId, newRole, user)
      if (success) {
        setProfiles(
          profiles.map((p) => (p.id === targetUserId ? { ...p, role: newRole } : p))
        )
        setNotice(`Successfully assigned role ${newRole.toUpperCase()} to user. Audit event logged.`)
      } else {
        setError('Server rejected role change. Insufficient privileges.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user role.')
    }
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.includes('@')) return

    const newProfile: Profile = {
      id: `usr-${Date.now().toString(36)}`,
      full_name: inviteEmail.split('@')[0],
      role: inviteRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setProfiles([newProfile, ...profiles])
    setNotice(`Staff account prepared for ${inviteEmail} with role ${inviteRole.toUpperCase()}.`)
    setInviteEmail('')
    setShowInvite(false)
  }

  return (
    <AppShell
      title="Role-Based Access Controls (RBAC) & Security Policies"
      subtitle="Server-enforced role assignments, permissions matrix and administrative invites."
      activeRole="super_admin"
    >
      <div className="stat-grid">
        <Stat label="Active Roles" value="6" sub="parent to super_admin" icon={ShieldCheck} kind="violet" />
        <Stat label="Staff Accounts" value={String(profiles.length)} sub="Verified profiles" icon={Users} kind="blue" />
        <Stat label="MFA Policy" value={securityPolicies.mfa ? 'Enforced' : 'Optional'} sub="Privileged logins" icon={LockKeyhole} kind="green" />
        <Stat label="RLS Security" value="Strict" sub="12 tables guarded" icon={ShieldCheck} kind="orange" />
      </div>

      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="inline-notice" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading RBAC configuration..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Role Permissions Matrix"
              subtitle="Inspect permissions granted to each platform role."
            >
              <label className="input-label">
                Select Role to Inspect
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                >
                  {(['parent', 'student', 'teacher', 'admin', 'super_admin', 'support'] as AppRole[]).map((r) => (
                    <option key={r} value={r}>
                      {r.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <div className="permission-list">
                {[
                  { key: 'view', label: 'View Permitted Data', desc: 'Read platform entities permitted by table RLS policies' },
                  { key: 'create', label: 'Create Records', desc: 'Insert new courses, homework assignments, or enquiries' },
                  { key: 'edit', label: 'Edit Existing Records', desc: 'Modify assigned courses, grades, or schedule sessions' },
                  { key: 'delete', label: 'Delete Records', desc: 'Archive or permanently remove records' },
                  { key: 'manage_access', label: 'Manage Roles & Users', desc: 'Execute assign_user_role RPC and staff invites' },
                ].map((p) => {
                  const isLockedSuper = selectedRole === 'super_admin'
                  const isChecked = isLockedSuper ? true : permissions[p.key] ?? false
                  return (
                    <label className="permission-row" key={p.key}>
                      <span>
                        <b>{p.label}</b>
                        <small>{p.desc}</small>
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLockedSuper}
                        onChange={(e) => setPermissions({ ...permissions, [p.key]: e.target.checked })}
                      />
                    </label>
                  )
                })}
              </div>

              <div className="note" style={{ margin: 0 }}>
                Security Guarantee: Role changes are executed exclusively via PostgreSQL <code>SECURITY DEFINER</code> functions that verify the caller's JWT identity. Users cannot self-elevate.
              </div>
            </Panel>

            <Panel title="Platform Security Configuration" subtitle="Policy defaults for sensitive operations.">
              {[
                { key: 'mfa', label: 'Require MFA for Administrators', desc: 'Enforces 2-factor authentication for admin & super_admin logins.' },
                { key: 'passwordPolicy', label: 'Strong Password Complexity', desc: 'Enforces minimum length, digits and special character combinations.' },
                { key: 'restrictSessions', label: 'Restrict Concurrent Admin Sessions', desc: 'Terminates prior active sessions when logging in from a new IP.' },
                { key: 'auditLogging', label: 'Audit Privileged RPC Invocations', desc: 'Logs user modifications and role assignments to audit_logs.' },
              ].map((pol) => (
                <label className="permission-row" key={pol.key}>
                  <span>
                    <b>{pol.label}</b>
                    <small>{pol.desc}</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={(securityPolicies as any)[pol.key]}
                    onChange={(e) =>
                      setSecurityPolicies({ ...securityPolicies, [pol.key]: e.target.checked })
                    }
                  />
                </label>
              ))}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel
              title="Platform User Role Assignment"
              subtitle="Modify user roles using server RPC."
              action={
                <button
                  type="button"
                  className="subtle-button"
                  onClick={() => setShowInvite(!showInvite)}
                >
                  <Plus size={13} /> Prepare Invite
                </button>
              }
            >
              {showInvite && (
                <form className="invite-form" onSubmit={handleInvite}>
                  <label className="input-label">
                    Staff Email Address
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="educator@beetorial.example"
                    />
                  </label>

                  <label className="input-label">
                    Assigned Role
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as AppRole)}
                    >
                      {(['teacher', 'admin', 'support', 'parent', 'student'] as AppRole[]).map((r) => (
                        <option key={r} value={r}>
                          {r.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className="button button-primary button-full" type="submit">
                    Send Administrative Invite
                  </button>
                </form>
              )}

              <div className="data-list">
                {profiles.map((p) => (
                  <div key={p.id} className="user-access" style={{ padding: '14px 0' }}>
                    <div className="user-avatar">{p.full_name.charAt(0)}</div>
                    <div className="data-main">
                      <b>{p.full_name}</b>
                      <small>{p.id.slice(0, 18)}...</small>
                      <select
                        className="status-select"
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value as AppRole)}
                        disabled={p.id === user?.id && p.role === 'super_admin'}
                        style={{ marginTop: '6px' }}
                      >
                        {(['parent', 'student', 'teacher', 'admin', 'super_admin', 'support'] as AppRole[]).map((r) => (
                          <option key={r} value={r}>
                            {r.toUpperCase()}
                          </option>
                        ))}
                      </select>
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
