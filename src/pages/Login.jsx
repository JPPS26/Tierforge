import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck,
  Trophy,
  Swords,
  Layers,
  ArrowLeft,
  ArrowRight,
  Loader2,
  LogOut,
  User,
  Zap,
} from "lucide-react";
import GoogleIcon from "../components/GoogleIcon";
import { Avatar } from "../components/UI";

export default function Login() {
  const { user, profile, loginWithGoogle, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.from;
  const from = fromState
    ? typeof fromState === "string"
      ? fromState
      : fromState.pathname + (fromState.search || "")
    : "/";

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError(t("login.errorCancelled") || "O início de sessão com o Google foi cancelado.");
      } else {
        setError(t("login.errorGeneral") || "Ocorreu um erro ao autenticar. Por favor, tenta novamente.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.warn("Erro ao terminar sessão:", err);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-160px)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
      {/* Luzes / Ambient Glows de Fundo */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-80 w-80 rounded-full bg-accent/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#00E5A3]/10 blur-[100px] pointer-events-none" />

      {/* Cartão Split-Screen Prestige */}
      <div className="w-full max-w-[1000px] overflow-hidden rounded-[32px] border border-white/10 bg-[#12121C]/90 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* Painel Esquerdo: Apresentação da Plataforma e Vantagens */}
        <div className="p-8 sm:p-12 lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-gradient-to-br from-[#181828]/70 via-[#12121C]/85 to-[#0F0F18]/95">
          <div>
            {/* Logótipo & Badge da Comunidade */}
            <div className="flex items-center gap-3 mb-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-[#A78BFA] text-black shadow-glow font-black text-xl">
                  T
                </div>
                <span className="font-display text-[22px] font-black tracking-tight text-white group-hover:text-accent transition-colors">
                  TierWorld
                </span>
              </Link>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-[11px] font-bold text-[#B6A5FF]">
                <Sparkles size={12} className="text-accent" />
                <span>Comunidade Global</span>
              </div>
            </div>

            {/* Título de Impacto */}
            <h2 className="font-display text-[26px] sm:text-[34px] font-black text-white tracking-tight leading-tight mb-3">
              Todos os rankings têm lugar aqui.
            </h2>
            <p className="text-[14.5px] text-muted leading-relaxed mb-8">
              Cria, vota e debate as melhores tier lists sobre qualquer tema — futebol, gaming, cinema, música, tecnologia e cultura pop com uma comunidade autêntica.
            </p>

            {/* Vantagens com Conta TierWorld */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent shrink-0 mt-0.5 shadow-sm">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="font-display text-[14.5px] font-bold text-white">
                    Identificador Único & Creator XP
                  </h4>
                  <p className="text-[12.5px] text-mutedDim leading-relaxed">
                    Garante o teu <span className="text-accent font-semibold">#handle</span> oficial, acumula XP com as tuas listas e sobe no Leaderboard global.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#00E5A3]/30 bg-[#00E5A3]/10 text-[#00E5A3] shrink-0 mt-0.5 shadow-sm">
                  <Trophy size={16} />
                </div>
                <div>
                  <h4 className="font-display text-[14.5px] font-bold text-white">
                    Votação Comunitária e Duelos 1 vs 1
                  </h4>
                  <p className="text-[12.5px] text-mutedDim leading-relaxed">
                    Vota nas classificações da comunidade e utiliza o modo Duelo eliminatório para ordenar as tuas escolhas com precisão.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#FF5470]/30 bg-[#FF5470]/10 text-[#FF5470] shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="font-display text-[14.5px] font-bold text-white">
                    100% Autêntico e Sem Bots
                  </h4>
                  <p className="text-[12.5px] text-mutedDim leading-relaxed">
                    Algoritmo anti-abuso rigoroso com dados reais calculados na plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé do Painel Esquerdo */}
          <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-mutedDim">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} className="text-[#00E5A3]" /> 100% Gratuito & Aberto
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Lock size={14} className="text-accent" /> Acesso Seguro Google OAuth
            </span>
          </div>
        </div>

        {/* Painel Direito: Ação de Login ou Estado de Sessão */}
        <div className="p-8 sm:p-10 lg:col-span-5 flex flex-col justify-center bg-[#0F0E17]/95 relative">
          {user ? (
            /* Estado: Já tem sessão iniciada */
            <div className="text-center py-4">
              <div className="mx-auto mb-4 relative inline-block">
                <div className="p-1 rounded-full border-2 border-accent shadow-[0_0_20px_rgba(124,92,255,0.4)]">
                  <Avatar
                    name={user.displayName || profile?.displayName || "Criador"}
                    image={user.photoURL || profile?.avatar}
                    size={68}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#00E5A3] text-black shadow-md">
                  <CheckCircle2 size={14} />
                </div>
              </div>

              <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-[11px] font-bold text-[#B6A5FF] mb-2">
                Sessão Iniciada
              </span>
              <h3 className="font-display text-[22px] font-black text-white">
                {user.displayName || profile?.displayName || "Criador"}
              </h3>
              <p className="text-[13px] text-muted mt-1 mb-6">
                #{profile?.handle || `user_${user.uid.slice(0, 6)}`} • {user.email}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to={`/profile/${profile?.handle || ""}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-[14px] font-black text-black hover:opacity-90 shadow-glow transition-all"
                >
                  <User size={16} />
                  <span>Ir para o Meu Perfil</span>
                </Link>

                <Link
                  to="/explore"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface px-5 py-3 text-[13.5px] font-bold text-white hover:bg-surface2 transition-all"
                >
                  <Layers size={16} />
                  <span>Explorar Tier Lists</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-transparent px-5 py-2.5 text-[12.5px] font-semibold text-mutedDim hover:text-[#FF5470] hover:bg-white/[0.02] transition-colors mt-2"
                >
                  <LogOut size={14} />
                  <span>Terminar Sessão</span>
                </button>
              </div>
            </div>
          ) : (
            /* Estado: Iniciar Sessão */
            <div>
              {/* Ícone de Cadeado & Cabeçalho */}
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent shadow-sm">
                  <Lock size={22} />
                </div>
                <h3 className="font-display text-[26px] font-black text-white tracking-tight leading-tight">
                  {t("login.title") || "Bem-vindo ao TierWorld"}
                </h3>
                <p className="mt-2 text-[13.5px] text-muted leading-relaxed">
                  {t("login.subtitle") ||
                    "Inicia sessão com a tua conta Google para criares listas, votares nos rankings e garantires o teu ID exclusivo."}
                </p>
              </div>

              {/* Mensagem de Erro se houver */}
              {error && (
                <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-[#FF5470]/40 bg-[#FF5470]/10 p-3.5 text-[13px] text-[#FF5470] animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Botão Oficial de Entrada com Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="group relative flex w-full items-center justify-center gap-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-[#0E0E15] py-4 px-6 font-bold text-[15px] shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-[#0E0E15]" />
                    <span>{t("login.signingIn") || "A autenticar com a Google…"}</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon size={22} />
                    <span>{t("login.googleBtn") || "Continuar com o Google"}</span>
                  </>
                )}
              </button>

              {/* Informações de Segurança e Privacidade */}
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-3">
                <ShieldCheck size={18} className="text-[#00E5A3] shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-mutedDim leading-relaxed">
                  Autenticação oficial protegida pelo Google OAuth 2.0. Não partilhamos os teus dados privados com terceiros.
                </p>
              </div>

              {/* Voltar à Página Principal */}
              <div className="mt-8 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-mutedDim hover:text-white transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Voltar à página principal</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
