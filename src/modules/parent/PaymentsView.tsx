import React, { useEffect, useState } from 'react'
import { Wallet, CreditCard, ShieldCheck, Check, AlertCircle, Plus } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Stat } from '../../components/common/Stat'
import { Panel } from '../../components/common/Panel'
import { PaymentModal } from '../../components/providers/PaymentModal'
import { DataService } from '../../lib/dataService'
import { Payment } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { isPaymentProviderConfigured } from '../../lib/providers'

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const isConfigured = isPaymentProviderConfigured()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await DataService.getPayments()
      setPayments(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount_paise, 0)

  const pendingCount = payments.filter((p) => p.status === 'pending').length

  return (
    <AppShell
      title="Tuition Invoicing & Payment Records"
      subtitle="Review package receipts, pending invoice balances and verified transaction references."
      activeRole="parent"
    >
      <div className="stat-grid">
        <Stat
          label="Total Settled"
          value={`₹${(totalPaid / 100).toLocaleString('en-IN')}`}
          sub="All packages"
          icon={Wallet}
          kind="green"
        />
        <Stat
          label="Pending Invoices"
          value={String(pendingCount)}
          sub={pendingCount > 0 ? 'Requires attention' : 'All clear'}
          icon={CreditCard}
          kind={pendingCount > 0 ? 'orange' : 'blue'}
        />
        <Stat
          label="Active Packages"
          value={payments.length > 0 ? String(payments.length) : '0'}
          sub={payments.length > 0 ? 'Enrolled package' : 'No active package'}
          icon={ShieldCheck}
          kind="violet"
        />
        <Stat
          label="Next Billing"
          value={payments.length > 0 ? 'Scheduled' : '—'}
          sub="Package cycle"
          icon={CreditCard}
          kind="blue"
        />
      </div>

      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading financial records..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Payment Ledger & Invoices"
              subtitle="All invoices and transactions for your account."
              action={
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setModalOpen(true)}
                  style={{ padding: '8px 12px', fontSize: '10px' }}
                >
                  <Plus size={13} /> Pay Tuition Package
                </button>
              }
            >
              {payments.length === 0 ? (
                <div style={{ padding: '20px 0' }}>
                  <EmptyState
                    icon={CreditCard}
                    title="No invoices yet"
                    description="Generate a tuition payment order to begin sessions or renew your package."
                    action={
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setModalOpen(true)}
                        style={{ padding: '8px 12px', fontSize: '10px' }}
                      >
                        <Plus size={13} /> Pay Tuition Package
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="data-list">
                  {payments.map((p) => (
                    <div key={p.id} className="data-row" style={{ padding: '14px 0' }}>
                      <div className="data-mark" style={{ background: p.status === 'paid' ? '#e6f8ec' : '#fff8e6', color: p.status === 'paid' ? '#24845a' : '#c98a1f' }}>
                        <CreditCard size={16} />
                      </div>
                      <div className="data-main">
                        <b>{p.description || 'Tutoring Package'}</b>
                        <small style={{ marginTop: '3px' }}>
                          Ref: {p.provider_reference || p.id} · {new Date(p.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <b style={{ fontSize: '12px', color: 'var(--ink)' }}>
                          ₹{(p.amount_paise / 100).toLocaleString('en-IN')}
                        </b>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            background: p.status === 'paid' ? '#e5f8eb' : '#fff4df',
                            color: p.status === 'paid' ? '#24845a' : '#93651a',
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Gateway Integrity & Security Policy" subtitle="Server-side payment verification.">
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: isConfigured ? '#f0fcf4' : '#fffaf0', border: `1px solid ${isConfigured ? '#c5eed0' : '#faecc7'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {isConfigured ? <ShieldCheck size={16} color="#24845a" /> : <AlertCircle size={16} color="#c98a1f" />}
                    <b style={{ fontSize: '11px', color: isConfigured ? '#24845a' : '#8c5d0e' }}>
                      {isConfigured ? 'Production Gateway Active' : 'Sandbox Mode Configured'}
                    </b>
                  </div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#68728c', lineHeight: 1.6 }}>
                    {isConfigured
                      ? 'Payments are processed through configured Razorpay/Stripe webhooks. Card details are never stored on Beetorial servers.'
                      : 'Live credentials are not set. Test orders are saved with verified sandbox metadata. Real bank accounts will not be debited.'}
                  </p>
                </div>

                <div className="note" style={{ margin: 0 }}>
                  Need a GST business tax invoice for employer reimbursement? Download receipts or request support from platform administrators.
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(p: Payment) => {
          setPayments([p, ...payments])
          setNotice(`New invoice generated: ${p.provider_reference}. Status: ${p.status}.`)
        }}
      />
    </AppShell>
  )
}
