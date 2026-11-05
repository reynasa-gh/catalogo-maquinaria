// Modelo de datos del catálogo. Es el mismo contrato que tendría una tabla
// en Supabase/PostgreSQL o una API: si se migra, solo cambia src/lib/catalogo.ts.

export type Dato = { etiqueta: string; valor: string };

export type Referencia = { etiqueta: string; valor: string };

export type Extra = { nombre: string; referencia: string; nota: string };

/** Pictograma del fabricante que aparece en la página del PDF (p. ej. 220 V). */
export type Pictograma = { src: string; alt: string; w: number; h: number };

/** Documento descargable tal cual lo entrega el fabricante (no se modifica). */
export type Documento = {
  titulo: string;
  detalle: string;
  archivo: string;
  nombreDescarga: string;
  tamanoKb: number;
};

export type Configuracion = {
  titulo: string;
  columnas: string[];
  filas: { etiqueta: string; valores: string[] }[];
};

export type TipoImagen = "producto" | "detalle" | "pantalla" | "accesorio" | "plano";

export type Imagen = {
  src: string;
  thumb: string;
  w: number;
  h: number;
  tipo: TipoImagen;
  alt: string;
  calidad: "ok" | "baja";
};

export type TipoVehiculo =
  | "Turismo"
  | "SUV"
  | "Furgoneta"
  | "Comercial"
  | "Agrícola"
  | "Moto"
  | "Híbrido / eléctrico";

export type ValorAtributo = string | number | string[] | null | undefined;

export type ProductoBase = {
  id: string;
  familia: FamiliaId;
  subfamilia: string;
  tipoEquipo: string;
  marca: string;
  submarca: string | null;
  fabricante: string;
  modelo: string;
  referencias: Referencia[];
  precio?: string;
  descripcion: string;
  fichaRapida: Dato[];
  destacados: string[];
  caracteristicas: string[];
  datosTecnicos: Dato[];
  configuracion?: Configuracion;
  equipamientoIncluido: string[];
  noIncluido: string[];
  opcionales: Extra[];
  accesorios: Extra[];
  compatibilidades: string[];
  requisitosInstalacion: string[];
  observaciones: string[];
  notasDatos: string[];
  atributos: Record<string, ValorAtributo>;
  vehiculos: { tipos: TipoVehiculo[]; fuente: string };
  pictogramas: Pictograma[];
  documentos: Documento[];
  paginas: number[];
};

export type Producto = ProductoBase & { imagenes: Imagen[] };

export type FamiliaId =
  | "elevadores"
  | "alineacion"
  | "neumaticos"
  | "aire-comprimido"
  | "aire-acondicionado"
  | "servicio-liquidos";

export type Familia = {
  id: FamiliaId;
  nombre: string;
  descripcion: string;
  subfamilias: string[];
  /** Color de acento de la familia en el PDF original. */
  color: string;
};
