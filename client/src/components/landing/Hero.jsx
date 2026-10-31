import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Hero = () => {
  const { t, i18n } = useTranslation()
  const slides = useMemo(() => [
    {
      id: 1, stage: t('hero.brainstorm'), image: '/images/hero-brainstorm.png',
      description: t('hero.brainstormDescription'), heading: t('hero.brainstormHeading'),
      subLines: [t('hero.brainstormSub1'), t('hero.brainstormSub2')],
    },
    {
      id: 2, stage: t('hero.analyze'), image: '/images/hero-analyze.png',
      description: t('hero.analyzeDescription'), heading: t('hero.analyzeHeading'),
      subLines: [t('hero.analyzeSub1'), t('hero.analyzeSub2')],
    },
    {
      id: 3, stage: t('hero.learn'), image: '/images/hero-learn.png',
      description: t('hero.learnDescription'), heading: t('hero.learnHeading'),
      subLines: [t('hero.learnSub1'), t('hero.learnSub2')],
    },
    {
      id: 4, stage: t('hero.build'), image: '/images/hero-build.png',
      description: t('hero.buildDescription'), heading: t('hero.buildHeading'),
      subLines: [t('hero.buildSub1'), t('hero.buildSub2')],
    },
    {
      id: 5, stage: t('hero.launch'), image: '/images/hero-launch.png',
      description: t('hero.launchDescription'), heading: t('hero.launchHeading'),
      subLines: [t('hero.launchSub1'), t('hero.launchSub2')],
    },
    {
      id: 6, stage: t('hero.liveBetter'), image: '/images/live-better.png',
      description: t('hero.liveBetterDescription'), heading: t('hero.liveBetterHeading'),
      subLines: [t('hero.liveBetterSub1'), t('hero.liveBetterSub2')],
    },
    {
      id: 7, stage: t('hero.joinUs'), image: '/images/community-learning.png',
      description: t('hero.joinUsDescription'), heading: t('hero.joinUsHeading'),
      subLines: [t('hero.joinUsSub1'), t('hero.joinUsSub2')],
    },
  ], [t])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [nextSlide, setNextSlide] = useState(1)
  const [displayedHeading, setDisplayedHeading] = useState('')
  const [displayedSub, setDisplayedSub] = useState('')
  const [currentSubIndex, setCurrentSubIndex] = useState(0)
  const [phase, setPhase] = useState('typing-heading')
  // The reset key forces the typewriter effect to restart even when its text dependencies are already empty.
  const [slideKey, setSlideKey] = useState(0)
  const typewriterRef = useRef(null)
  const slideTimerRef = useRef(null)
  const previousLanguageRef = useRef(i18n.resolvedLanguage)

  useEffect(() => {
    if (previousLanguageRef.current === i18n.resolvedLanguage) return
    previousLanguageRef.current = i18n.resolvedLanguage
    if (typewriterRef.current) clearTimeout(typewriterRef.current)
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    setDisplayedHeading('')
    setDisplayedSub('')
    setCurrentSubIndex(0)
    setPhase('typing-heading')
    setSlideKey((previous) => previous + 1)
  }, [i18n.resolvedLanguage])

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes pulse-join {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55); }
        50% { transform: scale(1.025); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      }
      @keyframes blink-cursor {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .hero-join-btn { animation: pulse-join 1.8s ease-in-out infinite; }
      .typewriter-cursor {
        display: inline-block;
        width: 3px;
        height: 1em;
        margin-left: 3px;
        vertical-align: middle;
        background-color: #f59e0b;
        animation: blink-cursor 0.7s step-end infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .hero-join-btn, .typewriter-cursor { animation: none; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current)
    const slide = slides[currentSlide]

    if (phase === 'typing-heading') {
      if (displayedHeading.length < slide.heading.length) {
        typewriterRef.current = window.setTimeout(() => {
          setDisplayedHeading(slide.heading.substring(0, displayedHeading.length + 1))
        }, 90)
      } else {
        typewriterRef.current = window.setTimeout(() => {
          setPhase('typing-sub')
          setCurrentSubIndex(0)
          setDisplayedSub('')
        }, 350)
      }
    }

    if (phase === 'typing-sub') {
      const subText = slide.subLines[currentSubIndex]
      if (displayedSub.length < subText.length) {
        typewriterRef.current = window.setTimeout(() => {
          setDisplayedSub(subText.substring(0, displayedSub.length + 1))
        }, 60)
      } else if (currentSubIndex < slide.subLines.length - 1) {
        typewriterRef.current = window.setTimeout(() => {
          setCurrentSubIndex((previous) => previous + 1)
          setDisplayedSub('')
        }, 1300)
      } else {
        typewriterRef.current = window.setTimeout(() => setPhase('deleting-sub'), 3200)
      }
    }

    if (phase === 'deleting-sub') {
      if (displayedSub.length > 0) {
        typewriterRef.current = window.setTimeout(() => {
          setDisplayedSub((previous) => previous.substring(0, previous.length - 1))
        }, 45)
      } else {
        typewriterRef.current = window.setTimeout(() => setPhase('deleting-heading'), 0)
      }
    }

    if (phase === 'deleting-heading') {
      if (displayedHeading.length > 0) {
        typewriterRef.current = window.setTimeout(() => {
          setDisplayedHeading((previous) => previous.substring(0, previous.length - 1))
        }, 50)
      } else {
        typewriterRef.current = window.setTimeout(() => {
          setNextSlide((currentSlide + 1) % slides.length)
          setPhase('transitioning')
        }, 0)
      }
    }

    if (phase === 'transitioning') {
      const next = nextSlide
      slideTimerRef.current = window.setTimeout(() => {
        setCurrentSlide(next)
        setCurrentSubIndex(0)
        setDisplayedSub('')
        setDisplayedHeading('')
        setSlideKey((previous) => previous + 1)
        setPhase('typing-heading')
      }, 1200)
    }

    return () => {
      if (typewriterRef.current) clearTimeout(typewriterRef.current)
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    }
  }, [phase, displayedHeading, displayedSub, currentSlide, currentSubIndex, nextSlide, slideKey, slides])

  const chooseSlide = (index) => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current)
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current)
    setCurrentSlide(index)
    setNextSlide((index + 1) % slides.length)
    setDisplayedHeading('')
    setDisplayedSub('')
    setCurrentSubIndex(0)
    setSlideKey((previous) => previous + 1)
    setPhase('typing-heading')
  }

  return (
    <section className="min-h-[85vh] overflow-hidden bg-[#0a2416] text-white">
      <div className="mx-auto grid min-h-[85vh] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div className="flex flex-col items-start">
          <div className="w-full rounded-3xl border border-violet-300/30 bg-gradient-to-br from-violet-700 via-indigo-800 to-[#241044] p-6 shadow-[0_20px_60px_rgba(76,29,149,0.35)] sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-100 sm:text-sm">
              <i className="fas fa-lightbulb" aria-hidden="true" />
              {t('hero.badge')}
            </span>

            <h1 className="mt-7 min-h-[3.4em] max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              {displayedHeading}
              {(phase === 'typing-heading' || phase === 'deleting-heading') && <span className="typewriter-cursor" aria-hidden="true" />}
            </h1>
            <div className="mt-5 min-h-[5rem] max-w-xl text-lg leading-8 text-violet-100 sm:text-xl">
              {displayedSub}
              {(phase === 'typing-sub' || phase === 'deleting-sub') && <span className="typewriter-cursor" aria-hidden="true" />}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2" aria-label={t('hero.journeyLabel')}>
            {slides.map((slide, index) => (
              <span
                key={slide.stage}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                  index === currentSlide
                    ? 'border-amber-400 bg-amber-400 text-[#0a2416]'
                    : 'border-amber-300/50 bg-transparent text-amber-100'
                }`}
              >
                {slide.stage}
              </span>
            ))}
          </div>
          {/* Stage chips use currentSlide as their single source of truth, so the active journey stage always matches the typewriter and image. */}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={currentSlide === slides.length - 1 ? '/register' : '/community'} className="hero-join-btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3.5 font-extrabold text-[#0a2416] shadow-lg hover:from-amber-300 hover:to-amber-500">
              <i className={`fas ${currentSlide === slides.length - 1 ? 'fa-arrow-right-to-bracket' : 'fa-lightbulb'}`} aria-hidden="true" />
              {currentSlide === slides.length - 1 ? t('hero.joinAcademy') : t('hero.joinIdeaLab')}
            </Link>
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-6 py-3.5 font-bold text-white transition hover:bg-white hover:text-[#0a2416]">
              <i className="fas fa-graduation-cap" aria-hidden="true" />
              {t('hero.exploreCourses')}
            </Link>
          </div>
        </div>

        <div className="relative pb-12">
          <div className="absolute -inset-2 rounded-[2rem] bg-amber-400/20 blur-2xl" aria-hidden="true" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-amber-300/70 bg-[#143923] shadow-[0_0_36px_rgba(245,158,11,0.2)] sm:aspect-[5/4]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(245,158,11,0.2),transparent_35%),linear-gradient(135deg,#17442b,#0a2416_70%)]" />
            {slides.map((slide, index) => {
              const isVisible = index === currentSlide || (phase === 'transitioning' && index === nextSlide)
              return (
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.heading}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 1.2s ease-in-out',
                    zIndex: phase === 'transitioning'
                      ? index === currentSlide ? 1 : index === nextSlide ? 2 : 0
                      : index === currentSlide ? 2 : 0,
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )
            })}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className={`absolute bottom-5 left-5 right-5 z-[4] rounded-2xl border p-4 shadow-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-5 ${
              currentSlide === slides.length - 1
                ? 'border-amber-300/60 bg-gradient-to-br from-violet-950/95 via-indigo-950/95 to-[#0a2416]/95 text-white'
                : 'border-white/30 bg-white/95 text-slate-900'
            }`}>
              <p className={`text-xs font-extrabold uppercase tracking-[0.18em] ${currentSlide === slides.length - 1 ? 'text-amber-300' : 'text-amber-700'}`}>
                {currentSlide === slides.length - 1 ? t('hero.joinUsCardLabel') : t('hero.nextStage')}
              </p>
              <h2 className="mt-1 text-xl font-black">
                {currentSlide === slides.length - 1 ? t('hero.joinUsCardHeading') : slides[currentSlide].stage}
              </h2>
              <p className={`mt-1 text-sm ${currentSlide === slides.length - 1 ? 'text-violet-100' : 'text-slate-600'}`}>
                {currentSlide === slides.length - 1 ? t('hero.joinUsCardDescription') : slides[currentSlide].description}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => chooseSlide(index)}
                className="h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                style={{
                  width: index === currentSlide ? '32px' : '8px',
                  backgroundColor: index === currentSlide ? '#f59e0b' : 'rgba(255,255,255,0.45)',
                }}
                aria-label={t('hero.showSlide', { stage: slide.stage })}
                aria-current={index === currentSlide ? 'true' : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
