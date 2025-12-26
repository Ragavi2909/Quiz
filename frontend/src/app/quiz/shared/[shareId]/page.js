"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, CheckCircle, XCircle, Brain, Star, Share2, User } from "lucide-react"
import { getQuizByShareId } from "@/lib/api"
import { QRCodeSVG } from "qrcode.react"
import { isAuthenticated, getUserProfile } from "@/lib/auth"
import { submitProgress } from "@/lib/api"
import { Header } from "@/components/header"

export default function SharedQuizPage({ params }) {
  const router = useRouter()
  const { shareId } = params
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [user, setUser] = useState(null)
  const [results, setResults] = useState(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is logged in
        if (isAuthenticated()) {
          const userData = await getUserProfile()
          setUser(userData)
        }

        const quizData = await getQuizByShareId(shareId)
        setQuiz(quizData)
        setTimeLeft(quizData.timeLimit || 600)
        setStartTime(Date.now())
      } catch (error) {
        console.error("Error fetching shared quiz:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [shareId])

  useEffect(() => {
    if (!quiz || quizCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setQuizCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, quizCompleted])

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return

    setSelectedAnswer(answerIndex)
    setIsAnswered(true)

    if (answerIndex === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
      setCorrectAnswers(correctAnswers + 1)
    } else {
      setWrongAnswers(wrongAnswers + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz?.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
      submitQuizResults()
    }
  }

  const submitQuizResults = useCallback(async () => {
    if (!user || !quiz || hasSubmittedRef.current) return
    hasSubmittedRef.current = true

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const progressData = {
        quizId: quiz._id,
        score: score,
        totalQuestions: quiz.questions.length,
        timeTaken: timeTaken,
      }

      const data = await submitProgress(progressData)
      setResults(data)
    } catch (error) {
      console.error("Error submitting quiz results:", error)
    }
  }, [quiz, score, startTime, user])

  useEffect(() => {
    if (!quizCompleted || timeLeft !== 0) return
    submitQuizResults()
  }, [quizCompleted, timeLeft, submitQuizResults])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-teal-800">Quiz Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">The quiz you are looking for does not exist or has been removed.</p>
          </CardContent>
          <CardFooter>
            <Link href="/topics">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">Browse Quizzes</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-teal-800">Quiz Completed!</CardTitle>
            <CardDescription className="text-teal-600">{quiz.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-teal-800 mb-2">{percentage}%</p>
              <p className="text-gray-600">
                You got {score} out of {quiz.questions.length} questions correct
              </p>
            </div>

            <Progress value={percentage} className="h-3 bg-gray-200" indicatorClassName="bg-teal-500" />

            <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
              <p className="text-teal-800 font-medium mb-2">Performance</p>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Correct: {score}</span>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span>Incorrect: {quiz.questions.length - score}</span>
                </div>
              </div>
            </div>

            {stars > 0 && (
              <div className="flex justify-center">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 flex items-center gap-2">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  ))}
                  <span className="text-yellow-800 font-medium">
                    {stars === 3 ? "Excellent!" : stars === 2 ? "Great job!" : "Good effort!"}
                  </span>
                </div>
              </div>
            )}

            {results?.leveledUp && (
              <div className="bg-gradient-to-r from-yellow-50 to-teal-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-600 fill-yellow-500" />
                  <p className="text-teal-900 font-semibold">Level Up!</p>
                </div>
                <p className="text-sm text-teal-700">You reached Level {results.newLevel}.</p>
              </div>
            )}

            <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Created by</span>
              </div>
              <p className="text-sm text-teal-600">{quiz.createdBy?.username || "Anonymous"}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {user ? (
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                onClick={() => router.push("/signup")}
              >
                Sign Up to Track Progress
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
              onClick={() => router.push("/topics")}
            >
              Browse More Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestionData = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" className="text-teal-700 hover:bg-teal-100" onClick={() => router.push("/topics")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit Quiz
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              <span className="font-medium text-teal-800">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-teal-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-teal-800 mb-2">{quiz.title}</h1>
                <p className="text-teal-600 mb-2">{quiz.description}</p>
                <div className="flex items-center gap-4 text-sm text-teal-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Created by {quiz.createdBy?.username || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                      {quiz.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">
                      {quiz.topic}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shareUrl = window.location.href
                  navigator.clipboard.writeText(shareUrl)
                }}
                className="text-teal-600 hover:bg-teal-50"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="text-teal-600 hover:bg-teal-50 ml-2"
                >
                  QR
                </Button>

                {showQRCode && (
                  <div className="absolute right-0 mt-2 p-3 bg-white border rounded-md shadow-lg z-10">
                    <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : ''} size={136} />
                    <div className="text-xs text-teal-600 mt-2 text-center">Scan to open quiz</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-teal-800">Question {currentQuestion + 1} of {quiz.questions.length}</h2>
            <span className="text-sm text-teal-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" indicatorClassName="bg-teal-500" />
        </div>

        {/* Question Card */}
        <Card className="bg-white border-teal-100 mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-teal-800">{currentQuestionData.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedAnswer === index
                    ? isAnswered && index === currentQuestionData.correctAnswer
                      ? "bg-green-100 border-green-300"
                      : isAnswered && index !== currentQuestionData.correctAnswer
                        ? "bg-red-100 border-red-300"
                        : "bg-teal-100 border-teal-300"
                    : isAnswered && index === currentQuestionData.correctAnswer
                      ? "bg-green-100 border-green-300"
                      : "bg-white border-teal-200 hover:bg-teal-50"
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      selectedAnswer === index
                        ? isAnswered && index === currentQuestionData.correctAnswer
                          ? "bg-green-500 text-white"
                          : isAnswered && index !== currentQuestionData.correctAnswer
                            ? "bg-red-500 text-white"
                            : "bg-teal-500 text-white"
                        : isAnswered && index === currentQuestionData.correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
                {isAnswered && index === currentQuestionData.correctAnswer && (
                  <div className="mt-2 text-green-600 text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Correct answer
                  </div>
                )}
                {isAnswered && selectedAnswer === index && index !== currentQuestionData.correctAnswer && (
                  <div className="mt-2 text-red-500 text-sm flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Incorrect answer
                  </div>
                )}
              </button>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={handleNextQuestion}
              disabled={!isAnswered}
            >
              {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
