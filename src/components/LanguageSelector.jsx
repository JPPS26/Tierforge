import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import CountryFlag from "./CountryFlag";

export default function LanguageSelector({ compact = false, direction = "down" }) {
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-[13px] font-medium text-text transition-colors hover:border-borderStrong hover:bg-surface2 ${
          compact ? "px-2.5 py-1 text-[12px]" : ""
        }`}
        aria-label="Selecionar idioma"
      >
        <CountryFlag code={currentLanguage.code} size={18} />
        {!compact && <span className="hidden sm:inline font-display">{currentLanguage.label}</span>}
        <ChevronDown
          size={13}
          className={`text-muted transition-transform duration-200 ${
            direction === "up"
              ? open
                ? "rotate-0"
                : "-rotate-180"
              : open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 min-w-[190px] overflow-hidden rounded-2xl border border-borderStrong bg-[#12131A] p-1.5 shadow-2xl backdrop-blur-xl animate-fadeIn ${
            direction === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
          }`}
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
            <Globe size={11} /> Idioma / Language
          </div>
          <div className="flex flex-col gap-0.5">
            {languages.map((lang) => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors ${
                    isActive
                      ? "bg-accentSoft font-semibold text-[#B6A5FF]"
                      : "text-text hover:bg-surface2"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CountryFlag code={lang.code} size={20} />
                    <span>{lang.label}</span>
                  </span>
                  {isActive && <Check size={14} className="text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

