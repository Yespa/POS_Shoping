const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  codigo: {
    type: String,
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
  tipo_gasto: {
    type: String,
    required: true
  },
  valor_gasto: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    require: true
  },
});

module.exports = mongoose.model('Gasto', productoSchema);
