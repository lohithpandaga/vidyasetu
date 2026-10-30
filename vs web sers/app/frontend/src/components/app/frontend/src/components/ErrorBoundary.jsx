import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Boundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-ink text-white p-8">
          <div className="max-w-md text-center">
            <h1 className="font-display text-3xl font-extrabold mb-3">Something snapped.</h1>
            <p className="text-white/60 mb-6">
              One section misbehaved, but the rest of Vidhyasetu is fine. Refresh to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-brand text-white font-semibold hover:bg-blue-700 transition-colors"
              data-testid="error-reload-button"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
