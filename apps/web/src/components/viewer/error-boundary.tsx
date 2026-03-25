"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("GLB Viewer Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
            <div className="p-6 text-center">
              <p className="mb-2 text-xl font-semibold">
                モデルの読み込みに失敗しました
              </p>
              <p className="text-sm text-slate-400">
                {this.state.error?.message ?? "不明なエラー"}
              </p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
