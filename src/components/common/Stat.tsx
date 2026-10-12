import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatProps {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  kind?: 'violet' | 'blue' | 'green' | 'orange'
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  sub,
  icon: Icon,
  kind = 'violet',
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${kind}`}>
        <Icon size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  )
}
