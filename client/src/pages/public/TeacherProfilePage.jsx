import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"
import Avatar from "../../components/common/Avatar"
import Footer from "../../components/common/Footer"
import Navbar from "../../components/common/Navbar"

const TeacherProfilePage = () => {
  const { teacherId } = useParams()
  const [teacher, setTeacher] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isCurrent = true

    const loadProfile = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await axios.get(`${API_BASE_URL}/landing/teachers/${teacherId}`)
        if (isCurrent) {
          setTeacher(response.data.teacher)
          setCourses(response.data.courses || [])
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || "Could not load this teacher profile.")
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadProfile()
    return () => { isCurrent = false }
  }, [teacherId])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        {loading ? (
          <div className="space-y-5" aria-label="Loading teacher profile">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        ) : error ? (
          <section role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold">Teacher profile unavailable</h1>
            <p className="mt-3 text-slate-600">{error}</p>
            <Link to="/courses" className="mt-6 inline-flex font-semibold text-green-700 hover:underline">
              Browse published courses
            </Link>
          </section>
        ) : teacher ? (
          <>
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline">
              <i className="fas fa-arrow-left" aria-hidden="true" />
              Back to homepage
            </Link>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <Avatar name={teacher.name} imageUrl={teacher.profilePhoto} size="xl" />
                <div>
                  <h1 className="text-3xl font-extrabold">{teacher.name}</h1>
                  {(teacher.subject || teacher.category) && (
                    <p className="mt-2 capitalize text-slate-600">
                      {[teacher.subject, teacher.category].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {teacher.yearsOfExperience !== null && (
                    <p className="mt-2 text-sm text-slate-600">
                      {teacher.yearsOfExperience} {teacher.yearsOfExperience === 1 ? "year" : "years"} of experience
                    </p>
                  )}
                </div>
              </div>
              {teacher.bio && <p className="mt-7 whitespace-pre-line leading-7 text-slate-700">{teacher.bio}</p>}
            </section>

            {courses.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-bold">Published courses</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <Link
                      key={course._id}
                      to={`/courses/${course._id}`}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt="" className="h-40 w-full object-cover" loading="lazy" />
                      )}
                      <div className="p-5">
                        <h3 className="font-bold">{course.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>
                        <p className="mt-4 text-sm capitalize text-slate-500">
                          {[course.subject, course.level].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

export default TeacherProfilePage
