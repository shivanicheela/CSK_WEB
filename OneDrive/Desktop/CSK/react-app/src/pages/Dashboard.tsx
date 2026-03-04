import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { logout } from '../firebase/auth.ts'
import { getStudentStats, getVideosWatchedByUser, getMockTestScoresByUser } from '../firebase/firestore.ts'
import { initProtections } from '../utils/protections'

interface Stats {
  totalHoursWatched: number
  videosWatched: number
  mockTestsCompleted: number
  averageTestScore: number
  currentStreak: number
  allTestScores: any[]
}

export default function Dashboard(){
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  
  // State for dynamic data
  const [stats, setStats] = useState<Stats | null>(null)
  const [videosWatched, setVideosWatched] = useState<any[]>([])
  const [testScores, setTestScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(()=>{
    if (user?.email) {
      initProtections(user.email)
    }
  },[user])

  // Fetch student stats and progress
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.uid) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all stats with error handling
        try {
          const studentStats = await getStudentStats(user.uid)
          setStats(studentStats)
        } catch (statsErr) {
          console.warn('⚠️ Could not fetch stats, using defaults:', statsErr)
          // Use default stats for new users
          setStats({
            totalHoursWatched: 0,
            videosWatched: 0,
            mockTestsCompleted: 0,
            averageTestScore: 0,
            currentStreak: 0,
            allTestScores: []
          })
        }
        
        // Fetch videos watched with error handling
        try {
          const videos = await getVideosWatchedByUser(user.uid)
          setVideosWatched(videos)
        } catch (videosErr) {
          console.warn('⚠️ Could not fetch videos, using empty array:', videosErr)
          setVideosWatched([])
        }
        
        // Fetch test scores with error handling
        try {
          const scores = await getMockTestScoresByUser(user.uid)
          setTestScores(scores)
        } catch (scoresErr) {
          console.warn('⚠️ Could not fetch test scores, using empty array:', scoresErr)
          setTestScores([])
        }
        
        // Clear error if we successfully loaded with defaults
        setError(null)
        
      } catch (err: any) {
        console.error('Failed to fetch student data:', err)
        // Don't show error - just use defaults
        setStats({
          totalHoursWatched: 0,
          videosWatched: 0,
          mockTestsCompleted: 0,
          averageTestScore: 0,
          currentStreak: 0,
          allTestScores: []
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudentData()
  }, [user?.uid])

  // ============================================
  // HANDLE LOGOUT
  // ============================================
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  // ============================================
  // HANDLE DOWNLOAD
  // ============================================
  const handleDownload = (material: any) => {
    // Create a mock download (in real app, this would download from Firebase Storage)
    const mockPdfs: any = {
      1: 'GS_Paper_1_Study_Notes.pdf',
      2: 'Current_Affairs_Monthly.pdf',
      3: 'Answer_Writing_Guide.pdf'
    }
    
    // Create a simple download simulation
    const fileName = mockPdfs[material.id] || `${material.title}.pdf`
    
    // Show success message
    alert(`📥 Downloading: ${fileName}\n\nFile size: ${material.size}\n\nIn a real application, this would download from cloud storage.`)
    
    // Mark as downloaded in UI
    // In a real app, this would save to database
    console.log(`Downloaded: ${fileName}`)
  }

  // Fallback data in case of loading
  const mockTests = [
    { id: 1, title: "General Studies - Paper 1", duration: "2 hrs", questions: 100, taken: true, score: 78 },
    { id: 2, title: "General Studies - Paper 2", duration: "2 hrs", questions: 100, taken: true, score: 82 },
    { id: 3, title: "General Studies - Paper 3", duration: "2 hrs", questions: 100, taken: false, score: null },
  ]

  const videos = [
    { id: 1, title: "Modern Indian History - Basics", duration: "45 min", watched: true },
    { id: 2, title: "Contemporary Events", duration: "38 min", watched: true },
    { id: 3, title: "Constitutional Framework", duration: "52 min", watched: false },
    { id: 4, title: "Indian Economy Overview", duration: "41 min", watched: false },
  ]

  const materials = [
    { id: 1, title: "GS Paper 1 Study Notes", type: "PDF", size: "2.3 MB", downloaded: true },
    { id: 2, title: "Current Affairs Monthly", type: "PDF", size: "1.8 MB", downloaded: true },
    { id: 3, title: "Answer Writing Guide", type: "PDF", size: "3.1 MB", downloaded: false },
  ]

  // Calculate progress percentages
  const videosProgressPercent = stats ? (stats.videosWatched / (stats.videosWatched + 2)) * 100 : 50
  const testsProgressPercent = stats ? (stats.mockTestsCompleted / (stats.mockTestsCompleted + 1)) * 100 : 67

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Mobile Hamburger Button - Visible on small screens */}
      <div className="fixed top-20 left-4 z-50 lg:hidden">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar - Hidden on mobile, visible on lg+ */}
      <aside className={`fixed lg:static inset-0 lg:inset-auto w-64 bg-white border-r border-gray-200 shadow-lg sticky top-0 h-screen overflow-y-auto transition-all duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.displayName || 'Student'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            📊 Overview
          </button>
          <button onClick={() => { setActiveTab('videos'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'videos' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            🎥 Video Lectures
          </button>
          <button onClick={() => { setActiveTab('lectures'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'lectures' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            📹 Recorded Lectures
          </button>
          <button onClick={() => { setActiveTab('materials'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'materials' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            📚 Study Materials
          </button>
          <button onClick={() => { setActiveTab('tests'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'tests' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            ✅ Mock Tests
          </button>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button 
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? '⏳ Logging out...' : '🚪 Logout'}
          </button>
        </div>

        <div className="p-4 m-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <p className="font-bold text-indigo-900 text-sm">📈 Your Progress</p>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Videos Watched</span>
                <span className="font-bold text-indigo-600">{stats?.videosWatched || 0}/{stats ? (stats.videosWatched + 2) : 2}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${videosProgressPercent}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Tests Taken</span>
                <span className="font-bold text-indigo-600">{stats?.mockTestsCompleted || 0}/{stats ? (stats.mockTestsCompleted + 1) : 1}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${testsProgressPercent}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold"
          >
            ← Back to Home
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900">Welcome Back, {user?.displayName || 'Student'}! 👋</h1>
              <p className="mt-2 text-gray-600">Keep up the great work! You're on track for success.</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                ⚠️ {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3 mt-3"></div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 h-64 animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md">
                    <p className="text-gray-600 font-semibold text-sm">Total Hours</p>
                    <p className="text-3xl font-black text-indigo-600 mt-2">{stats?.totalHoursWatched.toFixed(1) || 0} hrs</p>
                    <p className="text-xs text-gray-500 mt-2">↑ {stats?.videosWatched || 0} videos watched</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-md">
                    <p className="text-gray-600 font-semibold text-sm">Avg Score</p>
                    <p className="text-3xl font-black text-blue-600 mt-2">{stats?.averageTestScore || 0}%</p>
                    <p className="text-xs text-gray-500 mt-2">{stats?.mockTestsCompleted || 0} tests taken</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md">
                    <p className="text-gray-600 font-semibold text-sm">Streak</p>
                    <p className="text-3xl font-black text-purple-600 mt-2">{stats?.currentStreak || 0} days</p>
                    <p className="text-xs text-gray-500 mt-2">Keep it going!</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border-2 border-pink-100 shadow-md">
                    <p className="text-gray-600 font-semibold text-sm">Rank (Est.)</p>
                    <p className="text-3xl font-black text-pink-600 mt-2">#1,245</p>
                    <p className="text-xs text-gray-500 mt-2">Top 3% 🚀</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {videosWatched.slice(0, 3).length > 0 ? (
                        <>
                          {videosWatched.slice(0, 3).map((v: any) => (
                            <div key={v.id} className="flex gap-3 pb-3 border-b border-gray-200">
                              <div className="text-2xl">▶️</div>
                              <div>
                                <p className="font-semibold text-gray-900">{v.videoTitle || 'Video'}</p>
                                <p className="text-xs text-gray-500">Watched • {v.watchedAt?.toDate?.().toLocaleDateString?.() || 'Recently'}</p>
                              </div>
                            </div>
                          ))}
                          {testScores.slice(0, 1).map((t: any) => (
                            <div key={t.id} className="flex gap-3 pb-3 border-b border-gray-200">
                              <div className="text-2xl">✅</div>
                              <div>
                                <p className="font-semibold text-gray-900">{t.testName}</p>
                                <p className="text-xs text-gray-500">Scored {t.score}% • {t.takenAt?.toDate?.().toLocaleDateString?.() || 'Recently'}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <p className="text-sm">No activity yet. Start learning!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 shadow-lg text-white">
                    <h3 className="text-lg font-black mb-4">Next Session</h3>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 mb-4">
                      <p className="font-bold text-lg">Modern Indian History - Advanced</p>
                      <p className="text-indigo-100 text-sm mt-1">📅 Tomorrow at 6:00 PM</p>
                      <p className="text-indigo-100 text-sm">👨‍🏫 Hosted by Rahul</p>
                    </div>
                    <button 
                      onClick={() => alert('📢 Reminder set! You will be notified at 5:30 PM before the session starts.')}
                      className="w-full px-4 py-3 bg-yellow-400 text-indigo-900 font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
                    >
                      Set Reminder
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Video Lectures</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex flex-col items-center justify-center gap-4 p-6">
                    <div className="text-5xl">👥</div>
                    <p className="text-white font-bold text-center">Google Meet Live Session</p>
                    <p className="text-gray-300 text-sm">Modern Indian History - Basics</p>
                    <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all">
                      Join Google Meet
                    </a>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-black text-gray-900">Modern Indian History - Basics</h3>
                    <p className="mt-2 text-gray-600">Comprehensive overview of modern Indian history from 1757 to independence. Learn key events, personalities, and their impact on the current system.</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📅 Scheduled for Today at 6:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>👨‍🏫 Hosted by Rahul</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">45 min | Interactive Session</span>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Take Notes</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-gray-900">Videos Watched ({videosWatched.length})</h3>
                  {videosWatched.length > 0 ? (
                    videosWatched.map(v => (
                      <div key={v.id} className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{v.videoTitle || 'Video Lecture'}</p>
                            <p className="text-xs text-gray-500 mt-1">{v.duration || 'Duration unknown'} ✓</p>
                          </div>
                          <span className="text-lg">✅</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-50 border-2 border-gray-200 text-center">
                      <p className="text-sm text-gray-500">No videos watched yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Study Materials</h2>
            <div className="space-y-4">
              {materials.map(m => (
                <div key={m.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📄</div>
                    <div>
                      <h3 className="font-black text-gray-900">{m.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{m.type} • {m.size}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(m)}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${m.downloaded ? 'bg-green-100 text-green-700 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-105'}`}
                  >
                    {m.downloaded ? '✓ Downloaded' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lectures' && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">📹 Recorded Lectures</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="font-black text-gray-900 mb-2">📚 Topics Available</h3>
                <div className="flex flex-wrap gap-2">
                  {['General Studies', 'Modern History', 'Current Affairs', 'Constitution', 'Economy', 'Science & Tech'].map(topic => (
                    <button key={topic} className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-indigo-600 border-2 border-indigo-300 hover:bg-indigo-50 transition-all">
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶️</div>
                      <p className="text-white text-xs font-bold">45 min</p>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900">Modern Indian History Basics</h3>
                  <p className="text-sm text-gray-600 mt-2">Comprehensive overview of India's modern history from 1857</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">👨‍🏫 Dr. Rajesh Kumar</span>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold">▶ Watch</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶️</div>
                      <p className="text-white text-xs font-bold">38 min</p>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900">Constitutional Framework of India</h3>
                  <p className="text-sm text-gray-600 mt-2">Understanding the Constitution and governance structure</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">👨‍🏫 Prof. Meera Singh</span>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold">▶ Watch</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶️</div>
                      <p className="text-white text-xs font-bold">52 min</p>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900">Indian Economy Overview</h3>
                  <p className="text-sm text-gray-600 mt-2">Complete guide to economic concepts and policies</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">👨‍🏫 Dr. Arun Patel</span>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold">▶ Watch</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶️</div>
                      <p className="text-white text-xs font-bold">41 min</p>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900">Current Affairs Monthly Special</h3>
                  <p className="text-sm text-gray-600 mt-2">Latest news and events affecting UPSC exam</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">👨‍🏫 Priya Sharma</span>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold">▶ Watch</button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-gray-700 font-semibold">📹 More lectures coming soon!</p>
                <p className="text-sm text-gray-600 mt-2">Admin panel allows uploading new lectures daily</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Mock Tests</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {testScores.length > 0 ? (
                  testScores.map(t => (
                    <div key={t.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-gray-900 text-lg">{t.testName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{t.duration} min • {t.totalQuestions} Questions • {t.correctAnswers} Correct</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-indigo-600">{t.score}%</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-12 border-2 border-gray-200 text-center">
                    <p className="text-lg text-gray-600 mb-4">No mock tests taken yet</p>
                    <button 
                      onClick={() => alert('🚀 Starting Test Mode...\n\nYou are about to take your first mock test!\n\nFormat: 100 Questions | 2 Hours | All Subjects\n\nClick OK to begin.')}
                      className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
                    >
                      Take Your First Test
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
