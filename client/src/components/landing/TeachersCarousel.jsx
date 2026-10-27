import { Link } from "react-router-dom"
import Avatar from "../common/Avatar"
import { getCategoryGradient, getCategoryIcon } from "../../utils/courseUtils"

const TeacherCard = ({ teacher, duplicate = false }) => (
  <Link
    to={`/teachers/${teacher.id}`}
    aria-hidden={duplicate || undefined}
    tabIndex={duplicate ? -1 : undefined}
    className="group mx-3 h-[460px] w-[min(88vw,380px)] flex-shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-600"
  >
    <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${getCategoryGradient(teacher.category)}`}>
      <i className={`${getCategoryIcon(teacher.category)} text-6xl text-white/30`} aria-hidden="true" />
      {teacher.category && (
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold capitalize text-slate-800 shadow-sm">
          {teacher.category}
        </span>
      )}
      <div className="absolute -bottom-11 left-6 rounded-full border-4 border-white shadow-md">
        <Avatar name={teacher.name} imageUrl={teacher.profilePhoto} size="xl" />
      </div>
    </div>

    <div className="flex h-[316px] flex-col overflow-hidden px-6 pb-5 pt-14">
      <h3 className="text-xl font-extrabold text-slate-900">{teacher.name}</h3>
      {(teacher.subject || teacher.language) && (
        <p className="mt-1 text-sm font-semibold text-emerald-800">
          {[teacher.subject, teacher.language].filter(Boolean).join(" · ")}
        </p>
      )}
      {teacher.bio && <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{teacher.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {(teacher.courseSubjects || []).slice(0, 3).map((subject) => (
          <span key={subject} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {subject}
          </span>
        ))}
        {teacher.courseSubjects?.length > 3 && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            +{teacher.courseSubjects.length - 3} more
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-medium text-slate-600">
          {teacher.courseCount} published {teacher.courseCount === 1 ? "course" : "courses"}
          {teacher.yearsOfExperience > 0 && ` · ${teacher.yearsOfExperience} years teaching`}
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
          Profile <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </div>
  </Link>
)

const TeachersCarousel = ({ teachers = [] }) => {
  if (!teachers.length) return null

  return (
    <section className="overflow-hidden bg-gradient-to-b from-slate-50 to-emerald-50/70 py-20">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Meet the teachers</p>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Approved Course Teachers</h2>
        <p className="mt-3 max-w-xl text-slate-600">Browse approved teachers and the subjects they offer.</p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-emerald-50/70 to-transparent" />
        <div className={teachers.length > 1 ? "animate-scroll-left flex w-max" : "animate-scroll-single flex w-max"}>
          {teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
          {teachers.length > 1 && teachers.map((teacher) => <TeacherCard key={`${teacher.id}-duplicate`} teacher={teacher} duplicate />)}
        </div>
      </div>
    </section>
  )
}

export default TeachersCarousel
