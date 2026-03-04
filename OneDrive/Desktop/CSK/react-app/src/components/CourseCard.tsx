import React from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  title: string
  description: string
  price?: string
  theme?: 'upsc' | 'tnpsc'
  features?: string[]
  courseId?: string
}

export default function CourseCard({title, description, price, theme='upsc', features=[], courseId}: Props){
  const navigate = useNavigate()
  const themeColors = {
    upsc: { bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-200', button: 'bg-indigo-600 hover:bg-indigo-700', text: 'text-indigo-600' },
    tnpsc: { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', button: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-emerald-600' }
  }
  const colors = themeColors[theme]

  return (
    <div className={`rounded-2xl border-2 ${colors.border} bg-gradient-to-br ${colors.bg} p-8 shadow-lg hover:shadow-2xl transition-all transform hover:translate-y-[-8px]`}>
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
        <button 
          onClick={() => courseId ? navigate(`/courses/${courseId}`) : navigate('/login')}
          className={`px-6 py-2 rounded-lg ${colors.button} text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-md`}
        >
          Enroll
        </button>
      </div>
    </div>
  )
}
