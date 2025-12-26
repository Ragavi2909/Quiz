"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Star } from "lucide-react"
import { getTopicBySlug, getQuizzesByTopic } from "@/lib/api"
import { Header } from "@/components/header"
import { QuizCoverImage } from "@/components/quiz-cover-image"

export default function TopicPage({ params }) {
  const router = useRouter()
  const { slug } = params
  const [topic, setTopic] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicData = await getTopicBySlug(slug)
        setTopic(topicData)

        if (topicData && topicData.name) {
          const quizzesData = await getQuizzesByTopic(topicData.name)
          setQuizzes(quizzesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) {
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

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-teal-800 mb-4">Topic Not Found</h2>
            <p className="text-teal-600 mb-6">The topic you are looking for does not exist.</p>
            <Link href="/topics">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                Browse Topics
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-2 text-teal-700 hover:bg-teal-100"
            onClick={() => router.push("/topics")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Topics
          </Button>
          <h2 className="text-3xl font-bold text-teal-800">{topic.name}</h2>
        </div>

        <div className="bg-white rounded-lg border border-teal-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-bold text-teal-800 mb-2">About this Topic</h3>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-teal-100 text-teal-800">{topic.difficulty}</Badge>
                <Badge className="bg-cyan-100 text-cyan-800">{topic.quizCount} quizzes</Badge>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-teal-50 rounded-lg p-4 border border-teal-100">
              <h4 className="font-medium text-teal-800 mb-2">Ready to test your knowledge?</h4>
              <p className="text-sm text-teal-600 mb-4">Choose a quiz below to get started or create your own!</p>
              <Link href="/create">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                  Create Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-teal-800 mb-6">Available Quizzes</h3>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Link href={`/quiz/${quiz.id || quiz._id}`} key={quiz.id || quiz._id} className="block h-full">
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
                    <CardDescription className="text-teal-600">{quiz.questions?.length || 0} questions</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-gray-600 line-clamp-2">{quiz.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-teal-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor((quiz.timeLimit || 600) / 60)} min</span>
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
            <h3 className="text-xl font-medium text-teal-800 mb-2">No quizzes available yet</h3>
            <p className="text-teal-600 mb-6">Be the first to create a quiz for this topic!</p>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                Create Quiz
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
