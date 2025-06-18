const pool = require('../config/db');

exports.obtenerTodos = async (req, res) => {
    try {
        const [clientes] = await pool.query('SELECT id, nombre FROM clientes ORDER BY nombre ASC');
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};