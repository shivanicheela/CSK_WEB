import React from 'react'
import CourseCard from '../components/CourseCard'
import { Link, useNavigate } from 'react-router-dom'

export default function UPSC(){
  const navigate = useNavigate()
  const programs = [
    {
      title: "UPSC Prelims Focused",
      desc: "Master the fundamentals and clear the CSAT + GS hurdle with comprehensive concept coverage and PYQ analysis.",
      price: "₹7,999",
      features: ["250+ HD Concept Videos: Complete GS (Static + Dynamic) & CSAT coverage", "PYQ Trend Analysis: Deep-dive into UPSC's evolving question patterns and logic", "Teaching in Tamil | Standard English study materials", "Pre-Session PDFs: Daily high-yield notes provided before every lecture", "Current Affairs Plus: Integration of The Hindu, IE, and PIB for UPSC standards", "Prelims Test Series: Standard-quality mocks with detailed performance analytics"]
    },
    {
      title: "Integrated Prelims + Mains",
      desc: "A holistic approach for the serious civil service aspirant with comprehensive coverage of all GS papers and essay.",
      price: "₹12,999",
      features: ["500+ Analytical Videos: Comprehensive coverage of GS Papers I-IV and Essay", "Thematic PYQ Mapping: Topic-wise analysis of the last 10 years of UPSC Mains", "Teaching in Tamil | Standard English materials", "Mains Answer Lab: Periodic answer writing practice with expert evaluation", "Daily Prep Support: Subject-wise PDFs delivered daily to keep you ahead", "Integrated Test Series: Combined Prelims Mocks + Mains Answer Evaluation"]
    },
    {
      title: "1-on-1 Executive Coaching",
      desc: "Premium, on-demand mentorship for busy professionals with personalized guidance and flexible scheduling.",
      price: "₹19,999",
      features: ["Private Live Sessions: Daily 1-on-1 coaching scheduled at your convenience", "Executive Flexibility: A dynamic study plan that adapts to your work-life shifts", "Zero-Doubt Guarantee: We explain complex UPSC concepts until they are 100% clear", "Personalized PYQ Strategy: Target high-weightage topics to maximize limited study time", "Instant Feedback: Real-time correction of your Answer Writing and Logic", "Efficiency First: A No-Waste roadmap focused purely on clearing the cutoff"]
    }
  ]

  const highlights = [
    { emoji: '📚', title: 'Comprehensive Coverage', desc: 'All UPSC subjects covered with depth and clarity' },
    { emoji: '👨‍🏫', title: 'Expert Faculty', desc: 'Learn from IAS officers and subject matter experts' },
    { emoji: '📈', title: '95% Success Rate', desc: 'Our students consistently rank in top 500' },
    { emoji: '🤝', title: 'Community Support', desc: 'Learn and grow with 10000+ aspirants' },
    { emoji: '📱', title: 'Mobile Learning', desc: 'Access all content on the go, lifetime downloads' },
    { emoji: '🎯', title: 'Career Guidance', desc: 'Personalized guidance for your UPSC journey' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold"
          >
            ← Back
          </button>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-black leading-tight">UPSC CSE Mastery</h1>
          <p className="mt-4 text-xl md:text-2xl text-indigo-100 leading-relaxed max-w-2xl">
            Complete preparation for Union Public Service Commission. Study with India's top educators and join thousands of successful aspirants.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-yellow-400 text-indigo-900 font-black text-lg rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore Programs
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white/30 transition-all duration-300"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 text-center">
            <div className="text-4xl font-black text-indigo-600">8000+</div>
            <p className="mt-2 text-gray-700 font-semibold">Students Prepared</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 text-center">
            <div className="text-4xl font-black text-blue-600">450+</div>
            <p className="mt-2 text-gray-700 font-semibold">Selections Made</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 text-center">
            <div className="text-4xl font-black text-purple-600">300+</div>
            <p className="mt-2 text-gray-700 font-semibold">Hours Content</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6 border border-pink-200 text-center">
            <div className="text-4xl font-black text-pink-600">15+</div>
            <p className="mt-2 text-gray-700 font-semibold">Years Experience</p>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl md:text-4xl font-black text-gray-900 text-center mb-12">Why Choose CSK for UPSC?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-lg hover:border-indigo-300 transition-all">
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
              theme="upsc"
              features={prog.features}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black">Ready to Start Your UPSC Journey?</h2>
          <p className="mt-4 text-lg text-indigo-100">Get personalized guidance and join thousands of successful aspirants</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-yellow-400 text-indigo-900 font-black text-lg rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </button>
            <Link to="/contact" className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white/30 transition-all duration-300 inline-block">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
