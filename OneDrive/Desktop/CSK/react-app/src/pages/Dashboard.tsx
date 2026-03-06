import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { logout } from '../firebase/auth.ts'
import { getStudentStats, getVideosWatchedByUser, getMockTestScoresByUser, isUserAdmin } from '../firebase/firestore.ts'
import { initProtections } from '../utils/protections'
import MockTestEngine from '../components/MockTestEngine'
import FolderView from '../components/FolderView'
import { logVideoWatch } from '../utils/progressTracker.ts'
import { initializeSessions, getUpcomingSessions, getLiveSessions, getCompletedSessions, formatSessionDate, formatSessionTime, getTimeUntilSession, getStatusBadgeColor, getStatusEmoji, registerForSession } from '../utils/liveSessionManager.ts'
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
  const [logoFailed, setLogoFailed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // CSK Logo as data URL - Professional Bronze Emblem
  const logoDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 320'%3E%3Cdefs%3E%3CradialGradient id='shine' cx='35%25' cy='35%25'%3E%3Cstop offset='0%25' style='stop-color:%23f4d03f;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23b8860b;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='150' cy='150' r='140' fill='%23f5e6d3' stroke='%23b8860b' stroke-width='4'/%3E%3Ccircle cx='150' cy='150' r='130' fill='none' stroke='%23d4af37' stroke-width='2'/%3E%3Cpath d='M 80 100 Q 70 80 90 70 Q 110 60 130 75 L 150 85 L 170 75 Q 190 60 210 70 Q 230 80 220 100' fill='%23b8860b'/%3E%3Ctext x='150' y='155' font-size='52' font-weight='bold' text-anchor='middle' fill='%23b8860b' font-family='Georgia, serif'%3ECSK%3C/text%3E%3Ctext x='150' y='220' font-size='14' text-anchor='middle' fill='%23b8860b' font-family='Georgia, serif' font-weight='bold'%3ECIVIL SERVICES KENDRA%3C/text%3E%3Ctext x='150' y='245' font-size='10' text-anchor='middle' fill='%238b7500' font-family='serif'%3EMISSION: IAS | VISION: INDIA%3C/text%3E%3C/svg%3E"
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
  
  useEffect(()=>{
    if (user?.email) {
      initProtections(user.email, 'CSK - Civil Services Kendra')
    }
    // Initialize live sessions on component mount
    initializeSessions()
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
  const handleOpenUploadVideos = async () => {
    if (!user?.uid) {
      alert('Please login to access upload features.')
      navigate('/login')
      return
    }

    setCheckingUploadAccess(true)
    try {
      const admin = await isUserAdmin(user.uid)
      if (!admin) {
        alert('Only admin accounts can upload videos.')
        return
      }
      navigate('/upload-video')
    } catch (err) {
      console.error('Upload access check failed:', err)
      alert('Unable to verify upload access right now. Please try again.')
    } finally {
      setCheckingUploadAccess(false)
    }
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
          {!logoFailed ? (
            <img 
              src={logoDataUrl}
              alt="CSK Logo" 
              className="w-12 h-12 object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">CSK</div>
          )}
          <div className="text-center">
            <h2 className="font-black text-sm text-gray-900">Civil Services Kendra</h2>
            <p className="text-xs text-gray-500">Your Learning Platform</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            📊 Overview
          </button>
          <button onClick={() => { setActiveTab('live'); setSidebarOpen(false) }} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'live' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
            🔴 Live Sessions
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
        
        {activeTab === 'live' && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">🔴 Live Sessions</h2>
            
            {/* Live Now Sessions */}
            {getLiveSessions().length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4">🔴 LIVE NOW</h3>
                {getLiveSessions().map(session => (
                  <div key={session.id} className="mb-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE NOW
                    </div>
                    <h3 className="text-2xl font-black mb-2">{session.title}</h3>
                    <p className="text-red-100 mb-4">
                      {session.topic} | 🕒 {formatSessionTime(session.scheduledAt)} | 👨‍🏫 {session.instructor}
                    </p>
                    <p className="text-red-100 mb-4">{session.description}</p>
                    
                    {/* YouTube Embed */}
                    {session.youtubeLink && (
                      <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ paddingBottom: '56.25%', height: 0 }}>
                        <iframe 
                          className="absolute top-0 left-0 w-full h-full"
                          src={
                            session.youtubeLink.includes('/embed/')
                              ? session.youtubeLink
                              : `https://www.youtube.com/embed/${session.youtubeLink.split('v=')[1]?.split('&')[0] || ''}`
                          }
                          title={session.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={() => {
                          if(session.youtubeLink) {
                            window.open(session.youtubeLink, '_blank')
                          }
                        }}
                        className="px-6 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-all"
                      >
                        📱 Open in YouTube
                      </button>
                      <button
                        onClick={() => alert('✅ Reminder set for the next session!')}
                        className="px-6 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-all"
                      >
                        🔔 Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Sessions */}
            {getUpcomingSessions().length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4">📅 Upcoming Sessions ({getUpcomingSessions().length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getUpcomingSessions(6).map(session => (
                    <div key={session.id} className="bg-white rounded-xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-black text-gray-900">{session.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{session.topic}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusBadgeColor('upcoming')}`}>
                          {getTimeUntilSession(session.scheduledAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📅 {formatSessionDate(session.scheduledAt)}</p>
                      <p className="text-sm text-gray-600 mb-2">🕒 {formatSessionTime(session.scheduledAt)}</p>
                      <p className="text-sm text-gray-600 mb-2">⏱️ {session.duration} mins</p>
                      <p className="text-sm text-gray-600 mb-3">👨‍🏫 {session.instructor}</p>
                      {session.description && <p className="text-xs text-gray-600 mb-3">{session.description}</p>}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            registerForSession(user?.uid || '', session.id)
                            alert(`✅ Registered for ${session.title}!`)
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-sm"
                        >
                          Register
                        </button>
                        <button 
                          onClick={() => alert(`🔔 Reminder set for ${session.title}!`)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                        >
                          🔔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Sessions / Recordings */}
            {getCompletedSessions().length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4">📺 Past Sessions (Replays)</h3>
                <div className="space-y-3">
                  {getCompletedSessions(6).map(session => (
                    <div key={session.id} className="bg-white rounded-xl p-4 border-2 border-green-200 hover:shadow-lg transition-all flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-600">📅 {formatSessionDate(session.scheduledAt)} • 👨‍🏫 {session.instructor}</p>
                      </div>
                      <button 
                        onClick={() => {
                          if(session.recordingUrl) {
                            window.open(session.recordingUrl, '_blank')
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-sm"
                      >
                        ▶️ Watch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No sessions message */}
            {getLiveSessions().length === 0 && getUpcomingSessions().length === 0 && getCompletedSessions().length === 0 && (
              <div className="bg-indigo-50 rounded-xl p-8 border-2 border-indigo-200 text-center">
                <h3 className="text-xl font-black text-gray-900 mb-2">📅 No Sessions Yet</h3>
                <p className="text-gray-600">Check back soon for upcoming live classes and sessions!</p>
              </div>
            )}
          </div>
        )}
        
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
            <FolderView category="study-material" />
          </div>
        )}

        {activeTab === 'lectures' && (
          <div>
            <FolderView category="recorded-lectures" />
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <FolderView category="mock-tests" />
          </div>
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

