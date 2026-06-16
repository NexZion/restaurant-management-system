import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ACCESS_TOKEN')
  
  if (!token) {
    return <Navigate to="/" replace />
  }
  
  return children
}
