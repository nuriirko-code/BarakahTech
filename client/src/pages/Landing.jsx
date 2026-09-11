import Navbar from "../components/common/Navbar"
import Hero from "../components/landing/Hero"
import About from "../components/landing/About"

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <About />
    </div>
  )
}

export default Landing
