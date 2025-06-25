require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    password: '12345',
    host: 'localhost',
    port: 5432,
    database: 'Almacen'
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




// ============= RUTAS PARA ARTICULO (Nick) =============

// Obtener todos los artículos con información de línea
app.get('/articulos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, l.descripcion as linea_descripcion 
            FROM articulo a 
            JOIN linea l ON a.idlinea = l.idlinea 
            ORDER BY a.idarticulo
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener artículos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener un artículo específico
app.get('/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT a.*, l.descripcion as linea_descripcion 
            FROM articulo a 
            JOIN linea l ON a.idlinea = l.idlinea 
            WHERE a.idarticulo = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener artículo:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Obtener todas las líneas (para el select en el formulario)
app.get('/lineas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM linea ORDER BY idlinea');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener líneas:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Crear nuevo artículo
app.post('/articulos', async (req, res) => {
    try {
        const { idarticulo, descripcion, idlinea, unidad, stock, preciocosto, precioventa, descuento } = req.body;
        
        const result = await pool.query(`
            INSERT INTO articulo (idarticulo, descripcion, idlinea, unidad, stock, preciocosto, precioventa, descuento) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `, [idarticulo, descripcion, idlinea, unidad, stock, preciocosto, precioventa, descuento]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear artículo:', error);
        if (error.code === '23505') { // Código de error para clave duplicada
            res.status(400).json({ message: 'El código de artículo ya existe' });
        } else if (error.code === '23503') { // Código de error para foreign key
            res.status(400).json({ message: 'La línea especificada no existe' });
        } else {
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
});

// Actualizar artículo
app.put('/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, idlinea, unidad, stock, preciocosto, precioventa, descuento } = req.body;
        
        const result = await pool.query(`
            UPDATE articulo 
            SET descripcion = $1, idlinea = $2, unidad = $3, stock = $4, 
                preciocosto = $5, precioventa = $6, descuento = $7
            WHERE idarticulo = $8 
            RETURNING *
        `, [descripcion, idlinea, unidad, stock, preciocosto, precioventa, descuento, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar artículo:', error);
        if (error.code === '23503') {
            res.status(400).json({ message: 'La línea especificada no existe' });
        } else {
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
});

// Eliminar artículo
app.delete('/articulos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM articulo WHERE idarticulo = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }
        
        res.json({ message: 'Artículo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar artículo:', error);
        if (error.code === '23503') {
            res.status(400).json({ message: 'No se puede eliminar: el artículo está siendo usado en otras tablas' });
        } else {
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
});


app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});