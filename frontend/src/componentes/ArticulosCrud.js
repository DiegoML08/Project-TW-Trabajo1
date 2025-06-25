import React, { useState, useEffect } from 'react';
import './ArticulosCrud.css';

const ArticulosCrud = () => {
    const [articulos, setArticulos] = useState([]);
    const [lineas, setLineas] = useState([]);
    const [formulario, setFormulario] = useState({
        idarticulo: '',
        descripcion: '',
        idlinea: '',
        unidad: '',
        stock: '',
        preciocosto: '',
        precioventa: '',
        descuento: ''
    });
    const [editando, setEditando] = useState(false);
    const [articuloOriginal, setArticuloOriginal] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarArticulos();
        cargarLineas();
    }, []);

    // Función para cargar todos los artículos
    const cargarArticulos = async () => {
        try {
            setCargando(true);
            const response = await fetch('http://localhost:5000/articulos');
            if (response.ok) {
                const data = await response.json();
                setArticulos(data);
            } else {
                setError('Error al cargar los artículos');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
            console.error('Error:', error);
        } finally {
            setCargando(false);
        }
    };

    // Función para cargar todas las líneas
    const cargarLineas = async () => {
        try {
            const response = await fetch('http://localhost:5000/lineas');
            if (response.ok) {
                const data = await response.json();
                setLineas(data);
            }
        } catch (error) {
            console.error('Error al cargar líneas:', error);
        }
    };

    // Manejar cambios en el formulario
    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormulario({
            idarticulo: '',
            descripcion: '',
            idlinea: '',
            unidad: '',
            stock: '',
            preciocosto: '',
            precioventa: '',
            descuento: ''
        });
        setEditando(false);
        setArticuloOriginal('');
        setMostrarFormulario(false);
        setError('');
        setMensaje('');
    };

    // Función para crear un nuevo artículo
    const crearArticulo = async (e) => {
        e.preventDefault();
        try {
            setCargando(true);
            setError('');

            const response = await fetch('http://localhost:5000/articulos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formulario,
                    stock: parseInt(formulario.stock),
                    preciocosto: parseFloat(formulario.preciocosto),
                    precioventa: parseFloat(formulario.precioventa),
                    descuento: parseFloat(formulario.descuento)
                }),
            });

            if (response.ok) {
                setMensaje('Artículo creado exitosamente');
                limpiarFormulario();
                cargarArticulos();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al crear el artículo');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
            console.error('Error:', error);
        } finally {
            setCargando(false);
        }
    };

    // Función para editar un artículo
    const editarArticulo = (articulo) => {
        setFormulario({
            idarticulo: articulo.idarticulo,
            descripcion: articulo.descripcion,
            idlinea: articulo.idlinea,
            unidad: articulo.unidad,
            stock: articulo.stock.toString(),
            preciocosto: articulo.preciocosto.toString(),
            precioventa: articulo.precioventa.toString(),
            descuento: articulo.descuento.toString()
        });
        setArticuloOriginal(articulo.idarticulo);
        setEditando(true);
        setMostrarFormulario(true);
        setError('');
        setMensaje('');
    };

    // Función para actualizar un artículo
    const actualizarArticulo = async (e) => {
        e.preventDefault();
        try {
            setCargando(true);
            setError('');

            const response = await fetch(`http://localhost:5000/articulos/${articuloOriginal}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    descripcion: formulario.descripcion,
                    idlinea: formulario.idlinea,
                    unidad: formulario.unidad,
                    stock: parseInt(formulario.stock),
                    preciocosto: parseFloat(formulario.preciocosto),
                    precioventa: parseFloat(formulario.precioventa),
                    descuento: parseFloat(formulario.descuento)
                }),
            });

            if (response.ok) {
                setMensaje('Artículo actualizado exitosamente');
                limpiarFormulario();
                cargarArticulos();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Error al actualizar el artículo');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
            console.error('Error:', error);
        } finally {
            setCargando(false);
        }
    };

    // Función para eliminar un artículo
    const eliminarArticulo = async (idarticulo, descripcion) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el artículo "${descripcion}"?`)) {
            try {
                setCargando(true);
                const response = await fetch(`http://localhost:5000/articulos/${idarticulo}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setMensaje('Artículo eliminado exitosamente');
                    cargarArticulos();
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Error al eliminar el artículo');
                }
            } catch (error) {
                setError('Error de conexión con el servidor');
                console.error('Error:', error);
            } finally {
                setCargando(false);
            }
        }
    };

    // Función para obtener el nombre de la línea
    const obtenerNombreLinea = (idlinea) => {
        const linea = lineas.find(l => l.idlinea === idlinea);
        return linea ? linea.descripcion : idlinea;
    };

    return (
        <div className="articulos-crud">
            <div className="header">
                <h2>Gestión de Artículos</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    {mostrarFormulario ? 'Cancelar' : 'Nuevo Artículo'}
                </button>
            </div>

            {/* Mensajes */}
            {error && <div className="alert alert-error">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}

            {/* Formulario */}
            {mostrarFormulario && (
                <div className="formulario-container">
                    <h3>{editando ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
                    <form onSubmit={editando ? actualizarArticulo : crearArticulo}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Código del Artículo:</label>
                                <input
                                    type="text"
                                    name="idarticulo"
                                    value={formulario.idarticulo}
                                    onChange={manejarCambio}
                                    placeholder="ej: ELE00006"
                                    maxLength="8"
                                    required
                                    disabled={editando}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <input
                                    type="text"
                                    name="descripcion"
                                    value={formulario.descripcion}
                                    onChange={manejarCambio}
                                    placeholder="Descripción del artículo"
                                    maxLength="35"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Línea:</label>
                                <select
                                    name="idlinea"
                                    value={formulario.idlinea}
                                    onChange={manejarCambio}
                                    required
                                >
                                    <option value="">Seleccionar línea</option>
                                    {lineas.map(linea => (
                                        <option key={linea.idlinea} value={linea.idlinea}>
                                            {linea.idlinea} - {linea.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Unidad:</label>
                                <input
                                    type="text"
                                    name="unidad"
                                    value={formulario.unidad}
                                    onChange={manejarCambio}
                                    placeholder="ej: unidades, kg, litros"
                                    maxLength="10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Stock:</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formulario.stock}
                                    onChange={manejarCambio}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio Costo:</label>
                                <input
                                    type="number"
                                    name="preciocosto"
                                    value={formulario.preciocosto}
                                    onChange={manejarCambio}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Precio Venta:</label>
                                <input
                                    type="number"
                                    name="precioventa"
                                    value={formulario.precioventa}
                                    onChange={manejarCambio}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Descuento:</label>
                                <input
                                    type="number"
                                    name="descuento"
                                    value={formulario.descuento}
                                    onChange={manejarCambio}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-success" disabled={cargando}>
                                {cargando ? 'Procesando...' : (editando ? 'Actualizar' : 'Crear')}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla de artículos */}
            <div className="tabla-container">
                <h3>Lista de Artículos</h3>
                {cargando && <p>Cargando artículos...</p>}
                
                {!cargando && articulos.length === 0 && (
                    <p>No hay artículos registrados.</p>
                )}

                {!cargando && articulos.length > 0 && (
                    <table className="tabla-articulos">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Línea</th>
                                <th>Unidad</th>
                                <th>Stock</th>
                                <th>Precio Costo</th>
                                <th>Precio Venta</th>
                                <th>Descuento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articulos.map((articulo) => (
                                <tr key={articulo.idarticulo}>
                                    <td>{articulo.idarticulo}</td>
                                    <td>{articulo.descripcion}</td>
                                    <td>{obtenerNombreLinea(articulo.idlinea)}</td>
                                    <td>{articulo.unidad}</td>
                                    <td>{articulo.stock}</td>
                                    <td>S/. {parseFloat(articulo.preciocosto).toFixed(2)}</td>
                                    <td>S/. {parseFloat(articulo.precioventa).toFixed(2)}</td>
                                    <td>{parseFloat(articulo.descuento).toFixed(2)}%</td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="btn btn-edit"
                                                onClick={() => editarArticulo(articulo)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-delete"
                                                onClick={() => eliminarArticulo(articulo.idarticulo, articulo.descripcion)}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ArticulosCrud;