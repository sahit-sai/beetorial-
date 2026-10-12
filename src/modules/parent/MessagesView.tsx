import React, { useState } from 'react'
import { Send, UserRound, Sparkles } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { useAuth } from '../../lib/authContext'

interface MessageItem {
  id: string
  sender: 'parent' | 'teacher'
  senderName: string
  text: string
  time: string
}

export const MessagesView: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'teacher',
      senderName: 'Ms. Priya Sharma',
      text: 'Hello Mrs. Raman! Aditi did wonderfully with ratio conversions today. Please make sure she attempts question 14 on page 42.',
      time: 'Yesterday, 6:15 PM',
    },
    {
      id: 'm2',
      sender: 'parent',
      senderName: 'Ananya Raman',
      text: 'Thank you Ms. Priya! She felt much more confident after the session. We have uploaded her homework sheet for review.',
      time: 'Today, 9:30 AM',
    },
    {
      id: 'm3',
      sender: 'teacher',
      senderName: 'Ms. Priya Sharma',
      text: 'Received! I have reviewed it and given feedback. See you in tomorrow’s scheduled session at 5:00 PM.',
      time: 'Today, 11:20 AM',
    },
  ])

  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'parent',
      senderName: user?.full_name || 'Ananya Raman',
      text: input.trim(),
      time: 'Just now',
    }

    setMessages([...messages, newMsg])
    setInput('')
  }

  return (
    <AppShell
      title="Direct Teacher Communication"
      subtitle="Private, secure messaging with tutor Ms. Priya Sharma."
      activeRole="parent"
    >
      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel
            title="Conversation with Ms. Priya Sharma (Mathematics Tutor)"
            subtitle="Updates, session clarifications, and homework guidance."
          >
            <div
              style={{
                display: 'grid',
                gap: '14px',
                maxHeight: '420px',
                overflowY: 'auto',
                padding: '12px 6px',
                marginBottom: '18px',
              }}
            >
              {messages.map((m) => {
                const isMe = m.sender === 'parent'
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        fontSize: '9px',
                        color: '#8b92a8',
                      }}
                    >
                      <UserRound size={12} />
                      <b>{m.senderName}</b>
                      <span>· {m.time}</span>
                    </div>
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        background: isMe ? 'var(--purple)' : '#f3f4fa',
                        color: isMe ? '#ffffff' : '#242746',
                        borderBottomRightRadius: isMe ? '2px' : '14px',
                        borderBottomLeftRadius: !isMe ? '2px' : '14px',
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '9px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message to the tutor..."
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e8f2',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button className="button button-primary" type="submit">
                <Send size={15} /> Send
              </button>
            </form>

            <div className="demo-notice" style={{ marginTop: '14px' }}>
              <Sparkles size={14} /> Messages are recorded in session state and archived in security audit trails.
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
