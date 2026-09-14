import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Componente Flutuante de Voltar para o Topo (Back to Top)
 * Torna-se visível quando o utilizador faz scroll para baixo e faz uma transição suave para o topo.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 320) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar para o topo"
      title="Voltar para o topo"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-borderStrong bg-[#12131A]/90 text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-accent hover:bg-accent hover:text-white active:scale-95 group animate-fadeIn"
      style={{
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.45)",
      }}
    >
      <ArrowUp
        size={19}
        className="transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </button>
  );
}

