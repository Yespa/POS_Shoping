const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');


router.post('/clientes', clienteController.agregarCliente);
router.get('/clientes/all', clienteController.obtenerClientesLimitados);
router.get('/clientes/buscar', clienteController.buscarClienteNombreLimitados);
router.get('/clientes/:id', clienteController.obtenerCliente);
router.delete('/clientes/:id', clienteController.eliminarCliente);
router.put('/clientes/:id', clienteController.actualizarCliente);


module.exports = router;
