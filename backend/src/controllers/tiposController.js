const Tipo = require('../models/tipos');

// Agregar un tipo
exports.agregarTipo = async (req, res) => {
  try {
    const nuevoTipo = new Tipo(req.body);
    const tipoGuardado = await nuevoTipo.save();
    res.status(201).json(tipoGuardado);
    console.log('Tipo agregado');
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener un tipo por ID
exports.obtenerTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await Tipo.findById(id);
    if (!tipo) {
        res.status(404).json({ mensaje: 'Tipo no encontrado' });
    } else {
        res.status(200).json(tipo);
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar un tipo
exports.eliminarTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoEliminado = await Tipo.findByIdAndDelete(id);
    if (!tipoEliminado) res.status(404).json({ mensaje: 'Tipo no encontrado' });
    res.status(200).json(tipoEliminado);
    console.log('Tipo eliminado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un tipo
exports.actualizarTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoActualizado = await Tipo.findByIdAndUpdate(id, req.body, { new: true });
    if (!tipoActualizado) res.status(404).json({ mensaje: 'Tipo no encontrado' });
    res.status(200).json(tipoActualizado);
    console.log('Tipo actualizado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener productos con límite especificado en la consulta
exports.obtenerAllTipos = async (req, res) => {
  try {
    const tipos = await Tipo.find();
    res.status(200).json(tipos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};