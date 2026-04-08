import { Component, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface in dev console only
    // eslint-disable-next-line no-console
    console.error('App error:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  goHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black">משהו קצת השתבש</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            הדף הזה לא נטען כראוי. אפשר לנסות שוב או לחזור לבית.
          </p>
          {this.state.error && (
            <details className="text-left text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl p-2">
              <summary className="cursor-pointer">פרטים טכניים</summary>
              <pre className="overflow-auto mt-2">{this.state.error.message}</pre>
            </details>
          )}
          <div className="flex gap-2">
            <button onClick={this.reset} className="btn-ghost flex-1">
              <RefreshCw className="w-5 h-5" /> נסה שוב
            </button>
            <button onClick={this.goHome} className="btn-primary flex-1">
              <Home className="w-5 h-5" /> חזור לבית
            </button>
          </div>
        </div>
      </div>
    );
  }
}
