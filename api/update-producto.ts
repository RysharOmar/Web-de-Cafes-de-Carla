/**
 * Función serverless de Vercel: POST /api/update-producto
 * Actualiza el estado de agotado de un producto en Neon (PostgreSQL).
 */
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id, agotado } = req.body || {};

    if (!id || agotado === undefined) {
      return res.status(400).json({ error: 'Faltan parámetros: id y agotado' });
    }

    const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL no configurada');
      return res.status(500).json({ error: 'DATABASE_URL no configurada en el servidor' });
    }

    const sql = neon(databaseUrl);
    const result = await sql`
      UPDATE productos
      SET agotado = ${agotado},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, nombre, agotado
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
    }

    return res.status(200).json({
      success: true,
      data: result[0],
      message: `Producto ${agotado ? 'marcado como agotado' : 'disponible nuevamente'}`,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
