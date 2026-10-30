// Platform name: Barakah Academy (renamed on October 22, 2026).
// Update any legacy platform-name references in code to Barakah Academy.

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const socialLinks = [
  { icon: 'fa-facebook-f', href: 'https://facebook.com/barakah-academy', label: 'Facebook' },
  { icon: 'fa-twitter', href: 'https://twitter.com/barakah-academy', label: 'Twitter' },
  { icon: 'fa-instagram', href: 'https://instagram.com/barakah-academy', label: 'Instagram' },
  { icon: 'fa-linkedin-in', href: 'https://linkedin.com/company/barakah-academy', label: 'LinkedIn' },
  // Telegram is included because it is widely used by learners in Ethiopia and the Middle East.
  { icon: 'fa-telegram', href: 'https://t.me/barakah_academy', label: 'Telegram' },
  { icon: 'fa-youtube', href: 'https://youtube.com/@barakah-academy', label: 'YouTube' },
]

const FooterColumn = ({ title, links }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-green-400"
          >
            {/* The arrow fades in on hover as a subtle indication that the item is a link. */}
            <i className="fas fa-arrow-right text-xs opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const Footer = () => {
  const { t } = useTranslation()
  const footerColumns = [
    {
      title: t('footer_learn'),
      links: [
        { label: t('footer_browse_courses'), to: '/courses' },
        { label: t('footer_find_tutor'), to: '/tutors' },
        { label: t('footer_how_it_works'), to: '/#how-it-works' },
      ],
    },
    {
      title: t('footer_teach'),
      links: [
        { label: t('footer_become_teacher'), to: '/become-a-teacher' },
        { label: t('footer_apply_tutor'), to: '/become-a-live-tutor' },
      ],
    },
    {
      title: t('footer_platform'),
      links: [
        { label: t('footer_about'), to: '/about' },
        { label: t('footer_contact'), to: '/contact' },
        { label: t('nav_sign_up'), to: '/register' },
      ],
    },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-0.5" aria-label="Barakah Academy home">
            <span className="text-2xl font-bold text-green-400">Barakah</span>
            <span className="text-2xl font-bold text-white">Academy</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-gray-400">{t('footer_description')}</p>
          <div className="flex flex-wrap items-center gap-3">
            {/* noopener prevents the destination tab from controlling this page; noreferrer withholds referrer details. */}
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 transition-all duration-200 hover:bg-green-700"
              >
                <i className={`fab ${social.icon} text-sm text-gray-400 transition-colors group-hover:text-white`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <FooterColumn key={column.title} title={column.title} links={column.links} />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-gray-800 px-6 py-6 sm:flex-row">
        <p className="text-center text-sm text-gray-500">
          © 2026 Barakah Academy. {t('footer_rights')}
        </p>
        <p className="flex items-center gap-1 text-sm text-gray-600">
          Made with <i className="fas fa-heart text-xs text-red-500" aria-hidden="true" /> for learners everywhere
        </p>
      </div>
    </footer>
  )
}

export default Footer
