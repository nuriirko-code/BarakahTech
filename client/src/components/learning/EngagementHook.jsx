const EngagementHook = ({ engagementMessage, completedCount, totalLessons, trialLimit, isFullyEnrolled, onContinue, onPaymentGate, trialJustCompleted }) => {
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="relative w-full max-w-xl animate-[fadeIn_0.25s_ease-out] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="confetti"
              style={{
                left: `${(index * 11) % 100}%`,
                animationDelay: `${(index % 6) * 0.12}s`,
                animationDuration: `${1.8 + (index % 5) * 0.35}s`,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700 animate-pulse">
              <i className="fas fa-circle-check" aria-hidden="true" />
            </span>
          </div>

          <h3 className="mt-4 text-center text-2xl font-extrabold text-slate-900">Lesson Complete!</h3>
          <p className="mt-2 text-center text-sm text-slate-600">
            Lesson {completedCount} of {totalLessons} completed
          </p>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-green-600 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>

          {engagementMessage && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800">
                <i className="fas fa-star" aria-hidden="true" />
                <p className="text-sm font-bold">{engagementMessage.title}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{engagementMessage.message}</p>
            </div>
          )}

          {trialJustCompleted && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <i className="fas fa-lock-open" aria-hidden="true" />
                <p className="text-sm font-bold">You have completed your free preview!</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                You have experienced {trialLimit} lessons. To continue learning and connect with your teacher, complete your enrollment.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onPaymentGate} className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800">
                  Unlock Full Course
                </button>
                <button type="button" onClick={onContinue} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Continue Later
                </button>
              </div>
            </div>
          )}

          {!trialJustCompleted && (
            <div className="mt-5 flex justify-center">
              <button type="button" onClick={onContinue} className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800">
                {completedCount >= totalLessons ? 'Course Complete' : 'Continue to Next Lesson'}
              </button>
            </div>
          )}

          {isFullyEnrolled && completedCount >= 5 && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <i className="fas fa-video mt-1 text-blue-700" aria-hidden="true" />
              <p>
                Your teacher will schedule a live mentorship session with you soon to guide you through the course.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .confetti {
          position: absolute;
          top: -24px;
          width: 8px;
          height: 18px;
          border-radius: 9999px;
          background: linear-gradient(180deg, rgba(34,197,94,1), rgba(16,185,129,0.5));
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
          opacity: 0.8;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translateY(360px) rotate(200deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default EngagementHook
