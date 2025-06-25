import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

function App() {
    const [socios, setSocios] = useState([]);
    const [nombres, setNombres] = useState([]);
    const [rucs, setRucs] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/socios')
            .then((res) => {
                setSocios(res.data);
                setNombres(res.data.map((s) => s.nombre));
                setRucs(res.data.map((s) => s.ruc));
            })
            .catch((err) => {
                console.error('Error al obtener socios', err);
            });
    }, []);

    const chartOptions = {
        chart: {
            id: 'basic-bar'
        },
        xaxis: {
            categories: nombres
        }
    };

    const chartSeries = [
        {
            name: 'RUC',
            data: rucs.map(r => parseInt(r.slice(-3))) // último dígito del RUC (ejemplo numérico)
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Lista de Socios</h2>
            <table border="1" cellPadding="5">
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>RUC</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                </tr>
                </thead>
                <tbody>
                {socios.map((socio) => (
                    <tr key={socio.idsocio}>
                        <td>{socio.nombre}</td>
                        <td>{socio.ruc}</td>
                        <td>{socio.direccion}</td>
                        <td>{socio.telefono}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2>Gráfico de RUC (últimos 3 dígitos)</h2>
            <Chart options={chartOptions} series={chartSeries} type="bar" width="800" height="400" />
        </div>
    );
}

export default App;




/* logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/