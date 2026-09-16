import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Award,
  Sparkles,
  Layers,
  X,
  Bell,
} from "lucide-react";

/**
 * InSiteNotificationToast
 * Exibe notificações em tempo real DENTRO do website (in-site toast).
 * Não utiliza nem solicita permissões de notificações nativas do browser.
 */
export default function InSiteNotificationToast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handleNotificationEvent(e) {
      const detail = e.detail;
      if (!detail || !detail.newNotification || !detail.notif) return;
      if (!user || detail.recipientUid !== user.uid) return;

      const notif = detail.notif;
      const toastId = notif.id || `toast-${Date.now()}-${Math.random()}`;

      const newToast = {
        id: toastId,
        title: notif.actorName || "TierWorld",
        actorAvatar: notif.actorAvatar,
        text: notif.text || notif.message || "Nova atividade na tua conta",
        type: notif.type || "general",
        link: notif.link || (notif.tierListId ? `/tier-list/${notif.tierListId}` : null),
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

      // Auto-remover após 6 segundos
      setTimeout(() => {
        removeToast(toastId);
      }, 6000);
    }

    window.addEventListener("tierforge_notifications_updated", handleNotificationEvent);
    window.addEventListener("tierworld_notifications_updated", handleNotificationEvent);

    return () => {
      window.removeEventListener("tierforge_notifications_updated", handleNotificationEvent);
      window.removeEventListener("tierworld_notifications_updated", handleNotificationEvent);
    };
  }, [user, removeToast]);

  if (toasts.length === 0) return null;

  function getIcon(type) {
    switch (type) {
      case "like":
      case "tierlist_like":
        return <Heart size={14} className="text-[#FF5470] fill-[#FF5470]" />;
      case "comment":
      case "comment_reply":
      case "mention":
        return <MessageCircle size={14} className="text-[#7C5CFF] fill-[#7C5CFF]/20" />;
      case "follow":
        return <UserPlus size={14} className="text-[#00E5A3]" />;
      case "badge":
      case "achievement":
        return <Award size={14} className="text-[#FFD166]" />;
      default:
        return <Bell size={14} className="text-[#7C5CFF]" />;
    }
  }

  return (
    <aside
      aria-label="Notificações do site"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[380px] w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => {
            if (toast.link) {
              navigate(toast.link);
              removeToast(toast.id);
            }
          }}
          className="pointer-events-auto flex items-start gap-3.5 p-3.5 rounded-2xl border border-white/[0.12] bg-[#0E0F18]/95 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(124,92,255,0.15)] backdrop-blur-xl transition-all duration-300 animate-slideUp cursor-pointer hover:border-accent/60 group"
        >
          {/* Avatar ou Ícone */}
          <div className="relative flex-shrink-0">
            {toast.actorAvatar ? (
              <img
                src={toast.actorAvatar}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]"
              />
            ) : (
              <Avatar name={toast.title} size={40} />
            )}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#131422] border border-white/[0.1] shadow-sm">
              {getIcon(toast.type)}
            </span>
          </div>

          {/* Conteúdo da Notificação */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[13px] font-bold text-white truncate group-hover:text-accent transition-colors">
                {toast.title}
              </span>
              <span className="text-[10px] text-mutedDim flex-shrink-0">agora</span>
            </div>
            <p className="text-[12.5px] leading-snug text-muted line-clamp-2">
              {toast.text}
            </p>
          </div>

          {/* Botão Fechar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="flex-shrink-0 text-mutedDim hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </aside>
  );
}

