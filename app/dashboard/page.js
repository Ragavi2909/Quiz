"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BookOpen, Brain, FileText, Trophy, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { getUserQuizStats } from "@/lib/api"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you'd pass the actual user ID
        const userStats = await getUserQuizStats("user123")

        // If no stats are available yet, use mock data
        setStats(
          userStats || {
            totalQuizzes: 12,
            totalCorrect: 87,
            totalWrong: 23,
            quizzesByTopic: [
              { name: "Computer Science", value: 5 },
              { name: "Mathematics", value: 3 },
              { name: "Science", value: 2 },
              { name: "History", value: 2 },
            ],
            recentQuizzes: [
              { id: 1, title: "Programming Basics", score: 85, date: "2023-05-15", totalQuestions: 20 },
              { id: 2, title: "Algebra Fundamentals", score: 92, date: "2023-05-10", totalQuestions: 15 },
              { id: 3, title: "World History", score: 78, date: "2023-05-05", totalQuestions: 25 },
            ],
          },
        )
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Colors for the pie chart
  const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"]

  // Calculate percentages for the performance chart
  const performanceData = stats
    ? [
        { name: "Correct", value: stats.totalCorrect },
        { name: "Wrong", value: stats.totalWrong },
      ]
    : []

  const performanceColors = ["#10b981", "#ef4444"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 text-gray-800">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">QuizMaster</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/topics">
              <Button variant="outline" className="border-purple-400 text-purple-700 hover:bg-purple-100">
                Explore
              </Button>
            </Link>
            <Link href="/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-purple-800">Your Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-500">Total Quizzes Taken</CardDescription>
              <CardTitle className="text-3xl text-purple-800">{stats?.totalQuizzes || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <Trophy className="inline-block h-4 w-4 mr-1 text-yellow-500" />
                Keep learning!
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-500">Correct Answers</CardDescription>
              <CardTitle className="text-3xl text-purple-800">{stats?.totalCorrect || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{
                      width: `${stats ? (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-500">Average Score</CardDescription>
              <CardTitle className="text-3xl text-purple-800">
                {stats ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100) : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <FileText className="inline-block h-4 w-4 mr-1 text-purple-500" />
                Based on all your quizzes
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-500">Topics Explored</CardDescription>
              <CardTitle className="text-3xl text-purple-800">{stats?.quizzesByTopic?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <BookOpen className="inline-block h-4 w-4 mr-1 text-purple-500" />
                Explore more topics!
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-purple-100 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-purple-800">Quiz Performance</CardTitle>
              <CardDescription className="text-purple-500">Your correct vs. incorrect answers</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={performanceColors[index % performanceColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-100">
            <CardHeader>
              <CardTitle className="text-purple-800">Topics Breakdown</CardTitle>
              <CardDescription className="text-purple-500">Quizzes by subject</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.quizzesByTopic || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats?.quizzesByTopic?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="recent" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-800">Your Quizzes</h3>
              <TabsList className="bg-purple-50">
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
                >
                  Recent
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
                >
                  Favorites
                </TabsTrigger>
                <TabsTrigger
                  value="created"
                  className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
                >
                  Created by You
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="bg-white border-purple-100 animate-pulse h-48">
                        <div className="h-full"></div>
                      </Card>
                    ))
                ) : stats?.recentQuizzes?.length > 0 ? (
                  stats.recentQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="bg-white border-purple-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-purple-800">{quiz.title}</CardTitle>
                        <CardDescription className="text-purple-500">
                          Taken on {new Date(quiz.date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm text-gray-600">Your Score</div>
                          <div className="text-lg font-bold text-purple-800">{quiz.score}%</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              quiz.score >= 80 ? "bg-green-500" : quiz.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${quiz.score}%` }}
                          ></div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {quiz.totalQuestions} questions
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-purple-100">
                    <h3 className="text-xl font-medium text-purple-800 mb-2">No quizzes taken yet</h3>
                    <p className="text-purple-500 mb-6">Start exploring and taking quizzes!</p>
                    <Link href="/topics">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">Browse Topics</Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="text-center py-12 bg-white rounded-lg border border-purple-100">
                <h3 className="text-xl font-medium text-purple-800 mb-2">No favorite quizzes yet</h3>
                <p className="text-purple-500 mb-6">Mark quizzes as favorites to find them easily!</p>
                <Link href="/topics">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">Browse Topics</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="created">
              <div className="text-center py-12 bg-white rounded-lg border border-purple-100">
                <h3 className="text-xl font-medium text-purple-800 mb-2">You haven't created any quizzes yet</h3>
                <p className="text-purple-500 mb-6">Create your first quiz to share with others!</p>
                <Link href="/create">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">Create Quiz</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
