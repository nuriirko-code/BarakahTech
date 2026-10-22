// An accessible on/off control for settings that should not look like checkboxes.
const Toggle = ({ checked, onChange, label, hint, disabled = false }) => (
  <div className="flex items-start gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${checked ? 'bg-green-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {hint && <p className="mt-1 text-sm leading-5 text-slate-500">{hint}</p>}
    </div>
  </div>
)

export default Toggle
