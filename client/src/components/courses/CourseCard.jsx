import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Avatar from '../common/Avatar'
import { formatCurrency, getCoursePricing } from '../../utils/currencyUtils'
import { getCategoryEmoji, getCategoryGradient, getCategoryLabel } from '../../utils/courseUtils'

const CourseCard = ({ course }) => {
  const { t, i18n } = useTranslation()
  const pricing = getCoursePricing(course.price, course.discountPercentage)

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${getCategoryGradient(course.category)}`}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-5xl" aria-hidden="true">{getCategoryEmoji(course.category)}</span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-green-800">
          {getCategoryLabel(course.category, t)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold capitalize text-white">
          {course.level}
        </span>
      </div>
      <div className="p-5">
        <h2 className="line-clamp-2 text-lg font-extrabold tracking-tight">{course.title}</h2>
        <div className="mt-3 flex items-center gap-2">
          <Avatar name={course.teacher?.name || 'Teacher'} imageUrl={course.teacher?.profilePhoto} size="sm" />
          <span className="text-sm text-slate-600">{t('courses.by', { name: course.teacher?.name || 'Teacher' })}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold text-amber-500"><i className="fas fa-star" aria-hidden="true" /> {Number(course.rating || 0).toFixed(1)}</span>
          <span className="text-slate-500">
            <i className="fas fa-users mr-1" aria-hidden="true" />
            {t('courses.enrolled', { count: new Intl.NumberFormat(i18n.language).format(course.totalEnrollments || 0) })}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{course.language}</span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          <i className="fas fa-clock mr-1" aria-hidden="true" />
          {course.estimatedDuration ? t('courses.hours', { count: course.estimatedDuration }) : t('courses.flexible')}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          {course.isFree ? (
            <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-extrabold text-green-700">{t('courses.free')}</span>
          ) : (
            <div>
              <p className="font-extrabold text-slate-900">{formatCurrency(pricing.discountedPrice, course.currency)}</p>
              <p className="text-xs text-slate-500">{t('courses.trialOffer')}</p>
            </div>
          )}
          <Link to={`/courses/${course._id}`} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700">
            {t('courses.viewCourse')}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default CourseCard
