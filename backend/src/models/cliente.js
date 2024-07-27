const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: false
  },
  direccion: {
    type: String,
    required: false
  },
  documento_identidad: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Cliente', productoSchema);
