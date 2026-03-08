import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

type Props = {
  title: string
  description: string
  price?: string
  theme?: 'upsc' | 'tnpsc'
  features?: string[]
  courseId?: string
}

export default function CourseCard({ title, description, price, theme = 'upsc', features = [], courseId }: Props) {
  const navigate = useNavigate()
  const { user, enrolledCourses, loading } = useAuth()

  const themeColors = {
    upsc: { bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-200', button: 'bg-indigo-600 hover:bg-indigo-700', text: 'text-indigo-600' },
    tnpsc: { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', button: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-emerald-600' }
  }
  const colors = themeColors[theme]

  const courseType = theme.toUpperCase()
  const isLoggedIn = !!user && !loading
  const isEnrolled = isLoggedIn && (enrolledCourses.includes(courseType) || enrolledCourses.includes('BOTH'))
  // Locked = logged in, has paid for something, but NOT this course
  const isLocked = isLoggedIn && enrolledCourses.length > 0 && !isEnrolled

  const handleEnroll = () => {
    navigate('/payment', {
      state: { title, price: price || 'Contact', courseType, courseId: courseId || '' }
    })
  }

  const handleAccess = () => navigate(theme === 'upsc' ? '/upsc' : '/tnpsc')

  return (
    <div className={`relative rounded-2xl border-2 ${colors.border} bg-gradient-to-br ${colors.bg} p-8 shadow-lg transition-all hover:shadow-2xl transform hover:translate-y-[-4px] overflow-hidden`}>

      {/* 🔒 Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🔒</div>
          <h4 className="text-lg font-black text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 mb-1">Payment Required</p>
          <p className="text-xs text-gray-500 mb-4">You're enrolled in a different program.<br/>Purchase this course to unlock access.</p>
          <div className={`text-xl font-black ${colors.text} mb-4`}>{price || 'Contact'}</div>
          <button
            onClick={handleEnroll}
            className={`px-6 py-2 rounded-lg ${colors.button} text-white font-bold transition-all transform hover:scale-105 shadow-md text-sm`}
          >
            Enroll Now
          </button>
        </div>
      )}

      {/* ✅ Enrolled Badge */}
      {isEnrolled && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-100 border border-green-300 text-green-700 text-xs font-bold px-3 py-1 rounded-full z-10">
          ✅ Enrolled
        </div>
      )}

      {/* Card Content (always rendered, blurred behind overlay when locked) */}
      <h3 className={`text-2xl font-black ${colors.text}`}>{title}</h3>
      <p className="mt-3 text-gray-700 leading-relaxed">{description}</p>

      {features.length > 0 && (
        <div className="mt-6 space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-700">
              <span className={`${colors.text} font-bold`}>✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <div className={`text-2xl font-black ${colors.text}`}>{price || 'Contact'}</div>
        {isEnrolled ? (
          <button
            onClick={handleAccess}
            className={`px-6 py-2 rounded-lg ${colors.button} text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-md`}
          >
            Access Course
          </button>
        ) : (
          <button
            onClick={handleEnroll}
            className={`px-6 py-2 rounded-lg ${colors.button} text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-md`}
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  )
}
