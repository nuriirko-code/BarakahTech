import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import API_BASE_URL from '../../config/api.js'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const initialForm = { name: '', email: '', subject: '', message: '', website: '' }

const ContactPage = () => {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
    setSubmitted(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitted(false)
    setSending(true)

    try {
      await axios.post(`${API_BASE_URL}/contact`, form)
      setForm(initialForm)
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || t('contactPage.sendError'))
    } finally {
      setSending(false)
    }
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-14 text-slate-900 sm:py-20">
        <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">{t('contactPage.title')}</h1>
            <p className="mt-4 text-lg text-gray-600">{t('contactPage.description')}</p>
          </div>

          {submitted && (
            <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              {t('contactPage.sent')}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold text-slate-800">
              {t('contactPage.name')}
              <input className={inputClass} name="name" value={form.name} onChange={handleChange} autoComplete="name" maxLength={100} required />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              {t('contactPage.email')}
              <input className={inputClass} name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" maxLength={254} required />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              {t('contactPage.subject')}
              <input className={inputClass} name="subject" value={form.subject} onChange={handleChange} maxLength={150} required />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              {t('contactPage.message')}
              <textarea className={`${inputClass} min-h-36 resize-y`} name="message" value={form.message} onChange={handleChange} maxLength={5000} required />
            </label>

            <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
              <label>
                {t('contactPage.honeypot')}
                <input name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button type="submit" disabled={sending} className="w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
              {sending ? t('contactPage.sending') : t('contactPage.send')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {t('contactPage.alsoEmail')}{' '}
            <a className="font-semibold text-green-700 underline hover:text-green-900" href="mailto:nuriirko@gmail.com">nuriirko@gmail.com</a>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default ContactPage
