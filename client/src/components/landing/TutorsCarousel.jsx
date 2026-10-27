import { Link } from "react-router-dom"
import Avatar from "../common/Avatar"
import { formatCurrency } from "../../utils/currencyUtils"
import { getCategoryGradient, getCategoryIcon } from "../../utils/courseUtils"

const TutorCard = ({ tutor, duplicate = false }) => (
  <Link
    to={`/tutors/${tutor.id}`}
    aria-hidden={duplicate || undefined}
    tabIndex={duplicate ? -1 : undefined}
    className="group mx-3 h-[460px] w-[min(88vw,380px)] flex-shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-600"
  >
    <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${getCategoryGradient(tutor.mainCategory)}`}>
      <i className={`${getCategoryIcon(tutor.mainCategory)} text-6xl text-white/30`} aria-hidden="true" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
        Accepting bookings
      </span>
      {tutor.isVerified && (
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-800 shadow-sm">
          <i className="fas fa-shield-halved mr-1" aria-hidden="true" />Verified
        </span>
      )}
      {tutor.introVideoUrl && (
        <span className="absolute bottom-3 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm" title="Introduction video available">
          <i className="fas fa-play ml-0.5 text-xs" aria-hidden="true" />
        </span>
      )}
      <div className="absolute -bottom-11 left-6 rounded-full border-4 border-white shadow-md">
        <Avatar name={tutor.name} imageUrl={tutor.profilePhoto} size="xl" />
      </div>
    </div>

    <div className="flex h-[316px] flex-col overflow-hidden px-6 pb-5 pt-14">
      <h3 className="text-xl font-extrabold text-slate-900">{tutor.name}</h3>
      {tutor.mainCategory && <p className="mt-1 text-sm font-semibold capitalize text-emerald-800">{tutor.mainCategory}</p>}
      {tutor.bio && <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{tutor.bio}</p>}
      {tutor.teachingApproach && (
        <p className="mt-2 line-clamp-2 border-l-2 border-amber-300 pl-3 text-sm leading-5 text-slate-600">
          {tutor.teachingApproach}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {(tutor.subjects || []).slice(0, 2).map((subject) => (
          <span key={subject} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">{subject}</span>
        ))}
        {tutor.subjects.length > 2 && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            +{tutor.subjects.length - 2} more
          </span>
        )}
      </div>
      {tutor.languages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tutor.languages.slice(0, 2).map((language) => (
            <span key={language} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">{language}</span>
          ))}
          {tutor.languages.length > 2 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              +{tutor.languages.length - 2} more
            </span>
          )}
        </div>
      )}
      {tutor.teachingLevel && (
        <p className="mt-2 text-xs font-semibold capitalize text-slate-500">
          Teaching level: {tutor.teachingLevel === "all" ? "All levels" : tutor.teachingLevel}
        </p>
      )}

      {tutor.totalRatings > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm" aria-label={`Rated ${tutor.rating} out of 5`}>
          <span className="font-bold text-amber-500"><i className="fas fa-star" aria-hidden="true" /></span>
          <span className="font-semibold text-slate-700">{Number(tutor.rating).toFixed(1)}</span>
          <span className="text-slate-500">({tutor.totalRatings} ratings)</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        {tutor.sessionPrice !== null && tutor.sessionDuration !== null ? (
          <span className="font-extrabold text-emerald-800">
            {formatCurrency(tutor.sessionPrice, tutor.currency)}
            <span className="ml-1 text-xs font-medium text-slate-500">/ {tutor.sessionDuration} min</span>
          </span>
        ) : <span className="text-sm font-medium text-slate-500">{tutor.teachingLevel || "Tutor profile"}</span>}
        <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
          View profile <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </div>
  </Link>
)

const TutorsCarousel = ({ tutors = [] }) => {
  if (!tutors.length) return null

  return (
    <section className="overflow-hidden bg-gradient-to-b from-white to-amber-50/70 py-20">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Learn one-on-one</p>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Available Live Tutors</h2>
        <p className="mt-3 max-w-xl text-slate-600">Explore tutor profiles that are currently accepting bookings.</p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-amber-50/70 to-transparent" />
        <div className={tutors.length > 1 ? "animate-scroll-right flex w-max" : "animate-scroll-single flex w-max"}>
          {tutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)}
          {tutors.length > 1 && tutors.map((tutor) => <TutorCard key={`${tutor.id}-duplicate`} tutor={tutor} duplicate />)}
        </div>
      </div>
    </section>
  )
}

export default TutorsCarousel
