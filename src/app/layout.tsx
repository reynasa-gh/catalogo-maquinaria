import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed } from "next/font/google";
import { Avisos } from "@/components/Avisos";
import { BarraComparar } from "@/components/BarraComparar";
import { Cabecera } from "@/components/Cabecera";
import { Pie } from "@/components/Pie";
import { MARCA } from "@/config/marca";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: MARCA.nombre, template: `%s · ${MARCA.nombre}` },
  description: MARCA.descripcion,
  applicationName: MARCA.nombre,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2547",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={barlow.variable}>
      <body className="min-h-dvh flex flex-col">
        <StoreProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-elevada"
          >
            Saltar al contenido
          </a>
          <Cabecera />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Pie />
          <BarraComparar />
          <Avisos />
        </StoreProvider>
      </body>
    </html>
  );
}
