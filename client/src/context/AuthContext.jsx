import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  // The user is the safe account object returned by the backend after login.
  const [user, setUser] = useState(null)

  // The token is kept in state for the current session and localStorage for reloads.
  const [token, setToken] = useState(null)

  // Loading prevents the app from rendering auth-dependent content before the
  // saved token has been checked with the backend.
  const [loading, setLoading] = useState(true)

  // This can display short-lived messages such as successful registration.
  const [successMessage, setSuccessMessage] = useState('')

  const login = (userData, tokenValue) => {
    localStorage.setItem('barakahtech_token', tokenValue)
    axios.defaults.headers.common.Authorization = `Bearer ${tokenValue}`
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('barakahtech_token')
    delete axios.defaults.headers.common.Authorization
    setToken(null)
    setUser(null)
  }

  const setSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage('')
    }, 4000)
  }

  useEffect(() => {
    // localStorage lets a user remain signed in after refreshing the browser.
    const storedToken = localStorage.getItem('barakahtech_token')

    if (!storedToken) {
      setLoading(false)
      return
    }

    // The default header makes the saved token available to every axios request.
    axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`

    const verifyToken = async () => {
      try {
        // The backend must verify the token instead of the client trusting storage.
        const response = await axios.get('http://localhost:5000/api/auth/me')
        setUser(response.data.user)
        setToken(storedToken)
      } catch (error) {
        localStorage.removeItem('barakahtech_token')
        delete axios.defaults.headers.common.Authorization
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, successMessage, login, logout, setSuccess }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}