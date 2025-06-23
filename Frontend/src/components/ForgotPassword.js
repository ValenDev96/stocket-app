import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const data = await forgotPassword(email);
            setMessage(data.message);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || 'Error al enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{width: '400px'}}>
                <h3>Restablecer Contraseña</h3>
                <p>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    {message && <div className="alert alert-info">{message}</div>}
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/login">Volver a Iniciar Sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;