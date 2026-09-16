import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams, useParams } from "react-router-dom";
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
  Globe,
  Lock,
  Link2,
  Swords,
  FileText,
  Wand2,
  ArrowLeft,
  ChevronDown,
  Info,
  SlidersHorizontal,
  RefreshCw,
  FolderPlus,
  Download,
} from "lucide-react";
import { PrimaryButton, GhostButton, colorFor } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  createTierList,
  searchCatalog,
  getCategories,
  saveCategoryWithApiData,
  getTierListById,
  updateTierList,
  deleteTierList,
  canEditTierList,
} from "../services/db";
import { searchApiCategories, fetchCategoryDetailsFromApi, slugifyCategory } from "../services/categoriesApi";
import ShareModal from "../components/ShareModal";
import ExportModal from "../components/ExportModal";
import DuelModeModal from "../components/DuelModeModal";
import { detectCategory } from "../services/autoCategory";
import { compressImage } from "../services/imageOptimizer";

const DEFAULT_TIERS = [
  { id: "t1", label: "S", color: "#FF3B5C" },
  { id: "t2", label: "A", color: "#FF9F43" },
  { id: "t3", label: "B", color: "#FFD23F" },
  { id: "t4", label: "C", color: "#6BCB77" },
  { id: "t5", label: "D", color: "#4D96FF" },
];

const THEME_PRESETS = {
  classic: {
    name: "Clássico",
    colors: ["#FF3B5C", "#FF9F43", "#FFD23F", "#6BCB77", "#4D96FF", "#8A6BFF"],
  },
  cyberpunk: {
    name: "Cyberpunk Neon",
    colors: ["#FF007F", "#00F0FF", "#FFE600", "#7B2CBF", "#240046", "#05D9E8"],
  },
  obsidian: {
    name: "Obsidian Dourado",
    colors: ["#E6AF2E", "#C0C0C0", "#CD7F32", "#4A4E69", "#22223B", "#101016"],
  },
  pastel: {
    name: "Pastel Modern",
    colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D7BAFF"],
  },
  emerald: {
    name: "Esmeralda & Menta",
    colors: ["#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#064E3B"],
  },
};

