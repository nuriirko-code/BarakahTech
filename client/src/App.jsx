// The router maps public authentication pages and role-specific dashboards,
// while AuthProvider makes authentication state available throughout the app.
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import RoleSelection from './pages/auth/RoleSelection'
import StudentRegister from './pages/auth/StudentRegister'
import TeacherRegister from './pages/auth/TeacherRegister'
import Login from './pages/auth/Login'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing page for visitors arriving at the application root. */}
          <Route path="/" element={<Landing />} />

          {/* Role selection for visitors choosing a student or teacher registration path. */}
          <Route path="/register" element={<RoleSelection />} />

          {/* Student registration page for users creating student accounts. */}
          <Route path="/register/student" element={<StudentRegister />} />

          {/* Teacher registration page for users applying to become teachers. */}
          <Route path="/register/teacher" element={<TeacherRegister />} />

          {/* Login page for existing users signing into their accounts. */}
          <Route path="/login" element={<Login />} />

          {/* Student dashboard for authenticated users with the student role. */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />

          {/* Teacher dashboard for authenticated users with the teacher role. */}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />

          {/* Admin dashboard for authenticated users with the admin role. */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App