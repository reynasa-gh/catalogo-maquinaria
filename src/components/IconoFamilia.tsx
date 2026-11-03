import { ArrowUpDown, Crosshair, Disc3, Droplets, Gauge, Snowflake, type LucideProps } from "lucide-react";
import type { FamiliaId } from "@/lib/types";

const ICONOS: Record<FamiliaId, React.ComponentType<LucideProps>> = {
  elevadores: ArrowUpDown,
  alineacion: Crosshair,
  neumaticos: Disc3,
  "aire-comprimido": Gauge,
  "aire-acondicionado": Snowflake,
  "servicio-liquidos": Droplets,
};

export function IconoFamilia({ familia, ...props }: { familia: FamiliaId } & LucideProps) {
  const Icono = ICONOS[familia];
  return <Icono aria-hidden="true" strokeWidth={1.75} {...props} />;
}
