const Gasto = require('../models/gasto');

function convertirCOTaUTC(fechaLocal) {
  const fecha = new Date(fechaLocal);

  fecha.setHours(fecha.getHours() + 5);

  const fechaUTC = fecha.toISOString().split('.')[0] + "Z";
  return fechaUTC;
}

// Agregar un gasto
exports.agregarGasto = async (req, res) => {
  try {
    const nuevoGasto = new Gasto(req.body);
    const gastoGuardado = await nuevoGasto.save();
    res.status(201).json(gastoGuardado);
    console.log('Gasto agregado');
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener un gasto por ID
exports.obtenerGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.findById(id);
    if (!gasto) {
        res.status(404).json({ mensaje: 'Gasto no encontrado' });
    } else {
        res.status(200).json(gasto);
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar un gasto
exports.eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const gastoEliminado = await Gasto.findByIdAndDelete(id);
    if (!gastoEliminado) res.status(404).json({ mensaje: 'Gasto no encontrado' });
    res.status(200).json(gastoEliminado);
    console.log('Gasto eliminado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un gasto
exports.actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const gastoActualizado = await Gasto.findByIdAndUpdate(id, req.body, { new: true });
    if (!gastoActualizado) res.status(404).json({ mensaje: 'Gasto no encontrado' });
    res.status(200).json(gastoActualizado);
    console.log('Gasto actualizado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener gastos con límite especificado en la consulta
exports.obtenerGastosLimitados = async (req, res) => {
  try {
    // Obtener el límite de la solicitud y aplicar un límite máximo de 100
    let limite = parseInt(req.query.limite) || 10;
    limite = Math.min(limite, 100); // Asegura que el límite no exceda 100

    // const gastos = await Gasto.find().limit(limite);
    const gastos = await Gasto.find().sort({fecha: -1}).limit(limite);

    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener gastos con limite por nombre o codigo
exports.buscarGastosLimitados = async (req, res) => {
  try {
    const { nombre, codigo, fechaInicio, fechaFin } = req.query;
    let query = {};

    if (nombre) {
      query.nombre = new RegExp(nombre, 'i');
    } else if (codigo) {
      const regex = new RegExp("^" + codigo);
      query.codigo = { $regex: regex };
    } else if (fechaInicio && fechaFin) {
      const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
      const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));

      query.fecha = {
          $gte: fechaInicioUTC,
          $lte: fechaFinUTC
        }
    }

    const gastos = await Gasto.find(query).sort({fecha: -1}).limit(50);
    res.json(gastos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Sumar valor_gasto en un rango de tiempo
exports.sumarValorGastoEnRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Convertir las fechas de entrada a UTC
    const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
    const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));

    const resultado = await Gasto.aggregate([
      {
        $match: {
          fecha: {
            $gte: fechaInicioUTC,
            $lte: fechaFinUTC
          }
        }
      },
      {
        $group: {
          _id: null, // Agrupar todos los documentos juntos (no agrupar por un campo específico)
          totalValorGasto: { $sum: '$valor_gasto' }
        }
      }
    ]);

    if (resultado.length > 0) {
      res.status(200).json({ totalValorGasto: resultado[0].totalValorGasto });
    } else {
      res.status(200).json({ totalValorGasto: 0 });
    }
  } catch (error) {
    console.error('Error al sumar valor_gasto:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

// Función para agrupar gastos por tipo_gasto y sumar valor_gasto dentro de un rango de tiempo específico
exports.sumarGastosPorTipo = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Convertir las fechas de entrada a UTC
    const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio))
    const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin))

    const resultado = await Gasto.aggregate([
      {
        $match: {
          fecha: {
            $gte: fechaInicioUTC,
            $lte: fechaFinUTC
          }
        }
      },
      {
        $group: {
          _id: "$tipo_gasto", // Agrupar por tipo_gasto
          totalGasto: { $sum: "$valor_gasto" } // Sumar valor_gasto
        }
      },
      {
        $sort: { totalGasto: -1 } // Opcional: ordenar los resultados por totalGasto de manera descendente
      }
    ]);

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al agrupar gastos por tipo en rango:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

exports.obtenerTotalGastosPorMes = async (req, res) => {
  try {
    const haceUnAño = new Date();
    haceUnAño.setMonth(haceUnAño.getMonth() - 11);
    haceUnAño.setDate(1); // Ajustar al primer día del mes
    haceUnAño.setHours(0, 0, 0, 0); // Ajustar a la medianoche

    // Ajuste para UTC-5
    haceUnAño.setHours(haceUnAño.getHours() - 5);

    const resultado = await Gasto.aggregate([
      {
        $match: {
          fecha: {
            $gte: haceUnAño,
          }
        }
      },
      {
        $addFields: {
          // Ajustar cada fecha a UTC-5 antes de agrupar
          fechaAjustada: { $subtract: ["$fecha", 5 * 60 * 60000] } // Resta 5 horas en milisegundos
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: "$fechaAjustada" },
            año: { $year: "$fechaAjustada" }
          },
          totalValorGasto: { $sum: "$valor_gasto" },
          cantidad: { $sum: 1 } // Cantidad de gastos registrados por mes
        }
      },
      {
        $sort: { "_id.año": 1, "_id.mes": 1 } // Ordenar por año y mes
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
          totalValorGasto: 1,
          cantidad: 1
        }
      }
    ]);

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al obtener el total de gastos por mes:', error);
    res.status(500).json({ mensaje: error.message });
  }
};
