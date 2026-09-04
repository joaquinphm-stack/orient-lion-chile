import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import NavClient from "./NavClient";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let nombre = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, nombre")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "cliente";
    nombre = profile?.nombre ?? "";
  }

  return (
    <header className="site" id="site-header">
      <div className="nav container">
        <Link href="/" className="logo">
          <Image
            src="/logo.png"
            alt="Orient Lion"
            width={356}
            height={178}
            className="logo-mark"
            priority
          />
        </Link>

        <NavClient
          isLogged={!!user}
          isAdmin={role === "admin"}
          nombre={nombre}
        />
      </div>
    </header>
  );
}
