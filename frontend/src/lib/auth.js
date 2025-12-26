// Authentication utilities
import { jwtDecode } from "jwt-decode"

// API base URL - make sure this matches your backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Response with token and user data
 */
export async function signup(userData) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed",
      }
    }

    // Store token in localStorage
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))

    return {
      success: true,
      user: data.user,
      token: data.token,
    }
  } catch (error) {
    console.error("Signup error:", error)
    return {
      success: false,
      message: "An error occurred during registration",
    }
  }
}

/**
 * Log in a user
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} - Response with token and user data
 */
export async function login(credentials) {
  try {
    console.log("Attempting login with:", credentials)
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()
    console.log("Login response:", data)

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      }
    }

    // Store token in localStorage
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))

    return {
      success: true,
      user: data.user,
      token: data.token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An error occurred during login",
    }
  }
}

/**
 * Log out the current user
 */
export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

/**
 * Check if a user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false
  }

  const token = localStorage.getItem("token")
  if (!token) {
    return false
  }

  try {
    // Decode the token to check if it's expired
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    return decoded.exp > currentTime
  } catch (error) {
    console.error("Token validation error:", error)
    return false
  }
}

/**
 * Get the current user's data
 * @returns {Object|null} - User data or null if not authenticated
 */
export function getUser() {
  if (typeof window === "undefined") {
    return null
  }

  const userStr = localStorage.getItem("user")
  if (!userStr) {
    return null
  }

  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

/**
 * Get the authentication token
 * @returns {string|null} - The token or null if not authenticated
 */
export function getToken() {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("token")
}

/**
 * Fetch the authenticated user's profile from the backend
 * @returns {Promise<Object>} - User profile
 */
export async function getUserProfile() {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/user`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Failed to fetch user profile")
    }

    return response.json()
  } catch (error) {
    console.error("Get user profile error:", error)
    throw error
  }
}

/**
 * Update the stored user data
 * @param {Object} userData - Updated user data
 */
export function updateUser(userData) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("user", JSON.stringify(userData))
}
