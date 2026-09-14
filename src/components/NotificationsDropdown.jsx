import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  MessageCircle,
  CornerDownRight,
  AtSign,
  Check,
  Trash2,
  Heart,
  ThumbsUp,
  TrendingUp,
  UserPlus,
  Repeat,
  Sliders,
  X,
  Volume2,
  VolumeX,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  setNotificationMute,
  unmuteNotifications,
  isUserMuted,
} from "../services/db";
import { Avatar } from "./UI";

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Tom 1 (520Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(520, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Tom 2 (660Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, now + 0.08);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch (e) {
    // Pode falhar se o utilizador ainda não interagiu com a página
  }
}

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'mentions'
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const dropdownRef = useRef(null);

  const loadData = () => {
    if (!user) {
      setNotifications([]);
      setSettings(null);
      return;
    }
    const notifs = getUserNotifications(user.uid);
    const sett = getNotificationSettings(user.uid);
    setNotifications(notifs);
    setSettings(sett);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = (e) => {
      loadData();
      if (e.detail?.newNotification && settings?.soundEnabled && !isUserMuted(user?.uid)) {
        playNotificationSound();
      }
    };

    window.addEventListener("tierforge_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("tierforge_notifications_updated", handleUpdate);
    };
  }, [user, settings?.soundEnabled]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSettingsOpen(false);
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

  const isMuted = isUserMuted(user.uid);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const mentionsCount = notifications.filter((n) => n.type === "mention").length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "mentions") return n.type === "mention";
    return true;
  });

  function handleNotificationClick(notif) {
    markNotificationAsRead(notif.id);
    loadData();
    setIsOpen(false);
    if (notif.tierListId) {
      navigate(`/tier-list/${notif.tierListId}`);
    } else if (notif.type === "new_follower" && notif.senderHandle) {
      navigate(`/profile/${notif.senderHandle}`);
    }
  }

  function handleDeleteSingle(e, notifId) {
    e.stopPropagation();
    deleteNotification(notifId);
    loadData();
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead(user.uid);
    loadData();
  }

  function handleClearAll() {
    clearAllNotifications(user.uid);
    loadData();
  }

  function handleMuteDuration(durationMs, forever = false) {
    setNotificationMute(user.uid, { durationMs, forever });
    loadData();
  }

  function handleUnmute() {
    unmuteNotifications(user.uid);
    loadData();
  }

  function handleToggleCategory(catKey) {
    if (!settings) return;
    const current = settings.categories || {};
    const updated = updateNotificationSettings(user.uid, {
      categories: {
        ...current,
        [catKey]: !current[catKey],
      },
    });
    setSettings(updated);
  }

  function handleToggleSound() {
    if (!settings) return;
    const updated = updateNotificationSettings(user.uid, {
      soundEnabled: !settings.soundEnabled,
    });
    setSettings(updated);
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case "list_like":
        return <Heart size={12} className="text-[#FF5470] fill-[#FF5470]" />;
      case "comment_like":
        return <ThumbsUp size={12} className="text-teal fill-teal" />;
      case "view_milestone":
        return <TrendingUp size={12} className="text-amber-400" />;
      case "new_follower":
        return <UserPlus size={12} className="text-purple-400" />;
      case "remix":
        return <Repeat size={12} className="text-blue-400" />;
      case "reply":
        return <CornerDownRight size={12} className="text-teal" />;
      case "mention":
        return <AtSign size={12} className="text-amber-400" />;
      default:
        return <MessageCircle size={12} className="text-accent" />;
    }
  };

  const getMuteTimeString = () => {
    if (!settings) return "";
    if (settings.mutedForever) return "Para sempre";
    if (settings.mutedUntil) {
      const date = new Date(settings.mutedUntil);
      return `até ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return "";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Sino na Navbar */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSettingsOpen(false);
        }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:scale-105 ${
          isMuted
            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
            : "border-border bg-surface text-muted hover:border-accent hover:text-white"
        }`}
        title={isMuted ? `Notificações Silenciadas (${getMuteTimeString()})` : "Notificações"}
      >
        {isMuted ? <BellOff size={16} /> : <Bell size={17} />}
        {unreadCount > 0 && !isMuted && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Principal */}
      {isOpen && (
        <div className="absolute right-0 top-[46px] z-50 w-80 sm:w-[400px] rounded-2xl border border-borderStrong bg-[#12131a] p-3 shadow-2xl backdrop-blur-xl animate-fadeIn">
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

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                  title="Marcar todas como lidas"
                >
                  <Check size={12} />
                  <span className="hidden sm:inline">Marcar lidas</span>
                </button>
              )}

              {/* Botão de Definições / Silêncio */}
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={`rounded-lg p-1.5 transition-colors ${
                  settingsOpen || isMuted
                    ? "bg-accent/20 text-accent"
                    : "text-mutedDim hover:bg-surface2 hover:text-white"
                }`}
                title="Configurar e Silenciar Notificações"
              >
                <Sliders size={14} />
              </button>
            </div>
          </div>

          {/* Banner de Silenciado se estiver ativo */}
          {isMuted && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
              <div className="flex items-center gap-1.5">
                <BellOff size={13} />
                <span>Silenciado ({getMuteTimeString()})</span>
              </div>
              <button
                type="button"
                onClick={handleUnmute}
                className="font-bold underline hover:text-white"
              >
                Reativar
              </button>
            </div>
          )}

          {/* Painel de Definições e Silenciamento */}
          {settingsOpen ? (
            <div className="rounded-xl border border-border/80 bg-surface p-3 animate-fadeIn text-xs">
              <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Silenciar Notificações
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="text-muted hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Opções de Duração de Silêncio */}
              <div className="grid grid-cols-2 gap-1.5 mb-3.5">
                <button
                  type="button"
                  onClick={() => handleMuteDuration(60 * 60 * 1000)}
                  className="rounded-lg border border-border bg-surface2 px-2 py-1.5 text-center font-medium text-text hover:border-accent hover:text-white transition-colors"
                >
                  1 hora
                </button>
                <button
                  type="button"
                  onClick={() => handleMuteDuration(8 * 60 * 60 * 1000)}
                  className="rounded-lg border border-border bg-surface2 px-2 py-1.5 text-center font-medium text-text hover:border-accent hover:text-white transition-colors"
                >
                  8 horas
                </button>
                <button
                  type="button"
                  onClick={() => handleMuteDuration(24 * 60 * 60 * 1000)}
                  className="rounded-lg border border-border bg-surface2 px-2 py-1.5 text-center font-medium text-text hover:border-accent hover:text-white transition-colors"
                >
                  24 horas
                </button>
                <button
                  type="button"
                  onClick={() => handleMuteDuration(7 * 24 * 60 * 60 * 1000)}
                  className="rounded-lg border border-border bg-surface2 px-2 py-1.5 text-center font-medium text-text hover:border-accent hover:text-white transition-colors"
                >
                  7 dias
                </button>
                <button
                  type="button"
                  onClick={() => handleMuteDuration(null, true)}
                  className="col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-center font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Silenciar para sempre
                </button>
                {isMuted && (
                  <button
                    type="button"
                    onClick={handleUnmute}
                    className="col-span-2 rounded-lg bg-accent px-2 py-1.5 text-center font-bold text-black hover:opacity-90 shadow-sm mt-1"
                  >
                    ✓ Reativar Notificações Agora
                  </button>
                )}
              </div>

              {/* Toggles Granulares de Categorias */}
              <div className="border-t border-border/60 pt-2.5">
                <div className="mb-2 font-bold text-white uppercase tracking-wider text-[11px]">
                  O que receber
                </div>

                <div className="flex flex-col gap-1.5 text-[12px] text-muted">
                  {[
                    { key: "comments", label: "Comentários e Respostas" },
                    { key: "mentions", label: "Menções com @handle" },
                    { key: "likes", label: "Gostos recebidos (Likes)" },
                    { key: "followers", label: "Novos Seguidores" },
                    { key: "remixes", label: "Remixes da tua Tier List" },
                    { key: "views", label: "Marcos de Visualizações" },
                  ].map((cat) => {
                    const isEnabled = settings?.categories?.[cat.key] !== false;
                    return (
                      <label
                        key={cat.key}
                        className="flex items-center justify-between py-0.5 cursor-pointer hover:text-white"
                      >
                        <span>{cat.label}</span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleCategory(cat.key)}
                          className="rounded accent-accent h-3.5 w-3.5"
                        />
                      </label>
                    );
                  })}

                  <label className="flex items-center justify-between py-1 border-t border-border/40 mt-1 cursor-pointer hover:text-white font-medium text-text">
                    <span className="flex items-center gap-1.5">
                      {settings?.soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      <span>Som de notificação discreto</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings?.soundEnabled)}
                      onChange={handleToggleSound}
                      className="rounded accent-accent h-3.5 w-3.5"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs de Filtro */}
              <div className="mb-2 flex items-center gap-1.5 border-b border-border/50 px-1 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition-colors ${
                    activeTab === "all"
                      ? "bg-surface2 text-white"
                      : "text-mutedDim hover:text-text"
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition-colors ${
                    activeTab === "unread"
                      ? "bg-surface2 text-white"
                      : "text-mutedDim hover:text-text"
                  }`}
                >
                  Não lidas ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("mentions")}
                  className={`rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition-colors ${
                    activeTab === "mentions"
                      ? "bg-surface2 text-white"
                      : "text-mutedDim hover:text-text"
                  }`}
                >
                  Menções ({mentionsCount})
                </button>
              </div>

              {/* Lista de Notificações */}
              <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-mutedDim">
                    <Bell size={24} className="mx-auto mb-2 opacity-30 text-muted" />
                    <p>
                      {activeTab === "unread"
                        ? "Todas as notificações já foram lidas! 🎉"
                        : activeTab === "mentions"
                        ? "Nenhuma menção encontrada."
                        : "Não tens notificações no momento."}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative flex items-start gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all ${
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

                      <div className="flex-1 min-w-0 text-[12px] leading-snug pr-5">
                        <p className="line-clamp-2">
                          <strong className="text-white font-bold">
                            {n.senderName}
                          </strong>{" "}
                          {n.text}{" "}
                          {n.tierListTitle && (
                            <span className="text-accent italic font-medium">
                              &ldquo;{n.tierListTitle}&rdquo;
                            </span>
                          )}
                        </p>
                        <span className="text-[10px] text-mutedDim mt-1 block">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      {/* Botão de eliminar individual no hover */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(e, n.id)}
                        className="absolute right-2 top-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-md bg-black/70 text-mutedDim hover:text-red-400 transition-colors"
                        title="Eliminar notificação"
                      >
                        <X size={11} />
                      </button>

                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Rodapé com Limpar */}
              {notifications.length > 0 && (
                <div className="mt-2 border-t border-border/60 pt-2 px-2 flex justify-between items-center text-[11px]">
                  <span className="text-mutedDim">
                    {notifications.length} {notifications.length === 1 ? "notificação" : "notificações"}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center gap-1 font-medium text-mutedDim hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={11} />
                    <span>Limpar histórico</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
