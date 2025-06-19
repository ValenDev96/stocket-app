const pool = require('../config/db');

// Obtener todas las horas trabajadas con filtros
exports.obtenerTodas = async (req, res) => {
    try {
        const { empleado_id, rol, fecha_inicio, fecha_fin } = req.query;
        
        let query = `
            SELECT 
                ht.id,
                ht.empleado_id as usuario_id,
                DATE(ht.fecha_hora_ingreso) as fecha,
                TIME(ht.fecha_hora_ingreso) as hora_inicio,
                TIME(ht.fecha_hora_salida) as hora_fin,
                ht.horas_trabajadas as total_horas,
                ht.descripcion,
                u.nombre_usuario as usuario_nombre,
                r.nombre_rol as rol_empleado,
                ht.fecha_hora_ingreso,
                ht.fecha_hora_salida
            FROM registro_horas ht
            LEFT JOIN usuarios u ON ht.empleado_id = u.id
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Aplicar filtros
        if (empleado_id) {
            query += ' AND ht.empleado_id = ?';
            params.push(empleado_id);
        }
        
        if (rol) {
            query += ' AND r.nombre_rol = ?';
            params.push(rol);
        }
        
        if (fecha_inicio) {
            query += ' AND DATE(ht.fecha_hora_ingreso) >= ?';
            params.push(fecha_inicio);
        }
        
        if (fecha_fin) {
            query += ' AND DATE(ht.fecha_hora_salida) <= ?';
            params.push(fecha_fin);
        }
        
        query += ' ORDER BY ht.fecha_hora_ingreso DESC';
        
        const [horasTrabajadas] = await pool.query(query, params);
        
        // Procesar los datos para asegurar el formato correcto
        const horasFormateadas = horasTrabajadas.map(hora => ({
            ...hora,
            fecha: hora.fecha ? new Date(hora.fecha).toISOString().split('T')[0] : null,
            total_horas: hora.total_horas || calcularHoras(hora.hora_inicio, hora.hora_fin)
        }));
        
        res.status(200).json(horasFormateadas);
        
    } catch (error) {
        console.error("Error al obtener horas trabajadas:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener horas trabajadas por usuario específico
exports.obtenerPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        
        const query = `
            SELECT 
                ht.id,
                ht.empleado_id as usuario_id,
                DATE(ht.fecha_hora_ingreso) as fecha,
                TIME(ht.fecha_hora_ingreso) as hora_inicio,
                TIME(ht.fecha_hora_salida) as hora_fin,
                ht.horas_trabajadas as total_horas,
                ht.descripcion,
                u.nombre_usuario as usuario_nombre,
                r.nombre_rol as rol_empleado
            FROM registro_horas ht
            LEFT JOIN usuarios u ON ht.empleado_id = u.id
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE ht.empleado_id = ?
            ORDER BY ht.fecha_hora_ingreso DESC
        `;
        
        const [horasTrabajadas] = await pool.query(query, [usuario_id]);
        
        // Procesar los datos para asegurar el formato correcto
        const horasFormateadas = horasTrabajadas.map(hora => ({
            ...hora,
            fecha: hora.fecha ? new Date(hora.fecha).toISOString().split('T')[0] : null,
            total_horas: hora.total_horas || calcularHoras(hora.hora_inicio, hora.hora_fin)
        }));
        
        res.status(200).json(horasFormateadas);
        
    } catch (error) {
        console.error("Error al obtener horas trabajadas por usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear un registro de horas trabajadas
exports.crear = async (req, res) => {
    try {
        const { usuario_id, fecha, hora_inicio, hora_fin, descripcion } = req.body;
        
        console.log('Datos recibidos:', { usuario_id, fecha, hora_inicio, hora_fin, descripcion });
        
        // Validar datos requeridos
        if (!usuario_id || !fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos: usuario_id, fecha, hora_inicio, hora_fin' 
            });
        }
        
        // Construir las fechas completas
        const fecha_hora_ingreso = `${fecha} ${hora_inicio}:00`;
        const fecha_hora_salida = `${fecha} ${hora_fin}:00`;
        
        // Calcular horas trabajadas
        const horas_trabajadas = calcularHoras(hora_inicio, hora_fin);
        
        console.log('Fechas construidas:', { fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas });
        
        // Insertar en la base de datos
        const [result] = await pool.query(
            `INSERT INTO registro_horas (empleado_id, fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas, descripcion) 
             VALUES (?, ?, ?, ?, ?)`,
            [usuario_id, fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas, descripcion || null]
        );
        
        // Devolver el registro creado con el formato esperado por el frontend
        const nuevoRegistro = {
            id: result.insertId,
            usuario_id,
            fecha,
            hora_inicio,
            hora_fin,
            total_horas: horas_trabajadas,
            descripcion: descripcion || null
        };
        
        res.status(201).json(nuevoRegistro);
        
    } catch (error) {
        console.error("Error al crear horas trabajadas:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Actualizar un registro de horas trabajadas
exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id, fecha, hora_inicio, hora_fin, descripcion } = req.body;
        
        // Validar datos requeridos
        if (!usuario_id || !fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos: usuario_id, fecha, hora_inicio, hora_fin' 
            });
        }
        
        // Construir las fechas completas
        const fecha_hora_ingreso = `${fecha} ${hora_inicio}:00`;
        const fecha_hora_salida = `${fecha} ${hora_fin}:00`;
        
        // Calcular horas trabajadas
        const horas_trabajadas = calcularHoras(hora_inicio, hora_fin);
        
        // Actualizar en la base de datos
        await pool.query(
            `UPDATE registro_horas 
             SET empleado_id = ?, fecha_hora_ingreso = ?, fecha_hora_salida = ?, horas_trabajadas = ?, descripcion = ?
             WHERE id = ?`,
            [usuario_id, fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas, descripcion || null, id]
        );
        
        res.status(200).json({ 
            message: 'Registro actualizado exitosamente',
            id,
            usuario_id,
            fecha,
            hora_inicio,
            hora_fin,
            total_horas: horas_trabajadas,
            descripcion
        });
        
    } catch (error) {
        console.error("Error al actualizar horas trabajadas:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar un registro de horas trabajadas
exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query('DELETE FROM registro_horas WHERE id = ?', [id]);
        
        res.status(200).json({ message: 'Registro eliminado exitosamente' });
        
    } catch (error) {
        console.error("Error al eliminar horas trabajadas:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función auxiliar para calcular horas trabajadas
function calcularHoras(hora_inicio, hora_fin) {
    if (!hora_inicio || !hora_fin) return 0;
    
    const [horaIni, minIni] = hora_inicio.split(':').map(Number);
    const [horaFin, minFin] = hora_fin.split(':').map(Number);
    
    const inicioEnMinutos = horaIni * 60 + minIni;
    let finEnMinutos = horaFin * 60 + minFin;
    
    // Si la hora de fin es menor que la de inicio, asumimos que cruzó medianoche
    if (finEnMinutos < inicioEnMinutos) {
        finEnMinutos += 24 * 60; // Agregar 24 horas
    }
    
    const diferenciaEnMinutos = finEnMinutos - inicioEnMinutos;
    const horas = Math.floor(diferenciaEnMinutos / 60);
    const minutos = diferenciaEnMinutos % 60;
    
    return `${horas}:${minutos.toString().padStart(2, '0')}`;
}