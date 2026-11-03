"use client";

// Pantalla de contraseña. Es solo una barrera visual: la web es estática y
// pública, así que no protege los datos. Se guarda el hash, nunca la clave.
import { Lock } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { MARCA } from "@/config/marca";

const HASH_CLAVE = "a54119d666c39bfab9701e6c2aafae5091c0e8e0b10f0f83421cbf5b86a0feee";
const CLAVE_ALMACEN = "cm:acceso";

async function sha256(texto: string): Promise<string> {
  const datos = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(datos)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function ClaveAcceso({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<"comprobando" | "bloqueado" | "abierto">("comprobando");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let guardado: string | null = null;
    try {
      guardado = localStorage.getItem(CLAVE_ALMACEN);
    } catch {
      /* sin almacenamiento: se pide la clave en cada visita */
    }
    setEstado(guardado === HASH_CLAVE ? "abierto" : "bloqueado");
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if ((await sha256(clave)) === HASH_CLAVE) {
      try {
        localStorage.setItem(CLAVE_ALMACEN, HASH_CLAVE);
      } catch {
        /* se mantiene abierto solo en esta pestaña */
      }
      setEstado("abierto");
    } else {
      setError(true);
      setClave("");
    }
  }

  if (estado === "abierto") return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-marino-900 px-4">
      {estado === "bloqueado" && (
        <form onSubmit={entrar} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevada">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-marino-900 text-white">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold uppercase text-marino-950">{MARCA.nombre}</p>
              <p className="text-sm text-slate-600">Acceso restringido</p>
            </div>
          </div>
          <label htmlFor="clave-acceso" className="mt-6 block text-sm font-medium text-marino-950">
            Contraseña
          </label>
          <input
            id="clave-acceso"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setError(false);
            }}
            className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 text-base outline-none focus:border-acento-500"
            aria-invalid={error}
            aria-describedby={error ? "clave-error" : undefined}
          />
          {error && (
            <p id="clave-error" className="mt-2 text-sm text-red-700">
              Contraseña incorrecta.
            </p>
          )}
          <button type="submit" className="mt-5 h-12 w-full rounded-xl bg-marino-900 font-semibold text-white hover:bg-marino-700">
            Entrar
          </button>
        </form>
      )}
    </div>
  );
}
