import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Flame,
  TrendingUp,
  SlidersHorizontal,
  Zap,
  Trophy,
  Activity,
  Heart,
  Eye,
  Database,
  Layers,
  Sparkles,
  Target,
  Swords,
  Users,
  Compass,
  Download,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { PrimaryButton, GhostButton, colorFor, EmptyState } from "../components/UI";
import TierListCard from "../components/TierListCard";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getActiveCategories, getGlobalStats } from "../services/db";

function LiveHeroTierList({ t }) {
  const [likes, setLikes] = useState(342);
  const [liked, setLiked] = useState(false);

  function handleLike() {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }

  return (
    <div className="relative w-full max-w-[500px]">
      {/* Badge Flutuante Top-Right: Duelo 1 vs 1 */}
      <div className="absolute -top-3 -right-2 sm:-right-4 z-20 flex items-center gap-2 rounded-2xl border border-[#FF5470]/40 bg-[#16131D]/90 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-xl backdrop-blur-xl animate-bounce">
        <Swords size={14} className="text-[#FF5470]" />
        <span>Duelo 1 vs 1 Ativo</span>
      </div>

      {/* Badge Flutuante Bottom-Left: XP de Criador */}
      <div className="absolute -bottom-3 -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-accent/40 bg-[#141224]/95 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-xl backdrop-blur-xl">
        <Sparkles size={14} className="text-[#FFD166]" />
        <span>+350 XP de Criador</span>
      </div>

      {/* Cartão Principal Glassmorphic */}
      <div
        className="w-full rounded-[30px] border border-borderStrong p-5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-accent/60 hover:shadow-glow group"
        style={{
          background: "linear-gradient(165deg, #161622 0%, #0F0F16 100%)",
          boxShadow: "0 30px 100px -25px rgba(124, 92, 255, 0.35)",
        }}
      >
        {/* Cabeçalho do Cartão de Demonstração */}
        <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#00E5A3] text-[#0A0A0D] font-black text-xs">
              TW
            </div>
            <div>
              <div className="font-display text-[14.5px] font-bold text-white flex items-center gap-1.5">
                <span>Top Jogos da Década</span>
                <span className="rounded-full bg-accentSoft px-2 py-0.5 text-[10px] font-bold text-accent">
                  Exemplo
                </span>
              </div>
              <div className="text-[11.5px] text-mutedDim">por @rodrigomatos</div>
            </div>
          </div>

          <span className="flex items-center gap-1.5 rounded-full border border-[rgba(0,229,163,0.3)] bg-[rgba(0,229,163,0.12)] px-2.5 py-1 text-[11px] font-bold text-[#00E5A3]">
            <Flame size={12} /> 1.8k votos
          </span>
        </div>

        {/* Linhas de Tiers Realistas */}
        <div className="flex flex-col gap-2.5">
          {/* Tier S */}
          <div className="flex min-h-[50px] overflow-hidden rounded-2xl border border-border bg-surface2/60 transition-colors group-hover:border-borderStrong">
            <div
              className="flex w-14 items-center justify-center font-display text-[17px] font-black text-[#0A0A0D]"
              style={{ background: "#FF3B5C" }}
            >
              S
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 p-2 px-3">
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm flex items-center gap-1">
                ⭐ GTA VI
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm">
                Elden Ring
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm hidden sm:inline-block">
                The Witcher 3
              </span>
            </div>
          </div>

          {/* Tier A */}
          <div className="flex min-h-[50px] overflow-hidden rounded-2xl border border-border bg-surface2/60 transition-colors group-hover:border-borderStrong">
            <div
              className="flex w-14 items-center justify-center font-display text-[17px] font-black text-[#0A0A0D]"
              style={{ background: "#FF9F43" }}
            >
              A
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 p-2 px-3">
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm">
                Red Dead 2
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm">
                God of War
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm hidden sm:inline-block">
                Cyberpunk
              </span>
            </div>
          </div>

          {/* Tier B */}
          <div className="flex min-h-[50px] overflow-hidden rounded-2xl border border-border bg-surface2/60 transition-colors group-hover:border-borderStrong">
            <div
              className="flex w-14 items-center justify-center font-display text-[17px] font-black text-[#0A0A0D]"
              style={{ background: "#FFD23F" }}
            >
              B
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 p-2 px-3">
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm">
                Skyrim
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm">
                Zelda: TotK
              </span>
              <span className="rounded-lg bg-surface px-2.5 py-1 text-[12px] font-semibold text-white border border-white/10 shadow-sm hidden sm:inline-block">
                Baldur's Gate 3
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé Interativo do Cartão */}
        <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-[12.5px]">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition-all ${
              liked
                ? "border-[#FF5470]/40 bg-[#FF5470]/15 text-[#FF5470]"
                : "border-border bg-surface text-muted hover:text-white"
            }`}
          >
            <Heart size={14} className={liked ? "fill-[#FF5470]" : ""} />
            <span>{likes}</span>
          </button>

          <Link
            to="/create"
            className="flex items-center gap-1.5 font-bold text-accent hover:text-[#9A7CFF] transition-colors group/link"
          >
            <span>Criar a Tua Lista</span>
            <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, to, seeAllText }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon size={20} className="text-[#B6A5FF]" />
        <h2 className="font-display text-[21px] font-bold text-text">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="text-[13.5px] font-semibold text-muted hover:text-text transition-colors">
          {seeAllText}
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [trendingLists, setTrendingLists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalTierLists: 0, totalCreators: 0, totalVotes: 0 });

  useEffect(() => {
    // Carregamento de dados 100% reais da base de dados
    getTierLists({ tab: "Trending" }).then((lists) => {
      setTrendingLists(lists.slice(0, 4));
    });
    setCategories(getActiveCategories());
    setStats(getGlobalStats());
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Luzes Ambientais de Fundo (Glow Effect) */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-[550px] w-full max-w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(124,92,255,0.22),transparent_65%)]" />
      <div className="pointer-events-none absolute top-48 right-0 -z-10 h-[380px] w-[380px] rounded-full bg-[#00E5A3]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-32 left-0 -z-10 h-[320px] w-[320px] rounded-full bg-[#7C5CFF]/15 blur-[100px]" />

      {/* Secção Hero Principal */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-20 pt-12 sm:pt-16">
        <div className="flex flex-wrap items-center gap-12 lg:gap-16">
          {/* Coluna Esquerda: Texto, Ações e Estatísticas */}
          <div className="min-w-[300px] flex-1 basis-[480px]">
            {/* Badges de Topo */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accentSoft px-3.5 py-1.5 text-[12px] font-bold text-[#C2B5FF] shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A3] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5A3]"></span>
                </span>
                <span>TierWorld 2.0 • A Casa Global dos Rankings</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-[12px] font-medium text-mutedDim backdrop-blur-md">
                <Database size={13} className="text-[#00E5A3]" /> 100% Base de Dados Real
              </span>
            </div>

            {/* Título Principal com Gradiente de Impacto */}
            <h1 className="my-4 font-display text-[clamp(38px,5.2vw,64px)] font-black leading-[1.06] tracking-tight text-white">
              {t("home.heroTitle1")}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6A5FF] via-[#7C5CFF] to-[#00E5A3]">
                {t("home.heroTitle2")}
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mb-7 max-w-[500px] text-[16px] sm:text-[17px] leading-relaxed text-muted">
              {t("home.heroSubtitle")}
            </p>

            {/* Botões de Ação Principais */}
            <div className="mb-5 flex flex-wrap items-center gap-3.5">
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] px-6 py-3.5 text-[14.5px] font-bold text-white shadow-glow transition-all hover:from-[#8B6EFA] hover:to-[#7954F5] hover:scale-105 active:scale-95"
              >
                <Plus size={18} />
                <span>{t("home.createBtn")}</span>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-borderStrong bg-surface/80 px-6 py-3.5 text-[14.5px] font-semibold text-text backdrop-blur-md transition-all hover:border-accent/40 hover:bg-surface2 hover:text-white hover:scale-105 active:scale-95"
              >
                <Flame size={18} className="text-[#FF5470]" />
                <span>{t("home.exploreBtn")}</span>
              </Link>
            </div>

            {/* Temas Rápidos em Destaque */}
            <div className="mb-8 flex flex-wrap items-center gap-2 text-[12px] text-mutedDim">
              <span className="font-semibold text-muted">Temas em destaque:</span>
              {["Gaming", "Futebol", "Cinema & Séries", "Anime", "Música"].map((tag) => (
                <Link
                  key={tag}
                  to={`/explore?search=${encodeURIComponent(tag)}`}
                  className="rounded-lg border border-border/60 bg-surface/60 px-2.5 py-1 text-muted transition-all hover:border-accent/50 hover:bg-surface2 hover:text-white"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Estatísticas REAIS em Glass Dock */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-3xl border border-borderStrong bg-surface/50 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Layers size={14} className="text-accent" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Tier Lists</span>
                </div>
                <div className="font-display text-[22px] sm:text-[28px] font-black text-white">
                  {stats.totalTierLists}
                </div>
                <span className="text-[11px] text-mutedDim">listas ativas</span>
              </div>

              <div className="flex flex-col gap-1 border-l border-border/70 pl-3 sm:pl-4">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#00E5A3]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Criadores</span>
                </div>
                <div className="font-display text-[22px] sm:text-[28px] font-black text-white">
                  {stats.totalCreators}
                </div>
                <span className="text-[11px] text-mutedDim">comunidade</span>
              </div>

              <div className="flex flex-col gap-1 border-l border-border/70 pl-3 sm:pl-4">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-[#FFD166]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-mutedDim">Votos</span>
                </div>
                <div className="font-display text-[22px] sm:text-[28px] font-black text-accent">
                  {stats.totalVotes}
                </div>
                <span className="text-[11px] text-mutedDim">calculados</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Cartão Interativo LiveHeroTierList */}
          <div className="flex min-w-[300px] flex-1 basis-[380px] justify-center lg:justify-end">
            <LiveHeroTierList t={t} />
          </div>
        </div>
      </section>

      {/* Em Destaque (Dados Reais) com Empty State elegante */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-16">
        <SectionHeader
          icon={TrendingUp}
          title={t("home.trendingTitle")}
          to="/explore"
          seeAllText={t("home.seeAll")}
        />
        {trendingLists.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="🚀 Ainda não existem Tier Lists em destaque."
            body="Cria a primeira tier list da plataforma e sê o pioneiro a aparecer aqui!"
            cta={
              <Link to="/create" className="inline-block mt-2">
                <PrimaryButton small icon={Plus}>{t("home.createBtn")}</PrimaryButton>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {trendingLists.map((l) => (
              <TierListCard key={l.id} list={l} />
            ))}
          </div>
        )}
      </section>

      {/* Categorias Temáticas */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-16">
        <SectionHeader
          icon={SlidersHorizontal}
          title={t("home.categoriesTitle")}
          to="/categories"
          seeAllText={t("home.seeAll")}
        />
        {categories.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="Ainda não existem categorias"
            body="As categorias surgirão aqui automaticamente."
            actionLabel={t("home.createBtn")}
            onAction={() => (window.location.href = "/create")}
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {categories.slice(0, 12).map((c) => (
              <Link
                key={c.id}
                to={`/explore?category=${c.id}`}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface2 hover:-translate-y-0.5 shadow-sm"
              >
                <div className="font-display text-[15px] font-bold text-text group-hover:text-accent transition-colors">
                  {t(`categories.${c.id}`) || c.name}
                </div>
                <div className="text-[12px] font-semibold text-mutedDim">
                  {c.count > 0 ? t("home.listsCount", { count: c.count }) : "Explorar temas"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Secção: O Objetivo e as Principais Funções do TierWorld */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-28">
        {/* Cabeçalho de Secção com Badge */}
        <div className="mb-10 text-center max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accentSoft px-3.5 py-1 text-[12px] font-bold text-[#B6A5FF] mb-3 shadow-sm">
            <Target size={14} className="text-accent" />
            <span>{t("home.featuresBadge") || "Missão & Funcionalidades"}</span>
          </div>
          <h2 className="font-display text-[26px] sm:text-[34px] font-black text-white tracking-tight leading-tight">
            {t("home.featuresTitle") || "O Objetivo e as Principais Funções do TierWorld"}
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            {t("home.featuresSubtitle") || "Criado para ser a casa definitiva dos rankings comunitários com ferramentas modernas, livres e 100% autênticas."}
          </p>
        </div>

        {/* Card em Destaque: O Nosso Objetivo */}
        <div className="relative overflow-hidden rounded-[28px] border border-borderStrong bg-gradient-to-br from-[#181824] via-[#12121A] to-[#0D0D12] p-6 sm:p-9 shadow-2xl mb-8 group">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-[720px]">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-2">
                <Sparkles size={13} /> Missão Global da Plataforma
              </span>
              <h3 className="font-display text-[20px] sm:text-[24px] font-bold text-white mb-3">
                {t("home.missionTitle") || "O Nosso Objetivo: Unir a Comunidade Através de Rankings Reais"}
              </h3>
              <p className="text-[14px] leading-relaxed text-muted">
                {t("home.missionDesc") || "O TierWorld nasceu com uma missão clara: substituir as ferramentas lentas e ultrapassadas por uma plataforma rápida, elegante e interativa. Aqui qualquer pessoa pode criar rankings sobre qualquer assunto — de jogos e futebol a cinema, música e tecnologia — debater com a comunidade e explorar opiniões apoiadas em dados reais e votos autênticos."}
              </p>

              {/* 3 Pilares com Badges */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[12.5px] font-semibold text-white">
                  <CheckCircle2 size={14} className="text-[#00E5A3]" />
                  <span>{t("home.missionPillar1") || "100% Gratuito & Aberto"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[12.5px] font-semibold text-white">
                  <CheckCircle2 size={14} className="text-[#00E5A3]" />
                  <span>{t("home.missionPillar2") || "Sem Bots nem Votos Falsos"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[12.5px] font-semibold text-white">
                  <CheckCircle2 size={14} className="text-[#00E5A3]" />
                  <span>{t("home.missionPillar3") || "Comunidade & Perfis #ID"}</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] px-6 py-3.5 font-display text-[14px] font-bold text-white shadow-glow hover:from-[#8B6EFA] hover:to-[#7954F5] transition-all hover:scale-105 active:scale-95"
              >
                <span>Experimentar Agora</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Grelha de 6 Funções Chave do Site */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Layers,
              title: t("home.feature1Title"),
              body: t("home.feature1Desc"),
              tag: "Criação",
              color: "#7C5CFF",
            },
            {
              icon: Swords,
              title: t("home.feature2Title"),
              body: t("home.feature2Desc"),
              tag: "Minijogo",
              color: "#FF5470",
            },
            {
              icon: Compass,
              title: t("home.feature3Title"),
              body: t("home.feature3Desc"),
              tag: "Descoberta",
              color: "#00E5A3",
            },
            {
              icon: Users,
              title: t("home.feature4Title"),
              body: t("home.feature4Desc"),
              tag: "Social",
              color: "#FFD166",
            },
            {
              icon: MessageSquare,
              title: t("home.feature5Title"),
              body: t("home.feature5Desc"),
              tag: "Comunidade",
              color: "#38B6FF",
            },
            {
              icon: Download,
              title: t("home.feature6Title"),
              body: t("home.feature6Desc"),
              tag: "Exportação",
              color: "#A855F7",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="relative flex flex-col justify-between rounded-3xl border border-border bg-surface/80 p-6 transition-all duration-300 hover:border-borderStrong hover:bg-surface hover:shadow-xl hover:-translate-y-1 group"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110"
                    style={{
                      background: `${f.color}15`,
                      color: f.color,
                      border: `1px solid ${f.color}35`,
                    }}
                  >
                    <f.icon size={22} />
                  </div>
                  <span className="rounded-lg border border-border bg-surface2 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-muted">
                    {f.tag}
                  </span>
                </div>
                <h4 className="mb-2 font-display text-[17px] font-bold text-white group-hover:text-accent transition-colors">
                  {f.title}
                </h4>
                <p className="text-[13.5px] leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
