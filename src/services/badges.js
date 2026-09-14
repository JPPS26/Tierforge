/**
 * Sistema de Badges e Conquistas Reais do Tierforge
 * Todas as conquistas são calculadas estritamente com base na atividade real do utilizador.
 */

export const BADGE_DEFINITIONS = {
  PIONEER: {
    id: "pioneer",
    name: "Pioneiro",
    icon: "👑",
    tone: "amber",
    description: "Membro da fase inaugural da plataforma TierWorld.",
  },
  TIER_ARCHITECT: {
    id: "tier_architect",
    name: "Arquiteto",
    icon: "🏗️",
    tone: "accent",
    description: "Criou 3 ou mais Tier Lists públicas.",
  },
  TIER_MASTER: {
    id: "tier_master",
    name: "Mestre das Tiers",
    icon: "🏆",
    tone: "amber",
    description: "Criou 10 ou mais Tier Lists públicas.",
  },
  COMMUNITY_VOICE: {
    id: "community_voice",
    name: "Voz Ativa",
    icon: "💬",
    tone: "teal",
    description: "Participou com 5 ou mais comentários na comunidade.",
  },
  VIRAL_CREATOR: {
    id: "viral_creator",
    name: "Criador Destaque",
    icon: "🔥",
    tone: "rose",
    description: "Acumulou mais de 20 votos positivos nas suas listas.",
  },
  REMIXER: {
    id: "remixer",
    name: "Remixer",
    icon: "⚡",
    tone: "accent",
    description: "Criou a sua versão de um template da comunidade.",
  },
  TRENDSETTER: {
    id: "trendsetter",
    name: "Tendência",
    icon: "✨",
    tone: "teal",
    description: "Alcançou mais de 100 visualizações numa única Tier List.",
  },
};

/**
 * Calcula os badges reais ganhos por um utilizador
 * @param {Object} params
 * @param {Array} params.userLists - Listas criadas pelo utilizador
 * @param {Array} params.userComments - Comentários feitos pelo utilizador (ou contagem)
 * @param {Object} params.userData - Dados de perfil / utilizador
 */
export function calculateUserBadges({ userLists = [], commentsCount = 0, userData = {} }) {
  const badges = [];

  // Regra 1: Pioneiro (criou conta ou lista na fase inicial)
  badges.push(BADGE_DEFINITIONS.PIONEER);

  // Regra 2: Arquiteto (>= 3 listas)
  if (userLists.length >= 3) {
    badges.push(BADGE_DEFINITIONS.TIER_ARCHITECT);
  }

  // Regra 3: Mestre (>= 10 listas)
  if (userLists.length >= 10) {
    badges.push(BADGE_DEFINITIONS.TIER_MASTER);
  }

  // Regra 4: Voz Ativa (>= 5 comentários)
  if (commentsCount >= 5) {
    badges.push(BADGE_DEFINITIONS.COMMUNITY_VOICE);
  }

  // Regra 5: Criador Destaque (>= 20 votos no total)
  const totalVotes = userLists.reduce((sum, l) => sum + (l.votes || 0), 0);
  if (totalVotes >= 20) {
    badges.push(BADGE_DEFINITIONS.VIRAL_CREATOR);
  }

  // Regra 6: Remixer (criou pelo menos 1 lista a partir de um template)
  const hasRemix = userLists.some((l) => Boolean(l.parentTemplateId));
  if (hasRemix) {
    badges.push(BADGE_DEFINITIONS.REMIXER);
  }

  // Regra 7: Tendência (>= 100 views numa lista)
  const hasViralViews = userLists.some((l) => (l.views || 0) >= 100);
  if (hasViralViews) {
    badges.push(BADGE_DEFINITIONS.TRENDSETTER);
  }

  return badges;
}

