import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

// Get all topics
export async function getAllTopics() {
  try {
    const { db } = await connectToDatabase()
    const topics = await db.collection("topics").find({}).toArray()
    return topics
  } catch (error) {
    console.error("Error fetching topics:", error)
    // Return mock data as fallback
    return mockTopics
  }
}

// Get topic by slug
export async function getTopicBySlug(slug) {
  try {
    const { db } = await connectToDatabase()
    const topic = await db.collection("topics").findOne({ slug })
    return topic
  } catch (error) {
    console.error("Error fetching topic by slug:", error)
    // Return mock data as fallback
    return mockTopics.find((topic) => topic.slug === slug)
  }
}

// Get quizzes by topic
export async function getQuizzesByTopic(topicId) {
  try {
    const { db } = await connectToDatabase()
    const quizzes = await db.collection("quizzes").find({ topicId }).toArray()
    return quizzes
  } catch (error) {
    console.error("Error fetching quizzes by topic:", error)
    // Return mock data as fallback
    return mockQuizzes.filter((quiz) => quiz.topicId === topicId)
  }
}

// Get quiz by ID
export async function getQuizById(id) {
  try {
    const { db } = await connectToDatabase()
    const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(id) })
    return quiz
  } catch (error) {
    console.error("Error fetching quiz by ID:", error)
    // Return mock data as fallback
    return mockQuizzes.find((quiz) => quiz.id === id)
  }
}

// Get all quizzes
export async function getAllQuizzes() {
  try {
    const { db } = await connectToDatabase()
    const quizzes = await db.collection("quizzes").find({}).toArray()
    return quizzes
  } catch (error) {
    console.error("Error fetching all quizzes:", error)
    // Return mock data as fallback
    return mockQuizzes
  }
}

// Get featured quizzes
export async function getFeaturedQuizzes(limit = 4) {
  try {
    const { db } = await connectToDatabase()
    const quizzes = await db.collection("quizzes").find({}).limit(limit).toArray()
    return quizzes
  } catch (error) {
    console.error("Error fetching featured quizzes:", error)
    // Return mock data as fallback
    return [...mockQuizzes].sort(() => 0.5 - Math.random()).slice(0, limit)
  }
}

// Create a new quiz
export async function createQuiz(quizData) {
  try {
    const { db } = await connectToDatabase()
    const result = await db.collection("quizzes").insertOne(quizData)
    return { success: true, id: result.insertedId }
  } catch (error) {
    console.error("Error creating quiz:", error)
    return { success: false, error: error.message }
  }
}

// Update a quiz
export async function updateQuiz(id, quizData) {
  try {
    const { db } = await connectToDatabase()
    await db.collection("quizzes").updateOne({ _id: new ObjectId(id) }, { $set: quizData })
    return { success: true }
  } catch (error) {
    console.error("Error updating quiz:", error)
    return { success: false, error: error.message }
  }
}

// Delete a quiz
export async function deleteQuiz(id) {
  try {
    const { db } = await connectToDatabase()
    await db.collection("quizzes").deleteOne({ _id: new ObjectId(id) })
    return { success: true }
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return { success: false, error: error.message }
  }
}

// Get user quiz stats
export async function getUserQuizStats(userId) {
  try {
    const { db } = await connectToDatabase()
    const stats = await db.collection("userStats").findOne({ userId })
    return stats
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return null
  }
}

// Mock data for fallback
const mockTopics = [
  {
    id: 1,
    name: "Computer Science",
    slug: "computer-science",
    description: "Programming, algorithms, data structures, and more.",
    quizCount: 42,
    difficulty: "Beginner to Advanced",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    name: "Mathematics",
    slug: "mathematics",
    description: "Algebra, calculus, statistics, and geometry.",
    quizCount: 38,
    difficulty: "All Levels",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    name: "Science",
    slug: "science",
    description: "Physics, chemistry, biology, and astronomy.",
    quizCount: 56,
    difficulty: "Mixed",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    name: "History",
    slug: "history",
    description: "World history, civilizations, and important events.",
    quizCount: 31,
    difficulty: "Intermediate",
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
]

const mockQuizzes = [
  {
    id: "cs-1",
    title: "Programming Fundamentals",
    description: "Test your knowledge of basic programming concepts and syntax.",
    topic: "Computer Science",
    topicId: 1,
    difficulty: "Beginner",
    timeLimit: 600,
    author: "Alex Johnson",
    createdAt: "2023-04-15",
    imageUrl: "/placeholder.svg?height=200&width=400",
    questions: [
      {
        id: 1,
        question: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Processor Unifier",
          "Central Process Utility",
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "Which of the following is NOT a programming language?",
        options: ["Java", "Python", "HTML", "Microsoft Word"],
        correctAnswer: 3,
      },
    ],
  },
  {
    id: "math-1",
    title: "Algebra Basics",
    description: "Test your knowledge of basic algebraic concepts and equations.",
    topic: "Mathematics",
    topicId: 2,
    difficulty: "Beginner",
    timeLimit: 600,
    author: "David Wilson",
    createdAt: "2023-03-10",
    imageUrl: "/placeholder.svg?height=200&width=400",
    questions: [
      {
        id: 1,
        question: "Solve for x: 2x + 5 = 15",
        options: ["x = 5", "x = 10", "x = 7.5", "x = 5.5"],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "What is the value of y in the equation y = 3x + 2 when x = 4?",
        options: ["y = 10", "y = 14", "y = 11", "y = 6"],
        correctAnswer: 1,
      },
    ],
  },
]
