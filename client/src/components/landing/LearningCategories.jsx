import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Avatar from "../common/Avatar"
import { getCategoryGradient, getCategoryIcon, getCategoryLabel } from "../../utils/courseUtils"
import { formatCurrency, getCoursePricing } from "../../utils/currencyUtils"

const CourseCard = ({ course, t }) => {
  const pricing = getCoursePricing(course.price, course.discountPercentage)

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-600"
    >
      <div className={`relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br ${getCategoryGradient(course.category)}`}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <i className={`${getCategoryIcon(course.category)} text-6xl text-white/90`} aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold capitalize text-emerald-800 shadow-sm">
          {getCategoryLabel(course.category, t)}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold capitalize text-white">
          {course.level}
        </span>
        <span className="absolute bottom-4 left-4 text-sm font-semibold text-white drop-shadow">
          {course.subject}
        </span>
      </div>

      <div className="flex min-h-[330px] flex-col p-6">
        <div>
          <h3 className="line-clamp-2 text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-800">
            {course.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>
          {course.teacher?.name && (
            <div className="mt-4 flex items-center gap-2">
              <Avatar name={course.teacher.name} imageUrl={course.teacher.profilePhoto} size="sm" />
              <span className="text-sm text-slate-500">{t('courses.by', { name: course.teacher.name })}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
            <i className="fas fa-language mr-1" aria-hidden="true" />{course.language}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
            <i className="fas fa-star" aria-hidden="true" />{Number(course.rating || 0).toFixed(1)}
            <span className="font-medium text-slate-400">({course.totalRatings || 0})</span>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
          {course.estimatedDuration !== undefined && (
            <span><i className="fas fa-clock mr-1" aria-hidden="true" />{t('courses.hours', { count: course.estimatedDuration })}</span>
          )}
          <span><i className="fas fa-users mr-1" aria-hidden="true" />{t('courses.enrolled', { count: course.totalEnrollments || 0 })}</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-5">
          {course.isFree ? (
            <span className="text-lg font-extrabold text-emerald-700">{t('courses.free')}</span>
          ) : (
            <div>
              <span className="text-lg font-extrabold text-slate-900">
                {formatCurrency(pricing.discountedPrice, course.currency || "USD")}
              </span>
              {pricing.discountPercentage > 0 && (
                <span className="ml-2 text-sm text-slate-500 line-through">
                  {formatCurrency(pricing.originalPrice, course.currency || "USD")}
                </span>
              )}
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition-colors group-hover:bg-emerald-800">
            {t('courses.viewCourse')} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}

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
            {courses.map((course) => <div key={course._id} className="mx-3 w-[min(88vw,380px)] flex-shrink-0"><CourseCard course={course} t={t} /></div>)}
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
