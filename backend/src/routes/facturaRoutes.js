const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

router.post('/facturas', facturaController.crearFactura);
router.get('/facturas/all', facturaController.obtenerFacturasLimitados);
router.get('/facturas/buscar', facturaController.buscarFacturasLimitados);
router.get('/facturas/totalFacturas', facturaController.sumarTotalFacturas);
router.get('/facturas/totalTransferenciaXBanco', facturaController.sumarPagoTransferenciaPorBanco);
router.get('/facturas/utilidad', facturaController.totalesProductosUtilidad);
router.get('/facturas/topMax', facturaController.obtenerProductosMasVendidos);
router.get('/facturas/topMin', facturaController.obtenerProductosMenosVendidos);
router.get('/facturas/topUtilidad', facturaController.obtenerProductosMasUtilidad);
router.get('/facturas/tiposUtilidad', facturaController.agruparProductosPorTipoYUtilidad);
router.get('/facturas/totalFacturaMes', facturaController.obtenerTotalFacturasPorMes);
router.get('/facturas/totalUtilidadMes', facturaController.obtenerUtilidadPorMes);
router.get('/facturas/:id', facturaController.obtenerFactura);
router.put('/facturas/:id', facturaController.actualizarFactura);
router.delete('/facturas/:id', facturaController.eliminarFactura);

module.exports = router;
