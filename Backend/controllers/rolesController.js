const pool = require('../config/db');

/**
 * @description Obtiene una lista de todos los roles disponibles en el sistema.
 */
exports.obtenerRoles = async (req, res) => {
  try {
    // Se consultan todos los roles de la tabla, ordenados alfabéticamente.
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY nombre_rol ASC');
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    res.status(500).json({ message: 'Error interno del servidor al consultar los roles.' });
  }
};
