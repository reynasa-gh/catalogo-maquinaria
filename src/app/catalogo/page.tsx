import type { Metadata } from "next";
import { Explorador } from "@/components/Explorador";

export const metadata: Metadata = {
  title: "Catálogo completo",
  description: "Todos los equipos del catálogo de maquinaria con buscador y filtros.",
};

export default function PaginaCatalogo() {
  return (
    <>
      <h1 className="sr-only">Todos los equipos</h1>
      <Explorador />
    </>
  );
}
