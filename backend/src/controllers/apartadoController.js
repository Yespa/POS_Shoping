const Apartado = require('../models/Apartado');

function convertirCOTaUTC(fechaLocal) {
  const fecha = new Date(fechaLocal);

  fecha.setHours(fecha.getHours() + 5);

  const fechaUTC = fecha.toISOString().split('.')[0] + "Z";
  return fechaUTC;
}

// Crear una nueva apartado
exports.crearApartado = async (req, res) => {
  try {
    const nuevoApartado = new Apartado(req.body);
    const apartadoGuardado = await nuevoApartado.save();
    res.status(201).json(apartadoGuardado);
  } catch (error) {
    console.log(error)
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener un apartado por ID
exports.obtenerApartado = async (req, res) => {
    try {
      const { id } = req.params;
      const apartado = await Apartado.findById(id).populate('items.producto');
      if (!apartado) {
          res.status(404).json({ mensaje: 'Apartado no encontrado' });
      } else {
          res.status(200).json(apartado);
      }
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

// Actualizar un apartado
exports.actualizarApartado = async (req, res) => {
    try {
      const { id } = req.params;
      const apartadoActualizada = await Apartado.findByIdAndUpdate(id, req.body, { new: true });
      if (!apartadoActualizada) res.status(404).json({ mensaje: 'Apartado no encontrado' });
      res.status(200).json(apartadoActualizada);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };
  
  // Eliminar un apartado
  exports.eliminarApartado = async (req, res) => {
    try {
      const { id } = req.params;
      const apartadoEliminado = await Apartado.findByIdAndDelete(id);
      if (!apartadoEliminado) res.status(404).json({ mensaje: 'Apartado no encontrado' });
      res.status(200).json({ mensaje: 'Apartado eliminado' });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

  // Obtener apartados con límite especificado en la consulta
  exports.obtenerApartadoLimitados = async (req, res) => {
    try {
      // Obtener el límite de la solicitud y aplicar un límite máximo de 100
      let limite = parseInt(req.query.limite) || 10;
      limite = Math.min(limite, 100); // Asegura que el límite no exceda 100

      // const apartados = await Apartado.find().limit(limite);
      const apartados = await Apartado.find().sort({fechaApartado: -1}).limit(limite);

      res.status(200).json(apartados);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

  // Obtener gastos con limite por id, nombre, documento, fecha
exports.buscarApartadosLimitados = async (req, res) => {
  try {
    const { id, nombre, docIdentidad, fechaInicio, fechaFin } = req.query;
    let query = {};

    if (nombre) {
      query['cliente.nombre'] = new RegExp(nombre, 'i');
    } else if (docIdentidad) {
      query['cliente.docIdentidad'] = new RegExp(docIdentidad, 'i');
    }else if (id){
      query._id = id ;
    } else if (fechaInicio && fechaFin) {
      const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio));
      const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin));

      query.fechaApartado = {
          $gte: fechaInicioUTC,
          $lte: fechaFinUTC
        }
    }

    const apartados = await Apartado.find(query).sort({fecha: -1}).limit(50);
    res.json(apartados);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.sumarApartadosPendientes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Convertir las fechas de entrada a UTC
    const fechaInicioUTC = new Date(convertirCOTaUTC(fechaInicio))
    const fechaFinUTC = new Date(convertirCOTaUTC(fechaFin))

    const resultado = await Apartado.aggregate([
      {
        $match: {
          estado: "PENDIENTE",
          fechaApartado: {
            $gte: fechaInicioUTC,
            $lte: fechaFinUTC
          }
        }
      },
      {
        $group: {
          _id: null, // Agrupar todos los documentos juntos
          totalFactura: { $sum: "$totalFactura" },
          saldoPendiente: { $sum: "$saldoPendiente" },
          totalAbonado: { $sum: "$totalAbonado" },
          pagoEfectivo: { $sum: "$pagoEfectivo" },
          pagoTransferencia: { $sum: "$pagoTransferencia" }
        }
      }
    ]);

    if (resultado.length > 0) {
      res.status(200).json({
        totalFactura: resultado[0].totalFactura,
        saldoPendiente: resultado[0].saldoPendiente,
        totalAbonado: resultado[0].totalAbonado,
        pagoEfectivo: resultado[0].pagoEfectivo,
        pagoTransferencia: resultado[0].pagoTransferencia
      });
    } else {
      res.status(200).json({
        totalFactura: 0,
        saldoPendiente: 0,
        totalAbonado: 0,
        pagoEfectivo: 0,
        pagoTransferencia: 0
      });
    }
  } catch (error) {
    console.error('Error al sumar apartados pendientes en rango:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

exports.sumarPagoTransferenciaPorBancoEnPendiente = async (req, res) => {
  try {
    // Convertir fechas de entrada a UTC
    const fechaInicio = new Date(convertirCOTaUTC(req.query.fechaInicio));
    const fechaFin = new Date(convertirCOTaUTC(req.query.fechaFin));

    const resultado = await Apartado.aggregate([
      {
        $match: {
          fechaApartado: {
            $gte: fechaInicio,
            $lte: fechaFin
          },
          estado: "PENDIENTE" // Solo considerar los apartados en estado "PENDIENTE"
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
    console.error('Error al sumar pagoTransferencia por banco en estado PENDIENTE:', error);
    res.status(500).json({ mensaje: error.message });
  }
};