"use client";

// Estado del comercial: favoritos, comparador, modo presentación y avisos.
// Favoritos y comparador se guardan en localStorage (sin usuarios en v1).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MAX_COMPARAR } from "./comparador";
import { nombreFamilia } from "./familias";
import { resumenPorId } from "./resumen";

type Aviso = { id: number; texto: string };

type Estado = {
  listo: boolean;
  favoritos: string[];
  comparar: string[];
  presentacion: boolean;
  avisos: Aviso[];
  esFavorito: (id: string) => boolean;
  alternarFavorito: (id: string) => void;
  enComparador: (id: string) => boolean;
  alternarComparar: (id: string) => void;
  quitarComparar: (id: string) => void;
  vaciarComparador: () => void;
  setPresentacion: (v: boolean) => void;
  avisar: (texto: string) => void;
};

const Ctx = createContext<Estado | null>(null);

function leer(clave: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(clave) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && resumenPorId(x)) : [];
  } catch {
    return [];
  }
}

function guardar(clave: string, valor: string[]) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* almacenamiento no disponible: se mantiene en memoria */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(false);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [comparar, setComparar] = useState<string[]>([]);
  const [presentacion, setPresentacion] = useState(false);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const contador = useRef(0);

  useEffect(() => {
    setFavoritos(leer("cm:favoritos"));
    setComparar(leer("cm:comparar"));
    setListo(true);
  }, []);

  useEffect(() => {
    if (listo) guardar("cm:favoritos", favoritos);
  }, [favoritos, listo]);

  useEffect(() => {
    if (listo) guardar("cm:comparar", comparar);
  }, [comparar, listo]);

  const avisar = useCallback((texto: string) => {
    const id = ++contador.current;
    setAvisos((a) => [...a, { id, texto }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3500);
  }, []);

  const alternarFavorito = useCallback(
    (id: string) => {
      const esta = favoritos.includes(id);
      avisar(esta ? "Quitado de Mis equipos" : "Guardado en Mis equipos");
      setFavoritos(esta ? favoritos.filter((x) => x !== id) : [...favoritos, id]);
    },
    [favoritos, avisar],
  );

  const alternarComparar = useCallback(
    (id: string) => {
      if (comparar.includes(id)) {
        setComparar(comparar.filter((x) => x !== id));
        return;
      }
      const nuevo = resumenPorId(id);
      const primero = comparar[0] ? resumenPorId(comparar[0]) : undefined;
      if (nuevo && primero && primero.familia !== nuevo.familia) {
        avisar(
          `Solo se comparan equipos de la misma familia: nueva comparación de ${nombreFamilia(nuevo.familia)}.`,
        );
        setComparar([id]);
        return;
      }
      if (comparar.length >= MAX_COMPARAR) {
        avisar(`Máximo ${MAX_COMPARAR} equipos en el comparador.`);
        return;
      }
      avisar("Añadido al comparador");
      setComparar([...comparar, id]);
    },
    [comparar, avisar],
  );

  const valor = useMemo<Estado>(
    () => ({
      listo,
      favoritos,
      comparar,
      presentacion,
      avisos,
      esFavorito: (id) => favoritos.includes(id),
      alternarFavorito,
      enComparador: (id) => comparar.includes(id),
      alternarComparar,
      quitarComparar: (id) => setComparar((c) => c.filter((x) => x !== id)),
      vaciarComparador: () => setComparar([]),
      setPresentacion,
      avisar,
    }),
    [listo, favoritos, comparar, presentacion, avisos, alternarFavorito, alternarComparar, avisar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useStore(): Estado {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore fuera de StoreProvider");
  return v;
}
