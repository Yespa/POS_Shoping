const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
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
  }
});

module.exports = mongoose.model('Producto', productoSchema);
