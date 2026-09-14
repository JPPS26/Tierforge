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
  return (
    <div
      className="w-full max-w-[480px] rounded-[26px] border border-borderStrong p-5 shadow-2xl backdrop-blur-md transition-all hover:shadow-glow"
      style={{
        background: "linear-gradient(160deg, #14141E 0%, #0E0E14 100%)",
        boxShadow: "0 30px 90px -30px rgba(124,92,255,0.4)",
        transform: "rotate(1.2deg)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-[14px] font-bold text-white flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span>A Tua Tier List</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accentSoft px-2.5 py-1 text-[11px] font-bold text-accent">
          Começa do Zero
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { t: "S", color: "#FF3B5C", label: "O Melhor de Sempre" },
          { t: "A", color: "#FF9F43", label: "Excelente" },
          { t: "B", color: "#FFD23F", label: "Bom / Regular" },
        ].map((r) => (
          <div key={r.t} className="flex h-12 overflow-hidden rounded-xl border border-border">
            <div
              className="flex w-12 items-center justify-center font-display text-[16px] font-black text-[#0A0A0D]"
              style={{ background: r.color }}
            >
              {r.t}
            </div>
            <div className="flex flex-1 items-center justify-between bg-surface2/80 px-3.5 text-xs text-mutedDim">
              <span className="font-medium text-muted">{r.label}</span>
              <span className="text-[11px] text-mutedDim border border-dashed border-border px-2 py-0.5 rounded-lg">
                Arrasta aqui
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-mutedDim border-t border-border pt-3">
        <span className="font-semibold text-muted">100% Personalizável</span>
        <Link to="/create" className="text-accent font-bold hover:underline flex items-center gap-1">
          <span>Criar do Zero</span> →
        </Link>
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
    <div>
      {/* Secção Hero com Estatísticas 100% Reais */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-16 pt-14 sm:pt-20">
        <div className="flex flex-wrap items-center gap-12 sm:gap-16">
          <div className="min-w-[300px] flex-1 basis-[480px]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(124,92,255,0.35)] bg-accentSoft px-3 py-1.5 text-[12px] font-bold text-[#B6A5FF]">
                <Database size={13} /> {t("home.heroBadge")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-[12px] font-semibold text-mutedDim">
                <Sparkles size={12} className="text-accent" /> Acesso Livre sem Registo
              </span>
            </div>

            <h1 className="my-5 font-display text-[clamp(38px,5vw,64px)] font-black leading-[1.04] tracking-tight text-white">
              {t("home.heroTitle1")}
              <br />
              {t("home.heroTitle2")}
            </h1>

            <p className="mb-8 max-w-[480px] text-[16.5px] leading-relaxed text-muted">
              {t("home.heroSubtitle")}
            </p>

            <div className="mb-10 flex flex-wrap gap-3.5">
              <Link to="/create">
                <PrimaryButton icon={Plus}>{t("home.createBtn")}</PrimaryButton>
              </Link>
              <Link to="/explore">
                <GhostButton icon={Flame}>{t("home.exploreBtn")}</GhostButton>
              </Link>
            </div>

            {/* Estatísticas REAIS calculadas estritamente da base de dados */}
            <div className="flex gap-8 sm:gap-10 border-t border-border pt-6">
              <div>
                <div className="font-display text-[24px] sm:text-[28px] font-black text-white">
                  {stats.totalTierLists}
                </div>
                <div className="text-[12px] font-semibold text-mutedDim">
                  {t("home.statLists")}
                </div>
              </div>

              <div>
                <div className="font-display text-[24px] sm:text-[28px] font-black text-white">
                  {stats.totalCreators}
                </div>
                <div className="text-[12px] font-semibold text-mutedDim">
                  {t("home.statCreators")}
                </div>
              </div>

              <div>
                <div className="font-display text-[24px] sm:text-[28px] font-black text-accent">
                  {stats.totalVotes}
                </div>
                <div className="text-[12px] font-semibold text-mutedDim">
                  {t("home.statVotes")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-[300px] flex-1 basis-[380px] justify-center">
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
