import React, { useState } from 'react'
import { BookMarked, Download, Search, Plus, X } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'
import { EmptyState } from '../../components/common/EmptyState'

interface MaterialItem {
  id: string
  title: string
  subject: string
  type: string
  size: string
  downloadUrl: string
}

const STORAGE_KEY = 'beetorial_study_materials'

function loadMaterials(): MaterialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>(loadMaterials)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = materials.filter((m) => {
    const matchesFilter = filter === 'All' || m.subject === filter
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <AppShell
      title="Study Materials & Class Resources"
      subtitle="Worksheets, formula reference guides and lesson revision sheets."
      activeRole="student"
    >
      <div className="dashboard-grid">
        <div className="dashboard-col" style={{ gridColumn: '1 / -1' }}>
          <Panel
            title="Resource Library"
            subtitle="Uploaded by your tutors for home study and review."
            action={
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Mathematics', 'Science', 'English'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className="subtle-button"
                    onClick={() => setFilter(sub)}
                    style={{
                      background: filter === sub ? 'var(--purple)' : '#ffffff',
                      color: filter === sub ? '#ffffff' : 'var(--ink)',
                      borderColor: filter === sub ? 'var(--purple)' : '#e9eaf4',
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            }
          >
            <div className="table-search" style={{ marginBottom: '16px' }}>
              <Search size={14} />
              <input
                placeholder="Search study materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '24px 0' }}>
                <EmptyState
                  icon={BookMarked}
                  title="No study materials available"
                  description="Worksheets, formula reference cards and revision packs will appear here once shared by your teachers."
                />
              </div>
            ) : (
              <div className="data-list">
                {filtered.map((mat) => (
                  <div key={mat.id} className="data-row" style={{ padding: '14px 0' }}>
                    <div className="data-mark" style={{ background: '#f5f3ff', color: 'var(--purple)' }}>
                      <BookMarked size={16} />
                    </div>
                    <div className="data-main">
                      <b>{mat.title}</b>
                      <small>
                        {mat.subject} · {mat.type} · {mat.size}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="subtle-button"
                      onClick={() => alert(`Accessing verified resource: ${mat.title}`)}
                    >
                      <Download size={13} /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
