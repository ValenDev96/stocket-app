const pool = require('../config/db');

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
        let [recetaExistente] = await connection.query('SELECT id FROM recetas WHERE producto_terminado_id = ?', [producto_terminado_id]);
        let recetaId;

        if (recetaExistente.length > 0) {
            recetaId = recetaExistente[0].id;
            await connection.query('UPDATE recetas SET nombre_receta = ?, descripcion = ? WHERE id = ?', [nombre_receta, descripcion, recetaId]);
        } else {
            const [result] = await connection.query('INSERT INTO recetas (producto_terminado_id, nombre_receta, descripcion) VALUES (?, ?, ?)', [producto_terminado_id, nombre_receta, descripcion]);
            recetaId = result.insertId;
        }

        await connection.query('DELETE FROM ingredientes_receta WHERE receta_id = ?', [recetaId]);

        if (ingredientes && ingredientes.length > 0) {
            // --- CORRECCIÓN ---
            // Los valores a insertar ahora incluyen 'unidad_medida'
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