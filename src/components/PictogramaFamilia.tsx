import { asset } from "@/lib/asset";
import type { FamiliaId } from "@/lib/types";

/** Pictograma ilustrado de cada familia (generado con Higgsfield, public/img/iconos). */
export function PictogramaFamilia({ familia, className = "" }: { familia: FamiliaId; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(`/img/iconos/${familia}.webp`)} alt="" width={192} height={192} className={`shrink-0 object-cover ${className}`} />
  );
}
