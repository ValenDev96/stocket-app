const pool = require('../config/db');

/**
 * @description Obtiene estadísticas clave para las tarjetas del Dashboard.
 * La información puede variar en el futuro según el rol del usuario.
 */
exports.obtenerEstadisticas = async (req, res) => {
    try {
        // Consulta para contar materias primas con stock bajo
        const stockBajoQuery = `
            SELECT COUNT(*) as total 
            FROM materias_primas 
            WHERE stock_actual <= umbral_alerta;
        `;
        const [stockBajoResult] = await pool.query(stockBajoQuery);

        // Consulta para contar pedidos pendientes o en proceso
        const pedidosActivosQuery = `
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE estado_pedido IN ('pendiente', 'en_proceso');
        `;
        const [pedidosActivosResult] = await pool.query(pedidosActivosQuery);

        // Consulta para contar lotes de producción activos
        const produccionActivaQuery = `
            SELECT COUNT(*) as total 
            FROM lotes_produccion 
            WHERE estado = 'en_proceso';
        `;
        const [produccionActivaResult] = await pool.query(produccionActivaQuery);

        // Construimos el objeto de respuesta
        const estadisticas = {
            stockBajo: stockBajoResult[0].total,
            pedidosActivos: pedidosActivosResult[0].total,
            produccionActiva: produccionActivaResult[0].total,
        };

        res.status(200).json(estadisticas);

    } catch (error) {
        console.error("Error al obtener estadísticas del dashboard:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};