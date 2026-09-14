import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getCategories,
  getPopularCategories,
  searchCategories,
  createCustomCategory,
} from "../services/db";
import {
  Trophy,
  Gamepad2,
  Film,
  Tv,
  Sparkles,
  Music,
  Cpu,
  Flame,
  Search,
  Plus,
  X,
  Tag,
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ICON_MAP = {
  football: Trophy,
  gaming: Gamepad2,
  movies: Film,
  tvshows: Tv,
  anime: Sparkles,
  music: Music,
  tech: Cpu,
  sports: Flame,
  creators: Zap,
  geek: Shield,
  food: Utensils,
  vehicles: Car,
  culture: Globe,
  lifestyle: Dumbbell,
  business: Briefcase,
  science: GraduationCap,
};

export default function Categories() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatSubs, setNewCatSubs] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadAll = () => {
    setCategories(getCategories());
    setPopularCategories(getPopularCategories());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCategories = searchQuery.trim()
    ? searchCategories(searchQuery)
    : categories;

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const subcategoriesArr = newCatSubs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createCustomCategory({
        name: newCatName,
        description: newCatDesc,
        subcategories: subcategoriesArr,
        createdBy: user?.uid || null,
      });

      loadAll();
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
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2 font-display text-[32px] sm:text-[42px] font-black text-white tracking-tight">
            {t("categories.title")}
          </h1>
          <p className="text-[14.5px] text-muted max-w-xl leading-relaxed">
            {t("categories.subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all shadow-glow"
        >
          <Plus size={16} />
          <span>{t("categories.proposeNew")}</span>
        </button>
      </div>

      {/* Barra de Pesquisa de Categorias em Tempo Real */}
      <div className="relative mb-10 max-w-xl">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-mutedDim" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("categories.searchPlaceholder")}
          className="w-full rounded-2xl border border-border bg-surface pl-12 pr-10 py-3 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3.5 text-mutedDim hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Secção de Categorias Populares (Baseadas Estritamente em Dados Reais) */}
      {!searchQuery && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-accent" />
            <h2 className="font-display text-[20px] font-black text-white">
              {t("categories.popular")}
            </h2>
          </div>

          {popularCategories.length === 0 ? (
            <div className="p-6 rounded-3xl border border-dashed border-border bg-surface/40 text-center text-mutedDim text-sm">
              {t("categories.noPopular")}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {popularCategories.map((c) => {
                const Icon = ICON_MAP[c.id] || Sparkles;
                return (
                  <Link
                    key={c.id}
                    to={`/explore?category=${c.id}`}
                    className="p-4 rounded-2xl border border-border/80 bg-surface/70 hover:border-accent hover:bg-surface2 transition-all group text-center flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accentSoft text-accent flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-accent truncate w-full">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-mutedDim mt-0.5">
                      {t("categories.listsCount", { count: c.count || c.tierListsCount || 0 })}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Todas as Categorias */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-[22px] font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            <span>{searchQuery ? "Resultados da Pesquisa" : t("categories.all")}</span>
          </h2>
          <span className="text-xs font-semibold text-mutedDim">
            {filteredCategories.length} categorias disponíveis
          </span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-border bg-surface/30">
            <p className="text-white font-bold mb-2 text-base">
              Nenhuma categoria encontrada para "{searchQuery}"
            </p>
            <p className="text-xs text-mutedDim mb-5">
              Não encontraste o que procuravas? Podes criar uma nova categoria imediatamente!
            </p>
            <button
              onClick={() => {
                setNewCatName(searchQuery);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-black text-xs font-bold hover:opacity-90"
            >
              <Plus size={14} />
              <span>Criar Categoria "{searchQuery}"</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-5">
            {filteredCategories.map((c) => {
              const Icon = ICON_MAP[c.id] || Sparkles;
              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:bg-surface2/60 hover:shadow-glow flex flex-col justify-between"
                  style={{ background: "linear-gradient(160deg, #13131A 0%, #181824 100%)" }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
                        <Icon size={24} />
                      </div>
                      <Link
                        to={`/explore?category=${c.id}`}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-surface border border-border text-accent hover:bg-accent hover:text-black transition-colors"
                      >
                        Ver Tier Lists →
                      </Link>
                    </div>

                    <h3 className="mb-1.5 font-display text-[20px] font-bold text-white">
                      {c.name}
                    </h3>
                    <p className="text-[13px] text-muted leading-relaxed mb-4 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  {/* Subcategorias Chips */}
                  {c.subcategories && c.subcategories.length > 0 && (
                    <div className="pt-3 border-t border-border/60">
                      <div className="text-[11px] font-bold text-mutedDim mb-2">
                        Subcategorias:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.subcategories.slice(0, 5).map((sub) => {
                          const subName = typeof sub === "string" ? sub : sub.name;
                          return (
                            <Link
                              key={subName}
                              to={`/explore?category=${c.id}&sub=${encodeURIComponent(subName)}`}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-surface/80 border border-border/80 text-mutedDim hover:text-accent hover:border-accent/50 transition-colors"
                            >
                              {subName}
                            </Link>
                          );
                        })}
                        {c.subcategories.length > 5 && (
                          <span className="text-[10px] text-mutedDim px-1 self-center">
                            +{c.subcategories.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[12px] font-semibold text-mutedDim">
                    <span>{t("categories.listsCount", { count: c.count || 0 })}</span>
                    {c.isCustom && (
                      <span className="text-[10px] uppercase font-bold text-accent">
                        Comunidade
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação de Categoria */}
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
                  Escreve os temas ou divisões da categoria separados por vírgula.
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
