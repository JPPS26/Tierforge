import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Palette, Trash2, Wand2, Sparkles, Check, Share2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Palette,
  Trash2,
  Check,
  Share2,
  Upload,
  Search,
  Image as ImageIcon,
  Type,
  Layers,
  Edit2,
  X,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { PrimaryButton, GhostButton, colorFor } from "../components/UI";
import { STARTER_ITEMS, TIER_COLORS } from "../data/mock";
import { useAuth } from "../context/AuthContext";
import { saveTierList } from "../lib/tierlists";
import { useLanguage } from "../context/LanguageContext";
import { createTierList, searchCatalog } from "../services/db";
import { REAL_CATEGORIES } from "../data/realCatalog";

const DEFAULT_TIERS = [
  { id: "t1", label: "S", color: TIER_COLORS.S },
  { id: "t2", label: "A", color: TIER_COLORS.A },
  { id: "t3", label: "B", color: TIER_COLORS.B },
  { id: "t4", label: "C", color: TIER_COLORS.C },
  { id: "t5", label: "D", color: TIER_COLORS.D },
  { id: "t1", label: "S", color: "#FF3B5C" },
  { id: "t2", label: "A", color: "#FF9F43" },
  { id: "t3", label: "B", color: "#FFD23F" },
  { id: "t4", label: "C", color: "#6BCB77" },
  { id: "t5", label: "D", color: "#4D96FF" },
];

