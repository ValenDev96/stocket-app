const pool = require('../config/db'); // Tu pool de conexión a la BD

// Crear una nueva materia prima
exports.crearMateriaPrima = async (req, res) => {
  const { nombre, proveedor_id, cantidad, unidad, fecha_expiracion, umbral_alerta } = req.body;

  // Validación básica de entrada
  if (!nombre || !cantidad || !unidad || !umbral_alerta) {
    return res.status(400).json({ message: 'Los campos nombre, cantidad, unidad y umbral de alerta son obligatorios.' });
  }
  if (cantidad < 0 || umbral_alerta < 0) {
    return res.status(400).json({ message: 'Cantidad y umbral de alerta no pueden ser negativos.' });
  }
  const unidadesValidas = ['kg', 'g', 'L', 'ml', 'unidades']; // Ajusta según tus ENUM si es diferente
  if (!unidadesValidas.includes(unidad)) {
    return res.status(400).json({ message: `Unidad no válida. Valores permitidos: ${unidadesValidas.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO materias_primas (nombre, proveedor_id, cantidad, unidad, fecha_expiracion, umbral_alerta) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, proveedor_id || null, cantidad, unidad, fecha_expiracion || null, umbral_alerta]
    );
    res.status(201).json({
      message: 'Materia prima creada exitosamente',
      id: result.insertId,
      ...req.body
    });
  } catch (error) {
    console.error('Error al crear materia prima:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear materia prima' });
  }
};

// Obtener todas las materias primas
exports.obtenerTodasMateriasPrimas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM materias_primas ORDER BY nombre ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener materias primas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener materias primas' });
  }
};

// Obtener una materia prima por ID
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

// Actualizar una materia prima
exports.actualizarMateriaPrima = async (req, res) => {
  const { id } = req.params;
  const { nombre, proveedor_id, cantidad, unidad, fecha_expiracion, umbral_alerta } = req.body;

  // Validación básica
  if (!nombre || cantidad === undefined || !unidad || umbral_alerta === undefined) {
    return res.status(400).json({ message: 'Los campos nombre, cantidad, unidad y umbral de alerta son obligatorios para la actualización.' });
  }
   if (parseFloat(cantidad) < 0 || parseFloat(umbral_alerta) < 0) {
    return res.status(400).json({ message: 'Cantidad y umbral de alerta no pueden ser negativos.' });
  }
  const unidadesValidas = ['kg', 'g', 'L', 'ml', 'unidades']; // Ajusta según tus ENUM
  if (!unidadesValidas.includes(unidad)) {
    return res.status(400).json({ message: `Unidad no válida. Valores permitidos: ${unidadesValidas.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE materias_primas SET nombre = ?, proveedor_id = ?, cantidad = ?, unidad = ?, fecha_expiracion = ?, umbral_alerta = ? WHERE id = ?',
      [nombre, proveedor_id || null, cantidad, unidad, fecha_expiracion || null, umbral_alerta, id]
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

// Eliminar una materia prima
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
    // Considerar errores de FK si hay movimientos de inventario asociados
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar la materia prima porque está siendo referenciada en otras tablas (ej. movimientos de inventario, recetas).' });
    }
    res.status(500).json({ message: 'Error interno del servidor al eliminar materia prima' });
  }
};