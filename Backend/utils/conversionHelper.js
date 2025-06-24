// Contenido para: Backend/utils/conversionHelper.js

/**
 * Convierte una cantidad de una unidad de medida a otra.
 * @param {number} cantidad - La cantidad a convertir.
 * @param {string} unidadOrigen - La unidad original (ej. 'g', 'kg', 'ml', 'L').
 * @param {string} unidadDestino - La unidad a la que se quiere convertir.
 * @returns {number} La cantidad en la unidad de destino.
 */
const convertirUnidad = (cantidad, unidadOrigen, unidadDestino) => {
    if (unidadOrigen === unidadDestino) {
        return cantidad; // No se necesita conversión
    }

    // De gramos a kilos
    if (unidadOrigen === 'g' && unidadDestino === 'kg') {
        return cantidad / 1000;
    }
    // De kilos a gramos
    if (unidadOrigen === 'kg' && unidadDestino === 'g') {
        return cantidad * 1000;
    }
    // De mililitros a litros
    if (unidadOrigen === 'ml' && unidadDestino === 'L') {
        return cantidad / 1000;
    }
    // De litros a mililitros
    if (unidadOrigen === 'L' && unidadDestino === 'ml') {
        return cantidad * 1000;
    }
    
    // Si no hay una regla de conversión, asumimos que no es necesaria (ej. 'unidades' a 'unidades')
    // En un sistema más complejo, aquí se podría lanzar un error.
    console.warn(`No se encontró una regla de conversión de '${unidadOrigen}' a '${unidadDestino}'. Se asumió conversión 1:1.`);
    return cantidad;
};

module.exports = { convertirUnidad };   