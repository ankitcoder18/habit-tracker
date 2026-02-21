import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#140746] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Oops! Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              The application encountered an error. Please refresh the page or check the console for details.
            </p>
            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="cursor-pointer font-semibold text-gray-800">Error Details</summary>
              <pre className="mt-2 text-sm text-red-600 overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
