import Image from "next/image";
import { STORE_ADDRESS, STORE_MAPS_LINK, waLink } from "@/lib/types";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site">
      <div className="container">
        <div className="footer-mark">
          <Image
            src="/logo-mark-gold.png"
            alt=""
            width={512}
            height={512}
            className="footer-mark-img"
          />
        </div>
        <div className="footer-grid">
          <div>© {year} Orient Lion Chile. Todos los derechos reservados.</div>
          <div>
            <a href={STORE_MAPS_LINK} target="_blank" rel="noopener noreferrer">
              Tienda física: {STORE_ADDRESS}
            </a>
          </div>
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
