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
  Sparkles,
  Check,
  Send,
} from "lucide-react";
import {
  getTierListById,
  voteTierList,
  incrementViews,
  getCommentsForTierList,
  addCommentToTierList,
} from "../services/db";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, Badge, PrimaryButton, GhostButton, colorFor } from "../components/UI";

export default function TierListView() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tierList, setTierList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [userVoted, setUserVoted] = useState(null); // 'up' | 'down' | null
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getTierListById(id);
        setTierList(data);
        if (data) {
          incrementViews(id);
          const comms = getCommentsForTierList(id);
          setComments(comms);
        }
      } catch (err) {
        console.error("Error loading tier list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleVote(direction) {
    if (userVoted === direction) return;
    const diff = direction === "up" ? (userVoted === "down" ? 2 : 1) : (userVoted === "up" ? -2 : -1);
    setUserVoted(direction);
    const newVotes = await voteTierList(id, diff);
    setTierList((prev) => (prev ? { ...prev, votes: newVotes } : null));
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = addCommentToTierList(id, {
      userName: user?.displayName || user?.email?.split("@")[0] || "Visitante",
      userAvatar: user?.photoURL || "",
      text: commentText.trim(),
    });

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-28 text-center text-muted">
        A carregar tier list…
      </div>
    );
  }

  if (!tierList) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <h2 className="mb-2 font-display text-[24px] font-bold text-text">
          {t("tierListView.tierListNotFound")}
        </h2>
        <Link to="/explore">
          <PrimaryButton icon={ArrowLeft}>{t("tierListView.backToExplore")}</PrimaryButton>
        </Link>
      </div>
    );
  }

  const displayMode = tierList.itemDisplayMode || "both";
  const items = tierList.items || [];
  const placements = tierList.placements || {};
  const tiers = tierList.tiers || [];

  return (
    <div className="mx-auto max-w-[1140px] px-6 pb-28 pt-8">
      {/* Voltar e Meta */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} /> {t("tierListView.backToExplore")}
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text hover:bg-surface2 transition-colors"
        >
          {copied ? <Check size={14} className="text-teal" /> : <Share2 size={14} />}
          <span>{copied ? t("tierListView.linkCopied") : t("tierListView.share")}</span>
        </button>
      </div>

      {/* Cabeçalho da Tier List */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-7">
        <div className="flex-1 min-w-[280px]">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="accent">{tierList.category?.toUpperCase() || "GERAL"}</Badge>
            {tierList.createdDaysAgo !== undefined && tierList.createdDaysAgo <= 2 && (
              <Badge tone="teal">Novo</Badge>
            )}
          </div>

          <h1 className="font-display text-[28px] sm:text-[36px] font-black tracking-tight text-text">
            {tierList.title}
          </h1>

          {tierList.description && (
            <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              {tierList.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2.5">
            <Avatar name={tierList.creator} size={26} />
            <span className="text-[13.5px] font-semibold text-text">
              {tierList.creator || "Criador Anónimo"}
            </span>
            {tierList.creatorBadge && (
              <Badge tone="default">{tierList.creatorBadge}</Badge>
            )}
          </div>
        </div>

        {/* Painel de Votação e Estatísticas */}
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleVote("up")}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-bold transition-all ${
                userVoted === "up"
                  ? "border-teal bg-[rgba(49,216,168,0.15)] text-teal shadow-sm"
                  : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
              }`}
            >
              <ThumbsUp size={15} />
              <span>{t("tierListView.upvote")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote("down")}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-bold transition-all ${
                userVoted === "down"
                  ? "border-[#FF5470] bg-[rgba(255,84,112,0.15)] text-[#FF5470] shadow-sm"
                  : "border-border bg-surface text-muted hover:border-borderStrong hover:text-text"
              }`}
            >
              <ThumbsDown size={15} />
              <span>{t("tierListView.downvote")}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[12.5px] text-mutedDim">
            <span className="flex items-center gap-1">
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
          </div>
        </div>
      </div>

      {/* A Tier List Renderizada */}
      <div className="mb-14 overflow-hidden rounded-2xl border border-borderStrong bg-surface shadow-2xl">
        {tiers.map((tier) => {
          const tierItems = Object.entries(placements)
            .filter(([, tId]) => tId === tier.id)
            .map(([itemId]) => items.find((i) => i.id === itemId))
            .filter(Boolean);

          return (
            <div key={tier.id} className="flex border-b border-border/60 last:border-b-0">
              <div
                className="flex w-[80px] sm:w-[96px] flex-shrink-0 items-center justify-center p-2 text-center"
                style={{ background: tier.color }}
              >
                <span className="font-display text-[22px] sm:text-[26px] font-black text-[#0A0A0D]">
                  {tier.label}
                </span>
              </div>

              <div className="flex min-h-[96px] flex-1 flex-wrap items-center gap-2.5 p-3.5 bg-surface">
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
                        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-border transition-transform hover:scale-105 ${
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
                                ? "w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-1 pt-3 px-1 text-[10.5px] text-white"
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

      {/* Secção de Comentários e Debate Comunitário */}
      <div className="mx-auto max-w-[800px]">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-[20px] font-bold text-text flex items-center gap-2">
            <MessageCircle size={20} className="text-accent" />
            {t("tierListView.comments", { count: comments.length })}
          </h3>
        </div>

        {/* Formulário para adicionar comentário */}
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-3">
            <Avatar name={user?.displayName || "Eu"} size={36} />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("tierListView.addCommentPlaceholder")}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface p-3.5 text-[13.5px] text-text outline-none focus:border-accent"
              />
              <div className="mt-2 flex justify-end">
                <PrimaryButton small icon={Send} type="submit" disabled={!commentText.trim()}>
                  {t("tierListView.submitComment")}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </form>

        {/* Lista de Comentários */}
        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center text-[13.5px] text-muted">
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
                    <Avatar name={c.userName} size={28} />
                    <span className="font-display text-[13.5px] font-bold text-text">
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
    </div>
  );
}

