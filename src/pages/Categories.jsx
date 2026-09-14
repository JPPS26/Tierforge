import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getActiveCategories } from "../services/db";
import { PrimaryButton } from "../components/UI";
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
  Compass,
  Info,
  CheckCircle2,
} from "lucide-react";

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

function getCatVisuals(cat) {
  const key = (cat.id || cat.slug || "").toLowerCase();
  const IconComponent = CATEGORY_ICONS[key] || CATEGORY_ICONS[cat.icon] || Layers;
  const color = cat.color || CATEGORY_COLORS[key] || "#7C5CFF";
  return { IconComponent, color };
}

export default function Categories() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Categorias ativas com Tier Lists criadas (REGRA ESTRITA: apenas categorias com listas criadas)
  const [activeCategories, setActiveCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega estritamente as categorias que têm Tier Lists criadas (> 0)
    const active = getActiveCategories();
    setActiveCategories(active);
    setLoading(false);
  }, []);

  // Filtragem local exclusivamente das categorias ativas existentes
  const filteredActive = useMemo(() => {
    if (!searchQuery.trim()) return activeCategories;
    const q = searchQuery.toLowerCase().trim();
    return activeCategories.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (c.subcategories || []).some((sub) =>
          (typeof sub === "string" ? sub : sub.name || "").toLowerCase().includes(q)
        )
    );
  }, [activeCategories, searchQuery]);

  const totalTierListsCount = activeCategories.reduce((acc, c) => acc + (c.count || 0), 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28 pt-10">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-[#B6A5FF] font-bold text-[12px] mb-3 shadow-sm">
            <Layers size={13} className="text-accent" />
            <span>Comunidades & Categorias Ativas</span>
          </div>
          <h1 className="font-display text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-tight">
            Categorias & Temas
          </h1>
          <p className="mt-2 text-[14.5px] text-muted max-w-2xl leading-relaxed">
            Aqui encontras exclusivamente as categorias criadas pela comunidade através de Tier Lists publicadas. Cada nova categoria surge aqui automaticamente assim que um membro publica uma lista sobre o tema.
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
            <span className="text-[12px] font-medium text-mutedDim">Criadas através de Tier Lists</span>
          </div>
        </div>

        {/* Card 2: Total de Tier Lists Organizadas */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E5A3]/40 bg-[#00E5A3]/10 text-[#00E5A3] shadow-sm shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Tier Lists Publicadas</span>
            <div className="font-display text-[22px] font-black text-white">
              {totalTierListsCount}
            </div>
            <span className="text-[12px] font-medium text-mutedDim">Distribuídas nestas categorias</span>
          </div>
        </div>

        {/* Card 3: Como Estrear uma Categoria */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E15] p-4.5 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-sm shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Inaugurar Novo Nicho</span>
            <div className="font-display text-[16px] font-bold text-white mt-0.5">
              Criar ao Publicar
            </div>
            <span className="text-[12px] font-medium text-mutedDim">Define a categoria no Criador</span>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa de Categorias Ativas */}
      {activeCategories.length > 0 && (
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedDim pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar entre as categorias ativas da comunidade..."
              className="w-full rounded-2xl border border-white/10 bg-[#12121C]/90 pl-12 pr-10 py-3.5 text-[14px] text-white placeholder-mutedDim focus:border-accent focus:bg-[#181826] focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all shadow-lg backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mutedDim hover:text-white transition-colors"
                title="Limpar pesquisa"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Secção Principal: Grelha de Categorias Criadas pela Comunidade */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 border border-accent/30 text-accent">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="font-display text-[22px] font-black text-white tracking-tight">
                {searchQuery ? "Categorias Encontradas" : "Categorias Criadas por Tier Lists"}
              </h2>
            </div>
          </div>
          <span className="text-[12px] font-bold text-mutedDim bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {filteredActive.length}{" "}
            {filteredActive.length === 1 ? "categoria ativa" : "categorias ativas"}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted text-sm">
            A carregar categorias criadas pela comunidade…
          </div>
        ) : activeCategories.length === 0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-[#161624] via-[#12121A] to-[#0E0E14] p-10 sm:p-14 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-inner">
              <Layers size={26} />
            </div>
            <h3 className="font-display text-[20px] font-bold text-white">
              Ainda não existem categorias com Tier Lists criadas
            </h3>
            <p className="mt-2 text-[14px] text-muted max-w-md mx-auto leading-relaxed">
              No TierWorld, as categorias surgem aqui automaticamente quando a comunidade publica a primeira Tier List sobre o tema. Sê o primeiro a inaugurar uma categoria!
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/create">
                <PrimaryButton icon={Plus}>
                  {t("home.createBtn") || "Criar a primeira Tier List"}
                </PrimaryButton>
              </Link>
            </div>
          </div>
        ) : filteredActive.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/[0.08] bg-[#141420]/60 backdrop-blur-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-surface2 text-mutedDim">
              <Search size={20} />
            </div>
            <p className="text-white font-display font-bold mb-1.5 text-[17px]">
              Nenhuma categoria ativa encontrada para "{searchQuery}"
            </p>
            <p className="text-[13px] text-mutedDim mb-6 max-w-md mx-auto leading-relaxed">
              Esta categoria ainda não tem Tier Lists criadas pela comunidade. Para inaugurá-la, publica uma nova Tier List sobre este tema!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-[13px] font-bold text-white hover:bg-surface2 transition-all"
              >
                Limpar Pesquisa
              </button>
              <Link to={`/create?category=${encodeURIComponent(searchQuery)}`}>
                <PrimaryButton icon={Plus}>
                  <span>Inaugurar Categoria "{searchQuery}"</span>
                </PrimaryButton>
              </Link>
            </div>
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
                        {c.description || "Comunidade temática ativa com rankings livres e votações abertas."}
                      </p>
                    </div>

                    {/* Subcategorias Chips (se existirem na categoria) */}
                    {c.subcategories && c.subcategories.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
                        <div className="text-[11.5px] font-bold text-mutedDim mb-2">
                          Subcategorias disponíveis:
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

      {/* Painel Informativo: Como Funcionam as Categorias */}
      <div className="mt-14 relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-[#161624] via-[#12121A] to-[#0E0E14] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-display text-[17px] font-bold text-white">
                Como são Criadas as Categorias no TierWorld?
              </h3>
              <p className="text-[12.5px] text-muted font-normal">
                Estrutura 100% orgânica orientada pela atividade real da comunidade.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00E5A3]/30 bg-[#00E5A3]/10 px-3 py-1 text-[11px] font-bold text-[#00E5A3] shrink-0 self-start sm:self-auto">
            <CheckCircle2 size={13} />
            <span>Sem Categorias Vazias</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
            <div className="font-display text-[16px] font-bold text-white mb-1">
              1. Criação no Criador de Tier Lists
            </div>
            <p className="text-[12px] text-mutedDim leading-relaxed">
              Ao criar uma Tier List, escolhes ou pesquisas qualquer categoria e subcategoria na taxonomia aberta.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
            <div className="font-display text-[16px] font-bold text-white mb-1">
              2. Inauguração Automática
            </div>
            <p className="text-[12px] text-mutedDim leading-relaxed">
              Assim que a lista é publicada, a categoria é ativada imediatamente e passa a ser exibida nesta página.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-4">
            <div className="font-display text-[16px] font-bold text-white mb-1">
              3. Biblioteca Sempre Relevante
            </div>
            <p className="text-[12px] text-mutedDim leading-relaxed">
              Todas as categorias visíveis têm rankings reais e ativos para explorar, votar e debater com outros membros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
