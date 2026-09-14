import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Trophy, Plus, Layers, Heart, Users } from "lucide-react";
import { Avatar, Badge, EmptyState, PrimaryButton } from "../components/UI";
import { useLanguage } from "../context/LanguageContext";
import { getLeaderboard } from "../services/db";

export default function Leaderboard() {
  const { t } = useLanguage();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calcula a classificação dos criadores em tempo real a partir dos dados da base de dados
    const ranked = getLeaderboard();
    setCreators(ranked);
    setLoading(false);
  }, []);

  return (
    <div className="mx-auto max-w-[940px] px-4 sm:px-6 pb-28 pt-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="accent">
            <Trophy size={12} /> Classificação Dinâmica
          </Badge>
        </div>
        <h1 className="font-display text-[32px] sm:text-[40px] font-black text-white tracking-tight">
          {t("leaderboard.title")}
        </h1>
        <p className="mt-2 text-[14.5px] text-muted max-w-xl leading-relaxed">
          {t("leaderboard.subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-muted">A calcular classificações…</div>
      ) : creators.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t("leaderboard.empty")}
          cta={
            <Link to="/create" className="inline-block mt-2">
              <PrimaryButton icon={Plus}>{t("home.createBtn")}</PrimaryButton>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-borderStrong bg-surface shadow-2xl">
          {/* Cabeçalho da Tabela */}
          <div className="flex items-center justify-between border-b border-border/80 bg-surface2/60 px-6 py-3.5 text-[11.5px] font-bold uppercase tracking-wider text-mutedDim">
            <div className="flex items-center gap-4">
              <span className="w-8 text-center">{t("leaderboard.rank")}</span>
              <span>{t("leaderboard.creator")}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="hidden sm:inline">Estatísticas</span>
              <span>{t("leaderboard.xp")}</span>
            </div>
          </div>

          {/* Linhas de Criadores Reais */}
          <div className="divide-y divide-border/60">
            {creators.map((c) => (
              <Link
                key={c.uid}
                to={`/profile/${c.handle}`}
                className="flex items-center justify-between px-6 py-4.5 transition-all hover:bg-surface2/60 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-8 text-center font-display text-[16px] font-black ${
                      c.rank === 1
                        ? "text-[#FFD23F] drop-shadow-[0_0_8px_rgba(255,210,63,0.5)]"
                        : c.rank === 2
                        ? "text-[#E0E0E0]"
                        : c.rank === 3
                        ? "text-[#CD7F32]"
                        : "text-mutedDim"
                    }`}
                  >
                    {c.rank}
                  </div>

                  <Avatar name={c.name} image={c.avatar} size={40} />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-white group-hover:text-accent transition-colors truncate">
                        {c.name}
                      </span>
                      {c.rank === 1 && <Crown size={15} className="text-[#FFD23F] flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="font-bold text-accent">#{c.handle}</span>
                      <span className="text-mutedDim">•</span>
                      <span className="text-mutedDim">{c.badge}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
                  {/* Estatísticas reais de listas e votos */}
                  <div className="hidden sm:flex items-center gap-4 text-[12px] text-mutedDim font-semibold">
                    <span className="flex items-center gap-1" title="Tier Lists Criadas">
                      <Layers size={13} /> {c.listsCount}
                    </span>
                    <span className="flex items-center gap-1" title="Votos Recebidos">
                      <Heart size={13} className="text-[#FF5470]" /> {c.votesCount}
                    </span>
                    <span className="flex items-center gap-1" title="Seguidores">
                      <Users size={13} /> {c.followersCount}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-display text-[16px] font-black text-white group-hover:text-accent transition-colors">
                      {c.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
