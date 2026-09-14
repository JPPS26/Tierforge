// Serviço de Segurança e Moderação de Conteúdo (Safety Filter)
// Deteta vocabulário impróprio, insultos, assédio, toxicidade e padrões de spam/phishing

const BLOCKED_WORDS = new Set([
  // Termos ofensivos e insultos graves em português
  "caralho", "foda-se", "fodasse", "puta", "puto", "paneleiro", "paneleirice",
  "cabrão", "cabrao", "filho da puta", "fdp", "fode-te", "vai-te foder",
  "merda", "bosta", "otário", "otario", "estúpido", "estupido", "idiota",
  "imbecil", "retardado", "cretino", "mongolóide", "mongoloide", "escroto",
  "chupa", "piroca", "cona", "caralhete", "corno", "cornudo", "vadia",
  "arrombado", "cuzao", "cuzão", "babaca", "viado", "boiola", "traveco",
  "preto de merda", "cigano de merda",

  // Termos ofensivos graves em inglês
  "fuck", "fucking", "fucker", "shit", "bitch", "asshole", "bastard",
  "cunt", "nigger", "nigga", "faggot", "dickhead", "retard", "whore",
  "slut", "motherfucker", "cock", "pussy"
]);

// Padrões de links maliciosos e spam
const SPAM_PATTERNS = [
  /free-?(nitro|robux|vbucks|skins|coins)/i,
  /bit\.ly|tinyurl\.com|goo\.gl|t\.co|is\.gd/i,
  /telegram\.me|t\.me\/join/i,
  /whatsapp\.com\/channel/i,
  /(ganha|ganhe)\s+\d+\s*(€|\$|euros|reais)/i,
  /crypto-?(invest|pump|giveaway)/i,
];

/**
 * Valida a conformidade e segurança de um texto antes de ser publicado.
 * @param {string} text - O texto a avaliar.
 * @returns {{ isSafe: boolean, reason?: string, matchedWord?: string }}
 */
export function checkContentSafety(text) {
  if (!text || typeof text !== "string") {
    return { isSafe: true };
  }

  const clean = text.trim();
  if (clean.length === 0) {
    return { isSafe: true };
  }

  // 1. Verificação de padrões de spam/phishing
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isSafe: false,
        reason: "O comentário parece conter spam, publicidade abusiva ou links suspeitos.",
      };
    }
  }

  // 2. Verificação de repetição excessiva de caracteres (spam flood)
  if (/(.)\1{7,}/i.test(clean)) {
    return {
      isSafe: false,
      reason: "O comentário contém repetições excessivas de caracteres.",
    };
  }

  // 3. Normalização e deteção de palavras bloqueadas
  // Converte texto em palavras minúsculas sem pontuação
  const normalized = clean
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos para comparação uniforme

  // Separa em palavras simples
  const words = clean
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>]/g, " ")
    .split(/\s+/);

  for (const word of words) {
    if (BLOCKED_WORDS.has(word)) {
      return {
        isSafe: false,
        reason: "O comentário contém linguagem ofensiva ou desrespeitosa.",
        matchedWord: word,
      };
    }
  }

  // Verifica também expressões de duas palavras (ex: filho da puta)
  for (const phrase of BLOCKED_WORDS) {
    if (phrase.includes(" ") && clean.toLowerCase().includes(phrase)) {
      return {
        isSafe: false,
        reason: "O comentário contém expressões ofensivas que violam as regras da comunidade.",
        matchedWord: phrase,
      };
    }
  }

  return { isSafe: true };
}

/**
 * Extrai todos os handles de utilizador (@nome) presentes num texto.
 * @param {string} text
 * @returns {string[]} Lista de handles sem o prefixo '@'
 */
export function extractMentions(text) {
  if (!text || typeof text !== "string") return [];
  const matches = text.match(/@([a-zA-Z0-9_]{3,20})/g);
  if (!matches) return [];
  const handles = matches.map((m) => m.slice(1).toLowerCase());
  return Array.from(new Set(handles));
}

