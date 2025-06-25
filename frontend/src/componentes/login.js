import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './login.css';
import { Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            setError('');
            const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                alert('Inicio de sesión exitoso en TecnoHogar');
                // Aquí podrías redirigir al usuario a otra página
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Email o contraseña incorrectos');
            } else {
                setError('Error al conectar con el servidor');
                console.error(error);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left">
                    <h2>Iniciar sesión</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="login-field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="login-field">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="***********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="login-button" onClick={handleLogin}>
                        Iniciar sesión
                    </button>
                    <p className="login-footer">
                        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                    </p>
                </div>
                <div className="login-right">
                    <h3>Bienvenido a TecnoHogar</h3>
                    <p>Comienza tu experiencia con nosotros hoy mismo.</p>
                    <img src="/logoTecnoHogar.PNG" alt="Logo TecnoHogar" className="logo-img" />
                </div>
            </div>
        </div>
    );
}

export default Login;