import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// This page separates two teaching capabilities without creating two accounts.
// An account can apply for the other capability later from its dashboard.
const TeachingPathSelection = () => {
  const { t } = useTranslation()
  const copy = t('welcomePages.teachingPaths', { returnObjects: true })

  return (
    <main className="min-h-screen bg-green-50 px-5 py-12 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-5xl">
        <Link to="/register" className="inline-flex items-center gap-2 text-base font-semibold text-[#15803D] hover:underline">
          <i className="fas fa-arrow-left text-sm" aria-hidden="true" /> {copy.back}
        </Link>
        <header className="mt-8 max-w-3xl">
          <p className="text-base font-bold text-[#15803D]">{copy.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.heading}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{copy.description}</p>
        </header>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600"><i className="fas fa-book-open" aria-hidden="true" /></span>
            <h2 className="mt-6 text-2xl font-extrabold">{copy.courseHeading}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{copy.courseDescription}</p>
            <Link to="/become-a-teacher" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-base font-bold text-white transition hover:bg-[#16A34A]">{copy.courseAction} <i className="fas fa-arrow-right text-sm" aria-hidden="true" /></Link>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-white p-7 shadow-sm sm:p-8">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]"><i className="fas fa-video" aria-hidden="true" /></span>
            <h2 className="mt-6 text-2xl font-extrabold">{copy.liveHeading}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{copy.liveDescription}</p>
            <Link to="/become-a-live-tutor" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-base font-bold text-white transition hover:bg-[#16A34A]">{copy.liveAction} <i className="fas fa-arrow-right text-sm" aria-hidden="true" /></Link>
          </article>
        </div>
      </section>
    </main>
  )
}

export default TeachingPathSelection
