// API utilities
import { getToken } from "./auth"

// API base URL - make sure this matches your backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
async function authFetch(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "API request failed")
  }

  return response.json()
}

/**
 * Get all topics
 * @returns {Promise<Array>} - List of topics
 */
export async function getAllTopics() {
  try {
    // For testing, return hardcoded topics if the API fails
    const defaultTopics = [
      { id: "1", name: "Mathematics", slug: "mathematics", icon: "📊", description: "Math related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "2", name: "Science", slug: "science", icon: "🔬", description: "Science related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "3", name: "History", slug: "history", icon: "📜", description: "History related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "4", name: "Geography", slug: "geography", icon: "🌍", description: "Geography related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "5", name: "Literature", slug: "literature", icon: "📚", description: "Literature related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "6", name: "Technology", slug: "technology", icon: "💻", description: "Technology related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "7", name: "Sports", slug: "sports", icon: "⚽", description: "Sports related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "8", name: "Music", slug: "music", icon: "🎵", description: "Music related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "9", name: "Movies", slug: "movies", icon: "🎬", description: "Movies related quizzes", difficulty: "Medium", quizCount: 0 },
      { id: "10", name: "General Knowledge", slug: "general-knowledge", icon: "🧠", description: "General knowledge quizzes", difficulty: "Medium", quizCount: 0 },
    ]

    try {
      const data = await authFetch("/topics")
      return data.length > 0 ? data : defaultTopics
    } catch (error) {
      console.warn("Failed to fetch topics from API, using default topics:", error)
      return defaultTopics
    }
  } catch (error) {
    console.error("Error fetching topics:", error)
    throw error
  }
}

/**
 * Get topic by slug
 * @param {string} slug - Topic slug
 * @returns {Promise<Object>} - Topic data
 */
export async function getTopicBySlug(slug) {
  try {
    return await authFetch(`/topics/${slug}`)
  } catch (error) {
    console.error(`Error fetching topic ${slug}:`, error)
    throw error
  }
}

/**
 * Get quizzes by topic
 * @param {string} topic - Topic name or slug
 * @returns {Promise<Array>} - List of quizzes
 */
export async function getQuizzesByTopic(topic) {
  try {
    return await authFetch(`/topics/${encodeURIComponent(topic)}/quizzes`)
  } catch (error) {
    console.error(`Error fetching quizzes for topic ${topic}:`, error)
    // Fallback: fetch all quizzes and filter by topic name if API fails
    try {
      const all = await getAllQuizzes()
      return all.filter((q) => q.topic === topic || q.topic.toLowerCase() === topic.toLowerCase())
    } catch (fallbackErr) {
      console.error(`Fallback fetch error for quizzes by topic ${topic}:`, fallbackErr)
      throw error
    }
  }
}

/**
 * Get all quizzes
 * @returns {Promise<Array>} - List of quizzes
 */
export async function getAllQuizzes() {
  try {
    return await authFetch("/quizzes")
  } catch (error) {
    console.error("Error fetching all quizzes:", error)
    throw error
  }
}

/**
 * Get featured quizzes
 * @param {number} limit - Number of quizzes to return
 * @returns {Promise<Array>} - List of featured quizzes
 */
export async function getFeaturedQuizzes(limit = 3) {
  try {
    return await authFetch(`/quizzes/featured?limit=${limit}`)
  } catch (error) {
    console.error("Error fetching featured quizzes:", error)
    // Return empty array instead of throwing
    return []
  }
}

/**
 * Get quiz by ID
 * @param {string} id - Quiz ID
 * @returns {Promise<Object>} - Quiz data
 */
export async function getQuizById(id) {
  try {
    return await authFetch(`/quizzes/${id}`)
  } catch (error) {
    console.error(`Error fetching quiz ${id}:`, error)
    throw error
  }
}

/**
 * Get user's quizzes
 * @returns {Promise<Array>} - List of user's quizzes
 */
export async function getUserQuizzes() {
  try {
    return await authFetch("/user/quizzes")
  } catch (error) {
    console.error("Error fetching user quizzes:", error)
    throw error
  }
}

/**
 * Create a new quiz
 * @param {Object} quizData - Quiz data
 * @returns {Promise<Object>} - Created quiz
 */
export async function createQuiz(quizData) {
  try {
    console.log("Creating quiz with data:", quizData)
    return await authFetch("/quizzes", {
      method: "POST",
      body: JSON.stringify(quizData),
    })
  } catch (error) {
    console.error("Error creating quiz:", error)
    throw error
  }
}

/**
 * Update a quiz
 * @param {string} id - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise<Object>} - Updated quiz
 */
export async function updateQuiz(id, quizData) {
  try {
    return await authFetch(`/quizzes/${id}`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    })
  } catch (error) {
    console.error(`Error updating quiz ${id}:`, error)
    throw error
  }
}

/**
 * Delete a quiz
 * @param {string} id - Quiz ID
 * @returns {Promise<Object>} - Response data
 */
export async function deleteQuiz(id) {
  try {
    return await authFetch(`/quizzes/${id}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error(`Error deleting quiz ${id}:`, error)
    throw error
  }
}

/**
 * Get quiz by share ID
 * @param {string} shareId - Quiz share ID
 * @returns {Promise<Object>} - Quiz data
 */
export async function getQuizByShareId(shareId) {
  try {
    return await authFetch(`/quizzes/shared/${shareId}`)
  } catch (error) {
    console.error(`Error fetching shared quiz ${shareId}:`, error)
    throw error
  }
}

/**
 * Submit quiz progress
 * @param {Object} progressData - Progress data
 * @returns {Promise<Object>} - Response data
 */
export async function submitProgress(progressData) {
  try {
    return await authFetch("/progress", {
      method: "POST",
      body: JSON.stringify(progressData),
    })
  } catch (error) {
    console.error("Error submitting progress:", error)
    throw error
  }
}

/**
 * Get user progress
 * @returns {Promise<Array>} - List of user progress records
 */
export async function getUserProgress() {
  try {
    return await authFetch("/progress")
  } catch (error) {
    console.error("Error fetching user progress:", error)
    throw error
  }
}

/**
 * Get user stats
 * @returns {Promise<Object>} - User stats data
 */
export async function getUserStats() {
  try {
    return await authFetch("/stats")
  } catch (error) {
    console.error("Error fetching user stats:", error)
    throw error
  }
}

export async function generateAiQuiz(payload) {
  try {
    return await authFetch("/ai/generate", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    })
  } catch (error) {
    console.error("Error generating quiz with AI:", error)
    throw error
  }
}
