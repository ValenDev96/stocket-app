// C:\Users\alexa\stocket-app\Backend\controllers\proveedorController.js

// Importa el pool de conexiones a la base de datos. Esto sigue siendo correcto.
const pool = require("../config/db");

// --- Función para registrar un nuevo proveedor ---
// Esta función permanece sin cambios, ya que estaba funcionando correctamente.
exports.registrarProveedor = async (req, res) => {
  try {
    const { nombre, informacion_contacto, direccion } = req.body;

    const query = `
      INSERT INTO proveedores (nombre, informacion_contacto, direccion)
      VALUES (?, ?, ?)
    `;
    const values = [nombre, informacion_contacto, direccion];

    const [result] = await pool.query(query, values);

    res.status(201).json({
      message: 'Proveedor registrado exitosamente',
      id_generado: result.insertId
    });

  } catch (error) {
    console.error('Error al registrar proveedor:', error);
    res.status(500).json({ error: "Error al registrar proveedor", details: error.message });
  }
};


// --- FUNCIÓN CORREGIDA: para registrar una nueva COMPRA / LOTE DE MATERIA PRIMA ---
// Esta función ahora insertará datos directamente en la tabla `lotes_materias_primas`.
exports.registrarCompra = async (req, res) => {
    try {
        // 1. Desestructurar los datos del cuerpo de la solicitud (req.body).
        // Los nombres de las variables aquí deben coincidir con las propiedades
        // que envía el frontend (desde CompraForm.js).
        const {
            id_proveedor,         // Este campo del frontend se mapea a 'proveedor_id' en la DB
            materia_prima_id,     // Antes 'producto' en el frontend
            cantidad_ingresada,   // Antes 'cantidad' en el frontend
            costo_compra,         // Antes 'precio_unitario' en el frontend
            fecha_ingreso,        // Antes 'fecha_compra' en el frontend
            fecha_expiracion      // Nuevo campo, opcional
        } = req.body;

        // 2. Validaciones básicas en el backend para asegurar que los datos obligatorios estén presentes.
        if (
            !id_proveedor ||
            !materia_prima_id ||
            !cantidad_ingresada ||
            !costo_compra ||
            !fecha_ingreso
        ) {
            return res.status(400).json({ error: "Faltan datos obligatorios para registrar el lote de materia prima." });
        }

        // 3. Parsear y validar tipos de datos numéricos y de cantidad.
        // Es fundamental convertir las cadenas a números y validar que sean válidos.
        const parsedCantidadIngresada = parseFloat(cantidad_ingresada);
        const parsedCostoCompra = parseFloat(costo_compra);

        if (isNaN(parsedCantidadIngresada) || parsedCantidadIngresada <= 0) {
            return res.status(400).json({ error: "La cantidad ingresada debe ser un número positivo." });
        }
        if (isNaN(parsedCostoCompra) || parsedCostoCompra < 0) {
            return res.status(400).json({ error: "El costo de compra debe ser un número no negativo." });
        }

        // 4. Construir la consulta SQL para INSERTAR los datos en `lotes_materias_primas`.
        // Los nombres de las columnas en esta consulta deben coincidir EXACTAMENTE
        // con los nombres de las columnas en tu tabla de base de datos.
        const query = `
            INSERT INTO lotes_materias_primas (
                proveedor_id,         -- Columna en la DB
                materia_prima_id,     -- Columna en la DB
                cantidad_ingresada,   -- Columna en la DB
                stock_lote,           -- Columna en la DB (se inicializa con la misma cantidad)
                costo_compra,         -- Columna en la DB
                fecha_ingreso,        -- Columna en la DB
                fecha_expiracion      -- Columna en la DB
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // 5. Definir los valores para la consulta SQL.
        // El ORDEN de estos valores en el array DEBE coincidir con el orden de las columnas en la 'query'.
        const values = [
            id_proveedor,          // Valor para proveedor_id
            materia_prima_id,      // Valor para materia_prima_id
            parsedCantidadIngresada, // Valor para cantidad_ingresada
            parsedCantidadIngresada, // Valor para stock_lote (se inicializa con la misma cantidad)
            parsedCostoCompra,     // Valor para costo_compra
            fecha_ingreso,         // Valor para fecha_ingreso
            fecha_expiracion || null // Valor para fecha_expiracion (si el frontend envía null/undefined, se inserta NULL)
        ];

        // 6. Ejecutar la consulta en la base de datos usando el pool de conexiones.
        const [result] = await pool.query(query, values);

        // 7. Enviar una respuesta de éxito al cliente.
        res.status(201).json({
            message: 'Lote de materia prima registrado exitosamente',
            id_lote_generado: result.insertId // Devuelve el ID generado por la DB para el nuevo lote.
        });

    } catch (error) {
        // 8. Manejo de errores: loggea el error en la consola del servidor y envía una respuesta de error al cliente.
        console.error('Error al registrar el lote de materia prima:', error);
        res.status(500).json({ error: 'Error al registrar el lote de materia prima', details: error.message });
    }
};

// --- Funciones para obtener historial de compras y comparar precios ---
// ATENCIÓN: Estas funciones SÍ están usando la tabla 'compras' que ya NO EXISTE
// o ya no usarías para el registro de lotes de materias primas.
// Si necesitas que estas funciones también operen sobre 'lotes_materias_primas',
// o si 'compras' era una tabla genérica que todavía necesitas,
// tendremos que ajustarlas. Por ahora, las dejo como estaban en tu código original,
// pero ten en cuenta que podrían causar errores si la tabla 'compras' no existe.

exports.historialCompras = async (req, res) => {
  try {
    const { id } = req.params;

    // Esta consulta actualmente apunta a la tabla `compras`
    const query = `
      SELECT *
      FROM compras
      WHERE id_proveedor = ?
      ORDER BY fecha_compra DESC
    `;
    const [compras] = await pool.query(query, [id]);

    res.json(compras);

  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    res.status(500).json({ error: "Error al obtener historial", details: error.message });
  }
};

exports.compararPrecios = async (req, res) => {
  try {
    const { producto } = req.query;

    // Esta consulta actualmente apunta a la tabla `compras`
    const query = `
      SELECT
          c.*,
          p.nombre AS proveedor_nombre,
          p.informacion_contacto AS proveedor_contacto,
          p.direccion AS proveedor_direccion
      FROM
          compras c
      JOIN
          proveedores p ON c.id_proveedor = p.id
      WHERE
          c.producto = ?
      ORDER BY
          c.precio_unitario ASC;
    `;
    const [comprasConProveedor] = await pool.query(query, [producto]);

    res.json(comprasConProveedor);

  } catch (error) {
    console.error('Error al comparar precios:', error);
    res.status(500).json({ error: "Error al comparar precios", details: error.message });
  }
};