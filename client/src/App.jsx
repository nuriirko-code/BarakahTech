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
import TeachingPathSelection from './pages/auth/TeachingPathSelection'
import LiveTutorWelcome from './pages/auth/LiveTutorWelcome'
import LiveTutorRegister from './pages/auth/LiveTutorRegister'
import ApplicationSubmitted from './pages/auth/ApplicationSubmitted'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import StudentOverview from './pages/dashboard/student/StudentOverview'
import StudentCourses from './pages/dashboard/student/StudentCourses'
import StudentBrowse from './pages/dashboard/student/StudentBrowse'
import StudentProfile from './pages/dashboard/student/StudentProfile'
import FindTutor from './pages/dashboard/student/FindTutor'
import StudentSessions from './pages/dashboard/student/StudentSessions'
import CourseViewer from './pages/learn/CourseViewer'
import LessonViewer from './pages/learn/LessonViewer'
import CourseCheckout from './pages/payment/CourseCheckout'
import TrialPaymentGate from './pages/payment/TrialPaymentGate'
import MessagesPage from './pages/messaging/MessagesPage'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import TeacherOverview from './pages/dashboard/teacher/TeacherOverview'
import TeacherCourses from './pages/dashboard/teacher/TeacherCourses'
import TeacherCreateCourse from './pages/dashboard/teacher/TeacherCreateCourse'
import TeacherSessions from './pages/dashboard/teacher/TeacherSessions'
import TeacherProfile from './pages/dashboard/teacher/TeacherProfile'
import LiveTutorSchedule from './pages/dashboard/teacher/live/LiveTutorSchedule'
import LiveTutorSessions from './pages/dashboard/teacher/live/LiveTutorSessions'
import LiveTutorEarnings from './pages/dashboard/teacher/live/LiveTutorEarnings'
import LiveTutorProfile from './pages/dashboard/teacher/live/LiveTutorProfile'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import LiveTutorApplication from './pages/live-tutor/LiveTutorApplication'
import TutorProfilePage from './pages/tutors/TutorProfilePage'
import BookingPage from './pages/tutors/BookingPage'
import SessionRoom from './pages/session/SessionRoom'
import SessionFeedback from './pages/session/SessionFeedback'

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
          <Route path="/choose-teaching-path" element={<TeachingPathSelection />} />
          <Route path="/become-a-live-tutor" element={<LiveTutorWelcome />} />
          <Route path="/register/live-tutor" element={<LiveTutorRegister />} />

          {/* Confirmation page for teachers whose application was submitted successfully. */}
          <Route path="/application-submitted" element={<ApplicationSubmitted />} />

          {/* Login page for existing users signing into their accounts. */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Learning uses standalone routes, outside dashboard layouts, to provide a focused full-page course experience. */}
          {/* :courseId and :lessonId are dynamic URL parameters identifying the requested course and lesson. */}
          <Route path="/learn/:courseId" element={<CourseViewer />} />
          <Route path="/learn/:courseId/:lessonId" element={<LessonViewer />} />
          <Route
            path="/courses/:courseId/enroll"
            element={(
              <ProtectedRoute allowedRoles={['student']}>
                <TrialPaymentGate />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/checkout/course/:courseId"
            element={(
              <ProtectedRoute allowedRoles={['student']}>
                <CourseCheckout />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/messages"
            element={(
              <ProtectedRoute allowedRoles={['student', 'teacher', 'pending_teacher', 'admin']}>
                <MessagesPage />
              </ProtectedRoute>
            )}
          />

          {/* The application is standalone because it is a focused, multi-step
              process rather than a page within the student dashboard layout. */}
          <Route path="/apply/live-tutor" element={(
            <ProtectedRoute allowedRoles={['student', 'pending_teacher', 'teacher']}>
              <LiveTutorApplication />
            </ProtectedRoute>
          )} />

          {/* Tutor profiles are public standalone pages: visitors can evaluate
              a tutor before registering, without entering either dashboard. */}
          <Route path="/tutors/:profileId" element={<TutorProfilePage />} />
          <Route path="/book/:profileId" element={(
            <ProtectedRoute allowedRoles={['student']}>
              <BookingPage />
            </ProtectedRoute>
          )} />
          {/* A session room is outside dashboard shells so the video call can
              use the full screen, while backend checks still limit access to
              the student and tutor assigned to that booking. */}
          <Route path="/session/:bookingId" element={(
            <ProtectedRoute allowedRoles={['student', 'teacher', 'live_tutor']}>
              <SessionRoom />
            </ProtectedRoute>
          )} />
          <Route path="/session/:bookingId/feedback" element={(
            <ProtectedRoute allowedRoles={['student', 'teacher', 'live_tutor']}>
              <SessionFeedback />
            </ProtectedRoute>
          )} />

          {/* Student and teacher portals share a nested layout pattern, while each owns different dashboard content. */}
          <Route path="/dashboard/student" element={<StudentDashboard />}>
            <Route index element={<StudentOverview />} />
            <Route path="browse" element={<StudentBrowse />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="profile" element={<StudentProfile />} />
            {/* These remain nested so students keep the dashboard sidebar and
                mobile layout while moving between live-learning pages. */}
            <Route path="find-tutor" element={<FindTutor />} />
            <Route path="my-sessions" element={<StudentSessions />} />
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
            {/* Live-tutor tools are nested here so course teachers and tutors
                keep one dashboard shell and sidebar while only the active
                content panel changes. */}
            <Route path="live-schedule" element={<LiveTutorSchedule />} />
            <Route path="live-sessions" element={<LiveTutorSessions />} />
            <Route path="live-earnings" element={<LiveTutorEarnings />} />
            <Route path="live-profile" element={<LiveTutorProfile />} />
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
