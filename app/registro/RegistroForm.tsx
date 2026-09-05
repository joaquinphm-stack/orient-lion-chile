"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OAuthButtons from "@/components/OAuthButtons";

export default function RegistroForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already")
          ? "Ya existe una cuenta con ese correo."
          : "No pudimos crear la cuenta. Intenta de nuevo."
      );
      setLoading(false);
      return;
    }

    // El proyecto auto-confirma el correo, así que iniciamos sesión directo.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      router.push("/login");
      return;
    }

    router.push("/perfil");
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p className="sub">Regístrate para hacer seguimiento a tus cotizaciones.</p>

        {error && <div className="alert alert-err">{error}</div>}

        <OAuthButtons />

        <form onSubmit={handleSubmit} className="stack">
          <div className="form-row" style={{ margin: 0 }}>
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div className="form-row" style={{ margin: 0 }}>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.cl"
            />
          </div>
          <div className="form-row" style={{ margin: 0 }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-alt">
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
