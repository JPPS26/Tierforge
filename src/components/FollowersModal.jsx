import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Search, UserCheck, UserPlus, Users } from "lucide-react";
import { Avatar, Badge } from "./UI";
import { getUserFollowers, getUserFollowing, toggleFollowUser } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthRequiredModal from "./AuthRequiredModal";

export default function FollowersModal({
  isOpen,
  onClose,
  targetUser,
  initialTab = "followers",
  onFollowChange,
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadData = () => {
    if (!targetUser?.uid) return;
    setLoading(true);
    const followers = getUserFollowers(targetUser.uid, user?.uid);
    const following = getUserFollowing(targetUser.uid, user?.uid);
    setFollowersList(followers);
    setFollowingList(following);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && targetUser?.uid) {
      loadData();
    }
  }, [isOpen, targetUser?.uid, user?.uid]);

  if (!isOpen || !targetUser) return null;

  const isSelf = user?.uid === targetUser.uid;
  const currentList = activeTab === "followers" ? followersList : followingList;

  const filteredList = currentList.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.handle || "").toLowerCase().includes(q) ||
      (u.bio || "").toLowerCase().includes(q)
    );
  });

  const handleToggleFollow = (itemUser) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (user.uid === itemUser.uid) return;

    toggleFollowUser(user.uid, itemUser.uid);
    // Recarrega os dados imediatamente
    loadData();
    if (onFollowChange) {
      onFollowChange();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-3xl border border-white/[0.1] bg-[#0E0F18] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(124,92,255,0.12)] flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentSoft border border-accent/30 text-accent shadow-sm">
              <Users size={18} />
            </div>
            <span className="font-display font-bold text-[17px] text-white tracking-tight">
              {targetUser.displayName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas: Seguidores vs A Seguir */}
        <div className="grid grid-cols-2 gap-2 bg-[#0F1017] p-1 rounded-2xl border border-white/[0.08] mb-4">
          <button
            onClick={() => {
              setActiveTab("followers");
              setSearchQuery("");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "followers"
                ? "bg-accent text-black shadow-glow font-black"
                : "text-muted hover:text-white"
            }`}
          >
            <span>{t("profile.modalFollowersTitle")}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === "followers"
                  ? "bg-black/20 text-black font-black"
                  : "bg-[#131422] text-mutedDim"
              }`}
            >
              {followersList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("following");
              setSearchQuery("");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "following"
                ? "bg-accent text-black shadow-glow font-black"
                : "text-muted hover:text-white"
            }`}
          >
            <span>{t("profile.modalFollowingTitle")}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === "following"
                  ? "bg-black/20 text-black font-black"
                  : "bg-[#131422] text-mutedDim"
              }`}
            >
              {followingList.length}
            </span>
          </button>
        </div>

        {/* Barra de Pesquisa dentro da lista */}
        {currentList.length > 3 && (
          <div className="relative mb-3.5">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-mutedDim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("profile.searchUserPlaceholder")}
              className="w-full h-10 rounded-xl border border-white/[0.08] bg-[#131422] pl-10 pr-4 text-[13px] text-white placeholder:text-mutedDim focus:border-accent outline-none transition-colors"
            />
          </div>
        )}

        {/* Conteúdo da Lista */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted text-sm">
              A carregar utilizadores…
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#131422] border border-white/[0.08] flex items-center justify-center text-mutedDim mb-3">
                <Users size={22} />
              </div>
              <p className="text-white font-bold text-sm mb-1">
                {activeTab === "followers"
                  ? isSelf
                    ? t("profile.emptyFollowersOwn")
                    : t("profile.emptyFollowersOther")
                  : isSelf
                  ? t("profile.emptyFollowingOwn")
                  : t("profile.emptyFollowingOther")}
              </p>
              {searchQuery && (
                <p className="text-xs text-mutedDim">
                  Nenhum utilizador corresponde à pesquisa "{searchQuery}".
                </p>
              )}
            </div>
          ) : (
            filteredList.map((itemUser) => {
              const profileUrl = `/profile/${itemUser.handle}`;
              const isCurrentUser = user?.uid === itemUser.uid;

              return (
                <div
                  key={itemUser.uid}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/[0.08] bg-[#131422] hover:bg-[#18192A] transition-colors"
                >
                  <Link
                    to={profileUrl}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <Avatar
                      name={itemUser.displayName}
                      image={itemUser.avatar}
                      size={44}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-accent transition-colors truncate">
                          {itemUser.displayName}
                        </span>
                        {itemUser.badges?.[0] && (
                          <Badge tone="accent" size="sm">
                            {itemUser.badges[0]}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-accent font-semibold truncate">
                        #{itemUser.handle}
                      </div>
                      {itemUser.bio && (
                        <p className="text-xs text-mutedDim truncate mt-0.5">
                          {itemUser.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Botão Seguir/Deixar de Seguir se não for o próprio utilizador logado */}
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleToggleFollow(itemUser)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        itemUser.isFollowing
                          ? "bg-black/30 border border-white/[0.1] text-muted hover:text-red-400 hover:border-red-500/40"
                          : "bg-accent text-black hover:opacity-90 shadow-glow"
                      }`}
                    >
                      {itemUser.isFollowing ? (
                        <>
                          <UserCheck size={13} />
                          <span>{t("profile.followingBtn")}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={13} />
                          <span>{t("profile.follow")}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="border-t border-white/[0.08] pt-3 mt-3 flex items-center justify-between text-xs text-mutedDim">
          <span>Dados 100% reais da comunidade</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-muted hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Autenticação para Seguir */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Inicia sessão para seguir criadores"
        description="Para seguir os teus criadores favoritos e acompanhar os seus rankings, precisas de iniciar sessão com uma conta."
      />
    </div>
  );
}

