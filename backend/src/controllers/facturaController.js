const Factura = require('../models/Factura');

function convertirCOTaUTC(fechaLocal) {
  const fecha = new Date(fechaLocal);

  fecha.setHours(fecha.getHours() + 5);

  const fechaUTC = fecha.toISOString().split('.')[0] + "Z";
  return fechaUTC;
}


// Crear una nueva factura
exports.crearFactura = async (req, res) => {
  try {
    const nuevaFactura = new Factura(req.body);
    const facturaGuardada = await nuevaFactura.save();
    res.status(201).json(facturaGuardada);
  } catch (error) {
    console.log(error)
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener una factura por ID
exports.obtenerFactura = async (req, res) => {
    try {
      const { id } = req.params;
      const factura = await Factura.findById(id).populate('items.producto');
      if (!factura) {
          res.status(404).json({ mensaje: 'Factura no encontrada' });
      } else {
          res.status(200).json(factura);
      }
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

// Actualizar una factura
exports.actualizarFactura = async (req, res) => {
    try {
      const { id } = req.params;
      const facturaActualizada = await Factura.findByIdAndUpdate(id, req.body, { new: true });
      if (!facturaActualizada) res.status(404).json({ mensaje: 'Factura no encontrada' });
      res.status(200).json(facturaActualizada);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };
  
  // Eliminar una factura
  exports.eliminarFactura = async (req, res) => {
    try {
      const { id } = req.params;
      const facturaEliminada = await Factura.findByIdAndDelete(id);
      if (!facturaEliminada) res.status(404).json({ mensaje: 'Factura no encontrada' });
      res.status(200).json({ mensaje: 'Factura eliminada' });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

  // Obtener facturas con límite especificado en la consulta
  exports.obtenerFacturasLimitados = async (req, res) => {
    try {
      // Obtener el límite de la solicitud y aplicar un límite máximo de 100
      let limite = parseInt(req.query.limite) || 10;
      limite = Math.min(limite, 100); // Asegura que el límite no exceda 100

      // const facturas = await Factura.find().limit(limite);
      const facturas = await Factura.find().sort({fechaVenta: -1}).limit(limite);

      res.status(200).json(facturas);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

  // Obtener facturas con limite por id y fecha
  exports.buscarFacturasLimitados = async (req, res) => {
    try {
      const { id, fechaInicio, fechaFin } = req.query;
      let query = {};

      if (id){
        query._id = id ;
      } else if (fechaInicio && fechaFin) {
        const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
        const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));
  
        query.fechaVenta = {
            $gte: fechaInicioUTC,
            $lte: fechaFinUTC
          }
      }
  
      const fechas = await Factura.find(query).sort({fecha: -1}).limit(50);
      res.json(fechas);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

  // Obtener la suma total de 'totalFactura' en un rango de fechas
  exports.sumarTotalFacturas = async (req, res) => {
    try {
      // Convertir fechas de entrada a UTC si es necesario
      const fechaInicio = new Date(convertirCOTaUTC(req.query.fechaInicio));
      const fechaFin = new Date(convertirCOTaUTC(req.query.fechaFin));
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: fechaInicio,
              $lte: fechaFin
            }
          }
        },
        {
          $group: {
            _id: null, // Agrupar todos los documentos juntos
            sumaTotalFactura: { $sum: '$totalFactura' },
            totalPagoEfectivo: { $sum: '$pagoEfectivo' }, // Sumar total de pagoEfectivo
            totalPagoTransferencia: { $sum: '$pagoTransferencia' } // Sumar total de pagoTransferencia
          }
        }
      ]);
  
      if (resultado.length > 0) {
        res.status(200).json({
          sumaTotal: resultado[0].sumaTotalFactura,
          totalPagoEfectivo: resultado[0].totalPagoEfectivo,
          totalPagoTransferencia: resultado[0].totalPagoTransferencia
        });
      } else {
        res.status(200).json({
          sumaTotal: 0,
          totalPagoEfectivo: 0,
          totalPagoTransferencia: 0
        });      }
    } catch (error) {
      console.error('Error al obtener la suma de totalFactura y totales de pagos:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };

  exports.sumarPagoTransferenciaPorBanco = async (req, res) => {
    try {
      // Convertir fechas de entrada a UTC
      const fechaInicio = new Date(convertirCOTaUTC(req.query.fechaInicio));
      const fechaFin = new Date(convertirCOTaUTC(req.query.fechaFin));
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: fechaInicio,
              $lte: fechaFin
            }
          }
        },
        {
          $group: {
            _id: '$banco', // Agrupa por el campo 'banco'
            totalPagoTransferencia: { $sum: '$pagoTransferencia' } // Suma 'pagoTransferencia' para cada banco
          }
        },
        {
          $sort: {
            totalPagoTransferencia: -1 // Opcional: ordena los resultados por totalPagoTransferencia descendente
          }
        }
      ]);
  
      // Transformar el resultado en el formato deseado {NombreBanco: SumaTotalTransferencia}
      const formatoDeseado = resultado.reduce((acc, curr) => {
        acc[curr._id] = curr.totalPagoTransferencia;
        return acc;
      }, {});
  
      res.status(200).json(formatoDeseado);
  
    } catch (error) {
      console.error('Error al sumar pagoTransferencia por banco:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };


  exports.totalesProductosUtilidad = async (req, res) => {
    try {
        // Convertir fechas de entrada a UTC si es necesario
        const fechaInicio = new Date(convertirCOTaUTC(req.query.fechaInicio));
        const fechaFin = new Date(convertirCOTaUTC(req.query.fechaFin));

        const resultado = await Factura.aggregate([
            {
                $match: {
                    fechaVenta: {
                        $gte: fechaInicio,
                        $lte: fechaFin
                    }
                }
            },
            {
                $unwind: '$productosVendidos' // Descomponer el array de productos vendidos
            },
            {
                $group: {
                    _id: null, // Agrupar todos los documentos juntos
                    sumaPrecioInventario: {
                        $sum: {
                            $multiply: ["$productosVendidos.precio_inventario", "$productosVendidos.cantidad"]
                        }
                    },
                    sumaPrecioUnitarioVenta: {
                        $sum: {
                            $multiply: ["$productosVendidos.precio_unitario_venta", "$productosVendidos.cantidad"]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    sumaPrecioInventario: 1,
                    sumaPrecioUnitarioVenta: 1,
                    diferencia: { $subtract: ['$sumaPrecioUnitarioVenta', '$sumaPrecioInventario'] }
                }
            }
        ]);

        if (resultado.length > 0) {
            res.status(200).json(resultado[0]);
        } else {
          res.status(200).json({
            sumaPrecioInventario: 0,
            sumaPrecioUnitarioVenta: 0,
            diferencia: 0
          });        }
    } catch (error) {
        console.error('Error al obtener las sumas y calcular la diferencia con la cantidad:', error);
        res.status(500).json({ mensaje: error.message });
    }
  };

  exports.obtenerProductosMasVendidos = async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
      const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: fechaInicioUTC,
              $lte: fechaFinUTC
            }
          }
        },
        { $unwind: '$productosVendidos' },
        {
          $group: {
            _id: '$productosVendidos._id',
            nombre: { $first: '$productosVendidos.nombre' },
            totalVendido: { $sum: '$productosVendidos.cantidad' }
          }
        },
        { $sort: { totalVendido: -1 } },
        { $limit: 5 }
      ]);
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener los productos más vendidos:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };
  

  exports.obtenerProductosMenosVendidos = async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
      const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: fechaInicioUTC,
              $lte: fechaFinUTC
            }
          }
        },
        { $unwind: '$productosVendidos' },
        {
          $group: {
            _id: '$productosVendidos._id',
            nombre: { $first: '$productosVendidos.nombre' },
            totalVendido: { $sum: '$productosVendidos.cantidad' }
          }
        },
        { $sort: { totalVendido: 1 } },
        { $limit: 5 }
      ]);
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener los productos menos vendidos:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };
  
  exports.obtenerProductosMasUtilidad = async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
      const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: fechaInicioUTC,
              $lte: fechaFinUTC
            }
          }
        },
        { $unwind: "$productosVendidos" },
        {
          $addFields: {
            "productosVendidos.utilidad": {
              $subtract: [
                "$productosVendidos.precio_unitario_venta",
                "$productosVendidos.precio_inventario"
              ]
            }
          }
        },
        {
          $group: {
            _id: "$productosVendidos._id",
            nombre: { $first: "$productosVendidos.nombre" },
            totalUtilidad: { $sum: "$productosVendidos.utilidad" }
          }
        },
        { $sort: { totalUtilidad: -1 } },
        { $limit: 5 }
      ]);
  
      res.status(200).json(resultado);
      
    } catch (error) {
      console.error('Error al obtener el top 5 de productos con más utilidad:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };

  exports.agruparProductosPorTipoYUtilidad = async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
      const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: fechaInicioUTC,
              $lte: fechaFinUTC
            }
          }
        },
        { $unwind: "$productosVendidos" },
        {
          $project: {
            tipo_producto: "$productosVendidos.tipo_producto",
            utilidadPorProducto: {
              $multiply: [
                { $subtract: ["$productosVendidos.precio_unitario_venta", "$productosVendidos.precio_inventario"] },
                "$productosVendidos.cantidad"
              ]
            }
          }
        },
        {
          $group: {
            _id: "$tipo_producto",
            totalUtilidad: { $sum: "$utilidadPorProducto" }
          }
        },
        { $sort: { totalUtilidad: -1 } } // Opcional: Ordenar por totalUtilidad de forma descendente
      ]);
  
      res.status(200).json(resultado);
 
    } catch (error) {
      console.error('Error al agrupar productos por tipo y calcular la utilidad:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };

  exports.obtenerTotalFacturasPorMes = async (req, res) => {
    try {
      const haceUnAño = new Date();
      haceUnAño.setMonth(haceUnAño.getMonth() - 11);
      haceUnAño.setDate(1);
      haceUnAño.setHours(0, 0, 0, 0);
  
      // Ajustar haceUnAño a UTC-5 manualmente para la comparación
      haceUnAño.setHours(haceUnAño.getHours() - 5);
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: haceUnAño,
            }
          }
        },
        {
          $addFields: {
            // Ajustar cada fechaVenta a UTC-5 antes de agrupar
            fechaVentaAjustada: { $subtract: ["$fechaVenta", 5 * 60 * 60000] } // Resta 5 horas en milisegundos
          }
        },
        {
          $group: {
            _id: {
              mes: { $month: "$fechaVentaAjustada" },
              año: { $year: "$fechaVentaAjustada" }
            },
            totalFactura: { $sum: "$totalFactura" },
            cantidad: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.año": 1, "_id.mes": 1 }
        },
        {
          $addFields: {
            "mesNombre": {
              $arrayElemAt: [ [ "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ], "$_id.mes" ]
            }
          }
        },
        {
          $project: {
            año: "$_id.año",
            mes: "$mesNombre",
            totalFactura: 1,
            cantidad: 1
          }
        }
      ]);
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener el total de facturas por mes:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };
    
  exports.obtenerUtilidadPorMes = async (req, res) => {
    try {
      const haceUnAño = new Date();
      haceUnAño.setMonth(haceUnAño.getMonth() - 11);
      haceUnAño.setDate(1); // Ajustar al primer día del mes
      haceUnAño.setHours(0, 0, 0, 0); // Ajustar a la medianoche
  
      // Ajuste para UTC-5
      haceUnAño.setHours(haceUnAño.getHours() - 5);
  
      const resultado = await Factura.aggregate([
        {
          $match: {
            fechaVenta: {
              $gte: haceUnAño,
            }
          }
        },
        {
          $unwind: "$productosVendidos"
        },
        {
          $addFields: {
            // Ajustar cada fechaVenta a UTC-5 antes de agrupar
            fechaVentaAjustada: { $subtract: ["$fechaVenta", 5 * 60 * 60000] } // Resta 5 horas en milisegundos
          }
        },
        {
          $project: {
            mes: { $month: "$fechaVentaAjustada" },
            año: { $year: "$fechaVentaAjustada" },
            utilidadProducto: {
              $multiply: [
                { $subtract: ["$productosVendidos.precio_unitario_venta", "$productosVendidos.precio_inventario"] },
                "$productosVendidos.cantidad"
              ]
            }
          }
        },
        {
          $group: {
            _id: { mes: "$mes", año: "$año" },
            utilidadTotalMes: { $sum: "$utilidadProducto" }
          }
        },
        {
          $sort: { "_id.año": 1, "_id.mes": 1 }
        },
        {
          $addFields: {
            "mesNombre": {
              $arrayElemAt: [ [ "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ], "$_id.mes" ]
            }
          }
        },
        {
          $project: {
            año: "$_id.año",
            mes: "$mesNombre",
            utilidadTotal: "$utilidadTotalMes"
          }
        }
      ]);
  
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al obtener la utilidad por mes:', error);
      res.status(500).json({ mensaje: error.message });
    }
  };
  