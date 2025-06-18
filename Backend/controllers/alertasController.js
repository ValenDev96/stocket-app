// Contenido 100% completo y corregido para: Backend/controllers/alertasController.js

const pool = require('../config/db');

/**
 * Obtiene todas las alertas activas del sistema.
 */
exports.obtenerAlertasActivas = async (req, res) => {
    try {
        // Alertas de Bajo Stock
        const bajoStockQuery = `
            SELECT 
                mp.id as alerta_id,
                mp.id as materia_prima_id,
                mp.nombre as nombre_materia_prima,
                mp.stock_actual,
                mp.umbral_alerta,
                'bajo_stock' as tipo_alerta,
                CONCAT('El stock de ', mp.nombre, ' (', mp.stock_actual, ') ha caído por debajo del umbral (', mp.umbral_alerta, ').') as mensaje_alerta,
                NOW() as fecha_alerta 
            FROM materias_primas mp
            WHERE mp.stock_actual <= mp.umbral_alerta;
        `;
        const [alertasBajoStock] = await pool.query(bajoStockQuery);

        // Alertas de Lotes Próximos a Expirar (solo los disponibles)
        const expiracionQuery = `
            SELECT 
                lmp.id as alerta_id,
                lmp.materia_prima_nombre,
                lmp.stock_lote,
                lmp.fecha_expiracion,
                'expiracion' as tipo_alerta,
                CONCAT('El lote #', lmp.id, ' de ', lmp.materia_prima_nombre, ' vence el ', DATE_FORMAT(lmp.fecha_expiracion, '%Y-%m-%d'), '.') as mensaje_alerta,
                lmp.fecha_expiracion as fecha_alerta 
            FROM lotes_materias_primas lmp
            WHERE lmp.fecha_expiracion BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            AND lmp.estado = 'disponible';
        `;
        const [alertasExpiracion] = await pool.query(expiracionQuery);

        const todasLasAlertas = [...alertasBajoStock, ...alertasExpiracion];
        
        todasLasAlertas.sort((a, b) => new Date(a.fecha_alerta) - new Date(b.fecha_alerta));

        res.status(200).json(todasLasAlertas);

    } catch (error) {
        console.error('Error al obtener alertas activas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener alertas.' });
    }
};