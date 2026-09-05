"use client";

import { createClient } from "@/lib/supabase/client";

export default function OAuthButtons() {
  async function signIn(provider: "google" | "facebook") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <>
      <div className="oauth-buttons">
        <button
          type="button"
          className="oauth-btn"
          onClick={() => signIn("google")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A11.998 11.998 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
          </svg>
          Continuar con Google
        </button>
        <button
          type="button"
          className="oauth-btn"
          onClick={() => signIn("facebook")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#1877F2" d="M24 12.07C24 5.63 18.63.29 12.07.02 5.4-.26 0 5.09 0 12.07 0 18.4 4.62 23.66 10.6 24v-8.44H7.62v-3.49h3v-2.6c0-2.96 1.76-4.6 4.45-4.6 1.29 0 2.63.23 2.63.23v2.9h-1.48c-1.46 0-1.92.91-1.92 1.84v2.23h3.27l-.52 3.49h-2.75V24C19.38 23.66 24 18.4 24 12.07Z" />
          </svg>
          Continuar con Facebook
        </button>
      </div>
      <div className="auth-divider">
        <span>o con tu correo</span>
      </div>
    </>
  );
}
