import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './login.css'; // reutilizamos los mismos estilos

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!email || !password || !password2) {
            setError('Completa todos los campos');
            return;
        }
        if (password !== password2) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            setError('');
            const response = await axios.post(
                `${API_BASE_URL}/register`,
                { email, password }
            );

            if (response.data.success) {
                alert('Usuario registrado exitosamente');
                navigate('/'); // volver al login
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setError('El email ya está registrado');
            } else {
                setError('Error al conectar con el servidor');
                console.error(err);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left">
                    <h2>Registro</h2>
                    {error && <div className="error-message">{error}</div>}

                    <div className="login-field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="login-field">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="login-field">
                        <label>Repetir contraseña</label>
                        <input
                            type="password"
                            placeholder="Repetir contraseña"
                            value={password2}
                            onChange={e => setPassword2(e.target.value)}
                        />
                    </div>

                    <button
                        className="login-button"
                        onClick={handleRegister}
                    >
                        Registrar
                    </button>

                    <button
                        className="login-button"
                        style={{ marginTop: '10px', background: '#aaa' }}
                        onClick={() => navigate('/')}
                    >
                        Cancelar
                    </button>
                </div>

                <div className="login-right">
                    <h3>Bienvenido a TecnoHogar</h3>
                    <p>Comienza tu experiencia con nosotros hoy mismo.</p>
                    <img
                        src="/logoTecnoHogar.PNG"
                        alt="Logo TecnoHogar"
                        className="logo-img"
                    />
                </div>
            </div>
        </div>
    );
}

export default Register;
