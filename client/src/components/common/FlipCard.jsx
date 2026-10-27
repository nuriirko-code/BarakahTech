import { useState } from 'react'

const colorClasses = {
  emerald: {
    border: 'border-emerald-200',
    front: 'from-white to-emerald-50',
    icon: 'bg-emerald-100 text-emerald-700',
    action: 'text-emerald-700',
    back: 'from-emerald-800 to-emerald-950',
  },
  blue: {
    border: 'border-blue-200',
    front: 'from-white to-blue-50',
    icon: 'bg-blue-100 text-blue-700',
    action: 'text-blue-700',
    back: 'from-blue-800 to-blue-950',
  },
  amber: {
    border: 'border-amber-200',
    front: 'from-white to-amber-50',
    icon: 'bg-amber-100 text-amber-700',
    action: 'text-amber-700',
    back: 'from-amber-800 to-amber-950',
  },
  violet: {
    border: 'border-violet-200',
    front: 'from-white to-violet-50',
    icon: 'bg-violet-100 text-violet-700',
    action: 'text-violet-700',
    back: 'from-violet-800 to-violet-950',
  },
}

const FlipCard = ({ icon, title, summary, details, color = 'emerald', axis = 'y' }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const rotation = axis === 'x' ? 'rotateX(180deg)' : 'rotateY(180deg)'
  const theme = colorClasses[color] || colorClasses.emerald

  return (
    <button
      type="button"
      aria-pressed={isFlipped}
      onClick={() => setIsFlipped((flipped) => !flipped)}
      className="group h-[300px] w-full rounded-3xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
      style={{ perspective: '1200px' }}
    >
      <span
        className="relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: isFlipped ? rotation : 'none' }}
      >
        <span
          aria-hidden={isFlipped}
          className={`absolute inset-0 flex flex-col rounded-3xl border bg-gradient-to-br p-7 shadow-lg transition-shadow group-hover:shadow-xl [backface-visibility:hidden] ${theme.border} ${theme.front}`}
        >
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${theme.icon}`}>
            <i className={`fas ${icon}`} aria-hidden="true" />
          </span>
          <span className="mt-6 text-xl font-extrabold text-slate-900">{title}</span>
          <span className="mt-3 flex-1 text-sm leading-6 text-slate-600">{summary}</span>
          <span className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${theme.action}`}>
            Tap to explore <i className="fas fa-rotate text-xs" aria-hidden="true" />
          </span>
        </span>
        <span
          aria-hidden={!isFlipped}
          className={`absolute inset-0 flex flex-col justify-center rounded-3xl bg-gradient-to-br p-7 text-white shadow-xl [backface-visibility:hidden] ${theme.back}`}
          style={{ transform: rotation }}
        >
          <span className="text-sm font-bold uppercase tracking-widest text-white/70">{title}</span>
          <span className="mt-4 text-base leading-7">{details}</span>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/80">
            <i className="fas fa-rotate-left text-xs" aria-hidden="true" /> Back
          </span>
        </span>
      </span>
    </button>
  )
}

export default FlipCard
