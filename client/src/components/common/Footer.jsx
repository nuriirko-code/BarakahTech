import { Link } from "react-router-dom"

const footerLinks = {
  explore: [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: "Tutors", to: "/tutors" },
    { label: "About", to: "/about" },
  ],
  students: [
    { label: "Find a Course", to: "/courses" },
    { label: "Find a Tutor", to: "/tutors" },
    { label: "Start Learning", to: "/register" },
  ],
  teachers: [
    { label: "Teach with Us", to: "/register" },
    { label: "Create a Course", to: "/teacher/courses" },
    { label: "Offer Live Sessions", to: "/teacher/sessions" },
  ],
}

const FooterLinks = ({ title, links }) => (
  <div>
    <h3 className="text-sm font-bold uppercase tracking-widest text-green-200">
      {title}
    </h3>
    <ul className="mt-5 space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            to={link.to}
            className="text-green-50/80 transition hover:text-white hover:underline"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

const Footer = () => {
  return (
    <footer className="bg-green-950 px-6 py-14 text-green-50 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/" className="text-2xl font-bold tracking-tight text-white">
              BarakahTech <span className="text-green-200">Academy</span>
            </Link>
            <p className="mt-5 leading-7 text-green-50/75">
              A learning platform built to help students grow through
              structured courses, live teaching, and practical education.
            </p>
          </div>

          <FooterLinks title="Explore" links={footerLinks.explore} />
          <FooterLinks title="For Students" links={footerLinks.students} />
          <FooterLinks title="For Teachers" links={footerLinks.teachers} />
        </div>

        <div className="mt-12 border-t border-green-800 pt-6 text-sm text-green-100/70">
          © {new Date().getFullYear()} BarakahTech Academy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
