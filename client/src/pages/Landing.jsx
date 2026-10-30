import API_BASE_URL from '../config/api.js'
import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/common/Navbar"
import Hero from "../components/landing/Hero"
import StatsBar from "../components/landing/StatsBar"
import FeaturesCarousel from "../components/landing/FeaturesCarousel"
import HowItWorks from "../components/landing/HowItWorks"
import TeachersCarousel from "../components/landing/TeachersCarousel"
import TutorsCarousel from "../components/landing/TutorsCarousel"
import Testimonials from "../components/landing/Testimonials"
import LearningCategories from "../components/landing/LearningCategories"
import ForStudentsTeachers from "../components/landing/ForStudentsTeachers"
import FinalCTA from "../components/landing/FinalCTA"
import Footer from "../components/common/Footer"

const Landing = () => {
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
          setLandingData(response.data)
          setDataError("")
        }
      } catch (requestError) {
        if (isCurrent) {
          setDataError(requestError.response?.data?.message || "Live homepage data could not be loaded.")
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
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      {/* Alternating light and dark section backgrounds creates visual rhythm and encourages visitors to keep scrolling. */}
      {dataError && (
        <p role="alert" className="bg-red-50 px-6 py-3 text-center text-sm text-red-800">
          {dataError}
        </p>
      )}
      <StatsBar stats={landingData?.stats || null} />
      <FeaturesCarousel />
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
      <LearningCategories courses={landingData?.courses || []} />
      <ForStudentsTeachers />
      {/* The photo behind the final CTA reinforces the human connection at the moment visitors are asked to join. */}
      <FinalCTA />
      <Footer />
    </div>
  )
}

export default Landing
