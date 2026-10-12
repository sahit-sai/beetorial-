import React from 'react'

interface PanelProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export const Panel: React.FC<PanelProps> = ({ title, subtitle, children, action }) => {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
