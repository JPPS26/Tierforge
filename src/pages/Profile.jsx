import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, Badge, EmptyState, GhostButton } from "../components/UI";
import TierListCard from "../components/TierListCard";
import { getUserTierLists } from "../lib/tierlists";

export default function Profile() {
  const { user, profile } = useAuth();
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

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-24 pt-10">
      <div className="mb-8 flex flex-wrap items-start gap-5.5">
        <Avatar name={displayName} size={84} />
        <div className="min-w-[240px] flex-1">
          <div className="mb-1.5 flex items-center gap-2.5">
            <h1 className="font-display text-[26px] font-bold">{displayName}</h1>
            <Badge tone="accent"><Crown size={11} /> Elite Creator</Badge>
          </div>
          <p className="mb-3.5 max-w-[480px] text-[14px] text-muted">
            {profile?.bio || "No bio yet — add one in Settings."}
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
          </div>
        </div>
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
      </div>

      {tab === "Created" && (
        loadingLists ? (
          <p className="text-muted">Loading your tier lists…</p>
        ) : lists.length === 0 ? (
          <EmptyState
            title="You haven't created any tier lists yet"
            body="Everything you build in the editor is saved here automatically."
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
            {lists.map((l) => <TierListCard key={l.id} list={{ ...l, votes: l.votes || 0, views: l.views || 0, comments: 0, creator: displayName, createdDaysAgo: 5 }} />)}
          </div>
        )
      )}
      {tab !== "Created" && (
        <EmptyState
          title={tab === "Favorites" ? "No favorites yet" : "No recent activity"}
          body={tab === "Favorites" ? "Tier lists you save will show up here." : "Votes, comments and follows will show up here."}
        />
      )}
    </div>
  );
}
