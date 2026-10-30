import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const AboutPage = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0fdf4,_#f8fafc_40%,_#eef2ff_100%)] text-slate-800">
    <Navbar />
    <main className="mx-auto max-w-6xl px-6 py-20">
      <section className="mb-16 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-emerald-700">About Barakah Academy</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Inclusive learning built for real life.</h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Barakah Academy exists to help students and families learn with confidence, in the language they understand best,
          with teachers and tutors who are genuinely invested in their progress.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {[
          {
            title: 'Our mission',
            text: 'To make high-quality education accessible, affordable, and practical for learners across different backgrounds and locations.',
            accent: 'bg-emerald-50 text-emerald-800',
          },
          {
            title: 'How we teach',
            text: 'We combine expert teachers, live tutors, subject-based courses, and supportive mentorship to keep learning engaging and results-focused.',
            accent: 'bg-amber-50 text-amber-800',
          },
          {
            title: 'Why it matters',
            text: 'Learning should move people forward — in school, in work, in language confidence, and in the ability to create a better future.',
            accent: 'bg-violet-50 text-violet-800',
          },
        ].map((item) => (
          <article key={item.title} className={`${item.accent} rounded-3xl border border-slate-200 p-7 shadow-sm`}>
            <h2 className="text-xl font-extrabold">{item.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-[32px] bg-slate-900 p-8 text-white shadow-xl sm:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">What students get</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Structured learning, human support, and clear progress.</h2>
          </div>
          <ul className="space-y-4 text-base leading-7 text-slate-200">
            {[
              'Course study paths for different subjects and levels.',
              'Live tutor support for one-to-one guidance and revision.',
              'Teacher-led instruction in learners’ preferred languages.',
              'A learning experience that feels consistent, practical, and motivating.',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <i className="fas fa-check text-xs" aria-hidden="true" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default AboutPage
