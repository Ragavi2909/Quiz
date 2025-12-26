"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { isAuthenticated } from "@/lib/auth"
import { getQuizById, updateQuiz, getAllTopics } from "@/lib/api"
import { Header } from "@/components/header"

export default function EditQuizPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    topic: "",
    difficulty: "Medium",
    timeLimit: 600,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ],
  })
  const [errors, setErrors] = useState({})
  const [topics, setTopics] = useState([])

  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to edit a quiz",
      })
      router.push("/login")
      return
    }

    const load = async () => {
      try {
        const [quiz, topicsData] = await Promise.all([getQuizById(id), getAllTopics()])
        setTopics(topicsData)
        setQuizData({
          title: quiz.title || "",
          description: quiz.description || "",
          topic: quiz.topic || (topicsData[0]?.name || ""),
          difficulty: quiz.difficulty || "Medium",
          timeLimit: quiz.timeLimit || 600,
          questions: quiz.questions?.length
            ? quiz.questions.map((q) => ({
                question: q.question || "",
                options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""],
                correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
              }))
            : [
                {
                  question: "",
                  options: ["", "", "", ""],
                  correctAnswer: 0,
                },
              ],
        })
      } catch (error) {
        console.error("Error loading quiz:", error)
        toast({ variant: "destructive", title: "Error", description: "Failed to load quiz" })
        router.push("/dashboard")
      }
    }

    load()
  }, [id, router, toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuizData({ ...quizData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: "" })
  }

  const handleSelectChange = (name, value) => {
    setQuizData({ ...quizData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: "" })
  }

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizData.questions]
    if (field === "options") {
      const [optionIndex, optionValue] = value
      updated[index].options[optionIndex] = optionValue
    } else if (field === "correctAnswer") {
      updated[index].correctAnswer = Number.parseInt(value)
    } else {
      updated[index][field] = value
    }
    setQuizData({ ...quizData, questions: updated })
  }

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        { question: "", options: ["", "", "", ""], correctAnswer: 0 },
      ],
    })
  }

  const removeQuestion = (index) => {
    if (quizData.questions.length === 1) {
      toast({ variant: "destructive", title: "Error", description: "Quiz must have at least one question" })
      return
    }
    const updated = [...quizData.questions]
    updated.splice(index, 1)
    setQuizData({ ...quizData, questions: updated })
    const key = `question_${index}`
    if (errors[key]) {
      const newErrors = { ...errors }
      delete newErrors[key]
      setErrors(newErrors)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!quizData.title.trim()) newErrors.title = "Title is required"
    if (!quizData.topic.trim()) newErrors.topic = "Topic is required"
    quizData.questions.forEach((q, i) => {
      if (!q.question.trim()) newErrors[`question_${i}`] = "Question text is required"
      q.options.forEach((opt, j) => {
        if (!opt.trim()) newErrors[`question_${i}_option_${j}`] = "Option is required"
      })
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const payload = { ...quizData }
      const updated = await updateQuiz(id, payload)
      toast({ title: "Success", description: "Quiz updated" })
      router.push(`/quiz/${updated._id || id}`)
    } catch (error) {
      console.error("Update failed:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to update quiz" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      <Header />
      <div className="container max-w-4xl py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-teal-800">Edit Quiz</h1>
          <p className="text-teal-600">Update details and questions, then save your changes.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-teal-100">
            <CardHeader>
              <CardTitle className="text-teal-800">Quiz Details</CardTitle>
              <CardDescription className="text-teal-600">Basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-teal-700">Title <span className="text-red-500">*</span></Label>
                <Input id="title" name="title" value={quizData.title} onChange={handleInputChange} placeholder="Enter title" />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-teal-700">Description</Label>
                <Textarea id="description" name="description" value={quizData.description} onChange={handleInputChange} placeholder="Enter description" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-teal-700">Topic <span className="text-red-500">*</span></Label>
                  <Select value={quizData.topic} onChange={(e) => handleSelectChange("topic", e.target.value)} className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 ${errors.topic ? "border-red-500" : ""}`}>
                    <option value="">Select a topic</option>
                    {topics.map((t) => (
                      <option key={t._id || t.slug || t.name} value={t.name}>{t.name}</option>
                    ))}
                  </Select>
                  {errors.topic && <p className="text-sm text-red-500">{errors.topic}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-teal-700">Difficulty</Label>
                  <Select value={quizData.difficulty} onChange={(e) => handleSelectChange("difficulty", e.target.value)} className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="text-teal-700">Time Limit (seconds)</Label>
                <Input id="timeLimit" name="timeLimit" type="number" value={quizData.timeLimit} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100">
            <CardHeader>
              <CardTitle className="text-teal-800">Questions</CardTitle>
              <CardDescription className="text-teal-600">Edit each question and the correct answer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizData.questions.map((question, index) => (
                <div key={index} className="border border-teal-100 rounded-lg p-4 space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-teal-800">Question {index + 1}</h3>
                    <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50" type="button" onClick={() => removeQuestion(index)}>Remove</Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-teal-700">Question Text</Label>
                    <Input value={question.question} onChange={(e) => handleQuestionChange(index, "question", e.target.value)} placeholder="Enter question" />
                    {errors[`question_${index}`] && <p className="text-sm text-red-500">{errors[`question_${index}`]}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((opt, j) => (
                      <div key={j} className="space-y-2">
                        <Label className="text-teal-700">Option {String.fromCharCode(65 + j)}</Label>
                        <Input value={opt} onChange={(e) => handleQuestionChange(index, "options", [j, e.target.value])} placeholder={`Enter option ${String.fromCharCode(65 + j)}`} />
                        {errors[`question_${index}_option_${j}`] && <p className="text-sm text-red-500">{errors[`question_${index}_option_${j}`]}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-teal-700">Correct Answer</Label>
                    <Select value={question.correctAnswer} onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)} className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20">
                      <option value={0}>A</option>
                      <option value={1}>B</option>
                      <option value={2}>C</option>
                      <option value={3}>D</option>
                    </Select>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button type="button" onClick={addQuestion} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">Add Question</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={isLoading} className="border-teal-200 text-teal-700 hover:bg-teal-50">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Please fix the errors above before submitting.</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  )
}
