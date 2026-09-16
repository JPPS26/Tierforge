import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Upload,
  RefreshCw,
  Trash2,
  AtSign,
  AlertCircle,
  User,
  Sparkles,
  Camera,
  ShieldAlert,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { checkHandleAvailable } from "../services/db";
import { Avatar, PrimaryButton, GhostButton } from "./UI";
import DeleteAccountModal from "./DeleteAccountModal";
import { compressImage } from "../services/imageOptimizer";

export default function ProfileEditModal({ isOpen, onClose, onSaveSuccess }) {
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const [handleStatus, setHandleStatus] = useState({ checked: true, available: true });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && profile) {
      setDisplayName(profile.displayName || "");
      setHandle(profile.handle ? profile.handle.replace(/^[@#]+/, "") : "");
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
      setErrorMsg("");
      const activeUid = user?.uid || profile?.uid;
      const res = checkHandleAvailable(profile.handle || "", activeUid);
      setHandleStatus(res);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, profile, user?.uid]);

  // Validação em tempo real do ID / Handle
  useEffect(() => {
    if (!handle.trim()) {
      setHandleStatus({ checked: true, available: false, reason: "empty" });
      return;
    }

    const timer = setTimeout(() => {
      const activeUid = user?.uid || profile?.uid;
      const res = checkHandleAvailable(handle, activeUid);
      setHandleStatus(res);
    }, 200);

    return () => clearTimeout(timer);
  }, [handle, user?.uid, profile?.uid]);

  if (!isOpen) return null;

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("O ficheiro selecionado tem de ser uma imagem válida (PNG, JPG ou WebP).");
      return;
    }

    try {
      const compressed = await compressImage(file, 280, 280, 0.85);
      setAvatar(compressed);
      setErrorMsg("");
    } catch (err) {
      console.error("Erro ao comprimir avatar:", err);
      setErrorMsg("Erro ao processar imagem. Tenta novamente.");
    }
  }

  function handleRestoreGooglePhoto() {
    if (user?.photoURL) {
      setAvatar(user.photoURL);
    }
  }

  function handleRemovePhoto() {
    setAvatar("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!handleStatus.available) {
      setErrorMsg(t("profile.handleInvalid"));
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const cleanHandleToSave = handle.replace(/^[@#]+/, "").toLowerCase().trim();
      const updated = await updateProfile({
        displayName,
        handle: cleanHandleToSave,
        bio,
        avatar,
      });

      if (onSaveSuccess) onSaveSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao guardar o perfil. Tenta novamente.");
    } finally {
      setSaving(false);
    }
  }

  const cleanHandle = handle.replace(/^#/, "").replace(/^@/, "").toLowerCase().trim();

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col rounded-3xl border border-white/[0.1] bg-[#0E0F18] shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(124,92,255,0.12)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Glow de ambientação no topo */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-accent/20 blur-[80px]" />

        {/* Cabeçalho do Modal */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] p-5 sm:p-6 bg-[#0E0F18]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft border border-accent/30 text-accent shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display text-[18px] sm:text-[19px] font-bold text-white tracking-tight">
                Personalizar Perfil
              </h3>
              <p className="text-xs text-mutedDim">
                Atualiza a tua identidade de criador, foto e biografia pública
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensagem de Erro Geral */}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-400 animate-fadeIn">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* SECÇÃO 1: FOTO & AVATAR STUDIO */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131422] p-4 sm:p-5">
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-mutedDim">
              Foto de Perfil & Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar Preview com Ring e Ícone de Câmara */}
              <div
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Clica para escolher uma nova foto"
              >
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-accent/60 p-0.5 bg-[#090A10] shadow-glow group-hover:border-accent transition-all">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName || "Criador"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <Avatar name={displayName || "Criador"} size={92} />
                  )}

                  {/* Overlay Hover */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={22} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Botões de Ação para a Foto */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-accent/40 bg-accentSoft/60 px-3 text-xs font-bold text-accent hover:bg-accent hover:text-black transition-all shadow-sm"
                  >
                    <Upload size={13} />
                    <span>Carregar Nova Foto</span>
                  </button>

                  {user?.photoURL && (
                    <button
                      type="button"
                      onClick={handleRestoreGooglePhoto}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold text-muted hover:text-white transition-colors"
                      title="Restaurar a foto associada à tua conta Google"
                    >
                      <RefreshCw size={12} />
                      <span>Foto Google</span>
                    </button>
                  )}

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Remover foto personalizada"
                    >
                      <Trash2 size={13} />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                <p className="text-[11.5px] text-mutedDim leading-relaxed">
                  Formatos aceites: PNG, JPG ou WebP. Resolução quadrada recomendada.
                </p>
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: NOME DE APRESENTAÇÃO */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-mutedDim">
              <span>Nome Público de Apresentação</span>
              <span className="text-[11px] font-normal text-mutedDim">
                {displayName.length}/40
              </span>
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-mutedDim" />
              <input
                value={displayName}
                maxLength={40}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ex: Gonçalo Santos, PlayerOne, CinemaBuff…"
                required
                className="w-full h-10 rounded-xl border border-white/[0.08] bg-[#131422] pl-10 pr-4 text-[13.5px] text-white placeholder:text-mutedDim outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* SECÇÃO 3: IDENTIFICADOR ÚNICO (@HANDLE) */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
                <span>Identificador Único (#ID / @handle)</span>
              </label>

              {/* Status da Disponibilidade em Tempo Real */}
              {handleStatus.checked && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                    handleStatus.available
                      ? "bg-teal/10 text-teal border border-teal/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {handleStatus.available ? (
                    <>
                      <Check size={11} className="stroke-[3]" />
                      <span>Disponível</span>
                    </>
                  ) : handleStatus.reason === "taken" ? (
                    <>
                      <X size={11} className="stroke-[3]" />
                      <span>Em uso por outro utilizador</span>
                    </>
                  ) : handleStatus.reason === "reserved" ? (
                    <>
                      <AlertCircle size={11} />
                      <span>Identificador reservado</span>
                    </>
                  ) : handleStatus.reason === "empty" ? (
                    <>
                      <AlertCircle size={11} />
                      <span>ID obrigatório</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={11} />
                      <span>Mínimo 3 caracteres (letras, números, _ ou -)</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-accent font-black text-[15px]">@</span>
              <input
                value={handle}
                onChange={(e) =>
                  setHandle(
                    e.target.value
                      .replace(/^[@#]+/, "")
                      .replace(/[^a-zA-Z0-9_-]/g, "")
                      .slice(0, 20)
                  )
                }
                placeholder="omeunome"
                required
                className={`w-full h-10 rounded-xl border bg-[#131422] pl-9 pr-4 text-[13.5px] font-bold text-white outline-none transition-colors ${
                  handleStatus.available
                    ? "border-white/[0.08] focus:border-accent"
                    : "border-rose-500/60 focus:border-rose-500"
                }`}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-mutedDim">
              <span>
                Link público:{" "}
                <strong className="text-accent">
                  /profile/{cleanHandle || "handle"}
                </strong>
              </span>
              <span>Apenas letras, números, _ ou -.</span>
            </div>
          </div>

          {/* SECÇÃO 4: BIOGRAFIA DO CRIADOR */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-mutedDim">
                Biografia do Criador
              </label>
              <span
                className={`text-[11px] font-semibold ${
                  bio.length > 220 ? "text-amber-400" : "text-mutedDim"
                }`}
              >
                {bio.length}/240
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 240))}
              rows={3}
              placeholder="Partilha um pouco sobre as tuas preferências, jogos favoritos, filmes, desporto ou o tipo de tier lists que costumas criar…"
              className="w-full rounded-xl border border-white/[0.08] bg-[#131422] p-3.5 text-[13px] text-white placeholder:text-mutedDim/70 outline-none focus:border-accent transition-colors leading-relaxed"
            />
          </div>

          {/* SECÇÃO 5: ZONA DE PERIGO (ELIMINAR CONTA) */}
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
                  <ShieldAlert size={14} />
                  <span>Zona de Perigo</span>
                </div>
                <div className="text-[12px] text-mutedDim mt-0.5">
                  Eliminar permanentemente a tua conta, rankings e comentários.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
                <span>Eliminar Conta</span>
              </button>
            </div>
          </div>
        </form>

        {/* Rodapé de Ações Fixo */}
        <div className="relative z-10 flex items-center justify-end gap-3 border-t border-white/[0.08] bg-[#0E0F18] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 px-4 rounded-xl border border-white/[0.08] bg-[#131422] text-[13px] font-semibold text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {t("builder.cancel") || "Cancelar"}
          </button>

          <PrimaryButton
            icon={Check}
            onClick={handleSubmit}
            disabled={saving || !handleStatus.available}
          >
            {saving ? "A guardar…" : "Guardar Alterações"}
          </PrimaryButton>
        </div>
      </div>
    </div>

      {/* Modal de Confirmação de Eliminação de Conta */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onAccountDeleted={onClose}
      />
    </>
  );
}
