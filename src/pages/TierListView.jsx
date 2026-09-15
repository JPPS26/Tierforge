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
  CornerDownRight,
  AlertCircle,
  Check,
  X,
  Search,
  LogIn,
} from "lucide-react";
import {
  getTierListById,
  voteTierList,
  getUserVoteForList,
  incrementViews,
  getCommentsForTierList,
  addCommentToTierList,
  updateComment,
  deleteComment,
  addReplyToComment,
  updateReply,
  deleteReply,
  reactToComment,
  getRemixesForTemplate,
  calculateCommunityConsensus,
  canEditTierList,
  deleteTierList,
  getCategoryDisplayName,
} from "../services/db";
import { checkContentSafety } from "../services/safetyFilter";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import useRealtimeDb from "../hooks/useRealtimeDb";
import { Avatar, Badge, PrimaryButton, GhostButton, colorFor } from "../components/UI";
import ShareModal from "../components/ShareModal";
import ExportModal from "../components/ExportModal";
import DuelModeModal from "../components/DuelModeModal";
import AuthRequiredModal from "../components/AuthRequiredModal";

function FormattedCommentText({ text }) {
  if (!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9_]{3,20})/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("@") && part.length > 1) {
          const handle = part.slice(1);
          return (
            <Link
              key={index}
              to={`/profile/${handle}`}
              className="font-bold text-accent hover:underline inline-block mx-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export default function TierListView() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tierList, setTierList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // commentId
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [editingTarget, setEditingTarget] = useState(null); // { commentId, replyId, text }
  const [editError, setEditError] = useState("");

  const [userVote, setUserVote] = useState(0); // 1, -1, or 0
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [duelOpen, setDuelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState("author"); // "author" | "consensus"
  const [remixes, setRemixes] = useState([]);
  const [consensusData, setConsensusData] = useState(null);

  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  // Incrementa visualização única na montagem da página
  useEffect(() => {
    if (id) {
      incrementViews(id);
    }
  }, [id]);

  // Sincronização em tempo real ao segundo da Tier List, votos, comentários e remixes
  useRealtimeDb(() => {
    async function loadData() {
      if (!id) return;
      try {
        const data = await getTierListById(id, user?.uid);
        setTierList(data);
        if (data && !data.isPrivateForbidden) {
          const comms = getCommentsForTierList(id);
          setComments(comms);
          if (user?.uid) {
            const currentVote = getUserVoteForList(id, user.uid);
            setUserVote(currentVote);
          } else {
            setUserVote(0);
          }

          // Carregar remixes e consenso da comunidade
          const rmx = getRemixesForTemplate(id);
          setRemixes(rmx);
          if (rmx.length > 0) {
            const consensus = calculateCommunityConsensus(id);
            setConsensusData(consensus);
          }
        }
      } catch (err) {
        console.error("Error loading tier list in realtime:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user?.uid]);

  async function handleVote(direction) {
    if (!user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Inicia sessão para votar",
        description: "Precisas de ter conta para dar like ou votar nas Tier Lists da comunidade.",
      });
      return;
    }
    const res = await voteTierList(id, user.uid, direction);
    setUserVote(res.userVote);
    setTierList((prev) => (prev ? { ...prev, votes: res.votes } : null));
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Inicia sessão para comentar",
        description: "Precisas de ter conta para publicar comentários e participar nas discussões.",
      });
      return;
    }
    setCommentError("");
    if (!commentText.trim()) return;

    const safety = checkContentSafety(commentText);
    if (!safety.isSafe) {
      setCommentError(safety.reason || "O comentário contém linguagem ou termos impróprios.");
      return;
    }

    try {
      addCommentToTierList(id, {
        userUid: user.uid,
        userName: profile?.displayName || user.displayName || "Criador",
        userHandle: profile?.handle || `user_${user.uid.slice(0, 5)}`,
        userAvatar: profile?.avatar || user.photoURL || "",
        text: commentText.trim(),
        tierListOwnerId: tierList.ownerId,
        tierListTitle: tierList.title,
      });

      setComments(getCommentsForTierList(id));
      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Erro ao adicionar comentário.");
    }
  }

  function handleReact(commentId, replyId = null, reactionType = "like") {
    if (!user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Inicia sessão para reagir",
        description: "Precisas de ter conta para dar gosto ou reagir aos comentários.",
      });
      return;
    }
    reactToComment(id, commentId, replyId, user.uid, reactionType);
    setComments(getCommentsForTierList(id));
  }

  function handleStartEdit(item, isReply = false, parentId = null) {
    setEditingTarget({
      commentId: isReply ? parentId : item.id,
      replyId: isReply ? item.id : null,
      text: item.text,
    });
    setEditError("");
  }

  function handleSaveEdit() {
    if (!editingTarget) return;
    setEditError("");

    const safety = checkContentSafety(editingTarget.text);
    if (!safety.isSafe) {
      setEditError(safety.reason || "O comentário contém linguagem ou termos impróprios.");
      return;
    }

    try {
      if (editingTarget.replyId) {
        updateReply(id, editingTarget.commentId, editingTarget.replyId, editingTarget.text, user?.uid);
      } else {
        updateComment(id, editingTarget.commentId, editingTarget.text, user?.uid);
      }
      setComments(getCommentsForTierList(id));
      setEditingTarget(null);
    } catch (err) {
      setEditError(err.message || "Erro ao guardar alterações.");
    }
  }

  function handleDeleteCommentItem(commentId, replyId = null) {
    const confirmed = window.confirm("Tens a certeza que desejas eliminar este comentário?");
    if (!confirmed) return;

    try {
      if (replyId) {
        deleteReply(id, commentId, replyId, user?.uid, tierList.ownerId);
      } else {
        deleteComment(id, commentId, user?.uid, tierList.ownerId);
      }
      setComments(getCommentsForTierList(id));
    } catch (err) {
      alert(err.message || "Erro ao eliminar comentário.");
    }
  }

  function handleAddReplySubmit(parentCommentId, e) {
    e.preventDefault();
    if (!user) {
      setAuthModalConfig({
        isOpen: true,
        title: "Inicia sessão para responder",
        description: "Precisas de uma conta para responder a comentários nesta Tier List.",
      });
      return;
    }
    setReplyError("");
    if (!replyText.trim()) return;

    const safety = checkContentSafety(replyText);
    if (!safety.isSafe) {
      setReplyError(safety.reason || "A resposta contém linguagem ou termos impróprios.");
      return;
    }

    try {
      addReplyToComment(id, parentCommentId, {
        userUid: user.uid,
        userName: profile?.displayName || user.displayName || "Criador",
        userHandle: profile?.handle || `user_${user.uid.slice(0, 5)}`,
        userAvatar: profile?.avatar || user.photoURL || "",
        text: replyText.trim(),
        tierListTitle: tierList.title,
      });

      setComments(getCommentsForTierList(id));
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      setReplyError(err.message || "Erro ao adicionar resposta.");
    }
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
    const isForbidden = Boolean(tierList?.isPrivateForbidden);
    return (
      <div className="mx-auto max-w-[600px] px-6 py-28 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent mx-auto">
          {isForbidden ? <Lock size={26} /> : <Search size={26} />}
        </div>
        <h2 className="mb-2 font-display text-[26px] font-black text-white">
          {isForbidden
            ? t("tierListView.privateNotice")
            : t("tierListView.tierListNotFound")}
        </h2>
        <p className="mb-6 text-[14px] text-muted">
          {isForbidden
            ? "Esta tier list foi configurada como privada pelo autor. Apenas o criador com a respetiva conta pode aceder a este conteúdo."
            : "Esta tier list não foi encontrada. O link pode estar incorreto ou a lista foi removida. Todas as tier lists públicas podem ser vistas livremente sem necessidade de registo."}
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
            onClick={() => {
              if (!user) {
                setAuthModalConfig({
                  isOpen: true,
                  title: "Inicia sessão para criar a tua versão",
                  description: "Para remixares e publicares a tua versão desta Tier List, precisas de ter uma conta.",
                });
                return;
              }
              navigate(`/create?remix=${tierList.id}`);
            }}
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
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <Link to={`/explore?category=${tierList.category}`}>
              <Badge tone="accent">
                {getCategoryDisplayName(tierList.category)}
              </Badge>
            </Link>
            {tierList.subcategory && (
              <Link to={`/explore?category=${tierList.category}&sub=${encodeURIComponent(tierList.subcategory)}`}>
                <Badge tone="neutral">
                  {tierList.subcategory}
                </Badge>
              </Link>
            )}
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
      {/* Secção de Comentários */}
      <div className="mx-auto max-w-[840px]">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-[20px] font-bold text-white flex items-center gap-2">
            <MessageCircle size={20} className="text-accent" />
            <span>
              {t("tierListView.comments", {
                count: comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0),
              })}
            </span>
          </h3>
        </div>

        {/* Formulário Principal de Comentário */}
        {!user ? (
          <div className="mb-8 rounded-3xl border border-border bg-surface/70 p-6 sm:p-8 text-center backdrop-blur-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
              <MessageCircle size={22} />
            </div>
            <h4 className="mb-1.5 font-display text-[17px] font-bold text-white">
              Participa na discussão desta Tier List
            </h4>
            <p className="mb-5 text-[13px] text-muted max-w-md mx-auto leading-relaxed">
              Inicia sessão com a tua conta para comentar, partilhar a tua opinião com o criador e responder aos outros membros da comunidade.
            </p>
            <PrimaryButton
              small
              icon={LogIn}
              onClick={() =>
                setAuthModalConfig({
                  isOpen: true,
                  title: "Inicia sessão para comentar",
                  description: "Precisas de ter conta para publicar comentários e participar nos debates do TierWorld.",
                })
              }
            >
              Entrar para Comentar
            </PrimaryButton>
          </div>
        ) : (
          <form onSubmit={handleAddComment} className="mb-8">
            {commentError && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-400">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{commentError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Avatar
                name={profile?.displayName || user?.displayName || "Criador"}
                image={profile?.avatar || user?.photoURL}
                size={36}
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (commentError) setCommentError("");
                  }}
                  placeholder="Escreve a tua opinião… Podes mencionar criadores com @handle"
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-surface p-3.5 text-[13.5px] text-text outline-none focus:border-accent transition-colors"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-mutedDim">
                    💡 Dica: podes identificar criadores com <strong className="text-accent font-semibold">@handle</strong>.
                  </span>
                  <PrimaryButton small icon={Send} type="submit" disabled={!commentText.trim()}>
                    {t("tierListView.submitComment")}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Lista de Comentários */}
        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center text-[13.5px] text-muted">
              <MessageCircle size={28} className="mx-auto mb-2 opacity-30 text-muted" />
              <p>{t("tierListView.emptyComments")}</p>
            </div>
          ) : (
            comments.map((c) => {
              const isCommentAuthor = user?.uid && user.uid === c.userUid;
              const isListOwner = user?.uid && user.uid === tierList.ownerId;
              const canEditThis = isCommentAuthor;
              const canDeleteThis = isCommentAuthor || isListOwner;

              const isUserLiked = user && c.likes?.includes(user.uid);
              const isUserDisliked = user && c.dislikes?.includes(user.uid);
              const isEditingThis = editingTarget && editingTarget.commentId === c.id && !editingTarget.replyId;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-borderStrong"
                >
                  {/* Cabeçalho do Comentário */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.userName} image={c.userAvatar} size={30} />
                      <div>
                        <div className="flex items-center gap-2">
                          {c.userHandle ? (
                            <Link
                              to={`/profile/${c.userHandle}`}
                              className="font-display text-[13.5px] font-bold text-white hover:text-accent transition-colors"
                            >
                              {c.userName}
                            </Link>
                          ) : (
                            <span className="font-display text-[13.5px] font-bold text-white">
                              {c.userName}
                            </span>
                          )}

                          {c.userHandle && (
                            <span className="text-[11.5px] font-semibold text-mutedDim">
                              #{c.userHandle}
                            </span>
                          )}

                          {c.userUid && c.userUid === tierList.ownerId && (
                            <span className="rounded-md bg-accentSoft px-1.5 py-0.5 text-[10px] font-bold text-accent border border-accent/20">
                              Autor da Lista
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-mutedDim">
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.updatedAt && (
                            <span className="italic text-mutedDim/80">(editado)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações de Editar / Eliminar */}
                    <div className="flex items-center gap-1">
                      {canEditThis && !isEditingThis && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(c)}
                          className="rounded-lg p-1.5 text-mutedDim hover:bg-surface2 hover:text-white transition-colors"
                          title="Editar comentário"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {canDeleteThis && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCommentItem(c.id)}
                          className="rounded-lg p-1.5 text-mutedDim hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Eliminar comentário"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Corpo do Comentário */}
                  <div className="pl-10">
                    {isEditingThis ? (
                      <div className="my-2">
                        {editError && (
                          <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                            <AlertCircle size={14} />
                            <span>{editError}</span>
                          </div>
                        )}
                        <textarea
                          value={editingTarget.text}
                          onChange={(e) =>
                            setEditingTarget((prev) => ({ ...prev, text: e.target.value }))
                          }
                          rows={2}
                          className="w-full rounded-xl border border-border bg-surface2 p-2.5 text-[13px] text-text outline-none focus:border-accent"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTarget(null)}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-muted hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="rounded-lg bg-accent px-3 py-1 text-xs font-bold text-black hover:opacity-90 shadow-sm"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13.5px] leading-relaxed text-muted">
                        <FormattedCommentText text={c.text} />
                      </p>
                    )}

                    {/* Barra de Reações e Responder */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border/40 pt-2.5">
                      {/* Gostos */}
                      <button
                        type="button"
                        onClick={() => handleReact(c.id, null, "like")}
                        className={`inline-flex items-center gap-1 text-[12px] font-bold transition-colors ${
                          isUserLiked ? "text-teal" : "text-mutedDim hover:text-text"
                        }`}
                        title="Gosto"
                      >
                        <ThumbsUp size={13} className={isUserLiked ? "fill-teal" : ""} />
                        <span>{c.likes?.length || 0}</span>
                      </button>

                      {/* Não Gostos */}
                      <button
                        type="button"
                        onClick={() => handleReact(c.id, null, "dislike")}
                        className={`inline-flex items-center gap-1 text-[12px] font-bold transition-colors ${
                          isUserDisliked ? "text-red-400" : "text-mutedDim hover:text-text"
                        }`}
                        title="Não gosto"
                      >
                        <ThumbsDown size={13} className={isUserDisliked ? "fill-red-400" : ""} />
                        <span>{c.dislikes?.length || 0}</span>
                      </button>

                      {/* Responder */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            setAuthModalConfig({
                              isOpen: true,
                              title: "Inicia sessão para responder",
                              description: "Precisas de ter conta para responder a comentários nesta Tier List.",
                            });
                            return;
                          }
                          if (replyingTo === c.id) {
                            setReplyingTo(null);
                            setReplyText("");
                          } else {
                            setReplyingTo(c.id);
                            setReplyText(c.userHandle ? `@${c.userHandle} ` : "");
                            setReplyError("");
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-[12px] font-bold transition-colors ${
                          replyingTo === c.id ? "text-accent" : "text-mutedDim hover:text-text"
                        }`}
                      >
                        <CornerDownRight size={13} />
                        <span>Responder</span>
                      </button>
                    </div>

                    {/* Formulário de Resposta Inline */}
                    {replyingTo === c.id && (
                      <form
                        onSubmit={(e) => handleAddReplySubmit(c.id, e)}
                        className="mt-3 rounded-xl border border-border bg-surface2/60 p-3 animate-fadeIn"
                      >
                        {replyError && (
                          <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                            <AlertCircle size={14} />
                            <span>{replyError}</span>
                          </div>
                        )}
                        <textarea
                          value={replyText}
                          onChange={(e) => {
                            setReplyText(e.target.value);
                            if (replyError) setReplyError("");
                          }}
                          placeholder="Escreve a tua resposta… Podes mencionar com @handle"
                          rows={2}
                          className="w-full rounded-xl border border-border bg-surface p-2.5 text-[13px] text-text outline-none focus:border-accent"
                          autoFocus
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-muted hover:text-white"
                          >
                            Cancelar
                          </button>
                          <PrimaryButton small icon={Send} type="submit" disabled={!replyText.trim()}>
                            Responder
                          </PrimaryButton>
                        </div>
                      </form>
                    )}

                    {/* Respostas Aninhadas (Replies Thread) */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-3.5 flex flex-col gap-3 border-l-2 border-border/80 pl-3.5 sm:pl-4">
                        {c.replies.map((r) => {
                          const isReplyAuthor = user?.uid && user.uid === r.userUid;
                          const canEditReply = isReplyAuthor;
                          const canDeleteReply = isReplyAuthor || isListOwner;

                          const isReplyLiked = user && r.likes?.includes(user.uid);
                          const isReplyDisliked = user && r.dislikes?.includes(user.uid);
                          const isEditingThisReply =
                            editingTarget &&
                            editingTarget.commentId === c.id &&
                            editingTarget.replyId === r.id;

                          return (
                            <div
                              key={r.id}
                              className="rounded-xl border border-border/60 bg-surface2/40 p-3 transition-colors hover:border-borderStrong"
                            >
                              <div className="mb-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar name={r.userName} image={r.userAvatar} size={24} />
                                  <div className="flex items-center gap-1.5">
                                    {r.userHandle ? (
                                      <Link
                                        to={`/profile/${r.userHandle}`}
                                        className="font-display text-[12.5px] font-bold text-white hover:text-accent transition-colors"
                                      >
                                        {r.userName}
                                      </Link>
                                    ) : (
                                      <span className="font-display text-[12.5px] font-bold text-white">
                                        {r.userName}
                                      </span>
                                    )}

                                    {r.userHandle && (
                                      <span className="text-[11px] font-semibold text-mutedDim">
                                        #{r.userHandle}
                                      </span>
                                    )}

                                    {r.userUid && r.userUid === tierList.ownerId && (
                                      <span className="rounded bg-accentSoft px-1 py-0.2 text-[9px] font-bold text-accent border border-accent/20">
                                        Autor
                                      </span>
                                    )}

                                    <span className="text-[10.5px] text-mutedDim">
                                      • {new Date(r.createdAt).toLocaleDateString()}
                                    </span>
                                    {r.updatedAt && (
                                      <span className="text-[10px] text-mutedDim italic">
                                        (editado)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {canEditReply && !isEditingThisReply && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(r, true, c.id)}
                                      className="rounded p-1 text-mutedDim hover:text-white transition-colors"
                                      title="Editar resposta"
                                    >
                                      <Edit2 size={11} />
                                    </button>
                                  )}
                                  {canDeleteReply && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCommentItem(c.id, r.id)}
                                      className="rounded p-1 text-mutedDim hover:text-red-400 transition-colors"
                                      title="Eliminar resposta"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Conteúdo da Resposta */}
                              <div className="pl-8">
                                {isEditingThisReply ? (
                                  <div className="my-1.5">
                                    {editError && (
                                      <div className="mb-1.5 flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 p-1.5 text-xs text-red-400">
                                        <AlertCircle size={12} />
                                        <span>{editError}</span>
                                      </div>
                                    )}
                                    <textarea
                                      value={editingTarget.text}
                                      onChange={(e) =>
                                        setEditingTarget((prev) => ({
                                          ...prev,
                                          text: e.target.value,
                                        }))
                                      }
                                      rows={2}
                                      className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-text outline-none focus:border-accent"
                                    />
                                    <div className="mt-1.5 flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingTarget(null)}
                                        className="rounded px-2 py-0.5 text-xs text-muted hover:text-white"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        className="rounded bg-accent px-2.5 py-0.5 text-xs font-bold text-black hover:opacity-90"
                                      >
                                        Guardar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[13px] leading-relaxed text-muted">
                                    <FormattedCommentText text={r.text} />
                                  </p>
                                )}

                                {/* Reações na Resposta */}
                                <div className="mt-2 flex items-center gap-3 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleReact(c.id, r.id, "like")}
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                                      isReplyLiked ? "text-teal" : "text-mutedDim hover:text-text"
                                    }`}
                                    title="Gosto"
                                  >
                                    <ThumbsUp size={11} className={isReplyLiked ? "fill-teal" : ""} />
                                    <span>{r.likes?.length || 0}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleReact(c.id, r.id, "dislike")}
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                                      isReplyDisliked ? "text-red-400" : "text-mutedDim hover:text-text"
                                    }`}
                                    title="Não gosto"
                                  >
                                    <ThumbsDown
                                      size={11}
                                      className={isReplyDisliked ? "fill-red-400" : ""}
                                    />
                                    <span>{r.dislikes?.length || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Partilha Social */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={tierList.title}
        url={window.location.href}
        description={tierList.description || "Classificação completa no TierWorld"}
        onOpenExport={() => setExportOpen(true)}
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
          if (!user) {
            setDuelOpen(false);
            setAuthModalConfig({
              isOpen: true,
              title: "Inicia sessão para guardar a tua Tier List",
              description: "Para aplicares as posições do Duelo e publicares a tua Tier List, inicia sessão com a tua conta.",
            });
            return;
          }
          navigate(`/create?remix=${tierList.id}`);
        }}
      />

      {/* Modal de Autenticação para Interações */}
      <AuthRequiredModal
        isOpen={authModalConfig.isOpen}
        onClose={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
        title={authModalConfig.title}
        description={authModalConfig.description}
      />
    </div>
  );
}
