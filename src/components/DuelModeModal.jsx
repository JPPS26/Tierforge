import React, { useState, useEffect, useCallback } from "react";
import { Swords, X, Trophy, Sparkles, Check, ArrowRight, RotateCcw } from "lucide-react";
import { colorFor } from "./UI";

export default function DuelModeModal({
  isOpen,
  onClose,
  items = [],
  tiers = [],
  onApplyPlacements,
}) {
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [matchups, setMatchups] = useState([]);
  const [eloRatings, setEloRatings] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Inicializar confrontos
  const initDuel = useCallback(() => {
    if (!items || items.length < 2) return;

    const initialElo = {};
    items.forEach((it) => {
      initialElo[it.id] = 1000;
    });
    setEloRatings(initialElo);

    // Gerar pares aleatórios sem repetição imediata
    const pairs = [];
    const count = Math.min(Math.max(items.length * 2, 6), 16);
    setTotalRounds(count);

    for (let i = 0; i < count; i++) {
      const idxA = Math.floor(Math.random() * items.length);
      let idxB = Math.floor(Math.random() * items.length);
      while (idxB === idxA) {
        idxB = Math.floor(Math.random() * items.length);
      }
      pairs.push([items[idxA], items[idxB]]);
    }

    setMatchups(pairs);
    setRound(0);
    setIsFinished(false);
    setSelectedWinner(null);
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      initDuel();
    }
  }, [isOpen, initDuel]);

  // Escolha do vencedor de uma ronda
  const handleVote = useCallback((winnerItem, loserItem) => {
    setSelectedWinner(winnerItem.id);

    setEloRatings((prev) => {
      const ratingA = prev[winnerItem.id] || 1000;
      const ratingB = prev[loserItem.id] || 1000;

      // Cálculo oficial de Elo
      const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
      const expectedB = 1 - expectedA;
      const kFactor = 32;

      const newRatingA = Math.round(ratingA + kFactor * (1 - expectedA));
      const newRatingB = Math.round(ratingB + kFactor * (0 - expectedB));

      return {
        ...prev,
        [winnerItem.id]: newRatingA,
        [loserItem.id]: newRatingB,
      };
    });

    setTimeout(() => {
      setSelectedWinner(null);
      if (round + 1 < matchups.length) {
        setRound((r) => r + 1);
      } else {
        setIsFinished(true);
      }
    }, 400);
  }, [round, matchups.length]);

  // Atalhos de teclado (1 ou Seta Esquerda para Item A; 2 ou Seta Direita para Item B)
  useEffect(() => {
    if (!isOpen || isFinished || matchups.length === 0) return;
    const currentPair = matchups[round];
    if (!currentPair) return;

    function handleKeyDown(e) {
      if (e.key === "1" || e.key === "ArrowLeft") {
        handleVote(currentPair[0], currentPair[1]);
      } else if (e.key === "2" || e.key === "ArrowRight") {
        handleVote(currentPair[1], currentPair[0]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFinished, matchups, round, handleVote]);

  if (!isOpen) return null;

  // Itens ordenados por Elo final
  const sortedItems = [...items].sort(
    (a, b) => (eloRatings[b.id] || 1000) - (eloRatings[a.id] || 1000)
  );

  // Mapear ranking Elo para os Tiers disponíveis
  function generatePlacements() {
    if (tiers.length === 0) return {};
    const placements = {};
    const nTiers = tiers.length;

    sortedItems.forEach((item, index) => {
      // Distribuição proporcional ao longo dos tiers disponíveis
      const tierIndex = Math.min(
        Math.floor((index / sortedItems.length) * nTiers),
        nTiers - 1
      );
      placements[item.id] = tiers[tierIndex].id;
    });

    return placements;
  }

  function handleApply() {
    const generated = generatePlacements();
    if (onApplyPlacements) {
      onApplyPlacements(generated);
    }
    onClose();
  }

  const currentPair = matchups[round];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-white/[0.1] bg-[#0E0F18] shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(124,92,255,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentSoft border border-accent/30 text-accent shadow-sm">
              <Swords size={18} />
            </div>
            <div>
              <h3 className="font-display text-[17px] font-bold text-white tracking-tight">
                Modo Duelo 1 vs 1 (Face-Off)
              </h3>
              <p className="text-[12px] text-mutedDim">
                Escolhe o vencedor em cada confronto para gerar o ranking Elo em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Jogo */}
        {!isFinished && currentPair ? (
          <div className="p-6 sm:p-7 flex flex-col items-center">
            {/* Barra de Progresso */}
            <div className="w-full mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-mutedDim mb-2">
                <span className="flex items-center gap-1.5 text-accent">
                  <Sparkles size={13} />
                  <span>Duelo {round + 1} de {totalRounds}</span>
                </span>
                <span className="font-mono text-muted">{Math.round(((round + 1) / totalRounds) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#131422] border border-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent via-[#9D7BFC] to-teal transition-all duration-300 rounded-full"
                  style={{ width: `${((round + 1) / totalRounds) * 100}%` }}
                />
              </div>
            </div>

            {/* Cartões do Duelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full relative my-1">
              {/* Opção A */}
              <button
                type="button"
                onClick={() => handleVote(currentPair[0], currentPair[1])}
                className={`group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02] text-center ${
                  selectedWinner === currentPair[0].id
                    ? "border-accent bg-accentSoft/60 shadow-glow scale-[1.02]"
                    : "border-white/[0.08] bg-[#131422] hover:border-accent/50 hover:bg-[#18192A]"
                }`}
              >
                <span className="absolute top-3 left-3 text-[10.5px] font-bold text-mutedDim px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.06] group-hover:text-accent group-hover:border-accent/30 transition-colors">
                  [1] Tecla 1 ou ←
                </span>

                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] my-3 flex items-center justify-center shadow-inner">
                  {currentPair[0].imageUrl ? (
                    <img
                      src={currentPair[0].imageUrl}
                      alt={currentPair[0].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${colorFor(currentPair[0].name)}, #101016)` }}
                    >
                      {currentPair[0].name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="font-display text-[15px] font-bold text-white group-hover:text-accent transition-colors line-clamp-2 mt-1">
                  {currentPair[0].name}
                </span>
              </button>

              {/* Distintivo VS Central */}
              <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#0E0F18] border-2 border-accent/40 items-center justify-center font-display font-black text-accent text-xs shadow-[0_0_20px_rgba(124,92,255,0.25)] pointer-events-none z-10">
                VS
              </div>

              {/* Opção B */}
              <button
                type="button"
                onClick={() => handleVote(currentPair[1], currentPair[0])}
                className={`group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02] text-center ${
                  selectedWinner === currentPair[1].id
                    ? "border-accent bg-accentSoft/60 shadow-glow scale-[1.02]"
                    : "border-white/[0.08] bg-[#131422] hover:border-accent/50 hover:bg-[#18192A]"
                }`}
              >
                <span className="absolute top-3 right-3 text-[10.5px] font-bold text-mutedDim px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.06] group-hover:text-accent group-hover:border-accent/30 transition-colors">
                  [2] Tecla 2 ou →
                </span>

                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] my-3 flex items-center justify-center shadow-inner">
                  {currentPair[1].imageUrl ? (
                    <img
                      src={currentPair[1].imageUrl}
                      alt={currentPair[1].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${colorFor(currentPair[1].name)}, #101016)` }}
                    >
                      {currentPair[1].name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="font-display text-[15px] font-bold text-white group-hover:text-accent transition-colors line-clamp-2 mt-1">
                  {currentPair[1].name}
                </span>
              </button>
            </div>

            <p className="mt-4 text-[12px] text-mutedDim text-center">
              Dica: podes clicar ou usar os atalhos de teclado <kbd className="px-1.5 py-0.5 rounded-md bg-[#131422] border border-white/[0.08] text-white font-mono text-[11px]">1</kbd> / <kbd className="px-1.5 py-0.5 rounded-md bg-[#131422] border border-white/[0.08] text-white font-mono text-[11px]">←</kbd> e <kbd className="px-1.5 py-0.5 rounded-md bg-[#131422] border border-white/[0.08] text-white font-mono text-[11px]">2</kbd> / <kbd className="px-1.5 py-0.5 rounded-md bg-[#131422] border border-white/[0.08] text-white font-mono text-[11px]">→</kbd>
            </p>
          </div>
        ) : (
          /* Ecrã de Resultados Finais */
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-accentSoft border border-accent/30 text-accent flex items-center justify-center mb-3 shadow-glow">
              <Trophy size={28} />
            </div>

            <h4 className="font-display text-2xl font-black text-white tracking-tight">
              Duelo Concluído!
            </h4>
            <p className="text-xs text-mutedDim max-w-md mt-1 mb-6">
              Com base nas tuas decisões nos confrontos diretos, calculámos o ranking Elo e a distribuição ideal para a tua Tier List.
            </p>

            {/* Pódio Top 3 */}
            <div className="flex items-end justify-center gap-3 w-full mb-6">
              {sortedItems.slice(0, 3).map((item, idx) => {
                const badges = ["🥇 1º Lugar", "🥈 2º Lugar", "🥉 3º Lugar"];
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center flex-1 max-w-[150px] p-3.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? "border-accent/60 bg-[#131422] shadow-[0_0_20px_rgba(124,92,255,0.2)] -translate-y-1"
                        : "border-white/[0.08] bg-[#131422]"
                    }`}
                  >
                    <span className="text-[11px] font-black text-accent mb-2">{badges[idx]}</span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] mb-2 shadow-inner">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white" style={{ background: colorFor(item.name) }}>
                          {item.name?.[0]}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-xs text-white truncate w-full">{item.name}</span>
                    <span className="text-[10.5px] font-mono text-mutedDim mt-0.5">{eloRatings[item.id] || 1000} pts</span>
                  </div>
                );
              })}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={initDuel}
                className="flex-1 h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl border border-white/[0.08] bg-[#131422] text-[13px] font-bold text-muted hover:text-white hover:bg-[#18192A] transition-all"
              >
                <RotateCcw size={14} />
                <span>Repetir Duelo</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex-1 h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-accent text-[13px] font-bold text-black hover:opacity-90 transition-all shadow-glow"
              >
                <Sparkles size={14} />
                <span>Aplicar à Tier List</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

