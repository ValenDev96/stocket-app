const { convertirUnidad } = require('../utils/conversionHelper');
const pool = require('../config/db');

// Controlador para manejar la producción de productos terminados
exports.registrarProduccion = async (req, res) => {
    // Recibimos el 'pedido_origen_id' que ya nos manda el frontend
    const { producto_terminado_id, cantidad_producida, pedido_origen_id } = req.body;

    if (!producto_terminado_id || !cantidad_producida || cantidad_producida <= 0) {
        return res.status(400).json({ message: 'Se requiere un producto y una cantidad válida.' });
    }

    try {
        // --- CORRECCIÓN AQUÍ ---
        // La consulta INSERT ahora incluye la columna 'pedido_id'
        const query = `
            INSERT INTO lotes_produccion 
            (pedido_id, producto_terminado_id, cantidad_planificada, cantidad_producida, fecha_produccion, estado) 
            VALUES (?, ?, ?, ?, CURDATE(), 'planificado')
        `;
        // Pasamos 'pedido_origen_id' (que puede ser null si es una producción manual)
        await pool.query(query, [pedido_origen_id || null, producto_terminado_id, cantidad_producida, cantidad_producida]);

        res.status(201).json({ message: 'Producción planificada exitosamente.' });

    } catch (error) {
        console.error("Error al planificar producción:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

exports.iniciarProduccion = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuario.id;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [loteRows] = await connection.query("SELECT * FROM lotes_produccion WHERE id = ? AND estado = 'planificado' FOR UPDATE", [id]);
        if (loteRows.length === 0) throw new Error('El lote de producción no se encontró o ya no está en estado "planificado".');
        const lote = loteRows[0];

        // Obtenemos la receta, incluyendo las unidades de medida tanto de la receta como del stock
        const [receta] = await connection.query(`
            SELECT 
                ing.materia_prima_id, 
                ing.cantidad as cantidad_receta, 
                ing.unidad_medida as unidad_receta,
                mp.nombre as materia_prima_nombre, 
                mp.stock_actual,
                mp.unidad_medida as unidad_stock
            FROM recetas r
            JOIN ingredientes_receta ing ON r.id = ing.receta_id
            JOIN materias_primas mp ON ing.materia_prima_id = mp.id
            WHERE r.producto_terminado_id = ?
        `, [lote.producto_terminado_id]);
        if (receta.length === 0) throw new Error('No se encontró una receta para este producto.');

        // VERIFICAR stock CON CONVERSIÓN
        for (const ingrediente of receta) {
            const cantidadNecesariaEnReceta = ingrediente.cantidad_receta * lote.cantidad_producida;
            // --- 2. CONVERTIMOS LA CANTIDAD NECESARIA A LA UNIDAD DEL STOCK ---
            const cantidadConvertidaRequerida = convertirUnidad(
                cantidadNecesariaEnReceta,
                ingrediente.unidad_receta,
                ingrediente.unidad_stock
            );

            if (ingrediente.stock_actual < cantidadConvertidaRequerida) {
                throw new Error(`Stock insuficiente para '${ingrediente.materia_prima_nombre}'. Se necesitan: ${cantidadConvertidaRequerida.toFixed(2)} ${ingrediente.unidad_stock}.`);
            }
        }

        // DESCONTAR stock CON CONVERSIÓN
        for (const ingrediente of receta) {
            const cantidadNecesariaEnReceta = ingrediente.cantidad_receta * lote.cantidad_producida;
            // --- 3. CONVERTIMOS LA CANTIDAD A DESCONTAR A LA UNIDAD DEL STOCK ---
            let cantidadTotalADescontar = convertirUnidad(
                cantidadNecesariaEnReceta,
                ingrediente.unidad_receta,
                ingrediente.unidad_stock
            );
            
            const [lotesDeMateriaPrima] = await connection.query(
                "SELECT id, stock_lote FROM lotes_materias_primas WHERE materia_prima_nombre = ? AND estado = 'disponible' AND stock_lote > 0 ORDER BY fecha_ingreso ASC",
                [ingrediente.materia_prima_nombre]
            );

            for (const loteMP of lotesDeMateriaPrima) {
                if (cantidadTotalADescontar <= 0) break;
                const descuento = Math.min(cantidadTotalADescontar, loteMP.stock_lote);
                await connection.query('INSERT INTO movimientos_inventario_mp (lote_id, tipo_movimiento, cantidad, descripcion, usuario_id) VALUES (?, ?, ?, ?, ?)',
                    [loteMP.id, 'salida', descuento, `Salida por producción para lote #${id}`, usuario_id]);
                cantidadTotalADescontar -= descuento;
            }
        }

        // 5. Si todo fue exitoso, actualizamos el estado del lote de producción a 'en_proceso'
       await connection.query("UPDATE lotes_produccion SET estado = 'en_proceso' WHERE id = ?", [id]);

        // --- 6. (NUEVO Y CLAVE) SI EL LOTE VINO DE UN PEDIDO, ACTUALIZAMOS ESE PEDIDO ---
        if (lote.pedido_id) {
            await connection.query(
                "UPDATE pedidos SET estado_pedido = 'en_proceso' WHERE id = ? AND estado_pedido = 'pendiente'",
                [lote.pedido_id]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'La producción se ha iniciado y el stock de materias primas ha sido actualizado.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error al iniciar producción:", error);
        const statusCode = error.message.includes('Stock insuficiente') ? 400 : 500;
        res.status(statusCode).json({ message: error.message || 'Error interno del servidor.' });
    } finally {
        connection.release();
    }
};

exports.finalizarProduccion = async (req, res) => {
    const { id } = req.params; // ID del lote de producción
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtenemos los datos del lote, incluyendo el pedido_id si existe
        const [loteRows] = await connection.query(
            "SELECT producto_terminado_id, cantidad_producida, estado, pedido_id FROM lotes_produccion WHERE id = ?", 
            [id]
        );
        if (loteRows.length === 0) {
            throw new Error('Lote de producción no encontrado.');
        }
        const lote = loteRows[0];
        if (lote.estado !== 'en_proceso') {
            throw new Error('Este lote no se puede finalizar porque no está "en proceso".');
        }

        // 2. Actualizamos el estado del lote de producción a 'finalizado'
        await connection.query("UPDATE lotes_produccion SET estado = 'finalizado' WHERE id = ?", [id]);

        // 3. Actualizamos el stock del producto terminado
        await connection.query(
            "UPDATE productos_terminados SET stock = stock + ? WHERE id = ?",
            [lote.cantidad_producida, lote.producto_terminado_id]
        );

        // --- 4. (PASO CLAVE AÑADido) Actualizamos el estado del pedido original ---
        if (lote.pedido_id) {
            await connection.query(
                "UPDATE pedidos SET estado_pedido = 'listo_para_entrega' WHERE id = ? AND estado_pedido = 'en_proceso'",
                [lote.pedido_id]
            );
        }

        // 5. Si todo sale bien, confirmamos la transacción
        await connection.commit();

        res.status(200).json({ message: 'La producción ha finalizado y el stock ha sido actualizado.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error al finalizar producción:", error);
        const statusCode = error.message.includes('no se puede finalizar') ? 400 : 500;
        res.status(statusCode).json({ message: error.message || 'Error interno del servidor.' });
    } finally {
        connection.release();
    }
};

// Obtener el historial de producción (sin cambios)
exports.obtenerHistorialProduccion = async (req, res) => {
    try {
        const [historial] = await pool.query(`
            SELECT lp.*, pt.nombre as producto_nombre 
            FROM lotes_produccion lp
            JOIN productos_terminados pt ON lp.producto_terminado_id = pt.id
            ORDER BY lp.fecha_produccion DESC
        `);
        res.status(200).json(historial);
    } catch (error) {
        console.error("Error al obtener historial de producción:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};