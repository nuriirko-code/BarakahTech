import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import CourseCard from "../courses/CourseCard"

const LearningCategories = ({ courses = [] }) => {
  const { t } = useTranslation()
  if (!courses.length) return null

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-6 py-20 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold uppercase tracking-widest text-emerald-800">
            {t('landing.publishedCourses')}
          </p>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t('landing.allPublishedCourses')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            {t('landing.allCoursesDescription')}
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-gradient-to-r from-slate-50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />
          <div
            className="animate-scroll-once-left-to-right flex w-max"
            style={{ animationDuration: `${Math.max(35, courses.length * 7)}s` }}
          >
            {courses.map((course) => <div key={course._id} className="mx-3 w-[min(88vw,380px)] flex-shrink-0"><CourseCard course={course} /></div>)}
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-900">
            {t('landing.showAllCourses')} <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LearningCategories
