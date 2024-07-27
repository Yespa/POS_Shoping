const express = require('express');
const router = express.Router();
const tiposController = require('../controllers/tiposController');


router.post('/tipos', tiposController.agregarTipo);
router.get('/tipos', tiposController.obtenerAllTipos);
router.get('/tipos/:id', tiposController.obtenerTipo);
router.delete('/tipos/:id', tiposController.eliminarTipo);
router.put('/tipos/:id', tiposController.actualizarTipo);


module.exports = router;
