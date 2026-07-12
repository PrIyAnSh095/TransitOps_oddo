import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-[#e5e2e1] font-sans selection:bg-[#404040]">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl p-8 backdrop-blur-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-900" />
            <div className="mx-auto w-12 h-12 bg-[#1f1111] border border-[#4a1c1c] rounded flex items-center justify-center mb-6">
              <AlertOctagon className="w-6 h-6 text-[#ffb4ab]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">
              System Error (500)
            </h1>
            <p className="text-sm text-[#A3A3A3] mb-6">
              A critical failure occurred in the TransitOps module. Our technicians have been notified.
            </p>
            
            {this.state.error && (
              <div className="bg-[#131313] border border-[#1F1F1F] rounded p-3 mb-6 overflow-x-auto text-left">
                <p className="text-xs font-mono text-[#c4c7c8] whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-[#e5e2e1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#0A0A0A] transition-all font-mono uppercase"
            >
              <RefreshCcw size={16} />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
