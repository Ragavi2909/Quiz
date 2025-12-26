"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, FileText, Trophy, ArrowRight, Clock, Star, GamepadIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TicTacToe } from "@/components/tic-tac-toe"
import { getAllTopics, getFeaturedQuizzes } from "@/lib/api"

export default function Home() {
  const [topics, setTopics] = useState([])
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, quizzesData] = await Promise.all([getAllTopics(), getFeaturedQuizzes(3)])
        setTopics(topicsData.slice(0, 4)) // Only show first 4 topics
        setFeaturedQuizzes(quizzesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 text-gray-800">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">QuizGenius</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/topics">
              <Button variant="outline" className="border-purple-400 text-purple-700 hover:bg-purple-100">
                Explore
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
            Master Any Subject with Interactive Quizzes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Create, share, and take quizzes on any topic. Track your progress and improve your knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">Create Quiz</Button>
            </Link>
            <Link href="/topics">
              <Button
                variant="outline"
                className="border-purple-400 text-purple-700 hover:bg-purple-100 px-8 py-6 text-lg"
              >
                Explore Topics
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-purple-800">Popular Topics</h3>
            <Link href="/topics" className="flex items-center text-purple-600 hover:text-purple-800">
              View all topics <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white/50 border-purple-100 animate-pulse h-48">
                  <div className="h-full"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topics.map((topic) => (
                <Link href={`/topics/${topic.slug}`} key={topic.id} className="block">
                  <Card className="bg-white border-purple-100 hover:bg-purple-50 transition-colors h-full">
                    <CardHeader>
                      <CardTitle className="text-purple-800">{topic.name}</CardTitle>
                      <CardDescription className="text-purple-500">{topic.quizCount} quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{topic.description}</p>
                    </CardContent>
                    <CardFooter>
                      <div className="text-purple-500 text-sm">{topic.difficulty}</div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-purple-800">Featured Quizzes</h3>
            <Link href="/topics" className="flex items-center text-purple-600 hover:text-purple-800">
              Browse all quizzes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white/50 border-purple-100 animate-pulse h-64">
                  <div className="h-full"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredQuizzes.map((quiz) => (
                <Link
                  href={`/topics/${quiz.topic.toLowerCase().replace(/\s+/g, "-")}`}
                  key={quiz.id}
                  className="block h-full"
                >
                  <Card className="bg-white border-purple-100 hover:bg-purple-50 transition-colors h-full">
                    <div className="relative h-40 w-full">
                      <Image
                        src={quiz.imageUrl || "/placeholder.svg?height=200&width=400"}
                        alt={quiz.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-purple-800">{quiz.title}</CardTitle>
                        <Badge
                          className={`${
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
                      <CardDescription className="text-purple-500">{quiz.topic}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 line-clamp-2">{quiz.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between text-sm text-purple-500">
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
          <h3 className="text-2xl font-bold mb-6 text-center text-purple-800">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-purple-100">
              <CardHeader className="pb-2">
                <Brain className="h-12 w-12 text-purple-500 mb-2" />
                <CardTitle className="text-purple-800">Learn Anything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access thousands of quizzes across various subjects and difficulty levels.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100">
              <CardHeader className="pb-2">
                <FileText className="h-12 w-12 text-purple-500 mb-2" />
                <CardTitle className="text-purple-800">Create Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Build custom quizzes with multiple question types and share them with others.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100">
              <CardHeader className="pb-2">
                <BookOpen className="h-12 w-12 text-purple-500 mb-2" />
                <CardTitle className="text-purple-800">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create and assign quizzes to students or colleagues and track their progress.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-100">
              <CardHeader className="pb-2">
                <Trophy className="h-12 w-12 text-purple-500 mb-2" />
                <CardTitle className="text-purple-800">Track Progress</CardTitle>
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
            <h3 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
              <GamepadIcon className="h-6 w-6 text-purple-500" />
              Take a Break
            </h3>
            <p className="text-purple-500">Relax with a quick game of Tic-Tac-Toe</p>
          </div>

          <div className="max-w-md mx-auto">
            <TicTacToe />
          </div>
        </section>
      </main>
    </div>
  )
}
