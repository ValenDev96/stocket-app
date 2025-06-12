// Contenido para: Backend/controllers/lotesController.js

const pool = require('../config/db');

// Obtener todos los lotes activos de una materia prima específica
exports.obtenerLotesPorMateriaPrima = async (req, res) => {
    const { id } = req.params; // ID de la materia prima

    try {
        const query = `
            SELECT 
                id, stock_lote, fecha_expiracion 
            FROM 
                lotes_materias_primas 
            WHERE 
                materia_prima_nombre = (SELECT nombre FROM materias_primas WHERE id = ?) AND stock_lote > 0
            ORDER BY
                fecha_expiracion ASC;
        `;
        const [lotes] = await pool.query(query, [id]);
        res.status(200).json(lotes);
    } catch (error) {
        console.error('Error al obtener lotes por materia prima:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};