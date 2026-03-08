import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signup, loginWithGoogle, loginWithPhone, verifyOTP } from '../firebase/auth.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { enrollUserInCourse } from '../firebase/firestore.ts'

// ============================================================
// 🔐 HARDCODED ADMIN CREDENTIALS — CHANGE THESE TO YOUR OWN
// ONLY this email + password combination works for Admin Login
// Any other email/password → "Invalid admin credentials"
// ============================================================
const ADMIN_EMAIL = 'civilserviceskendra@gmail.com'
const ADMIN_PASSWORD = 'CSKadmin@2026'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPhoneLogin, setShowPhoneLogin] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const navigate = useNavigate()
  const { user, isAdmin, loading: authLoading } = useAuth()

  // Redirect already-logged-in users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  // ============================================
  // LOGIN HANDLER
  // ============================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ✅ ADMIN LOGIN — block immediately if credentials don't match hardcoded values
      if (isAdminLogin) {
        if (
          email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
          password !== ADMIN_PASSWORD
        ) {
          setError('❌ Invalid admin credentials. Access denied.')
          setLoading(false)
          return
        }
        // Exact match — try Firebase login, if account doesn't exist create it
        try {
          await login(ADMIN_EMAIL, ADMIN_PASSWORD)
        } catch (firebaseErr: any) {
          if (
            firebaseErr.code === 'auth/user-not-found' ||
            firebaseErr.code === 'auth/invalid-credential' ||
            firebaseErr.code === 'auth/wrong-password'
          ) {
            // Account doesn't exist yet — create it automatically
            await signup(ADMIN_EMAIL, ADMIN_PASSWORD, 'CSK Admin')
          } else {
            throw firebaseErr
          }
        }
        // useEffect above will redirect to /dashboard
        return
      }

      // ✅ REGULAR USER LOGIN
      if (isSignup) {
        if (!fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        await signup(email, password, fullName)
        navigate('/dashboard')
      } else {
        // Block regular users from using the admin email
        if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setError('❌ This email is not allowed for user login.')
          setLoading(false)
          return
        }
        await login(email, password)
        // navigate handled by useEffect
      }
    } catch (err: any) {
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
          <div className={`rounded-2xl p-12 text-white shadow-2xl flex flex-col items-center justify-center ${isAdminLogin ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-600 to-purple-700'}`}>
            {/* CSK Circle Logo */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl mb-6 ${isAdminLogin ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>
              <span className="text-white font-black text-2xl tracking-wide">CSK</span>
            </div>

            {isAdminLogin ? (
              <>
                <h2 className="text-4xl font-black mb-4 leading-tight text-center">Admin Portal</h2>
                <p className="text-lg text-gray-300 mb-8 text-center">Manage courses, students, and content</p>
                <div className="space-y-4 w-full">
                  {['Upload videos & study materials', 'Manage student enrollments', 'View performance analytics', 'Add & edit mock tests'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">⚙️</div>
                      <p className="text-gray-200">{item}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black mb-4 leading-tight text-center">Civil Services Kendra</h2>
                <p className="text-lg text-indigo-100 mb-8 text-center">Your complete UPSC & TNPSC preparation platform</p>
                <div className="space-y-4 w-full">
                  {['Expert coaching from IAS/TNPSC officers', 'Comprehensive video lectures & materials', 'Mock tests & performance analytics', '10,000+ successful selections'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-6 border-t border-white/20 w-full">
                  <p className="text-sm text-indigo-100 mb-2">What our students say:</p>
                  <p className="italic text-indigo-100 text-sm">"CSK helped me clear UPSC in my first attempt. Highly recommended!" — Priya Sharma, Rank 245</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {/* Back Button */}
            <div className="mb-4">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold text-sm">
                ← Back
              </button>
            </div>

            {/* Admin / Student toggle tabs */}
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 mb-6">
              <button
                onClick={() => { setIsAdminLogin(false); setError('') }}
                className={`flex-1 py-3 text-sm font-bold transition-all ${!isAdminLogin ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                🎓 User Login
              </button>
              <button
                onClick={() => { setIsAdminLogin(true); setIsSignup(false); setError('') }}
                className={`flex-1 py-3 text-sm font-bold transition-all ${isAdminLogin ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                ⚙️ Admin Login
              </button>
            </div>

            <h1 className="text-3xl font-black text-gray-900">
              {isAdminLogin ? 'Admin Access' : isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="mt-1 text-gray-500 text-sm mb-6">
              {isAdminLogin
                ? 'Sign in with your admin credentials'
                : isSignup
                ? 'Join CSK to start your preparation journey'
                : 'Sign in to access your courses and dashboard'}
            </p>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-sm text-red-800">❌ {error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Full Name - signup only */}
              {isSignup && !isAdminLogin && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none transition-all"
                    placeholder="John Doe" />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none transition-all"
                  placeholder={isAdminLogin ? 'admin@csk.com' : 'you@example.com'} />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">Password</label>
                  {!isSignup && <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Forgot?</a>}
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none transition-all"
                  placeholder="••••••••" />
                {isSignup && <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>}
              </div>

              {/* SUBMIT */}
              <button type="submit" disabled={loading}
                className={`w-full px-6 py-3 text-white font-black text-lg rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isAdminLogin ? 'bg-gradient-to-r from-gray-700 to-gray-900' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                {loading ? '⏳ Processing...' : isAdminLogin ? '⚙️ Sign In as Admin' : isSignup ? 'Create Account' : 'Sign In'}
              </button>

              {/* Google / Phone — students only */}
              {!isAdminLogin && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                  </div>

                  {!showPhoneLogin ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" disabled={loading}
                        onClick={async () => {
                          setLoading(true)
                          try { await loginWithGoogle(); /* useEffect handles redirect */ }
                          catch (err: any) { setError(err.message || 'Google login failed.') }
                          finally { setLoading(false) }
                        }}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        <span>🔍</span> Google
                      </button>
                      <button type="button"
                        onClick={() => { setShowPhoneLogin(true); setError('') }}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <span>📱</span> Phone
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          disabled={otpSent}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none transition-all disabled:bg-gray-50" />
                        <p className="text-xs text-gray-500 mt-1">Format: +91XXXXXXXXXX (no spaces)</p>
                      </div>
                      <div id="recaptcha-container"></div>

                      {!otpSent ? (
                        <button type="button" disabled={loading}
                          onClick={async () => {
                            if (!phoneNumber.trim()) { setError('Please enter a phone number'); return }
                            setError('')
                            setLoading(true)
                            try {
                              const result = await loginWithPhone(phoneNumber.trim(), 'recaptcha-container')
                              setConfirmationResult(result)
                              setOtpSent(true)
                              setError('')
                            } catch (err: any) {
                              setError(err.message || 'Failed to send OTP. Check the number and try again.')
                            } finally { setLoading(false) }
                          }}
                          className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                          {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                      ) : (
                        <>
                          <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
                            <p className="text-sm text-green-800 font-semibold">✅ OTP sent to {phoneNumber}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Enter OTP</label>
                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                              placeholder="6-digit OTP"
                              maxLength={6}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none transition-all text-center text-xl tracking-widest font-bold" />
                          </div>
                          <button type="button" disabled={loading || otp.length < 6}
                            onClick={async () => {
                              if (!otp.trim()) { setError('Please enter the OTP'); return }
                              setError('')
                              setLoading(true)
                              try {
                                await verifyOTP(confirmationResult, otp.trim())
                                // useEffect will redirect to /dashboard
                              } catch (err: any) {
                                if (err.code === 'auth/invalid-verification-code') {
                                  setError('Invalid OTP. Please check and try again.')
                                } else if (err.code === 'auth/code-expired') {
                                  setError('OTP expired. Please request a new one.')
                                  setOtpSent(false)
                                  setConfirmationResult(null)
                                  setOtp('')
                                } else {
                                  setError(err.message || 'OTP verification failed.')
                                }
                              } finally { setLoading(false) }
                            }}
                            className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50">
                            {loading ? 'Verifying...' : 'Verify OTP & Login'}
                          </button>
                          <button type="button" disabled={loading}
                            onClick={async () => {
                              setOtpSent(false)
                              setConfirmationResult(null)
                              setOtp('')
                              setError('')
                            }}
                            className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                            Resend OTP
                          </button>
                        </>
                      )}

                      <button type="button" onClick={() => { setShowPhoneLogin(false); setPhoneNumber(''); setOtp(''); setOtpSent(false); setConfirmationResult(null); setError(''); clearRecaptcha() }}
                        className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                        Back to Email Login
                      </button>
                    </div>
                  )}
                </>
              )}
            </form>

            {/* Toggle Signup/Login — students only */}
            {!isAdminLogin && (
              <div className="mt-6 text-center">
                <p className="text-gray-700">
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                  <button onClick={() => { setIsSignup(!isSignup); setError(''); setEmail(''); setPassword(''); setFullName('') }}
                    className="text-indigo-600 font-bold hover:text-indigo-700">
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            )}

            {/* Admin note */}
            {isAdminLogin && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold">⚙️ Admin accounts are set up by the system. Contact the system owner if you need access.</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>By signing in, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
