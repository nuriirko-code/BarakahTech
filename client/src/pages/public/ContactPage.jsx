import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const ContactPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Contact Us</h1>
      <p className="mb-4 text-lg text-gray-500">We would love to hear from you.</p>
      <a href="mailto:support@barakah-academy.com" className="text-lg font-semibold text-green-700 hover:underline">
        support@barakah-academy.com
      </a>
    </main>
    <Footer />
  </div>
)

export default ContactPage
