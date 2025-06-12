// Contenido corregido y mejorado para: Backend/controllers/movimientosInventarioController.js

const pool = require('../config/db');

// Obtener el historial de movimientos de una materia prima específica
exports.obtenerMovimientosPorMateriaPrima = async (req, res) => {
  const { materiaPrimaId } = req.params;

  try {
    // --- MEJORA ---
    // Unimos la tabla de movimientos con la de usuarios para obtener el nombre de quien registró el movimiento.
    const query = `
      SELECT 
        m.id,
        m.tipo_movimiento,
        m.cantidad,
        m.descripcion,
        m.fecha_movimiento,
        u.nombre_usuario 
      FROM 
        movimientos_inventario_mp m
      LEFT JOIN 
        usuarios u ON m.usuario_id = u.id
      WHERE 
        m.lote_id IN (SELECT id FROM lotes_materias_primas WHERE materia_prima_nombre = (SELECT nombre FROM materias_primas WHERE id = ?))
      ORDER BY 
        m.fecha_movimiento DESC;
    `;
    // Nota: La consulta es un poco compleja porque tu tabla de lotes usa 'materia_prima_nombre'.
    // Si la cambiaras a 'materia_prima_id' como te sugerí, la consulta sería más simple y eficiente.
    
    const [movimientos] = await pool.query(query, [materiaPrimaId]);
    
    res.status(200).json(movimientos);
  } catch (error) {
    console.error(`Error al obtener movimientos para la materia prima ID ${materiaPrimaId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el historial.' });
  }
};

// Registrar un nuevo movimiento de inventario (ajuste manual, etc.)
exports.registrarMovimiento = async (req, res) => {
  const { lote_id, tipo_movimiento, cantidad, descripcion } = req.body;
  const usuario_id = req.usuario.id; // Obtenido del token por el middleware protegerRuta

  if (!lote_id || !tipo_movimiento || cantidad === undefined) {
    return res.status(400).json({ message: 'Lote, tipo de movimiento y cantidad son obligatorios.' });
  }

  try {
    const query = `
      INSERT INTO movimientos_inventario_mp 
      (lote_id, tipo_movimiento, cantidad, descripcion, usuario_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(query, [lote_id, tipo_movimiento, cantidad, descripcion || null, usuario_id]);
    
    // El trigger 'trg_actualizar_stock_mp' se encargará de actualizar los stocks automáticamente.

    res.status(201).json({ message: 'Movimiento de inventario registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar movimiento de inventario:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar el movimiento.' });
  }
};