import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

interface SubFolder { name: string }
interface Folder { name: string; color: string; subFolders: SubFolder[] }
interface CourseConfig { id: string; title: string; folders: Folder[] }

const TNPSC_PRELIMS_SUBS = [
  { name: 'Polity' },
  { name: 'Indian Economy' },
  { name: 'History (Indian History + INM + TN History)' },
  { name: 'Unit 9' },
  { name: 'Geography' },
  { name: 'Current Affairs' },
  { name: 'Aptitude' },
]

const UPSC_PRELIMS_SUBS = [
  { name: 'Polity' },
  { name: 'Indian Economy' },
  { name: 'History (Ancient + Medieval + Modern)' },
  { name: 'Geography' },
  { name: 'Environment' },
  { name: 'Science and Tech' },
  { name: 'Current Affairs' },
  { name: 'CSAT' },
]

const MAINS_SUBS = [
  { name: 'GS – 1' },
  { name: 'GS – 2' },
  { name: 'GS – 3' },
  { name: 'GS – 4' },
]

const COURSE_CONFIGS: CourseConfig[] = [
  // Course 1: TNPSC Group 1 Prelims
  {
    id: 'tnpsc-prelims',
    title: 'TNPSC Group 1 Prelims',
    folders: [
      { name: 'Recorded Sessions', color: '#F59E0B', subFolders: TNPSC_PRELIMS_SUBS },
      { name: 'Study Materials',   color: '#3B82F6', subFolders: TNPSC_PRELIMS_SUBS },
    ],
  },
  // Course 2: TNPSC Group 1 Prelims + Mains
  {
    id: 'tnpsc-prelims-mains',
    title: 'TNPSC Group 1 Prelims + Mains',
    folders: [
      { name: 'Prelims',        color: '#F59E0B', subFolders: TNPSC_PRELIMS_SUBS },
      { name: 'Mains',          color: '#F97316', subFolders: MAINS_SUBS },
      { name: 'Study Materials', color: '#3B82F6', subFolders: [
        ...TNPSC_PRELIMS_SUBS,
        { name: 'GS-1' }, { name: 'GS-2' }, { name: 'GS-3' }, { name: 'GS-4' },
      ]},
    ],
  },
  // Course 3: TNPSC Personal Mentorship (same as Course 2)
  {
    id: 'tnpsc-mentorship',
    title: 'TNPSC Personal Mentorship',
    folders: [
      { name: 'Prelims',        color: '#F59E0B', subFolders: TNPSC_PRELIMS_SUBS },
      { name: 'Mains',          color: '#F97316', subFolders: MAINS_SUBS },
      { name: 'Study Materials', color: '#3B82F6', subFolders: [
        ...TNPSC_PRELIMS_SUBS,
        { name: 'GS-1' }, { name: 'GS-2' }, { name: 'GS-3' }, { name: 'GS-4' },
      ]},
    ],
  },
  // Course 4: UPSC CSE Prelims
  {
    id: 'upsc-prelims',
    title: 'UPSC CSE Prelims',
    folders: [
      { name: 'Recorded Sessions', color: '#F59E0B', subFolders: UPSC_PRELIMS_SUBS },
      { name: 'Study Materials',   color: '#3B82F6', subFolders: UPSC_PRELIMS_SUBS },
    ],
  },
  // Course 5: UPSC CSE Prelims + Mains
  {
    id: 'upsc-prelims-mains',
    title: 'UPSC CSE Prelims + Mains',
    folders: [
      { name: 'Prelims',        color: '#F59E0B', subFolders: UPSC_PRELIMS_SUBS },
      { name: 'Mains',          color: '#F97316', subFolders: MAINS_SUBS },
      { name: 'Study Materials', color: '#3B82F6', subFolders: [
        ...UPSC_PRELIMS_SUBS,
        { name: 'GS-1' }, { name: 'GS-2' }, { name: 'GS-3' }, { name: 'GS-4' },
      ]},
    ],
  },
  // Course 6: UPSC Personal Mentorship (same as Course 5)
  {
    id: 'upsc-mentorship',
    title: 'UPSC Personal Mentorship',
    folders: [
      { name: 'Prelims',        color: '#F59E0B', subFolders: UPSC_PRELIMS_SUBS },
      { name: 'Mains',          color: '#F97316', subFolders: MAINS_SUBS },
      { name: 'Study Materials', color: '#3B82F6', subFolders: [
        ...UPSC_PRELIMS_SUBS,
        { name: 'GS-1' }, { name: 'GS-2' }, { name: 'GS-3' }, { name: 'GS-4' },
      ]},
    ],
  },
]

