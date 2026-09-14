import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Check,
  ChevronDown,
  Sparkles,
  Info,
  X,
  Tag,
  Gamepad2,
  Trophy,
  Flame,
  Film,
  Tv,
  Music,
  Cpu,
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import {
  getCategories,
  searchCategories,
  createCustomCategory,
} from "../services/db";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const ICON_COMPONENTS = {
  Gamepad2,
  Trophy,
  Flame,
  Film,
  Tv,
  Sparkles,
  Music,
  Cpu,
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Tag,
};

export default function CategorySelector({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulário de nova categoria
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatSubs, setNewCatSubs] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const reloadCategories = () => {
    setCategories(getCategories());
  };

  useEffect(() => {
    reloadCategories();
  }, []);

  const filteredCategories = searchQuery.trim()
    ? searchCategories(searchQuery)
    : categories;

  const activeCategoryObj = categories.find(
    (c) =>
      c.id === selectedCategory ||
      c.slug === selectedCategory ||
      c.name.toLowerCase() === (selectedCategory || "").toLowerCase()
  );

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const subcategoriesArr = newCatSubs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await createCustomCategory({
        name: newCatName,
        description: newCatDesc,
        subcategories: subcategoriesArr,
        createdBy: user?.uid || null,
      });

      reloadCategories();
      onSelectCategory(created.id);
      if (subcategoriesArr.length > 0) {
        onSelectSubcategory(subcategoriesArr[0]);
      }
      setShowCreateModal(false);
      setNewCatName("");
      setNewCatDesc("");
      setNewCatSubs("");
    } catch (err) {
      setFormError(err.message || "Erro ao criar categoria.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface/70 p-5 shadow-lg backdrop-blur-md">
      {/* Cabeçalho com Dica Categoria vs Tema */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
            <span>Categoria & Tema</span>
          </label>
          <p className="text-xs text-mutedDim mt-0.5">
            {t("categories.categoryVsThemeHelp")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent/40 bg-accentSoft text-accent font-bold text-xs hover:bg-accent hover:text-black transition-all"
        >
          <Plus size={14} />
          <span>{t("categories.proposeNew")}</span>
        </button>
      </div>

      {/* Barra de Pesquisa de Categorias */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-mutedDim" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("categories.searchPlaceholder")}
          className="w-full rounded-2xl border border-border bg-[#0e0f14] pl-10 pr-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3 text-mutedDim hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Pílulas de Categorias */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(isExpanded || searchQuery ? filteredCategories : filteredCategories.slice(0, 8)).map(
          (cat) => {
            const isSelected =
              activeCategoryObj?.id === cat.id ||
              activeCategoryObj?.slug === cat.slug;
            const Icon = ICON_COMPONENTS[cat.icon] || Tag;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory("");
                }}
                className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-accent text-black shadow-glow scale-[1.02]"
                    : "bg-surface2/80 text-muted hover:text-white hover:border-accent/40 border border-border"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-black" : "text-accent"} />
                <span>{cat.name}</span>
                {isSelected && <Check size={13} className="stroke-[3]" />}
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-black/20 text-black" : "bg-surface text-mutedDim"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          }
        )}

        {!searchQuery && filteredCategories.length > 8 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border bg-surface text-xs font-semibold text-mutedDim hover:text-white transition-colors"
          >
            <span>
              {isExpanded
                ? "Mostrar menos"
                : `+${filteredCategories.length - 8} mais categorias`}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Subcategorias Disponíveis da Categoria Selecionada */}
      {activeCategoryObj?.subcategories?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <div className="text-[11px] font-bold text-mutedDim mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent" />
            <span>Subcategorias de {activeCategoryObj.name}:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectSubcategory("")}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                !selectedSubcategory
                  ? "bg-white/10 text-white font-bold border border-white/20"
                  : "bg-surface text-mutedDim hover:text-white"
              }`}
            >
              Geral / Todas
            </button>
            {activeCategoryObj.subcategories.map((sub) => {
              const subName = typeof sub === "string" ? sub : sub.name;
              const isSubSelected = selectedSubcategory === subName;

              return (
                <button
                  key={subName}
                  type="button"
                  onClick={() => onSelectSubcategory(subName)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    isSubSelected
                      ? "bg-accentSoft text-accent border border-accent/40 font-bold"
                      : "bg-surface text-mutedDim hover:text-white border border-border/50"
                  }`}
                >
                  {subName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Criação de Categoria Personalizada */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-3xl border border-border bg-[#12131a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="font-display font-black text-lg text-white">
                  {t("categories.newCatTitle")}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1.5 text-mutedDim hover:bg-surface2 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">
                  {t("categories.newCatName")} *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t("categories.newCatNamePlaceholder")}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">
                  {t("categories.newCatDesc")}
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder={t("categories.newCatDescPlaceholder")}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">
                  {t("categories.newCatSub")}
                </label>
                <input
                  type="text"
                  value={newCatSubs}
                  onChange={(e) => setNewCatSubs(e.target.value)}
                  placeholder={t("categories.newCatSubPlaceholder")}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none"
                />
                <p className="text-[11px] text-mutedDim mt-1">
                  Exemplo: Escreve "Sushi, Ramen, Izakaya" separadas por vírgula.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-accent text-black font-bold text-xs hover:opacity-90 transition-opacity shadow-glow disabled:opacity-50"
                >
                  {formLoading ? "A criar…" : t("categories.saveCategory")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

