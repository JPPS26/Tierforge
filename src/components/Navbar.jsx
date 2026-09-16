import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  Users,
  Layers,
  X,
  Compass,
  Trophy,
  Menu,
  LogIn,
  Zap,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, PrimaryButton, Badge } from "./UI";
import ProfileEditModal from "./ProfileEditModal";
import NotificationsDropdown from "./NotificationsDropdown";
import TierWorldLogo from "./TierWorldLogo";
import { searchOmni } from "../services/db";
import { getCreatorLevelInfo } from "../services/badges";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState({ creators: [], tierlists: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuContainerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fecha o menu móvel em qualquer mudança de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atalho de teclado global Ctrl+K / Cmd+K para focar a barra de pesquisa
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Omni-Search com debounce
  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults({ creators: [], tierlists: [] });
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchOmni(q);
      setSearchResults(results);
      setSearchOpen(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [q]);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  }

  function handleSearchSubmit(e) {
    if (e.key === "Enter" && q.trim()) {
      setSearchOpen(false);
      setMobileSearchOpen(false);
      navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
    }
  }

  const hasResults = searchResults.creators.length > 0 || searchResults.tierlists.length > 0;

  const levelInfo = getCreatorLevelInfo(profile?.creatorXp || 0);

  const isExploreActive = location.pathname === "/explore";
  const isLeaderboardActive = location.pathname === "/leaderboard";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090D] backdrop-blur-2xl transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6">
          {/* Lado Esquerdo: Logótipo & Navegação em Barra Island */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2.5 group select-none">
              <TierWorldLogo size={32} showText={true} />
            </Link>

            {/* Links de Navegação Coesos em Barra Island (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-[#141522] p-1 shadow-sm backdrop-blur-md">
              <Link
                to="/explore"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-150 ${
                  isExploreActive
                    ? "bg-accent/20 text-white border border-accent/40 shadow-[0_0_12px_rgba(124,92,255,0.25)]"
                    : "text-muted hover:text-white hover:bg-white/[0.06] border border-transparent"
                }`}
              >
                <Compass
                  size={15}
                  className={isExploreActive ? "text-accent" : "text-mutedDim"}
                />
                <span>{t("nav.explore")}</span>
              </Link>

              <div className="h-4 w-[1px] bg-white/[0.08]" />

              <Link
                to="/leaderboard"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition-all duration-150 ${
                  isLeaderboardActive
                    ? "bg-amber-500/20 text-white border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    : "text-muted hover:text-white hover:bg-white/[0.06] border border-transparent"
                }`}
              >
                <Trophy
                  size={15}
                  className={isLeaderboardActive ? "text-amber-400" : "text-mutedDim"}
                />
                <span>{t("nav.leaderboard")}</span>
              </Link>
            </nav>
          </div>

          {/* Centro: Barra de Pesquisa Omni-Search Proporcional com o Mesmo Layout */}
          <div className="relative hidden max-w-[360px] xl:max-w-[420px] flex-1 lg:block mx-3" ref={searchContainerRef}>
            <div className="relative flex h-10 items-center rounded-2xl border border-white/[0.08] bg-[#141522] px-3 shadow-sm transition-all duration-200 hover:border-white/20 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 focus-within:shadow-[0_0_20px_rgba(124,92,255,0.2)]">
              <Search size={15} className="pointer-events-none text-mutedDim shrink-0 mr-2.5" />
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchSubmit}
                placeholder={t("nav.searchPlaceholder")}
                className="w-full bg-transparent py-1.5 text-[13px] text-text outline-none transition-all placeholder:text-mutedDim"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setSearchOpen(false);
                  }}
                  className="text-mutedDim hover:text-white ml-1.5 p-0.5 rounded-md hover:bg-white/[0.06] transition-colors"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="pointer-events-none ml-1.5 shrink-0 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-mutedDim">
                  ⌘K
                </span>
              )}
            </div>

            {/* Dropdown de Resultados da Pesquisa Omni */}
            {searchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-3xl border border-borderStrong bg-[#0F1017] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(124,92,255,0.12)] backdrop-blur-2xl animate-fadeIn">
                {q.trim().length < 2 ? (
                  /* Estado Inicial: Sugestões Rápidas & Tópicos Populares */
                  <div className="p-2">
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mutedDim">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>Sugestões Populares</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        { label: "Gaming", tag: "gaming" },
                        { label: "Futebol", tag: "futebol" },
                        { label: "Cinema & Séries", tag: "cinema" },
                        { label: "Anime", tag: "anime" },
                        { label: "Tecnologia", tag: "tech" },
                        { label: "Música", tag: "musica" },
                      ].map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(`/explore?search=${encodeURIComponent(item.label)}`);
                          }}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-muted hover:border-accent/40 hover:bg-surface2 hover:text-white transition-all"
                        >
                          #{item.label}
                        </button>
                      ))}
                    </div>
                    <Link
                      to="/explore"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface2/50 px-3 py-2 text-[12px] font-semibold text-text hover:bg-surface2 hover:text-accent transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Compass size={13} className="text-accent" />
                        <span>Ver catálogo completo no Explorar</span>
                      </span>
                      <span>→</span>
                    </Link>
                  </div>
                ) : !hasResults ? (
                  <div className="py-6 px-3 text-center">
                    <p className="text-[13px] text-mutedDim">
                      {t("search.noResults", { query: q })}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/15 px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-accent/25 transition-all"
                    >
                      Procurar no Explorar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto p-1">
                    {/* Secção Criadores */}
                    {searchResults.creators.length > 0 && (
                      <div>
                        <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
                          <Users size={12} className="text-accent" /> {t("search.creators")}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {searchResults.creators.map((c) => {
                            const cLevel = getCreatorLevelInfo(c.creatorXp || 0);
                            return (
                              <Link
                                key={c.uid}
                                to={`/profile/${c.handle}`}
                                onClick={() => setSearchOpen(false)}
                                className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface2 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar name={c.displayName} image={c.avatar} size={30} />
                                  <div className="truncate">
                                    <div className="text-[13px] font-bold text-text group-hover:text-white truncate">
                                      {c.displayName}
                                    </div>
                                    <div className="text-[11px] text-accent font-semibold flex items-center gap-1">
                                      <span>#{c.handle}</span>
                                      <span className="text-mutedDim">•</span>
                                      <span className="text-mutedDim font-normal">{cLevel.name}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono text-[11.5px] font-bold text-mutedDim group-hover:text-accent transition-colors">
                                  {c.creatorXp || 0} XP
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Secção Tier Lists */}
                    {searchResults.tierlists.length > 0 && (
                      <div>
                        <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
                          <Layers size={12} className="text-[#00E5A3]" /> {t("search.tierlists")}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {searchResults.tierlists.map((l) => (
                            <Link
                              key={l.id}
                              to={`/tier-list/${l.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface2 transition-colors group"
                            >
                              <div className="truncate pr-2">
                                <div className="text-[13px] font-bold text-text group-hover:text-white truncate">
                                  {l.title}
                                </div>
                                <div className="text-[11px] text-mutedDim">
                                  {l.creator} • {l.votes || 0} {t("home.statVotes").toLowerCase()}
                                </div>
                              </div>
                              <Badge tone="accent">{l.category?.toUpperCase()}</Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rodapé do Dropdown: Ver mais no Explorar */}
                    <div className="border-t border-white/[0.06] pt-1.5 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
                        }}
                        className="flex w-full items-center justify-between rounded-xl p-2 text-[12px] font-medium text-muted hover:bg-white/[0.04] hover:text-white transition-all"
                      >
                        <span>Ver todos os resultados no Explorar</span>
                        <span className="text-accent font-bold">↵ Enter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lado Direito: Barra de Ações com o Mesmo Layout Coeso */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#141522] p-1 shadow-sm backdrop-blur-md shrink-0">
            {/* Botão de Pesquisa Rápida (Mobile/Tablet dentro da barra) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label="Abrir pesquisa"
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 active:scale-95 lg:hidden ${
                mobileSearchOpen
                  ? "border border-accent/50 bg-accent/25 text-white shadow-[0_0_12px_rgba(124,92,255,0.35)]"
                  : "text-muted hover:text-white hover:bg-white/[0.08] border border-transparent"
              }`}
            >
              <Search size={15} />
            </button>

            {/* Botão de Criação Primário com Gradiente */}
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] px-3.5 text-[12.5px] font-bold text-white shadow-[0_0_14px_rgba(124,92,255,0.35)] hover:from-[#8B6EFA] hover:to-[#7954F5] hover:shadow-[0_0_20px_rgba(124,92,255,0.55)] active:scale-95 transition-all border border-white/15"
            >
              <Plus size={15} />
              <span>{t("nav.create")}</span>
            </button>

            {/* Botão de Criação Compacto para Telas Mobile */}
            <button
              type="button"
              onClick={() => navigate("/create")}
              aria-label={t("nav.create")}
              className="sm:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] text-white shadow-[0_0_12px_rgba(124,92,255,0.3)] hover:brightness-110 active:scale-95 transition-all border border-white/15"
            >
              <Plus size={15} />
            </button>

            {/* Separador subtil quando utilizador está com sessão iniciada */}
            {user && <div className="h-4 w-[1px] bg-white/[0.08] my-auto" />}

            {/* Notificações no Próprio Site */}
            {user && <NotificationsDropdown />}

            {/* Separador subtil entre Notificações e Perfil */}
            {user && <div className="h-4 w-[1px] bg-white/[0.08] my-auto" />}

            {/* Menu de Perfil / Iniciar Sessão */}
            {user ? (
              <div className="relative" ref={menuContainerRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${
                    menuOpen
                      ? "border border-accent/50 bg-accent/25 text-white shadow-[0_0_12px_rgba(124,92,255,0.35)]"
                      : "text-muted hover:text-white hover:bg-white/[0.08] border border-transparent"
                  }`}
                  title={profile?.displayName || user.displayName || "Perfil de utilizador"}
                  aria-label="Menu de utilizador"
                >
                  <Avatar
                    name={profile?.displayName || user.email}
                    image={profile?.avatar || user.photoURL}
                    size={26}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-3xl border border-borderStrong bg-[#0F1017] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(124,92,255,0.12)] backdrop-blur-2xl animate-fadeIn z-50">
                    {/* Header do Utilizador com XP e Nível */}
                    <div className="rounded-2xl border border-border/80 bg-[#141522] p-3 mb-2.5">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar
                          name={profile?.displayName || user.email}
                          image={profile?.avatar || user.photoURL}
                          size={36}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-bold text-white truncate leading-tight">
                            {profile?.displayName || user.displayName || "Criador"}
                          </div>
                          <div className="text-[11.5px] font-semibold text-accent truncate">
                            #{profile?.handle || "jogador"}
                          </div>
                        </div>
                      </div>

                      {/* Nível e Barra de XP */}
                      <div className="pt-2 border-t border-white/[0.08]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-mutedDim flex items-center gap-1">
                            <span>{levelInfo.icon}</span>
                            <span>{levelInfo.name}</span>
                          </span>
                          <span className="font-mono text-accent font-bold">
                            {profile?.creatorXp || 0} XP
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-black/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent to-[#00E5A3] transition-all duration-500"
                            style={{ width: `${levelInfo.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Link
                        to={`/profile/${profile?.handle || ""}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[#141522] px-3.5 py-2.5 text-[13px] font-medium text-text hover:border-accent/40 hover:bg-[#1E2034] hover:text-white transition-all"
                      >
                        <UserIcon size={15} className="text-muted" />
                        <span>{t("nav.profile")}</span>
                      </Link>

                      <Link
                        to="/create"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[#141522] px-3.5 py-2.5 text-[13px] font-medium text-text hover:border-accent/40 hover:bg-[#1E2034] hover:text-white transition-all"
                      >
                        <Plus size={15} className="text-teal" />
                        <span>Criar Nova Tier List</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditProfileOpen(true);
                        }}
                        className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[#141522] px-3.5 py-2.5 text-[13px] font-medium text-text hover:border-accent/40 hover:bg-[#1E2034] hover:text-white transition-all text-left"
                      >
                        <Settings size={15} className="text-muted" />
                        <span>{t("nav.editProfile")}</span>
                      </button>

                      <div className="my-1 border-t border-border/50"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2 text-left text-[13px] font-medium text-red-400 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300 transition-all"
                      >
                        <LogOut size={15} />
                        <span>{t("nav.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="h-4 w-[1px] bg-white/[0.08] my-auto" />
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12.5px] font-bold text-muted hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
                >
                  <LogIn size={14} className="text-accent" />
                  <span>{t("nav.login")}</span>
                </button>
              </>
            )}

            {/* Botão do Menu Hambúrguer (Mobile) */}
            <div className="md:hidden h-4 w-[1px] bg-white/[0.08] my-auto" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu principal"
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 active:scale-95 md:hidden ${
                mobileMenuOpen
                  ? "border border-accent/50 bg-accent/25 text-white shadow-[0_0_12px_rgba(124,92,255,0.35)]"
                  : "text-muted hover:text-white hover:bg-white/[0.08] border border-transparent"
              }`}
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa Expansível (Mobile / Tablet) */}
        {mobileSearchOpen && (
          <div className="border-t border-border/70 bg-[#0C0D14]/95 p-3 backdrop-blur-xl lg:hidden animate-fadeIn">
            <div className="relative flex items-center">
              <Search size={15} className="pointer-events-none absolute left-3.5 text-mutedDim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder={t("nav.searchPlaceholder")}
                autoFocus
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-9 text-[13px] text-text outline-none focus:border-accent"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 text-mutedDim hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Resultados de Pesquisa no Mobile */}
            {q.trim().length < 2 ? (
              <div className="mt-2.5 rounded-2xl border border-white/[0.08] bg-[#12131F] p-3 shadow-lg">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mutedDim">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Sugestões Populares</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    { label: "Gaming", tag: "gaming" },
                    { label: "Futebol", tag: "futebol" },
                    { label: "Cinema & Séries", tag: "cinema" },
                    { label: "Anime", tag: "anime" },
                    { label: "Tecnologia", tag: "tech" },
                    { label: "Música", tag: "musica" },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => {
                        setMobileSearchOpen(false);
                        navigate(`/explore?search=${encodeURIComponent(item.label)}`);
                      }}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-muted hover:text-white"
                    >
                      #{item.label}
                    </button>
                  ))}
                </div>
                <Link
                  to="/explore"
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface2/50 px-3 py-2 text-[12px] font-semibold text-text hover:text-accent"
                >
                  <span>Explorar todas as listas</span>
                  <span>→</span>
                </Link>
              </div>
            ) : hasResults ? (
              <div className="mt-2 max-h-[280px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#12131F] p-2 shadow-lg divide-y divide-white/[0.04]">
                {searchResults.creators.length > 0 && (
                  <div className="pb-1.5">
                    <div className="mb-1 px-2 text-[10.5px] font-bold uppercase tracking-wider text-mutedDim">
                      Criadores
                    </div>
                    {searchResults.creators.map((c) => (
                      <Link
                        key={c.uid}
                        to={`/profile/${c.handle}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center justify-between rounded-xl p-2 hover:bg-surface2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={c.displayName} image={c.avatar} size={26} />
                          <div className="truncate">
                            <span className="text-[13px] font-semibold text-white truncate block">
                              {c.displayName}
                            </span>
                            <span className="text-[11px] text-accent">#{c.handle}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-mutedDim">{c.creatorXp || 0} XP</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.tierlists.length > 0 && (
                  <div className="pt-1.5">
                    <div className="mb-1 px-2 text-[10.5px] font-bold uppercase tracking-wider text-mutedDim">
                      Tier Lists
                    </div>
                    {searchResults.tierlists.map((l) => (
                      <Link
                        key={l.id}
                        to={`/tier-list/${l.id}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center justify-between rounded-xl p-2 text-[13px] font-medium text-text hover:bg-surface2"
                      >
                        <span className="truncate pr-2">{l.title}</span>
                        <Badge tone="accent">{l.category?.toUpperCase()}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="pt-1.5 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSearchOpen(false);
                      navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2 text-[11.5px] font-medium text-muted hover:text-white"
                  >
                    <span>Ver no Explorar</span>
                    <span className="text-accent font-bold">↵</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 rounded-2xl border border-white/[0.08] bg-[#12131F] p-4 text-center text-[12.5px] text-mutedDim">
                Nenhum resultado encontrado para "{q}".
              </div>
            )}
          </div>
        )}

        {/* Drawer de Navegação Mobile Completo */}
        {mobileMenuOpen && (
          <nav
            ref={mobileMenuRef}
            className="border-t border-white/10 bg-[#0F1017] px-4 py-5 backdrop-blur-2xl md:hidden animate-slideUp shadow-2xl flex flex-col gap-3.5"
          >
            {/* Cartões de Navegação Principal (Grid Coesa) */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex flex-col gap-2 rounded-2xl border p-3.5 transition-all ${
                  isExploreActive
                    ? "border-accent/40 bg-accent/15 text-white shadow-[0_0_16px_rgba(124,92,255,0.25)]"
                    : "border-white/[0.08] bg-[#141522] text-muted hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentSoft border border-accent/30 text-accent">
                  <Compass size={18} />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-white">{t("nav.explore")}</div>
                  <div className="text-[11px] text-mutedDim">Todas as listas</div>
                </div>
              </Link>

              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex flex-col gap-2 rounded-2xl border p-3.5 transition-all ${
                  isLeaderboardActive
                    ? "border-amber-500/40 bg-amber-500/15 text-white shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                    : "border-white/[0.08] bg-[#141522] text-muted hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-white">{t("nav.leaderboard")}</div>
                  <div className="text-[11px] text-mutedDim">Top criadores</div>
                </div>
              </Link>
            </div>

            {/* Ação de Criação */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/create");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] py-3 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(124,92,255,0.35)] hover:shadow-[0_0_25px_rgba(124,92,255,0.55)] active:scale-95 transition-all"
            >
              <Plus size={17} />
              <span>{t("nav.create")}</span>
            </button>

            {/* Cartão de Utilizador / Login no Mobile */}
            <div className="pt-2 border-t border-white/10">
              {user ? (
                <div className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.08] bg-[#141522] p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={profile?.displayName || user.displayName || "Criador"}
                        image={profile?.avatar || user.photoURL}
                        size={34}
                      />
                      <div className="truncate">
                        <div className="text-[13.5px] font-bold text-white truncate">
                          {profile?.displayName || user.displayName || "Criador"}
                        </div>
                        <div className="text-[11.5px] text-accent font-semibold">
                          #{profile?.handle || "jogador"}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/profile/${profile?.handle || ""}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-white/[0.12] transition-colors"
                    >
                      {t("nav.profile")}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-mutedDim pt-1.5 border-t border-white/[0.06]">
                    <span>{levelInfo.icon} {levelInfo.name}</span>
                    <span className="font-mono text-accent font-bold">{profile?.creatorXp || 0} XP</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#141522] py-3 text-[14px] font-bold text-white hover:bg-[#1D1E30] transition-all"
                >
                  <LogIn size={16} className="text-accent" />
                  <span>{t("nav.login")}</span>
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSaveSuccess={(updated) => {
          if (updated && updated.handle && location.pathname.startsWith("/profile")) {
            navigate(`/profile/${updated.handle}`, { replace: true });
          }
        }}
      />
    </>
  );
}
