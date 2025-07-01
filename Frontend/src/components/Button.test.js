import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // <-- Importamos user-event
import '@testing-library/jest-dom';

// Tu componente de Botón (lo pongo aquí para que la prueba sea autocontenida)
const Button = ({ onClick, children }) => (
    <button onClick={onClick}>{children}</button>
);

describe('Pruebas para el componente Button', () => {
    it('debería mostrar el texto correcto y llamar a la función onClick', async () => {
        // Arrange
        const user = userEvent.setup(); // Configuramos el simulador de usuario
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Hacer Clic</Button>);

        const buttonElement = screen.getByText(/Hacer Clic/i);

        // Act: Simulamos un clic de usuario de forma asíncrona
        await user.click(buttonElement);

        // Assert
        expect(buttonElement).toBeInTheDocument();
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});