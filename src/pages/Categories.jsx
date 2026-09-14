import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getActiveCategories,
  getPopularCategories,
  saveCategoryWithApiData,
} from "../services/db";
import {
  searchApiCategories,
  fetchCategoryDetailsFromApi,
} from "../services/categoriesApi";
import { EmptyState, PrimaryButton } from "../components/UI";
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
  Zap,
  Shield,
  Utensils,
  Car,
  Globe,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
  Loader2,
  Compass,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthRequiredModal from "../components/AuthRequiredModal";

const CATEGORY_ICONS = {
  gaming: Gamepad2,
  football: Trophy,
  sports: Flame,
  movies: Film,
  tvshows: Tv,
  anime: Sparkles,
  music: Music,
  tech: Cpu,
  food: Utensils,
  vehicles: Car,
  culture: Globe,
  lifestyle: Dumbbell,
  business: Briefcase,
  science: GraduationCap,
  creators: Zap,
  geek: Shield,
  Gamepad2,
  Trophy,
  Flame,
  Film,
  Tv,
  Music,
  Cpu,
  Sparkles,
};

const CATEGORY_COLORS = {
  gaming: "#7C5CFF",
  football: "#FF3B5C",
  sports: "#FF9F43",
  movies: "#FF5252",
  tvshows: "#31D8A8",
  anime: "#FF6B7A",
  music: "#FFD23F",
  tech: "#00E5A3",
  food: "#FFAA00",
  vehicles: "#38B6FF",
  culture: "#9A7CFF",
  lifestyle: "#2EC4B6",
  business: "#6B7280",
  science: "#8B5CF6",
  creators: "#F59E0B",
  geek: "#6366F1",
};

const QUICK_SUGGESTIONS = [
  "Futebol",
  "Gaming",
  "Cinema",
  "Anime",
  "Música",
  "Tecnologia",
  "Fórmula 1",
  "Séries",
];

function getCatVisuals(cat) {
  const key = (cat.id || cat.slug || "").toLowerCase();
  const IconComponent = CATEGORY_ICONS[key] || CATEGORY_ICONS[cat.icon] || Layers;
  const color = cat.color || CATEGORY_COLORS[key] || "#7C5CFF";
  return { IconComponent, color };
}

