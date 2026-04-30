import React from 'react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches uncaught render errors so a single bad component doesn't blank the app
 * in front of a customer. Shows a recoverable error UI with the error message.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset() {
    this.setState({ error: null });
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="m-8 p-6 bg-red-900/20 border border-red-500 text-white rounded">
          <h2 className="text-xl font-black uppercase tracking-wider text-red-400 mb-2">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p className="text-sm text-gray-300 mb-2">
            Your data is preserved. Click below to retry, or refresh the page if the problem persists.
          </p>
          <pre className="text-[10px] text-red-300 bg-black/40 p-3 mt-3 mb-4 overflow-auto max-h-40 whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            className="bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold px-4 py-2 uppercase tracking-wider text-sm"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
