"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, BookOpen, Clock, Search, Trash2, Edit, TrendingUp, Target, Trophy, Star } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"
import { getUserQuizzes, getAllTopics, deleteQuiz, getUserStats, getUserProgress } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [topics, setTopics] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("my-quizzes")
  const [isDeleting, setIsDeleting] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [progressRecords, setProgressRecords] = useState([])

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to view your dashboard",
      })
      router.push("/login")
      return
    }

    // Fetch user's quizzes and topics
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [quizzesData, topicsData, statsData, progressData] = await Promise.all([
          getUserQuizzes(),
          getAllTopics(),
          getUserStats(),
          getUserProgress(),
        ])
        setQuizzes(quizzesData)
        setTopics(topicsData)
        setUserStats(statsData)
        setProgressRecords(Array.isArray(progressData) ? progressData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  const topicCounts = progressRecords.reduce((acc, record) => {
    const topic = record?.quizId?.topic || record?.topic
    if (!topic) return acc
    acc[topic] = (acc[topic] || 0) + 1
    return acc
  }, {})

  const topicChartData = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const difficultyCounts = progressRecords.reduce((acc, record) => {
    const difficulty = String(record?.quizId?.difficulty || record?.difficulty || "").toLowerCase()
    if (!difficulty) return acc
    const key = difficulty === "easy" || difficulty === "medium" || difficulty === "hard" ? difficulty : "other"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const difficultyChartData = Object.entries(difficultyCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)

  const scoreOverTimeData = [...progressRecords]
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .slice(-12)
    .map((record) => {
      const dt = new Date(record.completedAt)
      const label = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return {
        date: label,
        score: Number.isFinite(record.percentage) ? record.percentage : Number(record.percentage) || 0,
      }
    })

  const difficultyColors = {
    easy: "#22c55e",
    medium: "#14b8a6",
    hard: "#ef4444",
    other: "#94a3b8",
  }

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.topic.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle quiz deletion
  const handleDeleteQuiz = async (id) => {
    if (confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      setIsDeleting(true)
      try {
        await deleteQuiz(id)
        setQuizzes(quizzes.filter((quiz) => quiz._id !== id))
        toast({
          title: "Success",
          description: "Quiz deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting quiz:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete quiz",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      <Header />

      <div className="container py-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-teal-800">Dashboard</h1>
            <p className="text-teal-600 mt-1">Manage your quizzes and explore topics</p>
          </div>
          <Button
            onClick={() => router.push("/create")}
            className="group transition-all duration-300 hover:scale-105 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <PlusCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Create Quiz
          </Button>
        </div>

        <div className="mb-8">
          {activeTab === "my-quizzes" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
              <Input
                placeholder="Search quizzes by title or topic..."
                className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Quizzes Taken</CardTitle>
                <BookOpen className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{userStats.totalQuizzesTaken}</div>
                <p className="text-xs text-teal-600">Total completed</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Average Score</CardTitle>
                <Target className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{userStats.averageScore}%</div>
                <p className="text-xs text-teal-600">Across all quizzes</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Best Score</CardTitle>
                <Trophy className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{userStats.bestScore}%</div>
                <p className="text-xs text-teal-600">Highest achievement</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Level</CardTitle>
                <Star className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{userStats.level}</div>
                <p className="text-xs text-teal-600">{userStats.experiencePoints} XP</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-teal-100">
              <CardHeader>
                <CardTitle className="text-teal-800">Quizzes Taken by Topic</CardTitle>
                <CardDescription className="text-teal-600">Based on your completed quizzes</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {topicChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicChartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="topic" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Quizzes" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-teal-600">No progress data yet</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader>
                <CardTitle className="text-teal-800">Difficulty Split</CardTitle>
                <CardDescription className="text-teal-600">Where you spend your time</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {difficultyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie data={difficultyChartData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={3}>
                        {difficultyChartData.map((entry) => (
                          <Cell key={entry.name} fill={difficultyColors[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-teal-600">No difficulty data yet</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-teal-100 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-teal-800">Score Trend</CardTitle>
                <CardDescription className="text-teal-600">Your last 12 quiz attempts</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {scoreOverTimeData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreOverTimeData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                      <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-teal-600">Complete a few quizzes to see the trend</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="my-quizzes" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className="bg-teal-100/50">
            <TabsTrigger value="my-quizzes" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              My Quizzes
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Browse Topics
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-1" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-quizzes" className="space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-teal-100">
                    <CardHeader className="pb-2">
                      <div className="h-6 bg-teal-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-teal-100 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-teal-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-teal-100 rounded w-5/6"></div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="h-8 bg-teal-100 rounded w-1/4"></div>
                      <div className="h-8 bg-teal-100 rounded w-1/4"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <Card
                    key={quiz._id}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg group border-teal-100"
                  >
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 w-full transform origin-left transition-transform group-hover:scale-x-100"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1 text-teal-800">{quiz.title}</CardTitle>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-teal-600">
                        <Clock className="h-3 w-3" />
                        Created on {formatDate(quiz.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-teal-200 text-teal-700">
                          {quiz.topic}
                        </Badge>
                        <Badge variant="outline" className="border-teal-200 text-teal-700">
                          {quiz.questions.length} questions
                        </Badge>
                      </div>
                      {quiz.description && <p className="text-sm text-teal-600 line-clamp-2">{quiz.description}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/quiz/${quiz._id}`)}
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        Take Quiz
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/quiz/${quiz._id}/edit`)}
                          className="text-teal-700 hover:bg-teal-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="text-red-600 hover:bg-red-50"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">No quizzes found</CardTitle>
                  <CardDescription className="text-teal-600">
                    {searchQuery
                      ? "No quizzes match your search criteria. Try a different search term."
                      : "You haven't created any quizzes yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-teal-300 mb-4" />
                  <p className="text-center text-teal-600 mb-4">
                    {searchQuery
                      ? "Try searching for something else or clear your search."
                      : "Create your first quiz to get started!"}
                  </p>
                  <Button
                    onClick={() => router.push("/create")}
                    className="group transition-all duration-300 hover:scale-105 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    <PlusCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="topics" className="space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse border-teal-100">
                    <CardHeader className="pb-2">
                      <div className="h-6 bg-teal-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-teal-100 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-teal-100 rounded w-full mb-2"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-8 bg-teal-100 rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topics.map((topic) => (
                  <Card
                    key={topic._id}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg group border-teal-100"
                  >
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 w-full transform origin-left transition-transform group-hover:scale-x-100"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-teal-800">
                        <span className="text-2xl">{topic.icon}</span>
                        {topic.name}
                      </CardTitle>
                      <CardDescription className="text-teal-600">
                        {topic.description || `Quizzes about ${topic.name}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-teal-600">Explore quizzes in this topic</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                        onClick={() => router.push(`/topics/${topic.slug || topic.name}`)}
                      >
                        Browse Quizzes
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            <Card className="border-teal-100">
              <CardHeader>
                <CardTitle className="text-teal-800">Your Progress</CardTitle>
                <CardDescription className="text-teal-600">
                  View detailed statistics and track your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <TrendingUp className="h-12 w-12 text-teal-300 mb-4" />
                <p className="text-center text-teal-600 mb-4">
                  Track your quiz performance, view detailed statistics, and monitor your learning progress over time.
                </p>
                <Button
                  onClick={() => router.push("/progress")}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  View Detailed Progress
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
