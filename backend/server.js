const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: "10mb" })) // Increase payload limit for larger quiz data

// MongoDB Connection - removed deprecated options
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Define Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shareId: { type: String, unique: true },
  imageUrl: { type: String },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  timeLimit: { type: Number, default: 600 }, // 10 minutes default
  plays: { type: Number, default: 0 },
})

// Define Topic Schema
const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  slug: { type: String, required: true, unique: true },
})

// Define Progress Schema
const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
})

// Define User Stats Schema
const userStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  totalQuizzesTaken: { type: Number, default: 0 },
  totalQuizzesCreated: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  topicsExplored: [{ type: String }],
  achievements: [{ type: String }],
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
})

// Create Models
const User = mongoose.model("User", userSchema)
const Quiz = mongoose.model("Quiz", quizSchema)
const Topic = mongoose.model("Topic", topicSchema)
const Progress = mongoose.model("Progress", progressSchema)
const UserStats = mongoose.model("UserStats", userStatsSchema)

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ message: "Access denied" })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" })
    req.user = user
    next()
  })
}

// Routes

// Register User
app.post("/api/register", async (req, res) => {
  try {
    console.log("Register request:", req.body)
    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    })

    await user.save()

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login User
app.post("/api/login", async (req, res) => {
  try {
    console.log("Login request:", req.body)
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get User Profile
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create Quiz
app.post("/api/quizzes", authenticateToken, async (req, res) => {
  try {
    console.log("Create quiz request:", req.body)
    const { title, description, topic, difficulty, questions, timeLimit } = req.body

    // Validate input
    if (!title || !topic || !difficulty || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Generate unique share ID
    const shareId = Math.random().toString(36).substring(2, 15)

    // Create new quiz
    const quiz = new Quiz({
      title,
      description,
      topic,
      difficulty,
      createdBy: req.user.id,
      questions,
      timeLimit: timeLimit || 600,
      shareId,
    })

    await quiz.save()

    // Update user stats
    await UserStats.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { totalQuizzesCreated: 1, experiencePoints: 10 } },
      { upsert: true, new: true }
    )

    res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    })
  } catch (error) {
    console.error("Create quiz error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get All Quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "username")
    res.json(quizzes)
  } catch (error) {
    console.error("Get quizzes error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Featured Quizzes
app.get("/api/quizzes/featured", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 3
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(limit).populate("createdBy", "username")

    res.json(quizzes)
  } catch (error) {
    console.error("Get featured quizzes error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Quiz by ID
app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("createdBy", "username")
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    res.json(quiz)
  } catch (error) {
    console.error("Get quiz error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get User's Quizzes
app.get("/api/user/quizzes", authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
    res.json(quizzes)
  } catch (error) {
    console.error("Get user quizzes error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update Quiz
app.put("/api/quizzes/:id", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check if user is the creator of the quiz
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this quiz" })
    }

    const { title, description, topic, difficulty, questions } = req.body

    // Update quiz
    quiz.title = title || quiz.title
    quiz.description = description || quiz.description
    quiz.topic = topic || quiz.topic
    quiz.difficulty = difficulty || quiz.difficulty
    quiz.questions = questions || quiz.questions

    await quiz.save()

    res.json({
      message: "Quiz updated successfully",
      quiz,
    })
  } catch (error) {
    console.error("Update quiz error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete Quiz
app.delete("/api/quizzes/:id", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check if user is the creator of the quiz
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this quiz" })
    }

    await Quiz.deleteOne({ _id: req.params.id })

    res.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("Delete quiz error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Quiz by Share ID
app.get("/api/quizzes/shared/:shareId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shareId: req.params.shareId }).populate("createdBy", "username")
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    
    // Increment play count
    await Quiz.findByIdAndUpdate(quiz._id, { $inc: { plays: 1 } })
    
    res.json(quiz)
  } catch (error) {
    console.error("Get shared quiz error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Submit Quiz Progress
app.post("/api/progress", authenticateToken, async (req, res) => {
  try {
    const { quizId, score, totalQuestions, timeTaken } = req.body
    
    const percentage = Math.round((score / totalQuestions) * 100)
    
    // Create progress record
    const progress = new Progress({
      userId: req.user.id,
      quizId,
      score,
      totalQuestions,
      percentage,
      timeTaken,
    })
    
    await progress.save()
    
    // Update quiz play count
    await Quiz.findByIdAndUpdate(quizId, { $inc: { plays: 1 } })
    
    // Update user stats
    let stats = await UserStats.findOneAndUpdate(
      { userId: req.user.id },
      {
        $inc: {
          totalQuizzesTaken: 1,
          totalTimeSpent: timeTaken,
          experiencePoints: Math.floor(percentage / 10) + 5,
        },
        $max: { bestScore: Math.max(score, percentage) },
        $set: { averageScore: await calculateAverageScore(req.user.id) },
        $addToSet: { topicsExplored: (await Quiz.findById(quizId)).topic },
      },
      { upsert: true, new: true }
    )
    
    // Check for level up
    const previousLevel = stats.level
    const newLevel = Math.floor(stats.experiencePoints / 100) + 1
    const leveledUp = newLevel > stats.level
    if (newLevel > stats.level) {
      stats = await UserStats.findOneAndUpdate(
        { userId: req.user.id },
        { level: newLevel, $push: { achievements: `Level ${newLevel}` } },
        { new: true }
      )
    }
    
    res.status(201).json({
      message: "Progress saved successfully",
      progress,
      stats,
      leveledUp,
      previousLevel,
      newLevel,
    })
  } catch (error) {
    console.error("Submit progress error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get User Progress
app.get("/api/progress", authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .populate("quizId", "title topic difficulty")
      .sort({ completedAt: -1 })
    
    res.json(progress)
  } catch (error) {
    console.error("Get progress error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get User Stats
app.get("/api/stats", authenticateToken, async (req, res) => {
  try {
    const stats = await UserStats.findOne({ userId: req.user.id })
      .populate("userId", "username email")
    
    if (!stats) {
      // Create default stats if none exist
      const newStats = new UserStats({ userId: req.user.id })
      await newStats.save()
      res.json(newStats)
    } else {
      res.json(stats)
    }
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to calculate average score
async function calculateAverageScore(userId) {
  try {
    const progress = await Progress.find({ userId })
    if (progress.length === 0) return 0
    
    const totalPercentage = progress.reduce((sum, p) => sum + p.percentage, 0)
    return Math.round(totalPercentage / progress.length)
  } catch (error) {
    console.error("Calculate average score error:", error)
    return 0
  }
}

// Create Topic
app.post("/api/topics", authenticateToken, async (req, res) => {
  try {
    const { name, description, icon } = req.body

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-")

    // Check if topic already exists
    const existingTopic = await Topic.findOne({ $or: [{ name }, { slug }] })
    if (existingTopic) {
      return res.status(400).json({ message: "Topic already exists" })
    }

    // Create new topic
    const topic = new Topic({
      name,
      description,
      icon,
      slug,
    })

    await topic.save()

    res.status(201).json({
      message: "Topic created successfully",
      topic,
    })
  } catch (error) {
    console.error("Create topic error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get All Topics
app.get("/api/topics", async (req, res) => {
  try {
    const topics = await Topic.find()

    // Add quiz count to each topic
    const topicsWithCount = await Promise.all(
      topics.map(async (topic) => {
        const quizCount = await Quiz.countDocuments({ topic: topic.name })
        return {
          ...topic.toObject(),
          quizCount,
        }
      }),
    )

    res.json(topicsWithCount)
  } catch (error) {
    console.error("Get topics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Topic by Slug
app.get("/api/topics/:slug", async (req, res) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.slug })
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" })
    }

    const quizCount = await Quiz.countDocuments({ topic: topic.name })

    res.json({
      ...topic.toObject(),
      quizCount,
    })
  } catch (error) {
    console.error("Get topic error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Quizzes by Topic
app.get("/api/topics/:topic/quizzes", async (req, res) => {
  try {
    const topic = await Topic.findOne({
      $or: [{ slug: req.params.topic }, { name: req.params.topic }],
    })

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" })
    }

    const quizzes = await Quiz.find({ topic: topic.name }).populate("createdBy", "username")
    res.json(quizzes)
  } catch (error) {
    console.error("Get topic quizzes error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

const clampInt = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

const parseGeneratePrompt = (prompt = "") => {
  const text = String(prompt || "").trim()
  const countMatch = text.match(/(?:^|\s)(\d{1,2})(?:\s|$)/)
  const classMatch = text.match(/class\s*(\d{1,2})/i)
  const gradeMatch = text.match(/grade\s*(\d{1,2})/i)
  const count = clampInt(countMatch?.[1], 1, 50, 10)
  const grade = clampInt(classMatch?.[1] || gradeMatch?.[1], 1, 12, 10)

  const lower = text.toLowerCase()
  let topic = ""
  if (/\bgk\b/.test(lower) || lower.includes("general knowledge")) topic = "General Knowledge"
  else if (lower.includes("math")) topic = "Mathematics"
  else if (lower.includes("science")) topic = "Science"
  else if (lower.includes("history")) topic = "History"
  else if (lower.includes("geography")) topic = "Geography"
  else if (lower.includes("literature")) topic = "Literature"
  else if (lower.includes("technology")) topic = "Technology"
  else if (lower.includes("sports")) topic = "Sports"
  else if (lower.includes("music")) topic = "Music"
  else if (lower.includes("movies") || lower.includes("film")) topic = "Movies"

  return { count, grade, topic: topic || undefined }
}

const localQuestionBankByTopic = {
  Mathematics: [
    { question: "What is 15% of 200?", options: ["15", "25", "30", "45"], correctAnswer: 2 },
    { question: "Solve: 3x + 5 = 20. What is x?", options: ["3", "5", "10", "15"], correctAnswer: 1 },
    { question: "What is the value of 7²?", options: ["14", "21", "49", "56"], correctAnswer: 2 },
    { question: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "24"], correctAnswer: 2 },
    { question: "If a triangle has sides 3, 4, 5, it is a:", options: ["Isosceles", "Right", "Equilateral", "Obtuse"], correctAnswer: 1 },
    { question: "What is 0.75 as a fraction in simplest form?", options: ["1/2", "2/3", "3/4", "4/5"], correctAnswer: 2 },
    { question: "Simplify: 2(3 + 4) =", options: ["10", "12", "14", "18"], correctAnswer: 2 },
    { question: "What is the slope of the line y = 5x + 2?", options: ["2", "5", "7", "10"], correctAnswer: 1 },
    { question: "What is √81?", options: ["7", "8", "9", "10"], correctAnswer: 2 },
    { question: "What is the circumference formula of a circle?", options: ["πr²", "2πr", "πd²", "r/π"], correctAnswer: 1 },
  ],
  Science: [
    { question: "Which gas is essential for respiration?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correctAnswer: 1 },
    { question: "What is the SI unit of force?", options: ["Joule", "Newton", "Watt", "Pascal"], correctAnswer: 1 },
    { question: "Which organ pumps blood in the human body?", options: ["Lungs", "Liver", "Heart", "Kidney"], correctAnswer: 2 },
    { question: "What is the chemical formula of water?", options: ["H2O", "CO2", "O2", "NaCl"], correctAnswer: 0 },
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Earth", "Mars", "Jupiter"], correctAnswer: 2 },
    { question: "Which part of the cell contains DNA?", options: ["Nucleus", "Ribosome", "Cytoplasm", "Cell wall"], correctAnswer: 0 },
    { question: "What type of energy is stored in food?", options: ["Kinetic", "Chemical", "Thermal", "Nuclear"], correctAnswer: 1 },
    { question: "What is the speed of light (approx.)?", options: ["3×10^8 m/s", "3×10^6 m/s", "3×10^5 m/s", "3×10^3 m/s"], correctAnswer: 0 },
    { question: "Which is a renewable energy source?", options: ["Coal", "Petroleum", "Solar", "Natural gas"], correctAnswer: 2 },
    { question: "Which vitamin is produced in skin by sunlight?", options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], correctAnswer: 3 },
  ],
  History: [
    { question: "Which year did World War II end?", options: ["1942", "1944", "1945", "1947"], correctAnswer: 2 },
    { question: "Who was the first President of the United States?", options: ["John Adams", "George Washington", "Thomas Jefferson", "Abraham Lincoln"], correctAnswer: 1 },
    { question: "The Great Pyramid of Giza is located in:", options: ["Greece", "Italy", "Egypt", "Mexico"], correctAnswer: 2 },
    { question: "Which revolution began in 1789?", options: ["American Revolution", "French Revolution", "Industrial Revolution", "Russian Revolution"], correctAnswer: 1 },
    { question: "The Berlin Wall fell in:", options: ["1987", "1988", "1989", "1991"], correctAnswer: 2 },
    { question: "Who wrote the 'I Have a Dream' speech?", options: ["Nelson Mandela", "Martin Luther King Jr.", "Winston Churchill", "Franklin Roosevelt"], correctAnswer: 1 },
    { question: "The ancient Olympic Games originated in:", options: ["Rome", "Greece", "China", "Egypt"], correctAnswer: 1 },
    { question: "Which empire was ruled by Julius Caesar?", options: ["Mongol", "Roman", "Ottoman", "British"], correctAnswer: 1 },
    { question: "The Titanic sank in:", options: ["1905", "1912", "1920", "1931"], correctAnswer: 1 },
    { question: "Who was known as the 'Iron Lady'?", options: ["Angela Merkel", "Margaret Thatcher", "Indira Gandhi", "Golda Meir"], correctAnswer: 1 },
  ],
  Geography: [
    { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctAnswer: 2 },
    { question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correctAnswer: 2 },
    { question: "Mount Everest is in the:", options: ["Andes", "Alps", "Himalayas", "Rockies"], correctAnswer: 2 },
    { question: "The Nile river flows primarily in:", options: ["South America", "Africa", "Europe", "Asia"], correctAnswer: 1 },
    { question: "Which country is called the Land of the Rising Sun?", options: ["China", "Japan", "Korea", "Thailand"], correctAnswer: 1 },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], correctAnswer: 2 },
    { question: "Which desert is the largest (by area)?", options: ["Sahara", "Gobi", "Antarctica", "Kalahari"], correctAnswer: 2 },
    { question: "The Amazon rainforest is in:", options: ["Africa", "South America", "Australia", "Europe"], correctAnswer: 1 },
    { question: "Which is the longest river (traditional answer)?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswer: 1 },
    { question: "Which continent has the most countries?", options: ["Asia", "Africa", "Europe", "South America"], correctAnswer: 1 },
  ],
  Literature: [
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswer: 1 },
    { question: "A story with a moral lesson is called a:", options: ["Fable", "Epic", "Sonnet", "Biography"], correctAnswer: 0 },
    { question: "The person who tells the story is the:", options: ["Protagonist", "Narrator", "Antagonist", "Editor"], correctAnswer: 1 },
    { question: "A 14-line poem is called a:", options: ["Haiku", "Sonnet", "Limerick", "Ode"], correctAnswer: 1 },
    { question: "Who wrote 'The Jungle Book'?", options: ["R. K. Narayan", "Rudyard Kipling", "J. K. Rowling", "George Orwell"], correctAnswer: 1 },
  ],
  Technology: [
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Core Performance Utility", "Central Program Utility"], correctAnswer: 0 },
    { question: "Which is an operating system?", options: ["HTML", "Windows", "HTTP", "CSS"], correctAnswer: 1 },
    { question: "What does URL stand for?", options: ["Uniform Resource Locator", "Universal Route Link", "Unified Resource Login", "User Reference List"], correctAnswer: 0 },
    { question: "Which device is used to input text?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctAnswer: 2 },
    { question: "Which is a web browser?", options: ["Photoshop", "Chrome", "Excel", "PowerPoint"], correctAnswer: 1 },
  ],
  Sports: [
    { question: "How many players are on a soccer team on the field?", options: ["9", "10", "11", "12"], correctAnswer: 2 },
    { question: "Which sport uses a bat and ball?", options: ["Swimming", "Cricket", "Chess", "Archery"], correctAnswer: 1 },
    { question: "The Olympics are held every:", options: ["2 years", "3 years", "4 years", "5 years"], correctAnswer: 2 },
    { question: "Which country is famous for sumo wrestling?", options: ["Japan", "Brazil", "USA", "India"], correctAnswer: 0 },
    { question: "Tennis is played with:", options: ["Racket", "Bat", "Club", "Stick"], correctAnswer: 0 },
  ],
  Music: [
    { question: "A group of musical notes played together is a:", options: ["Chord", "Beat", "Scale", "Verse"], correctAnswer: 0 },
    { question: "How many strings does a standard guitar have?", options: ["4", "5", "6", "7"], correctAnswer: 2 },
    { question: "Which is a percussion instrument?", options: ["Flute", "Drum", "Violin", "Clarinet"], correctAnswer: 1 },
    { question: "Tempo refers to:", options: ["Loudness", "Speed", "Pitch", "Lyrics"], correctAnswer: 1 },
    { question: "A piano is a:", options: ["Wind instrument", "String instrument", "Keyboard instrument", "Brass instrument"], correctAnswer: 2 },
  ],
  Movies: [
    { question: "The person who directs a movie is the:", options: ["Producer", "Director", "Editor", "Composer"], correctAnswer: 1 },
    { question: "What does CGI stand for?", options: ["Computer Generated Imagery", "Creative Graphic Interface", "Cinema Global Index", "Computer Graphic Input"], correctAnswer: 0 },
    { question: "A series of images shown quickly creates:", options: ["Silence", "Motion", "Heat", "Color"], correctAnswer: 1 },
    { question: "A screenplay is also called a:", options: ["Script", "Score", "Scene", "Shot"], correctAnswer: 0 },
    { question: "The Oscars are awards for:", options: ["Sports", "Movies", "Science", "Politics"], correctAnswer: 1 },
  ],
  "General Knowledge": [
    { question: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Mars", "Venus"], correctAnswer: 1 },
    { question: "Which is the national currency of Japan?", options: ["Yuan", "Won", "Yen", "Dollar"], correctAnswer: 2 },
    { question: "Which continent is Australia in?", options: ["Europe", "Africa", "Australia/Oceania", "Asia"], correctAnswer: 2 },
    { question: "What is the chemical symbol for gold?", options: ["Ag", "Au", "Gd", "Go"], correctAnswer: 1 },
    { question: "Who is known as the Father of the Nation (India)?", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Sardar Patel", "Subhas Bose"], correctAnswer: 1 },
    { question: "Which is the largest mammal?", options: ["Elephant", "Blue whale", "Giraffe", "Hippopotamus"], correctAnswer: 1 },
    { question: "Which language has the most native speakers?", options: ["English", "Spanish", "Mandarin Chinese", "Hindi"], correctAnswer: 2 },
    { question: "The headquarters of the United Nations is in:", options: ["Geneva", "New York", "Paris", "London"], correctAnswer: 1 },
    { question: "Which gas do humans exhale most?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correctAnswer: 2 },
    { question: "Which instrument is used to measure temperature?", options: ["Barometer", "Thermometer", "Altimeter", "Hygrometer"], correctAnswer: 1 },
    { question: "Which is the smallest prime number?", options: ["0", "1", "2", "3"], correctAnswer: 2 },
    { question: "What is the boiling point of water at sea level?", options: ["50°C", "75°C", "100°C", "125°C"], correctAnswer: 2 },
    { question: "Which country is known for the Eiffel Tower?", options: ["Italy", "France", "Spain", "Germany"], correctAnswer: 1 },
    { question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correctAnswer: 2 },
    { question: "The largest desert by area is:", options: ["Sahara", "Gobi", "Antarctica", "Kalahari"], correctAnswer: 2 },
  ],
}

const buildLocalQuestions = ({ topic, count }) => {
  const bank = localQuestionBankByTopic[topic] || localQuestionBankByTopic["General Knowledge"]
  const selected = []
  for (let i = 0; i < count; i++) {
    const q = bank[i % bank.length]
    selected.push({
      question: q.question,
      options: q.options.slice(0, 4),
      correctAnswer: clampInt(q.correctAnswer, 0, 3, 0),
    })
  }
  return selected
}

const tryParseJsonObject = (text) => {
  const s = String(text || "")
  const start = s.indexOf("{")
  const end = s.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(s.slice(start, end + 1))
  } catch {
    return null
  }
}

const generateWithOpenAI = async ({ prompt, topic, count, grade, difficulty }) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || typeof fetch !== "function") return null

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const trimmedPrompt = typeof prompt === "string" ? prompt.trim() : ""
  const basePrompt = `Generate ${count} multiple-choice questions for topic "${topic}" suitable for class ${grade}. Difficulty: ${difficulty}.`
  const userPrompt = trimmedPrompt ? `${basePrompt}\nAdditional instructions: ${trimmedPrompt}` : basePrompt

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Return only valid JSON with keys: title, description, topic, difficulty, questions. questions is an array of {question, options (length 4), correctAnswer (0-3)}.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.4,
    }),
  })

  if (!response.ok) return null
  const data = await response.json().catch(() => null)
  const content = data?.choices?.[0]?.message?.content
  const parsed = tryParseJsonObject(content)
  if (!parsed || !Array.isArray(parsed.questions)) return null

  const cleanedQuestions = parsed.questions
    .filter((q) => q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length >= 4)
    .slice(0, count)
    .map((q) => ({
      question: String(q.question).trim(),
      options: q.options.slice(0, 4).map((o) => String(o)),
      correctAnswer: clampInt(q.correctAnswer, 0, 3, 0),
    }))

  if (cleanedQuestions.length === 0) return null

  return {
    title: parsed.title || `${topic} Quiz`,
    description: parsed.description || `AI-generated questions for ${topic}`,
    topic: parsed.topic || topic,
    difficulty: parsed.difficulty || difficulty,
    questions: cleanedQuestions,
  }
}

app.post("/api/ai/generate", authenticateToken, async (req, res) => {
  try {
    const prompt = req.body?.prompt
    const parsed = parseGeneratePrompt(prompt)
    const count = clampInt(req.body?.count ?? parsed.count, 1, 50, 10)
    const grade = clampInt(req.body?.grade ?? parsed.grade, 1, 12, 10)
    const topic = req.body?.topic || parsed.topic || "General Knowledge"
    const difficulty = req.body?.difficulty || "Medium"

    const ai = await generateWithOpenAI({ prompt, topic, count, grade, difficulty })
    if (ai) return res.json(ai)

    const questions = buildLocalQuestions({ topic, count })
    return res.json({
      title: `${topic} (Class ${grade})`,
      description: `Generated questions for ${topic}`,
      topic,
      difficulty,
      questions,
    })
  } catch (error) {
    console.error("AI generate error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Initialize default topics with 10 questions each
const initializeTopics = async () => {
  const topicsCount = await Topic.countDocuments()
  const quizzesCount = await Quiz.countDocuments()
  if (topicsCount === 0 || quizzesCount === 0) {
    const defaultTopics = [
      {
        name: "Mathematics",
        description: "Math related quizzes",
        icon: "📊",
        slug: "mathematics",
      },
      {
        name: "Science",
        description: "Science related quizzes",
        icon: "🔬",
        slug: "science",
      },
      {
        name: "History",
        description: "History related quizzes",
        icon: "📜",
        slug: "history",
      },
      {
        name: "Geography",
        description: "Geography related quizzes",
        icon: "🌍",
        slug: "geography",
      },
      {
        name: "Literature",
        description: "Literature related quizzes",
        icon: "📚",
        slug: "literature",
      },
      {
        name: "Technology",
        description: "Technology related quizzes",
        icon: "💻",
        slug: "technology",
      },
      {
        name: "Sports",
        description: "Sports related quizzes",
        icon: "⚽",
        slug: "sports",
      },
      {
        name: "Music",
        description: "Music related quizzes",
        icon: "🎵",
        slug: "music",
      },
      {
        name: "Movies",
        description: "Movies related quizzes",
        icon: "🎬",
        slug: "movies",
      },
      {
        name: "General Knowledge",
        description: "General knowledge quizzes",
        icon: "🧠",
        slug: "general-knowledge",
      },
    ]

    try {
      if (topicsCount === 0) {
        await Topic.insertMany(defaultTopics)
        console.log("Default topics initialized")
      }

      // Create a default user for quiz creation
      const adminExists = await User.findOne({ email: "admin@quizapp.com" })
      let adminId

      if (!adminExists) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash("admin123", salt)

        const admin = new User({
          username: "admin",
          email: "admin@quizapp.com",
          password: hashedPassword,
        })

        const savedAdmin = await admin.save()
        adminId = savedAdmin._id
        console.log("Default admin user created")
      } else {
        adminId = adminExists._id
      }

      // Create default quizzes for each topic
      const defaultQuizzes = []

      // Math quiz
      defaultQuizzes.push({
        title: "Basic Mathematics",
        description: "Test your knowledge of basic math concepts",
        topic: "Mathematics",
        difficulty: "Easy",
        createdBy: adminId,
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Euclid%27s_Elements_Book_1_Proposition_47.svg/640px-Euclid%27s_Elements_Book_1_Proposition_47.svg.png",
        questions: [
          {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
          },
          {
            question: "What is 5 × 7?",
            options: ["30", "35", "40", "45"],
            correctAnswer: 1,
          },
          {
            question: "What is 10 ÷ 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 2,
          },
          {
            question: "What is the square root of 16?",
            options: ["2", "3", "4", "5"],
            correctAnswer: 2,
          },
          {
            question: "What is 3² + 4²?",
            options: ["7", "25", "49", "16"],
            correctAnswer: 1,
          },
          {
            question: "What is 20% of 50?",
            options: ["5", "10", "15", "20"],
            correctAnswer: 1,
          },
          {
            question: "If x + 5 = 12, what is x?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
          },
          {
            question: "What is the area of a square with sides of length 4?",
            options: ["8", "12", "16", "20"],
            correctAnswer: 2,
          },
          {
            question: "What is the perimeter of a rectangle with length 5 and width 3?",
            options: ["8", "15", "16", "20"],
            correctAnswer: 2,
          },
          {
            question: "What is the value of π (pi) to two decimal places?",
            options: ["3.14", "3.15", "3.16", "3.17"],
            correctAnswer: 0,
          },
        ],
      })

      // Science quiz
      defaultQuizzes.push({
        title: "Basic Science",
        description: "Test your knowledge of basic science concepts",
        topic: "Science",
        difficulty: "Medium",
        createdBy: adminId,
        questions: [
          {
            question: "What is the chemical symbol for water?",
            options: ["O2", "CO2", "H2O", "N2"],
            correctAnswer: 2,
          },
          {
            question: "What is the closest planet to the Sun?",
            options: ["Venus", "Earth", "Mars", "Mercury"],
            correctAnswer: 3,
          },
          {
            question: "What is the largest organ in the human body?",
            options: ["Heart", "Liver", "Skin", "Brain"],
            correctAnswer: 2,
          },
          {
            question: "What is the process by which plants make their food called?",
            options: ["Respiration", "Photosynthesis", "Digestion", "Excretion"],
            correctAnswer: 1,
          },
          {
            question: "What is the unit of electric current?",
            options: ["Volt", "Watt", "Ampere", "Ohm"],
            correctAnswer: 2,
          },
          {
            question: "Which gas do plants absorb from the atmosphere?",
            options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
            correctAnswer: 1,
          },
          {
            question: "What is the hardest natural substance on Earth?",
            options: ["Gold", "Iron", "Diamond", "Platinum"],
            correctAnswer: 2,
          },
          {
            question: "What is the speed of light in a vacuum?",
            options: ["300,000 km/s", "150,000 km/s", "200,000 km/s", "250,000 km/s"],
            correctAnswer: 0,
          },
          {
            question: "Which of these is NOT a state of matter?",
            options: ["Solid", "Liquid", "Gas", "Energy"],
            correctAnswer: 3,
          },
          {
            question: "What is the atomic number of Oxygen?",
            options: ["6", "7", "8", "9"],
            correctAnswer: 2,
          },
        ],
      })

      // Ensure seeded quizzes have shareId so they can be shared
      defaultQuizzes.forEach((q) => {
        if (!q.shareId) q.shareId = Math.random().toString(36).substring(2, 15)
      })

      // Insert quizzes
      await Quiz.insertMany(defaultQuizzes)
      console.log("Default quizzes created")
      
      // Create additional quizzes for all other topics
      const additionalQuizzes = []
      
      // History quiz
      additionalQuizzes.push({
        title: "World History",
        description: "Test your knowledge of world history",
        topic: "History",
        difficulty: "Medium",
        createdBy: adminId,
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Declaration_of_Independence_%281817%29.jpg/640px-Declaration_of_Independence_%281817%29.jpg",
        questions: [
          {
            question: "In which year did World War II end?",
            options: ["1943", "1944", "1945", "1946"],
            correctAnswer: 2,
          },
          {
            question: "Who was the first President of the United States?",
            options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
            correctAnswer: 1,
          },
          {
            question: "Which ancient wonder of the world still stands today?",
            options: ["Colossus of Rhodes", "Hanging Gardens", "Great Pyramid of Giza", "Lighthouse of Alexandria"],
            correctAnswer: 2,
          },
          {
            question: "In which year did Columbus discover America?",
            options: ["1490", "1491", "1492", "1493"],
            correctAnswer: 2,
          },
          {
            question: "Who was known as the 'Iron Lady'?",
            options: ["Queen Elizabeth II", "Margaret Thatcher", "Angela Merkel", "Indira Gandhi"],
            correctAnswer: 1,
          },
          {
            question: "Which empire was known as 'the empire on which the sun never sets'?",
            options: ["Roman Empire", "British Empire", "Ottoman Empire", "Mongol Empire"],
            correctAnswer: 1,
          },
          {
            question: "In which year did the Berlin Wall fall?",
            options: ["1987", "1988", "1989", "1990"],
            correctAnswer: 2,
          },
          {
            question: "Who painted the Mona Lisa?",
            options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
            correctAnswer: 1,
          },
          {
            question: "Which war was fought between the North and South in the United States?",
            options: ["Revolutionary War", "Civil War", "War of 1812", "Mexican-American War"],
            correctAnswer: 1,
          },
          {
            question: "In which decade did the Roaring Twenties occur?",
            options: ["1910s", "1920s", "1930s", "1940s"],
            correctAnswer: 1,
          },
        ],
      })
      
      // Geography quiz
      additionalQuizzes.push({
        title: "World Geography",
        description: "Test your knowledge of world geography",
        topic: "Geography",
        difficulty: "Easy",
        createdBy: adminId,
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/640px-World_map_-_low_resolution.svg.png",
        questions: [
          {
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: 2,
          },
          {
            question: "Which is the largest ocean?",
            options: ["Atlantic", "Indian", "Arctic", "Pacific"],
            correctAnswer: 3,
          },
          {
            question: "What is the longest river in the world?",
            options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
            correctAnswer: 1,
          },
          {
            question: "Which country has the largest population?",
            options: ["India", "China", "USA", "Indonesia"],
            correctAnswer: 1,
          },
          {
            question: "What is the smallest country?",
            options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
            correctAnswer: 1,
          },
          {
            question: "Which desert is the largest in the world?",
            options: ["Sahara", "Arabian", "Gobi", "Antarctica"],
            correctAnswer: 3,
          },
          {
            question: "What is the highest mountain in the world?",
            options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
            correctAnswer: 2,
          },
          {
            question: "How many continents are there?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
          },
          {
            question: "Which country is known as the Land of the Rising Sun?",
            options: ["China", "Japan", "Korea", "Thailand"],
            correctAnswer: 1,
          },
          {
            question: "What is the capital of Australia?",
            options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
            correctAnswer: 2,
          },
        ],
      })
      
      // Literature quiz
      additionalQuizzes.push({
        title: "Classic Literature",
        description: "Test your knowledge of classic literature",
        topic: "Literature",
        difficulty: "Hard",
        createdBy: adminId,
        questions: [
          {
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
            correctAnswer: 1,
          },
          {
            question: "Which novel starts with 'It was the best of times, it was the worst of times'?",
            options: ["Pride and Prejudice", "A Tale of Two Cities", "Great Expectations", "Oliver Twist"],
            correctAnswer: 1,
          },
          {
            question: "Who wrote '1984'?",
            options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
            correctAnswer: 1,
          },
          {
            question: "Which character is the protagonist of 'Moby Dick'?",
            options: ["Captain Ahab", "Ishmael", "Queequeg", "Starbuck"],
            correctAnswer: 1,
          },
          {
            question: "Who wrote 'Pride and Prejudice'?",
            options: ["Charlotte Brontë", "Emily Brontë", "Jane Austen", "George Eliot"],
            correctAnswer: 2,
          },
          {
            question: "Which novel features the character Jay Gatsby?",
            options: ["The Sun Also Rises", "The Great Gatsby", "Tender is the Night", "This Side of Paradise"],
            correctAnswer: 1,
          },
          {
            question: "Who wrote 'To Kill a Mockingbird'?",
            options: ["Harper Lee", "Truman Capote", "William Faulkner", "John Steinbeck"],
            correctAnswer: 0,
          },
          {
            question: "Which epic poem features the hero Odysseus?",
            options: ["Iliad", "Odyssey", "Aeneid", "Paradise Lost"],
            correctAnswer: 1,
          },
          {
            question: "Who wrote 'War and Peace'?",
            options: ["Fyodor Dostoevsky", "Leo Tolstoy", "Anton Chekhov", "Ivan Turgenev"],
            correctAnswer: 1,
          },
          {
            question: "Which Shakespeare play features the character Hamlet?",
            options: ["Macbeth", "King Lear", "Hamlet", "Othello"],
            correctAnswer: 2,
          },
        ],
      })
      
      // Technology quiz
      additionalQuizzes.push({
        title: "Modern Technology",
        description: "Test your knowledge of modern technology",
        topic: "Technology",
        difficulty: "Medium",
        createdBy: adminId,
        questions: [
          {
            question: "Who founded Microsoft?",
            options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Larry Page"],
            correctAnswer: 1,
          },
          {
            question: "What does 'HTTP' stand for?",
            options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "Home Tool Transfer Protocol", "HyperText Transmission Protocol"],
            correctAnswer: 0,
          },
          {
            question: "Which programming language is known as the 'language of the web'?",
            options: ["Python", "Java", "JavaScript", "C++"],
            correctAnswer: 2,
          },
          {
            question: "What year was the iPhone first released?",
            options: ["2005", "2006", "2007", "2008"],
            correctAnswer: 2,
          },
          {
            question: "What does 'AI' stand for?",
            options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Algorithmic Intelligence"],
            correctAnswer: 1,
          },
          {
            question: "Which company developed the Android operating system?",
            options: ["Apple", "Microsoft", "Google", "Samsung"],
            correctAnswer: 2,
          },
          {
            question: "What is the name of the first computer virus?",
            options: ["Creeper", "Morris", "ILOVEYOU", "Melissa"],
            correctAnswer: 0,
          },
          {
            question: "What does 'URL' stand for?",
            options: ["Universal Resource Locator", "Uniform Resource Locator", "Unified Resource Locator", "Universal Reference Locator"],
            correctAnswer: 1,
          },
          {
            question: "Who invented the World Wide Web?",
            options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"],
            correctAnswer: 2,
          },
          {
            question: "What does 'VPN' stand for?",
            options: ["Virtual Private Network", "Virtual Protected Network", "Virtual Personal Network", "Virtual Public Network"],
            correctAnswer: 0,
          },
        ],
      })
      
      // Sports quiz
      additionalQuizzes.push({
        title: "Sports Trivia",
        description: "Test your knowledge of sports",
        topic: "Sports",
        difficulty: "Easy",
        createdBy: adminId,
        questions: [
          {
            question: "How many players are on a basketball team?",
            options: ["4", "5", "6", "7"],
            correctAnswer: 1,
          },
          {
            question: "In which sport would you perform a slam dunk?",
            options: ["Volleyball", "Tennis", "Basketball", "Baseball"],
            correctAnswer: 2,
          },
          {
            question: "How often are the Olympic Games held?",
            options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"],
            correctAnswer: 2,
          },
          {
            question: "Which country has won the most FIFA World Cups?",
            options: ["Germany", "Argentina", "Brazil", "Italy"],
            correctAnswer: 2,
          },
          {
            question: "In which sport do you use a shuttlecock?",
            options: ["Tennis", "Badminton", "Squash", "Racquetball"],
            correctAnswer: 1,
          },
          {
            question: "How many innings are in a standard baseball game?",
            options: ["7", "8", "9", "10"],
            correctAnswer: 2,
          },
          {
            question: "Which martial art is known as 'the way of the gentle fist'?",
            options: ["Karate", "Judo", "Kung Fu", "Taekwondo"],
            correctAnswer: 1,
          },
          {
            question: "In which sport would you find a 'bunker'?",
            options: ["Tennis", "Golf", "Baseball", "Football"],
            correctAnswer: 1,
          },
          {
            question: "How many players are on a standard soccer team?",
            options: ["9", "10", "11", "12"],
            correctAnswer: 2,
          },
          {
            question: "Which race is known as 'The Greatest Show on Earth'?",
            options: ["Boston Marathon", "New York Marathon", "Tour de France", "Ironman"],
            correctAnswer: 2,
          },
        ],
      })
      
      // Music quiz
      additionalQuizzes.push({
        title: "Music History",
        description: "Test your knowledge of music history",
        topic: "Music",
        difficulty: "Medium",
        createdBy: adminId,
        questions: [
          {
            question: "Who is known as the 'King of Pop'?",
            options: ["Elvis Presley", "Michael Jackson", "Prince", "Madonna"],
            correctAnswer: 1,
          },
          {
            question: "Which instrument has 88 keys?",
            options: ["Organ", "Piano", "Harpsichord", "Synthesizer"],
            correctAnswer: 1,
          },
          {
            question: "How many strings does a standard guitar have?",
            options: ["4", "5", "6", "7"],
            correctAnswer: 2,
          },
          {
            question: "Who composed 'The Four Seasons'?",
            options: ["Mozart", "Beethoven", "Bach", "Vivaldi"],
            correctAnswer: 3,
          },
          {
            question: "Which music genre originated in New Orleans?",
            options: ["Blues", "Jazz", "Rock and Roll", "Country"],
            correctAnswer: 1,
          },
          {
            question: "What does 'DJ' stand for?",
            options: ["Disc Jockey", "Digital Jockey", "Dance Jockey", "Dynamic Jockey"],
            correctAnswer: 0,
          },
          {
            question: "Who wrote 'Bohemian Rhapsody'?",
            options: ["John Lennon", "Freddie Mercury", "Paul McCartney", "Robert Plant"],
            correctAnswer: 1,
          },
          {
            question: "How many members were in The Beatles?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
          },
          {
            question: "Which instrument is a woodwind instrument?",
            options: ["Trumpet", "Trombone", "Flute", "French Horn"],
            correctAnswer: 2,
          },
          {
            question: "What is the term for a musical composition for solo piano?",
            options: ["Sonata", "Symphony", "Concerto", "Opera"],
            correctAnswer: 0,
          },
        ],
      })
      
      // Movies quiz
      additionalQuizzes.push({
        title: "Movie Trivia",
        description: "Test your knowledge of movies",
        topic: "Movies",
        difficulty: "Easy",
        createdBy: adminId,
        questions: [
          {
            question: "Who directed 'Jaws'?",
            options: ["George Lucas", "Steven Spielberg", "Martin Scorsese", "Francis Ford Coppola"],
            correctAnswer: 1,
          },
          {
            question: "Which movie won the Academy Award for Best Picture in 2020?",
            options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
            correctAnswer: 2,
          },
          {
            question: "Who played Jack in 'Titanic'?",
            options: ["Brad Pitt", "Tom Cruise", "Leonardo DiCaprio", "Matt Damon"],
            correctAnswer: 2,
          },
          {
            question: "Which movie features the line 'May the Force be with you'?",
            options: ["Star Trek", "Star Wars", "Guardians of the Galaxy", "Avatar"],
            correctAnswer: 1,
          },
          {
            question: "Who directed 'The Godfather'?",
            options: ["Martin Scorsese", "Francis Ford Coppola", "Steven Spielberg", "Alfred Hitchcock"],
            correctAnswer: 1,
          },
          {
            question: "Which movie is the highest-grossing film of all time?",
            options: ["Titanic", "Star Wars: The Force Awakens", "Avatar", "Avengers: Endgame"],
            correctAnswer: 3,
          },
          {
            question: "Who played Forrest Gump?",
            options: ["Tom Hanks", "Robin Williams", "Jim Carrey", "Adam Sandler"],
            correctAnswer: 0,
          },
          {
            question: "Which movie features a character named 'Darth Vader'?",
            options: ["Star Trek", "Star Wars", "Battlestar Galactica", "Guardians of the Galaxy"],
            correctAnswer: 1,
          },
          {
            question: "Who directed 'Pulp Fiction'?",
            options: ["Martin Scorsese", "Francis Ford Coppola", "Steven Spielberg", "Quentin Tarantino"],
            correctAnswer: 3,
          },
          {
            question: "Which movie features the song 'My Heart Will Go On'?",
            options: ["The Notebook", "Titanic", "Ghost", "Dirty Dancing"],
            correctAnswer: 1,
          },
        ],
      })
      
      // General Knowledge quiz
      additionalQuizzes.push({
        title: "General Knowledge Challenge",
        description: "Test your general knowledge",
        topic: "General Knowledge",
        difficulty: "Medium",
        createdBy: adminId,
        questions: [
          {
            question: "What is the largest organ in the human body?",
            options: ["Heart", "Liver", "Brain", "Skin"],
            correctAnswer: 3,
          },
          {
            question: "How many days are in a leap year?",
            options: ["364", "365", "366", "367"],
            correctAnswer: 2,
          },
          {
            question: "What is the capital of Japan?",
            options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
            correctAnswer: 2,
          },
          {
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correctAnswer: 1,
          },
          {
            question: "What is the chemical symbol for gold?",
            options: ["Go", "Gd", "Au", "Ag"],
            correctAnswer: 2,
          },
          {
            question: "How many continents are there on Earth?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
          },
          {
            question: "What is the largest mammal in the world?",
            options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
            correctAnswer: 1,
          },
          {
            question: "In which year did World War I begin?",
            options: ["1912", "1913", "1914", "1915"],
            correctAnswer: 2,
          },
          {
            question: "What is the smallest prime number?",
            options: ["0", "1", "2", "3"],
            correctAnswer: 2,
          },
          {
            question: "Which element has the atomic number 1?",
            options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
            correctAnswer: 1,
          },
        ],
      })
      
      // make sure additional quizzes have share ids too
      additionalQuizzes.forEach((q) => {
        if (!q.shareId) q.shareId = Math.random().toString(36).substring(2, 15)
      })
      await Quiz.insertMany(additionalQuizzes)
      console.log("Additional quizzes for all topics created")
    } catch (error) {
      console.error("Error initializing topics and quizzes:", error)
    }
  }
}

// Ensure default quiz images are present for key topics
const ensureQuizImages = async () => {
  try {
    const updates = [
      {
        title: "Basic Mathematics",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Euclid%27s_Elements_Book_1_Proposition_47.svg/640px-Euclid%27s_Elements_Book_1_Proposition_47.svg.png",
      },
      {
        title: "World History",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Declaration_of_Independence_%281817%29.jpg/640px-Declaration_of_Independence_%281817%29.jpg",
      },
      {
        title: "World Geography",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/640px-World_map_-_low_resolution.svg.png",
      },
    ]

    for (const { title, imageUrl } of updates) {
      await Quiz.updateOne({ title, $or: [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: "" }] }, { $set: { imageUrl } })
    }

    console.log("Default quiz images ensured")
  } catch (err) {
    console.error("Error ensuring quiz images:", err)
  }
}

const topicImageUrl = {
  Mathematics:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Euclid%27s_Elements_Book_1_Proposition_47.svg/640px-Euclid%27s_Elements_Book_1_Proposition_47.svg.png",
  Science: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Periodic_table_large.svg/640px-Periodic_table_large.svg.png",
  History:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Declaration_of_Independence_%281817%29.jpg/640px-Declaration_of_Independence_%281817%29.jpg",
  Geography: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/640px-World_map_-_low_resolution.svg.png",
  Literature: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bookshelf.jpg/640px-Bookshelf.jpg",
  Technology:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/PCB_Overview.jpg/640px-PCB_Overview.jpg",
  Sports: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Soccer_ball.svg/512px-Soccer_ball.svg.png",
  Music: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Musical_note_nicu_buculei_01.svg/512px-Musical_note_nicu_buculei_01.svg.png",
  Movies: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Clapperboard.svg/512px-Clapperboard.svg.png",
  "General Knowledge":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Brain_with_text.svg/640px-Brain_with_text.svg.png",
}

const ensureQuizzesForAllTopics = async () => {
  try {
    const topics = await Topic.find()
    if (!topics.length) return

    const adminExists = await User.findOne({ email: "admin@quizapp.com" })
    if (!adminExists) return

    for (const t of topics) {
      const existing = await Quiz.countDocuments({ topic: t.name })
      if (existing > 0) continue

      const questions = buildLocalQuestions({ topic: t.name, count: 10 })
      const quiz = {
        title: `${t.name} Starter Quiz`,
        description: `Starter quiz for ${t.name}`,
        topic: t.name,
        difficulty: "Medium",
        createdBy: adminExists._id,
        imageUrl: topicImageUrl[t.name],
        timeLimit: 600,
        plays: 0,
        shareId: Math.random().toString(36).substring(2, 15),
        questions,
      }

      await Quiz.create(quiz)
    }

    console.log("Quizzes ensured for all topics")
  } catch (err) {
    console.error("Error ensuring quizzes for all topics:", err)
  }
}
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  initializeTopics()
  ensureQuizImages()
  ensureQuizzesForAllTopics()
})
