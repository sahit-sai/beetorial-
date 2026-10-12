import React, { useEffect, useState } from 'react'
import { LifeBuoy, Plus, Check, X, Search, Clock } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { SupportTicket } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { supportTicketSchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const TicketDesk: React.FC = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium')

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const list = await DataService.getTickets()
      setTickets(list)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = supportTicketSchema.safeParse({ subject, description, priority })
    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      const created = await DataService.createTicket(
        {
          user_id: user?.id,
          user_name: user?.full_name || 'Platform User',
          user_role: user?.role,
          subject,
          description,
          priority,
        },
        user
      )

      setTickets([created, ...tickets])
      setNotice(`Created ticket: ${created.subject}!`)
      setModalOpen(false)
      setSubject('')
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.')
    }
  }

  const handleUpdateStatus = async (ticketId: string, status: SupportTicket['status']) => {
    await DataService.updateTicketStatus(ticketId, status, user)
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)))
    setNotice(`Updated ticket status to ${status.toUpperCase()}.`)
  }

  return (
    <AppShell
      title="Support Ticket Desk"
      subtitle="Help desk ticketing queue for account issues, session reschedules and parent assistance."
      activeRole="support"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading support tickets..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Ticket Queue"
              subtitle="All open and resolved support requests."
              action={
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setModalOpen(true)}
                  style={{ padding: '8px 12px', fontSize: '10px' }}
                >
                  <Plus size={13} /> Open Ticket
                </button>
              }
            >
              {tickets.length === 0 ? (
                <EmptyState
                  icon={LifeBuoy}
                  title="No Support Tickets"
                  description="Support ticket queue is completely clear. Use the Open Ticket button to record a new customer request."
                  action={
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setModalOpen(true)}
                      style={{ padding: '8px 14px', fontSize: '10px' }}
                    >
                      <Plus size={12} /> Open Ticket
                    </button>
                  }
                />
              ) : (
                <div className="data-list">
                  {tickets.map((t) => (
                    <div key={t.id} className="data-row" style={{ padding: '16px 0' }}>
                      <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                        <LifeBuoy size={16} />
                      </div>
                      <div className="data-main">
                        <b>{t.subject}</b>
                        <small style={{ marginTop: '2px' }}>
                          By {t.user_name || 'Guardian'} ({t.user_role || 'user'}) · Priority: {t.priority.toUpperCase()} · Logged: {new Date(t.created_at).toLocaleDateString()}
                        </small>
                        <small style={{ marginTop: '4px', color: '#555d78' }}>"{t.description}"</small>
                      </div>
                      <select
                        className="status-select"
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value as any)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateTicket}>
            <div className="modal-head">
              <div>
                <h3>Create Support Ticket</h3>
                <p>Log a parent or student support inquiry</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Subject
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Reschedule session request"
              />
            </label>

            <label className="input-label">
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>

            <label className="input-label">
              Detailed Description
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or question..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '7px',
                  border: '1px solid #e5e8f2',
                  borderRadius: '9px',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Submit Ticket
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
