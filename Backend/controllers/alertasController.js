// Contenido corregido y mejorado para: Backend/controllers/alertasController.js

const pool = require('../config/db');

exports.obtenerAlertasActivas = async (req, res) => {
    try {
        // Consulta para alertas de STOCK BAJO (sin cambios)
        const queryStockBajo = `
            SELECT 
                id,
                nombre,
                'STOCK_BAJO' as tipo_alerta,
                CONCAT('El stock de ', nombre, ' (', stock_actual, ') ha caído por debajo del umbral (', umbral_alerta, ').') as mensaje
            FROM 
                materias_primas 
            WHERE 
                stock_actual <= umbral_alerta;
        `;

        // --- CORRECCIÓN AQUÍ ---
        // Se modifica la consulta para agrupar los lotes por nombre y fecha de expiración.
        const queryProximoAVencer = `
            SELECT 
                materia_prima_nombre as nombre,
                fecha_expiracion,
                'PROXIMO_A_VENCER' as tipo_alerta,
                CONCAT(
                    COUNT(*), ' lote(s) de ', materia_prima_nombre, 
                    ' (', SUM(stock_lote), ' en total) vencen el ', 
                    DATE_FORMAT(fecha_expiracion, '%d-%m-%Y'), '.'
                ) as mensaje,
                MIN(id) as id -- Usamos MIN(id) para tener un ID único para la key de React
            FROM 
                lotes_materias_primas 
            WHERE 
                fecha_expiracion BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY
            GROUP BY
                materia_prima_nombre, fecha_expiracion
            ORDER BY
                fecha_expiracion ASC;
        `;

        const [alertasStock] = await pool.query(queryStockBajo);
        const [alertasVencimiento] = await pool.query(queryProximoAVencer);

        const alertasActivas = [...alertasStock, ...alertasVencimiento];

        res.json(alertasActivas);

    } catch (error) {
        console.error('Error al obtener alertas activas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las alertas.' });
    }
};