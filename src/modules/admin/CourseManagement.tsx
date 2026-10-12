import React, { useEffect, useState } from 'react'
import { BookOpen, Plus, X, Check, Search } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { DataService } from '../../lib/dataService'
import { Course } from '../../types'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { courseSchema } from '../../lib/validation'
import { useAuth } from '../../lib/authContext'

export const CourseManagement: React.FC = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('Mathematics')
  const [gradeLevel, setGradeLevel] = useState('Grade 8')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('published')

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const list = await DataService.getCourses()
      setCourses(list)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = courseSchema.safeParse({
      title,
      subject,
      grade_level: gradeLevel,
      description,
      status,
    })

    if (!parseResult.success) {
      setError(parseResult.error.issues[0].message)
      return
    }

    try {
      const created = await DataService.createCourse(
        {
          title,
          subject,
          grade_level: gradeLevel,
          description,
          status,
          created_by: user?.id,
        },
        user
      )

      setCourses([created, ...courses])
      setNotice(`Created course: ${created.title}!`)
      setModalOpen(false)
      setTitle('')
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Course creation failed.')
    }
  }

  const handleStatusToggle = async (courseId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    await DataService.updateCourseStatus(courseId, nextStatus, user)
    setCourses(courses.map((c) => (c.id === courseId ? { ...c, status: nextStatus } : c)))
    setNotice(`Updated status to ${nextStatus.toUpperCase()}`)
  }

  return (
    <AppShell
      title="Curriculum & Course Catalogue"
      subtitle="Define curriculum packages, grade level standards and syllabus descriptions."
      activeRole="admin"
    >
      {notice && (
        <div className="inline-notice">
          <Check size={16} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading courses..." />
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
            <Panel
              title="Course Catalogue Units"
              subtitle="All published and draft learning curricula."
              action={
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setModalOpen(true)}
                  style={{ padding: '8px 12px', fontSize: '10px' }}
                >
                  <Plus size={13} /> Add New Course
                </button>
              }
            >
              {courses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Courses Created Yet"
                  description="Get started by adding your first curriculum package or syllabus module."
                  action={
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setModalOpen(true)}
                      style={{ padding: '8px 14px', fontSize: '10px' }}
                    >
                      <Plus size={12} /> Add New Course
                    </button>
                  }
                />
              ) : (
                <div className="data-list">
                  {courses.map((c) => (
                    <div key={c.id} className="data-row" style={{ padding: '16px 0' }}>
                      <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                        <BookOpen size={16} />
                      </div>
                      <div className="data-main">
                        <b>{c.title} · {c.grade_level}</b>
                        <small style={{ marginTop: '3px' }}>{c.description}</small>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(c.id, c.status)}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: 0,
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: c.status === 'published' ? '#e6f8ec' : '#fff4df',
                          color: c.status === 'published' ? '#24845a' : '#93651a',
                          cursor: 'pointer',
                        }}
                      >
                        {c.status}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleCreateCourse}>
            <div className="modal-head">
              <div>
                <h3>Add Curriculum Unit</h3>
                <p>Publish a new syllabus to the platform catalogue</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <label className="input-label">
              Course Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Geometry Proofs & Coordinate Systems"
              />
            </label>

            <div className="form-grid-2">
              <label className="input-label">
                Subject
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Coding">Coding</option>
                </select>
              </label>

              <label className="input-label">
                Grade Level
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </label>
            </div>

            <label className="input-label">
              Curriculum Description
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of concepts taught, learning goals, and expectations..."
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
              Publish Status
              <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>

            {error && <div className="error">{error}</div>}

            <button className="button button-primary button-full" type="submit">
              Save Course
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
