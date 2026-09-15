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
  Sparkles,
  CheckCheck,
  ShieldCheck,
  Layers,
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

    // Tom 1 harmónico (520Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(520, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tom 2 harmónico (680Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(680, now + 0.08);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.32);
  } catch (e) {
    // Falha silenciosa se ainda não houve interação na página
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return "agora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
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
    window.addEventListener("tierworld_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("tierforge_notifications_updated", handleUpdate);
      window.removeEventListener("tierworld_notifications_updated", handleUpdate);
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
      case "tierlist_like":
        return <Heart size={11} className="text-[#FF5470] fill-[#FF5470]" />;
      case "comment_like":
        return <ThumbsUp size={11} className="text-[#00E5A3] fill-[#00E5A3]" />;
      case "view_milestone":
        return <TrendingUp size={11} className="text-[#FFD166]" />;
      case "new_follower":
        return <UserPlus size={11} className="text-[#7C5CFF]" />;
      case "remix":
        return <Repeat size={11} className="text-[#38B6FF]" />;
      case "reply":
        return <CornerDownRight size={11} className="text-[#00E5A3]" />;
      case "mention":
        return <AtSign size={11} className="text-[#FFD166]" />;
      default:
        return <MessageCircle size={11} className="text-[#7C5CFF]" />;
    }
  };

  const getMuteTimeString = () => {
    if (!settings) return "";
    if (settings.mutedForever) return "Para sempre";
    if (settings.mutedUntil) {
      const date = new Date(settings.mutedUntil);
      return `até às ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return "";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Sino na Barra Superior */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSettingsOpen(false);
        }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
          isOpen
            ? "border-accent bg-accent/20 text-white shadow-[0_0_16px_rgba(124,92,255,0.4)]"
            : isMuted
            ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:border-amber-500/50"
            : "border-white/[0.1] bg-[#141522] text-muted hover:border-white/20 hover:text-white hover:bg-[#1D1E30]"
        }`}
        title={isMuted ? `Notificações Silenciadas (${getMuteTimeString()})` : "Notificações do Site"}
        aria-label="Abrir notificações"
      >
        {isMuted ? (
          <BellOff size={17} className="transition-transform hover:rotate-12" />
        ) : (
          <Bell size={17} className="transition-transform hover:rotate-12" />
        )}

        {/* Badge Indicador de Novas Notificações */}
        {unreadCount > 0 && !isMuted && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[17px] items-center justify-center rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#FF5470] px-1 text-[10px] font-black text-white shadow-glow animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Painel Dropdown Principal */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 sm:w-[410px] overflow-hidden rounded-3xl border border-borderStrong bg-[#0F1017]/95 p-3.5 shadow-2xl backdrop-blur-2xl animate-fadeIn">
          {/* Cabeçalho do Painel */}
          <div className="mb-3 flex items-center justify-between border-b border-border/70 px-1 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accentSoft text-accent">
                <Bell size={14} />
              </div>
              <span className="font-display text-[15px] font-bold text-white tracking-tight">
                Notificações
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-accentSoft border border-accent/30 px-2 py-0.5 text-[10.5px] font-bold text-[#C2B5FF]">
                  {unreadCount} novas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-accent hover:bg-accentSoft transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={13} />
                  <span className="hidden sm:inline">Marcar lidas</span>
                </button>
              )}

              {/* Botão de Definições / Silenciar */}
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={`rounded-xl p-1.5 transition-all ${
                  settingsOpen || isMuted
                    ? "bg-accentSoft text-accent border border-accent/30 shadow-sm"
                    : "text-muted hover:bg-surface2 hover:text-white"
                }`}
                title="Configurar Notificações & Silêncio"
              >
                <Sliders size={15} />
              </button>
            </div>
          </div>

          {/* Banner de Aviso de Silêncio */}
          {isMuted && (
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-2.5 px-3 text-[12px] font-medium text-amber-300">
              <div className="flex items-center gap-2">
                <BellOff size={14} className="text-amber-400 flex-shrink-0" />
                <span className="truncate">Silenciado ({getMuteTimeString()})</span>
              </div>
              <button
                type="button"
                onClick={handleUnmute}
                className="font-bold underline hover:text-white text-xs ml-2"
              >
                Reativar
              </button>
            </div>
          )}

          {/* Painel de Preferências & Silenciamento */}
          {settingsOpen ? (
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-3.5 animate-fadeIn text-[12.5px]">
              <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-display font-bold text-white text-[12px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-accent" />
                  Silenciar Alertas
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="rounded-lg p-1 text-mutedDim hover:bg-surface2 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Opções de Duração do Silêncio */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                {[
                  { label: "1 hora", ms: 60 * 60 * 1000 },
                  { label: "8 horas", ms: 8 * 60 * 60 * 1000 },
                  { label: "24 horas", ms: 24 * 60 * 60 * 1000 },
                  { label: "7 dias", ms: 7 * 24 * 60 * 60 * 1000 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleMuteDuration(opt.ms)}
                    className="rounded-xl border border-border bg-surface2/60 px-2.5 py-1.5 text-center font-medium text-text hover:border-accent hover:bg-surface2 hover:text-white transition-all text-xs"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleMuteDuration(null, true)}
                  className="col-span-2 rounded-xl border border-[#FF5470]/30 bg-[#FF5470]/10 px-3 py-2 text-center font-bold text-[#FF5470] hover:bg-[#FF5470]/20 transition-all text-xs"
                >
                  Silenciar para sempre
                </button>
                {isMuted && (
                  <button
                    type="button"
                    onClick={handleUnmute}
                    className="col-span-2 rounded-xl bg-accent px-3 py-2 text-center font-bold text-black hover:opacity-90 shadow-glow text-xs"
                  >
                    ✓ Reativar Notificações Agora
                  </button>
                )}
              </div>

              {/* Toggles de Categorias */}
              <div className="border-t border-border/60 pt-3">
                <div className="mb-2 font-display font-bold text-white text-[11px] uppercase tracking-wider">
                  Tipos de Notificação
                </div>

                <div className="flex flex-col gap-2 text-[12px] text-muted">
                  {[
                    { key: "comments", label: "Comentários e Respostas" },
                    { key: "mentions", label: "Menções com @handle" },
                    { key: "likes", label: "Gostos recebidos (Likes)" },
                    { key: "followers", label: "Novos Seguidores" },
                    { key: "remixes", label: "Remixes das tuas Tier Lists" },
                    { key: "views", label: "Marcos de Visualizações" },
                  ].map((cat) => {
                    const isEnabled = settings?.categories?.[cat.key] !== false;
                    return (
                      <label
                        key={cat.key}
                        className="flex items-center justify-between py-0.5 cursor-pointer hover:text-white select-none transition-colors"
                      >
                        <span>{cat.label}</span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleCategory(cat.key)}
                          className="h-4 w-4 rounded accent-accent cursor-pointer"
                        />
                      </label>
                    );
                  })}

                  <label className="flex items-center justify-between py-2 border-t border-border/60 mt-1 cursor-pointer hover:text-white font-medium text-text select-none">
                    <span className="flex items-center gap-2">
                      {settings?.soundEnabled ? (
                        <Volume2 size={14} className="text-[#00E5A3]" />
                      ) : (
                        <VolumeX size={14} className="text-mutedDim" />
                      )}
                      <span>Sons discretos de notificação</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings?.soundEnabled)}
                      onChange={handleToggleSound}
                      className="h-4 w-4 rounded accent-accent cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Pílula Segmentada de Filtros (Tabs) */}
              <div className="mb-3 flex items-center gap-1 rounded-2xl border border-border/50 bg-surface2/60 p-1 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 rounded-xl py-1 text-center text-[12px] font-medium transition-all ${
                    activeTab === "all"
                      ? "bg-accent/15 text-white font-bold border border-accent/30 shadow-sm"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`flex-1 rounded-xl py-1 text-center text-[12px] font-medium transition-all ${
                    activeTab === "unread"
                      ? "bg-accent/15 text-white font-bold border border-accent/30 shadow-sm"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Não lidas ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("mentions")}
                  className={`flex-1 rounded-xl py-1 text-center text-[12px] font-medium transition-all ${
                    activeTab === "mentions"
                      ? "bg-accent/15 text-white font-bold border border-accent/30 shadow-sm"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Menções ({mentionsCount})
                </button>
              </div>

              {/* Lista com Rolagem Suave */}
              <div className="max-h-[340px] overflow-y-auto flex flex-col gap-2 pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-mutedDim">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2/70 border border-border/70 text-muted">
                      <Sparkles size={22} className="text-accent/60" />
                    </div>
                    <p className="font-semibold text-text text-[13px] mb-1">
                      {activeTab === "unread"
                        ? "Estás totalmente em dia! 🎉"
                        : activeTab === "mentions"
                        ? "Nenhuma menção encontrada"
                        : "Sem notificações recentes"}
                    </p>
                    <p className="text-[11.5px] text-mutedDim max-w-[240px] mx-auto">
                      {activeTab === "unread"
                        ? "Todas as notificações já foram lidas."
                        : "As novidades, gostos e comentários da tua conta surgirão aqui."}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative flex items-start gap-3 rounded-2xl p-3 cursor-pointer transition-all duration-200 border ${
                        n.read
                          ? "bg-surface/40 hover:bg-surface2/80 border-transparent hover:border-border/80 text-muted"
                          : "bg-gradient-to-r from-accentSoft/25 to-surface2 border-accent/40 text-white shadow-sm hover:border-accent"
                      }`}
                    >
                      {/* Avatar com Badge do Tipo */}
                      <div className="relative flex-shrink-0 mt-0.5">
                        <Avatar name={n.senderName || "Criador"} image={n.senderAvatar} size={34} />
                        <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#12131A] border border-borderStrong shadow-sm p-0.5">
                          {getNotifIcon(n.type)}
                        </span>
                      </div>

                      {/* Conteúdo da Notificação */}
                      <div className="flex-1 min-w-0 text-[12.5px] leading-snug pr-5">
                        <p className="line-clamp-2">
                          <strong className="text-white font-bold">
                            {n.senderName || "Alguém"}
                          </strong>{" "}
                          <span className={n.read ? "text-muted" : "text-text"}>
                            {n.text}
                          </span>{" "}
                          {n.tierListTitle && (
                            <span className="text-accent italic font-semibold">
                              &ldquo;{n.tierListTitle}&rdquo;
                            </span>
                          )}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-mutedDim">
                          <Clock size={10} />
                          <span>{formatRelativeTime(n.createdAt)}</span>
                        </div>
                      </div>

                      {/* Botão de Excluir Notificação no Hover */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(e, n.id)}
                        className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg bg-surface2 text-mutedDim hover:text-[#FF5470] hover:bg-[#FF5470]/10 transition-all"
                        title="Remover notificação"
                      >
                        <X size={12} />
                      </button>

                      {/* Ponto Indicador Não Lido */}
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-2 shadow-glow" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Rodapé com Contador e Botão de Limpar */}
              {notifications.length > 0 && (
                <div className="mt-3 border-t border-border/70 pt-2.5 px-1 flex justify-between items-center text-[11.5px]">
                  <span className="text-mutedDim">
                    {notifications.length} {notifications.length === 1 ? "notificação" : "notificações"} no histórico
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 font-medium text-mutedDim hover:text-[#FF5470] transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Limpar tudo</span>
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
