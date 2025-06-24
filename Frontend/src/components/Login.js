import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Login-V2.css';
import logoImage from '../assets/img/logoEM.jpg';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        contrasena: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. AÑADIMOS UN ESTADO PARA EL MENSAJE DE ERROR ---
    const [emailError, setEmailError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Limpiamos el error cuando el usuario empieza a corregir el campo
        if (e.target.name === 'email') {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError(''); // Limpiamos errores anteriores al intentar enviar

        // --- 2. AÑADIMOS LA LÓGICA DE VALIDACIÓN ---
        const emailRegex = /\S+@\S+\.\S+/; // Expresión regular simple para validar email
        if (!emailRegex.test(formData.email)) {
            setEmailError('Por favor, ingresa una dirección de correo válida.');
            return; // Detenemos el envío del formulario si hay un error
        }

        setIsSubmitting(true);
        try {
            await login(formData.email, formData.contrasena);
            toast.success('¡Bienvenido!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card-v2">
                <div className="logo-container">
                    <img src={logoImage} alt="Logo Stocket" />
                </div>
                <div className="card-header">
                    <h2>Bienvenido a Stocket</h2>
                    <p>Inicia sesión para continuar</p>
                </div>
                
                <form noValidate onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-control ${emailError ? 'is-invalid' : ''}`} // Clase condicional para el estilo del error
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            placeholder="ej: juan.perez@correo.com"
                        />
                        {/* --- 3. MOSTRAMOS EL MENSAJE DE ERROR PERSONALIZADO --- */}
                        {emailError && <div className="error-message">{emailError}</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena"
                            name="contrasena"
                            className="form-control"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn-login" disabled={isSubmitting}>
                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="card-footer">
                    <Link to="/forgot-password" className="forgot-password-link">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>

            <footer className="login-footer">
                <p>&copy; {new Date().getFullYear()} Stocket. Todos los derechos reservados.</p>
                <p>Desarrollado por Licet Zambrano, Miguel Guzman & Jhon Gomez.</p>
            </footer>
        </div>
    );
};

export default Login;