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
} from "lucide-react";
import { PrimaryButton, GhostButton, colorFor, EmptyState } from "../components/UI";
import TierListCard from "../components/TierListCard";
import { useLanguage } from "../context/LanguageContext";
import { getTierLists, getCategories, getGlobalStats } from "../services/db";

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
    setCategories(getCategories());
    setStats(getGlobalStats());
  }, []);

  return (
    <div>
      {/* Secção Hero com Estatísticas 100% Reais */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-16 pt-14 sm:pt-20">
        <div className="flex flex-wrap items-center gap-12 sm:gap-16">
          <div className="min-w-[300px] flex-1 basis-[480px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(124,92,255,0.35)] bg-accentSoft px-3 py-1.5 text-[12px] font-bold text-[#B6A5FF]">
              <Database size={13} /> {t("home.heroBadge")}
            </span>

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

      {/* Categorias (Apenas as que têm Tier Lists Reais) */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-16">
        <SectionHeader
          icon={SlidersHorizontal}
          title={t("home.categoriesTitle")}
          to="/categories"
          seeAllText={categories.filter((c) => c.count > 0).length > 0 ? t("home.seeAll") : null}
        />
        {categories.filter((c) => c.count > 0).length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="Ainda não existem categorias com listas"
            body="As categorias surgirão aqui automaticamente assim que os criadores publicarem as primeiras Tier Lists."
            actionLabel={t("home.createBtn")}
            onAction={() => (window.location.href = "/create")}
          />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {categories
              .filter((c) => c.count > 0)
              .slice(0, 10)
              .map((c) => (
                <Link
                  key={c.id}
                  to={`/explore?category=${c.id}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-accent hover:bg-surface2 hover:-translate-y-0.5 shadow-sm"
                >
                  <div className="font-display text-[15px] font-bold text-text group-hover:text-accent transition-colors">
                    {t(`categories.${c.id}`) || c.name}
                  </div>
                  <div className="text-[12px] font-semibold text-mutedDim">
                    {t("home.listsCount", { count: c.count })}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Funcionalidades Principais */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-24">
        <SectionHeader icon={Zap} title={t("home.featuresTitle")} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {[
            {
              icon: Database,
              title: t("home.feature1Title"),
              body: t("home.feature1Desc"),
            },
            {
              icon: Layers,
              title: t("home.feature2Title"),
              body: t("home.feature2Desc"),
            },
            {
              icon: Activity,
              title: t("home.feature3Title"),
              body: t("home.feature3Desc"),
            },
            {
              icon: Trophy,
              title: t("home.feature4Title"),
              body: t("home.feature4Desc"),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border bg-surface p-6 transition-all hover:border-borderStrong hover:shadow-subtle"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accentSoft text-accent shadow-inner">
                <f.icon size={21} />
              </div>
              <div className="mb-2 font-display text-[16.5px] font-bold text-white">{f.title}</div>
              <div className="text-[13.5px] leading-relaxed text-muted">{f.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
