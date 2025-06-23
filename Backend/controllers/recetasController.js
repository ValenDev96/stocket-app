const pool = require('../config/db');
const { convertirUnidad } = require('../utils/conversionHelper');

// Obtener la receta, incluyendo la unidad de medida de cada ingrediente
exports.obtenerRecetaPorProductoId = async (req, res) => {
    const { productoId } = req.params;
    try {
        const [receta] = await pool.query('SELECT * FROM recetas WHERE producto_terminado_id = ?', [productoId]);
        if (receta.length === 0) {
            return res.status(200).json({ ingredientes: [] });
        }
        // --- CORRECCIÓN ---
        // La consulta ahora también selecciona 'unidad_medida'
        const [ingredientes] = await pool.query(
            'SELECT materia_prima_id, cantidad, unidad_medida FROM ingredientes_receta WHERE receta_id = ?', 
            [receta[0].id]
        );
        res.status(200).json({ ...receta[0], ingredientes });
    } catch (error) {
        console.error('Error al obtener la receta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Guardar o actualizar una receta, incluyendo la unidad de medida de cada ingrediente
exports.guardarReceta = async (req, res) => {
    const { producto_terminado_id, nombre_receta, descripcion, ingredientes } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let costoTotalEstimado = 0;

        if (ingredientes && ingredientes.length > 0) {
            // --- PASO 1: OBTENER PRECIOS DE LAS MATERIAS PRIMAS ---
            // Creamos una lista de IDs de las materias primas que necesitamos consultar
            const materiaPrimaIds = ingredientes.map(ing => ing.materia_prima_id);
            
            // Obtenemos el precio unitario más reciente de cada materia prima desde la tabla de compras
            const [preciosRows] = await connection.query(`
                SELECT 
                    materia_prima_nombre, 
                    precio_unitario, 
                    (SELECT unidad_medida FROM materias_primas WHERE nombre = cp.materia_prima_nombre) as unidad_compra
                FROM compras_proveedores cp
                WHERE (materia_prima_nombre, fecha_compra) IN (
                    SELECT materia_prima_nombre, MAX(fecha_compra)
                    FROM compras_proveedores
                    WHERE materia_prima_nombre IN (SELECT nombre FROM materias_primas WHERE id IN (?))
                    GROUP BY materia_prima_nombre
                )
            `, [materiaPrimaIds]);

            const preciosMap = new Map(preciosRows.map(p => [p.materia_prima_nombre, { precio: p.precio_unitario, unidad: p.unidad_compra }]));
            const materiasPrimasMap = new Map((await connection.query('SELECT id, nombre FROM materias_primas'))[0].map(mp => [mp.id, mp.nombre]));


            // --- PASO 2: CALCULAR EL COSTO TOTAL DE LA RECETA ---
            for (const ing of ingredientes) {
                const nombreMateriaPrima = materiasPrimasMap.get(parseInt(ing.materia_prima_id));
                const infoPrecio = preciosMap.get(nombreMateriaPrima);

                if (infoPrecio) {
                    // Convertimos la cantidad de la receta a la unidad en que se compró la materia prima
                    const cantidadConvertida = convertirUnidad(ing.cantidad, ing.unidad_medida, infoPrecio.unidad);
                    costoTotalEstimado += cantidadConvertida * infoPrecio.precio;
                }
            }
        }
        
        // --- PASO 3: GUARDAR LA RECETA CON EL COSTO CALCULADO ---
        let [recetaExistente] = await connection.query('SELECT id FROM recetas WHERE producto_terminado_id = ?', [producto_terminado_id]);
        let recetaId;

        if (recetaExistente.length > 0) {
            recetaId = recetaExistente[0].id;
            // Actualizamos la receta incluyendo el costo_estimado
            await connection.query('UPDATE recetas SET nombre_receta = ?, descripcion = ?, costo_estimado = ? WHERE id = ?', [nombre_receta, descripcion, costoTotalEstimado, recetaId]);
        } else {
            // Insertamos la nueva receta incluyendo el costo_estimado
            const [result] = await connection.query('INSERT INTO recetas (producto_terminado_id, nombre_receta, descripcion, costo_estimado) VALUES (?, ?, ?, ?)', [producto_terminado_id, nombre_receta, descripcion, costoTotalEstimado]);
            recetaId = result.insertId;
        }

        // El resto de la lógica para los ingredientes se mantiene igual
        await connection.query('DELETE FROM ingredientes_receta WHERE receta_id = ?', [recetaId]);

        if (ingredientes && ingredientes.length > 0) {
            const ingredientesValues = ingredientes.map(ing => [recetaId, ing.materia_prima_id, ing.cantidad, ing.unidad_medida]);
            await connection.query(
                'INSERT INTO ingredientes_receta (receta_id, materia_prima_id, cantidad, unidad_medida) VALUES ?', 
                [ingredientesValues]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Receta guardada exitosamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al guardar la receta:', error);
        res.status(500).json({ message: 'Error al guardar la receta' });
    } finally {
        connection.release();
    }
};