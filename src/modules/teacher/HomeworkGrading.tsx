import React, { useEffect, useState } from 'react'
import { ClipboardList, Award, Plus, X, Check } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { Homework, HomeworkSubmission } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { homeworkSchema, gradeSubmissionSchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const HomeworkGrading: React.FC = () => {
  const { user } = useAuth()
  const [homeworkList, setHomeworkList] = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [createOpen, setCreateOpen] = useState(false)
  const [gradeSub, setGradeSub] = useState<HomeworkSubmission | null>(null)

  // Create form
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dueAt, setDueAt] = useState('')

  // Grade form
  const [score, setScore] = useState<number>(90)
  const [feedback, setFeedback] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [hw, subs] = await Promise.all([
        DataService.getHomework(),
        DataService.getSubmissions(),
      ])
      setHomeworkList(hw)
      setSubmissions(subs)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = homeworkSchema.safeParse({ title, instructions, due_at: dueAt })
    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      const created = await DataService.createHomework(
        {
          title,
          instructions,
          due_at: dueAt || new Date(Date.now() + 3600000 * 72).toISOString(),
          created_by: user?.id,
        },
        user
      )

      setHomeworkList([created, ...homeworkList])
      setNotice(`Assignment created: ${created.title}!`)
      setCreateOpen(false)
      setTitle('')
      setInstructions('')
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment.')
    }
  }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradeSub) return
    setError(null)

    const parseResult = gradeSubmissionSchema.safeParse({ score, feedback })
    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      await DataService.gradeSubmission(gradeSub.id, score, feedback, user)
      setSubmissions(
        submissions.map((s) => (s.id === gradeSub.id ? { ...s, score, feedback } : s))
      )
      setNotice(`Grade updated for ${gradeSub.student_name || 'student'}: ${score}/100!`)
      setGradeSub(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save grade.')
    }
  }

  return (
    <AppShell
      title="Homework Assignments & Grading"
      subtitle="Issue lesson worksheets, assess submissions and provide detailed feedback."
      activeRole="teacher"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading homework portal..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Issued Assignments"
              subtitle="Active practice sheets available to students."
              action={
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setCreateOpen(true)}
                  style={{ padding: '8px 12px', fontSize: '10px' }}
                >
                  <Plus size={13} /> New Assignment
                </button>
              }
            >
              {homeworkList.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={ClipboardList}
                    title="No assignments issued yet"
                    description="Use the 'New Assignment' button above to create homework tasks for your students."
                    action={
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setCreateOpen(true)}
                        style={{ padding: '8px 12px', fontSize: '10px' }}
                      >
                        <Plus size={13} /> New Assignment
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="data-list">
                  {homeworkList.map((hw) => (
                    <div key={hw.id} className="data-row" style={{ padding: '14px 0' }}>
                      <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                        <ClipboardList size={16} />
                      </div>
                      <div className="data-main">
                        <b>{hw.title}</b>
                        <small style={{ marginTop: '3px' }}>{hw.instructions}</small>
                        <small style={{ marginTop: '5px', color: '#858ca2' }}>
                          Due: {hw.due_at ? new Date(hw.due_at).toLocaleDateString() : 'Flexible'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Student Submissions & Grading" subtitle="Review uploaded solution sheets and award scores.">
              {submissions.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={Award}
                    title="No submissions received"
                    description="Student homework submissions will appear here once submitted."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {submissions.map((sub) => {
                    const matchedHw = homeworkList.find((h) => h.id === sub.homework_id)
                    return (
                      <div key={sub.id} className="data-row" style={{ alignItems: 'flex-start', padding: '14px 0' }}>
                        <div className="data-mark" style={{ background: sub.score != null ? '#e6f8ec' : '#fff4df', color: sub.score != null ? '#24845a' : '#d28b2b' }}>
                          <Award size={16} />
                        </div>
                        <div className="data-main">
                          <b>{sub.student_name || 'Enrolled Student'} · {matchedHw?.title || 'Assignment'}</b>
                          <div style={{ margin: '3px 0', fontSize: '11px', fontWeight: 700, color: sub.score != null ? 'var(--purple)' : '#d28b2b' }}>
                            {sub.score != null ? `Score: ${sub.score} / 100` : 'Awaiting Grade'}
                          </div>
                          <small style={{ fontStyle: 'italic', color: '#555d78' }}>
                            "{sub.feedback || 'No feedback entered yet.'}"
                          </small>
                        </div>
                        <button
                          type="button"
                          className="subtle-button"
                          onClick={() => {
                            setGradeSub(sub)
                            setScore(sub.score ?? 90)
                            setFeedback(sub.feedback || '')
                          }}
                          style={{ padding: '6px 10px', fontSize: '9px' }}
                        >
                          {sub.score != null ? 'Edit Grade' : 'Grade'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateAssignment}>
            <div className="modal-head">
              <div>
                <h3>Create New Assignment</h3>
                <p>Post exercises for your students</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Assignment Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fractions Practice Sheet #5"
              />
            </label>

            <label className="input-label">
              Instructions & Questions
              <textarea
                required
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Specify questions from textbook or practice prompts..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '7px',
                  border: '1px solid #e5e8f2',
                  borderRadius: '9px',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </label>

            <label className="input-label">
              Due Date
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Publish Assignment
            </button>
          </form>
        </div>
      )}

      {/* Grade Modal */}
      {gradeSub && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleSaveGrade}>
            <div className="modal-head">
              <div>
                <h3>Grade Submission</h3>
                <p>{gradeSub.student_name || 'Student Submission'}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setGradeSub(null)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Score (0 to 100)
              <input
                type="number"
                min={0}
                max={100}
                required
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </label>

            <label className="input-label">
              Constructive Teacher Feedback
              <textarea
                required
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Excellent work on mixed fractions! Watch out for simplification on problem 14..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '7px',
                  border: '1px solid #e5e8f2',
                  borderRadius: '9px',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Save Grade & Feedback
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
