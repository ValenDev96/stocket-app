import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        try {
            const data = await resetPassword(token, password);
            toast.success(data.message + ' Serás redirigido al login.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            toast.error(error.message || 'No se pudo restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{width: '400px'}}>
                <h3>Nueva Contraseña</h3>
                <p>Ingresa tu nueva contraseña.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="password">Nueva Contraseña</label>
                        <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;