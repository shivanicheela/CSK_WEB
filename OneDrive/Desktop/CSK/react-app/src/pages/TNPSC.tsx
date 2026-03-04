import React from 'react'
import CourseCard from '../components/CourseCard'
import { Link, useNavigate } from 'react-router-dom'

export default function TNPSC(){
  const navigate = useNavigate()
  const programs = [
    {
      title: "TNPSC Group 4 Mastery",
      desc: "Complete preparation for Tamil Nadu Public Service Commission Group 4 exams with state-specific content.",
      price: "₹5,999",
      features: ["180+ HD Videos", "Weekly Live Classes", "Tamil Nadu Current Affairs", "Monthly Tests", "State-focused Strategy", "12 Months Access"]
    },
    {
      title: "Combined Civil Services",
      desc: "Comprehensive program for TNPSC combined civil services with advanced guidance and personalized support.",
      price: "₹12,999",
      features: ["250+ Videos", "Bi-weekly Live Classes", "Answer Writing Coaching", "Subject Expertise", "Interview Prep", "18 Months Access"]
    },
    {
      title: "Premium Executive Pack",
      desc: "All-inclusive package with mentoring, mock interviews, and career guidance for maximum success.",
      price: "₹19,999",
      features: ["All Content Included", "Weekly Mentoring Sessions", "Mock Interviews", "One-on-One Guidance", "Career Counseling", "24 Months Access"]
    }
  ]

  const highlights = [
    { emoji: '🏛️', title: 'State-Specific Content', desc: 'Tailored syllabus for Tamil Nadu examinations' },
    { emoji: '🗣️', title: 'Tamil & English Media', desc: 'Learn in your preferred language with equal quality' },
    { emoji: '🎯', title: '92% Success Rate', desc: 'Highest selection rate among Tamil Nadu exam takers' },
    { emoji: '💡', title: 'Local Current Affairs', desc: 'Deep focus on TN politics, history, and geography' },
    { emoji: '👥', title: '5000+ Selections', desc: 'Join thousands of successful TNPSC candidates' },
    { emoji: '📊', title: 'Smart Analytics', desc: 'Track your progress with detailed performance metrics' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all font-semibold"
          >
            ← Back
          </button>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-700 via-teal-600 to-green-700 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-black leading-tight">TNPSC Excellence</h1>
          <p className="mt-4 text-xl md:text-2xl text-emerald-100 leading-relaxed max-w-2xl">
            Dominate Tamil Nadu Public Service Commission exams. Specially designed for state-specific requirements and highest selection rates.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-emerald-500 text-white font-black text-lg rounded-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore Programs
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white/30 transition-all duration-300"
            >
              Free Demo Class
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 text-center">
            <div className="text-4xl font-black text-emerald-600">5000+</div>
            <p className="mt-2 text-gray-700 font-semibold">Selections Made</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6 border border-teal-200 text-center">
            <div className="text-4xl font-black text-teal-600">25000+</div>
            <p className="mt-2 text-gray-700 font-semibold">Students Trained</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
            <div className="text-4xl font-black text-green-600">250+</div>
            <p className="mt-2 text-gray-700 font-semibold">Hours Content</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-200 text-center">
            <div className="text-4xl font-black text-emerald-600">12+</div>
            <p className="mt-2 text-gray-700 font-semibold">Years In TN Exams</p>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl md:text-4xl font-black text-gray-900 text-center mb-12">Why Choose CSK for TNPSC?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-lg hover:border-emerald-300 transition-all">
              <div className="text-5xl mb-3">{item.emoji}</div>
              <h3 className="text-xl font-black text-gray-900">{item.title}</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Programs Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl md:text-4xl font-black text-gray-900 text-center mb-12">Our Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((prog, idx) => (
            <CourseCard 
              key={idx}
              title={prog.title}
              description={prog.desc}
              price={prog.price}
              theme="tnpsc"
              features={prog.features}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-16 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black">Ace Your TNPSC Exam Today</h2>
          <p className="mt-4 text-lg text-emerald-100">Get expert guidance tailored for Tamil Nadu's unique requirements</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-yellow-400 text-emerald-900 font-black text-lg rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Join Today
            </button>
            <Link to="/contact" className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white/30 transition-all duration-300 inline-block">
              Talk to Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
