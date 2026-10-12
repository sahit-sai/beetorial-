import React, { useState } from 'react'
import { X, CreditCard, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react'
import { isPaymentProviderConfigured, getPaymentProviderName } from '../../lib/providers'
import { DataService } from '../../lib/dataService'
import { Payment } from '../../types'
import { useAuth } from '../../lib/authContext'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (payment: Payment) => void
  defaultAmountPaise?: number
  defaultDescription?: string
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultAmountPaise = 450000,
  defaultDescription = 'Monthly 8-Session Tutoring Package',
}) => {
  const { user } = useAuth()
  const isConfigured = isPaymentProviderConfigured()
  const providerName = getPaymentProviderName()

  const [amountPaise, setAmountPaise] = useState<number>(defaultAmountPaise)
  const [description, setDescription] = useState<string>(defaultDescription)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!user) throw new Error('You must be signed in to initialize a payment.')

      // Call dataService to record order
      const newPayment = await DataService.createPaymentOrder(
        {
          payer_id: user.id,
          payer_name: user.full_name,
          amount_paise: amountPaise,
          currency: 'INR',
          provider: isConfigured ? 'razorpay' : 'sandbox',
          description,
        },
        isConfigured,
        user
      )

      setLoading(false)
      onSuccess(newPayment)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed.')
      setLoading(false)
    }
  }

  const formattedAmount = (amountPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleCreateOrder}>
        <div className="modal-head">
          <div>
            <h3>Tuition & Session Payment</h3>
            <p>Secure checkout order creation</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Provider Status Indicator */}
        <div
          style={{
            padding: '12px',
            borderRadius: '9px',
            marginBottom: '16px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '9px',
            background: isConfigured ? '#e6f8ec' : '#fff8e6',
            border: `1px solid ${isConfigured ? '#c5eed0' : '#f5e4b2'}`,
            color: isConfigured ? '#1f6d3a' : '#885c0a',
          }}
        >
          {isConfigured ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <div>
            <b>Gateway Status: {providerName}</b>
            <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>
              {isConfigured
                ? 'Live payment credentials connected. Webhook verification enabled.'
                : 'Payment credentials are not configured. Operating in Verified Sandbox Mode. Real bank cards will not be charged.'}
            </p>
          </div>
        </div>

        <label className="input-label">
          Package / Description
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Mathematics 8-Session Monthly Package"
          />
        </label>

        <label className="input-label">
          Amount (INR)
          <select
            value={amountPaise}
            onChange={(e) => setAmountPaise(Number(e.target.value))}
          >
            <option value={250000}>₹2,500 — Concept Prep (4 Sessions)</option>
            <option value={450000}>₹4,500 — Monthly Standard (8 Sessions)</option>
            <option value={800000}>₹8,000 — Comprehensive Term (16 Sessions)</option>
          </select>
        </label>

        <div style={{ margin: '14px 0', padding: '12px', background: '#fafaff', borderRadius: '9px', border: '1px solid #eeebff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
            <span>Order Total:</span>
            <span style={{ color: 'var(--purple)' }}>{formattedAmount}</span>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button
          className="button button-primary button-full"
          type="submit"
          disabled={loading}
        >
          <CreditCard size={15} />
          {loading ? 'Generating Order...' : isConfigured ? `Pay ${formattedAmount}` : `Create Sandbox Order (${formattedAmount})`}
        </button>

        <div className="demo-notice" style={{ marginTop: '12px' }}>
          <ShieldAlert size={14} />
          Integrity Guarantee: Beetorial never fakes real bank settlement. Transactions remain pending until signed by trusted gateway webhooks.
        </div>
      </form>
    </div>
  )
}
