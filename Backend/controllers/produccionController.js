const pool = require('../config/db');

// --- NUEVA FUNCIÓN AUXILIAR PARA CONVERSIÓN DE UNIDADES ---
function convertirUnidad(cantidad, unidadOrigen, unidadDestino) {
    if (unidadOrigen === unidadDestino) {
        return cantidad; // No se necesita conversión
    }

    const conversiones = {
        'kg': 1000, 'g': 1,
        'L': 1000, 'ml': 1,
        'unidades': 1
    };

    // Convertir la cantidad original a la unidad base (g o ml)
    const cantidadEnBase = cantidad * (conversiones[unidadOrigen] || 1);

    // Convertir de la unidad base a la unidad de destino
    const cantidadFinal = cantidadEnBase / (conversiones[unidadDestino] || 1);

    return cantidadFinal;
}


exports.registrarProduccion = async (req, res) => {
    const { producto_terminado_id, cantidad_producida } = req.body;
    const usuario_id = req.usuario.id;

    if (!producto_terminado_id || !cantidad_producida || cantidad_producida <= 0) {
        return res.status(400).json({ message: 'Se requiere un producto y una cantidad válida.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener la receta y los detalles de los ingredientes, incluyendo sus unidades
        const queryReceta = `
            SELECT 
                ing.materia_prima_id, 
                ing.cantidad as cantidad_receta, 
                ing.unidad_medida as unidad_receta,  -- Unidad de la receta
                mp.nombre as materia_prima_nombre, 
                mp.stock_actual,
                mp.unidad_medida as unidad_stock    -- Unidad del stock principal
            FROM recetas r
            JOIN ingredientes_receta ing ON r.id = ing.receta_id
            JOIN materias_primas mp ON ing.materia_prima_id = mp.id
            WHERE r.producto_terminado_id = ?
        `;
        const [receta] = await connection.query(queryReceta, [producto_terminado_id]);

        if (receta.length === 0) throw new Error('No se encontró una receta para este producto.');

        // 2. Verificar si hay suficiente stock, APLICANDO LA CONVERSIÓN DE UNIDADES
        for (const ingrediente of receta) {
            const cantidadNecesariaEnReceta = ingrediente.cantidad_receta * cantidad_producida;
            
            // Convertimos la cantidad necesaria a la unidad en que se mide el stock principal
            const cantidadConvertidaRequerida = convertirUnidad(
                cantidadNecesariaEnReceta, 
                ingrediente.unidad_receta, 
                ingrediente.unidad_stock
            );

            if (ingrediente.stock_actual < cantidadConvertidaRequerida) {
                throw new Error(`Stock insuficiente para '${ingrediente.materia_prima_nombre}'. Se necesitan: ${cantidadConvertidaRequerida.toFixed(2)} ${ingrediente.unidad_stock}.`);
            }
        }

        // 3. Descontar las materias primas, APLICANDO LA CONVERSIÓN DE UNIDADES
        for (const ingrediente of receta) {
            const cantidadNecesariaEnReceta = ingrediente.cantidad_receta * cantidad_producida;
            let cantidadTotalADescontar = convertirUnidad(
                cantidadNecesariaEnReceta, 
                ingrediente.unidad_receta, 
                ingrediente.unidad_stock
            );
            
            const [lotes] = await connection.query(
                `SELECT id, stock_lote FROM lotes_materias_primas WHERE materia_prima_nombre = ? AND estado = 'disponible' AND stock_lote > 0 ORDER BY fecha_ingreso ASC`,
                [ingrediente.materia_prima_nombre]
            );

            for (const lote of lotes) {
                if (cantidadTotalADescontar <= 0) break;
                const descuento = Math.min(cantidadTotalADescontar, lote.stock_lote);
                await connection.query('INSERT INTO movimientos_inventario_mp (lote_id, tipo_movimiento, cantidad, descripcion, usuario_id) VALUES (?, ?, ?, ?, ?)',
                    [lote.id, 'salida', descuento, `Salida por producción para producto ID: ${producto_terminado_id}`, usuario_id]);
                cantidadTotalADescontar -= descuento;
            }
        }

        // 4. Aumentar el stock del producto terminado
        await connection.query('UPDATE productos_terminados SET stock = stock + ? WHERE id = ?', [cantidad_producida, producto_terminado_id]);

        // 5. Registrar el lote de producción
        await connection.query('INSERT INTO lotes_produccion (producto_terminado_id, cantidad_planificada, cantidad_producida, fecha_produccion, estado) VALUES (?, ?, ?, CURDATE(), ?)',
            [producto_terminado_id, cantidad_producida, cantidad_producida, 'finalizado']);

        await connection.commit();
        res.status(201).json({ message: 'Producción registrada y stock actualizado exitosamente.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error al registrar producción:", error);
        const statusCode = error.message.includes('Stock insuficiente') ? 400 : 500;
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