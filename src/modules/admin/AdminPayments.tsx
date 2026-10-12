import React, { useEffect, useState } from 'react'
import { Wallet, CreditCard, ShieldCheck, Download, Search } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { Stat } from '../../components/common/Stat'
import { DataService } from '../../lib/dataService'
import { Payment } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const list = await DataService.getPayments()
      setPayments(list)
      setLoading(false)
    }
    loadData()
  }, [])

  const totalPaise = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount_paise, 0)

  const pendingPaise = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount_paise, 0)

  const filtered = payments.filter((p) =>
    (p.payer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.provider_reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell
      title="Financial Ledger & Tuition Receipts"
      subtitle="Tuition packages collected, pending invoices and payment gateway logs."
      activeRole="admin"
    >
      <div className="stat-grid">
        <Stat
          label="Total Collected"
          value={`₹${(totalPaise / 100).toLocaleString('en-IN')}`}
          sub="Verified payments"
          icon={Wallet}
          kind="green"
        />
        <Stat
          label="Pending Invoices"
          value={`₹${(pendingPaise / 100).toLocaleString('en-IN')}`}
          sub="Awaiting settlement"
          icon={CreditCard}
          kind="orange"
        />
        <Stat
          label="Active Packages"
          value="48"
          sub="Monthly plans"
          icon={ShieldCheck}
          kind="violet"
        />
        <Stat
          label="Refund Rate"
          value="0.0%"
          sub="No disputes"
          icon={CreditCard}
          kind="blue"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading financial transactions..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Tuition Invoicing Ledger"
              subtitle="All student tuition orders and status confirmations."
              action={
                <button
                  type="button"
                  className="subtle-button"
                  onClick={() => alert('Exporting financial report CSV...')}
                >
                  <Download size={13} /> Export Ledger
                </button>
              }
            >
              <div className="table-search" style={{ marginBottom: '16px' }}>
                <Search size={14} />
                <input
                  placeholder="Search ledger by student, ref or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="data-list">
                {filtered.map((p) => (
                  <div key={p.id} className="data-row" style={{ padding: '16px 0' }}>
                    <div className="data-mark" style={{ background: p.status === 'paid' ? '#e6f8ec' : '#fff8e6', color: p.status === 'paid' ? '#24845a' : '#c98a1f' }}>
                      <CreditCard size={16} />
                    </div>
                    <div className="data-main">
                      <b>{p.description || 'Tutoring Package'} · {p.payer_name || 'Guardian'}</b>
                      <small style={{ marginTop: '3px' }}>
                        Ref: {p.provider_reference} · Provider: {p.provider.toUpperCase()} · {new Date(p.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <b style={{ fontSize: '13px', color: 'var(--ink)' }}>
                        ₹{(p.amount_paise / 100).toLocaleString('en-IN')}
                      </b>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          marginTop: '4px',
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
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  )
}
