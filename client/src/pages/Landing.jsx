import API_BASE_URL from '../config/api.js'
import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/common/Navbar"
import Hero from "../components/landing/Hero"
import JourneySection from "../components/landing/JourneySection"
import UpcomingSessions from "../components/landing/UpcomingSessions"
import StatsBar from "../components/landing/StatsBar"
import FeaturesCarousel from "../components/landing/FeaturesCarousel"
import LearningCategories from "../components/landing/LearningCategories"
import HowItWorks from "../components/landing/HowItWorks"
import TeachersCarousel from "../components/landing/TeachersCarousel"
import TutorsCarousel from "../components/landing/TutorsCarousel"
import Testimonials from "../components/landing/Testimonials"
import ForStudentsTeachers from "../components/landing/ForStudentsTeachers"
import FinalCTA from "../components/landing/FinalCTA"
import Footer from "../components/common/Footer"
import { useTranslation } from "react-i18next"
import { getApiErrorMessage } from "../utils/apiErrors"

const Landing = () => {
  const { t } = useTranslation()
  const [landingData, setLandingData] = useState(null)
  const [dataError, setDataError] = useState("")

  useEffect(() => {
    let isCurrent = true
    let requestPending = false

    const loadLandingData = async () => {
      if (requestPending) return
      requestPending = true

      try {
        const response = await axios.get(`${API_BASE_URL}/landing`)
        if (isCurrent) {
          const data = response.data || {}
          setLandingData({
            stats: data.stats && typeof data.stats === 'object' ? data.stats : null,
            courses: Array.isArray(data.courses) ? data.courses : [],
            teachers: Array.isArray(data.teachers) ? data.teachers : [],
            tutors: Array.isArray(data.tutors) ? data.tutors : [],
            feedback: Array.isArray(data.feedback) ? data.feedback : [],
          })
          setDataError("")
        }
      } catch (requestError) {
        if (isCurrent) {
          setDataError(getApiErrorMessage(
            requestError,
            t('landing.dataError'),
            t('common.networkError'),
          ))
        }
      } finally {
        requestPending = false
      }
    }

    loadLandingData()
    const refreshInterval = window.setInterval(loadLandingData, 60_000)
    window.addEventListener("focus", loadLandingData)

    return () => {
      isCurrent = false
      window.clearInterval(refreshInterval)
      window.removeEventListener("focus", loadLandingData)
    }
  }, [t])

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      {/* The journey follows the hero immediately to explain how the platform turns a problem into practical next steps. */}
      <JourneySection />
      <UpcomingSessions />
      {dataError && (
        <p role="alert" className="bg-red-50 px-6 py-3 text-center text-sm text-red-800">
          {dataError}
        </p>
      )}
      <StatsBar stats={landingData?.stats || null} />
      <FeaturesCarousel />
      <LearningCategories courses={landingData?.courses || []} />
      <HowItWorks />
      {/* The two carousels move in opposite directions to add visual interest and distinguish course teachers from live tutors. */}
      <TeachersCarousel teachers={landingData?.teachers || []} />
      <TutorsCarousel tutors={landingData?.tutors || []} />
      {/* Testimonials use the brand's dark green to create strong contrast before the student/teacher split section. */}
      <Testimonials
        feedback={landingData?.feedback || []}
        loading={!landingData && !dataError}
        error={!landingData ? dataError : ""}
      />
      <ForStudentsTeachers />
      {/* The photo behind the final CTA reinforces the human connection at the moment visitors are asked to join. */}
      <FinalCTA />
      <Footer />
    </div>
  )
}

export default Landing
