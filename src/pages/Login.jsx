import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PrimaryButton, GhostButton } from "../components/UI";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[400px] flex-col gap-6 px-6 py-20">
      <div>
        <h1 className="font-display text-[28px] font-bold">Welcome back</h1>
        <p className="mt-1 text-[14px] text-muted">Log in to keep ranking.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-[13px] text-mutedDim" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-9 pr-3 text-[14px] outline-none focus:border-[rgba(124,92,255,0.5)]"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-[13px] text-mutedDim" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-9 pr-3 text-[14px] outline-none focus:border-[rgba(124,92,255,0.5)]"
          />
        </div>

        {error && <p className="text-[13px] text-[#FF5470]">{error}</p>}

        <PrimaryButton type="submit" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </PrimaryButton>
      </form>

      <div className="flex items-center gap-3 text-[12px] text-mutedDim">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <GhostButton onClick={handleGoogle}>Continue with Google</GhostButton>

      <p className="text-center text-[13.5px] text-muted">
        No account yet?{" "}
        <Link to="/register" className="font-semibold text-text">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/user-not-found": "No account with that email.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/too-many-requests": "Too many attempts. Try again shortly.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
