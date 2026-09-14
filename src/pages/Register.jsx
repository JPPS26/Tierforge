import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GhostButton } from "../components/UI";

export default function Register() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[400px] flex-col gap-6 px-6 py-20">
      <div>
        <h1 className="font-display text-[28px] font-bold">Create your account</h1>
        <p className="mt-1 text-[14px] text-muted">Start building tier lists in seconds.</p>
      </div>

      {error && <p className="text-[13px] text-[#FF5470]">{error}</p>}

      <GhostButton onClick={handleGoogle} disabled={busy}>
        {busy ? "Signing in…" : "Continue with Google"}
      </GhostButton>

      <p className="text-center text-[13.5px] text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-text">
          Log in
        </Link>
      </p>
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
