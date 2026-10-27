import { Link } from 'react-router-dom'

const JourneyCTA = ({ to, label, tone = 'emerald' }) => {
  const toneClasses = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    blue: 'border-blue-200 bg-blue-50 text-blue-950',
    violet: 'border-violet-200 bg-violet-50 text-violet-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
  }
  const buttonClasses = {
    emerald: 'bg-emerald-700 hover:bg-emerald-800',
    blue: 'bg-blue-700 hover:bg-blue-800',
    violet: 'bg-violet-700 hover:bg-violet-800',
    amber: 'bg-amber-700 hover:bg-amber-800',
  }

  return (
    <div className={`mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:px-7 ${toneClasses[tone] || toneClasses.emerald}`}>
      <p className="text-center text-sm font-semibold sm:text-left">Ready to take the next step?</p>
      <Link
        to={to}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors ${buttonClasses[tone] || buttonClasses.emerald}`}
      >
        {label} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
      </Link>
    </div>
  )
}

export default JourneyCTA
