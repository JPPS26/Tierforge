import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Eye,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ArrowLeft,
  Lock,
  Send,
  ExternalLink,
  Swords,
  Download,
  Sparkles,
  Users,
  User,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  getTierListById,
  voteTierList,
  getUserVoteForList,
  incrementViews,
  getCommentsForTierList,
  addCommentToTierList,
  getRemixesForTemplate,
  calculateCommunityConsensus,
  canEditTierList,
  deleteTierList,
} from "../services/db";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, Badge, PrimaryButton, GhostButton, colorFor } from "../components/UI";
import ShareModal from "../components/ShareModal";
import ExportModal from "../components/ExportModal";
import DuelModeModal from "../components/DuelModeModal";

export default function TierListView() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tierList, setTierList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [userVote, setUserVote] = useState(0); // 1, -1, or 0
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [duelOpen, setDuelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState("author"); // "author" | "consensus"
  const [remixes, setRemixes] = useState([]);
  const [consensusData, setConsensusData] = useState(null);

  const userIdOrAnon = user?.uid || "anon_user";

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getTierListById(id, user?.uid);
        setTierList(data);
        if (data && !data.isPrivateForbidden) {
          incrementViews(id);
          const comms = getCommentsForTierList(id);
          setComments(comms);
          const initialVote = getUserVoteForList(id, userIdOrAnon);
          setUserVote(initialVote);

          // Carregar remixes e consenso da comunidade
          const rmx = getRemixesForTemplate(id);
          setRemixes(rmx);
          if (rmx.length > 0) {
            const consensus = calculateCommunityConsensus(id);
            setConsensusData(consensus);
          }
        }
      } catch (err) {
        console.error("Error loading tier list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user?.uid]);

  async function handleVote(direction) {
    const res = await voteTierList(id, userIdOrAnon, direction);
    setUserVote(res.userVote);
    setTierList((prev) => (prev ? { ...prev, votes: res.votes } : null));
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = addCommentToTierList(id, {
      userUid: user?.uid || null,
      userName: profile?.displayName || user?.displayName || "Visitante",
      userAvatar: profile?.avatar || user?.photoURL || "",
      text: commentText.trim(),
    });

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  }

  async function handleDelete() {
    if (!tierList) return;
    const confirmed = window.confirm(
      "Tens a certeza que desejas eliminar permanentemente esta Tier List? Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteTierList(tierList.id, user?.uid);
      alert("Tier List eliminada com sucesso.");
      navigate("/explore");
    } catch (err) {
      console.error("Erro ao eliminar tier list:", err);
      alert("Erro ao eliminar a Tier List. Tenta novamente.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-28 text-center text-muted">
        A carregar tier list…
      </div>
    );
  }

  if (!tierList || tierList.isPrivateForbidden) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-28 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent mx-auto">
          <Lock size={26} />
        </div>
        <h2 className="mb-2 font-display text-[26px] font-black text-white">
          {tierList?.isPrivateForbidden
            ? t("tierListView.privateNotice")
            : t("tierListView.tierListNotFound")}
        </h2>
        <p className="mb-6 text-[14px] text-muted">
          Esta tier list foi configurada como privada ou foi eliminada pelo autor.
        </p>
        <Link to="/explore">
          <PrimaryButton icon={ArrowLeft}>{t("tierListView.backToExplore")}</PrimaryButton>
        </Link>
      </div>
    );
  }

  const canEdit = canEditTierList(tierList, user?.uid);
  const displayMode = tierList.itemDisplayMode || "both";
  const items = tierList.items || [];
  const currentTiers = viewMode === "consensus" && consensusData ? consensusData.tiers : (tierList.tiers || []);
  const currentPlacements = viewMode === "consensus" && consensusData ? consensusData.placements : (tierList.placements || {});

  return (
    <div className="mx-auto max-w-[1140px] px-4 sm:px-6 pb-28 pt-8">
      {/* Voltar e Ações Principais */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-[13.5px] font-bold text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} /> {t("tierListView.backToExplore")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Fazer a Minha Versão (Remix Template) */}
          <PrimaryButton
            small
            icon={Sparkles}
            onClick={() => navigate(`/create?remix=${tierList.id}`)}
          >
            Fazer a Minha Versão
          </PrimaryButton>

          {/* Modo Duelo 1 vs 1 */}
          <button
            type="button"
            onClick={() => setDuelOpen(true)}
            disabled={items.length < 2}
            className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accentSoft px-3.5 py-2 text-[13px] font-bold text-accent hover:bg-accent hover:text-black transition-all shadow-sm disabled:opacity-40"
          >
            <Swords size={14} />
            <span>Duelo 1 vs 1</span>
          </button>

          {/* Exportar Imagem Social */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-text hover:bg-surface2 transition-all hover:border-accent shadow-sm"
          >
            <Download size={14} className="text-teal" />
            <span>Exportar</span>
          </button>

          {/* Partilhar */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-text hover:bg-surface2 transition-all hover:border-accent shadow-sm"
          >
            <Share2 size={14} className="text-accent" />
            <span>{t("tierListView.share")}</span>
          </button>

          {/* Editar e Eliminar se for o criador */}
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/edit/${tierList.id}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-text hover:bg-surface2 transition-all hover:border-accent shadow-sm"
                title="Editar esta Tier List"
              >
                <Edit2 size={14} className="text-accent" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[13px] font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-sm disabled:opacity-50"
                title="Eliminar permanentemente esta Tier List"
              >
                <Trash2 size={14} />
                <span>{deleting ? "A eliminar..." : "Eliminar"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cabeçalho da Tier List */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6 border-b border-border pb-7">
        <div className="flex-1 min-w-[280px]">
          <div className="mb-2.5 flex items-center gap-2">
            <Badge tone="accent">
              {t(`categories.${tierList.category}`) || tierList.category?.toUpperCase() || "GERAL"}
            </Badge>
            {tierList.visibility === "private" && (
              <Badge tone="rose">
                <Lock size={11} /> Privada
              </Badge>
            )}
            {tierList.visibility === "unlisted" && (
              <Badge tone="amber">Não Listada</Badge>
            )}
          </div>

          <h1 className="font-display text-[28px] sm:text-[38px] font-black tracking-tight text-white leading-tight">
            {tierList.title}
          </h1>

          {tierList.parentTemplateTitle && (
            <div className="mt-2 text-xs font-semibold text-mutedDim flex items-center gap-1.5">
              <span>Criado a partir do template:</span>
              <Link
                to={`/tier-list/${tierList.parentTemplateId}`}
                className="text-accent hover:underline font-bold"
              >
                {tierList.parentTemplateTitle} →
              </Link>
            </div>
          )}

          {tierList.description && (
            <p className="mt-2.5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              {tierList.description}
            </p>
          )}

          {/* Criador com link para o Perfil Público */}
          <div className="mt-4 flex items-center gap-3">
            <Link
              to={`/profile/${tierList.creatorHandle || tierList.ownerId}`}
              className="flex items-center gap-2.5 group"
            >
              <Avatar
                name={tierList.creator}
                image={tierList.creatorAvatar}
                size={30}
              />
              <div>
                <span className="font-display text-[14px] font-bold text-text group-hover:text-accent transition-colors">
                  {tierList.creator || "Criador"}
                </span>
                {tierList.creatorHandle && (
                  <span className="ml-2 text-[12px] font-semibold text-accent/80">
                    #{tierList.creatorHandle}
                  </span>
                )}
              </div>
            </Link>

            {tierList.creatorBadge && (
              <Badge tone="default">{tierList.creatorBadge}</Badge>
            )}
          </div>
        </div>

        {/* Painel de Votação Anti-Abuso e Métricas Reais */}
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleVote(1)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-bold transition-all ${
                userVote === 1
                  ? "border-teal bg-[rgba(49,216,168,0.2)] text-teal shadow-glow"
                  : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
              }`}
            >
              <ThumbsUp size={15} />
              <span>{t("tierListView.upvote")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote(-1)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-bold transition-all ${
                userVote === -1
                  ? "border-[#FF5470] bg-[rgba(255,84,112,0.2)] text-[#FF5470] shadow-glow"
                  : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
              }`}
            >
              <ThumbsDown size={15} />
              <span>{t("tierListView.downvote")}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[12.5px] text-mutedDim">
            <span className="flex items-center gap-1 font-bold text-white">
              <Heart size={14} className="text-[#FF5470]" />
              {t("tierListView.votes", { count: (tierList.votes || 0).toLocaleString() })}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {t("tierListView.views", { count: (tierList.views || 0).toLocaleString() })}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {comments.length}
            </span>
            {(remixes.length > 0 || tierList.remixCount > 0) && (
              <span className="flex items-center gap-1 font-bold text-accent">
                <Sparkles size={14} />
                {remixes.length || tierList.remixCount} versões
              </span>
            )}
          </div>
        </div>
      </div>

      {/* A Tier List Renderizada */}
      <div className="mb-14 overflow-hidden rounded-3xl border border-borderStrong bg-surface shadow-2xl">
        {currentTiers.map((tier) => {
          const tierItems = Object.entries(currentPlacements)
            .filter(([, tId]) => tId === tier.id)
            .map(([itemId]) => items.find((i) => i.id === itemId))
            .filter(Boolean);

          return (
            <div key={tier.id} className="flex border-b border-border/60 last:border-b-0">
              <div
                className="flex w-[84px] sm:w-[100px] flex-shrink-0 items-center justify-center p-2 text-center border-r border-white/10"
                style={{ background: tier.color }}
              >
                <span className="font-display text-[22px] sm:text-[28px] font-black text-[#0A0A0D]">
                  {tier.label}
                </span>
              </div>

              <div className="flex min-h-[100px] flex-1 flex-wrap items-center gap-2.5 p-3.5 bg-surface">
                {tierItems.length === 0 ? (
                  <span className="text-[12px] italic text-mutedDim px-2">—</span>
                ) : (
                  tierItems.map((it) => {
                    const hasImage = Boolean(it.imageUrl);
                    const mode = it.displayMode && it.displayMode !== "auto" ? it.displayMode : displayMode;
                    const showImage = hasImage && (mode === "image" || mode === "both");
                    const showText = mode === "text" || mode === "both" || !hasImage;

                    return (
                      <div
                        key={it.id}
                        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-border transition-all hover:scale-105 hover:shadow-glow ${
                          mode === "image" && hasImage
                            ? "h-20 w-20 flex-shrink-0 bg-surface2"
                            : mode === "both" && hasImage
                            ? "h-20 w-20 flex-shrink-0 bg-surface2 flex-col justify-end"
                            : "h-16 min-w-[76px] max-w-[120px] flex-shrink-0 px-2.5 py-1.5 text-center"
                        }`}
                        style={{
                          background:
                            showImage && !showText
                              ? "#121218"
                              : showImage && showText
                              ? "#14141D"
                              : `linear-gradient(145deg, ${colorFor(it.name)}40, #161620)`,
                        }}
                        title={it.name}
                      >
                        {showImage && (
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className={`h-full w-full object-cover ${
                              showText ? "absolute inset-0 z-0 opacity-80" : ""
                            }`}
                          />
                        )}

                        {showText && (
                          <div
                            className={`z-10 font-display text-center font-bold leading-tight ${
                              showImage
                                ? "w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-1.5 pt-3.5 px-1 text-[10px] text-white"
                                : "text-[11.5px] text-text"
                            }`}
                          >
                            <span className="line-clamp-2">{it.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secção de Comentários */}
      <div className="mx-auto max-w-[800px]">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-[20px] font-bold text-white flex items-center gap-2">
            <MessageCircle size={20} className="text-accent" />
            {t("tierListView.comments", { count: comments.length })}
          </h3>
        </div>

        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-3">
            <Avatar
              name={profile?.displayName || user?.displayName || "Eu"}
              image={profile?.avatar || user?.photoURL}
              size={36}
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("tierListView.addCommentPlaceholder")}
                rows={3}
                className="w-full rounded-2xl border border-border bg-surface p-3.5 text-[13.5px] text-text outline-none focus:border-accent"
              />
              <div className="mt-2 flex justify-end">
                <PrimaryButton small icon={Send} type="submit" disabled={!commentText.trim()}>
                  {t("tierListView.submitComment")}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-8 text-center text-[13.5px] text-muted">
              {t("tierListView.emptyComments")}
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-borderStrong"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.userName} image={c.userAvatar} size={28} />
                    <span className="font-display text-[13.5px] font-bold text-white">
                      {c.userName}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-mutedDim">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-muted pl-9">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Partilha Social */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={tierList.title}
        url={window.location.href}
        description={tierList.description || "Classificação completa no TierForge"}
      />

      {/* Modal de Exportação Social (Feed 16:9 & Stories 9:16) */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        tierList={tierList}
        tiers={currentTiers}
        items={items}
        placements={currentPlacements}
        creatorName={tierList.creator}
        creatorHandle={tierList.creatorHandle}
      />

      {/* Modal de Duelo 1 vs 1 */}
      <DuelModeModal
        isOpen={duelOpen}
        onClose={() => setDuelOpen(false)}
        items={items}
        tiers={currentTiers}
        onApplyPlacements={() => {
          navigate(`/create?remix=${tierList.id}`);
        }}
      />
    </div>
  );
}
