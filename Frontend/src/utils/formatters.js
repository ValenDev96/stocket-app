
/**
 * Formatea un número como moneda en Pesos Colombianos (COP).
 * Ejemplo: 15000 -> "$ 15.000"
 * @param {number | string} amount - La cantidad a formatear.
 * @returns {string} El valor formateado como moneda.
 */
export const formatCurrency = (amount) => {
  const number = Number(amount);
  if (isNaN(number)) {
    return '$ 0'; // Devuelve un valor por defecto si no es un número
  }

  // Usamos el locale 'es-CO' para el formato colombiano (punto para miles, coma para decimales)
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0, // No mostrar centavos si son .00
    maximumFractionDigits: 0, // Puedes cambiarlo a 2 si necesitas centavos
  });

  return formatter.format(number);
};

/**
 * Formatea un número genérico con separadores de miles.
 * Ejemplo: 1250.5 -> "1.250,5"
 * @param {number | string} quantity - La cantidad a formatear.
 * @returns {string} El número formateado.
 */
export const formatQuantity = (quantity) => {
  const number = Number(quantity);
  if (isNaN(number)) {
    return '0';
  }

  const formatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // Permite hasta 2 decimales para cantidades
  });

  return formatter.format(number);
};