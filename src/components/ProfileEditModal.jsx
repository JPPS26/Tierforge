import React, { useState, useEffect, useRef } from "react";
import { X, Check, Upload, RefreshCw, Trash2, AtSign, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { checkHandleAvailable } from "../services/db";
import { Avatar, PrimaryButton, GhostButton } from "./UI";
import DeleteAccountModal from "./DeleteAccountModal";

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

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setHandle(profile.handle || "");
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
    }
  }, [profile, isOpen]);

  // Validação em tempo real do ID / Handle
  useEffect(() => {
    if (!handle.trim()) {
      setHandleStatus({ checked: true, available: false, reason: "empty" });
      return;
    }

    const timer = setTimeout(() => {
      const res = checkHandleAvailable(handle, user?.uid);
      setHandleStatus(res);
    }, 250);

    return () => clearTimeout(timer);
  }, [handle, user?.uid]);

  if (!isOpen) return null;

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("O ficheiro selecionado tem de ser uma imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
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
      const updated = await updateProfile({
        displayName,
        handle: handle.replace(/^#/, "").toLowerCase().trim(),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-[500px] rounded-3xl border border-borderStrong bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-[20px] font-bold text-white">
            {t("profile.editProfile")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-surface2 hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[rgba(255,84,112,0.35)] bg-[rgba(255,84,112,0.12)] p-3 text-[13px] text-[#FF5470]">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Gestão de Foto / Avatar */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface2 p-4">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover border-2 border-accent"
                />
              ) : (
                <Avatar name={displayName || "Criador"} size={64} />
              )}
            </div>

            <div className="flex-1 min-w-[180px]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text hover:border-borderStrong hover:bg-surface"
                >
                  <Upload size={13} /> {t("profile.uploadAvatar")}
                </button>

                {user?.photoURL && (
                  <button
                    type="button"
                    onClick={handleRestoreGooglePhoto}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-muted hover:text-text"
                    title={t("profile.useGooglePhoto")}
                  >
                    <RefreshCw size={12} /> Google
                  </button>
                )}

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1 rounded-xl p-1.5 text-[#FF5470] hover:bg-black/20"
                    title={t("profile.removePhoto")}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Campo: Nome de Apresentação */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text">
              {t("profile.displayNameLabel")}
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ex: João Silva"
              required
              className="w-full rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] text-text outline-none focus:border-accent"
            />
          </div>

          {/* Campo: ID Único (#handle) */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-text">
              <span>{t("profile.handle")}</span>
              {handleStatus.checked && (
                <span
                  className={`text-[12px] font-bold ${
                    handleStatus.available ? "text-teal" : "text-[#FF5470]"
                  }`}
                >
                  {handleStatus.available
                    ? t("profile.handleAvailable")
                    : handleStatus.reason === "taken"
                    ? t("profile.handleTaken")
                    : t("profile.handleInvalid")}
                </span>
              )}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-mutedDim font-bold">#</span>
              <input
                value={handle}
                onChange={(e) =>
                  setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))
                }
                placeholder={t("profile.handlePlaceholder")}
                required
                className={`w-full rounded-xl border bg-surface2 py-2.5 pl-8 pr-4 text-[13.5px] font-medium text-text outline-none ${
                  handleStatus.available
                    ? "border-border focus:border-accent"
                    : "border-[#FF5470]/60"
                }`}
              />
            </div>
            <p className="mt-1 text-[11.5px] text-mutedDim">{t("profile.handleHelp")}</p>
          </div>

          {/* Campo: Biografia */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text">
              {t("profile.bioLabel")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 240))}
              rows={3}
              placeholder="Conta um pouco sobre as tuas paixões, jogos ou equipas favoritas…"
              className="w-full rounded-xl border border-border bg-surface2 p-3 text-[13.5px] text-text outline-none focus:border-accent"
            />
            <div className="mt-1 text-right text-[11px] text-mutedDim">
              {bio.length}/240
            </div>
          </div>

          {/* Zona de Perigo: Eliminar Conta e Dados */}
          <div className="mt-1 rounded-2xl border border-red-500/25 bg-red-500/5 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12.5px] font-bold text-red-400">
                  Zona de Perigo
                </div>
                <div className="text-[11.5px] text-mutedDim">
                  Eliminar permanentemente a tua conta e todos os teus dados.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[12px] font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
                <span>Eliminar Conta</span>
              </button>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-2 flex justify-end gap-2.5 border-t border-border pt-4">
            <GhostButton small onClick={onClose} disabled={saving}>
              {t("builder.cancel")}
            </GhostButton>
            <PrimaryButton
              small
              type="submit"
              disabled={saving || !handleStatus.available}
            >
              {saving ? "A guardar…" : t("profile.saveProfile")}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

