import React, { ReactNode, Component, ErrorInfo } from "react";
import Icon from "components/Icon";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-sm text-center mx-auto mt-[20vh]">
          <h2 className="text-xl text-gray-600">Sorry! Something went wrong...</h2>
          <p className="my-6">
            <button className="text-orange-700" onClick={this.handleReload}>
              <Icon name="refresh" className="text-lg inline mr-2" />
              Reload Page
            </button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
