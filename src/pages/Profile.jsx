import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Crown,
  Plus,
  Settings,
  Share2,
  UserPlus,
  UserCheck,
  Lock,
  Layers,
  Heart,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, Badge, EmptyState, PrimaryButton, GhostButton, SecondaryButton } from "../components/UI";
import TierListCard from "../components/TierListCard";
import ProfileEditModal from "../components/ProfileEditModal";
import ShareModal from "../components/ShareModal";
import {
  getUserByHandle,
  getUserByUid,
  getUserTierLists,
  toggleFollowUser,
} from "../services/db";

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
  const [isFollowing, setIsFollowing] = useState(false);

  // Determina se o utilizador está a ver o seu próprio perfil
  const isOwnProfile =
    !paramHandle ||
    (authProfile && authProfile.handle?.toLowerCase() === paramHandle.toLowerCase()) ||
    (user && user.uid === paramHandle);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
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

          // Verifica se o utilizador atual já segue este perfil
          if (user && foundUser.followers) {
            setIsFollowing(foundUser.followers.includes(user.uid));
          }
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [paramHandle, user, authProfile, isOwnProfile]);

  function handleFollowToggle() {
    if (!user || !targetUser || isOwnProfile) return;
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
            <div className="mb-3 text-[14px] font-bold text-accent tracking-wide">
              {handleDisplay}
            </div>
          )}

          <p className="mb-4 max-w-xl text-[14px] leading-relaxed text-muted">
            {targetUser.bio || t("profile.bioPlaceholder")}
          </p>

          {/* Métricas Reais do Criador */}
          <div className="flex flex-wrap gap-7">
            <div>
              <div className="font-display text-[20px] font-black text-white">
                {lists.length}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.tierLists")}
              </div>
            </div>

            <div>
              <div className="font-display text-[20px] font-black text-white">
                {targetUser.followersCount ?? targetUser.followers?.length ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.followers")}
              </div>
            </div>

            <div>
              <div className="font-display text-[20px] font-black text-white">
                {targetUser.followingCount ?? targetUser.following?.length ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.following")}
              </div>
            </div>

            <div>
              <div className="font-display text-[20px] font-black text-accent">
                {targetUser.creatorXp ?? 0}
              </div>
              <div className="text-[12px] font-semibold text-mutedDim">
                {t("profile.creatorXp")}
              </div>
            </div>
          </div>
        </div>

        {/* Ações: Seguir / Editar / Partilhar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] font-bold text-text hover:bg-surface2 hover:border-borderStrong transition-colors"
          >
            <Share2 size={14} className="text-accent" />
            <span className="hidden sm:inline">{t("profile.shareProfile")}</span>
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
                  ? "border border-accent bg-accentSoft text-[#B6A5FF]"
                  : "bg-accent text-white hover:bg-accent/90"
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
              type="button"
              onClick={() => setTab(tabKey)}
              className={`border-b-2 pb-3 text-[14px] font-bold transition-colors ${
                tab === tabKey
                  ? "border-accent text-white"
                  : "border-transparent text-mutedDim hover:text-text"
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
            cta={
              isOwnProfile ? (
                <Link to="/create" className="mt-2 inline-block">
                  <PrimaryButton icon={Plus}>{t("profile.emptyCreatedCta")}</PrimaryButton>
                </Link>
              ) : null
            }
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
        onSaveSuccess={(updated) => setTargetUser((prev) => ({ ...prev, ...updated }))}
      />

      {/* Modal de Partilha do Perfil */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={`Perfil de ${targetUser.displayName} (#${targetUser.handle})`}
        url={window.location.href}
        description={`Confere as tier lists criadas por ${targetUser.displayName} no TierForge.`}
      />
    </div>
  );
}