function ItemCard({ item, displayMode, onDragStart, onDragEnd, onEdit, onDelete, dragging }) {
  const mode = item.displayMode && item.displayMode !== "auto" ? item.displayMode : displayMode;
  const hasImage = Boolean(item.imageUrl);
  const name = item.name || "Elemento";

  const showImage = hasImage && (mode === "image" || mode === "both");
  const showText = mode === "text" || mode === "both" || !hasImage;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className={`group relative flex cursor-grab select-none items-center justify-center overflow-hidden rounded-2xl border transition-all duration-200 hover:border-accent hover:shadow-glow hover:-translate-y-0.5 active:cursor-grabbing ${
        mode === "image" && hasImage
          ? "h-20 w-20 flex-shrink-0 bg-surface2 border-border/80"
          : mode === "both" && hasImage
          ? "h-20 w-20 flex-shrink-0 bg-surface2 border-border/80 flex-col justify-end"
          : "h-16 min-w-[76px] max-w-[124px] flex-shrink-0 px-2.5 py-1.5 text-center border-border/70"
      }`}
      style={{
        background:
          showImage && !showText
            ? "#0e0e14"
            : showImage && showText
            ? "#12121a"
            : `linear-gradient(145deg, ${colorFor(name)}35, #14141e)`,
        opacity: dragging ? 0.35 : 1,
      }}
      title={name}
    >
      {showImage && (
        <img
          src={item.imageUrl}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            showText ? "absolute inset-0 z-0 opacity-85" : ""
          }`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      {showText && (
        <div
          className={`z-10 font-display text-center font-bold leading-tight ${
            showImage
              ? "w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-1.5 pt-4 px-1 text-[10.5px] text-white"
              : "text-[12px] text-text"
          }`}
        >
          <span className="line-clamp-2">{name}</span>
        </div>
      )}

      {/* Botões de Ação rápida no hover */}
      <div className="absolute right-1 top-1 z-20 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/85 text-white hover:bg-accent transition-colors shadow-sm"
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
            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/85 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
            title="Eliminar elemento"
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

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
    <div className="mb-3.5 flex group/row">
      {/* Cabeçalho do Nível / Tier Label */}
      <div className="relative w-20 sm:w-24 flex-shrink-0">
        <div
          className="flex h-full min-h-[102px] w-full flex-col items-center justify-center gap-1.5 rounded-l-2xl shadow-inner border border-r-0 border-white/10"
          style={{ background: tier.color }}
        >
          {editing ? (
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 6))}
              onBlur={() => {
                setEditing(false);
                onRename(label || tier.label);
              }}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="w-14 rounded-lg bg-black/30 text-center font-display text-[17px] font-black text-[#0A0A0D] outline-none ring-2 ring-black/40"
            />
          ) : (
            <span
              onClick={() => setEditing(true)}
              className="cursor-text font-display text-[22px] sm:text-[25px] font-black tracking-tight text-[#0A0A0D] transition-transform hover:scale-105"
              title={t("builder.editTierName")}
            >
              {tier.label}
            </span>
          )}

          {/* Botão de Cor */}
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
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

      {/* Zona de Soltar (Dropzone) */}
      <div
        onDrop={(e) => onDrop(e, tier.id)}
        onDragOver={(e) => onDragOver(e, tier.id)}
        className={`flex min-h-[102px] flex-1 flex-wrap items-center gap-2.5 rounded-r-2xl border p-3.5 transition-all ${
          isDragOver
            ? "border-accent bg-accentSoft/35 shadow-[0_0_24px_-6px_rgba(124,92,255,0.45)] ring-1 ring-accent"
            : "border-border bg-[#111117] hover:border-borderStrong"
        }`}
      >
        {items.length === 0 && (
          <span className="px-3 text-[13px] font-medium text-mutedDim select-none">
            {t("builder.dropHere")}
          </span>
        )}
        {items.map((it) => (
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

        <button
          type="button"
          onClick={onDelete}
          title={t("builder.deleteTier")}
          className="ml-auto self-start p-1.5 text-mutedDim opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-rose-400"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Builder() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Tier list state
  const [items, setItems] = useState([]);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [placements, setPlacements] = useState({});
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [visibility, setVisibility] = useState("public"); // "public" | "unlisted" | "private"
  const [displayMode, setDisplayMode] = useState("both"); // "both" | "image" | "text"

  // Drag and drop state
  const [dragOverTier, setDragOverTier] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Modais
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Form states para adição / edição manual
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMode, setFormMode] = useState("auto");

  // Estado de pesquisa no catálogo real
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Filtro de elementos na bancada
  const [benchFilter, setBenchFilter] = useState("");

  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { id: paramEditId } = useParams();
  const editId = paramEditId || searchParams.get("edit");
  const remixId = searchParams.get("remix");

  // Estado de Edição de Tier List Existente
  const [isEditing, setIsEditing] = useState(false);
  const [editListId, setEditListId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estado de Remix de Template
  const [parentTemplateId, setParentTemplateId] = useState(null);
  const [parentTemplateTitle, setParentTemplateTitle] = useState("");
  const [isRemixLoading, setIsRemixLoading] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Novos Modais e Ferramentas
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRawText, setBulkRawText] = useState("");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [pasteToast, setPasteToast] = useState("");

  // Status de publicação
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");

  const categories = getCategories();
  const [manualCategoryOverride, setManualCategoryOverride] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState("");
  const [catApiSuggestions, setCatApiSuggestions] = useState([]);
  const [catSearchingApi, setCatSearchingApi] = useState(false);

  // Inicialização a partir de query params (?category=... &title=...)
  useEffect(() => {
    if (editId || remixId) return;
    const initialCategory = searchParams.get("category");
    const initialTitle = searchParams.get("title");
    if (initialCategory) {
      setCategory(initialCategory);
    }
    if (initialTitle) {
      setTitle(initialTitle);
      const detected = detectCategory({ title: initialTitle, items: [] });
      if (detected && detected.score > 0) {
        setCategory(detected.slug || detected.id);
      }
    }
  }, [searchParams, editId, remixId]);

  // Pesquisa na API de Categorias no Builder
  useEffect(() => {
    const q = catSearchQuery.trim();
    if (q.length < 2) {
      setCatApiSuggestions([]);
      setCatSearchingApi(false);
      return;
    }
    const timer = setTimeout(async () => {
      setCatSearchingApi(true);
      try {
        const results = await searchApiCategories(q);
        const existingSlugs = new Set(categories.map((c) => c.slug || c.id));
        setCatApiSuggestions(results.filter((r) => !existingSlugs.has(r.slug)).slice(0, 4));
      } catch (e) {
        console.warn("Erro ao pesquisar sugestões da API:", e);
      } finally {
        setCatSearchingApi(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [catSearchQuery, categories]);

  // Carregar Dados se for Modo de Edição
  useEffect(() => {
    async function loadEditData() {
      if (!editId) return;
      if (!user) return; // Aguarda que o utilizador autenticado esteja carregado
      try {
        const data = await getTierListById(editId, user.uid);
        if (!data) {
          alert("Tier List não encontrada.");
          navigate("/explore");
          return;
        }
        if (!canEditTierList(data, user.uid)) {
          alert("Não tens permissão para editar esta Tier List.");
          navigate(`/tier-list/${editId}`);
          return;
        }
        setIsEditing(true);
        setEditListId(data.id);
        setTitle(data.title || "");
        setCategory(data.category || "gaming");
        setSubcategory(data.subcategory || "");
        setVisibility(data.visibility || "public");
        if (data.itemDisplayMode) setDisplayMode(data.itemDisplayMode);
        if (data.tiers && data.tiers.length > 0) setTiers(data.tiers);
        if (data.items) setItems(data.items);
        if (data.placements) setPlacements(data.placements);
        setManualCategoryOverride(true);
      } catch (err) {
        console.warn("Could not load tier list for edit:", err);
      }
    }
    loadEditData();
  }, [editId, user, navigate]);

  // Carregar Template se for Remix (?remix=...)
  useEffect(() => {
    async function loadRemixTemplate() {
      if (!remixId || editId) return;
      setIsRemixLoading(true);
      try {
        const tmpl = await getTierListById(remixId);
        if (tmpl && tmpl.items) {
          setParentTemplateId(tmpl.id);
          setParentTemplateTitle(tmpl.title);
          setTitle(`${tmpl.title} (A Minha Versão)`);
          setCategory(tmpl.category || "gaming");
          setManualCategoryOverride(true);
          if (tmpl.tiers && tmpl.tiers.length > 0) {
            setTiers(tmpl.tiers);
          }
          if (tmpl.itemDisplayMode) {
            setDisplayMode(tmpl.itemDisplayMode);
          }
          setItems(tmpl.items.map((it) => ({ ...it })));
          setPlacements({});
        }
      } catch (err) {
        console.warn("Could not load remix template:", err);
      } finally {
        setIsRemixLoading(false);
      }
    }
    loadRemixTemplate();
  }, [remixId, editId]);

  // Listener Global para Colar Imagens (Ctrl + V)
  useEffect(() => {
    function handleGlobalPaste(e) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        handleFilesUpload(files);
        setPasteToast("✨ Imagem colada da área de transferência!");
        setTimeout(() => setPasteToast(""), 3000);
      } else {
        const pasteItems = e.clipboardData?.items;
        if (pasteItems) {
          const fileArr = [];
          for (let i = 0; i < pasteItems.length; i++) {
            if (pasteItems[i].type.indexOf("image") !== -1) {
              fileArr.push(pasteItems[i].getAsFile());
            }
          }
          if (fileArr.length > 0) {
            handleFilesUpload(fileArr);
            setPasteToast("✨ Imagem colada da área de transferência!");
            setTimeout(() => setPasteToast(""), 3000);
          }
        }
      }
    }

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  // Auto-deteção semântica em tempo real baseada no título e elementos
  useEffect(() => {
    if (manualCategoryOverride) return;
    if (!title.trim() && items.length === 0) return;

    const detected = detectCategory({ title, items });
    if (detected && detected.score > 0) {
      const newCat = detected.slug || detected.id;
      if (newCat !== category) {
        setCategory(newCat);
        setSubcategory("");
      }
    }
  }, [title, items, manualCategoryOverride, category]);

  const currentCategoryObj =
    categories.find(
      (c) =>
        c.id === category ||
        c.slug === category ||
        (c.name && c.name.toLowerCase() === (category || "").toLowerCase())
    ) || null;

  // Validação contínua da subcategoria pertencente à categoria ativa
  useEffect(() => {
    if (subcategory && currentCategoryObj?.subcategories) {
      const exists = currentCategoryObj.subcategories.some(
        (sub) => (typeof sub === "string" ? sub : sub.name) === subcategory
      );
      if (!exists) {
        setSubcategory("");
      }
    }
  }, [category, currentCategoryObj, subcategory]);

  function applyTheme(themeKey) {
    const preset = THEME_PRESETS[themeKey];
    if (!preset) return;
    setTiers((prev) =>
      prev.map((t, i) => ({
        ...t,
        color: preset.colors[i % preset.colors.length],
      }))
    );
    setThemeMenuOpen(false);
  }

  function handleBulkTextSubmit(e) {
    e.preventDefault();
    if (!bulkRawText.trim()) return;

    const lines = bulkRawText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const newItems = lines.map((name, idx) => ({
      id: `text-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      imageUrl: "",
      displayMode: "text",
    }));

    setItems((prev) => [...prev, ...newItems]);
    setBulkRawText("");
    setBulkModalOpen(false);
  }

  const itemsByTier = useCallback(
    (tierId) =>
      Object.entries(placements)
        .filter(([, t]) => t === tierId)
        .map(([id]) => items.find((i) => i.id === id))
        .filter(Boolean),
    [items, placements]
  );

  const benchItems = useMemo(() => {
    const unplaced = items.filter((it) => !placements[it.id]);
    if (!benchFilter.trim()) return unplaced;
    const q = benchFilter.toLowerCase().trim();
    return unplaced.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, placements, benchFilter]);

  const placedCount = Object.keys(placements).length;

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

  async function handleFilesUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    const validFiles = Array.from(fileList).filter((f) => f.type && f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    setIsProcessingImages(true);
    try {
      const newItems = await Promise.all(
        validFiles.map(async (file, idx) => {
          const compressedUrl = await compressImage(file, 360, 360, 0.82);
          const cleanName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return {
            id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
            name: cleanName,
            imageUrl: compressedUrl,
            displayMode: "auto",
          };
        })
      );

      setItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error("Erro ao processar imagens da bancada:", err);
    } finally {
      setIsProcessingImages(false);
    }
  }

  function handleBenchFileDrop(e) {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    } else {
      handleBenchDrop(e);
    }
  }

  function addTier() {
    const letters = ["S+", "S", "A+", "A", "B", "C", "D", "F", "GOAT"];
    const used = tiers.map((t) => t.label);
    const label = letters.find((l) => !used.includes(l)) || `T${tiers.length + 1}`;
    setTiers((t) => [...t, { id: `t${Date.now()}`, label, color: "#8A6BFF" }]);
  }

  function removeTier(tierId) {
    setTiers((t) => t.filter((x) => x.id !== tierId));
    setPlacements((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === tierId) delete next[k];
      });
      return next;
    });
  }

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
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? { ...it, name: formName.trim(), imageUrl: formImageUrl.trim(), displayMode: formMode }
            : it
        )
      );
    } else {
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
  }

  function handleClearBench() {
    const unplaced = items.filter((it) => !placements[it.id]);
    if (unplaced.length === 0) return;
    if (window.confirm(t("builder.resetConfirm"))) {
      setItems((prev) => prev.filter((it) => placements[it.id]));
    }
  }

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

  async function handlePublish() {
    if (!user) {
      alert("Precisas de ter sessão iniciada para criar ou publicar uma Tier List.");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      alert("Adiciona pelo menos um elemento à tua Tier List antes de publicar.");
      return;
    }

    setSaving(true);
    setSaveMsg("");
    try {
      const creatorName =
        profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Criador TierWorld";
      const creatorHandle = profile?.handle || (user ? `user_${user.uid.slice(0, 6)}` : "anon");
      const creatorAvatar = profile?.avatar || user?.photoURL || "";

      if (isEditing && editListId) {
        await updateTierList(editListId, user?.uid, {
          title: title.trim() || t("builder.defaultTitle"),
          category,
          subcategory,
          visibility,
          language,
          tiers,
          items,
          placements,
          itemDisplayMode: displayMode,
        });

        setSavedId(editListId);
        setSaveMsg("Tier List atualizada com sucesso! ✓");
      } else {
        const result = await createTierList(user?.uid || null, {
          title: title.trim() || t("builder.defaultTitle"),
          category: (category || "").trim() || (detectCategory({ title, items })?.slug) || "geral",
          subcategory,
          visibility,
          language,
          tiers,
          items,
          placements,
          itemDisplayMode: displayMode,
          creatorName,
          creatorHandle,
          creatorAvatar,
          parentTemplateId,
          parentTemplateTitle,
        });

        setSavedId(result.id);
        setSaveMsg("Tier list publicada com sucesso! ✓ A redirecionar para a tua página...");

        // Redireciona suavemente para a página da tier list criada
        setTimeout(() => {
          navigate(`/tier-list/${result.id}`);
        }, 1200);
      }
    } catch (err) {
      console.error("Erro ao guardar tier list:", err);
      setSaveMsg(isEditing ? "Erro ao atualizar a Tier List" : t("builder.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !editListId) return;
    const confirmed = window.confirm(
      "Tens a certeza que desejas eliminar permanentemente esta Tier List? Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteTierList(editListId, user?.uid);
      alert("Tier List eliminada com sucesso.");
      navigate("/explore");
    } catch (err) {
      console.error("Erro ao eliminar tier list:", err);
      alert("Erro ao eliminar a Tier List. Tenta novamente.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6 pb-28 pt-6 sm:pt-8 animate-fade-in">
      {/* =========================================================
          1. TOP BAR / STUDIO BREADCRUMB & HEADER
         ========================================================= */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 font-semibold text-mutedDim hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Explorar</span>
            </Link>
            <span className="text-mutedDim">/</span>

            {isEditing ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accentSoft/60 px-2.5 py-0.5 font-bold text-accent">
                <Edit2 size={12} />
                <span>Modo de Edição</span>
              </span>
            ) : parentTemplateTitle ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal/40 bg-teal/10 px-2.5 py-0.5 font-bold text-teal">
                <Sparkles size={12} />
                <span>Remix de Template</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface2 px-2.5 py-0.5 font-bold text-white">
                <Layers size={12} className="text-accent" />
                <span>Creative Studio</span>
              </span>
            )}
          </div>

          {/* Input de Título Principal */}
          <div className="relative">
            <input
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                if (!manualCategoryOverride) {
                  const detected = detectCategory({ title: val, items });
                  if (detected && detected.score > 0) {
                    setCategory(detected.slug || detected.id);
                  }
                }
              }}
              placeholder="Dá um título memorável à tua Tier List…"
              className="w-full border-none bg-transparent font-display text-[26px] sm:text-[34px] font-black text-white outline-none placeholder:text-mutedDim/60 focus:placeholder:text-transparent"
            />
          </div>
        </div>

        {/* Barra de Ações Rápidas de Topo */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-[13px] font-bold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all shadow-sm disabled:opacity-50"
              title="Eliminar permanentemente esta Tier List"
            >
              <Trash2 size={14} />
              <span>{deleting ? "A eliminar..." : "Eliminar"}</span>
            </button>
          )}

          {/* Exportar Card de Partilha */}
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-text hover:bg-surface2 transition-colors hover:border-accent shadow-sm"
            title="Exportar Card de Partilha em Imagem (PNG)"
          >
            <Download size={14} className="text-teal" />
            <span>Exportar Card</span>
          </button>

          {savedId && (
            <>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-text hover:bg-surface2 transition-colors"
              >
                <Share2 size={14} className="text-accent" />
                <span>{t("tierListView.share")}</span>
              </button>
              <Link to={`/tier-list/${savedId}`}>
                <GhostButton small icon={ExternalLink}>
                  {t("builder.previewList")}
                </GhostButton>
              </Link>
            </>
          )}

          <PrimaryButton small icon={Check} onClick={handlePublish} disabled={saving}>
            {saving
              ? isEditing
                ? "A guardar…"
                : t("builder.publishing")
              : isEditing
              ? "Guardar Alterações"
              : t("builder.publish")}
          </PrimaryButton>
        </div>
      </div>

      {/* Mensagem de sucesso após publicação */}
      {saveMsg && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-teal/40 bg-teal/10 p-4 text-[13.5px] text-teal shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <Check size={18} className="stroke-[3]" />
            <span>{saveMsg}</span>
          </div>
          {savedId && (
            <Link to={`/tier-list/${savedId}`} className="font-bold underline hover:text-white">
              {t("builder.previewList")} →
            </Link>
          )}
        </div>
      )}

      {/* =========================================================
          2. STUDIO META RIBBON: VISIBILIDADE, CATEGORIA & FERRAMENTAS
         ========================================================= */}
      <div className="mb-8 rounded-3xl border border-border bg-[#101016] p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Lado Esquerdo: Visibilidade e Categoria */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Segmented Control de Visibilidade */}
            <div className="flex items-center rounded-2xl border border-border bg-surface2/90 p-1">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  visibility === "public"
                    ? "bg-accent text-white shadow-glow"
                    : "text-muted hover:text-white"
                }`}
                title={t("builder.visibilityPublicDesc")}
              >
                <Globe size={13} />
                <span>{t("builder.visibilityPublic")}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("unlisted")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  visibility === "unlisted"
                    ? "bg-accent text-white shadow-glow"
                    : "text-muted hover:text-white"
                }`}
                title={t("builder.visibilityUnlistedDesc")}
              >
                <Link2 size={13} />
                <span>{t("builder.visibilityUnlisted")}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  visibility === "private"
                    ? "bg-accent text-white shadow-glow"
                    : "text-muted hover:text-white"
                }`}
                title={t("builder.visibilityPrivateDesc")}
              >
                <Lock size={13} />
                <span>{t("builder.visibilityPrivate")}</span>
              </button>
            </div>

            {/* Categoria com Trigger para Modal/Seletor Completo */}
            <button
              type="button"
              onClick={() => setCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-accent/40 bg-accentSoft/60 px-3.5 py-1.5 text-xs font-bold text-accent hover:border-accent hover:bg-accentSoft transition-all shadow-sm group"
            >
              <Sparkles size={13} className="text-accent animate-pulse" />
              <span>{currentCategoryObj?.name || (category ? getCategoryDisplayName(category) : "Escolher Categoria")}</span>
              {category && (
                <span className="text-[10.5px] font-medium text-muted group-hover:text-white">
                  {manualCategoryOverride ? "(manual)" : "(auto)"}
                </span>
              )}
              <ChevronDown size={13} className="text-accent ml-0.5" />
            </button>
          </div>

          {/* Lado Direito: Modos de Exibição, Temas de Cores e Duelos */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Modo de Exibição */}
            <div className="flex items-center rounded-2xl border border-border bg-surface2/90 p-1">
              <button
                type="button"
                onClick={() => setDisplayMode("both")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  displayMode === "both"
                    ? "bg-white text-black font-black shadow-sm"
                    : "text-muted hover:text-white"
                }`}
                title="Imagem + Nome"
              >
                <ImageIcon size={12} />
                <span>Misto</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("image")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  displayMode === "image"
                    ? "bg-white text-black font-black shadow-sm"
                    : "text-muted hover:text-white"
                }`}
                title="Apenas Imagem"
              >
                <ImageIcon size={12} />
                <span>Fotos</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("text")}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                  displayMode === "text"
                    ? "bg-white text-black font-black shadow-sm"
                    : "text-muted hover:text-white"
                }`}
                title="Apenas Nome"
              >
                <Type size={12} />
                <span>Nomes</span>
              </button>
            </div>

            {/* Seletor de Temas de Cores */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface2/80 px-3 py-2 text-xs font-bold text-muted hover:text-white hover:border-accent/50 transition-all"
              >
                <Palette size={13} className="text-accent" />
                <span>Temas</span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-52 rounded-2xl border border-border bg-[#13141c] p-2 shadow-2xl animate-fade-in">
                  <div className="px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-mutedDim">
                    Paleta dos Níveis:
                  </div>
                  {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTheme(key)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-muted hover:text-white hover:bg-surface2 transition-colors"
                    >
                      <span>{preset.name}</span>
                      <div className="flex items-center gap-1">
                        {preset.colors.slice(0, 4).map((c, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Duelo 1 vs 1 */}
            <button
              type="button"
              onClick={() => setDuelModalOpen(true)}
              disabled={items.length < 2}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-accent/40 bg-accentSoft/60 px-3.5 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-black transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
              title={items.length < 2 ? "Adiciona pelo menos 2 elementos para iniciar duelos" : "Ordenar por confrontos diretos 1 vs 1"}
            >
              <Swords size={13} />
              <span>Duelo 1v1</span>
            </button>
          </div>
        </div>

        {/* Subcategorias da Categoria Ativa (se existirem) */}
        {currentCategoryObj?.subcategories?.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-border/50 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-mutedDim mr-1">
              Subcategoria:
            </span>
            <button
              type="button"
              onClick={() => setSubcategory("")}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                !subcategory
                  ? "bg-white text-black font-bold"
                  : "bg-surface text-mutedDim hover:text-white"
              }`}
            >
              Todas / Geral
            </button>
            {currentCategoryObj.subcategories.map((sub) => {
              const subName = typeof sub === "string" ? sub : sub.name;
              const isSubSelected = subcategory === subName;
              return (
                <button
                  key={subName}
                  type="button"
                  onClick={() => setSubcategory(subName)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSubSelected
                      ? "bg-accent text-white font-bold shadow-sm"
                      : "bg-surface text-mutedDim hover:text-white"
                  }`}
                >
                  {subName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          3. QUADRO DE TIERS (THE TIER BOARD)
         ========================================================= */}
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

        {/* Botão de Adicionar Novo Nível */}
        <button
          type="button"
          onClick={addTier}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-surface/30 py-4 text-[13.5px] font-bold text-muted transition-all hover:border-accent hover:text-white hover:bg-surface2/50"
        >
          <Plus size={16} className="text-accent" />
          <span>{t("builder.addTier")}</span>
        </button>
      </div>

      {/* =========================================================
          4. BANCADA DE ELEMENTOS (CREATIVE WORKBENCH)
         ========================================================= */}
      <div
        onDrop={handleBenchFileDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        className={`rounded-3xl border bg-[#0d0e14] p-5 sm:p-6 transition-all shadow-xl ${
          isDraggingFile
            ? "border-accent bg-accentSoft/35 shadow-glow scale-[1.005]"
            : "border-border"
        }`}
      >
        {/* Cabeçalho da Bancada */}
        <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-[18px] font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-accent" />
              <span>{t("builder.benchTitle")}</span>
            </h2>

            {/* Contadores */}
            <span className="rounded-full bg-accentSoft px-3 py-0.5 text-xs font-extrabold text-accent border border-accent/30">
              {benchItems.length} na bancada
            </span>
            <span className="text-xs font-semibold text-mutedDim">
              ({placedCount} de {items.length} colocados)
            </span>
            {isProcessingImages && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                <span>A otimizar imagens...</span>
              </span>
            )}
          </div>

          {/* Ferramentas de Ação do Estúdio */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesUpload(e.target.files)}
              className="hidden"
            />

            {/* ➕ Adicionar Elemento Manual */}
            <PrimaryButton small icon={Plus} onClick={openAddModal}>
              {t("builder.actions.addElement")}
            </PrimaryButton>

            {/* 📁 Upload de Fotos */}
            <GhostButton
              small
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("builder.actions.uploadImages")}
            </GhostButton>

            {/* 🔍 Catálogo / Pesquisa */}
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

            {/* 📝 Importar Texto em Lote */}
            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface2 px-3 py-2 text-xs font-bold text-muted hover:text-white hover:border-teal/50 transition-colors"
            >
              <FileText size={13} className="text-teal" />
              <span>Texto em Lote</span>
            </button>

            {/* 🗑️ Limpar Bancada */}
            {benchItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearBench}
                className="rounded-xl p-2 text-mutedDim transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                title={t("builder.actions.clearAll")}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtro Rápido dentro da bancada se tiver muitos itens */}
        {items.length > 8 && (
          <div className="mb-4 relative max-w-sm">
            <Search size={13} className="absolute left-3 top-2.5 text-mutedDim" />
            <input
              type="text"
              value={benchFilter}
              onChange={(e) => setBenchFilter(e.target.value)}
              placeholder="Filtrar itens da bancada…"
              className="w-full rounded-xl border border-border bg-surface2/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-mutedDim outline-none focus:border-accent"
            />
          </div>
        )}

        {/* Estados da Bancada: Vazia, Todos Colocados ou Lista de Itens */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-14 text-center px-4 bg-surface2/20">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
              <Sparkles size={26} />
            </div>
            <h3 className="mb-1.5 font-display text-[18px] font-bold text-white">
              {t("builder.benchEmptyTitle")}
            </h3>
            <p className="mb-6 max-w-md text-[13.5px] leading-relaxed text-muted">
              {t("builder.benchEmptySubtitle")}
            </p>

            <div className="flex flex-wrap justify-center gap-2.5">
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
          <div className="py-10 text-center text-sm font-bold text-teal flex items-center justify-center gap-2 animate-fadeIn">
            <Sparkles size={16} />
            <span>{t("builder.benchAllPlaced")}</span>
          </div>
        ) : (
          <div className="flex min-h-[102px] flex-wrap items-center gap-2.5">
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

        {/* Dica de atalhos no rodapé da bancada */}
        <div className="mt-5 pt-4 border-t border-border/40 flex flex-wrap items-center justify-between text-xs text-mutedDim">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-accent" />
            <span>Dica Pro: Podes colar imagens diretamente do clipboard com <strong>Ctrl + V</strong>.</span>
          </div>
          <span>Arrasta ficheiros para a bancada ou para os níveis para carregar instantaneamente.</span>
        </div>
      </div>

      {/* =========================================================
          5. MODAIS INTEGRADOS
         ========================================================= */}

      {/* MODAL 1: Adicionar / Editar Elemento Manualmente */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-[480px] rounded-3xl border border-borderStrong bg-[#12131a] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-[18px] font-bold text-white">
                {editingItem ? t("builder.modalEditTitle") : t("builder.modalAddTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-xl p-1.5 text-muted hover:bg-surface2 hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveElement} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-text">
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
                <label className="mb-1.5 block text-[13px] font-bold text-text">
                  {t("builder.elementImage")}
                </label>
                <input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder={t("builder.elementImagePlaceholder")}
                  className="w-full rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-[13.5px] text-text outline-none focus:border-accent"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-border p-3.5 text-center bg-surface2/40">
                <input
                  type="file"
                  id="modal-file-upload"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const compressedUrl = await compressImage(file, 360, 360, 0.82);
                      setFormImageUrl(compressedUrl);
                      if (!formName.trim()) {
                        setFormName(
                          file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                        );
                      }
                    } catch (err) {
                      console.error("Erro ao comprimir imagem do elemento:", err);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="modal-file-upload"
                  className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-bold text-accent hover:underline"
                >
                  <Upload size={14} /> {t("builder.elementUploadBtn")}
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-text">
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

              {(formName || formImageUrl) && (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface2 p-3">
                  <span className="text-[12px] font-semibold text-muted">Pré-visualização:</span>
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

              <div className="mt-2 flex justify-end gap-2.5 border-t border-border pt-4">
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
      )}

      {/* MODAL 2: Pesquisar na Base de Dados Real */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="flex max-h-[85vh] w-full max-w-[660px] flex-col rounded-3xl border border-borderStrong bg-[#12131a] shadow-2xl overflow-hidden">
            <div className="border-b border-border p-5 sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-[19px] font-black text-white flex items-center gap-2.5">
                  <Search size={18} className="text-accent" />
                  {t("builder.searchModalTitle")}
                </h3>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="rounded-xl p-1.5 text-muted hover:bg-surface2 hover:text-text transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-[13px] text-muted">
                {t("builder.searchModalDesc")}
              </p>

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

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {searching ? (
                <div className="py-14 text-center text-[13.5px] text-muted">
                  {t("builder.searching")}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-14 text-center text-[13.5px] text-muted">
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
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface2 p-3 transition-all hover:border-borderStrong hover:-translate-y-0.5"
                      >
                        {entity.imageUrl ? (
                          <img
                            src={entity.imageUrl}
                            alt={entity.name}
                            className="h-12 w-12 flex-shrink-0 rounded-xl object-cover border border-white/10"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface text-[14px] font-bold text-muted">
                            {entity.name[0]}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="truncate font-display text-[13.5px] font-bold text-white">
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
                          className={`rounded-xl px-3 py-1.5 text-[12px] font-bold transition-all ${
                            isAdded
                              ? "bg-accentSoft text-accent opacity-60"
                              : "bg-accent text-white hover:bg-accent/90 shadow-sm"
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

            <div className="border-t border-border p-4 flex justify-between items-center bg-surface2/60">
              <span className="text-[12px] font-bold text-mutedDim">
                {t("builder.itemsCount", { count: items.length })}
              </span>
              <GhostButton small onClick={() => setSearchModalOpen(false)}>
                {t("builder.close")}
              </GhostButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Categoria & Taxonomia Studio Modal */}
      {categoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setCategoryModalOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-[620px] flex-col rounded-3xl border border-border bg-[#111219] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border p-5 sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-[19px] font-black text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-accent" />
                  <span>Categoria & Taxonomia</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="rounded-xl p-1.5 text-mutedDim hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Seleciona a categoria mais adequada ou pesquisa qualquer tema na nossa API pública para estrear novos assuntos na plataforma.
              </p>

              {/* Input de Pesquisa de Categorias */}
              <div className="relative mt-3.5">
                <Search size={15} className="absolute left-3.5 top-[11px] text-mutedDim" />
                <input
                  type="text"
                  value={catSearchQuery}
                  onChange={(e) => setCatSearchQuery(e.target.value)}
                  placeholder="Pesquisar categoria ou tema da API (ex: Fórmula 1, Rock, Marvel)…"
                  className="w-full rounded-xl border border-border bg-surface2 py-2 pl-9 pr-3 text-xs text-white placeholder-mutedDim outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Sugestões da API em Tempo Real */}
              {catApiSuggestions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-accentSoft/20 border border-accent/30">
                  <div className="text-[11px] font-bold text-accent mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Sugerido da API Pública (Estrear Novo Tema):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catApiSuggestions.map((apiCat) => (
                      <button
                        key={apiCat.id}
                        type="button"
                        onClick={async () => {
                          try {
                            const detailed = await fetchCategoryDetailsFromApi(apiCat.name);
                            const saved = await saveCategoryWithApiData({
                              ...apiCat,
                              ...(detailed || {}),
                            });
                            setCategory(saved.slug || saved.id);
                            if (saved.subcategories && saved.subcategories.length > 0) {
                              setSubcategory(saved.subcategories[0]);
                            }
                          } catch {
                            setCategory(apiCat.slug);
                          }
                          setManualCategoryOverride(true);
                          setCategoryModalOpen(false);
                          setCatSearchQuery("");
                          setCatApiSuggestions([]);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-accent/40 text-xs font-bold text-white hover:bg-accent hover:text-black transition-all shadow-sm"
                      >
                        <span>{apiCat.name}</span>
                        <span className="text-[10px] text-accent font-normal">+ Adicionar</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorias Disponíveis */}
              {/* Botão de Criação de Nova Categoria Manual se não houver correspondência exata */}
              {catSearchQuery.trim() &&
                !categories.some(
                  (c) => (c.name || "").toLowerCase() === catSearchQuery.trim().toLowerCase()
                ) && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={async () => {
                        const queryClean = catSearchQuery.trim();
                        try {
                          const detailed = await fetchCategoryDetailsFromApi(queryClean);
                          const saved = await saveCategoryWithApiData({
                            name: queryClean,
                            slug: slugifyCategory(queryClean),
                            description: detailed?.description || `Comunidade temática de ${queryClean}.`,
                            imageUrl: detailed?.imageUrl || "",
                            icon: "Layers",
                            color: "#7C5CFF",
                            subcategories: detailed?.subcategories || [],
                          });
                          setCategory(saved.slug || saved.id || slugifyCategory(queryClean));
                          if (saved.subcategories && saved.subcategories.length > 0) {
                            setSubcategory(saved.subcategories[0]);
                          }
                        } catch {
                          setCategory(slugifyCategory(queryClean));
                        }
                        setManualCategoryOverride(true);
                        setCategoryModalOpen(false);
                        setCatSearchQuery("");
                        setCatApiSuggestions([]);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-accent/60 bg-accent/15 hover:bg-accent hover:text-black transition-all group shadow-glow"
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderPlus size={18} className="text-accent group-hover:text-black transition-colors" />
                        <span className="text-[13px] font-bold text-white group-hover:text-black transition-colors">
                          Criar e usar categoria "{catSearchQuery.trim()}"
                        </span>
                      </div>
                      <span className="text-[11.5px] font-black text-accent group-hover:text-black transition-colors">
                        + Inaugurar Nicho
                      </span>
                    </button>
                  </div>
                )}

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-mutedDim mb-2.5">
                  Categorias Disponíveis:
                </div>
                {categories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-surface/50 p-4 text-center">
                    <p className="text-xs text-mutedDim leading-relaxed">
                      Ainda não existem categorias ativas no TierWorld. Escreve no campo acima o nome de qualquer nicho ou tema para o inaugurares nesta Tier List!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories
                      .filter((c) =>
                        catSearchQuery.trim()
                          ? (c.name || "").toLowerCase().includes(catSearchQuery.toLowerCase()) ||
                            (c.slug || "").toLowerCase().includes(catSearchQuery.toLowerCase())
                          : true
                      )
                      .map((c) => {
                        const isSelected = category === c.id || category === c.slug;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCategory(c.slug || c.id);
                              setSubcategory("");
                              setManualCategoryOverride(true);
                              setCategoryModalOpen(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-accent text-black shadow-glow font-black"
                                : "border border-border bg-surface2/60 text-muted hover:text-white hover:border-white/20"
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            {isSelected && <Check size={14} className="stroke-[3]" />}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {manualCategoryOverride && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCategoryOverride(false);
                      setCategoryModalOpen(false);
                      const detected = detectCategory({ title, items });
                      if (detected && detected.score > 0) {
                        setCategory(detected.slug || detected.id);
                      }
                    }}
                    className="text-xs text-accent font-bold hover:underline"
                  >
                    ↺ Voltar a detetar categoria automaticamente
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 flex justify-end bg-surface2/60">
              <GhostButton small onClick={() => setCategoryModalOpen(false)}>
                Concluído
              </GhostButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Importação de Texto em Lote */}
      {bulkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setBulkModalOpen(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-3xl border border-border bg-[#12131a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-teal" />
                <h3 className="font-display font-bold text-base text-white">
                  Importar Itens em Lote
                </h3>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="rounded-full p-1.5 text-mutedDim hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-mutedDim mb-3 leading-relaxed">
              Cola nomes separados por quebra de linha ou vírgulas. Todos os cartões serão criados instantaneamente no banco.
            </p>

            <form onSubmit={handleBulkTextSubmit}>
              <textarea
                value={bulkRawText}
                onChange={(e) => setBulkRawText(e.target.value)}
                placeholder="Exemplo:&#10;Lionel Messi&#10;Cristiano Ronaldo&#10;Kylian Mbappé&#10;Erling Haaland"
                rows={6}
                className="w-full rounded-2xl border border-border bg-surface p-3.5 text-xs text-white placeholder-mutedDim outline-none focus:border-accent font-mono mb-4"
              />

              <div className="flex items-center justify-end gap-2">
                <GhostButton small onClick={() => setBulkModalOpen(false)}>
                  Cancelar
                </GhostButton>
                <PrimaryButton small type="submit" disabled={!bulkRawText.trim()}>
                  Criar Elementos
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Partilha */}
      {savedId && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={title || t("builder.defaultTitle")}
          url={`${window.location.origin}/tier-list/${savedId}`}
          description={`Tier List de "${title || t("builder.defaultTitle")}" com ${items.length} elementos, criada por ${profile?.displayName || user?.displayName || "Criador"} no TierWorld. Confere a classificação completa e vota!`}
          onOpenExport={() => setExportModalOpen(true)}
        />
      )}

      {/* Modal de Exportação do Card de Partilha */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        tierList={{
          title: title || t("builder.defaultTitle"),
          category,
          subcategory,
          itemDisplayMode: displayMode,
          creator: profile?.displayName || user?.displayName || "Criador",
          creatorHandle: profile?.handle || "",
        }}
        tiers={tiers}
        items={items}
        placements={placements}
        creatorName={profile?.displayName || user?.displayName || "Criador"}
        creatorHandle={profile?.handle || ""}
      />

      {/* Modal de Duelo 1 vs 1 */}
      <DuelModeModal
        isOpen={duelModalOpen}
        onClose={() => setDuelModalOpen(false)}
        items={items}
        tiers={tiers}
        onApplyPlacements={(duelPlacements) => {
          setPlacements(duelPlacements);
        }}
      />

      {/* Notificação Flutuante ao Colar da Área de Transferência */}
      {pasteToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-accent/60 bg-[#14141e] px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in">
          <Sparkles size={14} className="text-accent" />
          <span>{pasteToast}</span>
        </div>
      )}
    </div>
  );
}
