// Esquema de base de datos para Cafés de Carla
// Usando Drizzle ORM con PostgreSQL (Neon)

import { pgTable, serial, text, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productosTable = pgTable("products", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(), // euros, tamaño Normal
  precio_mini: numeric("precio_mini", { precision: 10, scale: 2 }), // euros, NULL si no tiene Mini
  precio_grande: numeric("precio_grande", { precision: 10, scale: 2 }), // euros, NULL si no tiene Grande
  categoria: text("categoria").notNull(),
  agotado: boolean("agotado").notNull().default(false),
  imagen_url: text("imagen_url"),
  descripcion: text("descripcion"),
});

export const insertProductoSchema = createInsertSchema(productosTable).omit({
  id: true,
});

export type InsertProducto = z.infer<typeof insertProductoSchema>;
export type Producto = typeof productosTable.$inferSelect;
