import Image from "next/image";
import { waLink } from "@/lib/types";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site">
      <div className="container">
        <div className="footer-mark">
          <Image
            src="/logo-mark-fire.png"
            alt=""
            width={470}
            height={450}
            className="footer-mark-img"
          />
        </div>
        <div className="footer-grid">
          <div>© {year} Orient Lion Chile. Todos los derechos reservados.</div>
          <div>
            Escríbenos a{" "}
            <a href={waLink()} target="_blank" rel="noopener noreferrer">
              WhatsApp +56 9 9912 5871
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
