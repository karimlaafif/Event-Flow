import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Don't show error boundary for certain non-critical errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStack = error?.stack?.toLowerCase() || '';
    const isNonCritical = 
      errorMessage.includes('leaflet') ||
      errorMessage.includes('map') ||
      errorMessage.includes('tile') ||
      errorMessage.includes('network') ||
      errorMessage.includes('loading chunk') ||
      errorMessage.includes('marker') ||
      errorMessage.includes('polyline') ||
      errorStack.includes('leaflet') ||
      errorStack.includes('map');
    
    if (isNonCritical) {
      console.warn('Non-critical error (map/UI related), attempting to recover:', error);
      // Try to recover by resetting state after a delay
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        });
      }, 1000);
      return;
    }
    
    // Only set error state for critical errors
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Always reset state first
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Only redirect for truly critical errors that can't be recovered
    const errorMessage = this.state.error?.message?.toLowerCase() || '';
    const errorStack = this.state.error?.stack?.toLowerCase() || '';
    const isCritical = 
      errorMessage.includes('cannot read') && !errorMessage.includes('map') ||
      errorMessage.includes('undefined is not') && !errorMessage.includes('map') ||
      errorMessage.includes('null is not') && !errorMessage.includes('map');
    
    // Don't redirect for map/UI errors - just reset
    if (isCritical && !errorMessage.includes('map') && !errorMessage.includes('leaflet')) {
      // Small delay before redirect to allow state to reset
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
    // For non-critical errors (maps, UI), just reset - component will re-render
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null; onReset: () => void }> = ({ error, onReset }) => {
  const handleGoHome = () => {
    try {
      window.location.href = '/';
    } catch (e) {
      // Fallback if navigation fails
      onReset();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="glass-card border-destructive/50 max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The application encountered an unexpected error. Don't worry, your data is safe.
          </p>
          {error && (
            <details className="text-xs bg-muted p-3 rounded-lg">
              <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap text-muted-foreground">
                {error.toString()}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button
              onClick={onReset}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload App
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrapper to use hooks
const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;

