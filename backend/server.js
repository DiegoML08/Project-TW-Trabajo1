require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// He cambiado la palabara "contactos" a "socios" porque esta tabla si existe en la base de datos ~DiegoDev

// Obtener contactos/socios
app.get('/socios', async (req, res) => {
    const result = await pool.query('SELECT * FROM socio');
    res.json(result.rows);
});

// Agregar contacto/socios
app.post('/socios', async (req, res) => {
    const { nombre, telefono } = req.body;
    const result = await pool.query(
        'INSERT INTO socio (nombre, telefono) VALUES ($1, $2) RETURNING *', [nombre, telefono]
    );
    res.json(result.rows[0]);
});


// Eliminar contacto/socios
app.delete('/socios/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM socio WHERE idsocio = $1', [id]);
    res.sendStatus(204);
});


app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});

// Endpoint para login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario con el email proporcionado
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        // Verificar si existe el usuario y la contraseña es correcta
        if (result.rows.length === 0 || result.rows[0].contraseña !== password) {
            return res.status(401).json({ message: "Email o contraseña incorrectos" });
        }

        // Usuario autenticado correctamente
        const token = "auth_" + Date.now(); // En producción usar JWT
        res.json({ success: true, token, message: "Inicio de sesión exitoso" });

    } catch (error) {
        console.error("Error en autenticación:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) Verificar que el email no exista ya
        const { rows } = await pool.query(
            'SELECT 1 FROM usuarios WHERE email = $1',
            [email]
        );
        if (rows.length) {
            return res
                .status(409)
                .json({ success: false, message: 'El email ya está registrado' });
        }

        // 2) Insertar usuario
        const result = await pool.query(
            'INSERT INTO usuarios (email, contraseña) VALUES ($1, $2) RETURNING id, email',
            [email, password]
        );

        // 3) Responder con éxito
        res
            .status(201)
            .json({ success: true, user: result.rows[0], message: 'Usuario creado' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});