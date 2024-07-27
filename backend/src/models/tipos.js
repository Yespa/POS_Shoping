const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre_tipo: {
    type: String,
    required: true
  },
  tipos: {
    type: [String],
    required: false
  }
});

module.exports = mongoose.model('Tipos', productoSchema);
