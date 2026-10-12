import React, { useState } from 'react'
import { BookMarked, Download, FileText, Search } from 'lucide-react'
import { AppShell } from '../../components/common/AppShell'
import { Panel } from '../../components/common/Panel'

interface MaterialItem {
  id: string
  title: string
  subject: string
  type: string
  size: string
  downloadUrl: string
}

export const MaterialsView: React.FC = () => {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const materials: MaterialItem[] = [
    {
      id: 'mat-1',
      title: 'Fractions & Mixed Numbers Revision Sheet',
      subject: 'Mathematics',
      type: 'PDF Worksheet',
      size: '1.2 MB',
      downloadUrl: '#',
    },
    {
      id: 'mat-2',
      title: 'Ratio & Proportions Visual Cheat Sheet',
      subject: 'Mathematics',
      type: 'Reference Guide',
      size: '850 KB',
      downloadUrl: '#',
    },
    {
      id: 'mat-3',
      title: 'Cell Organelles & Biological Functions Diagram',
      subject: 'Science',
      type: 'Illustrated Poster',
      size: '2.4 MB',
      downloadUrl: '#',
    },
    {
      id: 'mat-4',
      title: 'English Vocabulary & Transition Words Guide',
      subject: 'English',
      type: 'Writing Handbook',
      size: '980 KB',
      downloadUrl: '#',
    },
  ]

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
      subtitle="Curated worksheets, formula reference guides and lesson revision sheets."
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
                    onClick={() => alert(`Downloading ${mat.title} (Verified Demo Resource)`)}
                  >
                    <Download size={13} /> Download
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
