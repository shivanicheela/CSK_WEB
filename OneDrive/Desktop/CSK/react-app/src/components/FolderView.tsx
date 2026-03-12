import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { isUserAdmin } from '../firebase/firestore.ts'
import { RESOURCE_CATEGORIES, ExamType, LevelType, MockTestType, getSubjects, getMockTestItems } from '../utils/folderStructure'

interface FolderItem {
  name: string
  id: string
  isOpen: boolean
  children?: FolderItem[]
}

export default function FolderView({
  category,
  onStartTest,
  allowedExams = []
}: {
  category: 'study-material' | 'recorded-lectures' | 'mock-tests'
  onStartTest?: (testId: string, testName: string) => void
  allowedExams?: string[]
}) {
  // Default to the first allowed exam, or UPSC if no restriction
  const defaultExam: ExamType =
    allowedExams.length > 0 && !allowedExams.includes('BOTH')
      ? (allowedExams[0] as ExamType)
      : 'UPSC'

  const [selectedExam, setSelectedExam] = useState<ExamType>(defaultExam)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [checkedFolders, setCheckedFolders] = useState<Set<string>>(new Set())
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const categoryInfo = RESOURCE_CATEGORIES.find(c => c.id === category)

  const selectedLabels = useMemo(() => {
    const selected: string[] = []
    checkedFolders.forEach((id) => {
      // Handle mock test folders
      if (id.includes('-full-length')) {
        selected.push(`${selectedExam} - Full Length Mock Test`)
        return
      }
      if (id.includes('-subject-specific')) {
        selected.push(`${selectedExam} - Subject Specific Mock Test`)
        return
      }

      // Handle regular prelims/mains folders
      if (id.includes('-prelims')) {
        selected.push(`${selectedExam} - Prelims`)
        return
      }
      if (id.includes('-mains')) {
        selected.push(`${selectedExam} - Mains`)
        return
      }

      // Handle individual items
      if (category === 'mock-tests') {
        // Mock test items
        if (id.includes('full-length')) {
          const parts = id.split('-')
          const idx = Number(parts[parts.length - 1])
          if (!Number.isNaN(idx)) {
            const test = getMockTestItems(selectedExam, 'Full Length Mock Test')[idx]
            if (test) {
              selected.push(`${selectedExam} - ${test}`)
            }
          }
        } else if (id.includes('subject-specific')) {
          const parts = id.split('-')
          const idx = Number(parts[parts.length - 1])
          if (!Number.isNaN(idx)) {
            const test = getMockTestItems(selectedExam, 'Subject Specific Mock Test')[idx]
            if (test) {
              selected.push(`${selectedExam} - ${test}`)
            }
          }
        }
      } else {
        // Regular subjects
        const [levelPrefix, idxRaw] = id.split('-').slice(-2)
        const level = levelPrefix === 'prelims' ? 'Prelims' : levelPrefix === 'mains' ? 'Mains' : null
        const idx = Number(idxRaw)
        if (!level || Number.isNaN(idx)) return

        const subject = getSubjects(selectedExam, level as LevelType)[idx]
        if (subject) {
          selected.push(`${selectedExam} - ${level} - ${subject}`)
        }
      }
    })
    return selected
  }, [checkedFolders, selectedExam, category])

  const selectedCount = checkedFolders.size

  const handleDownloadSelected = () => {
    setActionMessage(null)

    if (selectedLabels.length === 0) {
      setActionMessage('Select at least one folder/subject before downloading.')
      return
    }

    const content = [
      `CSK ${categoryInfo?.name || 'Resources'}`,
      `Exam: ${selectedExam}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Selected Resources:',
      ...selectedLabels.map((label, index) => `${index + 1}. ${label}`)
    ].join('\n')

    const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const objectUrl = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `csk-${category}-${selectedExam}-resources.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
    setActionMessage(`Downloaded ${selectedLabels.length} selected item(s).`)
  }

  const handleUploadResources = async () => {
    setActionMessage(null)
    setIsCheckingAdmin(true)

    try {
      if (!user?.uid) {
        setActionMessage('Please login to upload resources.')
        return
      }

      const admin = await isUserAdmin(user.uid)
      if (!admin) {
        setActionMessage('Only admin accounts can upload resources.')
        return
      }

      // Route upload flow by selected tab type.
      if (category === 'recorded-lectures') {
        navigate('/upload-video')
        return
      }

      navigate('/upload-course')
    } catch (error) {
      console.error('Upload action failed:', error)
      setActionMessage('Could not open upload page right now. Please try again.')
    } finally {
      setIsCheckingAdmin(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const toggleCheck = (folderId: string) => {
    const newChecked = new Set(checkedFolders)
    if (newChecked.has(folderId)) {
      newChecked.delete(folderId)
    } else {
      newChecked.add(folderId)
    }
    setCheckedFolders(newChecked)
  }

  const renderSubjects = (exam: ExamType, level: LevelType, levelId: string) => {
    const subjects = getSubjects(exam, level)
    const isLevelExpanded = expandedFolders.has(levelId)

    return (
      <div key={levelId} className="mb-3">
        {/* Level Folder (Prelims / Mains) */}
        <div
          onClick={() => toggleFolder(levelId)}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-all"
        >
          <input
            type="checkbox"
            checked={checkedFolders.has(levelId)}
            onChange={() => toggleCheck(levelId)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-2xl">{isLevelExpanded ? '📂' : '📁'}</span>
          <span className="font-bold text-gray-700 dark:text-gray-200 flex-1">{level}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{subjects.length} subjects</span>
          <span className="text-gray-400 text-sm">{isLevelExpanded ? '▲' : '▼'}</span>
        </div>

        {/* Subject Folders inside Level */}
        {isLevelExpanded && (
          <div className="mt-2 ml-6 space-y-2 border-l-2 border-indigo-300 pl-4">
            {subjects.map((subject, idx) => {
              const subjectId = `${levelId}-${idx}`
              const isSubjectExpanded = expandedFolders.has(subjectId)
              return (
                <div key={subjectId}>
                  {/* Subject Folder Row */}
                  <div
                    onClick={() => toggleFolder(subjectId)}
                    className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checkedFolders.has(subjectId)}
                      onChange={() => toggleCheck(subjectId)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-lg">{isSubjectExpanded ? '📂' : '📁'}</span>
                    <span className="text-gray-700 dark:text-gray-200 font-semibold flex-1">{subject}</span>
                    <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium hidden sm:inline">
                      {exam} › {level}
                    </span>
                    {/* Upload button visible directly on folder row for admins */}
                    {category !== 'mock-tests' && isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const route = category === 'recorded-lectures' ? '/upload-video' : '/upload-course'
                          navigate(route, { state: { exam, level, subject } })
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-all"
                      >
                        + Upload
                      </button>
                    )}
                    <span className="text-gray-400 text-xs">{isSubjectExpanded ? '▲' : '▼'}</span>
                  </div>

                  {/* Inside Subject Folder — file list */}
                  {isSubjectExpanded && (
                    <div className="ml-6 mt-1 mb-2 border-l-2 border-indigo-200 pl-4 space-y-1">
                      <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-dashed border-indigo-300 dark:border-indigo-600 text-sm text-gray-500 dark:text-gray-400">
                        <span>📄</span>
                        <span className="flex-1 italic">No files uploaded yet</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderMockTests = (exam: ExamType, testType: MockTestType, testTypeId: string) => {
    const tests = getMockTestItems(exam, testType)
    const isExpanded = expandedFolders.has(testTypeId)

    return (
      <div key={testTypeId} className="mb-3">
        {/* Test Type Folder */}
        <div
          onClick={() => toggleFolder(testTypeId)}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-all"
        >
          <input
            type="checkbox"
            checked={checkedFolders.has(testTypeId)}
            onChange={() => toggleCheck(testTypeId)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-2xl">{isExpanded ? '📂' : '📁'}</span>
          <span className="font-bold text-gray-700 dark:text-gray-200 flex-1">{testType}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{tests.length} tests</span>
        </div>

        {/* Tests List */}
        {isExpanded && (
          <div className="mt-2 ml-6 space-y-2 border-l-2 border-indigo-300 dark:border-indigo-700 pl-4">
            {tests.map((test, idx) => {
              const testId = `${testTypeId}-${idx}`
              return (
                <div
                  key={testId}
                  className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checkedFolders.has(testId)}
                    onChange={() => toggleCheck(testId)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-lg">📝</span>
                  <span className="text-gray-700 dark:text-gray-200 font-medium flex-1">{test}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onStartTest) {
                        onStartTest(testId, test)
                      } else {
                        alert(`Starting mock test: ${test}\n\nTest handler not configured.`)
                      }
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-all"
                  >
                    Start Test
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{categoryInfo?.icon}</span>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{categoryInfo?.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{categoryInfo?.description}</p>
          </div>
        </div>

        {/* Exam Selector */}
        <div className="flex gap-3 flex-wrap">
          {(['UPSC', 'TNPSC'] as ExamType[]).map(exam => {
            const hasAccess = allowedExams.length === 0 || allowedExams.includes(exam) || allowedExams.includes('BOTH')
            return (
              <button
                key={exam}
                onClick={() => {
                  if (!hasAccess) {
                    setActionMessage(`🔒 You are not enrolled in ${exam}. Please contact us to upgrade your plan.`)
                    return
                  }
                  setSelectedExam(exam)
                  setExpandedFolders(new Set())
                  setCheckedFolders(new Set())
                  setActionMessage(null)
                }}
                className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  selectedExam === exam && hasAccess
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : hasAccess
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {!hasAccess && <span>🔒</span>}
                {exam}
              </button>
            )
          })}
        </div>
      </div>

      {/* Folder Structure */}
      <div className="space-y-4">
        {category === 'mock-tests' ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📝</span> Full Length Mock Test
              </h3>
              {renderMockTests(selectedExam, 'Full Length Mock Test', `${selectedExam}-full-length`)}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📊</span> Subject Specific Mock Test
              </h3>
              {renderMockTests(selectedExam, 'Subject Specific Mock Test', `${selectedExam}-subject-specific`)}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📚</span> Prelims
              </h3>
              {renderSubjects(selectedExam, 'Prelims', `${selectedExam}-prelims`)}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📖</span> Mains
              </h3>
              {renderSubjects(selectedExam, 'Mains', `${selectedExam}-mains`)}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Selected: {selectedCount}</span>
        {actionMessage && <span className="text-indigo-700 dark:text-indigo-400 font-medium">{actionMessage}</span>}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={handleDownloadSelected}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <span>⬇️</span> Download Selected
        </button>
        <button
          type="button"
          onClick={handleUploadResources}
          disabled={isCheckingAdmin}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>📤</span> {isCheckingAdmin ? 'Checking Access...' : 'Upload Resources'}
        </button>
      </div>
    </div>
  )
}
