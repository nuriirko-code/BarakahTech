// The router maps public authentication pages and role-specific dashboards,
// while AuthProvider makes authentication state available throughout the app.
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing'
import RoleSelection from './pages/auth/RoleSelection'
import StudentRegister from './pages/auth/StudentRegister'
import TeacherRegister from './pages/auth/TeacherRegister'
import TeacherWelcome from './pages/auth/TeacherWelcome'
import ApplicationSubmitted from './pages/auth/ApplicationSubmitted'
import Login from './pages/auth/Login'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import StudentOverview from './pages/dashboard/student/StudentOverview'
import StudentCourses from './pages/dashboard/student/StudentCourses'
import StudentBrowse from './pages/dashboard/student/StudentBrowse'
import StudentProfile from './pages/dashboard/student/StudentProfile'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import TeacherOverview from './pages/dashboard/teacher/TeacherOverview'
import TeacherCourses from './pages/dashboard/teacher/TeacherCourses'
import TeacherCreateCourse from './pages/dashboard/teacher/TeacherCreateCourse'
import TeacherSessions from './pages/dashboard/teacher/TeacherSessions'
import TeacherProfile from './pages/dashboard/teacher/TeacherProfile'
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

          {/* Introduction for prospective teachers before they begin the application form. */}
          <Route path="/become-a-teacher" element={<TeacherWelcome />} />

          {/* Confirmation page for teachers whose application was submitted successfully. */}
          <Route path="/application-submitted" element={<ApplicationSubmitted />} />

          {/* Login page for existing users signing into their accounts. */}
          <Route path="/login" element={<Login />} />

          {/* Student and teacher portals share a nested layout pattern, while each owns different dashboard content. */}
          <Route path="/dashboard/student" element={<StudentDashboard />}>
            <Route index element={<StudentOverview />} />
            <Route path="browse" element={<StudentBrowse />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Nested routes keep the teacher portal shell while changing its page content. */}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />}>
            {/* The index route renders the overview at /dashboard/teacher itself. */}
            <Route index element={<TeacherOverview />} />
            {/* This child renders at /dashboard/teacher/courses. */}
            <Route path="courses" element={<TeacherCourses />} />
            {/* This child renders at /dashboard/teacher/courses/create. */}
            <Route path="courses/create" element={<TeacherCreateCourse />} />
            {/* This child renders at /dashboard/teacher/sessions. */}
            <Route path="sessions" element={<TeacherSessions />} />
            {/* This child renders at /dashboard/teacher/profile. */}
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          {/* Frontend role checks improve navigation; backend authorization still protects admin APIs. */}
          <Route
            path="/dashboard/admin"
            element={(
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App