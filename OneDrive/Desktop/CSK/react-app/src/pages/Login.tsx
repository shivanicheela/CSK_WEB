import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, signup, loginWithGoogle, loginWithPhone } from '../firebase/auth.ts'

export default function Login(){
  const [email, setEmail] = useState('test@csk.com')
  const [password, setPassword] = useState('test123456')
  const [fullName, setFullName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPhoneLogin, setShowPhoneLogin] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [logoFailed, setLogoFailed] = useState(false)
  const navigate = useNavigate()
  
  // CSK Logo as data URL - Professional Bronze Emblem
  const logoDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 320'%3E%3Cdefs%3E%3CradialGradient id='shine' cx='35%25' cy='35%25'%3E%3Cstop offset='0%25' style='stop-color:%23f4d03f;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23b8860b;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='150' cy='150' r='140' fill='%23f5e6d3' stroke='%23b8860b' stroke-width='4'/%3E%3Ccircle cx='150' cy='150' r='130' fill='none' stroke='%23d4af37' stroke-width='2'/%3E%3Cpath d='M 80 100 Q 70 80 90 70 Q 110 60 130 75 L 150 85 L 170 75 Q 190 60 210 70 Q 230 80 220 100' fill='%23b8860b'/%3E%3Ctext x='150' y='155' font-size='52' font-weight='bold' text-anchor='middle' fill='%23b8860b' font-family='Georgia, serif'%3ECSK%3C/text%3E%3Ctext x='150' y='220' font-size='14' text-anchor='middle' fill='%23b8860b' font-family='Georgia, serif' font-weight='bold'%3ECIVIL SERVICES KENDRA%3C/text%3E%3Ctext x='150' y='245' font-size='10' text-anchor='middle' fill='%238b7500' font-family='serif'%3EMISSION: IAS | VISION: INDIA%3C/text%3E%3C/svg%3E"

  // ============================================
  // LOGIN HANDLER
  // ============================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        // SIGNUP
        if (!fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        await signup(email, password, fullName)
        // After signup, automatically log them in
        navigate('/dashboard')
      } else {
        // LOGIN
        await login(email, password)
        navigate('/dashboard')
      }
    } catch (err: any) {
      // Handle different Firebase errors
      if (err.code === 'auth/user-not-found') {
        setError('Email not found. Please sign up first.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please log in instead.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check and try again.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.')
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.')
      } else {
        setError(err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-12 text-white shadow-2xl flex flex-col items-center justify-center">
            {!logoFailed ? (
              <img 
                src={logoDataUrl}
                alt="CSK Logo" 
                className="w-24 h-24 object-contain mb-4"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="text-5xl font-black mb-6">CSK</div>
            )}
            <h2 className="text-4xl font-black mb-4 leading-tight">Civil Services Kendra</h2>
            <p className="text-lg text-indigo-100 mb-8">Your complete UPSC & TNPSC preparation platform</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">✓</div>
                <p>Expert coaching from IAS/TNPSC officers</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">✓</div>
                <p>Comprehensive video lectures & materials</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">✓</div>
                <p>Mock tests & performance analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">✓</div>
                <p>10,000+ successful selections</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-indigo-100 mb-4">What our students say:</p>
              <p className="italic text-indigo-100">"CSK helped me clear UPSC in my first attempt. Highly recommended!" - Priya Sharma, Rank 245</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold text-sm"
              >
                ← Back
              </button>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isSignup 
                ? 'Join CSK to start your preparation journey' 
                : 'Login to access your courses and dashboard'
              }
            </p>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              {/* SIGNUP: Full Name */}
              {isSignup && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                  placeholder="you@example.com" 
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">Password</label>
                  {!isSignup && <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Forgot?</a>}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                  placeholder="••••••••" 
                />
                {isSignup && <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>}
              </div>

              {/* REMEMBER ME (Login only) */}
              {!isSignup && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300" />
                    <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
                  </div>
                  <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-lg hover:shadow-lg transition-all transform hover:scale-105 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
              </button>

              {/* DIVIDER */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {!showPhoneLogin ? (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await loginWithGoogle()
                        navigate('/dashboard')
                      } catch (err: any) {
                        setError(err.message || 'Google login failed. Please try again.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>🔍</span> Google
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowPhoneLogin(true)
                      setError('')
                    }}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span>📱</span> Phone
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210" 
                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Format: +91 XXXXX XXXXX</p>
                  </div>
                  <div id="recaptcha-container"></div>
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (!phoneNumber.trim()) {
                        setError('Please enter a phone number')
                        return
                      }
                      setLoading(true)
                      try {
                        await loginWithPhone(phoneNumber, 'recaptcha-container')
                        setError('Verification code sent to your phone. Please check your SMS.')
                      } catch (err: any) {
                        setError(err.message || 'Phone login failed. Please try again.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPhoneLogin(false)
                      setPhoneNumber('')
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Back to Email
                  </button>
                </div>
              )}
            </form>

            {/* TOGGLE SIGNUP/LOGIN */}
            <div className="mt-8 text-center">
              <p className="text-gray-700">
                {isSignup 
                  ? 'Already have an account? ' 
                  : "Don't have an account? "}
                <button 
                  onClick={() => {
                    setIsSignup(!isSignup)
                    setError('')
                    setEmail('')
                    setPassword('')
                    setFullName('')
                  }}
                  className="text-indigo-600 font-bold hover:text-indigo-700"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* TEST CREDENTIALS */}
            {!isSignup && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 font-semibold">📧 Test Account:</p>
                <p className="text-xs text-blue-800 mt-1">Email: <span className="font-mono bg-white px-2 py-1 rounded">test@csk.com</span></p>
                <p className="text-xs text-blue-800">Password: <span className="font-mono bg-white px-2 py-1 rounded">test123456</span></p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>By signing in, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
