import React, { useEffect, useState } from 'react'
import { ClipboardList, Check, Upload, Award, X, Sparkles } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { Homework, HomeworkSubmission } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { homeworkSubmissionSchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const HomeworkView: React.FC = () => {
  const { user } = useAuth()
  const [homeworkList, setHomeworkList] = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeHw, setActiveHw] = useState<Homework | null>(null)

  const [submissionUrl, setSubmissionUrl] = useState('')
  const [notes, setNotes] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = homeworkSubmissionSchema.safeParse({
      submission_url: submissionUrl,
      notes,
    })

    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    if (!activeHw || !user) return

    try {
      const created = await DataService.submitHomework(
        {
          homework_id: activeHw.id,
          student_id: user.id,
          student_name: user.full_name,
          submission_url: submissionUrl || 'https://beetorial.example/uploads/worksheet.pdf',
          notes,
        },
        user
      )

      setSubmissions([created, ...submissions.filter((s) => s.homework_id !== activeHw.id)])
      setNotice(`Submitted assignment: ${activeHw.title}!`)
      setActiveHw(null)
      setSubmissionUrl('')
      setNotes('')
    } catch (err: any) {
      setError(err.message || 'Submission failed.')
    }
  }

  return (
    <AppShell
      title="Homework & Assignment Portal"
      subtitle="Complete your practice tasks, submit solutions and review teacher grading."
      activeRole="student"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading homework assignments..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <Panel
              title="Assigned Homework Tasks"
              subtitle="Due dates set by your teacher."
            >
              {homeworkList.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={ClipboardList}
                    title="No assignments issued"
                    description="Homework worksheets and tasks will appear here once assigned by your tutor."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {homeworkList.map((hw) => {
                    const existingSub = submissions.find((s) => s.homework_id === hw.id)
                    return (
                      <div key={hw.id} className="data-row" style={{ padding: '16px 0' }}>
                        <div className="data-mark" style={{ background: existingSub ? '#e6f8ec' : '#f0efff', color: existingSub ? '#24845a' : 'var(--purple)' }}>
                          <ClipboardList size={16} />
                        </div>
                        <div className="data-main">
                          <b>{hw.title}</b>
                          <small style={{ marginTop: '4px' }}>{hw.instructions}</small>
                          <small style={{ marginTop: '6px', color: '#9299ad' }}>
                            Due: {hw.due_at ? new Date(hw.due_at).toLocaleDateString() : 'This week'}
                          </small>
                        </div>
                        <div>
                          {existingSub ? (
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '5px 8px', borderRadius: '6px', background: '#e5f8eb', color: '#24845a' }}>
                              Submitted {existingSub.score != null ? `(${existingSub.score}/100)` : ''}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => setActiveHw(hw)}
                              style={{ padding: '8px 12px', fontSize: '10px' }}
                            >
                              <Upload size={13} /> Submit Work
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>

          <div className="dashboard-col">
            <Panel title="Teacher Feedback & Scores" subtitle="Scores verified and logged in your academic record.">
              {submissions.length === 0 ? (
                <div style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={Award}
                    title="No graded work yet"
                    description="Submit an assignment above to receive grades and feedback from your tutor."
                  />
                </div>
              ) : (
                <div className="data-list">
                  {submissions.map((sub) => {
                    const matchedHw = homeworkList.find((h) => h.id === sub.homework_id)
                    return (
                      <div key={sub.id} className="data-row" style={{ alignItems: 'flex-start' }}>
                        <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                          <Award size={16} />
                        </div>
                        <div className="data-main">
                          <b>{matchedHw?.title || 'Course Worksheet'}</b>
                          <div style={{ margin: '4px 0', fontSize: '11px', color: 'var(--purple)', fontWeight: 800 }}>
                            Score: {sub.score != null ? `${sub.score} / 100` : 'Grading in progress'}
                          </div>
                          <small style={{ fontStyle: 'italic', color: '#555d78', lineHeight: 1.5 }}>
                            "{sub.feedback || 'Pending teacher review.'}"
                          </small>
                          <small style={{ marginTop: '6px', color: '#9299ad' }}>
                            Your notes: "{sub.notes}"
                          </small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {activeHw && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleSubmit}>
            <div className="modal-head">
              <div>
                <h3>Submit Assignment</h3>
                <p>{activeHw.title}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setActiveHw(null)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Document / Drive Link (Optional)
              <input
                type="url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://drive.google.com/... or cloud document link"
              />
            </label>

            <label className="input-label">
              Student Completion Notes & Questions
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe which problems you solved or note any difficulties..."
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
              Submit Assignment
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
