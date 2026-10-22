// A reusable panel that gives dashboard content a consistent, accessible frame.
const Card = ({ title, description, action, children, className = '' }) => {
  const hasHeader = title || action

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

export default Card
