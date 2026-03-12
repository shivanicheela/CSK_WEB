import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { AdminRoute } from './components/AdminRoute.tsx'
import Home from './pages/Home'
import UPSC from './pages/UPSC'
import TNPSC from './pages/TNPSC'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import AdminCourseUpload from './pages/AdminCourseUpload.tsx'
import VideoUpload from './pages/VideoUpload.tsx'
import Payment from './pages/Payment.tsx'

function AppContent() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const { user, isAuthenticated, isAdmin } = useAuth()


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-50 to-gray-100">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all">
            <span className="text-white font-black text-base tracking-wide">CSK</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">CSK</div>
            <div className="text-xs text-gray-500">Civil Services Kendra</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 md:gap-4">
          <Link to="/upsc" className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${isActive('/upsc') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-700 hover:bg-indigo-50'}`}>UPSC</Link>
          <Link to="/tnpsc" className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${isActive('/tnpsc') ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-700 hover:bg-emerald-50'}`}>TNPSC</Link>

          {isAuthenticated ? (
            <Link to="/dashboard" className={`px-5 py-2 rounded-lg font-semibold border-2 transition-all duration-300 flex items-center gap-2 ${isActive('/dashboard') ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}>
              <span>👤</span>
              <span className="hidden sm:inline">{isAdmin ? 'Admin' : (user?.displayName?.split(' ')[0] || 'Dashboard')}</span>
              <span className="sm:hidden">Me</span>
            </Link>
          ) : (
            <Link to="/login" className={`px-5 py-2 rounded-lg font-semibold border-2 transition-all duration-300 ${isActive('/login') ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}>Login</Link>
          )}
        </nav>
      </div>
    </header>

    <main className="min-h-[calc(100vh-80px)]">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/upload-course" element={<AdminRoute><AdminCourseUpload/></AdminRoute>} />
        <Route path="/upload-video" element={<AdminRoute><VideoUpload/></AdminRoute>} />
        <Route path="/upsc" element={<UPSC/>} />
        <Route path="/tnpsc" element={<TNPSC/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/payment" element={<Payment/>} />
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
              <p className="text-xs mt-3 text-indigo-300">🌐 100% Online Platform</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-indigo-400 transition">Home</a></li>
                <li><a href="/upsc" className="hover:text-indigo-400 transition">UPSC</a></li>
                <li><a href="/tnpsc" className="hover:text-indigo-400 transition">TNPSC</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Resources</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="/contact" className="hover:text-indigo-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3">Contact Us</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>8050713535</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <span className="break-all">civilserviceskendra@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© 2026 CSK - Civil Services Kendra. All rights reserved. | <a href="#" className="text-indigo-400 hover:text-indigo-300">Contact</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
