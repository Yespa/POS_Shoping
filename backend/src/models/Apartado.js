const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: false
  },
  tipo_producto: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  precio_inventario: {
    type: Number,
    required: true
  },
  precio_sugerido: {
    type: Number,
    required: true
  },
  codigo: {
    type: String,
    required: true
  },
  precio_total: {
    type: Number,
    required: true
  },
  precio_unitario_venta: {
    type: Number,
    required: true
  }
});

const historialSchema = new mongoose.Schema({
  fechaAbono: {
    type: Date,
    required: true
  },
  abono: {
    type: Number,
    required: true
  }
});

const apartadoSchema = new mongoose.Schema({
  productosVendidos: [itemSchema],
  cliente: {
    nombre: String,
    telefono: String,
    docIdentidad: String
  },
  metodoPago: {
    type: String,
    required: true
  },
  banco: {
    type: String,
    required: true
  },
  pagoEfectivo: {
    type: Number,
    required: true
  },
  pagoTransferencia: {
    type: Number,
    required: true
  },
  saldoPendiente: {
    type: Number,
    required: true
  },
  totalAbonado: {
    type: Number,
    required: true
  },
  totalFactura: {
    type: Number,
    required: true
  },
  fechaApartado: {
    type: Date,
    required: true
  },
  vendedor: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    required: true
  },
  historialAbonos: [historialSchema],

});

module.exports = mongoose.model('Apartado', apartadoSchema);
