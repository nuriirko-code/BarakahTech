import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const AboutPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">About Barakah Academy</h1>
      <p className="text-lg text-gray-500">Our story is coming soon.</p>
    </main>
    <Footer />
  </div>
)

export default AboutPage
