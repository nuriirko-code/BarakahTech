import API_BASE_URL from '../config/api.js'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

// Polling is simpler to operate than WebSockets for an MVP with low message volume,
// while still refreshing the badge often enough for normal inbox use.
const useUnreadMessageCount = () => {
  const { user, token } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user || !token) return undefined

    let isCurrent = true
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) setUnreadCount(Number(response.data.count) || 0)
      } catch {
        // Notifications are supplementary; an unread-count failure should not block navigation.
      }
    }

    fetchUnreadCount()
    // Thirty seconds balances reasonable badge freshness with low request load for the MVP.
    const intervalId = window.setInterval(fetchUnreadCount, 30000)

    return () => {
      isCurrent = false
      // Clear the timer on unmount or logout to prevent orphaned polling and state updates.
      window.clearInterval(intervalId)
    }
  }, [token, user])

  return unreadCount
}

export default useUnreadMessageCount
