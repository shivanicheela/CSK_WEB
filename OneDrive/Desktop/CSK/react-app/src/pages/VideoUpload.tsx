import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { uploadVideo } from '../firebase/storage.ts'
import { addVideoToDatabase, getVideosFromDatabase, deleteVideoFromDatabase } from '../firebase/firestore.ts'

interface Video {
  id: string
  title: string
  instructor: string
  duration: string
  description: string
  url: string
  courseId: string
  uploadedAt: string
}

export default function VideoUpload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    duration: '',
    description: '',
    courseId: 'upsc-general-studies',
    file: null as File | null
  })

  // Fetch videos on load
  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const videosData = await getVideosFromDatabase()
      setVideos(videosData)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file || !formData.title || !formData.instructor || !formData.duration || !formData.description) {
      alert('Please fill all fields and select a video file')
      return
    }

    if (!user?.uid) {
      alert('Please login first')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Upload video to Firebase Storage
      const videoUrl = await uploadVideo(
        formData.file,
        formData.courseId,
        setUploadProgress
      )

      // Save video metadata to Firestore
      await addVideoToDatabase({
        title: formData.title,
        instructor: formData.instructor,
        duration: formData.duration,
        description: formData.description,
        url: videoUrl,
        courseId: formData.courseId,
        uploadedBy: user.uid
      })

      alert('✅ Video uploaded successfully!')
      
      // Reset form
      setFormData({
        title: '',
        instructor: '',
        duration: '',
        description: '',
        courseId: 'upsc-general-studies',
        file: null
      })
      setUploadProgress(0)

      // Refresh video list
      fetchVideos()
    } catch (error: any) {
      alert(`❌ Error uploading video: ${error.message}`)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await deleteVideoFromDatabase(videoId)
      alert('✅ Video deleted successfully')
      fetchVideos()
    } catch (error: any) {
      alert(`❌ Error deleting video: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-gray-900">📹 Video Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage your lecture videos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 mb-4">📤 Upload Video</h2>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Modern Indian History"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Instructor Name</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. Rajesh Kumar"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 45 min"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe this lecture..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 h-24"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Course</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  >
                    <option value="upsc-general-studies">UPSC - General Studies</option>
                    <option value="tnpsc-mains">TNPSC - Mains</option>
                    <option value="current-affairs">Current Affairs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video File (MP4)</label>
                  <input
                    type="file"
                    accept="video/mp4"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                  {formData.file && (
                    <p className="text-sm text-green-600 mt-2">✅ {formData.file.name}</p>
                  )}
                </div>

                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105'
                  }`}
                >
                  {uploading ? `Uploading ${uploadProgress.toFixed(0)}%...` : '📤 Upload Video'}
                </button>
              </form>
            </div>
          </div>

          {/* Videos List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 mb-4">📺 Your Videos ({videos.length})</h2>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No videos uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload your first lecture using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{video.title}</h3>
                          <p className="text-sm text-gray-600">👨‍🏫 {video.instructor}</p>
                          <p className="text-sm text-gray-600">⏱️ {video.duration}</p>
                          <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                          <div className="flex gap-2 mt-3">
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                              {video.courseId}
                            </span>
                            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                              {new Date(video.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="ml-4 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
