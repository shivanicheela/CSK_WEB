import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'

export default function Admin(){
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    { label: 'Total Students', value: '8,245', change: '+12%', icon: '👥' },
    { label: 'Active Courses', value: '6', change: 'Stable', icon: '📚' },
    { label: 'Revenue (Monthly)', value: '₹45.2L', change: '+18%', icon: '💰' },
    { label: 'Support Tickets', value: '42', change: '8 pending', icon: '🎫' },
  ]

  const recentEnrollments = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', course: 'UPSC Premium', date: '2 mins ago', status: 'Active' },
    { id: 2, name: 'Priya Devi', email: 'priya@email.com', course: 'TNPSC Group 4', date: '15 mins ago', status: 'Active' },
    { id: 3, name: 'Arun Singh', email: 'arun@email.com', course: 'UPSC Foundation', date: '1 hour ago', status: 'Pending' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage courses, students, and content</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">🔔</button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all">⚙️</button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 font-bold text-sm border-b-4 transition-all ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`py-4 px-2 font-bold text-sm border-b-4 transition-all ${activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              👥 Students
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`py-4 px-2 font-bold text-sm border-b-4 transition-all ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              📚 Content
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-2 font-bold text-sm border-b-4 transition-all ${activeTab === 'reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              📈 Reports
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
                      <p className="text-4xl font-black text-gray-900 mt-2">{stat.value}</p>
                      <p className="text-xs text-green-600 font-bold mt-1">{stat.change}</p>
                    </div>
                    <div className="text-5xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-black text-gray-900 mb-6">Recent Enrollments</h2>
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {enrollment.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{enrollment.name}</p>
                          <p className="text-xs text-gray-600">{enrollment.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{enrollment.course}</p>
                        <p className="text-xs text-gray-500">{enrollment.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${enrollment.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {enrollment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg text-white p-6">
                <h2 className="text-xl font-black mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all font-bold text-left">
                    ➕ Add New Course
                  </button>
                  <button className="w-full px-4 py-3 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all font-bold text-left">
                    📤 Upload Material
                  </button>
                  <button className="w-full px-4 py-3 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all font-bold text-left">
                    ✉️ Send Newsletter
                  </button>
                  <button className="w-full px-4 py-3 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all font-bold text-left">
                    🎯 Schedule Live Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">Manage Students</h2>
              <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all">
                + Add Student
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-3 font-bold text-gray-700">Name</th>
                    <th className="text-left py-3 font-bold text-gray-700">Email</th>
                    <th className="text-left py-3 font-bold text-gray-700">Course</th>
                    <th className="text-left py-3 font-bold text-gray-700">Status</th>
                    <th className="text-left py-3 font-bold text-gray-700">Progress</th>
                    <th className="text-right py-3 font-bold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-all">
                      <td className="py-4 font-semibold text-gray-900">{enrollment.name}</td>
                      <td className="py-4 text-gray-600">{enrollment.email}</td>
                      <td className="py-4 text-gray-600">{enrollment.course}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${enrollment.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-700 font-bold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Material */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">📤 Upload Study Material</h3>
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:bg-indigo-50 transition-all cursor-pointer">
                  <div className="text-4xl mb-3">📁</div>
                  <p className="font-bold text-gray-900">Drag files here or click to upload</p>
                  <p className="text-sm text-gray-600 mt-2">PDF, DOC, PPT, or Images</p>
                  <input type="file" className="hidden" />
                </div>
              </div>

              {/* Create Mock Test */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">✅ Create Mock Test</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Test Name" className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-600 outline-none" />
                  <select className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-indigo-600 outline-none bg-white">
                    <option>Select Course</option>
                    <option>UPSC Complete</option>
                    <option>TNPSC Group 4</option>
                  </select>
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all">
                    Create Test
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Content */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-6">📚 Existing Content</h3>
              <div className="space-y-3">
                {['GS Paper 1 Study Notes', 'Mock Test - History', 'Video Lectures - Polity', 'Current Affairs PDF'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                    <span className="font-semibold text-gray-900">{item}</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-bold text-xs hover:bg-blue-200">Edit</button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded font-bold text-xs hover:bg-red-200">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-200">
                <h3 className="font-bold text-gray-900 mb-4">📊 Monthly Revenue</h3>
                <div className="text-4xl font-black text-indigo-600 mb-2">₹45.2L</div>
                <p className="text-sm text-gray-700">+18% from last month</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
                <h3 className="font-bold text-gray-900 mb-4">📈 Student Growth</h3>
                <div className="text-4xl font-black text-emerald-600 mb-2">8,245</div>
                <p className="text-sm text-gray-700">+12% from last month</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Course Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-900">UPSC Premium</span>
                    <span className="text-gray-700">1,245 students</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div className="bg-indigo-600 h-3 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-900">TNPSC Group 4</span>
                    <span className="text-gray-700">980 students</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div className="bg-emerald-600 h-3 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
