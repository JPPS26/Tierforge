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
  getApiCatalog,
  DOMAIN_THEMES,
} from "../services/categoriesApi";
import { EmptyState } from "../components/UI";
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
  ArrowRight,
  ExternalLink,
  Loader2,
  Check,
  Compass,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthRequiredModal from "../components/AuthRequiredModal";

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
  Sparkles: Sparkles,
  Gamepad2: Gamepad2,
  Trophy: Trophy,
  Flame: Flame,
  Film: Film,
  Tv: Tv,
  Music: Music,
  Cpu: Cpu,
};

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
    // REGRA ESTRITA DO UTILIZADOR: Só carrega categorias com Tier Lists criadas (> 0)
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
        // Filtra para destacar apenas resultados relevantes da API
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
      // Salva a categoria enriquecida na plataforma
      await saveCategoryWithApiData({
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        imageUrl: topic.imageUrl,
        subcategories: topic.subcategories || [],
        color: topic.color || "#7C5CFF",
        icon: topic.icon || "Sparkles",
      });

      // Redireciona para o criador com este tema
      navigate(`/create?category=${encodeURIComponent(topic.slug)}&title=${encodeURIComponent(topic.name)}`);
    } catch (err) {
      console.warn("Erro ao preparar categoria:", err);
      navigate(`/create?category=${encodeURIComponent(topic.slug)}`);
    } finally {
      setImporting(false);
      setSelectedApiTopic(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentSoft border border-accent/30 text-accent font-bold text-xs mb-3">
            <Compass size={14} />
            <span>API Pública de Categorias & Taxonomia</span>
          </div>
          <h1 className="mb-2 font-display text-[32px] sm:text-[42px] font-black text-white tracking-tight">
            Categorias & Temas
          </h1>
          <p className="text-[14.5px] text-muted max-w-2xl leading-relaxed">
            Explora as categorias ativas com rankings criados pela comunidade, ou pesquisa qualquer tema na nossa API para estrear uma nova categoria.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-all shadow-glow"
        >
          <Plus size={16} />
          <span>Criar Tier List</span>
        </Link>
      </div>

      {/* Barra de Pesquisa Híbrida: Categorias Ativas + API em Tempo Real */}
      <div className="relative mb-10 max-w-2xl">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-mutedDim" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar categoria ativa ou explorar na API (ex: Fórmula 1, Rock, Marvel, RPGs)..."
          className="w-full rounded-2xl border border-border bg-surface pl-12 pr-10 py-3 text-sm text-white placeholder-mutedDim focus:border-accent focus:outline-none transition-colors shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setApiResults([]);
            }}
            className="absolute right-3.5 top-3.5 text-mutedDim hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Resultados da Pesquisa na API de Categorias */}
      {searchQuery.trim().length >= 2 && (
        <div className="mb-12 rounded-3xl border border-accent/30 bg-accentSoft/10 p-6 backdrop-blur-md animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-white">
                Resultados da API de Categorias
              </h2>
            </div>
            {isSearchingApi && (
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <Loader2 size={14} className="animate-spin" />
                <span>A consultar API...</span>
              </div>
            )}
          </div>

          {apiResults.length === 0 && !isSearchingApi ? (
            <p className="text-xs text-mutedDim">
              Nenhuma sugestão adicional encontrada na API para "{searchQuery}". Podes criar uma Tier List diretamente com este título no botão acima!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {apiResults.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-[#101118] p-4 flex flex-col justify-between transition-all hover:border-accent hover:shadow-glow group"
                >
                  <div>
                    {item.imageUrl ? (
                      <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-surface2 border border-border/60">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 rounded-xl mb-3 bg-surface2/80 border border-border/60 flex items-center justify-center text-accent">
                        <Sparkles size={28} />
                      </div>
                    )}
                    <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-mutedDim line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInspectApiTopic(item)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-surface2 hover:bg-surface border border-border text-xs font-bold text-white hover:text-accent transition-colors text-center"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateTierListInTopic(item)}
                      className="py-1.5 px-3 rounded-xl bg-accent text-black text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-[22px] font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            <span>
              {searchQuery ? "Categorias Ativas Encontradas" : "Categorias Ativas da Comunidade"}
            </span>
          </h2>
          <span className="text-xs font-semibold text-mutedDim">
            {filteredActive.length}{" "}
            {filteredActive.length === 1 ? "categoria ativa" : "categorias ativas"}
          </span>
        </div>

        {activeCategories.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Ainda não existem categorias com Tier Lists criadas"
            body="No TierForge, uma categoria só surge no Explorar quando a comunidade publica pelo menos uma Tier List sobre ela. Sê o primeiro a estrear uma categoria!"
            actionLabel="Criar a primeira Tier List"
            onAction={() => (window.location.href = "/create")}
          />
        ) : filteredActive.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-border bg-surface/30">
            <p className="text-white font-bold mb-2 text-base">
              Nenhuma categoria ativa encontrada para "{searchQuery}"
            </p>
            <p className="text-xs text-mutedDim mb-5">
              Esta categoria ainda não tem Tier Lists criadas. Podes estreá-la e publicar a primeira lista agora mesmo!
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black text-xs font-bold hover:opacity-90 shadow-glow"
            >
              <Plus size={14} />
              <span>Estrear Categoria "{searchQuery}"</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {filteredActive.map((c) => {
              const Icon = ICON_MAP[c.icon] || ICON_MAP[c.id] || Sparkles;
              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-glow flex flex-col justify-between"
                  style={{ background: "linear-gradient(160deg, #13131A 0%, #181824 100%)" }}
                >
                  {/* Capa Visual da Categoria */}
                  {c.imageUrl && (
                    <div className="w-full h-36 relative overflow-hidden bg-surface2">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/30" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-accentSoft/90 backdrop-blur-md text-accent flex items-center justify-center border border-accent/30">
                          <Icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/10">
                          {c.count} {c.count === 1 ? "Tier List" : "Tier Lists"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {!c.imageUrl && (
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
                            <Icon size={24} />
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface border border-border text-accent">
                            {c.count} {c.count === 1 ? "Tier List" : "Tier Lists"}
                          </span>
                        </div>
                      )}

                      <h3 className="mb-1.5 font-display text-[20px] font-bold text-white">
                        {c.name}
                      </h3>
                      <p className="text-[13px] text-muted leading-relaxed mb-4 line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    {/* Subcategorias Chips */}
                    {c.subcategories && c.subcategories.length > 0 && (
                      <div className="pt-3 border-t border-border/60 mb-4">
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

                    {/* Botões de Ação */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                      <Link
                        to={`/explore?category=${c.id}`}
                        className="flex-1 text-center py-2 px-3 rounded-xl bg-surface border border-border text-xs font-bold text-white hover:bg-surface2 hover:text-accent hover:border-accent/50 transition-colors"
                      >
                        Explorar Tier Lists →
                      </Link>
                      <Link
                        to={`/create?category=${c.id}`}
                        className="py-2 px-3 rounded-xl bg-accent text-black text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                        title="Criar Tier List nesta categoria"
                      >
                        + Criar
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedApiTopic(null)}
        >
          <div
            className="w-full max-w-[500px] rounded-3xl border border-border bg-[#12131a] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedApiTopic.imageUrl && (
              <div className="w-full h-48 relative bg-surface2">
                <img
                  src={selectedApiTopic.imageUrl}
                  alt={selectedApiTopic.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12131a] via-transparent to-black/40" />
                <button
                  onClick={() => setSelectedApiTopic(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-display font-black text-xl text-white">
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

              <p className="text-xs text-muted leading-relaxed mb-4">
                {selectedApiTopic.description}
              </p>

              {topicLoading && (
                <div className="flex items-center gap-2 text-xs text-accent mb-4">
                  <Loader2 size={14} className="animate-spin" />
                  <span>A carregar dados enriquecidos da API...</span>
                </div>
              )}

              {selectedApiTopic.subcategories && selectedApiTopic.subcategories.length > 0 && (
                <div className="mb-5">
                  <div className="text-[11px] font-bold text-mutedDim mb-2">
                    Subcategorias sugeridas pela API:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApiTopic.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-surface border border-border text-muted"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedApiTopic(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => handleCreateTierListInTopic(selectedApiTopic)}
                  className="px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-xs hover:opacity-90 shadow-glow disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>A preparar...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
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
