require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./src/db/mongoose');
const productoRoutes = require('./src/routes/productoRoutes');
const apartadoRoutes = require('./src/routes/apartadoRoutes');
const facturaRoutes = require('./src/routes/facturaRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const tiposRoutes = require('./src/routes/tiposRoutes');
const gastoRoutes = require('./src/routes/gastoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();

// Lista de IPs permitidas
const allowedIps = ['http://127.0.0.1:5001', 'http://localhost:5001', 'http://127.0.0.1:5173', 'http://localhost:5173', 'http://192.168.1.1:3000']

// Configuración de CORS para permitir múltiples IPs
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedIps.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
};

// Usar la configuración de CORS en la aplicación
app.use(cors(corsOptions));

// Conectar a la base de datos
connectDB();

// Middleware para parsear el body de tipo JSON
app.use(express.json()); // para parsear body de tipo JSON

// Servir archivos estáticos
app.use(express.static('public'));

// Rutas de la API
app.use('/api', productoRoutes);
app.use('/api', facturaRoutes);
app.use('/api', apartadoRoutes);
app.use('/api', clienteRoutes);
app.use('/api', tiposRoutes);
app.use('/api', gastoRoutes);
app.use('/api', usuarioRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
