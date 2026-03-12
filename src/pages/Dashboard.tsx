import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { logout } from '../firebase/auth.ts'
import { getStudentStats, getVideosWatchedByUser, getMockTestScoresByUser, isUserAdmin } from '../firebase/firestore.ts'
import { initProtections } from '../utils/protections'
import MockTestEngine from '../components/MockTestEngine'
import FolderView from '../components/FolderView'
import { logVideoWatch, logMockTestCompletion } from '../utils/progressTracker.ts'
import { SAMPLE_MATERIALS, organizeByCategory } from '../utils/resourceManager.ts'

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
  const { user, enrolledCourses, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [activeTestId, setActiveTestId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [videoTracked, setVideoTracked] = useState(false)
  const [checkingUploadAccess, setCheckingUploadAccess] = useState(false)

  // State for dynamic data
  const [stats, setStats] = useState<Stats | null>(null)
  const [videosWatched, setVideosWatched] = useState<any[]>([])
  const [testScores, setTestScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for notes feature
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [notesContent, setNotesContent] = useState('')
  const [savedNotes, setSavedNotes] = useState<{[key: string]: string}>({})
  const [currentNoteSession, setCurrentNoteSession] = useState<string>('')

  // Demo data for testing/preview
  const [showDemoData, setShowDemoData] = useState(false)

  // Use displayed stats (real or demo)
  const displayStats = showDemoData && (!stats?.videosWatched || stats.videosWatched === 0) ? {
    totalHoursWatched: 24.5,
    videosWatched: 32,
    mockTestsCompleted: 8,
    averageTestScore: 78,
    currentStreak: 12,
    allTestScores: []
  } : stats

  const displayVideos = showDemoData && videosWatched.length === 0 ? [
    { id: '1', videoTitle: 'Indian Polity - Fundamentals', duration: '45 min', watchedAt: { toDate: () => new Date() } },
    { id: '2', videoTitle: 'Modern History - Freedom Struggle', duration: '52 min', watchedAt: { toDate: () => new Date() } },
    { id: '3', videoTitle: 'Economics - GDP & Inflation', duration: '38 min', watchedAt: { toDate: () => new Date() } }
  ] : videosWatched

  const displayTestScores = showDemoData && testScores.length === 0 ? [
    { id: '1', testName: 'General Studies - Paper 1', score: 82, takenAt: { toDate: () => new Date() } },
    { id: '2', testName: 'Current Affairs Test', score: 75, takenAt: { toDate: () => new Date() } }
  ] : testScores

  useEffect(()=>{
    if (user?.email) {
      initProtections(user.email, 'CSK - Civil Services Kendra')
    }
  },[user])

  // Fetch student stats and progress
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.uid) {
        // Set defaults immediately for non-logged in users
        setStats({
          totalHoursWatched: 0,
          videosWatched: 0,
          mockTestsCompleted: 0,
          averageTestScore: 0,
          currentStreak: 0,
          allTestScores: []
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch ALL data in parallel with Promise.allSettled for faster loading
        const [statsResult, videosResult, scoresResult] = await Promise.allSettled([
          getStudentStats(user.uid),
          getVideosWatchedByUser(user.uid),
          getMockTestScoresByUser(user.uid)
        ])

        // Process stats
        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
        } else {
          console.warn('⚠️ Stats unavailable, using defaults')
          setStats({
            totalHoursWatched: 0,
            videosWatched: 0,
            mockTestsCompleted: 0,
            averageTestScore: 0,
            currentStreak: 0,
            allTestScores: []
          })
        }
        
        // Process videos
        if (videosResult.status === 'fulfilled') {
          setVideosWatched(videosResult.value)
        } else {
          console.warn('⚠️ Videos unavailable')
          setVideosWatched([])
        }
        
        // Process test scores
        if (scoresResult.status === 'fulfilled') {
          setTestScores(scoresResult.value)
        } else {
          console.warn('⚠️ Test scores unavailable')
          setTestScores([])
        }


      } catch (err: any) {
        console.error('Failed to fetch student data:', err)
        // Use defaults on error
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

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout - using default data')
        setStats({
          totalHoursWatched: 0,
          videosWatched: 0,
          mockTestsCompleted: 0,
          averageTestScore: 0,
          currentStreak: 0,
          allTestScores: []
        })
        setLoading(false)
      }
    }, 3000) // 3 second timeout

    fetchStudentData()

    return () => clearTimeout(timeoutId)
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
  // TRACK VIDEO WATCH FROM MODAL
  // ============================================
  const handleMarkVideoWatched = async () => {
    if (!user?.uid || !selectedVideo || videoTracked) return
    
    try {
      // Use courseId as a fallback if not available
      const courseId = selectedVideo.id || Math.random().toString(36).substr(2, 9)
      await logVideoWatch(
        user.uid,
        courseId,
        selectedVideo.url || '',
        selectedVideo.title || 'Unknown Video',
        parseInt(selectedVideo.duration) || 45
      )
      setVideoTracked(true)
      alert('✅ Video marked as watched! Your progress has been updated.')
    } catch (error: any) {
      console.error('❌ Failed to track video:', error)
      alert('Failed to track video. Please try again.')
    }
  }

  // Check if user has admin role
  const handleOpenUploadVideos = () => {
    if (!user?.uid) {
      alert('Please login to access upload features.')
      navigate('/login')
      return
    }

    if (!isAdmin) {
      alert('Only admin accounts can upload videos.')
      return
    }

    navigate('/upload-video')
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
        <div className="p-6 border-b border-gray-200 flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center shadow-lg">
            {isAdmin ? (
              <span className="text-white text-2xl">👤</span>
            ) : (
              <span className="text-white font-black text-base tracking-wide">CSK</span>
            )}
          </div>
          <div className="text-center">
            <h2 className="font-black text-sm text-gray-900">{isAdmin ? 'Admin' : 'Civil Services Kendra'}</h2>
            <p className="text-xs text-gray-500">{isAdmin ? 'Administrator Panel' : 'Your Learning Platform'}</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            📊 Overview
          </button>
          <button onClick={() => { setActiveTab('videos'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'videos' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            🔴 Live Sessions
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

        {/* UPLOAD VIDEOS BUTTON - For Admins */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleOpenUploadVideos}
            disabled={checkingUploadAccess}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {checkingUploadAccess ? '⏳ Checking Access...' : '📹 Upload Videos'}
          </button>
        </div>

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
              <h1 className="text-4xl font-black text-gray-900">Welcome Back, {isAdmin ? 'Admin' : (user?.displayName?.trim() || 'Student')}! 👋</h1>
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
                  {/* Total Hours Card */}
                  <button
                    onClick={() => setActiveTab('videos')}
                    className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg hover:border-indigo-300 transition-all transform hover:scale-105 text-left cursor-pointer"
                  >
                    <p className="text-gray-600 font-semibold text-sm">Total Hours</p>
                    <p className="text-3xl font-black text-indigo-600 mt-2">
                      {displayStats?.totalHoursWatched > 0 ? displayStats.totalHoursWatched.toFixed(1) : '0.0'} hrs
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {displayStats?.videosWatched > 0 ? (
                        <>↑ {displayStats.videosWatched} videos watched</>
                      ) : (
                        <>👆 Click to watch videos</>
                      )}
                    </p>
                  </button>

                  {/* Avg Score Card */}
                  <button
                    onClick={() => setActiveTab('tests')}
                    className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-md hover:shadow-lg hover:border-blue-300 transition-all transform hover:scale-105 text-left cursor-pointer"
                  >
                    <p className="text-gray-600 font-semibold text-sm">Avg Score</p>
                    <p className="text-3xl font-black text-blue-600 mt-2">
                      {displayStats?.averageTestScore > 0 ? displayStats.averageTestScore : '0'}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {displayStats?.mockTestsCompleted > 0 ? (
                        <>{displayStats.mockTestsCompleted} tests taken</>
                      ) : (
                        <>👆 Click to take tests</>
                      )}
                    </p>
                  </button>

                  {/* Streak Card */}
                  <button
                    onClick={() => {
                      alert('🔥 Study daily to build your streak!\n\nTips:\n• Watch at least 1 video daily\n• Complete mock tests regularly\n• Download study materials\n• Attend live sessions')
                    }}
                    className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md hover:shadow-lg hover:border-purple-300 transition-all transform hover:scale-105 text-left cursor-pointer"
                  >
                    <p className="text-gray-600 font-semibold text-sm">Streak</p>
                    <p className="text-3xl font-black text-purple-600 mt-2">
                      {displayStats?.currentStreak > 0 ? displayStats.currentStreak : '0'} days
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {displayStats?.currentStreak > 0 ? 'Keep it going! 🔥' : '👆 Start your streak!'}
                    </p>
                  </button>

                  {/* Rank Card */}
                  <button
                    onClick={() => {
                      const rank = displayStats?.averageTestScore > 80 ? '#245' : displayStats?.averageTestScore > 60 ? '#1,245' : displayStats?.averageTestScore >= 0 && displayStats?.testsTaken > 0 ? '#5,678' : 'N/A'
                      const percentile = displayStats?.averageTestScore > 80 ? 'Top 1%' : displayStats?.averageTestScore > 60 ? 'Top 3%' : displayStats?.testsTaken > 0 ? 'Top 15%' : 'No rank yet'
                      alert(`🏆 Your Current Rank\n\nRank: ${rank}\nPercentile: ${percentile}\n\n${displayStats?.testsTaken === 0 ? '💡 Take mock tests to get ranked!' : displayStats?.averageTestScore === 0 ? '💪 Keep trying! Every attempt counts!' : '💪 Keep studying to climb higher!'}`)
                    }}
                    className="bg-white rounded-xl p-6 border-2 border-pink-100 shadow-md hover:shadow-lg hover:border-pink-300 transition-all transform hover:scale-105 text-left cursor-pointer"
                  >
                    <p className="text-gray-600 font-semibold text-sm">Rank (Est.)</p>
                    <p className="text-3xl font-black text-pink-600 mt-2">
                      {displayStats?.averageTestScore > 80 ? '#245' : displayStats?.averageTestScore > 60 ? '#1,245' : displayStats?.averageTestScore >= 0 && displayStats?.testsTaken > 0 ? '#5,678' : '--'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {displayStats?.averageTestScore > 80 ? 'Top 1% 🚀' : displayStats?.averageTestScore > 60 ? 'Top 3% 🚀' : displayStats?.testsTaken > 0 ? 'Top 15% 📈' : '👆 Start climbing!'}
                    </p>
                  </button>
                </div>

                {/* Demo Data Toggle - Show when no activity */}
                {(!stats?.videosWatched || stats.videosWatched === 0) && (!stats?.mockTestsCompleted || stats.mockTestsCompleted === 0) && (
                  <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="font-bold text-gray-900">New here? See how your dashboard will look</p>
                        <p className="text-sm text-gray-600">Toggle demo data to preview stats with sample numbers</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDemoData(!showDemoData)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                        showDemoData 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {showDemoData ? '🔴 Hide Demo' : '▶️ Show Demo'}
                    </button>
                  </div>
                )}

                {/* Getting Started Guide - Show when no activity and no demo */}
                {!showDemoData && (!stats?.videosWatched || stats.videosWatched === 0) && (!stats?.mockTestsCompleted || stats.mockTestsCompleted === 0) && (
                  <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🎯</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black mb-2">Welcome to CSK! Let's Get Started 🚀</h3>
                        <p className="text-indigo-100 mb-4">
                          You haven't started learning yet. Here's how to begin your journey:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            onClick={() => setActiveTab('videos')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg p-4 text-left transition-all"
                          >
                            <div className="text-2xl mb-2">🔴</div>
                            <p className="font-bold text-sm">1. Join Live Sessions</p>
                            <p className="text-xs text-indigo-100 mt-1">Connect with instructors</p>
                          </button>
                          <button
                            onClick={() => setActiveTab('materials')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg p-4 text-left transition-all"
                          >
                            <div className="text-2xl mb-2">📚</div>
                            <p className="font-bold text-sm">2. Download Notes</p>
                            <p className="text-xs text-indigo-100 mt-1">Get study materials</p>
                          </button>
                          <button
                            onClick={() => setActiveTab('tests')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg p-4 text-left transition-all"
                          >
                            <div className="text-2xl mb-2">✅</div>
                            <p className="font-bold text-sm">3. Take Tests</p>
                            <p className="text-xs text-indigo-100 mt-1">Practice mock tests</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {displayVideos.slice(0, 3).length > 0 ? (
                        <>
                          {displayVideos.slice(0, 3).map((v: any) => (
                            <div key={v.id} className="flex gap-3 pb-3 border-b border-gray-200">
                              <div className="text-2xl">▶️</div>
                              <div>
                                <p className="font-semibold text-gray-900">{v.videoTitle || 'Video'}</p>
                                <p className="text-xs text-gray-500">Watched • {v.watchedAt?.toDate?.().toLocaleDateString?.() || 'Recently'}</p>
                              </div>
                            </div>
                          ))}
                          {displayTestScores.slice(0, 1).map((t: any) => (
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
                      onClick={async () => {
                        if (!('Notification' in window)) {
                          alert('Your browser does not support notifications.')
                          return
                        }
                        const permission = await Notification.requestPermission()
                        if (permission === 'granted') {
                          // Schedule reminder 30 min before — 6:00 PM tomorrow = next occurrence
                          const now = new Date()
                          const session = new Date()
                          session.setDate(now.getDate() + 1)
                          session.setHours(17, 30, 0, 0) // 5:30 PM reminder for 6 PM session
                          const delay = session.getTime() - now.getTime()
                          if (delay > 0) {
                            setTimeout(() => {
                              new Notification('📢 CSK Live Session in 30 minutes!', {
                                body: 'Modern Indian History - Advanced starts at 6:00 PM. Get ready!',
                                icon: '/images/csk-logo.png'
                              })
                            }, delay)
                            alert(`✅ Reminder set!\nYou'll get a notification at 5:30 PM tomorrow before the session.`)
                          } else {
                            new Notification('📢 CSK Reminder', { body: 'Your session is starting soon!' })
                            alert('✅ Notification sent!')
                          }
                        } else {
                          alert('❌ Notification permission denied. Please allow notifications in your browser settings.')
                        }
                      }}
                      className="w-full px-4 py-3 bg-yellow-400 text-indigo-900 font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
                    >
                      Set Reminder
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-black text-gray-900 mb-4">⚡ Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('videos')}
                      className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-left"
                    >
                      <div className="text-3xl mb-2">🔴</div>
                      <p className="font-bold">Join Live Sessions</p>
                      <p className="text-sm text-purple-100 mt-1">Connect with instructors</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('materials')}
                      className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-left"
                    >
                      <div className="text-3xl mb-2">📚</div>
                      <p className="font-bold">Study Materials</p>
                      <p className="text-sm text-blue-100 mt-1">Download resources</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('tests')}
                      className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-left"
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <p className="font-bold">Take Mock Test</p>
                      <p className="text-sm text-green-100 mt-1">Practice questions</p>
                    </button>
                  </div>
                </div>

                {/* Progress Chart Section */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-black text-gray-900 mb-4">📊 Your Progress This Week</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="text-center">
                        <p className="text-xs text-gray-500 mb-2">{day}</p>
                        <div
                          className={`h-20 rounded-lg ${index <= 4 ? 'bg-indigo-500' : 'bg-gray-200'} flex items-end justify-center p-2`}
                        >
                          <span className="text-xs text-white font-bold">
                            {index <= 4 ? `${Math.floor(Math.random() * 3) + 1}h` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    {showDemoData && (!stats?.totalHoursWatched || stats.totalHoursWatched === 0) ? (
                      <>This is demo data. Start learning to see your real progress! 🎯</>
                    ) : (
                      <>You've studied for {displayStats?.totalHoursWatched.toFixed(1) || 0} hours this week! 🎯</>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">🔴 Live Sessions</h2>

            {/* Google Meet Integration - Top Section */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg text-white">
              <div className="flex items-start gap-4">
                <div className="text-5xl">👥</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-2">Join Live Video Session</h3>
                  <p className="text-blue-100 mb-4">
                    Connect with instructors and fellow students in real-time via Google Meet
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => window.open('https://meet.google.com/new', '_blank')}
                      className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105"
                    >
                      👥 Create Google Meet
                    </button>
                    <button
                      onClick={() => {
                        const meetCode = prompt('Enter Google Meet code or link:')
                        if (meetCode) {
                          if (meetCode.includes('meet.google.com')) {
                            window.open(meetCode, '_blank')
                          } else {
                            window.open(`https://meet.google.com/${meetCode}`, '_blank')
                          }
                        }
                      }}
                      className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-all"
                    >
                      🔗 Join with Code
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-8">

                {/* Videos Watched History */}
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                  <h3 className="text-xl font-black text-gray-900 mb-4">✅ Recently Watched ({videosWatched.length})</h3>
                  {videosWatched.length > 0 ? (
                    <div className="space-y-3">
                      {videosWatched.map(v => (
                        <div key={v.id} className="p-4 rounded-lg bg-green-50 border-2 border-green-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{v.videoTitle || 'Video Lecture'}</p>
                              <p className="text-xs text-gray-500">{v.duration || 'Duration unknown'} • Completed</p>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open('https://meet.google.com/new', '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-xs"
                          >
                            👥 Discuss
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-3">📹</div>
                      <p className="text-gray-500 mb-4">No videos watched yet</p>
                      <p className="text-sm text-gray-400">Start watching lectures above to build your learning history</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div>
            <FolderView category="study-material" allowedExams={enrolledCourses} />
          </div>
        )}

        {activeTab === 'lectures' && (
          <div>
            <FolderView category="recorded-lectures" allowedExams={enrolledCourses} />
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <FolderView
              category="mock-tests"
              allowedExams={enrolledCourses}
              onStartTest={(testId, testName) => {
                setActiveTestId(testId)
              }}
            />
          </div>
        )}

        {/* Mock Test Engine */}
        {activeTestId && (
          <MockTestEngine
            testId={activeTestId}
            testName={activeTestId.replace(/-/g, ' ').toUpperCase()}
            totalQuestions={10}
            timeLimit={30}
            passingScore={40}
            questions={getSampleQuestions(activeTestId)}
            userId={user?.uid || 'anonymous'}
            onSubmit={async (score, correctAnswers) => {
              // Save test results immediately when test is submitted
              if (user?.uid) {
                try {
                  console.log('💾 Saving test results:', { score, correctAnswers })
                  await logMockTestCompletion(
                    user.uid,
                    activeTestId,
                    activeTestId.replace(/-/g, ' ').toUpperCase(),
                    score,
                    10,
                    correctAnswers,
                    30
                  )
                  console.log('✅ Test results saved to Firestore')
                } catch (error) {
                  console.error('❌ Failed to save test results:', error)
                }
              }
            }}
            onComplete={async (score, answers) => {
              // Save test results locally
              setTestResults({ score, answers, testId: activeTestId })

              // Refresh stats after saving
              if (user?.uid) {
                try {
                  const updatedStats = await getStudentStats(user.uid)
                  setStats(updatedStats)
                  console.log('✅ Stats refreshed')
                } catch (error) {
                  console.error('❌ Failed to refresh stats:', error)
                }
              }
            }}
            onClose={() => setActiveTestId(null)}
          />
        )}

        {/* Video Player Modal */}
        <>
          {videoModalOpen && selectedVideo && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-black rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Close Button */}
                <div className="flex justify-between items-center p-4 bg-gray-900">
                  <h3 className="text-white font-black text-lg">{selectedVideo.title}</h3>
                  <button
                    onClick={() => {
                      setVideoModalOpen(false)
                      setVideoTracked(false) // Reset after closing
                    }}
                    className="text-white text-2xl hover:text-gray-300 transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Video Player */}
                <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {selectedVideo.url ? (
                    <video
                      key={selectedVideo.url}
                      controls
                      autoPlay
                      className="w-full h-full"
                      style={{ backgroundColor: '#000' }}
                      controlsList="nodownload"
                    >
                      <source src={selectedVideo.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-white text-center">
                      <p className="text-xl mb-2">📹</p>
                      <p>Video loading...</p>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="bg-gray-900 p-6 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Instructor</p>
                      <p className="font-bold text-white">{selectedVideo.instructor || 'Dr. Expert'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="font-bold text-white">{selectedVideo.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Uploaded</p>
                      <p className="font-bold text-white">Mar 4, 2026</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Description</p>
                    <p className="text-gray-300">{selectedVideo.description || 'Comprehensive lecture on this topic'}</p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button 
                      onClick={handleMarkVideoWatched}
                      disabled={videoTracked}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${videoTracked ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'}`}
                    >
                      {videoTracked ? '✓ Watched' : '✓ Mark as Watched'}
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all">
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </main>
    </div>
  )
}

// Sample questions for mock tests
function getSampleQuestions(testId: string) {
  const baseQuestions = [
    {
      id: 1,
      question: 'Which of the following is the capital of India?',
      options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
      correctAnswer: 1,
      explanation: 'New Delhi is the capital and largest city of India.',
      category: 'Geography',
    },
    {
      id: 2,
      question: 'In which year did India gain independence?',
      options: ['1945', '1947', '1950', '1952'],
      correctAnswer: 1,
      explanation: 'India gained independence on August 15, 1947.',
      category: 'History',
    },
    {
      id: 3,
      question: 'Who was the first Prime Minister of India?',
      options: ['Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Rajendra Prasad'],
      correctAnswer: 1,
      explanation: 'Jawaharlal Nehru was the first Prime Minister of India (1947-1964).',
      category: 'History',
    },
    {
      id: 4,
      question: 'What is the maximum number of members in the Lok Sabha?',
      options: ['500', '545', '552', '600'],
      correctAnswer: 2,
      explanation: 'The Lok Sabha (House of the People) can have a maximum of 552 members.',
      category: 'Polity',
    },
    {
      id: 5,
      question: 'Which article of the Indian Constitution defines the legislative powers of Parliament?',
      options: ['Article 79', 'Article 81', 'Article 245', 'Article 256'],
      correctAnswer: 2,
      explanation: 'Article 245 defines the extent of the power to make laws by Parliament.',
      category: 'Polity',
    },
    {
      id: 6,
      question: 'What is GDP primarily a measure of?',
      options: ['Population growth', 'Economic output', 'Inflation rate', 'Unemployment'],
      correctAnswer: 1,
      explanation: 'GDP (Gross Domestic Product) measures the total economic output of a country.',
      category: 'Economics',
    },
    {
      id: 7,
      question: 'Which of the following is NOT a function of the World Bank?',
      options: ['Lending money to countries', 'Providing technical assistance', 'Making laws for member countries', 'Supporting economic development'],
      correctAnswer: 2,
      explanation: 'The World Bank does not make laws; it provides loans and technical assistance for development.',
      category: 'Economics',
    },
    {
      id: 8,
      question: 'The monsoon winds in India are driven by:',
      options: ['Cold currents', 'Pressure differences', 'Coriolis force', 'Ocean waves'],
      correctAnswer: 1,
      explanation: 'Monsoon winds are driven by pressure differences between land and ocean.',
      category: 'Geography',
    },
    {
      id: 9,
      question: 'Which desert is the largest in Asia?',
      options: ['Gobi Desert', 'Arabian Desert', 'Taklamakan Desert', 'Kalahari Desert'],
      correctAnswer: 2,
      explanation: 'The Taklamakan Desert in China is the largest desert in Asia.',
      category: 'Geography',
    },
    {
      id: 10,
      question: 'What is the primary function of the Reserve Bank of India?',
      options: ['Lending to businesses', 'Controlling monetary policy', 'Taxation', 'Import/export control'],
      correctAnswer: 1,
      explanation: 'The RBI is responsible for controlling monetary policy and managing the currency.',
      category: 'Economics',
    },
  ]

  // Return all 10 questions or extend for specific tests
  if (testId === 'gs-paper-1') {
    return baseQuestions.slice(0, 10)
  } else if (testId === 'polity-mock') {
    return baseQuestions.slice(3, 5).concat(baseQuestions.slice(0, 3)).concat(baseQuestions.slice(5, 10))
  } else if (testId === 'economics-mock') {
    return baseQuestions.slice(5, 10).concat(baseQuestions.slice(0, 5))
  } else {
    return baseQuestions
  }
}


