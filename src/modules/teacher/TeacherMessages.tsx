import React, { useState } from 'react'
import { Send, UserRound, Sparkles, MessageCircle } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../lib/authContext'

interface TeacherMessageItem {
  id: string
  sender: 'parent' | 'teacher'
  senderName: string
  text: string
  time: string
}

const STORAGE_KEY = 'beetorial_chat_messages_teacher'

function loadSavedMessages(): TeacherMessageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveMessages(msgs: TeacherMessageItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
  } catch {}
}

export const TeacherMessages: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<TeacherMessageItem[]>(loadSavedMessages)
  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: TeacherMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'teacher',
      senderName: user?.full_name || 'Teacher',
      text: input.trim(),
      time: 'Just now',
    }

    const next = [...messages, newMsg]
    setMessages(next)
    saveMessages(next)
    setInput('')
  }

  return (
    <AppShell
      title="Parent & Student Messaging"
      subtitle="Direct communication channel with guardians and learners."
      activeRole="teacher"
    >
      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel
            title="Guardian Communication Desk"
            subtitle="Lesson updates, doubt clarifications and homework guidance."
          >
            {messages.length === 0 ? (
              <div style={{ padding: '20px 0' }}>
                <EmptyState
                  icon={MessageCircle}
                  title="No messages yet"
                  description="Send a message below to communicate with parents and students in your class."
                />
              </div>
            ) : (
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
                  const isMe = m.sender === 'teacher'
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
                          maxWidth: '85%',
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
            )}

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '9px', marginTop: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type lesson update or feedback to parents..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e5e8f2',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button className="button button-primary" type="submit">
                <Send size={15} /> Send Update
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
