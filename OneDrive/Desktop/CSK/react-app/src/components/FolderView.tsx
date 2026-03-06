import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { isUserAdmin } from '../firebase/firestore.ts'
import { RESOURCE_CATEGORIES, ExamType, LevelType, getSubjects } from '../utils/folderStructure'

interface FolderItem {
  name: string
  id: string
  isOpen: boolean
  children?: FolderItem[]
}

export default function FolderView({ category }: { category: 'study-material' | 'recorded-lectures' | 'mock-tests' }) {
  const [selectedExam, setSelectedExam] = useState<ExamType>('UPSC')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [checkedFolders, setCheckedFolders] = useState<Set<string>>(new Set())
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const categoryInfo = RESOURCE_CATEGORIES.find(c => c.id === category)

  const selectedLabels = useMemo(() => {
    const selected: string[] = []
    checkedFolders.forEach((id) => {
      if (id.includes('-prelims')) {
        selected.push(`${selectedExam} - Prelims`)
        return
      }
      if (id.includes('-mains')) {
        selected.push(`${selectedExam} - Mains`)
        return
      }

      const [levelPrefix, idxRaw] = id.split('-').slice(-2)
      const level = levelPrefix === 'prelims' ? 'Prelims' : levelPrefix === 'mains' ? 'Mains' : null
      const idx = Number(idxRaw)
      if (!level || Number.isNaN(idx)) return

      const subject = getSubjects(selectedExam, level as LevelType)[idx]
      if (subject) {
        selected.push(`${selectedExam} - ${level} - ${subject}`)
      }
    })
    return selected
  }, [checkedFolders, selectedExam])

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
    const isExpanded = expandedFolders.has(levelId)

    return (
      <div key={levelId} className="mb-3">
        {/* Level Folder */}
        <div 
          onClick={() => toggleFolder(levelId)}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all"
        >
          <input
            type="checkbox"
            checked={checkedFolders.has(levelId)}
            onChange={() => toggleCheck(levelId)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-2xl">{isExpanded ? '📂' : '📁'}</span>
          <span className="font-bold text-gray-700 flex-1">{level}</span>
          <span className="text-sm text-gray-500">{subjects.length} subjects</span>
        </div>

        {/* Subjects List */}
        {isExpanded && (
          <div className="mt-2 ml-6 space-y-2 border-l-2 border-indigo-300 pl-4">
            {subjects.map((subject, idx) => {
              const subjectId = `${levelId}-${idx}`
              return (
                <div
                  key={subjectId}
                  className="flex items-center gap-3 p-2 bg-indigo-50 rounded-lg border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={checkedFolders.has(subjectId)}
                    onChange={() => toggleCheck(subjectId)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-lg">📄</span>
                  <span className="text-gray-700 font-medium">{subject}</span>
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
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{categoryInfo?.icon}</span>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{categoryInfo?.name}</h2>
            <p className="text-sm text-gray-600">{categoryInfo?.description}</p>
          </div>
        </div>

        {/* Exam Selector */}
        <div className="flex gap-3">
          {(['UPSC', 'TNPSC'] as ExamType[]).map(exam => (
            <button
              key={exam}
              onClick={() => {
                setSelectedExam(exam)
                setExpandedFolders(new Set())
                setCheckedFolders(new Set())
                setActionMessage(null)
              }}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                selectedExam === exam
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>
      </div>

      {/* Folder Structure */}
      <div className="space-y-4">
        {/* Prelims Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📚</span> Prelims
          </h3>
          {renderSubjects(selectedExam, 'Prelims', `${selectedExam}-prelims`)}
        </div>

        {/* Mains Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📖</span> Mains
          </h3>
          {renderSubjects(selectedExam, 'Mains', `${selectedExam}-mains`)}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-600">Selected: {selectedCount}</span>
        {actionMessage && <span className="text-indigo-700 font-medium">{actionMessage}</span>}
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
