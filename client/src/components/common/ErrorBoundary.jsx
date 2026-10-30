import { Component } from 'react'

// React error boundaries must be class components; this lifecycle changes the
// fallback state after a descendant throws during rendering or lifecycle work.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('Application error boundary caught:', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <section className="max-w-md text-center">
          <i className="fas fa-triangle-exclamation mb-6 text-5xl text-amber-500" aria-hidden="true" />
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mb-6 leading-relaxed text-gray-600">
            An unexpected error interrupted this page. Refresh the page or return to the homepage.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#0a2416] px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              <i className="fas fa-sync mr-2" aria-hidden="true" />
              Refresh page
            </button>
            <a
              href="/"
              className="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
            >
              <i className="fas fa-home mr-2" aria-hidden="true" />
              Go home
            </a>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <summary className="mb-2 cursor-pointer text-sm font-semibold text-red-700">
                Development error details
              </summary>
              <pre className="overflow-auto whitespace-pre-wrap text-xs text-red-700">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </section>
      </main>
    )
  }
}

export default ErrorBoundary
