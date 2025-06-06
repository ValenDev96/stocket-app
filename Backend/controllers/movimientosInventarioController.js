const pool = require('../config/db'); // Pool de conexión a la BD

/**
 * Registra un movimiento de inventario (entrada o salida) para una materia prima
 * y actualiza la cantidad de stock de la materia prima.
 */
exports.registrarMovimiento = async (req, res) => {
  // materia_prima_id vendrá de los parámetros de la ruta o del cuerpo, ajustaremos la ruta luego.
  // Por ahora, asumamos que viene en el cuerpo junto con los otros datos.
  const { materia_prima_id, tipo_movimiento, cantidad, descripcion, usuario_id } = req.body;
  // usuario_id podría obtenerse de req.usuario.id si la ruta está protegida

  // --- Validación de Entrada ---
  if (!materia_prima_id || !tipo_movimiento || !cantidad) {
    return res.status(400).json({ message: 'Materia prima ID, tipo de movimiento y cantidad son obligatorios.' });
  }
  if (isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0) {
    return res.status(400).json({ message: 'La cantidad debe ser un número positivo.' });
  }
  if (!['entrada', 'salida'].includes(tipo_movimiento)) {
    return res.status(400).json({ message: "Tipo de movimiento inválido. Debe ser 'entrada' o 'salida'." });
  }

  const cantidadMovimiento = parseFloat(cantidad);
  const conn = await pool.getConnection(); // Obtener una conexión del pool para la transacción

  try {
    await conn.beginTransaction(); // Iniciar transacción

    // 1. Obtener la materia prima y su cantidad actual (con bloqueo para actualización)
    const [materiasPrimas] = await conn.query('SELECT id, nombre, cantidad, unidad FROM materias_primas WHERE id = ? FOR UPDATE', [materia_prima_id]);

    if (materiasPrimas.length === 0) {
      await conn.rollback(); // Liberar bloqueo y deshacer
      return res.status(404).json({ message: 'Materia prima no encontrada.' });
    }

    const materiaPrima = materiasPrimas[0];
    let nuevaCantidadStock = parseFloat(materiaPrima.cantidad);

    // 2. Calcular nueva cantidad y validar si es salida
    if (tipo_movimiento === 'entrada') {
      nuevaCantidadStock += cantidadMovimiento;
    } else { // tipo_movimiento === 'salida'
      if (nuevaCantidadStock < cantidadMovimiento) {
        await conn.rollback();
        return res.status(400).json({ message: `No hay suficiente stock de "${materiaPrima.nombre}". Disponible: ${materiaPrima.cantidad} ${materiaPrima.unidad}, Salida solicitada: ${cantidadMovimiento} ${materiaPrima.unidad}.` });
      }
      nuevaCantidadStock -= cantidadMovimiento;
    }

    // 3. Actualizar la cantidad en la tabla materias_primas
    await conn.query('UPDATE materias_primas SET cantidad = ? WHERE id = ?', [nuevaCantidadStock, materia_prima_id]);

    // 4. Insertar el registro en movimientos_inventario
    // El campo 'descripcion' del movimiento puede ser más específico (ej. "Compra a proveedor X", "Uso en producción lote Y")
    // 'usuario_id' registraría quién hizo el movimiento (se obtendría de req.usuario.id si la ruta está protegida)
    const descripcionMovimiento = descripcion || `Movimiento de ${tipo_movimiento}`;
    await conn.query(
      'INSERT INTO movimientos_inventario (materia_prima_id, tipo_movimiento, cantidad, descripcion, fecha_movimiento) VALUES (?, ?, ?, ?, NOW())',
      // Originalmente tu tabla movimientos_inventario no tiene usuario_id, si lo añades, inclúyelo aquí.
      [materia_prima_id, tipo_movimiento, cantidadMovimiento, descripcionMovimiento]
    );

    await conn.commit(); // Confirmar transacción

    res.status(201).json({
      message: `Movimiento de '${tipo_movimiento}' registrado exitosamente para "${materiaPrima.nombre}". Nuevo stock: ${nuevaCantidadStock} ${materiaPrima.unidad}.`,
      materiaPrimaActualizada: { ...materiaPrima, cantidad: nuevaCantidadStock }
    });

  } catch (error) {
    await conn.rollback(); // Deshacer en caso de error
    console.error('Error al registrar movimiento de inventario:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar el movimiento.' });
  } finally {
    if (conn) conn.release(); // Importante: liberar la conexión de vuelta al pool
  }
};

// Podríamos añadir una función para obtener movimientos de una materia prima específica
exports.obtenerMovimientosPorMateriaPrima = async (req, res) => {
  const { materiaPrimaId } = req.params;

  if (isNaN(parseInt(materiaPrimaId))) {
      return res.status(400).json({ message: 'El ID de la materia prima debe ser un número.' });
  }

  try {
      const [movimientos] = await pool.query(
          'SELECT * FROM movimientos_inventario WHERE materia_prima_id = ? ORDER BY fecha_movimiento DESC',
          [materiaPrimaId]
      );
      
      if (movimientos.length === 0) {
          // No es un error si no hay movimientos, simplemente una lista vacía.
          return res.status(200).json([]); 
      }
      res.status(200).json(movimientos);

  } catch (error) {
      console.error(`Error al obtener movimientos para materia prima ID ${materiaPrimaId}:`, error);
      res.status(500).json({ message: 'Error interno del servidor al obtener el historial de movimientos.' });
  }
};