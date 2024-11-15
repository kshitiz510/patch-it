import * as React from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function DashboardLayout() {
  const { userId, isLoaded } = useAuth()
  const navigate = useNavigate()

  console.log('test', userId)

  React.useEffect(() => {
    if (isLoaded && !userId) {
      navigate('/sign-in')
    }
  }, [isLoaded, userId, navigate])

  // Fetch data from the backend when user is authenticated
  React.useEffect(() => {
    if (userId) {
      fetch('http://localhost:4000/', {  // Change URL as needed
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}` // Or any other token if needed
        }
      })
      .then(response => {
        console.log('Response:', response)
        return response.text()  // Get the raw text first to see what is returned
      })
      .then(text => {
        console.log('Response Text:', text)
        // Now attempt to parse JSON if it's actually JSON
        try {
          const data = JSON.parse(text)
          console.log('Data from backend:', data)
        } catch (error) {
          console.error('Error parsing JSON:', error)
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
      
    }
  }, [userId])  // Fetch data when userId changes

  if (!isLoaded) return 'Loading...'

  return <Outlet />
}
