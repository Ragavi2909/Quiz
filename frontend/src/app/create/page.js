"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Trash2, Save, AlertCircle, Share2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { isAuthenticated } from "@/lib/auth"
import { createQuiz, generateAiQuiz, getAllTopics } from "@/lib/api"
import { Header } from "@/components/header"

export default function CreateQuizPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    topic: "", // Will be set when topics are loaded
    difficulty: "Medium", // Default difficulty
    timeLimit: 600, // 10 minutes default
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
  const [quizCreated, setQuizCreated] = useState(null)
  const [aiPrompt, setAiPrompt] = useState("Give 10 in GK for class 10")
  const [aiCount, setAiCount] = useState(10)
  const [aiGrade, setAiGrade] = useState(10)
  const [aiTopic, setAiTopic] = useState("")
  const [aiDifficulty, setAiDifficulty] = useState("Medium")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  // Check if user is authenticated and fetch topics
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create a quiz",
      })
      router.push("/login")
      return
    }

    // Fetch topics
    const fetchTopics = async () => {
      try {
        const topicsData = await getAllTopics()
        setTopics(topicsData)
        // Set default topic if available
        if (topicsData.length > 0) {
          setQuizData(prev => ({ ...prev, topic: topicsData[0].name }))
        }
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
    }

    fetchTopics()
  }, [router, toast])

  // Handle input change for quiz details
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuizData({
      ...quizData,
      [name]: value,
    })

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Handle select change
  const handleSelectChange = (name, value) => {
    setQuizData({
      ...quizData,
      [name]: value,
    })

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Handle input change for questions
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions]

    if (field === "options") {
      const [optionIndex, optionValue] = value
      updatedQuestions[index].options[optionIndex] = optionValue
    } else if (field === "correctAnswer") {
      updatedQuestions[index].correctAnswer = Number.parseInt(value)
    } else {
      updatedQuestions[index][field] = value
    }

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })

    // Clear error for this question if it exists
    if (errors[`question_${index}`]) {
      setErrors({
        ...errors,
        [`question_${index}`]: "",
      })
    }
  }

  // Add a new question
  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    })

    // Scroll to the new question after a short delay
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // Remove a question
  const removeQuestion = (index) => {
    if (quizData.questions.length === 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Quiz must have at least one question",
      })
      return
    }

    const updatedQuestions = [...quizData.questions]
    updatedQuestions.splice(index, 1)

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })

    // Clear error for this question if it exists
    if (errors[`question_${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`question_${index}`]
      setErrors(newErrors)
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Validate quiz details
    if (!quizData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!quizData.topic) {
      newErrors.topic = "Topic is required"
    }

    // Validate questions
    quizData.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}`] = "Question text is required"
      }

      // Check if all options are filled
      const emptyOptions = question.options.filter((option) => !option.trim())
      if (emptyOptions.length > 0) {
        newErrors[`question_${index}_options`] = "All options must be filled"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createQuiz(quizData)
      setQuizCreated(result.quiz)

      toast({
        title: "Success",
        description: "Quiz created successfully",
      })
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create quiz",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy share link to clipboard
  const copyShareLink = async () => {
    if (quizCreated?.shareId) {
      const shareUrl = `${window.location.origin}/quiz/shared/${quizCreated.shareId}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Quiz link copied to clipboard",
        })
      } catch (error) {
        console.error("Failed to copy link:", error)
      }
    }
  }

  const handleGenerateAi = async () => {
    setAiLoading(true)
    try {
      const resolvedCount = Number.isFinite(aiCount) ? aiCount : 10
      const resolvedGrade = Number.isFinite(aiGrade) ? aiGrade : 10
      const resolvedTopic =
        (typeof aiTopic === "string" && aiTopic.trim()) ||
        (typeof quizData.topic === "string" && quizData.topic.trim()) ||
        "General Knowledge"

      const result = await generateAiQuiz({
        prompt: aiPrompt,
        count: resolvedCount,
        grade: resolvedGrade,
        topic: resolvedTopic,
        difficulty: aiDifficulty,
      })
      setAiResult(result)
      toast({
        title: "Generated",
        description: `Generated ${result.questions?.length || 0} questions`,
      })
    } catch (error) {
      console.error("AI generation error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate questions",
      })
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiToQuiz = (mode) => {
    if (!aiResult?.questions?.length) return
    setQuizData((prev) => {
      const normalizedQuestions = aiResult.questions.map((q) => ({
        question: q.question || "",
        options: Array.isArray(q.options) ? q.options.slice(0, 4).concat(["", "", "", ""]).slice(0, 4) : ["", "", "", ""],
        correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
      }))

      const nextQuestions = mode === "append" ? [...prev.questions, ...normalizedQuestions] : normalizedQuestions

      return {
        ...prev,
        title: prev.title?.trim() ? prev.title : aiResult.title || prev.title,
        description: prev.description?.trim() ? prev.description : aiResult.description || prev.description,
        topic: aiResult.topic || prev.topic,
        difficulty: aiResult.difficulty || prev.difficulty,
        questions: nextQuestions,
      }
    })

    toast({
      title: "Updated",
      description: mode === "append" ? "Questions added to the quiz" : "Quiz questions replaced",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50">
      <Header />

      <div className="container max-w-4xl py-8 space-y-8 animate-fadeIn">
        {!quizCreated ? (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-teal-800">Create New Quiz</h1>
              <p className="text-teal-600">
                Fill in the details below to create your quiz. Add as many questions as you like.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Card className="transition-all duration-300 hover:shadow-md border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">AI Question Generator</CardTitle>
                  <CardDescription className="text-teal-600">
                    Type a prompt like: &quot;Give 10 in GK for class 10&quot;
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiPrompt" className="text-teal-700">
                      Prompt
                    </Label>
                    <Textarea
                      id="aiPrompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[80px] border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-teal-700">Topic</Label>
                      <Select
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                      >
                        <option value="">Use quiz topic</option>
                        {topics.map((topic) => (
                          <option key={topic._id || topic.slug || topic.name} value={topic.name}>
                            {topic.icon} {topic.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-700">Count</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={aiCount}
                        onChange={(e) => setAiCount(Number.parseInt(e.target.value || "10", 10))}
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-700">Class</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={aiGrade}
                        onChange={(e) => setAiGrade(Number.parseInt(e.target.value || "10", 10))}
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-teal-700">Difficulty</Label>
                      <Select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={handleGenerateAi}
                      disabled={aiLoading}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    >
                      {aiLoading ? "Generating..." : "Generate"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!aiResult?.questions?.length}
                      onClick={() => applyAiToQuiz("replace")}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      Use Questions (Replace)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!aiResult?.questions?.length}
                      onClick={() => applyAiToQuiz("append")}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      Add Questions
                    </Button>
                  </div>

                  {aiResult?.questions?.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm text-teal-700">
                        Generated: {aiResult.questions.length} questions for {aiResult.topic}
                      </div>
                      <div className="space-y-2">
                        {aiResult.questions.slice(0, 5).map((q, i) => (
                          <div key={i} className="p-3 rounded-md border border-teal-100 bg-teal-50/40">
                            <div className="font-medium text-teal-800">{i + 1}. {q.question}</div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-teal-700">
                              {(q.options || []).slice(0, 4).map((opt, idx) => (
                                <div key={idx} className={idx === q.correctAnswer ? "font-semibold" : ""}>
                                  {String.fromCharCode(65 + idx)}. {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {aiResult.questions.length > 5 && (
                        <div className="text-xs text-teal-600">Showing first 5 questions</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quiz Details */}
              <Card className="transition-all duration-300 hover:shadow-md border-teal-100">
                <CardHeader>
                  <CardTitle className="text-teal-800">Quiz Details</CardTitle>
                  <CardDescription className="text-teal-600">Basic information about your quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-teal-700">
                      Quiz Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={quizData.title}
                      onChange={handleInputChange}
                      placeholder="Enter quiz title"
                      className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-teal-700">
                        Topic <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={quizData.topic}
                        onChange={(e) => handleSelectChange("topic", e.target.value)}
                        className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 ${errors.topic ? "border-red-500" : ""}`}
                      >
                        <option value="">Select a topic</option>
                        {topics.map((topic) => (
                          <option key={topic._id || topic.slug || topic.name} value={topic.name}>
                            {topic.icon} {topic.name}
                          </option>
                        ))}
                      </Select>
                      {errors.topic && <p className="text-sm text-red-500">{errors.topic}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-teal-700">Difficulty</Label>
                      <Select
                        value={quizData.difficulty}
                        onChange={(e) => handleSelectChange("difficulty", e.target.value)}
                        className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeLimit" className="text-teal-700">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      min="1"
                      max="120"
                      value={quizData.timeLimit / 60}
                      onChange={(e) => handleInputChange({ target: { name: "timeLimit", value: e.target.value * 60 } })}
                      placeholder="10"
                      className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                    />
                    <p className="text-xs text-teal-600">Maximum time allowed for the quiz (1-120 minutes)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-teal-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={quizData.description}
                      onChange={handleInputChange}
                      placeholder="Enter quiz description"
                      className="min-h-[100px] border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                    />
                  </div>
                </CardContent>
              </Card>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-teal-800">Questions</h2>
              <Button
                type="button"
                onClick={addQuestion}
                className="group transition-all duration-300 hover:scale-105 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                aria-label="Add question"
              >
                <PlusCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Add Question
              </Button>
            </div>

            {quizData.questions.map((question, questionIndex) => (
              <Card
                key={questionIndex}
                className="transition-all duration-300 hover:shadow-md relative overflow-hidden border-teal-100"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-cyan-500"></div>

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-teal-800">Question {questionIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(questionIndex)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      disabled={quizData.questions.length === 1}
                      aria-label={`Remove question ${questionIndex + 1}`}
                      title={`Remove question ${questionIndex + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${questionIndex}`} className="text-teal-700">
                      Question Text <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={`question-${questionIndex}`}
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                      placeholder="Enter your question"
                      className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 ${errors[`question_${questionIndex}`] ? "border-red-500" : ""}`}
                    />
                    {errors[`question_${questionIndex}`] && (
                      <p className="text-sm text-red-500">{errors[`question_${questionIndex}`]}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-teal-700">
                        Options <span className="text-red-500">*</span>
                      </Label>
                      {errors[`question_${questionIndex}_options`] && (
                        <p className="text-sm text-red-500">{errors[`question_${questionIndex}_options`]}</p>
                      )}
                    </div>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`correct-${questionIndex}-${optionIndex}`}
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => handleQuestionChange(questionIndex, "correctAnswer", optionIndex)}
                          className="h-4 w-4 text-teal-600 border-teal-300 focus:ring-teal-500"
                          aria-label={`Set option ${optionIndex + 1} as correct answer`}
                        />
                        <Label
                          htmlFor={`correct-${questionIndex}-${optionIndex}`}
                          className="flex-shrink-0 w-24 text-teal-700"
                        >
                          {optionIndex === question.correctAnswer ? "Correct" : "Option"} {optionIndex + 1}
                        </Label>
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleQuestionChange(questionIndex, "options", [optionIndex, e.target.value])
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 ${
                            option.trim() === "" && errors[`question_${questionIndex}_options`] ? "border-red-500" : ""
                          }`}
                          aria-label={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isLoading}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
              aria-label="Cancel and return to dashboard"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] group transition-all duration-300 hover:scale-105 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              aria-label="Save quiz"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Save Quiz
                </>
              )}
            </Button>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Please fix the errors above before submitting.</AlertDescription>
            </Alert>
          )}
        </form>
          </>
        ) : (
          /* Success State */
          <Card className="border-teal-100">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-teal-800">Quiz Created Successfully!</CardTitle>
              <CardDescription className="text-teal-600">
                Your quiz &quot;{quizCreated.title}&quot; is now ready to be shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                <h3 className="font-medium text-teal-800 mb-2">Share Your Quiz</h3>
                <p className="text-sm text-teal-600 mb-4">
                  Share this link with others so they can take your quiz:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${window.location.origin}/quiz/shared/${quizCreated.shareId}`}
                    readOnly
                    className="flex-1 border-teal-200 bg-white"
                  />
                  <Button
                    onClick={copyShareLink}
                    variant="outline"
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                {/* QR Code */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <QRCodeSVG value={`${window.location.origin}/quiz/shared/${quizCreated.shareId}`} size={136} />
                  </div>
                  <div className="flex-1 text-sm text-teal-600">
                    <p className="mb-1">Scan this QR code to open the quiz on mobile devices.</p>
                    <p>Or copy the link above and share it anywhere.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                  <div className="text-2xl font-bold text-teal-800">{quizCreated.questions?.length || 0}</div>
                  <div className="text-sm text-teal-600">Questions</div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                  <div className="text-2xl font-bold text-teal-800">{quizCreated.difficulty}</div>
                  <div className="text-sm text-teal-600">Difficulty</div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                  <div className="text-2xl font-bold text-teal-800">{quizCreated.timeLimit / 60}m</div>
                  <div className="text-sm text-teal-600">Time Limit</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                onClick={() => router.push(`/quiz/${quizCreated._id}`)}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                Take Quiz Now
              </Button>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                  onClick={() => {
                    setQuizCreated(null)
                    setQuizData({
                      title: "",
                      description: "",
                      topic: topics.length > 0 ? topics[0].name : "",
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
                  }}
                >
                  Create Another Quiz
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
