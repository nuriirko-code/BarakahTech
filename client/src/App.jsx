import { lazy, Suspense } from 'react'
// The router maps public authentication pages and role-specific dashboards,
// while AuthProvider makes authentication state available throughout the app.
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

const NotFound = lazy(() => import('./pages/NotFound'))
const Landing = lazy(() => import('./pages/Landing'))
const RoleSelection = lazy(() => import('./pages/auth/RoleSelection'))
const StudentRegister = lazy(() => import('./pages/auth/StudentRegister'))
const TeacherRegister = lazy(() => import('./pages/auth/TeacherRegister'))
const TeacherWelcome = lazy(() => import('./pages/auth/TeacherWelcome'))
const TeachingPathSelection = lazy(() => import('./pages/auth/TeachingPathSelection'))
const LiveTutorWelcome = lazy(() => import('./pages/auth/LiveTutorWelcome'))
const LiveTutorRegister = lazy(() => import('./pages/auth/LiveTutorRegister'))
const StudentWelcome = lazy(() => import('./pages/auth/StudentWelcome'))
const ApplicationSubmitted = lazy(() => import('./pages/auth/ApplicationSubmitted'))
const Login = lazy(() => import('./pages/auth/Login'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'))
const StudentOverview = lazy(() => import('./pages/dashboard/student/StudentOverview'))
const StudentCourses = lazy(() => import('./pages/dashboard/student/StudentCourses'))
const StudentBrowse = lazy(() => import('./pages/dashboard/student/StudentBrowse'))
const StudentProfile = lazy(() => import('./pages/dashboard/student/StudentProfile'))
const FindTutor = lazy(() => import('./pages/dashboard/student/FindTutor'))
const StudentSessions = lazy(() => import('./pages/dashboard/student/StudentSessions'))
const CourseViewer = lazy(() => import('./pages/learn/CourseViewer'))
const LessonViewer = lazy(() => import('./pages/learn/LessonViewer'))
const CourseCheckout = lazy(() => import('./pages/payment/CourseCheckout'))
const TrialPaymentGate = lazy(() => import('./pages/payment/TrialPaymentGate'))
const MessagesPage = lazy(() => import('./pages/messaging/MessagesPage'))
const TeacherDashboard = lazy(() => import('./pages/dashboard/TeacherDashboard'))
const TeacherOverview = lazy(() => import('./pages/dashboard/teacher/TeacherOverview'))
const TeacherCourses = lazy(() => import('./pages/dashboard/teacher/TeacherCourses'))
const TeacherCreateCourse = lazy(() => import('./pages/dashboard/teacher/TeacherCreateCourse'))
const TeacherSessions = lazy(() => import('./pages/dashboard/teacher/TeacherSessions'))
const TeacherProfile = lazy(() => import('./pages/dashboard/teacher/TeacherProfile'))
const LiveTutorSchedule = lazy(() => import('./pages/dashboard/teacher/live/LiveTutorSchedule'))
const LiveTutorSessions = lazy(() => import('./pages/dashboard/teacher/live/LiveTutorSessions'))
const LiveTutorEarnings = lazy(() => import('./pages/dashboard/teacher/live/LiveTutorEarnings'))
const LiveTutorProfile = lazy(() => import('./pages/dashboard/teacher/live/LiveTutorProfile'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const LiveTutorApplication = lazy(() => import('./pages/live-tutor/LiveTutorApplication'))
const TutorProfilePage = lazy(() => import('./pages/tutors/TutorProfilePage'))
const BookingPage = lazy(() => import('./pages/tutors/BookingPage'))
const SessionRoom = lazy(() => import('./pages/session/SessionRoom'))
const SessionFeedback = lazy(() => import('./pages/session/SessionFeedback'))
const CoursesPage = lazy(() => import('./pages/public/CoursesPage'))
const TutorsPage = lazy(() => import('./pages/public/TutorsPage'))
const TeacherProfilePage = lazy(() => import('./pages/public/TeacherProfilePage'))
const CourseDetailPage = lazy(() => import('./pages/public/CourseDetailPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <div
        className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"
        role="status"
        aria-label="Loading page"
      />
      <p className="text-sm font-medium text-gray-500">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Landing page for visitors arriving at the application root. */}
          <Route path="/" element={<Landing />} />

          {/* These public catalogs let visitors explore learning options before
              registering; protected enrollment and booking happen afterward. */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/tutors" element={<TutorsPage />} />
          <Route path="/teachers/:teacherId" element={<TeacherProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Role selection for visitors choosing a student or teacher registration path. */}
          <Route path="/register" element={<RoleSelection />} />

          {/* Student registration page for users creating student accounts. */}
          <Route path="/welcome-student" element={<StudentWelcome />} />
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
          <Route path="/learn/:courseId" element={(
            <ProtectedRoute allowedRoles={['student']}>
              <CourseViewer />
            </ProtectedRoute>
          )} />
          <Route path="/learn/:courseId/:lessonId" element={(
            <ProtectedRoute allowedRoles={['student']}>
              <LessonViewer />
            </ProtectedRoute>
          )} />
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
            <ProtectedRoute allowedRoles={['student']}>
              <SessionFeedback />
            </ProtectedRoute>
          )} />

          {/* Student and teacher portals share a nested layout pattern, while each owns different dashboard content. */}
          <Route path="/dashboard/student" element={(
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          )}>
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
          <Route path="/dashboard/teacher" element={(
            <ProtectedRoute allowedRoles={['teacher', 'live_tutor']}>
              <TeacherDashboard />
            </ProtectedRoute>
          )}>
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
          {/* Keep the catch-all last so defined routes take precedence. */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
