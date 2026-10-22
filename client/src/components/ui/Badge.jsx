// A compact status pill for highlighting a short, meaningful state.
const toneClasses = {
  success: 'bg-green-50 text-green-700 ring-green-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
}

const Badge = ({ tone = 'neutral', children }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone] || toneClasses.neutral}`}>
    {children}
  </span>
)

export default Badge
