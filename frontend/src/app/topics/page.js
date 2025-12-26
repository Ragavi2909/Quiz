"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Brain, Search, Clock, Star, BookOpen, ArrowLeft, Filter } from "lucide-react"
import { getAllTopics, getAllQuizzes } from "@/lib/api"
import { QuizCoverImage } from "@/components/quiz-cover-image"

export default function Topics() {
  const router = useRouter()
  const [topics, setTopics] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, quizzesData] = await Promise.all([getAllTopics(), getAllQuizzes()])
        setTopics(topicsData)
        setQuizzes(quizzesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTopics = topics.filter((topic) => topic.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "easy") return matchesSearch && quiz.difficulty.toLowerCase() === "easy"
    if (activeFilter === "medium") return matchesSearch && quiz.difficulty.toLowerCase() === "medium"
    if (activeFilter === "hard") return matchesSearch && quiz.difficulty.toLowerCase() === "hard"

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 text-gray-800">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-teal-800">QuizMaster</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-teal-400 text-teal-700 hover:bg-teal-100">
                Dashboard
              </Button>
            </Link>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                Create Quiz
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" className="mr-2 text-teal-700 hover:bg-teal-100" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-3xl font-bold text-teal-800">Explore Topics & Quizzes</h2>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search topics or quizzes..."
            className="pl-10 border-teal-200 focus-visible:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="topics" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-teal-100">
              <TabsTrigger value="topics" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Topics
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                All Quizzes
              </TabsTrigger>
            </TabsList>

            {/* Filter dropdown for quizzes tab */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-teal-700" />
              <select
                className="bg-white border border-teal-200 rounded-md text-sm p-1 text-teal-700"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <TabsContent value="topics">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-white/50 border-teal-100 animate-pulse h-48">
                    <div className="h-full"></div>
                  </Card>
                ))}
              </div>
            ) : filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                  <Link href={`/topics/${topic.slug}`} key={topic._id || topic.slug || topic.name} className="block h-full">
                    <Card className="bg-white border-teal-100 hover:bg-teal-50 transition-colors h-full shadow-sm hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
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
                        <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">{topic.difficulty}</Badge>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-teal-100">
                <h3 className="text-xl font-medium text-teal-800 mb-2">No topics found</h3>
                <p className="text-teal-600 mb-6">Try a different search term</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-white/50 border-teal-100 animate-pulse h-64">
                    <div className="h-full"></div>
                  </Card>
                ))}
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <Link href={`/quiz/${quiz._id}`} key={quiz._id} className="block h-full">
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
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-teal-100">
                <h3 className="text-xl font-medium text-teal-800 mb-2">No quizzes found</h3>
                <p className="text-teal-600 mb-6">Try a different search term or filter</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
