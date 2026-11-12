import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { useTranslation } from 'react-i18next'

const AboutPage = () => {
  const { t } = useTranslation()
  const copy = t('aboutPage', { returnObjects: true })
  const values = [
    { key: 'mission', accent: 'bg-emerald-50 text-emerald-800' },
    { key: 'teaching', accent: 'bg-amber-50 text-amber-800' },
    { key: 'impact', accent: 'bg-violet-50 text-violet-800' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0fdf4,_#f8fafc_40%,_#eef2ff_100%)] text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="mb-16 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-emerald-700">{copy.eyebrow}</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{copy.heading}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">{copy.description}</p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          {values.map(({ key, accent }) => (
            <article key={key} className={`${accent} rounded-3xl border border-slate-200 p-7 shadow-sm`}>
              <h2 className="text-xl font-extrabold">{copy.values[key].title}</h2>
              <p className="mt-4 text-base leading-7 text-slate-700">{copy.values[key].text}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[32px] bg-slate-900 p-8 text-white shadow-xl sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">{copy.benefitsEyebrow}</p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">{copy.benefitsHeading}</h2>
            </div>
            <ul className="space-y-4 text-base leading-7 text-slate-200">
              {copy.benefits.map((point) => (
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
}

export default AboutPage
