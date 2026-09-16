import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Crown,
  Plus,
  Settings,
  Share2,
  UserPlus,
  UserCheck,
  Lock,
  Calendar,
  Layers,
  Heart,
  Eye,
  ArrowLeft,
  Check,
  Copy,
  Sparkles,
  Trophy,
  Zap,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Award,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import useRealtimeDb from "../hooks/useRealtimeDb";
import { Avatar, Badge, EmptyState, PrimaryButton, GhostButton } from "../components/UI";
import TierListCard from "../components/TierListCard";
import ProfileEditModal from "../components/ProfileEditModal";
import ShareModal from "../components/ShareModal";
import FollowersModal from "../components/FollowersModal";
import AuthRequiredModal from "../components/AuthRequiredModal";
import {
  getUserByHandle,
  getUserByUid,
  getUserTierLists,
  toggleFollowUser,
} from "../services/db";
import { calculateUserBadges, getCreatorLevelInfo } from "../services/badges";
import { updatePageMeta } from "../services/seo";

export default function Profile() {
  const { handle: paramHandle } = useParams();
  const { user, profile: authProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Created");

  // Filtros internos dentro do perfil
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "votes" | "views" | "alpha"

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState("followers");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Determina se o utilizador está a ver o seu próprio perfil
  const isOwnProfile =
    !paramHandle ||
    (authProfile && authProfile.handle?.toLowerCase() === paramHandle.toLowerCase()) ||
    (user && user.uid === paramHandle);

  const loadProfile = useCallback(async (overrideHandle = null) => {
    const handleToQuery = overrideHandle || paramHandle;
    try {
      let foundUser = null;
      if (handleToQuery) {
        foundUser = (await getUserByHandle(handleToQuery)) || (await getUserByUid(handleToQuery));
        // Se for o próprio criador autenticado e o handle tiver sido recentemente alterado, recupera com segurança pelo UID
        if (!foundUser && (user || authProfile)) {
          const myUid = user?.uid || authProfile?.uid;
          if (myUid) {
            const selfUser = await getUserByUid(myUid);
            if (selfUser) {
              foundUser = selfUser;
            }
          }
        }
      } else if (user || authProfile) {
        const myUid = user?.uid || authProfile?.uid;
        if (myUid) {
          foundUser = await getUserByUid(myUid);
        }
      }

      setTargetUser(foundUser);

      if (foundUser) {
        const userLists = await getUserTierLists(foundUser.uid, isOwnProfile);
        setLists(userLists);

        if (user && foundUser.followers) {
          setIsFollowing(foundUser.followers.includes(user.uid));
        }

        const handleStr = foundUser.handle ? `@${foundUser.handle}` : "";
        const desc = foundUser.bio?.trim()
          ? `${foundUser.bio.trim()} • Confere as ${userLists.length} Tier Lists e classificações de ${foundUser.displayName} no TierWorld!`
          : `Explora o perfil de ${foundUser.displayName}${handleStr ? ` (${handleStr})` : ""} no TierWorld com ${userLists.length} Tier Lists criadas pela comunidade.`;

        updatePageMeta({
          title: `Perfil de ${foundUser.displayName}${handleStr ? ` (${handleStr})` : ""}`,
          description: desc,
          image: foundUser.avatar || null,
        });
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }, [paramHandle, user, authProfile, isOwnProfile]);

  // Sincronização ao segundo em tempo real do perfil, listas e métricas
  useRealtimeDb(() => {
    loadProfile();
  }, [loadProfile]);

  function handleFollowToggle() {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!targetUser || isOwnProfile) return;

    const nowFollowing = toggleFollowUser(user.uid, targetUser.uid);
    setIsFollowing(nowFollowing);

    // Atualiza contagem local de seguidores
    setTargetUser((prev) => {
      if (!prev) return prev;
      const currentFollowers = new Set(prev.followers || []);
      if (nowFollowing) {
        currentFollowers.add(user.uid);
      } else {
        currentFollowers.delete(user.uid);
      }
      return {
        ...prev,
        followers: Array.from(currentFollowers),
        followersCount: currentFollowers.size,
      };
    });
  }

  const handleShareProfile = () => {
    if (!targetUser) return;
    setShareModalOpen(true);
  };

  const handleCopyHandle = async () => {
    if (!targetUser?.handle) return;
    try {
      await navigator.clipboard.writeText(`@${targetUser.handle}`);
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 2000);
    } catch {
      // Ignora erro de cópia
    }
  };

  const publicLists = useMemo(
    () => lists.filter((l) => l.visibility !== "private"),
    [lists]
  );
  const privateLists = useMemo(
    () => lists.filter((l) => l.visibility === "private"),
    [lists]
  );

  const totalReceivedVotes = useMemo(
    () => lists.reduce((acc, l) => acc + (l.votes || 0), 0),
    [lists]
  );
  const totalReceivedViews = useMemo(
    () => lists.reduce((acc, l) => acc + (l.views || 0), 0),
    [lists]
  );

  const formattedJoinDate = targetUser?.createdAt
    ? new Date(targetUser.createdAt).toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      })
    : "Janeiro de 2026";

  const userBadges = targetUser
    ? calculateUserBadges({ userLists: lists, userData: targetUser })
    : [];

  const levelInfo = getCreatorLevelInfo(targetUser?.creatorXp || 0);

  // Filtragem e Ordenação da Tab selecionada
  const displayedLists = useMemo(() => {
    let base = tab === "Private" && isOwnProfile ? privateLists : publicLists;

    // Filtro por termo de pesquisa
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      base = base.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.category?.toLowerCase().includes(q) ||
          l.subcategory?.toLowerCase().includes(q)
      );
    }

    // Ordenação
    const sorted = [...base];
    if (sortBy === "votes") {
      sorted.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (sortBy === "views") {
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "alpha") {
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      // recent
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return sorted;
  }, [tab, isOwnProfile, privateLists, publicLists, searchFilter, sortBy]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1140px] px-6 py-32 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-accent animate-pulse mb-4">
          <Sparkles size={24} />
        </div>
        <div className="text-[15px] font-semibold text-muted">A carregar perfil de criador…</div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="mx-auto max-w-[620px] px-6 py-28 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface2 text-mutedDim border border-border">
          <UserPlus size={28} />
        </div>
        <h2 className="mb-2 font-display text-[26px] font-black text-white">
          {t("profile.userNotFound")}
        </h2>
        <p className="mb-6 text-[14px] text-muted leading-relaxed">
          Não foi possível encontrar nenhum criador com o identificador #{paramHandle}. Verifica se o nome de utilizador foi escrito corretamente.
        </p>
        <Link to="/explore">
          <PrimaryButton icon={ArrowLeft}>{t("tierListView.backToExplore")}</PrimaryButton>
        </Link>
      </div>
    );
  }

  const handleDisplay = targetUser.handle ? `@${targetUser.handle}` : "";

  return (
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6 pb-28 pt-6 sm:pt-8 animate-fade-in">
      {/* =========================================================
          1. PRESTIGE COVER BANNER & GLOW AMBIENCE
         ========================================================= */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12121c] via-[#0e0e16] to-[#09090d] p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient background mesh */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-[90px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-24 h-80 w-80 rounded-full bg-teal/15 blur-[80px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
          {/* Avatar e Detalhes do Perfil */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
            {/* Avatar com Anel Gradiente e Botão de Editar Rápido */}
            <div className="relative group/avatar flex-shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent via-purple-500 to-teal opacity-75 blur-sm group-hover/avatar:opacity-100 transition-opacity" />
              <div className="relative rounded-full ring-4 ring-[#09090D] overflow-hidden bg-surface2">
                <Avatar
                  name={targetUser.displayName}
                  image={targetUser.avatar}
                  size={104}
                />
              </div>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-lg ring-2 ring-[#09090D] hover:scale-110 hover:bg-accent/90 transition-transform"
                  title="Alterar avatar / perfil"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>

            {/* Informações Textuais */}
            <div className="flex-1 min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                <h1 className="truncate font-display text-[26px] sm:text-[34px] font-black text-white leading-tight">
                  {targetUser.displayName}
                </h1>

                {/* Badge de Prestígio */}
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accentSoft/70 px-3 py-1 text-xs font-bold text-accent shadow-sm">
                  <Crown size={13} className="text-accent" />
                  <span>{targetUser.badges?.[0] || levelInfo.name}</span>
                </span>
              </div>

              {/* Handle & Data de Entrada */}
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                {handleDisplay && (
                  <button
                    type="button"
                    onClick={handleCopyHandle}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-bold text-accent hover:border-accent/40 hover:bg-surface2 transition-all"
                    title="Copiar nome de utilizador"
                  >
                    <span>{handleDisplay}</span>
                    {copiedHandle ? (
                      <Check size={12} className="text-teal stroke-[3]" />
                    ) : (
                      <Copy size={12} className="text-mutedDim group-hover:text-white" />
                    )}
                  </button>
                )}

                <div className="flex items-center gap-1.5 font-medium text-mutedDim">
                  <Calendar size={13} className="text-muted" />
                  <span>{t("profile.memberSince", { date: formattedJoinDate })}</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 font-semibold text-mutedDim">
                  <ShieldCheck size={13} className="text-teal" />
                  <span>Conta Verificada</span>
                </div>
              </div>

              {/* Bio do Criador */}
              <p className="max-w-xl text-[13.5px] leading-relaxed text-muted font-normal">
                {targetUser.bio || t("profile.bioPlaceholder")}
              </p>
            </div>
          </div>

          {/* Botões de Ação do Topo (Seguir / Editar / Partilhar / Criar) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
            {/* Partilhar Perfil */}
            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#131422] px-4 text-[13px] font-bold text-text hover:bg-[#18192A] hover:border-white/20 hover:text-white transition-all shadow-sm active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check size={15} className="text-teal stroke-[3]" />
                  <span className="text-teal">{t("profile.linkCopied")}</span>
                </>
              ) : (
                <>
                  <Share2 size={15} className="text-accent" />
                  <span>{t("profile.shareProfile")}</span>
                </>
              )}
            </button>

            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#131422] px-4 text-[13px] font-bold text-text hover:bg-[#18192A] hover:border-white/20 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Settings size={15} className="text-mutedDim" />
                  <span>{t("profile.editProfile")}</span>
                </button>

                <Link
                  to="/create"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] px-4 text-[13px] font-bold text-white shadow-[0_0_18px_rgba(124,92,255,0.35)] hover:from-[#8B6EFA] hover:to-[#7954F5] hover:shadow-[0_0_24px_rgba(124,92,255,0.55)] transition-all active:scale-95 border border-white/15"
                >
                  <Plus size={16} />
                  <span>{t("nav.create")}</span>
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleFollowToggle}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all shadow-md active:scale-95 ${
                  isFollowing
                    ? "border border-white/[0.08] bg-[#131422] text-muted hover:border-red-500/40 hover:text-red-400 hover:bg-[#18192A]"
                    : "bg-accent text-white hover:bg-accent/90 shadow-glow"
                }`}
              >
                {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                <span>{isFollowing ? t("profile.followingBtn") : t("profile.follow")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso XP & Nível de Criador */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{levelInfo.icon}</span>
              <span className="font-display text-xs sm:text-sm font-black text-white tracking-wide">
                Nível: {levelInfo.name}
              </span>
              <span className="rounded-full bg-accentSoft px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/30">
                {levelInfo.rank}
              </span>
            </div>

            <div className="text-xs font-semibold text-mutedDim">
              <span className="font-bold text-accent">{targetUser.creatorXp ?? 0} XP</span>
              {levelInfo.nextLevel && (
                <span> / {levelInfo.nextLevel.minXp} XP para {levelInfo.nextLevel.name}</span>
              )}
            </div>
          </div>

          {/* Barra de progresso visual */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface2 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-purple-500 to-teal transition-all duration-700 shadow-glow"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          2. BENTO GRID DE PERFORMANCE & MÉTRICAS (6 CARDS)
         ========================================================= */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Tier Lists Criadas */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#131422] p-4 sm:p-5 transition-all hover:border-white/20 hover:bg-[#18192A] hover:-translate-y-0.5 shadow-sm group">
          <div className="mb-2 flex items-center justify-between text-mutedDim">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tier Lists</span>
            <Layers size={16} className="text-accent group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-display text-[24px] sm:text-[28px] font-black text-white leading-none mb-1">
            {lists.length}
          </div>
          <div className="text-[11px] font-medium text-mutedDim">
            {publicLists.length} públicas {privateLists.length > 0 && `• ${privateLists.length} priv.`}
          </div>
        </div>

        {/* KPI 2: Seguidores (Clicável para abrir modal) */}
        <button
          type="button"
          onClick={() => {
            setFollowersModalTab("followers");
            setFollowersModalOpen(true);
          }}
          className="rounded-2xl border border-white/[0.08] bg-[#131422] p-4 sm:p-5 transition-all hover:border-white/20 hover:bg-[#18192A] hover:-translate-y-0.5 shadow-sm group text-left cursor-pointer"
        >
          <div className="mb-2 flex items-center justify-between text-mutedDim">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-accent transition-colors">
              Seguidores
            </span>
            <UserCheck size={16} className="text-teal group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-display text-[24px] sm:text-[28px] font-black text-white leading-none mb-1 group-hover:text-accent transition-colors">
            {targetUser.followersCount ?? targetUser.followers?.length ?? 0}
          </div>
          <div className="text-[11px] font-medium text-mutedDim underline decoration-dotted decoration-mutedDim/60">
            Ver comunidade →
          </div>
        </button>

        {/* KPI 3: A Seguir (Clicável para abrir modal) */}
        <button
          type="button"
          onClick={() => {
            setFollowersModalTab("following");
            setFollowersModalOpen(true);
          }}
          className="rounded-2xl border border-white/[0.08] bg-[#131422] p-4 sm:p-5 transition-all hover:border-white/20 hover:bg-[#18192A] hover:-translate-y-0.5 shadow-sm group text-left cursor-pointer"
        >
          <div className="mb-2 flex items-center justify-between text-mutedDim">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-accent transition-colors">
              A Seguir
            </span>
            <UserPlus size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-display text-[24px] sm:text-[28px] font-black text-white leading-none mb-1 group-hover:text-accent transition-colors">
            {targetUser.followingCount ?? targetUser.following?.length ?? 0}
          </div>
          <div className="text-[11px] font-medium text-mutedDim underline decoration-dotted decoration-mutedDim/60">
            Criadores seguidos →
          </div>
        </button>

        {/* KPI 4: Votos Recebidos */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#131422] p-4 sm:p-5 transition-all hover:border-white/20 hover:bg-[#18192A] hover:-translate-y-0.5 shadow-sm group">
          <div className="mb-2 flex items-center justify-between text-mutedDim">
            <span className="text-[11px] font-bold uppercase tracking-wider">Votos</span>
            <Heart size={16} className="text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-display text-[24px] sm:text-[28px] font-black text-white leading-none mb-1">
            {totalReceivedVotes}
          </div>
          <div className="text-[11px] font-medium text-mutedDim">
            Aprovações totais
          </div>
        </div>

        {/* KPI 5: Visualizações Totais */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#131422] p-4 sm:p-5 transition-all hover:border-white/20 hover:bg-[#18192A] hover:-translate-y-0.5 shadow-sm group">
          <div className="mb-2 flex items-center justify-between text-mutedDim">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vistas</span>
            <Eye size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-display text-[24px] sm:text-[28px] font-black text-white leading-none mb-1">
            {totalReceivedViews}
          </div>
          <div className="text-[11px] font-medium text-mutedDim">
            Visualizações globais
          </div>
        </div>

        {/* KPI 6: Creator XP */}
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-b from-[#131422] to-[#18192A] p-4 sm:p-5 transition-all hover:border-accent/50 hover:-translate-y-0.5 shadow-sm group">
          <div className="mb-2 flex items-center justify-between text-mutedDim">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Score XP</span>
            <Zap size={16} className="text-accent animate-pulse" />
          </div>
          <div className="font-display text-[24px] sm:text-[28px] font-black text-accent leading-none mb-1">
            {targetUser.creatorXp ?? 0}
          </div>
          <div className="text-[11px] font-medium text-mutedDim">
            Pontuação de impacto
          </div>
        </div>
      </div>

      {/* =========================================================
          3. VITRINE DE CONQUISTAS E BADGES
         ========================================================= */}
      {userBadges.length > 0 && (
        <div className="mb-8 rounded-3xl border border-border bg-surface/60 p-5 sm:p-6 backdrop-blur-md">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Award size={15} className="text-accent" />
              <span>Conquistas Desbloqueadas ({userBadges.length})</span>
            </div>
            <span className="text-[11.5px] font-semibold text-mutedDim">
              Baseadas na atividade e notoriedade real do criador
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {userBadges.map((b) => (
              <div
                key={b.id}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#14141d] p-3 text-center transition-all hover:border-accent/40 hover:bg-[#181824] hover:-translate-y-0.5"
                title={b.description}
              >
                <div className="mb-1 text-2xl group-hover:scale-110 transition-transform">
                  {b.icon}
                </div>
                <div className="font-display text-[12px] font-bold text-white truncate max-w-full">
                  {b.name}
                </div>
                <div className="mt-0.5 text-[10px] text-mutedDim line-clamp-1">
                  {b.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          4. ABAS E FERRAMENTAS DE FILTRAGEM DE TIER LISTS
         ========================================================= */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        {/* Segmented Control de Abas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "Created", label: t("profile.tabCreated"), count: publicLists.length },
            ...(isOwnProfile
              ? [{ id: "Private", label: "Privadas", count: privateLists.length }]
              : []),
            { id: "Favorites", label: t("profile.tabFavorites"), count: 0 },
          ].map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all ${
                  isActive
                    ? "bg-white text-black shadow-sm font-black"
                    : "border border-white/[0.08] bg-[#131422] text-muted hover:text-white hover:border-white/20 hover:bg-[#18192A]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${
                    isActive ? "bg-black/15 text-black" : "bg-white/[0.06] text-mutedDim"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Barra de Pesquisa e Ordenação interna */}
        {tab !== "Favorites" && (publicLists.length > 0 || privateLists.length > 0) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Input de Pesquisa Rápida */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedDim pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar tier lists…"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#131422] pl-8 pr-3 text-[12.5px] text-white placeholder:text-mutedDim outline-none focus:border-accent transition-all"
              />
            </div>

            {/* Select de Ordenação */}
            <div className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#131422] px-3 text-xs text-muted">
              <SlidersHorizontal size={13} className="text-mutedDim" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
              >
                <option value="recent" className="bg-[#131422] text-white">Mais Recentes</option>
                <option value="votes" className="bg-[#131422] text-white">Mais Votadas</option>
                <option value="views" className="bg-[#131422] text-white">Mais Vistas</option>
                <option value="alpha" className="bg-[#131422] text-white">Nome (A - Z)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          5. GRELHA DE TIER LISTS OU ESTADOS VAZIOS
         ========================================================= */}
      {tab === "Created" && (
        publicLists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-surface/40 p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent">
              <Layers size={26} />
            </div>
            <h3 className="mb-2 font-display text-[19px] font-bold text-white">
              {t("profile.emptyCreatedTitle")}
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted leading-relaxed">
              {t("profile.emptyCreatedDesc")}
            </p>
            {isOwnProfile && (
              <Link to="/create">
                <PrimaryButton icon={Plus}>{t("profile.emptyCreatedCta")}</PrimaryButton>
              </Link>
            )}
          </div>
        ) : displayedLists.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted">
            Nenhuma tier list encontrada com o filtro &ldquo;{searchFilter}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-5">
            {displayedLists.map((l) => (
              <TierListCard key={l.id} list={l} />
            ))}
          </div>
        )
      )}

      {tab === "Private" && isOwnProfile && (
        privateLists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-surface/40 p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-mutedDim">
              <Lock size={26} />
            </div>
            <h3 className="mb-2 font-display text-[19px] font-bold text-white">
              Sem Tier Lists Privadas
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted leading-relaxed">
              Quando criares uma Tier List com a opção &ldquo;Privada&rdquo;, apenas tu conseguirás vê-la nesta secção confidencial.
            </p>
            <Link to="/create">
              <GhostButton icon={Plus}>Criar Tier List Privada</GhostButton>
            </Link>
          </div>
        ) : displayedLists.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted">
            Nenhuma tier list privada encontrada com o filtro &ldquo;{searchFilter}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-5">
            {displayedLists.map((l) => (
              <TierListCard key={l.id} list={l} />
            ))}
          </div>
        )
      )}

      {tab === "Favorites" && (
        <div className="rounded-3xl border border-dashed border-border/80 bg-surface/40 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-mutedDim">
            <Heart size={26} />
          </div>
          <h3 className="mb-2 font-display text-[19px] font-bold text-white">
            {t("profile.tabFavorites")}
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted leading-relaxed">
            As tier lists que guardares ou adicionares como favoritas aparecerão aqui para acesso rápido.
          </p>
          <Link to="/explore">
            <PrimaryButton icon={ArrowLeft}>Explorar Tier Lists Populares</PrimaryButton>
          </Link>
        </div>
      )}

      {/* =========================================================
          6. MODAIS INTEGRADOS
         ========================================================= */}
      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaveSuccess={(updated) => {
          if (updated) {
            setTargetUser((prev) => ({ ...(prev || {}), ...updated }));
            if (updated.handle) {
              navigate(`/profile/${updated.handle}`, { replace: true });
              loadProfile(updated.handle);
            } else {
              loadProfile();
            }
          }
        }}
      />

      {/* Modal de Partilha do Perfil */}
      {targetUser && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={`Perfil de ${targetUser.displayName} (@${targetUser.handle || targetUser.uid})`}
          url={`${window.location.origin}/profile/${targetUser.handle || targetUser.uid}`}
          description={
            targetUser.bio?.trim()
              ? `${targetUser.bio.trim()} • Confere as ${lists.length} Tier Lists e classificações de ${targetUser.displayName} no TierWorld!`
              : `Explora o perfil e as ${lists.length} Tier Lists criadas por ${targetUser.displayName} (@${targetUser.handle || targetUser.uid}) no TierWorld. Confere os rankings e vota!`
          }
        />
      )}

      {/* Modal de Seguidores e A Seguir (Com lista real e botões diretos de seguir) */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        targetUser={targetUser}
        initialTab={followersModalTab}
        onFollowChange={loadProfile}
      />

      {/* Modal de Autenticação para Seguir Criadores */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Inicia sessão para seguir criadores"
        description="Para seguir os teus criadores favoritos e acompanhar os seus novos rankings, precisas de iniciar sessão com uma conta."
      />
    </div>
  );
}