function ItemChip({ item, onDragStart, onDragEnd, dragging }) {
// Componente que renderiza cada elemento (chip) de acordo com o modo selecionado:
// - Apenas texto/nome
// - Apenas imagem
// - Nome + Imagem em simultâneo
function ItemCard({ item, displayMode, onDragStart, onDragEnd, onEdit, onDelete, dragging }) {
  const mode = item.displayMode && item.displayMode !== "auto" ? item.displayMode : displayMode;
  const hasImage = Boolean(item.imageUrl);
  const name = item.name || "Elemento";

  // Se o utilizador escolheu apenas imagem mas o item não tem imagem, faz fallback elegante para texto
  const showImage = hasImage && (mode === "image" || mode === "both");
  const showText = mode === "text" || mode === "both" || !hasImage;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className="flex h-16 w-16 flex-shrink-0 cursor-grab select-none items-center justify-center rounded-[10px] border border-border p-1 text-center text-[10.5px] font-semibold leading-tight"
      className={`group relative flex cursor-grab select-none items-center justify-center overflow-hidden rounded-xl border border-border transition-all duration-150 hover:border-accent hover:shadow-lg active:cursor-grabbing ${
        mode === "image" && hasImage
          ? "h-20 w-20 flex-shrink-0 bg-surface2"
          : mode === "both" && hasImage
          ? "h-20 w-20 flex-shrink-0 bg-surface2 flex-col justify-end"
          : "h-16 min-w-[72px] max-w-[120px] flex-shrink-0 px-2.5 py-1.5 text-center"
      }`}
      style={{
        background: `linear-gradient(150deg, ${colorFor(item.name)}55, #191922)`,
        background:
          showImage && !showText
            ? "#121218"
            : showImage && showText
            ? "#14141D"
            : `linear-gradient(145deg, ${colorFor(name)}40, #161620)`,
        opacity: dragging ? 0.35 : 1,
      }}
      title={name}
    >
      {item.name}
      {/* Imagem de fundo ou centrada */}
      {showImage && (
        <img
          src={item.imageUrl}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-105 ${
            showText ? "absolute inset-0 z-0 opacity-80" : ""
          }`}
          onError={(e) => {
            // Em caso de erro de carregamento da imagem, substitui por estilo fallback
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      {/* Rótulo de texto / nome */}
      {showText && (
        <div
          className={`z-10 font-display text-center font-bold leading-tight ${
            showImage
              ? "w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-1 pt-3 px-1 text-[10.5px] text-white"
              : "text-[11.5px] text-text"
          }`}
        >
          <span className="line-clamp-2">{name}</span>
        </div>
      )}

      {/* Botões de Ação rápida no hover (Editar / Remover) */}
      <div className="absolute right-1 top-1 z-20 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/75 text-white/90 hover:bg-accent hover:text-white"
            title="Editar elemento"
          >
            <Edit2 size={10} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/75 text-[#FF5470] hover:bg-[#FF5470] hover:text-white"
            title="Eliminar elemento"
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

function TierRow({ tier, items, onDrop, onDragOver, isDragOver, onRename, onRecolor, onDelete, onItemDragStart, onItemDragEnd, draggingId }) {
function TierRow({
  tier,
  items,
  displayMode,
  onDrop,
  onDragOver,
  isDragOver,
  onRename,
  onRecolor,
  onDelete,
  onItemDragStart,
  onItemDragEnd,
  onEditItem,
  onDeleteItem,
  draggingId,
  t,
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(tier.label);
  const colorInputRef = useRef(null);

  return (
    <div className="mb-2 flex">
      <div className="relative w-[66px] flex-shrink-0">
    <div className="mb-2.5 flex">
      <div className="relative w-[72px] flex-shrink-0">
        <div
          className="flex h-full min-h-[84px] w-full flex-col items-center justify-center gap-0.5 rounded-l-xl"
          className="flex h-full min-h-[96px] w-full flex-col items-center justify-center gap-1 rounded-l-2xl shadow-inner"
          style={{ background: tier.color }}
        >
          {editing ? (
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 4))}
              onBlur={() => { setEditing(false); onRename(label || tier.label); }}
              onChange={(e) => setLabel(e.target.value.slice(0, 5))}
              onBlur={() => {
                setEditing(false);
                onRename(label || tier.label);
              }}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="w-11 rounded bg-black/25 text-center font-display text-[15px] font-extrabold text-[#0A0A0D] outline-none"
              className="w-12 rounded-lg bg-black/30 text-center font-display text-[15px] font-extrabold text-[#0A0A0D] outline-none"
            />
          ) : (
            <span onClick={() => setEditing(true)} className="cursor-text font-display text-[18px] font-extrabold text-[#0A0A0D]">
            <span
              onClick={() => setEditing(true)}
              className="cursor-text font-display text-[20px] font-black tracking-tight text-[#0A0A0D] transition-transform hover:scale-105"
              title={t("builder.editTierName")}
            >
              {tier.label}
            </span>
          )}
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="flex h-5 w-5 items-center justify-center rounded bg-black/20"
            title="Change color"
            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/20 transition-colors hover:bg-black/40"
            title={t("builder.changeColor")}
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
          isDragOver ? "border-[rgba(124,92,255,0.5)] bg-[rgba(124,92,255,0.08)]" : "border-border bg-surface"
        className={`flex min-h-[96px] flex-1 flex-wrap items-center gap-2.5 rounded-r-2xl border p-3 transition-colors ${
          isDragOver
            ? "border-[rgba(124,92,255,0.6)] bg-[rgba(124,92,255,0.09)]"
            : "border-border bg-surface hover:border-borderStrong"
        }`}
      >
        {items.length === 0 && <span className="px-2 text-[12.5px] text-mutedDim">Drop items here</span>}
        {items.length === 0 && (
          <span className="px-3 text-[13px] font-medium text-mutedDim">
            {t("builder.dropHere")}
          </span>
        )}
        {items.map((it) => (
          <ItemChip key={it.id} item={it} dragging={draggingId === it.id} onDragStart={onItemDragStart} onDragEnd={onItemDragEnd} />
          <ItemCard
            key={it.id}
            item={it}
            displayMode={displayMode}
            dragging={draggingId === it.id}
            onDragStart={onItemDragStart}
            onDragEnd={onItemDragEnd}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        ))}
        <button onClick={onDelete} title="Delete tier" className="ml-auto self-start p-1.5 text-mutedDim opacity-50 hover:opacity-100">
          <Trash2 size={14} />

        <button
          type="button"
          onClick={onDelete}
          title={t("builder.deleteTier")}
          className="ml-auto self-start p-1.5 text-mutedDim opacity-40 transition-opacity hover:opacity-100 hover:text-[#FF5470]"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Builder() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Tier list state — Começa 100% VAZIA sem itens pré-preenchidos!
  const [items, setItems] = useState([]); // Nenhum item inicial!
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [placements, setPlacements] = useState({});
  const [placements, setPlacements] = useState({}); // Nenhum posicionamento inicial!
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("football");

  // Modo de exibição: "both" (Imagem + Nome), "image" (Apenas Imagem), "text" (Apenas Nome)
  const [displayMode, setDisplayMode] = useState("both");

  // Drag and drop state
  const [dragOverTier, setDragOverTier] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [title, setTitle] = useState("Untitled Tier List");
  const [category, setCategory] = useState("Football");
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Modais
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Form states para adição / edição manual
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMode, setFormMode] = useState("auto");

  // Estado de pesquisa na base de dados real
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Upload input ref
  const fileInputRef = useRef(null);

  // Status de publicação
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");

  // Separar itens por tier e bancada
  const itemsByTier = useCallback(
    (tierId) =>
      Object.entries(placements)
        .filter(([, t]) => t === tierId)
        .map(([id]) => STARTER_ITEMS.find((i) => i.id === id))
        .map(([id]) => items.find((i) => i.id === id))
        .filter(Boolean),
    [placements]
    [items, placements]
  );
  const benchItems = STARTER_ITEMS.filter((it) => !placements[it.id]);

  const benchItems = items.filter((it) => !placements[it.id]);

  // Gestão de Drag & Drop de itens
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
    if (id) {
      setPlacements((prev) => ({ ...prev, [id]: tierId }));
    }
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
    if (id) {
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setDragOverTier(null);
    setDraggingId(null);
  }

  // Upload direto de ficheiros do computador (arrastar ou selecionar)
  function handleFilesUpload(fileList) {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        // Gera um nome limpo a partir do nome do ficheiro (sem extensão e underscores substituídos por espaços)
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const newItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: cleanName,
          imageUrl: base64Url,
          displayMode: "auto",
        };

        setItems((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
  }

  // Drag & drop de ficheiros de imagem diretamente para a bancada
  function handleBenchFileDrop(e) {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    } else {
      handleBenchDrop(e);
    }
  }

  // Gestão de Tiers
  function addTier() {
    const letters = ["S+", "A+", "A-", "B+", "B-", "X", "?"];
    const letters = ["S+", "S", "A+", "A", "B", "C", "D", "F", "GOAT"];
    const used = tiers.map((t) => t.label);
    const label = letters.find((l) => !used.includes(l)) || `T${tiers.length + 1}`;
    setTiers((t) => [...t, { id: `t${Date.now()}`, label, color: "#9B7CFF" }]);
    setTiers((t) => [...t, { id: `t${Date.now()}`, label, color: "#8A6BFF" }]);
  }

  function removeTier(tierId) {
    setTiers((t) => t.filter((x) => x.id !== tierId));
    setPlacements((p) => {
      const n = { ...p };
      Object.keys(n).forEach((k) => { if (n[k] === tierId) delete n[k]; });
      return n;
    setPlacements((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === tierId) delete next[k];
      });
      return next;
    });
  }

  function runAIGenerate() {
    // Simulated AI assist — swap for a real call to your backend + the Anthropic API.
    const ids = STARTER_ITEMS.map((i) => i.id);
    const next = {};
    ids.forEach((id, idx) => {
      const tierIdx = Math.min(tiers.length - 1, Math.floor((idx / ids.length) * tiers.length));
      next[id] = tiers[tierIdx].id;
  // Adicionar / Editar manual
  function openAddModal() {
    setEditingItem(null);
    setFormName("");
    setFormImageUrl("");
    setFormMode("auto");
    setAddModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormImageUrl(item.imageUrl || "");
    setFormMode(item.displayMode || "auto");
    setAddModalOpen(true);
  }

  function handleSaveElement(e) {
    e.preventDefault();
    if (!formName.trim() && !formImageUrl.trim()) return;

    if (editingItem) {
      // Atualizar
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? { ...it, name: formName.trim(), imageUrl: formImageUrl.trim(), displayMode: formMode }
            : it
        )
      );
    } else {
      // Novo elemento
      const newItem = {
        id: `custom-${Date.now()}`,
        name: formName.trim() || "Elemento",
        imageUrl: formImageUrl.trim() || "",
        displayMode: formMode,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setAddModalOpen(false);
  }

  function handleDeleteItem(itemId) {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setPlacements(next);
    setAiOpen(false);
    if (aiPrompt.trim()) setTitle(aiPrompt.trim().slice(0, 60));
  }

  function handleClearBench() {
    if (benchItems.length === 0) return;
    if (window.confirm(t("builder.resetConfirm"))) {
      setItems((prev) => prev.filter((it) => placements[it.id]));
    }
  }

  // Pesquisa no catálogo real e enciclopédia
  async function handleSearch(query) {
    setSearchQuery(query);
    setSearching(true);
    try {
      const results = await searchCatalog(query, category, language);
      setSearchResults(results);
    } catch (e) {
      console.warn("Search catalog error:", e);
    } finally {
      setSearching(false);
    }
  }

  function addFromCatalog(entity) {
    // Verifica se já existe na lista
    const alreadyExists = items.some(
      (it) => it.name.toLowerCase() === entity.name.toLowerCase()
    );
    if (alreadyExists) return;

    const newItem = {
      id: entity.id || `real-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: entity.name,
      imageUrl: entity.imageUrl || "",
      displayMode: "auto",
      description: entity.description || "",
      category: entity.category || category,
    };

    setItems((prev) => [...prev, newItem]);
  }

  // Publicar Tier List
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
      const result = await createTierList(user?.uid || null, {
        title: title.trim() || t("builder.defaultTitle"),
        category,
        language,
        tiers,
        items,
        placements,
        itemDisplayMode: displayMode,
        creatorName: user?.displayName || user?.email?.split("@")[0] || "Criador TierForge",
      });

      setSavedId(result.id);
      setSaveMsg(t("builder.savedSuccess"));
    } catch (err) {
      setSaveMsg("Couldn't save — check your Firestore rules and connection.");
      setSaveMsg(t("builder.saveError"));
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
    <div className="mx-auto max-w-[1140px] px-6 pb-28 pt-8">
      {/* Barra de Título, Categoria e Ações Principais */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex-1 min-w-[280px]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("builder.titlePlaceholder")}
            className="w-full border-none bg-transparent font-display text-[26px] sm:text-[32px] font-bold text-text outline-none placeholder:text-mutedDim focus:placeholder:text-transparent"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] font-medium text-muted">{t("builder.categoryLabel")}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-border bg-surface2 px-3 py-1.5 text-[13px] font-medium text-text outline-none focus:border-accent"
            >
              {REAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão de Publicar e Partilhar */}
        <div className="flex items-center gap-2.5">
          {savedId && (
            <Link to={`/tier-list/${savedId}`}>
              <GhostButton small icon={ExternalLink}>
                {t("builder.previewList")}
              </GhostButton>
            </Link>
          )}

          <PrimaryButton small icon={Check} onClick={handlePublish} disabled={saving}>
            {saving ? "Saving…" : user ? "Publish" : "Log in to publish"}
            {saving ? t("builder.publishing") : t("builder.publish")}
          </PrimaryButton>
        </div>
      </div>

      {saveMsg && <p className="mb-4 text-[13px] text-teal">{saveMsg}</p>}

      {aiOpen && (
        <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-2xl border border-[rgba(124,92,255,0.35)] bg-surface p-4.5">
          <Wand2 size={18} className="flex-shrink-0 text-[#B6A5FF]" />
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder='Try: "Rank these players for a possession-based system"'
            className="min-w-[220px] flex-1 rounded-[10px] border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] outline-none"
          />
          <PrimaryButton small icon={Sparkles} onClick={runAIGenerate}>Generate draft</PrimaryButton>
      {/* Mensagem de confirmação ao publicar */}
      {saveMsg && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[rgba(49,216,168,0.35)] bg-[rgba(49,216,168,0.12)] p-4 text-[13.5px] text-teal">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{saveMsg}</span>
          </div>
          {savedId && (
            <Link to={`/tier-list/${savedId}`} className="font-semibold underline hover:text-white">
              {t("builder.previewList")} →
            </Link>
          )}
        </div>
      )}

      <div className="mb-7">
      {/* Seletor de Modo de Exibição dos Elementos */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-accent" />
          <span className="text-[13.5px] font-semibold text-text">
            {t("builder.displayModeLabel")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface2 p-1">
          <button
            type="button"
            onClick={() => setDisplayMode("both")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
              displayMode === "both"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            <ImageIcon size={13} /> + <Type size={13} />
            <span>{t("builder.displayBoth")}</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode("image")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
              displayMode === "image"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            <ImageIcon size={13} />
            <span>{t("builder.displayImage")}</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode("text")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
              displayMode === "text"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            <Type size={13} />
            <span>{t("builder.displayText")}</span>
          </button>
        </div>
      </div>

      {/* Linhas de Tiers */}
      <div className="mb-8">
        {tiers.map((tier) => (
          <TierRow
            key={tier.id}
            tier={tier}
            items={itemsByTier(tier.id)}
            displayMode={displayMode}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            isDragOver={dragOverTier === tier.id}
            onRename={(label) => setTiers((t) => t.map((x) => (x.id === tier.id ? { ...x, label } : x)))}
            onRecolor={(color) => setTiers((t) => t.map((x) => (x.id === tier.id ? { ...x, color } : x)))}
            onRename={(label) =>
              setTiers((t) => t.map((x) => (x.id === tier.id ? { ...x, label } : x)))
            }
            onRecolor={(color) =>
              setTiers((t) => t.map((x) => (x.id === tier.id ? { ...x, color } : x)))
            }
            onDelete={() => removeTier(tier.id)}
            onItemDragStart={handleItemDragStart}
            onItemDragEnd={handleItemDragEnd}
            onEditItem={openEditModal}
            onDeleteItem={handleDeleteItem}
            draggingId={draggingId}
            t={t}
          />
        ))}

        <button
          type="button"
          onClick={addTier}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[13.5px] text-mutedDim"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-[13.5px] font-semibold text-muted transition-colors hover:border-accent hover:text-text"
        >
          <Plus size={15} /> Add tier
          <Plus size={16} /> {t("builder.addTier")}
        </button>
      </div>

      <div onDrop={handleBenchDrop} onDragOver={(e) => e.preventDefault()} className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13.5px] font-semibold text-muted">Item bench — drag into a tier</span>
      {/* Bancada de Elementos — COMEÇA TOTALMENTE VAZIA */}
      <div
        onDrop={handleBenchFileDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        className={`rounded-2xl border bg-surface p-5 transition-all ${
          isDraggingFile
            ? "border-accent bg-accentSoft/30 shadow-glow"
            : "border-border"
        }`}
      >
        {/* Cabeçalho da Bancada e Ações Rápidas */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-[16px] font-bold text-text">
              {t("builder.benchTitle")}
            </span>
            <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-[12px] font-semibold text-muted">
              {benchItems.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Input oculto para carregar ficheiros locais */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesUpload(e.target.files)}
              className="hidden"
            />

            <PrimaryButton small icon={Plus} onClick={openAddModal}>
              {t("builder.actions.addElement")}
            </PrimaryButton>

            <GhostButton
              small
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("builder.actions.uploadImages")}
            </GhostButton>

            <GhostButton
              small
              icon={Search}
              onClick={() => {
                setSearchModalOpen(true);
                handleSearch("");
              }}
            >
              {t("builder.actions.searchDatabase")}
            </GhostButton>

            {benchItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearBench}
                className="rounded-xl p-2 text-mutedDim transition-colors hover:bg-surface2 hover:text-[#FF5470]"
                title={t("builder.actions.clearAll")}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
        <div className="flex min-h-[64px] flex-wrap gap-2">
          {benchItems.map((it) => (
            <ItemChip key={it.id} item={it} dragging={draggingId === it.id} onDragStart={handleItemDragStart} onDragEnd={handleItemDragEnd} />
          ))}
          {benchItems.length === 0 && <span className="text-[12.5px] text-mutedDim">All items placed 🎉</span>}

        {/* Conteúdo da Bancada */}
        {items.length === 0 ? (
          /* Estado 100% VAZIO com guia explicativo amigável */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center px-4">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent">
              <Sparkles size={26} />
            </div>
            <h3 className="mb-1.5 font-display text-[17px] font-bold text-text">
              {t("builder.benchEmptyTitle")}
            </h3>
            <p className="mb-6 max-w-md text-[13.5px] leading-relaxed text-muted">
              {t("builder.benchEmptySubtitle")}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton small icon={Plus} onClick={openAddModal}>
                {t("builder.actions.addElement")}
              </PrimaryButton>
              <GhostButton
                small
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
              >
                {t("builder.actions.uploadImages")}
              </GhostButton>
              <GhostButton
                small
                icon={Search}
                onClick={() => {
                  setSearchModalOpen(true);
                  handleSearch("");
                }}
              >
                {t("builder.actions.searchDatabase")}
              </GhostButton>
            </div>
          </div>
        ) : benchItems.length === 0 ? (
          <div className="py-8 text-center text-[13.5px] text-teal font-medium">
            {t("builder.benchAllPlaced")}
          </div>
        ) : (
          <div className="flex min-h-[90px] flex-wrap items-center gap-2.5">
            {benchItems.map((it) => (
              <ItemCard
                key={it.id}
                item={it}
                displayMode={displayMode}
                dragging={draggingId === it.id}
                onDragStart={handleItemDragStart}
                onDragEnd={handleItemDragEnd}
                onEdit={openEditModal}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Adicionar / Editar Elemento Manualmente */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-2xl border border-borderStrong bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-text">
                {editingItem ? t("builder.modalEditTitle") : t("builder.modalAddTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveElement} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text">
                  {t("builder.elementName")}
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t("builder.elementNamePlaceholder")}
                  className="w-full rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] text-text outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text">
                  {t("builder.elementImage")}
                </label>
                <input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder={t("builder.elementImagePlaceholder")}
                  className="w-full rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] text-text outline-none focus:border-accent"
                />
              </div>

              {/* Botão para carregar imagem do computador neste modal */}
              <div className="rounded-xl border border-dashed border-border p-3 text-center">
                <input
                  type="file"
                  id="modal-file-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setFormImageUrl(ev.target.result);
                      if (!formName.trim()) {
                        setFormName(
                          file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                        );
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="modal-file-upload"
                  className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-accent hover:underline"
                >
                  <Upload size={14} /> {t("builder.elementUploadBtn")}
                </label>
              </div>

              {/* Estilo individual opcional */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text">
                  {t("builder.elementDisplayMode")}
                </label>
                <select
                  value={formMode}
                  onChange={(e) => setFormMode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
                >
                  <option value="auto">{t("builder.displayAuto")}</option>
                  <option value="both">{t("builder.displayBoth")}</option>
                  <option value="image">{t("builder.displayImage")}</option>
                  <option value="text">{t("builder.displayText")}</option>
                </select>
              </div>

              {/* Pré-visualização do elemento */}
              {(formName || formImageUrl) && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface2 p-3">
                  <span className="text-[12px] text-muted">Pré-visualização:</span>
                  <ItemCard
                    item={{
                      id: "preview",
                      name: formName || "Elemento",
                      imageUrl: formImageUrl,
                      displayMode: formMode,
                    }}
                    displayMode={displayMode}
                    dragging={false}
                    onDragStart={() => {}}
                    onDragEnd={() => {}}
                  />
                </div>
              )}

              <div className="mt-2 flex justify-end gap-2.5">
                <GhostButton small onClick={() => setAddModalOpen(false)}>
                  {t("builder.cancel")}
                </GhostButton>
                <PrimaryButton small type="submit">
                  {editingItem ? t("builder.updateElement") : t("builder.saveElement")}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* MODAL 2: Pesquisar na Base de Dados Real & Enciclopédia */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-[640px] flex-col rounded-2xl border border-borderStrong bg-surface shadow-2xl overflow-hidden">
            {/* Cabeçalho do Modal */}
            <div className="border-b border-border p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-[18px] font-bold text-text flex items-center gap-2">
                  <Search size={18} className="text-accent" />
                  {t("builder.searchModalTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="rounded-lg p-1.5 text-muted hover:bg-surface2 hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-[13px] text-muted">
                {t("builder.searchModalDesc")}
              </p>

              {/* Input de Pesquisa em tempo real */}
              <div className="relative mt-3.5">
                <Search size={16} className="absolute left-3.5 top-[11px] text-mutedDim" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("builder.searchPlaceholder")}
                  className="w-full rounded-xl border border-border bg-surface2 py-2.5 pl-10 pr-4 text-[13.5px] text-text outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Resultados da Base de Dados Real */}
            <div className="flex-1 overflow-y-auto p-5">
              {searching ? (
                <div className="py-12 text-center text-[13.5px] text-muted">
                  {t("builder.searching")}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-[13.5px] text-muted">
                  {searchQuery ? t("builder.noResultsAtAll") : t("builder.noResultsFound")}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((entity) => {
                    const isAdded = items.some(
                      (it) => it.name.toLowerCase() === entity.name.toLowerCase()
                    );
                    return (
                      <div
                        key={entity.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface2 p-2.5 transition-colors hover:border-borderStrong"
                      >
                        {entity.imageUrl ? (
                          <img
                            src={entity.imageUrl}
                            alt={entity.name}
                            className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface text-[14px] font-bold text-muted">
                            {entity.name[0]}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="truncate font-display text-[13.5px] font-bold text-text">
                            {entity.name}
                          </div>
                          {entity.description && (
                            <div className="truncate text-[11.5px] text-mutedDim">
                              {entity.description}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => addFromCatalog(entity)}
                          disabled={isAdded}
                          className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                            isAdded
                              ? "bg-accentSoft text-[#B6A5FF] opacity-60"
                              : "bg-accent text-white hover:bg-accent/90"
                          }`}
                        >
                          {isAdded ? t("builder.alreadyAdded") : t("builder.addToTierList")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="border-t border-border p-4 flex justify-between items-center bg-surface">
              <span className="text-[12px] text-mutedDim">
                {t("builder.itemsCount", { count: items.length })}
              </span>
              <GhostButton small onClick={() => setSearchModalOpen(false)}>
                {t("builder.close")}
              </GhostButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
