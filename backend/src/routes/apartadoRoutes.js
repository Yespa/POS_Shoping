const express = require('express');
const router = express.Router();
const apartadoController = require('../controllers/apartadoController');

router.post('/apartados', apartadoController.crearApartado);
router.get('/apartados/all', apartadoController.obtenerApartadoLimitados);
router.get('/apartados/buscar', apartadoController.buscarApartadosLimitados);
router.get('/apartados/totalesApartados', apartadoController.sumarApartadosPendientes);
router.get('/apartados/totalTransferenciaXBanco', apartadoController.sumarPagoTransferenciaPorBancoEnPendiente);
router.get('/apartados/:id', apartadoController.obtenerApartado);
router.put('/apartados/:id', apartadoController.actualizarApartado);
router.delete('/apartados/:id', apartadoController.eliminarApartado);

module.exports = router;
