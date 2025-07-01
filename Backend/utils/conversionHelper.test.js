// Contenido para: Backend/utils/conversionHelper.test.js

const { convertirUnidad } = require('./conversionHelper');

// 'describe' agrupa pruebas relacionadas
describe('Pruebas para la función convertirUnidad', () => {

    // 'it' o 'test' define una prueba individual
    it('debería convertir gramos a kilogramos correctamente', () => {
        // 1. Organizar (Arrange): Preparamos los datos de entrada.
        const cantidadEnGramos = 1500;
        const esperadoEnKilos = 1.5;

        // 2. Actuar (Act): Ejecutamos la función que queremos probar.
        const resultado = convertirUnidad(cantidadEnGramos, 'g', 'kg');

        // 3. Afirmar (Assert): Verificamos que el resultado es el que esperamos.
        expect(resultado).toBe(esperadoEnKilos);
    });

    it('debería devolver la misma cantidad si las unidades son iguales', () => {
        expect(convertirUnidad(100, 'kg', 'kg')).toBe(100);
    });

    it('debería convertir kilos a gramos correctamente', () => {
        expect(convertirUnidad(2.5, 'kg', 'g')).toBe(2500);
    });
});