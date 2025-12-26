const mongoose = require("mongoose")

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, "{PATH} must have at least 2 options"],
  },
  correctAnswer: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
})

function arrayLimit(val) {
  return val.length >= 2
}

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: [questionsLimit, "{PATH} must have at least 1 question"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    favorites: {
      type: Number,
      default: 0,
    },
    completions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

function questionsLimit(val) {
  return val.length >= 1
}

// Add indexes for better query performance
QuizSchema.index({ topic: 1 })
QuizSchema.index({ difficulty: 1 })
QuizSchema.index({ createdBy: 1 })
QuizSchema.index({ isPublic: 1 })
QuizSchema.index({ tags: 1 })

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema)
