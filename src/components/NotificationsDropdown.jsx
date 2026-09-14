import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  CornerDownRight,
  AtSign,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "../services/db";
import { Avatar } from "./UI";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "agora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `há ${diffDays}d`;
  return date.toLocaleDateString();
}

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const loadNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const notifs = getUserNotifications(user.uid);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener("tierforge_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("tierforge_notifications_updated", handleUpdate);
    };
  }, [user]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleNotificationClick(notif) {
    markNotificationAsRead(notif.id);
    loadNotifications();
    setIsOpen(false);
    navigate(`/tier-list/${notif.tierListId}`);
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead(user.uid);
    loadNotifications();
  }

  function handleClearAll() {
    clearAllNotifications(user.uid);
    loadNotifications();
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case "reply":
        return <CornerDownRight size={12} className="text-teal" />;
      case "mention":
        return <AtSign size={12} className="text-amber-400" />;
      default:
        return <MessageCircle size={12} className="text-accent" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Sino */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:border-accent hover:text-white transition-all hover:scale-105"
        title="Notificações"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Flutuante */}
      {isOpen && (
        <div className="absolute right-0 top-[46px] z-50 w-80 sm:w-96 rounded-2xl border border-borderStrong bg-[#12131a] p-3 shadow-2xl backdrop-blur-xl animate-fadeIn">
          {/* Cabeçalho */}
          <div className="mb-2 flex items-center justify-between border-b border-border/80 px-2 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-[14px] font-bold text-white">
                Notificações
              </span>
              {unreadCount > 0 && (
                <span className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                  {unreadCount} novas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
              >
                <Check size={12} />
                <span>Marcar lidas</span>
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-mutedDim">
                <Bell size={24} className="mx-auto mb-2 opacity-30 text-muted" />
                <p>Não tens notificações no momento.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group flex items-start gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all ${
                    n.read
                      ? "bg-surface/50 hover:bg-surface2/60 text-muted"
                      : "bg-surface2 border border-accent/30 text-white hover:border-accent"
                  }`}
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <Avatar name={n.senderName} image={n.senderAvatar} size={30} />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#161622] border border-border">
                      {getNotifIcon(n.type)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 text-[12px] leading-snug">
                    <p className="line-clamp-2">
                      <strong className="text-white font-bold">
                        {n.senderName}
                      </strong>{" "}
                      {n.text}{" "}
                      <span className="text-accent italic font-medium">
                        &ldquo;{n.tierListTitle}&rdquo;
                      </span>
                    </p>
                    <span className="text-[10px] text-mutedDim mt-1 block">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rodapé com Limpar */}
          {notifications.length > 0 && (
            <div className="mt-2 border-t border-border/60 pt-2 px-2 flex justify-end">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[11px] font-medium text-mutedDim hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} />
                <span>Limpar histórico</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
