import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LifeBuoy, MessageCircle, Clock, Check, ArrowRight } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { SupportTicket, Enquiry } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const SupportDashboard: React.FC = () => {
  const nav = useNavigate()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [t, e] = await Promise.all([
        DataService.getTickets(),
        DataService.getEnquiries(),
      ])
      setTickets(t)
      setEnquiries(e)
      setLoading(false)
    }
    loadData()
  }, [])

  const openTickets = tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved')
  const newEnquiries = enquiries.filter((e) => e.status === 'new')

  return (
    <AppShell
      title="Support Desk & Customer Assistance"
      subtitle="Resolve parent inquiries, student support tickets and schedule change requests."
      activeRole="support"
    >
      <div className="stat-grid">
        <Stat label="Open Tickets" value={String(openTickets.length)} sub="Requires attention" icon={LifeBuoy} kind="orange" />
        <Stat label="New Inquiries" value={String(newEnquiries.length)} sub="Parent leads" icon={MessageCircle} kind="blue" />
        <Stat label="Avg Resolution Time" value="2.4 hrs" sub="Within SLA" icon={Clock} kind="green" />
        <Stat label="Resolved Today" value="8" sub="All clear" icon={Check} kind="violet" />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading support operations..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Recent Support Requests"
              subtitle="Tickets logged by parents and tutors."
              action={
                <button type="button" className="subtle-button" onClick={() => nav('/support/tickets')}>
                  All Tickets <ArrowRight size={13} />
                </button>
              }
            >
              <div className="data-list">
                {tickets.map((t) => (
                  <div key={t.id} className="data-row" style={{ padding: '14px 0' }}>
                    <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                      <LifeBuoy size={16} />
                    </div>
                    <div className="data-main">
                      <b>{t.subject}</b>
                      <small>
                        User: {t.user_name || 'Guardian'} · Priority: {t.priority.toUpperCase()} · Status: {t.status.toUpperCase()}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => nav('/support/tickets')}
                      style={{ padding: '6px 10px', fontSize: '9px' }}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Admissions & Inquiry Routing" subtitle="Quick shortcuts.">
              <div className="quick-actions">
                <button type="button" onClick={() => nav('/support/enquiries')}>
                  <span><MessageCircle size={16} /></span>
                  Inquiries CRM Roster
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/support/tickets')}>
                  <span><LifeBuoy size={16} /></span>
                  Open Ticket Desk
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => nav('/support/audit')}>
                  <span><Clock size={16} /></span>
                  Platform Audit Log
                  <ArrowRight size={14} />
                </button>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
