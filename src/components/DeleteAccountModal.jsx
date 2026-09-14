import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GhostButton } from "./UI";

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { user, profile, deleteAccount } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === "ELIMINAR";

  async function handleConfirmDelete() {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setErrorMsg("");

    try {
      await deleteAccount();
      onClose();
      alert("A tua conta e todos os teus dados foram permanentemente eliminados.");
      navigate("/");
    } catch (err) {
      console.error("Erro ao eliminar conta:", err);
      setErrorMsg("Ocorreu um erro ao eliminar a conta. Por favor tenta novamente.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-[500px] rounded-3xl border border-red-500/40 bg-[#121118] p-6 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-red-500/15 blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="mb-5 flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-display text-[19px] font-black text-white">
                Eliminar Conta
              </h3>
              <p className="text-[12px] font-semibold text-red-400">
                Ação irreversível e definitiva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl p-1.5 text-muted hover:bg-surface2 hover:text-text transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-[13px] text-red-400">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Corpo Informativo */}
        <div className="mb-5 flex flex-col gap-3 text-[13px] text-muted leading-relaxed">
          <p className="text-text font-medium">
            Tens a certeza que desejas eliminar a conta de{" "}
            <strong className="text-white">
              {profile?.displayName || user?.displayName || user?.email}
            </strong>{" "}
            (#{profile?.handle || "jogador"})?
          </p>

          <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-3.5 text-left">
            <div className="mb-2 font-bold text-red-300 text-[12px] uppercase tracking-wider">
              O que acontecerá permanentemente:
            </div>
            <ul className="flex flex-col gap-1.5 text-[12.5px] text-muted">
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Todas as tuas <strong>Tier Lists</strong> serão eliminadas.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Todos os teus <strong>votos e comentários</strong> serão removidos.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>O teu <strong>perfil, XP e conquistas</strong> serão apagados.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>O teu <strong>identificador #{profile?.handle}</strong> ficará disponível.</span>
              </li>
            </ul>
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-text">
              Para confirmar, digita <span className="font-bold text-red-400">ELIMINAR</span> no campo abaixo:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="ELIMINAR"
              disabled={isDeleting}
              className="w-full rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] font-bold text-white tracking-wider outline-none focus:border-red-500 transition-colors uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-mutedDim"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border/80 pt-4">
          <GhostButton small onClick={onClose} disabled={isDeleting}>
            {t("builder.cancel")}
          </GhostButton>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={!isConfirmed || isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-[13px] font-bold text-white shadow-lg transition-all hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
            <span>{isDeleting ? "A eliminar todos os dados…" : "Eliminar Conta e Dados"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

