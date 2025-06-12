const pool = require('../config/db'); // Tu pool de conexión a la BD

/**
 * @description Crea la definición de una nueva materia prima en el sistema.
 * El stock inicial se establece en 0. La adición de stock se maneja a través de compras o lotes.
 */
exports.crearMateriaPrima = async (req, res) => {
  // --- CORREGIDO ---
  // Se obtienen solo los campos que existen en la tabla 'materias_primas'.
  // 'descripcion' es opcional.
  const { nombre, descripcion, unidad_medida, umbral_alerta } = req.body;

  // Validación de entrada corregida
  if (!nombre || !unidad_medida || umbral_alerta === undefined) {
    return res.status(400).json({ message: 'Los campos nombre, unidad_medida y umbral_alerta son obligatorios.' });
  }
  if (parseFloat(umbral_alerta) < 0) {
    return res.status(400).json({ message: 'El umbral de alerta no puede ser negativo.' });
  }
  const unidadesValidas = ['kg', 'g', 'L', 'ml', 'unidades'];
  if (!unidadesValidas.includes(unidad_medida)) {
    return res.status(400).json({ message: `Unidad no válida. Valores permitidos: ${unidadesValidas.join(', ')}` });
  }

  try {
    // --- CORREGIDO ---
    // La consulta INSERT solo incluye las columnas correctas.
    // El stock_actual se inicializa en 0 por defecto para una nueva materia prima.
    const [result] = await pool.query(
      'INSERT INTO materias_primas (nombre, descripcion, unidad_medida, stock_actual, umbral_alerta) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion || null, unidad_medida, 0, umbral_alerta]
    );
    res.status(201).json({
      message: 'Materia prima creada exitosamente',
      id: result.insertId,
      nombre: nombre,
      descripcion: descripcion,
      unidad_medida: unidad_medida,
      stock_actual: 0, // Se devuelve el stock inicial
      umbral_alerta: umbral_alerta
    });
  } catch (error) {
    console.error('Error al crear materia prima:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear materia prima' });
  }
};

/**
 * @description Obtiene una lista completa de todas las materias primas con todos sus detalles.
 */
exports.obtenerTodasMateriasPrimas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM materias_primas ORDER BY nombre ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener materias primas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener materias primas' });
  }
};

/**
 * @description Obtiene una única materia prima por su ID.
 */
exports.obtenerMateriaPrimaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM materias_primas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Materia prima no encontrada' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener materia prima por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * @description Actualiza la definición de una materia prima.
 * No modifica el stock_actual, ya que eso se debe manejar mediante movimientos de inventario.
 */
exports.actualizarMateriaPrima = async (req, res) => {
  const { id } = req.params;
  // --- CORREGIDO ---
  // Se obtienen solo los campos que se pueden editar en la definición.
  const { nombre, descripcion, unidad_medida, umbral_alerta } = req.body;

  // Validación corregida
  if (!nombre || !unidad_medida || umbral_alerta === undefined) {
    return res.status(400).json({ message: 'Los campos nombre, unidad_medida y umbral_alerta son obligatorios.' });
  }
  if (parseFloat(umbral_alerta) < 0) {
    return res.status(400).json({ message: 'El umbral de alerta no puede ser negativo.' });
  }
  const unidadesValidas = ['kg', 'g', 'L', 'ml', 'unidades'];
  if (!unidadesValidas.includes(unidad_medida)) {
    return res.status(400).json({ message: `Unidad no válida. Valores permitidos: ${unidadesValidas.join(', ')}` });
  }

  try {
    // --- CORREGIDO ---
    // La consulta UPDATE solo modifica las columnas que existen en la tabla.
    const [result] = await pool.query(
      'UPDATE materias_primas SET nombre = ?, descripcion = ?, unidad_medida = ?, umbral_alerta = ? WHERE id = ?',
      [nombre, descripcion || null, unidad_medida, umbral_alerta, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materia prima no encontrada o datos sin cambios' });
    }
    res.status(200).json({ message: 'Materia prima actualizada exitosamente', id: id, ...req.body });
  } catch (error) {
    console.error('Error al actualizar materia prima:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar materia prima' });
  }
};

/**
 * @description Elimina una materia prima del sistema.
 */
exports.eliminarMateriaPrima = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM materias_primas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Materia prima no encontrada' });
    }
    res.status(200).json({ message: 'Materia prima eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar materia prima:', error);
    // Manejo de error si la materia prima está siendo usada en otras tablas (ej. lotes, recetas)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar: esta materia prima está en uso en lotes o recetas.' });
    }
    res.status(500).json({ message: 'Error interno del servidor al eliminar materia prima' });
  }
};

/**
 * @description Obtiene una lista simplificada de materias primas (id y nombre),
 * ideal para poblar menús desplegables (dropdowns) en el frontend.
 */
exports.obtenerNombresMateriasPrimas = async (req, res) => {
  try {
    const [materias] = await pool.query('SELECT id, nombre FROM materias_primas ORDER BY nombre ASC');
    res.status(200).json(materias);
  } catch (error) {
    console.error('Error al obtener nombres de materias primas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// NOTA: Tu archivo original tenía dos funciones con el mismo nombre 'obtenerMateriasPrimas'.
// He renombrado la segunda a 'obtenerNombresMateriasPrimas' para mayor claridad y evitar conflictos.
// Asegúrate de que en tus rutas (`materiaPrimaRoutes.js`) llames a esta nueva función si la necesitas.