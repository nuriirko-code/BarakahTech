// A field wrapper that keeps labels, help text, and validation messages consistent.
export const controlClass = (hasError = false) => (
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${hasError
    ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
    : 'border-slate-300 focus:border-green-600 focus:ring-green-100'}`
)

const Field = ({ label, htmlFor, hint, error, children }) => (
  <div>
    {label && (
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
    )}
    <div className={label ? 'mt-2' : ''}>{children}</div>
    {error ? (
      <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>
    ) : hint ? (
      <p className="mt-2 text-sm leading-5 text-slate-500">{hint}</p>
    ) : null}
  </div>
)

export default Field
