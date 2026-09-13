import Navbar from "../components/common/Navbar"
import Hero from "../components/landing/Hero"
import About from "../components/landing/About"
import HowItWorks from "../components/landing/HowItWorks"
import Features from "../components/landing/Features"
import LearningCategories from "../components/landing/LearningCategories"
import ForStudentsTeachers from "../components/landing/ForStudentsTeachers"
import FinalCTA from "../components/landing/FinalCTA"
import Footer from "../components/common/Footer"

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <LearningCategories />
      <ForStudentsTeachers />
      <FinalCTA />
      <Footer />
    </div>
  )
}

export default Landing
