// Esquema de base de datos para Cafés de Carla
// Usando Drizzle ORM con PostgreSQL (Neon)

import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productosTable = pgTable("productos", {
  id: serial("id").primaryKey(),
  id_de_serie: text("id_de_serie").notNull().unique(),
  nombre: text("nombre").notNull(),
  precio: integer("precio").notNull(), // en céntimos
  categoria: text("categoria").notNull(),
  agotado: boolean("agotado").notNull().default(false),
  creado_en: timestamp("creado_en").notNull().defaultNow(),
  actualizado_en: timestamp("actualizado_en").notNull().defaultNow(),
});

export const insertProductoSchema = createInsertSchema(productosTable).omit({
  id: true,
  creado_en: true,
  actualizado_en: true,
});

export type InsertProducto = z.infer<typeof insertProductoSchema>;
export type Producto = typeof productosTable.$inferSelect;
