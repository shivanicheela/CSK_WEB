import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { useAuth } from '../context/AuthContext.tsx'

export default function Home(){
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Crack UPSC & TNPSC with <span className="text-yellow-300">Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 leading-relaxed">
              Expert-led coaching, live interactive sessions, comprehensive study materials, and personalized mock tests. Your success story starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-yellow-400 text-indigo-900 font-bold rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => navigate('/courses')}
                className="px-8 py-4 bg-white/20 backdrop-blur text-white font-bold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 text-center"
              >
                Explore Courses
              </button>
            </div>

          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-2xl opacity-75"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-10 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="/images/csk-logo.png"
                alt="CSK Logo"
                className="w-72 h-72 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-4">Why Choose CSK?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Everything you need to succeed in your civil services journey</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎥', title: 'Live Sessions', desc: 'Interactive classes with expert instructors. Real-time doubt clarification.' },
              { icon: '📚', title: 'Study Materials', desc: 'Comprehensive PDFs, notes, and question papers for UPSC & TNPSC.' },
              { icon: '✅', title: 'Mock Tests', desc: 'Unlimited practice tests with instant feedback and performance analytics.' },
              { icon: '👥', title: 'Community', desc: 'Connect with 5000+ aspirants. Share strategies and learn together.' },
              { icon: '📱', title: 'Mobile Access', desc: 'Study anytime, anywhere. Full access on mobile and desktop.' },
              { icon: '🎖️', title: 'Certified', desc: 'Recognized coaching institute with proven track record.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:translate-y-[-4px]">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-4">Our Courses</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Choose your path to success</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <CourseCard 
              title="UPSC Complete Program" 
              description="Comprehensive coverage of General Studies (Paper 1-4), optional subjects, current affairs, and advanced answer-writing techniques." 
              price="From ₹9,999/year" 
              theme="upsc"
              features={['500+ hours content', 'Live classes 3x/week', 'Mock tests monthly', 'Doubt sessions daily']}
            />
            <CourseCard 
              title="TNPSC Foundation Course" 
              description="State-specific syllabus with Tamil Nadu current affairs, local history, and custom mock tests designed by experienced educators." 
              price="From ₹4,999/year" 
              theme="tnpsc"
              features={['300+ hours content', 'Live classes 2x/week', 'State-specific focus', 'Group discussions']}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-12">Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Raj Kumar', role: 'UPSC Prelims 2025', text: 'Excellent guidance and crystal-clear concepts. The mock tests helped me practice under exam conditions.', stars: 5 },
              { name: 'Priya Singh', role: 'TNPSC Rank 89', text: 'Best investment for my TNPSC preparation. Faculty is highly knowledgeable and supportive.', stars: 5 },
              { name: 'Arjun Das', role: 'UPSC Mains Qualified', text: 'The answer-writing sessions transformed my approach. Recommend CSK to all aspirants!', stars: 5 },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                <div className="font-bold text-indigo-600">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-black">Ready to Transform Your Future?</h2>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">Join thousands of successful aspirants. Start your journey today.</p>
          <Link 
            to="/login" 
            className="inline-block px-10 py-4 bg-yellow-400 text-indigo-900 font-bold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
          >
            Enroll Now - Limited Time Offer
          </Link>
        </div>
      </section>
    </div>
  )
}
