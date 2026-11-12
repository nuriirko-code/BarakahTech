import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { POLICY_VERSIONS } from '../../config/policyVersions'

const policyVersions = {
  terms: POLICY_VERSIONS.terms,
  privacy: POLICY_VERSIONS.privacy,
  'community-code': POLICY_VERSIONS.community,
  'student-guidelines': POLICY_VERSIONS.student,
  'teacher-guidelines': POLICY_VERSIONS.teacher,
}

const PolicyPage = () => {
  const { slug } = useParams()
  const { t } = useTranslation()

  if (!Object.hasOwn(policyVersions, slug)) return <Navigate to="/not-found" replace />

  const policy = t(`policies.pages.${slug}`, { returnObjects: true })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6">
        <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{policy.title}</h1>
          <p className="mt-3 text-sm text-slate-500">
            {t('policies.meta.version', { version: policyVersions[slug] })} · {t('policies.meta.updated')}
          </p>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <p>{policy.intro}</p>
          </div>
          <div className="mt-8 space-y-8">
            {policy.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-extrabold">{section.title}</h2>
                <ul className="mt-3 list-disc space-y-3 pl-6 leading-7 text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <li key={paragraph}>{paragraph}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <nav aria-label={t('policies.meta.related')} className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6 text-sm font-bold text-green-800">
            <Link to="/policies/terms" className="hover:underline">{t('footer.terms')}</Link>
            <Link to="/policies/privacy" className="hover:underline">{t('footer.privacy')}</Link>
            <Link to="/policies/community-code" className="hover:underline">{t('footer.communityCode')}</Link>
            <Link to="/policies/student-guidelines" className="hover:underline">{t('footer.studentGuidelines')}</Link>
            <Link to="/policies/teacher-guidelines" className="hover:underline">{t('footer.teacherGuidelines')}</Link>
          </nav>
          <p className="mt-6 text-sm text-slate-700">
            {t('policies.meta.support')}{' '}
            <Link className="font-semibold text-green-700 underline decoration-green-300 underline-offset-2 hover:text-green-900" to="/contact">
              {t('footer.contact')}
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </>
  )
}

export default PolicyPage
