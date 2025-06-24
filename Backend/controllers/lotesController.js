// Contenido de depuración para: Backend/controllers/lotesController.js

const pool = require('../config/db');

// Esta función no cambia, pero la incluimos para que el archivo esté completo.
exports.obtenerLotesPorMateriaPrima = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT id, stock_lote, fecha_expiracion FROM lotes_materias_primas 
            WHERE materia_prima_nombre = (SELECT nombre FROM materias_primas WHERE id = ?) 
            AND stock_lote > 0 AND estado = 'disponible'
            ORDER BY fecha_expiracion ASC;
        `;
        const [lotes] = await pool.query(query, [id]);
        res.status(200).json(lotes);
    } catch (error) {
        console.error('Error al obtener lotes por materia prima:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


// --- VERSIÓN DE DEPURACIÓN DE 'descartarLote' ---
exports.descartarLote = async (req, res) => {
    const { id } = req.params;
    console.log(`[LOG 1] Petición recibida para descartar el lote con ID: ${id}`);

    if (!req.usuario || !req.usuario.id) {
        console.error("[ERROR FATAL] No se encontró 'req.usuario.id'. El middleware 'protegerRuta' no está funcionando o no se está usando en la ruta.");
        return res.status(401).json({ message: "Error de autenticación." });
    }
    const usuario_id = req.usuario.id;
    
    const connection = await pool.getConnection();
    console.log("[LOG 2] Conexión a la base de datos obtenida.");

    try {
        await connection.beginTransaction();
        console.log("[LOG 3] Transacción iniciada.");

        const [loteRows] = await connection.query('SELECT stock_lote FROM lotes_materias_primas WHERE id = ? FOR UPDATE', [id]);
        console.log(`[LOG 4] Búsqueda del lote finalizada. Resultados:`, loteRows);

        if (loteRows.length === 0) {
            throw new Error('El lote que intentas descartar no fue encontrado.');
        }
        const cantidadADescontar = loteRows[0].stock_lote;

        if (cantidadADescontar <= 0) {
            console.log(`[LOG 5a] El lote ya tiene stock 0. No se realizarán más acciones.`);
            await connection.commit();
            return res.status(200).json({ message: 'El lote ya no tenía stock.' });
        }
        
        console.log(`[LOG 5b] Se va a descontar ${cantidadADescontar}. Actualizando estado del lote a 'descartado'...`);
        await connection.query("UPDATE lotes_materias_primas SET estado = 'descartado', stock_lote = 0 WHERE id = ?", [id]);
        
        console.log(`[LOG 6] Insertando movimiento de 'ajuste_disminucion' en el historial...`);
        await connection.query(
            'INSERT INTO movimientos_inventario_mp (lote_id, tipo_movimiento, cantidad, descripcion, usuario_id) VALUES (?, ?, ?, ?, ?)',
            [id, 'ajuste_disminucion', cantidadADescontar, 'Lote descartado por el usuario', usuario_id]
        );
        
        await connection.commit();
        console.log("[LOG 7] ¡ÉXITO! Transacción completada (COMMIT).");

        res.status(200).json({ message: 'Lote descartado y stock actualizado exitosamente.' });

    } catch (error) {
        await connection.rollback();
        // Este es el log de error que nos dirá la causa exacta del fallo.
        console.error("[FALLO EN LA TRANSACCIÓN] Se revirtieron los cambios (ROLLBACK). Razón del error:", error);
        res.status(500).json({ message: error.message || "Error interno del servidor." });
    } finally {
        connection.release();
        console.log("[LOG 8] Conexión a la base de datos liberada.");
    }
};