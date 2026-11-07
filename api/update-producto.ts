/**
 * Función serverless de Vercel: POST /api/update-producto
 * Actualiza el estado de agotado de un producto en Neon (PostgreSQL).
 * La conexión a la base de datos se hace exclusivamente en el servidor.
 * Nunca expone credenciales al navegador.
 */
import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // Cabeceras CORS y JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    let body;
    try {
      body = req.body;
    } catch {
      res.status(400).json({ error: 'Cuerpo de petición inválido' });
      return;
    }

    const { id, agotado } = body as { id?: string; agotado?: boolean };

    if (!id || agotado === undefined) {
      res.status(400).json({ error: 'Faltan parámetros: id y agotado' });
      return;
    }

    // Conectar a Neon exclusivamente en el servidor
    const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
    if (!databaseUrl) {
      res.status(500).json({ error: 'DATABASE_URL no configurada en el servidor' });
      return;
    }

    const sql = neon(databaseUrl);

    // Ejecutar UPDATE en la tabla productos
    const result = await sql`
      UPDATE productos
      SET agotado = ${agotado},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, nombre, agotado
    `;

    if (result.length === 0) {
      res.status(404).json({ error: `Producto con id ${id} no encontrado` });
      return;
    }

    res.status(200).json({
      success: true,
      data: result[0],
      message: `Producto ${agotado ? 'marcado como agotado' : 'disponible nuevamente'}`,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
