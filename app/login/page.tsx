"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AuthShell,
  authErrorClass,
  authInlineLinkClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSuccessClass,
} from "@/components/auth/auth-shell";
import { inputClass, labelClass } from "@/lib/wizard/field-styles";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("reset") === "success"
      ? "Senha redefinida com sucesso. Faça login com a nova senha."
      : null;
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/carteira");
    router.refresh();
  }

  async function handleRecoverSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    sessionStorage.setItem("passwordRecoveryEmail", email);
    router.push(`/redefinir-senha?email=${encodeURIComponent(email)}`);
  }

  function switchToRecover() {
    setError(null);
    setMessage(null);
    setMode("recover");
  }

  function switchToLogin() {
    setError(null);
    setMessage(null);
    setMode("login");
  }

  return (
    <AuthShell
      title={mode === "login" ? "Entrar" : "Recuperar senha"}
      subtitle={
        mode === "login"
          ? "Acesse a carteira dos seus clientes."
          : "Informe seu e-mail para receber o código de recuperação."
      }
    >
      {mode === "login" ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass()}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass()}
              />
            </div>

            {error && (
              <p role="alert" className={authErrorClass}>
                {error}
              </p>
            )}
            {message && (
              <p role="status" className={authSuccessClass}>
                {message}
              </p>
            )}

            <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p>
              <button type="button" onClick={switchToRecover} className={authLinkClass}>
                Esqueci minha senha
              </button>
            </p>
            <p className="text-ink-60">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className={authInlineLinkClass}>
                Cadastre-se
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={handleRecoverSubmit} className="space-y-5">
            <div>
              <label htmlFor="recover-email" className={labelClass}>
                E-mail
              </label>
              <input
                id="recover-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass()}
              />
            </div>

            {error && (
              <p role="alert" className={authErrorClass}>
                {error}
              </p>
            )}
            {message && (
              <p role="status" className={authSuccessClass}>
                {message}
              </p>
            )}

            <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
              {loading ? "Enviando..." : "Enviar código de recuperação"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <button type="button" onClick={switchToLogin} className={authLinkClass}>
              Voltar para o login
            </button>
          </p>
        </>
      )}
    </AuthShell>
  );
}
