import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, Badge, EmptyState, PrimaryButton, GhostButton } from "../components/UI";
import TierListCard from "../components/TierListCard";
import ProfileEditModal from "../components/ProfileEditModal";
import ShareModal from "../components/ShareModal";
import FollowersModal from "../components/FollowersModal";
import {
  getUserByHandle,
  getUserByUid,
  getUserTierLists,
  toggleFollowUser,
} from "../services/db";
import { calculateUserBadges } from "../services/badges";

export default function Profile() {
  const { handle: paramHandle } = useParams();
  const { user, profile: authProfile } = useAuth();
  const { t } = useLanguage();

  const [targetUser, setTargetUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Created");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState("followers");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Determina se o utilizador está a ver o seu próprio perfil
  const isOwnProfile =
    !paramHandle ||
    (authProfile && authProfile.handle?.toLowerCase() === paramHandle.toLowerCase()) ||
    (user && user.uid === paramHandle);

  const loadProfile = useCallback(async () => {
    try {
      let foundUser = null;
      if (paramHandle) {
        foundUser = getUserByHandle(paramHandle) || getUserByUid(paramHandle);
      } else if (user) {
        foundUser = getUserByUid(user.uid);
      }

      setTargetUser(foundUser);

      if (foundUser) {
        const userLists = await getUserTierLists(foundUser.uid, isOwnProfile);
        setLists(userLists);

        if (user && foundUser.followers) {
          setIsFollowing(foundUser.followers.includes(user.uid));
        }
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }, [paramHandle, user, isOwnProfile]);

  useEffect(() => {
    setLoading(true);
    loadProfile();
  }, [loadProfile]);

  function handleFollowToggle() {
    if (!user) {
      alert("Inicia sessão para seguir criadores.");
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

  const handleShareProfile = async () => {
    if (!targetUser) return;
    const profileUrl = `${window.location.origin}/profile/${targetUser.handle || targetUser.uid}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${targetUser.displayName} (@${targetUser.handle}) — TierForge`,
          text: `Confere as tier lists e rankings de ${targetUser.displayName} no TierForge!`,
          url: profileUrl,
        });
        return;
      } catch {
        // Se utilizador cancelou a partilha nativa, não faz fallback para cópia
      }
    }

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      setShareModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-28 text-center text-muted">
        A carregar perfil…
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-28 text-center">
        <h2 className="mb-2 font-display text-[26px] font-black text-white">
          {t("profile.userNotFound")}
        </h2>
        <p className="mb-6 text-[14px] text-muted">
          Não foi possível encontrar nenhum criador com o identificador #{paramHandle}.
        </p>
        <Link to="/explore">
          <PrimaryButton icon={ArrowLeft}>{t("tierListView.backToExplore")}</PrimaryButton>
        </Link>
      </div>
    );
  }

  const handleDisplay = targetUser.handle ? `#${targetUser.handle}` : "";
  const publicLists = lists.filter((l) => l.visibility !== "private");
  const privateLists = lists.filter((l) => l.visibility === "private");

  const totalReceivedVotes = lists.reduce((acc, l) => acc + (l.votes || 0), 0);
  const totalReceivedViews = lists.reduce((acc, l) => acc + (l.views || 0), 0);

  const formattedJoinDate = targetUser.createdAt
    ? new Date(targetUser.createdAt).toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      })
    : "Janeiro de 2026";

  const userBadges = targetUser
    ? calculateUserBadges({ userLists: lists, userData: targetUser })
    : [];

  return (
    <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho do Perfil */}
      <div className="mb-8 flex flex-wrap items-start gap-6 border-b border-border pb-8">
        <Avatar
          name={targetUser.displayName}
          image={targetUser.avatar}
          size={96}
        />

        <div className="min-w-[260px] flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[28px] sm:text-[34px] font-black text-white leading-tight">
              {targetUser.displayName}
            </h1>
            <Badge tone="accent">
              <Crown size={12} /> {targetUser.badges?.[0] || t("profile.eliteCreator")}
            </Badge>
          </div>

          {/* ID Único (#handle) */}
          {handleDisplay && (
            <div className="mb-2 text-[14px] font-bold text-accent tracking-wide">
              {handleDisplay}
            </div>
          )}

          {/* Data de Entrada */}
          <div className="mb-3 text-[12px] font-medium text-mutedDim flex items-center gap-1.5">
            <Calendar size={13} className="text-accent" />
            <span>{t("profile.memberSince", { date: formattedJoinDate })}</span>
          </div>

          <p className="mb-4 max-w-xl text-[14px] leading-relaxed text-muted">
            {targetUser.bio || t("profile.bioPlaceholder")}
          </p>

          {/* Métricas Reais do Criador (Clicáveis para abrir listas de seguidores/seguidos) */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div>
              <div className="font-display text-[20px] font-black text-white">
                {lists.length}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.tierLists")}
              </div>
            </div>

            {/* Seguidores (Clicável para ver lista de quem segue) */}
            <button
              type="button"
              onClick={() => {
                setFollowersModalTab("followers");
                setFollowersModalOpen(true);
              }}
              className="text-left group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="font-display text-[20px] font-black text-white group-hover:text-accent transition-colors">
                {targetUser.followersCount ?? targetUser.followers?.length ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim underline decoration-dotted decoration-mutedDim/60 group-hover:text-accent">
                {t("profile.followers")}
              </div>
            </button>

            {/* A Seguir (Clicável para ver quem esta pessoa segue) */}
            <button
              type="button"
              onClick={() => {
                setFollowersModalTab("following");
                setFollowersModalOpen(true);
              }}
              className="text-left group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="font-display text-[20px] font-black text-white group-hover:text-accent transition-colors">
                {targetUser.followingCount ?? targetUser.following?.length ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim underline decoration-dotted decoration-mutedDim/60 group-hover:text-accent">
                {t("profile.following")}
              </div>
            </button>

            {/* Votos Reais Recebidos */}
            <div>
              <div className="font-display text-[20px] font-black text-white">
                {totalReceivedVotes}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.votesReceived")}
              </div>
            </div>

            {/* Visualizações Reais */}
            <div>
              <div className="font-display text-[20px] font-black text-white">
                {totalReceivedViews}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.viewsReceived")}
              </div>
            </div>

            {/* Creator XP */}
            <div>
              <div className="font-display text-[20px] font-black text-accent">
                {targetUser.creatorXp ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.creatorXp")}
              </div>
            </div>
          </div>

          {/* Conquistas e Badges Reais */}
          {userBadges.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="text-[11px] font-bold uppercase tracking-wider text-mutedDim mb-2.5 flex items-center gap-1.5">
                <Crown size={13} className="text-accent" />
                <span>Conquistas Desbloqueadas ({userBadges.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {userBadges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:border-accent transition-colors"
                    title={b.description}
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ações: Seguir / Editar / Partilhar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Partilhar Perfil */}
          <button
            type="button"
            onClick={handleShareProfile}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-text hover:bg-surface2 hover:border-accent/40 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-accent stroke-[3]" />
                <span className="text-accent">{t("profile.linkCopied")}</span>
              </>
            ) : (
              <>
                <Share2 size={14} className="text-accent" />
                <span>{t("profile.shareProfile")}</span>
              </>
            )}
          </button>

          {isOwnProfile ? (
            <>
              <GhostButton
                small
                icon={Settings}
                onClick={() => setEditModalOpen(true)}
              >
                {t("profile.editProfile")}
              </GhostButton>
              <Link to="/create">
                <PrimaryButton small icon={Plus}>
                  {t("nav.create")}
                </PrimaryButton>
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFollowToggle}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-all shadow-sm ${
                isFollowing
                  ? "border border-border bg-surface text-muted hover:text-red-400 hover:border-red-500/40"
                  : "bg-accent text-black hover:opacity-90 shadow-glow"
              }`}
            >
              {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
              <span>{isFollowing ? t("profile.followingBtn") : t("profile.follow")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Abas do Perfil */}
      <div className="mb-6 flex gap-6 border-b border-border">
        {["Created", ...(isOwnProfile ? ["Private"] : []), "Favorites"].map((tabKey) => {
          const label =
            tabKey === "Created"
              ? `${t("profile.tabCreated")} (${publicLists.length})`
              : tabKey === "Private"
              ? `Privadas (${privateLists.length})`
              : t("profile.tabFavorites");

          return (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`pb-3 text-[14px] font-bold transition-colors ${
                tab === tabKey
                  ? "border-b-2 border-accent text-white"
                  : "text-muted hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Abas */}
      {tab === "Created" && (
        publicLists.length === 0 ? (
          <EmptyState
            title={t("profile.emptyCreatedTitle")}
            body={t("profile.emptyCreatedDesc")}
            actionLabel={t("profile.emptyCreatedCta")}
            onAction={() => (window.location.href = "/create")}
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {publicLists.map((l) => (
              <TierListCard key={l.id} list={l} />
            ))}
          </div>
        )
      )}

      {tab === "Private" && isOwnProfile && (
        privateLists.length === 0 ? (
          <EmptyState
            icon={Lock}
            title="Sem Tier Lists Privadas"
            body="Quando criares uma Tier List com a opção 'Privada', apenas tu conseguirás vê-la nesta secção."
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {privateLists.map((l) => (
              <TierListCard key={l.id} list={l} />
            ))}
          </div>
        )
      )}

      {tab === "Favorites" && (
        <EmptyState
          title={t("profile.tabFavorites")}
          body="As tier lists que adicionares como favoritas aparecerão aqui."
        />
      )}

      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaveSuccess={(updated) => {
          setTargetUser((prev) => ({ ...prev, ...updated }));
          loadProfile();
        }}
      />

      {/* Modal de Partilha do Perfil */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={`Perfil de ${targetUser.displayName} (#${targetUser.handle})`}
        url={`${window.location.origin}/profile/${targetUser.handle || targetUser.uid}`}
        description={`Confere as tier lists criadas por ${targetUser.displayName} no TierForge.`}
      />

      {/* Modal de Seguidores e A Seguir (Com lista real e botões diretos de seguir) */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        targetUser={targetUser}
        initialTab={followersModalTab}
        onFollowChange={loadProfile}
      />
    </div>
  );
}
