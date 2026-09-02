import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ErrorState } from "@/components/error-state";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches rendering errors anywhere below it in the tree and shows the same
 * polished ErrorState UI instead of a blank white screen. Nothing in this
 * mock-data app currently throws during render, but the boundary exists so
 * the pattern is in place (and easy to exercise by throwing in dev tools).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <ErrorState
            title="This page hit an unexpected error"
            description="Try reloading the page. If the problem persists, the mock data may be in an unexpected state."
            onRetry={() => this.setState({ hasError: false })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
