const statItems = [
  { key: "courses", label: "Published Courses", icon: "fa-book-open", color: "#f59e0b" },
  { key: "teachers", label: "Approved Teachers", icon: "fa-chalkboard-teacher", color: "#10b981" },
  { key: "tutors", label: "Available Tutors", icon: "fa-user-graduate", color: "#3b82f6" },
  { key: "students", label: "Students", icon: "fa-users", color: "#8b5cf6" },
  { key: "subjects", label: "Subjects", icon: "fa-th-large", color: "#ef4444" },
]

const StatCounter = ({ item, value }) => {
  return (
    <div className="group text-center">
      <div
        className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}40` }}
      >
        <i className={`fas ${item.icon} text-xl`} style={{ color: item.color }} aria-hidden="true" />
      </div>
      <div className="mb-1 text-3xl font-bold" style={{ color: "#f59e0b" }}>
        {value === null ? "—" : value.toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-300">{item.label}</div>
    </div>
  )
}

const StatsBar = ({ stats }) => {
  return (
    <section className="px-6 py-16" style={{ backgroundColor: "#0a2416" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {statItems.map((item) => (
            <StatCounter
              key={item.key}
              item={item}
              value={stats ? Number(stats[item.key]) : null}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
