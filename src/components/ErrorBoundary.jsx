import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.href = "/";
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0b0e] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#12131a] border border-[#23263a] rounded-2xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black mb-2 text-white font-display">
              Ups, algo correu mal!
            </h1>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Ocorreu uma falha inesperada ao renderizar a aplicação. Pode tentar recarregar a página ou restaurar os dados locais.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accentSecondary text-black font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c1f2e] text-gray-300 font-semibold text-sm hover:text-white border border-[#2b3046] transition-colors"
              >
                Limpar Cache Local
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-red-300 font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer text-gray-400 mb-1">Ver detalhe técnico</summary>
                {this.state.error.toString()}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
