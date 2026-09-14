import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { GhostButton } from "../components/UI";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
      if (err.code === "auth/popup-closed-by-user") {
        setError(t("login.errorCancelled"));
      } else {
        setError(t("login.errorGeneral"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[400px] flex-col gap-6 px-6 py-20">
    <div className="mx-auto flex max-w-[420px] flex-col gap-6 px-6 py-24">
      <div>
        <h1 className="font-display text-[28px] font-bold">Welcome to TierForge</h1>
        <p className="mt-1 text-[14px] text-muted">
          Sign in with Google to start building and ranking tier lists.
        <h1 className="font-display text-[28px] sm:text-[32px] font-black text-white">
          {t("login.title")}
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          {t("login.subtitle")}
        </p>
      </div>

      {error && <p className="text-[13px] text-[#FF5470]">{error}</p>}
      {error && (
        <div className="rounded-xl border border-[rgba(255,84,112,0.35)] bg-[rgba(255,84,112,0.12)] p-3.5 text-[13px] text-[#FF5470]">
          {error}
        </div>
      )}

      <GhostButton onClick={handleGoogle} disabled={busy}>
        {busy ? "Signing in…" : "Continue with Google"}
        {busy ? t("login.signingIn") : t("login.googleBtn")}
      </GhostButton>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Try again shortly.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
