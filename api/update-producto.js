/**
 * Función serverless de Vercel: POST /api/update-producto
 * Actualiza el estado de agotado de un producto en Neon (PostgreSQL).
 * Usa el cliente pg (postgresql) para conectar a Neon.
 */
import { Pool } from 'pg';

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
      return res.status(500).json({ error: 'DATABASE_URL no configurada en Vercel' });
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    try {
      const result = await client.query(
        'UPDATE productos SET agotado = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nombre, agotado',
        [agotado, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0],
      });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
