import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Crown, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, Badge, EmptyState, GhostButton } from "../components/UI";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, Badge, EmptyState, PrimaryButton } from "../components/UI";
import TierListCard from "../components/TierListCard";
import { getUserTierLists } from "../lib/tierlists";
import { getUserTierLists } from "../services/db";

export default function Profile() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("Created");
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserTierLists(user.uid)
      .then(setLists)
      .finally(() => setLoadingLists(false));
  }, [user]);

  const displayName = profile?.displayName || user?.email || "Creator";
  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Criador";

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-24 pt-10">
      <div className="mb-8 flex flex-wrap items-start gap-5.5">
        <Avatar name={displayName} size={84} />
      <div className="mb-8 flex flex-wrap items-start gap-6 border-b border-border pb-8">
        <Avatar name={displayName} size={88} />
        <div className="min-w-[240px] flex-1">
          <div className="mb-1.5 flex items-center gap-2.5">
            <h1 className="font-display text-[26px] font-bold">{displayName}</h1>
            <Badge tone="accent"><Crown size={11} /> Elite Creator</Badge>
          <div className="mb-2 flex items-center gap-2.5">
            <h1 className="font-display text-[28px] font-black text-white">{displayName}</h1>
            <Badge tone="accent">
              <Crown size={12} /> {t("profile.eliteCreator")}
            </Badge>
          </div>
          <p className="mb-3.5 max-w-[480px] text-[14px] text-muted">
            {profile?.bio || "No bio yet — add one in Settings."}
          <p className="mb-4 max-w-lg text-[14px] text-muted">
            {profile?.bio || t("profile.bioPlaceholder")}
          </p>
          <div className="flex flex-wrap gap-6">
            {[[lists.length, "Tier lists"], ["0", "Followers"], ["0", "Following"], [profile?.creatorXp ?? 0, "Creator XP"]].map(
              ([n, l]) => (
                <div key={l}>
                  <div className="font-display text-[18px] font-bold">{n}</div>
                  <div className="text-[11.5px] text-mutedDim">{l}</div>
                </div>
              )
            )}
          <div className="flex flex-wrap gap-7">
            {[
              [lists.length, t("profile.tierLists")],
              ["0", t("profile.followers")],
              ["0", t("profile.following")],
              [profile?.creatorXp ?? 120, t("profile.creatorXp")],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-[19px] font-bold text-white">{n}</div>
                <div className="text-[12px] text-mutedDim">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <Link to="/create">
          <PrimaryButton small icon={Plus}>
            {t("builder.publish")}
          </PrimaryButton>
        </Link>
      </div>

      <div className="mb-6 flex gap-5 border-b border-border">
        {["Created", "Favorites", "Activity"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 pb-2.5 text-[14px] font-semibold ${
              tab === t ? "border-accent text-text" : "border-transparent text-mutedDim"
            }`}
          >
            {t}
          </button>
        ))}
      <div className="mb-6 flex gap-6 border-b border-border">
        {["Created", "Favorites", "Activity"].map((tabKey) => {
          const label =
            tabKey === "Created"
              ? t("profile.tabCreated")
              : tabKey === "Favorites"
              ? t("profile.tabFavorites")
              : t("profile.tabActivity");
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

      {tab === "Created" && (
        loadingLists ? (
          <p className="text-muted">Loading your tier lists…</p>
          <p className="text-muted">A carregar as tuas tier lists…</p>
        ) : lists.length === 0 ? (
          <EmptyState
            title="You haven't created any tier lists yet"
            body="Everything you build in the editor is saved here automatically."
            title={t("profile.emptyCreatedTitle")}
            body={t("profile.emptyCreatedDesc")}
            cta={
              <Link to="/create" className="mt-2">
                <PrimaryButton icon={Plus}>{t("profile.emptyCreatedCta")}</PrimaryButton>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
            {lists.map((l) => <TierListCard key={l.id} list={{ ...l, votes: l.votes || 0, views: l.views || 0, comments: 0, creator: displayName, createdDaysAgo: 5 }} />)}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {lists.map((l) => (
              <TierListCard key={l.id} list={l} />
            ))}
          </div>
        )
      )}

      {tab !== "Created" && (
        <EmptyState
          title={tab === "Favorites" ? "No favorites yet" : "No recent activity"}
          body={tab === "Favorites" ? "Tier lists you save will show up here." : "Votes, comments and follows will show up here."}
          title={tab === "Favorites" ? "Sem favoritas ainda" : "Sem atividade recente"}
          body="As tuas ações na comunidade serão guardadas aqui."
        />
      )}
    </div>
  );
}
