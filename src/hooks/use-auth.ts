'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'

interface User {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatar: any
  id: string
  email: string
  name: string
  role: string
  cartId?: string
  createdAt?: Date
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  verifyAuth: () => Promise<boolean>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/auth?action=login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Login failed')
          }

          // Store user and token
          set({ 
            user: data.user, 
            token: data.token,
            isInitialized: true
          })
          
          // Store token in localStorage for API calls
          localStorage.setItem('token', data.token)
          
          toast.success('Logged in successfully!')
          return true
          
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
          console.error('Login error:', error)
          toast.error(message)
          return false
          
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/auth?action=register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed')
          }

          // Store user and token
          set({ 
            user: data.user, 
            token: data.token,
            isInitialized: true
          })
          
          // Store token in localStorage for API calls
          localStorage.setItem('token', data.token)
          
          toast.success('Account created successfully! Welcome to TechShop!')
          return true
          
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed. Please try again.'
          console.error('Registration error:', error)
          toast.error(message)
          return false
          
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          // Call logout API to clear cookie
          await fetch('/api/auth?action=logout', {
            method: 'POST',
          })
          
          // Clear local storage
          localStorage.removeItem('token')
          localStorage.removeItem('cart')
          
          // Clear state
          set({ 
            user: null, 
            token: null,
            isLoading: false,
            isInitialized: true
          })
          
          toast.success('Logged out successfully')
          
        } catch (error) {
          console.error('Logout error:', error)
          // Still clear local state even if API fails
          localStorage.removeItem('token')
          set({ 
            user: null, 
            token: null,
            isLoading: false,
            isInitialized: true
          })
          toast.success('Logged out successfully')
        }
      },

      verifyAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ isInitialized: true })
          return false
        }

        try {
          const response = await fetch('/api/auth?action=verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          const data = await response.json()

          if (response.ok && data.valid) {
            set({ 
              user: data.user, 
              token,
              isInitialized: true 
            })
            return true
          } else {
            // Token is invalid
            localStorage.removeItem('token')
            set({ 
              user: null, 
              token: null,
              isInitialized: true 
            })
            return false
          }
          
        } catch (error) {
          console.error('Auth verification error:', error)
          localStorage.removeItem('token')
          set({ 
            user: null, 
            token: null,
            isInitialized: true 
          })
          return false
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setToken: (token: string | null) => {
        set({ token })
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
      },

      clearAuth: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('cart')
        set({ 
          user: null, 
          token: null,
          isLoading: false,
          isInitialized: true
        })
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isInitialized: state.isInitialized 
      }),
    }
  )
)

// Helper hooks for specific auth states
export const useAuthUser = () => {
  const { user } = useAuth()
  return user
}

export const useIsAdmin = () => {
  const { user } = useAuth()
  return user?.role === 'ADMIN'
}

export const useIsAuthenticated = () => {
  const { user, token } = useAuth()
  return !!(user && token)
}

export const useAuthLoading = () => {
  const { isLoading } = useAuth()
  return isLoading
}