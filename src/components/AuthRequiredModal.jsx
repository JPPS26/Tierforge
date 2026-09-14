import React, { useState } from "react";
import { Lock, LogIn, Sparkles, X, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PrimaryButton, GhostButton } from "./UI";

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Inicia Sessão para Continuar",
  description = "Para manter a comunidade do TierWorld autêntica e segura, precisas de iniciar sessão para interagir.",
  onSuccess,
}) {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleGoogleLogin() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError(t("login.errorCancelled") || "Início de sessão cancelado.");
      } else {
        setError(t("login.errorGeneral") || "Ocorreu um erro ao tentar iniciar sessão com o Google.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] rounded-3xl border border-borderStrong bg-[#111118] p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-mutedDim hover:bg-surface hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Ícone de Destaque */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
          <Lock size={26} />
        </div>

        {/* Título e Explicação */}
        <h3 className="mb-2 font-display text-[22px] font-black text-white">
          {title}
        </h3>
        <p className="mb-6 text-[13.5px] leading-relaxed text-muted">
          {description}
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Benefícios com Conta */}
        <div className="mb-6 rounded-2xl border border-border/80 bg-surface/50 p-3.5 flex flex-col gap-2 text-xs text-mutedDim">
          <div className="flex items-center gap-2 text-text font-semibold">
            <Sparkles size={13} className="text-accent" />
            <span>Com a tua conta gratuita podes:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>Criar e personalizar as tuas próprias Tier Lists</li>
            <li>Dar gostos e votar nos rankings da comunidade</li>
            <li>Comentar e responder às discussões</li>
            <li>Seguir criadores e acumular Creator XP</li>
          </ul>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3 text-[14px] font-bold text-[#0A0A0D] shadow-glow hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{busy ? "A iniciar sessão…" : "Entrar com Google"}</span>
          </button>

          <GhostButton onClick={onClose} className="w-full text-center text-xs text-mutedDim">
            Continuar apenas a visualizar
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

