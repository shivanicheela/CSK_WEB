import React from 'react'
import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { AdminRoute } from './components/AdminRoute.tsx'
import Home from './pages/Home'
import UPSC from './pages/UPSC'
import TNPSC from './pages/TNPSC'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FreeLectures from './pages/FreeLectures'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import CoursesPage from './pages/Courses.tsx'
import CourseDetail from './pages/CourseDetail.tsx'
import AdminCourseUpload from './pages/AdminCourseUpload.tsx'
import VideoUpload from './pages/VideoUpload.tsx'

export default function App(){
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const [logoFailed, setLogoFailed] = useState(false)
  
  // CSK Logo as data URL - Professional Bronze Emblem
  const logoDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 320'%3E%3Cdefs%3E%3CradialGradient id='shine' cx='35%25' cy='35%25'%3E%3Cstop offset='0%25' style='stop-color:%23f4d03f;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23b8860b;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='150' cy='150' r='140' fill='%23f5e6d3' stroke='%23b8860b' stroke-width='4'/%3E%3Ccircle cx='150' cy='150' r='130' fill='none' stroke='%23d4af37' stroke-width='2'/%3E%3Cpath d='M 80 100 Q 70 80 90 70 Q 110 60 130 75 L 150 85 L 170 75 Q 190 60 210 70 Q 230 80 220 100' fill='%23b8860b'/%3E%3Ctext x='150' y='155' font-size='52' font-weight='bold' text-anchor='middle' fill='%23b8860b' font-family='Georgia, serif'%3ECSK%3C/text%3E%3Ctext x='150' y='220' font-size='14' text-anchor='middle' fill='%23b8860b' font-family='Georgia, serif' font-weight='bold'%3ECIVIL SERVICES KENDRA%3C/text%3E%3Ctext x='150' y='245' font-size='10' text-anchor='middle' fill='%238b7500' font-family='serif'%3EMISSION: IAS | VISION: INDIA%3C/text%3E%3C/svg%3E"

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-50 to-gray-100">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            {!logoFailed ? (
              <img 
                src={logoDataUrl}
                alt="CSK Logo" 
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-all">
                <span className="text-white font-bold text-lg">CSK</span>
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">CSK</div>
              <div className="text-xs text-gray-500">Civil Services Kendra</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/courses" 
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/courses') 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              Courses
            </Link>
            <Link 
              to="/upsc" 
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/upsc') 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-indigo-50'
              }`}
            >
              UPSC
            </Link>
            <Link 
              to="/tnpsc" 
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/tnpsc') 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              TNPSC
            </Link>
            <Link 
              to="/free-lectures" 
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                isActive('/free-lectures') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Free
            </Link>
            <Link 
              to="/login" 
              className={`px-5 py-2 rounded-lg font-semibold border-2 transition-all duration-300 ${
                isActive('/login') 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                  : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-80px)]">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/courses" element={<CoursesPage/>} />
          <Route path="/courses/:courseId" element={<CourseDetail/>} />
          <Route path="/upload-course" element={<AdminRoute><AdminCourseUpload/></AdminRoute>} />
          <Route path="/upload-video" element={<AdminRoute><VideoUpload/></AdminRoute>} />
          <Route path="/upsc" element={<UPSC/>} />
          <Route path="/tnpsc" element={<TNPSC/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/free-lectures" element={<FreeLectures/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/admin" element={<AdminRoute><Admin/></AdminRoute>} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">CSK</h4>
              <p className="text-sm">Premier coaching for UPSC and TNPSC aspirants.</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-indigo-400 transition">Home</a></li>
                <li><a href="/courses" className="hover:text-indigo-400 transition">Courses</a></li>
                <li><a href="/upsc" className="hover:text-indigo-400 transition">UPSC</a></li>
                <li><a href="/tnpsc" className="hover:text-indigo-400 transition">TNPSC</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Resources</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="/free-lectures" className="hover:text-indigo-400 transition">Free Lectures</a></li>
                <li><a href="/contact" className="hover:text-indigo-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© 2026 CSK - Civil Services Kendra. All rights reserved. | <a href="#" className="text-indigo-400 hover:text-indigo-300">Contact</a></p>
          </div>
        </div>
      </footer>
      </div>
    </AuthProvider>
  )
}
