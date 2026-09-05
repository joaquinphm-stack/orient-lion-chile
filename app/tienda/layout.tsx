import { getCart } from "./actions";
import { CartProvider } from "@/components/tienda/CartContext";
import CartButton from "@/components/tienda/CartButton";
import CartDrawer from "@/components/tienda/CartDrawer";

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const cart = await getCart();

  return (
    <CartProvider initialCart={cart}>
      <div className="tienda-bar">
        <div className="container tienda-bar-in">
          <span className="tienda-bar-title">Tienda Orient Lion</span>
          <CartButton />
        </div>
      </div>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
