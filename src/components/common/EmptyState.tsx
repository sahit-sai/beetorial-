import React from 'react'
import { LucideIcon, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
}) => {
  return (
    <div className="empty" style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div
        style={{
          width: '42px',
          height: '42px',
          margin: '0 auto 12px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '12px',
          background: '#f4f2ff',
          color: 'var(--purple)',
        }}
      >
        <Icon size={20} />
      </div>
      <b style={{ display: 'block', fontSize: '13px', color: 'var(--ink)', marginBottom: '5px' }}>
        {title}
      </b>
      <p style={{ margin: '0 auto 16px', fontSize: '11px', color: 'var(--muted)', maxWidth: '320px', lineHeight: 1.6 }}>
        {description}
      </p>
      {action}
    </div>
  )
}
