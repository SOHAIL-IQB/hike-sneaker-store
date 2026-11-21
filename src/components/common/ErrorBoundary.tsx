import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  failed: boolean;
}

/** Last-resort safety net: a render error shows a calm message instead of a blank page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main id="main" className="grid min-h-[100svh] place-items-center bg-background px-6 text-center text-foreground">
        <div>
          <h1 className="text-display text-[clamp(2rem,8vw,4rem)]">Something went wrong</h1>
          <p className="mx-auto mt-4 max-w-[40ch] text-muted-foreground">The page hit an unexpected error. Reloading usually fixes it.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-foreground px-6 font-semibold text-background"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }
}
