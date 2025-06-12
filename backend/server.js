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

// Obtener contactos
app.get('/contactos', async (req, res) => {
    const result = await pool.query('SELECT * FROM contactos');
    res.json(result.rows);
});

// Agregar contacto
app.post('/contactos', async (req, res) => {
    const { nombre, telefono } = req.body;
    const result = await pool.query('INSERT INTO contactos (nombre, telefono) VALUES ($1, $2) RETURNING *', [nombre, telefono]);
    res.json(result.rows[0]);
});

// Eliminar contacto
app.delete('/contactos/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM contactos WHERE id = $1', [id]);
    res.sendStatus(204);
});

app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});
