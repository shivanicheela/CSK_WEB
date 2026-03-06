import React, { useState, useEffect } from 'react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
}

interface MockTestEngineProps {
  testId: string
  testName: string
  totalQuestions: number
  timeLimit: number // in minutes
  passingScore: number
  questions: Question[]
  onComplete: (score: number, answers: Record<number, number>) => void
  onClose: () => void
}

export default function MockTestEngine({
  testId,
  testName,
  totalQuestions,
  timeLimit,
  passingScore,
  questions,
  onComplete,
  onClose,
}: MockTestEngineProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60) // convert to seconds
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [showReview, setShowReview] = useState(false)

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || isTestCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isTestCompleted])

  const currentQuestion = questions[currentQuestionIndex]
  const timeLeftMinutes = Math.floor(timeLeft / 60)
  const timeLeftSeconds = timeLeft % 60

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = () => {
    let correctCount = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / questions.length) * 100)
    setScore(finalScore)
    setIsTestCompleted(true)
  }

  if (isTestCompleted && !showReview) {
    const passed = score >= passingScore
    const attemptedQuestions = Object.keys(answers).length

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div
            className={`text-6xl font-black mb-4 ${
              passed ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {passed ? '🎉' : '💪'}
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {passed ? 'Passed!' : 'Not Passed'}
          </h2>

          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            <p className="text-5xl font-black text-indigo-600 mb-2">{score}%</p>
            <p className="text-gray-600">
              {Math.round(
                (answers[questions[0].id] !== undefined ? Object.keys(answers).length : 0) /
                  questions.length *
                  100
              )}
              % Questions Attempted
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-gray-600">Correct</p>
              <p className="text-2xl font-black text-green-600">
                {Math.round((score / 100) * questions.length)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-gray-600">Incorrect</p>
              <p className="text-2xl font-black text-red-600">
                {questions.length - Math.round((score / 100) * questions.length)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowReview(true)}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all mb-2"
          >
            📋 Review Answers
          </button>

          <button
            onClick={() => {
              onComplete(score, answers)
              onClose()
            }}
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showReview) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl max-w-2xl w-full p-8 my-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">📋 Answer Review</h2>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id]
              const isCorrect = userAnswer === q.correctAnswer

              return (
                <div key={q.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`text-2xl font-black w-8 h-8 flex items-center justify-center rounded-full ${
                        isCorrect
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        Q{idx + 1}. {q.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Category: {q.category}</p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2 mb-3">
                    {q.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded text-sm ${
                          optIdx === q.correctAnswer
                            ? 'bg-green-50 border border-green-200 text-green-800 font-semibold'
                            : userAnswer === optIdx && !isCorrect
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}) {option}
                        {optIdx === q.correctAnswer && ' ✓ Correct'}
                        {userAnswer === optIdx && !isCorrect && ' ✗ Your answer'}
                      </div>
                    ))}
                  </div>

                  <div className="ml-11 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                    <p className="font-bold mb-1">💡 Explanation:</p>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setShowReview(false)}
            className="w-full mt-6 px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-4 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{testName}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="text-center">
              <div className="text-sm font-bold text-gray-600 mb-1">Progress</div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Timer */}
            <div
              className={`text-center px-4 py-2 rounded-lg font-bold ${
                timeLeftMinutes === 0 && timeLeftSeconds < 60
                  ? 'bg-red-100 text-red-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <div className="text-xs">Time Left</div>
              <div className="text-lg">
                {timeLeftMinutes}:{String(timeLeftSeconds).padStart(2, '0')}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Exit Test"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Question */}
          <div className="bg-white rounded-xl p-8 mb-8 shadow-md">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Q{currentQuestionIndex + 1}. {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full p-4 text-left rounded-lg font-semibold border-2 transition-all ${
                    answers[currentQuestion.id] === idx
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-indigo-300'
                  }`}
                >
                  <span className="text-lg font-black">
                    {String.fromCharCode(65 + idx)}.
                  </span>{' '}
                  {option}
                  {answers[currentQuestion.id] === idx && ' ✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-md">
            <p className="text-sm font-bold text-gray-600 mb-4">Questions</p>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                    currentQuestionIndex === idx
                      ? 'bg-indigo-600 text-white scale-110'
                      : answers[q.id] !== undefined
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t-2 border-gray-200 px-6 py-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="px-6 py-3 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>

          <div className="flex-1" />

          <button
            onClick={handleSubmitTest}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
          >
            ✓ Submit Test
          </button>
        </div>
      </div>
    </div>
  )
}
