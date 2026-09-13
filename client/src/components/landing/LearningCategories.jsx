const categories = [
  "Technology & Computer Science",
  "Languages & Communication",
  "Mathematics & Academic Skills",
  "Business & Entrepreneurship",
  "Humanities & Social Sciences",
  "Health & Personal Development",
]

const LearningCategories = () => {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold uppercase tracking-widest text-green-800">
            Explore Your Interests
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Learning for every kind of goal.
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            BarakahTech Academy is designed to support meaningful learning
            across a growing range of subjects and disciplines.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category}
              className="flex min-h-32 items-end rounded-2xl border border-green-100 bg-green-50/70 p-6 transition hover:border-green-300 hover:bg-green-100/60"
            >
              <h3 className="text-lg font-bold leading-7 text-gray-900">
                {category}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LearningCategories
