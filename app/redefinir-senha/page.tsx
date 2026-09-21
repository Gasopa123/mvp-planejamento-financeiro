"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AuthShell,
  authErrorClass,
  authLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-shell";
import { inputClass, labelClass } from "@/lib/wizard/field-styles";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";

    const params = new URLSearchParams(window.location.search);
    return params.get("email") ?? sessionStorage.getItem("passwordRecoveryEmail") ?? "";
  });
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanToken = token.trim();

    if (!cleanEmail) {
      setError("Informe o e-mail usado para solicitar a recuperação.");
      return;
    }

    if (!cleanToken) {
      setError("Informe o código recebido por e-mail.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "recovery",
    });

    if (verifyError) {
      setLoading(false);
      setError("Código inválido ou expirado. Solicite um novo código.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    sessionStorage.removeItem("passwordRecoveryEmail");
    router.push("/login?reset=success");
  }

  return (
    <AuthShell
      title="Redefinir senha"
      subtitle="Informe o e-mail, copie o código recebido e escolha uma nova senha."
    >
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
          <label htmlFor="token" className={labelClass}>
            Código de recuperação
          </label>
          <input
            id="token"
            name="token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Digite o código recebido por e-mail"
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClass()}
          />
        </div>

        {error && (
          <p role="alert" className={authErrorClass}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className={authLinkClass}>
          Voltar para o login
        </Link>
      </p>
    </AuthShell>
  );
}
