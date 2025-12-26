"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Clock, Target, Trophy, BookOpen, Star, Calendar } from "lucide-react"
import { isAuthenticated } from "@/lib/auth"
import { getUserProgress, getUserStats } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"

export default function ProgressPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to view your progress",
      })
      router.push("/login")
      return
    }

    // Fetch progress and stats
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [progressData, statsData] = await Promise.all([
          getUserProgress(),
          getUserStats()
        ])
        
        setProgress(progressData)
        setStats(statsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch progress data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  // Prepare data for charts
  const prepareChartData = () => {
    const topicPerformance = {}
    const dailyProgress = []
    
    progress.forEach((item) => {
      // Topic performance
      const topic = item.quizId?.topic || "Unknown"
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { total: 0, count: 0 }
      }
      topicPerformance[topic].total += item.percentage
      topicPerformance[topic].count += 1
      
      // Daily progress (last 7 days)
      const date = new Date(item.completedAt).toLocaleDateString()
      const existingDay = dailyProgress.find(d => d.date === date)
      if (existingDay) {
        existingDay.score = Math.max(existingDay.score, item.percentage)
      } else {
        dailyProgress.push({ date, score: item.percentage })
      }
    })
    
    const topicData = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      average: Math.round(data.total / data.count),
      count: data.count
    }))
    
    return { topicData, dailyProgress: dailyProgress.slice(-7) }
  }

  const { topicData, dailyProgress } = prepareChartData()

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-teal-800">Your Progress</h1>
          <p className="text-teal-600 mt-1">Track your learning journey and achievements</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Total Quizzes</CardTitle>
                <BookOpen className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{stats.totalQuizzesTaken}</div>
                <p className="text-xs text-teal-600">Completed quizzes</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Average Score</CardTitle>
                <Target className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{stats.averageScore}%</div>
                <p className="text-xs text-teal-600">Across all quizzes</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Best Score</CardTitle>
                <Trophy className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{stats.bestScore}%</div>
                <p className="text-xs text-teal-600">Highest achievement</p>
              </CardContent>
            </Card>

            <Card className="border-teal-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-600">Level</CardTitle>
                <Star className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-800">{stats.level}</div>
                <p className="text-xs text-teal-600">{stats.experiencePoints} XP</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-teal-100/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Topics
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Topic Performance Chart */}
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">Performance by Topic</CardTitle>
                  <CardDescription className="text-teal-600">
                    Your average scores across different topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topicData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="topic" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="average" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-teal-600">
                      No data available yet. Take some quizzes to see your progress!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Trend */}
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">Recent Progress</CardTitle>
                  <CardDescription className="text-teal-600">
                    Your quiz scores over the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-teal-600">
                      No recent activity. Start taking quizzes to track your progress!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Topic Distribution */}
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">Topic Distribution</CardTitle>
                  <CardDescription className="text-teal-600">
                    Number of quizzes taken per topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topicData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={topicData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ topic, count }) => `${topic}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {topicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-teal-600">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Topics Explored */}
              <Card className="border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">Topics Explored</CardTitle>
                  <CardDescription className="text-teal-600">
                    All the topics you have studied
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.topicsExplored?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {stats.topicsExplored.map((topic, index) => (
                        <Badge key={index} className="bg-teal-100 text-teal-800">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-teal-600 py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-teal-300" />
                      <p>Start exploring different topics to see them here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <Card className="border-teal-100">
              <CardHeader>
                <CardTitle className="text-teal-800">Quiz History</CardTitle>
                <CardDescription className="text-teal-600">
                  Your recent quiz attempts and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progress.length > 0 ? (
                  <div className="space-y-4">
                    {progress.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-100">
                        <div className="flex-1">
                          <h4 className="font-medium text-teal-800">{item.quizId?.title || "Unknown Quiz"}</h4>
                          <p className="text-sm text-teal-600">{item.quizId?.topic || "Unknown Topic"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-teal-500" />
                            <span className="text-xs text-teal-500">
                              {new Date(item.completedAt).toLocaleDateString()}
                            </span>
                            <Clock className="h-3 w-3 text-teal-500 ml-2" />
                            <span className="text-xs text-teal-500">
                              {Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-800">{item.percentage}%</div>
                          <p className="text-sm text-teal-600">
                            {item.score}/{item.totalQuestions} correct
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-teal-600 py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-teal-300" />
                    <p>No quiz history yet. Start taking quizzes to see your progress!</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      onClick={() => router.push("/topics")}
                    >
                      Browse Quizzes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
