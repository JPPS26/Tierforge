import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, SUPPORTED_LANGUAGES } from "../i18n/translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "tierforge_lang";
const DEFAULT_LANG = "pt"; // Português de Portugal como idioma principal

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) return saved;
      // If browser starts with pt-BR, could select pt-BR, otherwise default to pt
      const browserLang = navigator.language;
      if (browserLang === "pt-BR" && translations["pt-BR"]) return "pt-BR";
      return DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  function setLanguage(code) {
    if (translations[code]) {
      setLanguageState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch (e) {
        console.warn("Could not save language to localStorage", e);
      }
    }
  }

  // Helper to translate nested keys like "nav.explore" or "home.statLists"
  function t(path, params = {}) {
    const keys = path.split(".");
    let current = translations[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to Portuguese (PT)
        let fallback = translations[DEFAULT_LANG];
        for (const fbKey of keys) {
          if (fallback && typeof fallback === "object" && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback ?? path;
        break;
      }
    }

    if (typeof current === "string") {
      let result = current;
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      }
      return result;
    }

    return path;
  }

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}

