"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, FileText, Trophy, ArrowRight, Clock, Star, GamepadIcon, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TicTacToe } from "@/components/tic-tac-toe"
import { getAllTopics, getFeaturedQuizzes } from "@/lib/api"
import { isAuthenticated } from "@/lib/auth"
import { Header } from "@/components/header"
import { QuizCoverImage } from "@/components/quiz-cover-image"

export default function Home() {
  const [topics, setTopics] = useState([])
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, quizzesData] = await Promise.all([getAllTopics(), getFeaturedQuizzes(3)])
        setTopics(topicsData.slice(0, 4)) // Only show first 4 topics
        setFeaturedQuizzes(quizzesData)
        setIsLoggedIn(isAuthenticated())
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 text-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500">
            Master Any Subject with Interactive Quizzes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Create, share, and take quizzes on any topic. Track your progress and improve your knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={isLoggedIn ? "/create" : "/signup"}>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-6 text-lg">
                {isLoggedIn ? "Create Quiz" : "Get Started"}
              </Button>
            </Link>
            <Link href="/topics">
              <Button variant="outline" className="border-teal-400 text-teal-700 hover:bg-teal-100 px-8 py-6 text-lg">
                Explore Topics
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-teal-800">Popular Topics</h3>
            <Link href="/topics" className="flex items-center text-teal-600 hover:text-teal-800">
              View all topics <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white/50 border-teal-100 animate-pulse h-48">
                  <div className="h-full"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topics.map((topic) => (
                <Link href={`/topics/${topic.slug}`} key={topic._id || topic.id || topic.slug || topic.name} className="block">
                  <Card className="bg-white border-teal-100 hover:bg-teal-50 transition-colors h-full shadow-sm hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-teal-800">{topic.name}</CardTitle>
                      </div>
                      <CardDescription className="text-teal-600">{topic.quizCount} quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{topic.description}</p>
                    </CardContent>
                    <CardFooter>
                      <div className="text-teal-600 text-sm">{topic.difficulty}</div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-teal-800">Featured Quizzes</h3>
            <Link href="/topics" className="flex items-center text-teal-600 hover:text-teal-800">
              Browse all quizzes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white/50 border-teal-100 animate-pulse h-64">
                  <div className="h-full"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredQuizzes.map((quiz) => (
                <Link href={`/quiz/${quiz._id || quiz.id}`} key={quiz._id || quiz.id} className="block h-full">
                  <Card className="bg-white border-teal-100 hover:bg-teal-50 transition-colors h-full shadow-sm hover:shadow-md">
                    <div className="relative h-40 w-full">
                      <QuizCoverImage quiz={quiz} className="object-cover rounded-t-lg" />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          quiz.difficulty === "Beginner"
                            ? "bg-green-100 text-green-800"
                            : quiz.difficulty === "Intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-teal-800">{quiz.title}</CardTitle>
                      <CardDescription className="text-teal-600">{quiz.topic}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 line-clamp-2">{quiz.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between text-sm text-teal-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(quiz.timeLimit / 60)} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center text-teal-800">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <Brain className="h-12 w-12 text-teal-500 mb-2" />
                <CardTitle className="text-teal-800">Learn Anything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access thousands of quizzes across various subjects and difficulty levels.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <FileText className="h-12 w-12 text-teal-500 mb-2" />
                <CardTitle className="text-teal-800">Create Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Build custom quizzes with multiple question types and share them with others.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <BookOpen className="h-12 w-12 text-teal-500 mb-2" />
                <CardTitle className="text-teal-800">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create and assign quizzes to students or colleagues and track their progress.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <Trophy className="h-12 w-12 text-teal-500 mb-2" />
                <CardTitle className="text-teal-800">Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your improvement with detailed statistics and performance insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
              <GamepadIcon className="h-6 w-6 text-teal-500" />
              Take a Break
            </h3>
            <p className="text-teal-600">Relax with a quick game of Tic-Tac-Toe</p>
          </div>

          <div className="max-w-md mx-auto">
            <TicTacToe />
          </div>
        </section>
      </main>

      <footer className="bg-teal-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Brain className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold">QuizMaster</h3>
              </div>
              <p className="text-teal-100 mb-4">
                Interactive learning platform for creating and taking quizzes on any topic.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-white hover:text-teal-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-teal-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-teal-100 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/topics" className="text-teal-100 hover:text-white">
                    Topics
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="text-teal-100 hover:text-white">
                    Create Quiz
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-teal-100 hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-teal-100 hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-teal-100 hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-teal-100 mb-4">Subscribe to our newsletter for updates and new features.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 rounded-l-md w-full focus:outline-none text-gray-800"
                />
                <button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-r-md">
                  <CheckCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-teal-700 mt-8 pt-8 text-center text-teal-100">
            <p>&copy; {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
