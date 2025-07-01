const pool = require('../config/db');

/**
 * @description Obtiene los registros de la tabla de auditoría con filtros opcionales.
 * @route GET /api/auditoria
 * @access Privado (Solo Administradores)
 */
exports.getAuditoriaLogs = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, usuarioId, limit } = req.query;

        // --- CORRECCIÓN 1: Se elimina el LIMIT 100 de la consulta principal ---
        let query = `
            SELECT 
                a.id, a.fecha_hora, u.nombre_usuario, a.accion, 
                a.tabla_afectada, a.registro_id, a.detalles
            FROM auditoria a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (fechaDesde) {
            query += ' AND a.fecha_hora >= ?';
            params.push(fechaDesde);
        }
        if (fechaHasta) {
            query += ' AND a.fecha_hora <= ?';
            params.push(fechaHasta + ' 23:59:59');
        }
        if (usuarioId) {
            query += ' AND a.usuario_id = ?';
            params.push(usuarioId);
        }

        query += ' ORDER BY a.fecha_hora DESC';

        // --- CORRECCIÓN 2: Lógica mejorada para añadir un único LIMIT al final ---
        // Usamos el límite que viene del frontend o establecemos 50 por defecto.
        const recordLimit = parseInt(limit, 10) || 50; 
        
        query += ' LIMIT ?';
        params.push(recordLimit);

        const [logs] = await pool.query(query, params);
        res.status(200).json(logs);

    } catch (error) {
        // El log del error ahora mostrará la consulta SQL correcta si algo más falla
        console.error("Error al obtener registros de auditoría:", { 
            message: error.message, 
            sql: error.sql 
        });
        res.status(500).json({ message: "Error interno del servidor." });
    }
};