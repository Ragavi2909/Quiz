"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, Mic, MicOff } from "lucide-react"
import { createQuiz } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function CreateQuiz() {
  const router = useRouter()
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ])

  // Voice recognition states
  const [isListening, setIsListening] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null)
  const [currentOptionIndex, setCurrentOptionIndex] = useState(null)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ((typeof window !== "undefined" && "SpeechRecognition" in window) || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript

        if (currentQuestionIndex !== null) {
          if (currentOptionIndex !== null) {
            // Update option text
            const newQuestions = [...questions]
            newQuestions[currentQuestionIndex].options[currentOptionIndex] = transcript
            setQuestions(newQuestions)
          } else {
            // Update question text
            const newQuestions = [...questions]
            newQuestions[currentQuestionIndex].question = transcript
            setQuestions(newQuestions)
          }
        }

        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [questions, currentQuestionIndex, currentOptionIndex])

  // Start voice input
  const startVoiceInput = (questionIndex, optionIndex = null) => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    setCurrentQuestionIndex(questionIndex)
    setCurrentOptionIndex(optionIndex)
    setIsListening(true)

    recognitionRef.current.start()
  }

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ])
  }

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleSubmit = async () => {
    // Validate form
    if (!quizTitle || !quizDescription || !topic || !difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all quiz details.",
        variant: "destructive",
      })
      return
    }

    // Validate questions
    const invalidQuestions = questions.filter((q) => !q.question || q.options.some((option) => !option))

    if (invalidQuestions.length > 0) {
      toast({
        title: "Incomplete Questions",
        description: "Please fill in all questions and options.",
        variant: "destructive",
      })
      return
    }

    // Create quiz object
    const quizData = {
      title: quizTitle,
      description: quizDescription,
      topic,
      topicId: Math.floor(Math.random() * 1000), // This would be a proper ID in production
      difficulty,
      timeLimit: difficulty === "Beginner" ? 600 : difficulty === "Intermediate" ? 450 : 300,
      questions,
      author: "Current User", // This would be the actual user in production
      createdAt: new Date().toISOString(),
    }

    try {
      const result = await createQuiz(quizData)

      if (result.success) {
        toast({
          title: "Quiz Created",
          description: "Your quiz has been successfully created!",
        })
        router.push("/")
      } else {
        throw new Error(result.error || "Failed to create quiz")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 text-gray-800">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">QuizMaster</h1>
          <Button
            variant="outline"
            className="border-purple-400 text-purple-700 hover:bg-purple-100"
            onClick={() => router.push("/")}
          >
            Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-800">Create New Quiz</h2>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-purple-100 mb-8">
            <CardHeader>
              <CardTitle className="text-purple-800">Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-purple-700">
                  Quiz Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
                  className="border-purple-200 focus-visible:ring-purple-500"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-purple-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter quiz description"
                  className="border-purple-200 focus-visible:ring-purple-500"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-purple-700">
                    Topic
                  </Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="border-purple-200 focus-visible:ring-purple-500">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-purple-700">
                    Difficulty
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="border-purple-200 focus-visible:ring-purple-500">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-800">Questions</h3>

            {questions.map((question, index) => (
              <Card key={question.id} className="bg-white border-purple-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-purple-800">Question {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`question-${question.id}`} className="text-purple-700">
                        Question
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-purple-600 hover:text-purple-800 hover:bg-purple-50 ${isListening && currentQuestionIndex === index && currentOptionIndex === null ? "bg-purple-100" : ""}`}
                        onClick={() => {
                          if (isListening && currentQuestionIndex === index && currentOptionIndex === null) {
                            stopVoiceInput()
                          } else {
                            startVoiceInput(index)
                          }
                        }}
                      >
                        {isListening && currentQuestionIndex === index && currentOptionIndex === null ? (
                          <>
                            <MicOff className="h-4 w-4 mr-1" /> Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-1" /> Record Question
                          </>
                        )}
                      </Button>
                    </div>
                    <Input
                      id={`question-${question.id}`}
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      placeholder="Enter your question"
                      className="border-purple-200 focus-visible:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-700">Question Type</Label>
                    <Tabs defaultValue="multiple-choice" className="w-full">
                      <TabsList className="bg-purple-50 w-full">
                        <TabsTrigger
                          value="multiple-choice"
                          className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
                          onClick={() => updateQuestion(question.id, "type", "multiple-choice")}
                        >
                          Multiple Choice
                        </TabsTrigger>
                        <TabsTrigger
                          value="true-false"
                          className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
                          onClick={() => updateQuestion(question.id, "type", "true-false")}
                        >
                          True/False
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="multiple-choice" className="pt-4">
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3">
                              <Input
                                type="radio"
                                id={`q${question.id}-option${optionIndex}`}
                                name={`q${question.id}-correct`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuestion(question.id, "correctAnswer", optionIndex)}
                                className="w-4 h-4 text-purple-600"
                              />
                              <div className="flex-1 flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="border-purple-200 focus-visible:ring-purple-500 flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`text-purple-600 hover:text-purple-800 hover:bg-purple-50 ${isListening && currentQuestionIndex === index && currentOptionIndex === optionIndex ? "bg-purple-100" : ""}`}
                                  onClick={() => {
                                    if (
                                      isListening &&
                                      currentQuestionIndex === index &&
                                      currentOptionIndex === optionIndex
                                    ) {
                                      stopVoiceInput()
                                    } else {
                                      startVoiceInput(index, optionIndex)
                                    }
                                  }}
                                >
                                  {isListening &&
                                  currentQuestionIndex === index &&
                                  currentOptionIndex === optionIndex ? (
                                    <MicOff className="h-4 w-4" />
                                  ) : (
                                    <Mic className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="true-false" className="pt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="radio"
                              id={`q${question.id}-true`}
                              name={`q${question.id}-tf`}
                              className="w-4 h-4 text-purple-600"
                              checked={question.correctAnswer === 0}
                              onChange={() => updateQuestion(question.id, "correctAnswer", 0)}
                            />
                            <Label htmlFor={`q${question.id}-true`} className="text-purple-700">
                              True
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="radio"
                              id={`q${question.id}-false`}
                              name={`q${question.id}-tf`}
                              className="w-4 h-4 text-purple-600"
                              checked={question.correctAnswer === 1}
                              onChange={() => updateQuestion(question.id, "correctAnswer", 1)}
                            />
                            <Label htmlFor={`q${question.id}-false`} className="text-purple-700">
                              False
                            </Label>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full border-purple-400 text-purple-700 hover:bg-purple-100"
              onClick={addQuestion}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          <div className="mt-8 flex justify-end">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8" onClick={handleSubmit}>
              Save Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
