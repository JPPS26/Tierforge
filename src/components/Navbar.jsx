import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, PrimaryButton, GhostButton } from "./UI";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-7 px-6">
        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
            style={{
              background: "linear-gradient(135deg,#FF9A5A,#C6461B)",
              boxShadow: "0 0 22px rgba(255,122,61,0.5)",
            }}
          >
            <span className="font-display text-[15px] font-extrabold text-[#0A0A0D]">T</span>
          </div>
          <span className="font-display text-[18px] font-bold tracking-tight">TierForge</span>
        </Link>

        <div className="hidden gap-1 md:flex">
          <Link to="/explore" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-muted hover:text-text">
            Explore
          </Link>
          <Link to="/categories" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-muted hover:text-text">
            Categories
          </Link>
          <Link to="/leaderboard" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-muted hover:text-text">
            Leaderboard
          </Link>
        </div>

        <div className="relative hidden max-w-[420px] flex-1 md:block">
          <Search size={16} className="absolute left-3 top-[11px] text-mutedDim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tier lists, players, games…"
            className="w-full rounded-[11px] border border-border bg-surface py-2.5 pl-9 pr-3.5 text-[13.5px] text-text outline-none focus:border-[rgba(255,122,61,0.5)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <PrimaryButton small icon={Plus} onClick={() => navigate("/create")}>
                  Create
                </PrimaryButton>
                <button className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] text-muted hover:bg-surface2">
                  <Bell size={18} />
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5"
                >
                  <Avatar name={profile?.displayName || user.email} size={34} />
                  <ChevronDown size={14} className="text-mutedDim" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-[46px] w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] hover:bg-surface2"
                    >
                      <UserIcon size={15} /> View profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13.5px] text-[#FF5470] hover:bg-surface2"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <GhostButton small onClick={() => navigate("/login")}>
              Log in
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
}
