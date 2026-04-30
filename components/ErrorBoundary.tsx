import React from 'react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
  componentStack: string | null;
}

const ERROR_LOG_KEY = 'co_error_log_v1';
const MAX_ERROR_LOG = 20;

interface LoggedError {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  fallbackTitle?: string;
}

function appendErrorLog(entry: LoggedError) {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    const log: LoggedError[] = raw ? JSON.parse(raw) : [];
    log.unshift(entry);
    if (log.length > MAX_ERROR_LOG) log.length = MAX_ERROR_LOG;
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(log));
  } catch {
    // localStorage unavailable or quota exceeded — best-effort.
  }
}

/**
 * Catches uncaught render errors so a single bad component doesn't blank the app
 * in front of a customer. Shows a recoverable error UI with the error message,
 * preserves a rolling log of the last 20 errors in localStorage so the user can
 * paste them into a support request.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, componentStack: null };
    this.reset = this.reset.bind(this);
    this.copyDetails = this.copyDetails.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, componentStack: null };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ componentStack: info.componentStack ?? null });
    appendErrorLog({
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      fallbackTitle: this.props.fallbackTitle,
    });

    // Stale-chunk auto-recovery: when a deploy lands while a tab is open,
    // dynamically imported chunks (lazy components) get 404'd because their
    // hash-named filenames no longer exist on the server. React catches the
    // import error and re-throws it through componentDidCatch — which means
    // the global window.onerror handler doesn't see it. Detect and reload
    // here, guarded by sessionStorage so we never loop.
    const msg = error.message || '';
    const looksLikeStaleChunk = /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|Expected a JavaScript-or-Wasm module script/i.test(msg);
    if (looksLikeStaleChunk) {
      try {
        const reloadKey = 'co_chunk_reload_attempted';
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, String(Date.now()));
          console.warn('[ErrorBoundary] Stale chunk detected — reloading once to pick up the latest deploy.');
          window.location.reload();
        }
      } catch { /* sessionStorage unavailable — fall through to error UI */ }
    }
  }

  reset() {
    this.setState({ error: null, componentStack: null });
  }

  async copyDetails() {
    if (!this.state.error) return;
    const details = [
      `Time: ${new Date().toISOString()}`,
      `Location: ${this.props.fallbackTitle || 'Unknown'}`,
      `Message: ${this.state.error.message}`,
      this.state.error.stack ? `\nStack:\n${this.state.error.stack}` : '',
      this.state.componentStack ? `\nComponent stack:${this.state.componentStack}` : '',
      `\nURL: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      `User agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : ''}`,
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(details);
    } catch {
      // Fallback if clipboard API is unavailable
      window.prompt('Copy these error details and paste in your support message:', details);
    }
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
          <div className="flex gap-2">
            <button
              onClick={this.reset}
              className="bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold px-4 py-2 uppercase tracking-wider text-sm"
            >
              Retry
            </button>
            <button
              onClick={this.copyDetails}
              className="bg-white/5 hover:bg-white/10 border border-gray-700 text-gray-300 font-bold px-4 py-2 uppercase tracking-wider text-sm"
            >
              Copy details for support
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
