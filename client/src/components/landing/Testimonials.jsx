const FeedbackCard = ({ item }) => (
  <article className="mx-3 w-[320px] flex-shrink-0 rounded-2xl border border-white/10 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center gap-1" aria-label={`Rated ${item.rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fas fa-star text-xs ${star <= item.rating ? "text-amber-400" : "text-gray-200"}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-700">{item.rating}/5</span>
    </div>

    <p className="mb-5 text-sm leading-relaxed text-gray-700">&ldquo;{item.comment}&rdquo;</p>
    <div className="border-t border-gray-100 pt-4">
      <p className="font-semibold text-gray-900">Shared anonymously</p>
      {item.subject && <p className="mt-1 text-xs text-gray-500">{item.subject}</p>}
    </div>
  </article>
)

const Testimonials = ({ feedback = [], loading = false, error = "" }) => {
  const cards = feedback.length > 1 ? [...feedback, ...feedback] : feedback

  return (
    <section className="overflow-hidden py-20" style={{ backgroundColor: "#0a2416" }}>
      <div className="mx-auto mb-12 max-w-7xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Student Feedback</h2>
        <p className="mx-auto max-w-xl text-lg text-gray-300">
          Feedback appears here only after students choose to share it publicly.
        </p>
      </div>

      {feedback.length ? (
        <div className="relative">
          <div
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-20"
            style={{ background: "linear-gradient(to right, #0a2416, transparent)" }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-20"
            style={{ background: "linear-gradient(to left, #0a2416, transparent)" }}
          />
          <div
            className={feedback.length > 1 ? "animate-scroll-left flex w-max" : "animate-scroll-single flex w-max"}
            aria-live="polite"
          >
            {cards.map((item, index) => (
              <FeedbackCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <p role={error ? "alert" : "status"} className="mx-auto max-w-2xl px-6 text-center text-sm text-emerald-100">
          {loading
            ? "Loading student feedback..."
            : error
              ? "Student feedback is temporarily unavailable."
              : "No public student feedback yet. Comments will appear here when students choose to share them."}
        </p>
      )}
    </section>
  )
}

export default Testimonials
