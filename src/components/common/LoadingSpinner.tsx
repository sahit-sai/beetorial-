import React from 'react'

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading workspace data...' }) => {
  return (
    <div className="empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '36px 0' }} role="status">
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '3px solid #eeebff',
          borderTopColor: 'var(--purple)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span>{message}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
