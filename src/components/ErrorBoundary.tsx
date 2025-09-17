// Error Boundary component for handling React errors
// مكون حدود الخطأ لمعالجة أخطاء React

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { handleComponentError } from '@/lib/errorHandling';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  showRefresh?: boolean;
  showHome?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleComponentError(error, errorInfo, 'ErrorBoundary');
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong | حدث خطأ ما
            </h2>

            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or return to the home page.
              <br />
              <span className="text-xs mt-2 block text-gray-500">
                حدث خطأ غير متوقع. يرجى تحديث الصفحة أو العودة إلى الصفحة الرئيسية.
              </span>
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-3 bg-gray-800 rounded border border-gray-600 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Development Info</span>
                </div>
                <p className="text-red-400 text-xs font-mono break-all mb-2">
                  {this.state.error.message}
                </p>
                <p className="text-gray-500 text-xs">
                  <strong>Stack:</strong> {this.state.error.stack?.split('\n')[1]?.trim()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-500 mt-1 overflow-auto max-h-32 bg-gray-900 p-2 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again | حاول مرة أخرى
              </button>

              {this.props.showRefresh !== false && (
                <button
                  onClick={this.handleRefresh}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh Page | تحديث الصفحة
                </button>
              )}

              {this.props.showHome !== false && (
                <button
                  onClick={this.handleGoHome}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home | الصفحة الرئيسية
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              If the problem persists, please contact support.
              <br />
              إذا استمرت المشكلة، يرجى الاتصال بالدعم.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
