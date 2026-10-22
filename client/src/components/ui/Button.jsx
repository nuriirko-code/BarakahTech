// A shared button with clear visual priority, loading feedback, and focus states.
const variantClasses = {
  primary: 'bg-green-600 text-white shadow-sm hover:bg-green-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
}

const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant] || variantClasses.primary} ${className}`}
    {...rest}
  >
    {loading && <i className="fas fa-spinner animate-spin" aria-hidden="true" />}
    {children}
  </button>
)

export default Button
