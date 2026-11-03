import { ImageOff } from "lucide-react";
import { asset } from "@/lib/asset";
import type { Imagen } from "@/lib/types";

type Props = {
  imagen?: Imagen;
  pequena?: boolean;
  className?: string;
  prioridad?: boolean;
  sizes?: string;
};

/** Foto extraída del PDF. Si no hay imagen, se indica "imagen pendiente". */
export function Foto({ imagen, pequena = false, className = "", prioridad = false }: Props) {
  if (!imagen) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 text-slate-600 ${className}`}>
        <ImageOff className="h-8 w-8" aria-hidden="true" />
        <span className="text-sm">Imagen pendiente</span>
      </div>
    );
  }
  const escala = pequena ? Math.min(1, 560 / Math.max(imagen.w, imagen.h)) : 1;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(pequena ? imagen.thumb : imagen.src)}
      alt={imagen.alt}
      width={Math.round(imagen.w * escala)}
      height={Math.round(imagen.h * escala)}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : undefined}
      decoding="async"
      className={`object-contain ${className}`}
    />
  );
}