// Folder SVG icon
function FolderSVG({ color }: { color: string }) {
  return (
    <svg width="44" height="36" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 6C0 4.34315 1.34315 3 3 3H16L20 8H41C42.6569 8 44 9.34315 44 11V33C44 34.6569 42.6569 36 41 36H3C1.34315 36 0 34.6569 0 33V6Z" fill={color} />
      <path d="M0 11C0 9.34315 1.34315 8 3 8H41C42.6569 8 44 9.34315 44 11V33C44 34.6569 42.6569 36 41 36H3C1.34315 36 0 34.6569 0 33V11Z" fill={color} opacity="0.85" />
      <rect x="4" y="12" width="36" height="20" rx="1" fill="white" opacity="0.25" />
    </svg>
  )
}

export default function CourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { enrolledCourses } = useAuth()
  const [openFolder, setOpenFolder] = useState<number | null>(null)

  const course = COURSE_CONFIGS.find(c => c.id === courseId)

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Course not found.</p>
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!enrolledCourses.includes(courseId!)) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 48, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Access Restricted</h2>
          <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
            You haven't enrolled in <strong>{course.title}</strong> yet. Please complete payment to access this course.
          </p>
          <button onClick={() => navigate('/payment')}
            style={{ width: '100%', padding: '12px 0', background: '#4f46e5', color: '#fff', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', marginBottom: 10, fontSize: 15 }}>
            Enrol Now →
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '12px 0', background: '#f3f4f6', color: '#374151', fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 15 }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', isolation: 'isolate' }}>
      {/* Breadcrumb bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>
        <span style={{ color: '#d1d5db', fontSize: 14 }}>/</span>
        <span style={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>{course.title}</span>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px' }}>
        {/* Course title */}
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{course.title}</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 32 }}>
          {course.folders.length} folder{course.folders.length !== 1 ? 's' : ''} · Click a folder to browse contents
        </p>

        {/* Folders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {course.folders.map((folder, fIdx) => {
            const isOpen = openFolder === fIdx
            const isLast = fIdx === course.folders.length - 1
            return (
              <div key={fIdx}>
                {/* Folder row */}
                <button
                  onClick={() => setOpenFolder(isOpen ? null : fIdx)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 24px', background: isOpen ? '#f8faff' : '#fff',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: (!isLast || isOpen) ? '1px solid #e5e7eb' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8faff')}
                  onMouseLeave={e => (e.currentTarget.style.background = isOpen ? '#f8faff' : '#fff')}
                >
                  <FolderSVG color={folder.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 15, margin: 0 }}>{folder.name}</p>
                    <p style={{ color: '#9ca3af', fontSize: 12, margin: '3px 0 0 0' }}>
                      {folder.subFolders.length} sub-folder{folder.subFolders.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <svg
                    width="18" height="18" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Sub-folders */}
                {isOpen && (
                  <div style={{ background: '#fafafa' }}>
                    {folder.subFolders.map((sub, sIdx) => (
                      <div key={sIdx}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '14px 24px 14px 48px',
                          borderBottom: sIdx < folder.subFolders.length - 1 ? '1px solid #f0f0f0' : (isLast ? 'none' : '1px solid #e5e7eb'),
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Blue subfolder icon */}
                        <div style={{ width: 40, height: 36, flexShrink: 0 }}>
                          <FolderSVG color="#3B82F6" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, color: '#1f2937', fontSize: 14, margin: 0 }}>{sub.name}</p>
                          <p style={{ color: '#9ca3af', fontSize: 12, margin: '2px 0 0 0' }}>0 video(s), 0 file(s)</p>
                        </div>
                        <svg width="14" height="14" fill="none" stroke="#d1d5db" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 32 }}>
          Content is uploaded by the admin. Check back regularly for new materials.
        </p>
      </div>
    </div>
  )
}
