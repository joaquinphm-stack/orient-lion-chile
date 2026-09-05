import type { Metadata } from "next";
import RegistroForm from "./RegistroForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RegistroPage() {
  return <RegistroForm />;
}
