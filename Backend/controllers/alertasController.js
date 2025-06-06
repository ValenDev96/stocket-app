const pool = require('../config/db'); // Pool de conexión a la BD

/**
 * Obtiene todas las alertas activas, uniendo con la tabla materias_primas
 * para obtener detalles del producto.
 */
exports.obtenerAlertasActivas = async (req, res) => {
  try {
    // La tabla `alertas` ya se debería estar poblando mediante los triggers
    // en la tabla `materias_primas`.
    // Esta consulta une alertas con materias_primas para obtener el nombre.
    const query = `
      SELECT 
        a.id AS alerta_id,
        a.materia_prima_id,
        mp.nombre AS nombre_materia_prima,
        mp.cantidad AS stock_actual,
        mp.unidad,
        mp.umbral_alerta,
        mp.fecha_expiracion,
        a.tipo_alerta,
        a.mensaje AS mensaje_alerta,
        a.fecha_alerta
      FROM alertas a
      JOIN materias_primas mp ON a.materia_prima_id = mp.id
      ORDER BY a.fecha_alerta DESC;
    `;

    const [alertas] = await pool.query(query);

    if (alertas.length === 0) {
      return res.status(200).json([]); // Devuelve un array vacío si no hay alertas
    }

    res.status(200).json(alertas);

  } catch (error) {
    console.error('Error al obtener alertas activas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener las alertas.' });
  }
};