export default function Categories() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Categorias ativas com Tier Lists criadas (REGRA ESTRITA)
  const [activeCategories, setActiveCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);

  // Pesquisa local e API
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSearchError, setApiSearchError] = useState("");

  // Modal de Autenticação para Ações Protegidas
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: "Inicia sessão para continuar",
    description: "Para criar ou adicionar categorias precisas de ter uma conta.",
  });

  // Modal de Detalhes / Adicionar da API
  const [selectedApiTopic, setSelectedApiTopic] = useState(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const searchTimeoutRef = useRef(null);

  const loadActiveData = () => {
    // REGRA ESTRITA: Só carrega categorias com Tier Lists criadas (> 0)
    const active = getActiveCategories();
    setActiveCategories(active);
    setPopularCategories(getPopularCategories());
  };

  useEffect(() => {
    loadActiveData();
  }, []);

  // Pesquisa dinâmica na API quando o utilizador digita
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = searchQuery.trim();
    if (query.length < 2) {
      setApiResults([]);
      setIsSearchingApi(false);
      setApiSearchError("");
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      setApiSearchError("");
      try {
        const results = await searchApiCategories(query);
        setApiResults(results);
      } catch (err) {
        console.warn("Erro ao pesquisar na API de Categorias:", err);
        setApiSearchError("Não foi possível carregar sugestões da API.");
      } finally {
        setIsSearchingApi(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Filtragem das categorias ativas existentes
  const filteredActive = searchQuery.trim()
    ? activeCategories.filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.subcategories || []).some((sub) =>
            (typeof sub === "string" ? sub : sub.name || "").toLowerCase().includes(q)
          )
        );
      })
    : activeCategories;

  // Ação ao clicar num resultado da API
  const handleInspectApiTopic = async (topic) => {
    setTopicLoading(true);
    setSelectedApiTopic(topic);
    try {
      const detailed = await fetchCategoryDetailsFromApi(topic.name);
      if (detailed) {
        setSelectedApiTopic({
          ...topic,
          ...detailed,
        });
      }
    } catch (err) {
      console.warn("Erro ao obter detalhes adicionais do tema:", err);
    } finally {
      setTopicLoading(false);
    }
  };

  // Criar Tier List neste tema da API
  const handleCreateTierListInTopic = async (topic) => {
    if (!user) {
      setAuthModalConfig({
        title: "Inicia sessão para criar Tier Lists",
        description: `Para criares uma Tier List sobre "${topic.name}", inicia sessão com a tua conta.`,
      });
      setAuthModalOpen(true);
      return;
    }

    setImporting(true);
    try {
      await saveCategoryWithApiData({
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        imageUrl: topic.imageUrl,
        subcategories: topic.subcategories || [],
        color: topic.color || "#7C5CFF",
        icon: topic.icon || "Sparkles",
      });

      navigate(`/create?category=${encodeURIComponent(topic.slug)}&title=${encodeURIComponent(topic.name)}`);
    } catch (err) {
      console.warn("Erro ao preparar categoria:", err);
      navigate(`/create?category=${encodeURIComponent(topic.slug)}`);
    } finally {
      setImporting(false);
      setSelectedApiTopic(null);
    }
  };

  const totalTierListsCount = activeCategories.reduce((acc, c) => acc + (c.count || 0), 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-[#B6A5FF] font-bold text-[12px] mb-3 shadow-sm">
            <Compass size={13} className="text-accent" />
            <span>Taxonomia & Descoberta Global</span>
          </div>
          <h1 className="font-display text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
            Categorias & Temas
          </h1>
          <p className="mt-2 text-[14.5px] text-muted max-w-2xl leading-relaxed">
            Navega pelas comunidades temáticas ativas com listas criadas pela comunidade, ou pesquisa qualquer tópico na nossa taxonomia aberta para inaugurar um novo nicho.
          </p>
        </div>

        <div className="shrink-0">
          <Link to="/create">
            <PrimaryButton icon={Plus}>
              {t("home.createBtn") || "Criar Tier List"}
            </PrimaryButton>
          </Link>
        </div>
      </div>

      {/* Cartões de Métricas / KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {/* Card 1: Categorias Ativas */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent shadow-sm shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Categorias Ativas</span>
            <div className="font-display text-[22px] font-black text-white">
              {activeCategories.length}
            </div>
            <span className="text-[12px] font-medium text-mutedDim">Com rankings comunitários</span>
          </div>
        </div>

        {/* Card 2: Total de Tier Lists Organizadas */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E5A3]/40 bg-[#00E5A3]/10 text-[#00E5A3] shadow-sm shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Listas Catalogadas</span>
            <div className="font-display text-[22px] font-black text-white">
              {totalTierListsCount}
            </div>
            <span className="text-[12px] font-medium text-mutedDim">Distribuídas por temas</span>
          </div>
        </div>

        {/* Card 3: Taxonomia Aberta */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-sm shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">API & Auto-Tagging</span>
            <div className="font-display text-[16px] font-bold text-white mt-0.5">
              Catálogo Infinito
            </div>
            <span className="text-[12px] font-medium text-mutedDim">Pesquisa qualquer assunto</span>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa Híbrida */}
      <div className="mb-10 max-w-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedDim pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar categoria ativa ou explorar na API (ex: Futebol, Rock, RPGs, Cinema)..."
            className="w-full rounded-2xl border border-white/10 bg-[#12121C]/90 pl-12 pr-10 py-3.5 text-[14px] text-white placeholder-mutedDim focus:border-accent focus:bg-[#181826] focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-lg backdrop-blur-md"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setApiResults([]);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mutedDim hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sugestões Rápidas de Pesquisa */}
        {!searchQuery && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-mutedDim flex items-center gap-1">
              <span>Sugestões:</span>
            </span>
            {QUICK_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setSearchQuery(sug)}
                className="rounded-xl border border-white/[0.06] bg-surface/50 px-2.5 py-1 text-[11.5px] font-semibold text-muted hover:border-accent/40 hover:text-white hover:bg-surface2 transition-all"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultados da Pesquisa na API de Categorias */}
      {searchQuery.trim().length >= 2 && (
        <div className="mb-12 rounded-[28px] border border-accent/30 bg-gradient-to-br from-accent/10 via-[#141224]/90 to-[#0F0E17]/95 p-6 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-accent/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/40">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="font-display text-[17px] font-bold text-white">
                  Resultados da API de Categorias & Taxonomia
                </h2>
                <p className="text-[12px] text-muted">Sugestões enriquecidas para estrear novos rankings no TierWorld</p>
              </div>
            </div>
            {isSearchingApi && (
              <div className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
                <Loader2 size={13} className="animate-spin" />
                <span>A consultar API…</span>
              </div>
            )}
          </div>

          {apiResults.length === 0 && !isSearchingApi ? (
            <div className="py-6 text-center">
              <p className="text-[13.5px] text-muted max-w-md mx-auto">
                Nenhuma sugestão adicional encontrada na API para "{searchQuery}". Podes criar uma Tier List diretamente com este tema!
              </p>
              <button
                type="button"
                onClick={() => navigate(`/create?title=${encodeURIComponent(searchQuery)}`)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-[12.5px] font-bold text-black hover:opacity-90 shadow-glow"
              >
                <Plus size={14} />
                <span>Criar Tier List com "{searchQuery}"</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {apiResults.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#10101A]/90 p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow group"
                >
                  <div>
                    {item.imageUrl ? (
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3.5 bg-surface2 border border-white/5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-xl mb-3.5 bg-surface2/80 border border-white/5 flex items-center justify-center text-accent">
                        <Sparkles size={28} />
                      </div>
                    )}
                    <h3 className="font-display font-bold text-white text-[15.5px] group-hover:text-accent transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[12px] text-mutedDim line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInspectApiTopic(item)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-surface2/80 hover:bg-surface border border-white/10 text-[12px] font-bold text-white hover:text-accent transition-colors text-center"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateTierListInTopic(item)}
                      className="py-1.5 px-3 rounded-xl bg-accent text-black text-[12px] font-black hover:opacity-90 transition-opacity shadow-sm"
                      title="Criar Tier List nesta categoria"
                    >
                      + Criar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secção Principal: Categorias Ativas com Tier Lists Criadas */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 border border-accent/30 text-accent">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="font-display text-[22px] font-black text-white tracking-tight">
                {searchQuery ? "Categorias Ativas Encontradas" : "Categorias Ativas da Comunidade"}
              </h2>
            </div>
          </div>
          <span className="text-[12px] font-bold text-mutedDim bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {filteredActive.length}{" "}
            {filteredActive.length === 1 ? "categoria ativa" : "categorias ativas"}
          </span>
        </div>

        {activeCategories.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Ainda não existem categorias com Tier Lists criadas"
            body="No TierWorld, uma categoria só surge no Explorar quando a comunidade publica pelo menos uma Tier List sobre ela. Sê o primeiro a estrear uma categoria!"
            actionLabel="Criar a primeira Tier List"
            onAction={() => (window.location.href = "/create")}
          />
        ) : filteredActive.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/[0.08] bg-[#141420]/60 backdrop-blur-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-surface2 text-mutedDim">
              <Search size={20} />
            </div>
            <p className="text-white font-display font-bold mb-1.5 text-[17px]">
              Nenhuma categoria ativa encontrada para "{searchQuery}"
            </p>
            <p className="text-[13px] text-mutedDim mb-6 max-w-md mx-auto leading-relaxed">
              Esta categoria ainda não tem Tier Lists criadas pela comunidade. Podes estreá-la e publicar a primeira lista agora mesmo!
            </p>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setAuthModalConfig({
                    title: "Inicia sessão para criar Tier Lists",
                    description: `Para criares a primeira Tier List sobre "${searchQuery}", inicia sessão com a tua conta.`,
                  });
                  setAuthModalOpen(true);
                  return;
                }
                navigate(`/create?title=${encodeURIComponent(searchQuery)}`);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black text-[13px] font-bold hover:opacity-90 shadow-glow"
            >
              <Plus size={15} />
              <span>Estrear Categoria "{searchQuery}"</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActive.map((c) => {
              const { IconComponent, color } = getCatVisuals(c);
              return (
                <div
                  key={c.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#13131E]/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/60"
                >
                  {/* Glow Colorido no Hover */}
                  <div
                    className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
                    style={{ background: color }}
                  />

                  {/* Capa Visual da Categoria se existir */}
                  {c.imageUrl ? (
                    <div className="relative h-40 w-full overflow-hidden bg-surface2">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131E] via-[#13131E]/40 to-black/30" />
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md shadow-md"
                          style={{
                            background: `${color}30`,
                            border: `1px solid ${color}60`,
                            color: color,
                          }}
                        >
                          <IconComponent size={18} />
                        </div>
                        <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                          {c.count} {c.count === 1 ? "Tier List" : "Tier Lists"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-0 flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}35`,
                          color: color,
                        }}
                      >
                        <IconComponent size={22} />
                      </div>
                      <span
                        className="rounded-full border px-3 py-0.5 text-[11px] font-bold"
                        style={{
                          borderColor: `${color}40`,
                          backgroundColor: `${color}15`,
                          color: color,
                        }}
                      >
                        {c.count} {c.count === 1 ? "Tier List" : "Tier Lists"}
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-[20px] font-bold text-white group-hover:text-white transition-colors">
                        {t(`categories.${c.id}`) || c.name}
                      </h3>
                      <p className="mt-1.5 text-[13px] text-muted leading-relaxed line-clamp-2">
                        {c.description || "Comunidade ativa com rankings livres e votações abertas."}
                      </p>
                    </div>

                    {/* Subcategorias Chips */}
                    {c.subcategories && c.subcategories.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
                        <div className="text-[11.5px] font-bold text-mutedDim mb-2">
                          Subcategorias populares:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {c.subcategories.slice(0, 5).map((sub) => {
                            const subName = typeof sub === "string" ? sub : sub.name;
                            return (
                              <Link
                                key={subName}
                                to={`/explore?category=${c.id}&sub=${encodeURIComponent(subName)}`}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-surface/80 border border-white/[0.06] text-mutedDim hover:text-white hover:border-white/20 transition-colors"
                              >
                                {subName}
                              </Link>
                            );
                          })}
                          {c.subcategories.length > 5 && (
                            <span className="text-[10.5px] text-mutedDim px-1 self-center font-semibold">
                              +{c.subcategories.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                      <Link
                        to={`/explore?category=${c.id}`}
                        className="group/btn flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface/70 py-2.5 px-3 text-[12.5px] font-bold text-white transition-all duration-200 hover:border-accent/60 hover:bg-surface2 hover:text-white"
                      >
                        <span>Explorar Rankings</span>
                        <ArrowRight size={13} className="text-accent transition-transform duration-200 group-hover/btn:translate-x-1" />
                      </Link>
                      <Link
                        to={`/create?category=${c.id}`}
                        className="flex items-center justify-center rounded-xl bg-accent px-3.5 py-2.5 text-[12.5px] font-bold text-black shadow-sm transition-all duration-200 hover:opacity-90 shrink-0"
                        title="Criar Tier List nesta categoria"
                      >
                        <Plus size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes da API */}
      {selectedApiTopic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedApiTopic(null)}
        >
          <div
            className="w-full max-w-[520px] rounded-3xl border border-white/15 bg-[#12131F] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedApiTopic.imageUrl && (
              <div className="w-full h-48 relative bg-surface2">
                <img
                  src={selectedApiTopic.imageUrl}
                  alt={selectedApiTopic.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12131F] via-transparent to-black/40" />
                <button
                  onClick={() => setSelectedApiTopic(null)}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-display font-black text-[22px] text-white">
                  {selectedApiTopic.name}
                </h3>
                {!selectedApiTopic.imageUrl && (
                  <button
                    onClick={() => setSelectedApiTopic(null)}
                    className="p-1 rounded-lg text-mutedDim hover:text-white"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <p className="text-[13px] text-muted leading-relaxed mb-4">
                {selectedApiTopic.description}
              </p>

              {topicLoading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-4">
                  <Loader2 size={14} className="animate-spin" />
                  <span>A carregar metadados da API…</span>
                </div>
              )}

              {selectedApiTopic.subcategories && selectedApiTopic.subcategories.length > 0 && (
                <div className="mb-5">
                  <div className="text-[11.5px] font-bold text-mutedDim mb-2">
                    Subcategorias sugeridas pela taxonomia:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApiTopic.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-surface border border-white/10 text-muted"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setSelectedApiTopic(null)}
                  className="px-4 py-2 rounded-xl text-[12.5px] font-bold text-muted hover:text-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => handleCreateTierListInTopic(selectedApiTopic)}
                  className="px-5 py-2.5 rounded-xl bg-accent text-black font-black text-[12.5px] hover:opacity-90 shadow-glow disabled:opacity-50 flex items-center gap-2 transition-opacity"
                >
                  {importing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>A preparar…</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>Criar Tier List neste Tema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autenticação */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
      />
    </div>
  );
}
