// Folder Structure for Study Materials, Recorded Lectures, and Mock Tests

export const FOLDER_STRUCTURE = {
  UPSC: {
    Prelims: [
      'Indian Polity',
      'History',
      'Indian Economy',
      'Geography',
      'Environment',
      'Science and Tech',
      'Current Affairs',
      'CSAT'
    ],
    Mains: [
      'GS 1',
      'GS 2',
      'GS 3',
      'GS 4'
    ]
  },
  TNPSC: {
    Prelims: [
      'Indian Polity',
      'History (Indian History + INM + TN History)',
      'Geography',
      'Indian Economy',
      'Unit 9',
      'Current Affairs',
      'Aptitude'
    ],
    Mains: [
      'GS 1',
      'GS 2',
      'GS 3'
    ]
  }
}

export const RESOURCE_CATEGORIES = [
  {
    id: 'study-material',
    name: 'Study Material',
    icon: '📚',
    description: 'PDFs, Notes, and Study Documents'
  },
  {
    id: 'recorded-lectures',
    name: 'Recorded Lectures',
    icon: '🎥',
    description: 'Video Lectures and Recordings'
  },
  {
    id: 'mock-tests',
    name: 'Mock Tests',
    icon: '✅',
    description: 'Practice Tests and Assessments'
  }
]

export type ExamType = 'UPSC' | 'TNPSC'
export type LevelType = 'Prelims' | 'Mains'

export const getSubjects = (exam: ExamType, level: LevelType): string[] => {
  return FOLDER_STRUCTURE[exam]?.[level] || []
}
