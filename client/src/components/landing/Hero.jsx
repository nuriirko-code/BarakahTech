import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1738566495427-bb6427cfbab3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    category: "general",
    heading: "Welcome to Barakah Academy",
    subLines: [
      "Begin your learning journey.",
      "Explore courses and connect with available tutors.",
    ],
  },
  {
    id: 2,
    image: "https://plus.unsplash.com/premium_photo-1683121879092-d26591501d9b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    category: "technology",
    heading: "Build Your Tech Foundation",
    subLines: [
      "Build skills that support your goals.",
      "Browse the current catalog to find available learning options.",
    ],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1603714228681-b399854b8f80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
    category: "languages",
    heading: "Speak With Confidence",
    subLines: [
      "Explore language learning opportunities.",
      "Check course and tutor profiles for currently offered languages.",
    ],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=1920&q=80",
    category: "sciences",
    heading: "Welcome, Future Scientists",
    subLines: [
      "Explore academic subjects and learning resources.",
      "Browse current offerings to find a topic that fits your goals.",
    ],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80",
    category: "business",
    heading: "Build Your Business Mindset",
    subLines: [
      "Keep developing skills for your next step.",
      "Review available courses and tutor profiles.",
    ],
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1920&q=80",
    category: "leadership",
    heading: "Lead With Purpose",
    subLines: [
      "Keep learning with purpose.",
      "Explore current offerings from Barakah Academy.",
    ],
  },
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [nextSlide, setNextSlide] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedHeading, setDisplayedHeading] = useState("")
  const [displayedSub, setDisplayedSub] = useState("")
  const [currentSubIndex, setCurrentSubIndex] = useState(0)
  const [phase, setPhase] = useState("typing-heading")
  // Effects rerun only when a dependency changes. Setting an already-empty heading to "" is a no-op,
  // so this incrementing reset key guarantees a real change and reliably restarts the typewriter.
  // This is a common reset-key pattern for forcing dependent effects to run again.
  const [slideKey, setSlideKey] = useState(0)

  const navigate = useNavigate()
  const typewriterRef = useRef(null)
  const slideTimerRef = useRef(null)

  // CSS keyframes are injected once so the component can animate without a library like Framer Motion.
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes pulse-join {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
        50% { transform: scale(1.06); box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
      }

      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slide-dot-active {
        from { width: 8px; }
        to { width: 32px; }
      }

      .hero-join-btn {
        animation: pulse-join 1.8s ease-in-out infinite;
      }

      .hero-text-appear {
        animation: fade-in-up 0.5s ease forwards;
      }

      .typewriter-cursor {
        display: inline-block;
        width: 3px;
        height: 1em;
        background-color: #f59e0b;
        margin-left: 2px;
        vertical-align: middle;
        animation: blink-cursor 0.7s step-end infinite;
      }

      @keyframes blink-cursor {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `
    document.head.appendChild(style)

    return () => document.head.removeChild(style)
  }, [])

  // The typewriter is phase-based rather than a single timer because each state needs precise control over
  // when the heading types, pauses, deletes, or advances to the next slide.
  useEffect(() => {
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current)
    }

    const slide = slides[currentSlide]

    if (phase === "typing-heading") {
      if (displayedHeading.length < slide.heading.length) {
        typewriterRef.current = setTimeout(() => {
          setDisplayedHeading(slide.heading.substring(0, displayedHeading.length + 1))
        }, 60)
      } else {
        typewriterRef.current = setTimeout(() => {
          setPhase("typing-sub")
          setCurrentSubIndex(0)
          setDisplayedSub("")
        }, 300)
      }
    }

    if (phase === "typing-sub") {
      const subText = slide.subLines[currentSubIndex]

      if (displayedSub.length < subText.length) {
        typewriterRef.current = setTimeout(() => {
          setDisplayedSub(subText.substring(0, displayedSub.length + 1))
        }, 40)
      } else if (currentSubIndex < slide.subLines.length - 1) {
        typewriterRef.current = setTimeout(() => {
          setCurrentSubIndex((prev) => prev + 1)
          setDisplayedSub("")
        }, 800)
      } else {
        typewriterRef.current = setTimeout(() => {
          setPhase("deleting-sub")
        }, 2500)
      }
    }

    if (phase === "deleting-sub") {
      if (displayedSub.length > 0) {
        typewriterRef.current = setTimeout(() => {
          setDisplayedSub((prev) => prev.substring(0, prev.length - 1))
        }, 25)
      } else {
        setPhase("deleting-heading")
      }
    }

    if (phase === "deleting-heading") {
      if (displayedHeading.length > 0) {
        typewriterRef.current = setTimeout(() => {
          setDisplayedHeading((prev) => prev.substring(0, prev.length - 1))
        }, 35)
      } else {
        const next = (currentSlide + 1) % slides.length
        setPhase("transitioning")
        setNextSlide(next)
        setIsTransitioning(true)
      }
    }

    if (phase === "transitioning") {
      const next = nextSlide
      slideTimerRef.current = setTimeout(() => {
        setCurrentSlide(next)
        setIsTransitioning(false)
        setCurrentSubIndex(0)
        setDisplayedSub("")
        setDisplayedHeading("")
        setSlideKey((prev) => prev + 1)
        setPhase("typing-heading")
      }, 1500)
    }

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current)
      }
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current)
      }
    }
  }, [phase, displayedHeading, displayedSub, currentSlide, currentSubIndex, nextSlide, slideKey])

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>
      {/* Each image is placed in the same absolute position and controlled with opacity so the slides crossfade.
          This keeps the background cinematic without adding a separate animation library. */}
      {slides.map((slide, index) => {
        const isVisible = index === currentSlide || (isTransitioning && index === nextSlide)

        return (
          <div
            key={slide.id}
            className="absolute inset-0 h-full w-full"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
              zIndex: index === currentSlide ? 1 : isTransitioning && index === nextSlide ? 2 : 0,
            }}
          >
            {/* The first slide loads eagerly to avoid the flash of a blank hero background on first render. */}
            <img
              src={slide.image}
              alt={slide.heading}
              className="h-full w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.60) 100%)",
              }}
            />
          </div>
        )
      })}

      <div
        className="relative flex h-full flex-col items-center justify-center px-4 text-center sm:px-6"
        style={{ zIndex: 10 }}
      >
        <div
          className="mb-6 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
          style={{
            color: "#f59e0b",
            borderColor: "rgba(245,158,11,0.5)",
            backgroundColor: "rgba(245,158,11,0.1)",
            backdropFilter: "blur(4px)",
          }}
        >
          <i className="fas fa-graduation-cap mr-2" />
          Online Learning Platform
        </div>

        <h1
          className="mb-4 font-bold leading-tight text-white"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            minHeight: "1.2em",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* clamp() keeps the headline fluid across mobile and desktop while minHeight prevents layout jitter as text appears/disappears. */}
          <span style={{ color: "#f59e0b" }}>{displayedHeading}</span>
          {(phase === "typing-heading" || phase === "deleting-heading") && <span className="typewriter-cursor" />}
          {/* A blinking cursor is a familiar typewriter convention that helps users recognize the text is still animating. */}
        </h1>

        <div
          className="mb-8"
          style={{
            minHeight: "3em",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          }}
        >
          {/* minHeight keeps the subtitle block stable while the typewriter reveals each sentence. */}
          <p className="font-medium text-white" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            {displayedSub}
            {(phase === "typing-sub" || phase === "deleting-sub") && <span className="typewriter-cursor" />}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* The pulse effect draws attention without becoming distracting; it acts like a subtle CTA beacon. */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="hero-join-btn rounded-xl px-8 py-4 text-lg font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              border: "2px solid rgba(255,255,255,0.2)",
              minWidth: "200px",
            }}
          >
            <i className="fas fa-rocket mr-2" />
            Join Now
          </button>

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white hover:text-gray-900"
            style={{
              border: "2px solid rgba(255,255,255,0.6)",
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(255,255,255,0.1)",
              minWidth: "200px",
            }}
          >
            <i className="fas fa-compass mr-2" />
            Explore Courses
          </button>
        </div>

      </div>

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2" style={{ zIndex: 10 }}>
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (typewriterRef.current) clearTimeout(typewriterRef.current)
              if (slideTimerRef.current) clearTimeout(slideTimerRef.current)

              setCurrentSlide(index)
              setNextSlide((index + 1) % slides.length)
              setIsTransitioning(false)
              setDisplayedHeading("")
              setDisplayedSub("")
              setCurrentSubIndex(0)
              setSlideKey((prev) => prev + 1)
              setPhase("typing-heading")
            }}
            className="rounded-full transition-all duration-300"
            style={{
              height: "8px",
              width: index === currentSlide ? "32px" : "8px",
              backgroundColor: index === currentSlide ? "#f59e0b" : "rgba(255,255,255,0.4)",
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col items-center gap-1" style={{ zIndex: 10, opacity: 0.7 }}>
        <span className="text-xs uppercase tracking-widest text-white">Scroll</span>
        <i
          className="fas fa-chevron-down text-sm text-white"
          style={{ animation: "fade-in-up 1s ease infinite alternate" }}
        />
      </div>
    </section>
  )
}

export default Hero
