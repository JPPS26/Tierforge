import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Palette, Trash2, Wand2, Sparkles, Check, Share2 } from "lucide-react";
import { PrimaryButton, GhostButton, colorFor } from "../components/UI";
import { STARTER_ITEMS, TIER_COLORS } from "../data/mock";
import { useAuth } from "../context/AuthContext";
import { saveTierList } from "../lib/tierlists";

const DEFAULT_TIERS = [
  { id: "t1", label: "S", color: TIER_COLORS.S },
  { id: "t2", label: "A", color: TIER_COLORS.A },
  { id: "t3", label: "B", color: TIER_COLORS.B },
  { id: "t4", label: "C", color: TIER_COLORS.C },
  { id: "t5", label: "D", color: TIER_COLORS.D },
];

function ItemChip({ item, onDragStart, onDragEnd, dragging }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className="flex h-16 w-16 flex-shrink-0 cursor-grab select-none items-center justify-center rounded-[10px] border border-border p-1 text-center text-[10.5px] font-semibold leading-tight"
      style={{
        background: `linear-gradient(150deg, ${colorFor(item.name)}55, #271E17)`,
        opacity: dragging ? 0.35 : 1,
      }}
    >
      {item.name}
    </div>
  );
}

function TierRow({ tier, items, onDrop, onDragOver, isDragOver, onRename, onRecolor, onDelete, onItemDragStart, onItemDragEnd, draggingId }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(tier.label);
  const colorInputRef = useRef(null);

  return (
    <div className="mb-2 flex">
      <div className="relative w-[66px] flex-shrink-0">
        <div
          className="flex h-full min-h-[84px] w-full flex-col items-center justify-center gap-0.5 rounded-l-xl"
          style={{ background: tier.color }}
        >
          {editing ? (
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 4))}
              onBlur={() => { setEditing(false); onRename(label || tier.label); }}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="w-11 rounded bg-black/25 text-center font-display text-[15px] font-extrabold text-[#0A0A0D] outline-none"
            />
          ) : (
            <span onClick={() => setEditing(true)} className="cursor-text font-display text-[18px] font-extrabold text-[#0A0A0D]">
              {tier.label}
            </span>
          )}
          <button
            onClick={() => colorInputRef.current?.click()}
            className="flex h-5 w-5 items-center justify-center rounded bg-black/20"
            title="Change color"
          >
            <Palette size={11} className="text-[#0A0A0D]" />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={tier.color}
            onChange={(e) => onRecolor(e.target.value)}
            className="absolute h-0 w-0 opacity-0"
          />
        </div>
      </div>
      <div
        onDrop={(e) => onDrop(e, tier.id)}
        onDragOver={(e) => onDragOver(e, tier.id)}
        className={`flex min-h-[84px] flex-1 flex-wrap items-center gap-2 rounded-r-xl border p-2 ${
          isDragOver ? "border-[rgba(255,122,61,0.5)] bg-[rgba(255,122,61,0.08)]" : "border-border bg-surface"
        }`}
      >
        {items.length === 0 && <span className="px-2 text-[12.5px] text-mutedDim">Drop items here</span>}
        {items.map((it) => (
          <ItemChip key={it.id} item={it} dragging={draggingId === it.id} onDragStart={onItemDragStart} onDragEnd={onItemDragEnd} />
        ))}
        <button onClick={onDelete} title="Delete tier" className="ml-auto self-start p-1.5 text-mutedDim opacity-50 hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Builder() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [placements, setPlacements] = useState({});
  const [dragOverTier, setDragOverTier] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [title, setTitle] = useState("Untitled Tier List");
  const [category, setCategory] = useState("Football");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const itemsByTier = useCallback(
    (tierId) =>
      Object.entries(placements)
        .filter(([, t]) => t === tierId)
        .map(([id]) => STARTER_ITEMS.find((i) => i.id === id))
        .filter(Boolean),
    [placements]
  );
  const benchItems = STARTER_ITEMS.filter((it) => !placements[it.id]);

  function handleItemDragStart(e, item) {
    setDraggingId(item.id);
    e.dataTransfer.setData("text/plain", item.id);
  }
  function handleItemDragEnd() {
    setDraggingId(null);
    setDragOverTier(null);
  }
  function handleDrop(e, tierId) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) setPlacements((p) => ({ ...p, [id]: tierId }));
    setDragOverTier(null);
    setDraggingId(null);
  }
  function handleDragOver(e, tierId) {
    e.preventDefault();
    setDragOverTier(tierId);
  }
  function handleBenchDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) setPlacements((p) => { const n = { ...p }; delete n[id]; return n; });
    setDragOverTier(null);
    setDraggingId(null);
  }

  function addTier() {
    const letters = ["S+", "A+", "A-", "B+", "B-", "X", "?"];
    const used = tiers.map((t) => t.label);
    const label = letters.find((l) => !used.includes(l)) || `T${tiers.length + 1}`;
    setTiers((t) => [...t, { id: `t${Date.now()}`, label, color: "#9B7CFF" }]);
  }
  function removeTier(tierId) {
    setTiers((t) => t.filter((x) => x.id !== tierId));
    setPlacements((p) => {
      const n = { ...p };
      Object.keys(n).forEach((k) => { if (n[k] === tierId) delete n[k]; });
      return n;
    });
  }

  function runAIGenerate() {
    // Simulated AI assist — swap for a real call to your backend + the Anthropic API.
    const ids = STARTER_ITEMS.map((i) => i.id);
    const next = {};
    ids.forEach((id, idx) => {
      const tierIdx = Math.min(tiers.length - 1, Math.floor((idx / ids.length) * tiers.length));
      next[id] = tiers[tierIdx].id;
    });
    setPlacements(next);
    setAiOpen(false);
    if (aiPrompt.trim()) setTitle(aiPrompt.trim().slice(0, 60));
  }

  async function handlePublish() {
    if (!user) {
      navigate("/login");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      await saveTierList(user.uid, { title, category, tiers, placements });
      setSaveMsg("Saved to your profile ✓");
    } catch (err) {
      setSaveMsg("Couldn't save — check your Firestore rules and connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-24 pt-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[220px] flex-1 border-none bg-transparent font-display text-[28px] font-bold outline-none"
        />
        <div className="flex gap-2.5">
          <GhostButton small icon={Wand2} onClick={() => setAiOpen((v) => !v)}>AI Assist</GhostButton>
          <GhostButton small icon={Share2}>Share</GhostButton>
          <PrimaryButton small icon={Check} onClick={handlePublish} disabled={saving}>
            {saving ? "Saving…" : user ? "Publish" : "Log in to publish"}
          </PrimaryButton>
        </div>
      </div>

      {saveMsg && <p className="mb-4 text-[13px] text-teal">{saveMsg}</p>}

      {aiOpen && (
        <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-lg border border-[rgba(255,122,61,0.35)] bg-surface p-4.5">
          <Wand2 size={18} className="flex-shrink-0 text-[#FFB37D]" />
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder='Try: "Rank these players for a possession-based system"'
            className="min-w-[220px] flex-1 rounded-[10px] border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] outline-none"
          />
          <PrimaryButton small icon={Sparkles} onClick={runAIGenerate}>Generate draft</PrimaryButton>
        </div>
      )}

      <div className="mb-7">
        {tiers.map((tier) => (
          <TierRow
            key={tier.id}
            tier={tier}
            items={itemsByTier(tier.id)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            isDragOver={dragOverTier === tier.id}
            onRename={(label) => setTiers((t) => t.map((x) => (x.id === tier.id ? { ...x, label } : x)))}
            onRecolor={(color) => setTiers((t) => t.map((x) => (x.id === tier.id ? { ...x, color } : x)))}
            onDelete={() => removeTier(tier.id)}
            onItemDragStart={handleItemDragStart}
            onItemDragEnd={handleItemDragEnd}
            draggingId={draggingId}
          />
        ))}
        <button
          onClick={addTier}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[13.5px] text-mutedDim"
        >
          <Plus size={15} /> Add tier
        </button>
      </div>

      <div onDrop={handleBenchDrop} onDragOver={(e) => e.preventDefault()} className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13.5px] font-semibold text-muted">Item bench — drag into a tier</span>
        </div>
        <div className="flex min-h-[64px] flex-wrap gap-2">
          {benchItems.map((it) => (
            <ItemChip key={it.id} item={it} dragging={draggingId === it.id} onDragStart={handleItemDragStart} onDragEnd={handleItemDragEnd} />
          ))}
          {benchItems.length === 0 && <span className="text-[12.5px] text-mutedDim">All items placed 🎉</span>}
        </div>
      </div>
    </div>
  );
}
