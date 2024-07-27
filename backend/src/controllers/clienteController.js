const Cliente = require('../models/cliente');

// Agregar un cliente
exports.agregarCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
    console.log('Cliente agregado');
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener un cliente por ID
exports.obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) {
        res.status(404).json({ mensaje: 'Cliente no encontrado' });
    } else {
        res.status(200).json(cliente);
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar un cliente
exports.eliminarCliente= async (req, res) => {
  try {
    const { id } = req.params;
    const clienteEliminado = await Cliente.findByIdAndDelete(id);
    if (!clienteEliminado) res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.status(200).json(clienteEliminado);
    console.log('Cliente eliminado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un cliente
exports.actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await Cliente.findByIdAndUpdate(id, req.body, { new: true });
    if (!clienteActualizado) res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.status(200).json(clienteActualizado);
    console.log('Cliente actualizado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener cliente con límite especificado en la consulta
exports.obtenerClientesLimitados = async (req, res) => {
  try {
    // Obtener el límite de la solicitud y aplicar un límite máximo de 20
    let limite = parseInt(req.query.limite) || 10;
    limite = Math.min(limite, 20); // Asegura que el límite no exceda 20

    const clientes = await Cliente.find().limit(limite);
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener productos con limite por nombre
exports.buscarClienteNombreLimitados = async (req, res) => {
  try {
    const nombre = req.query.nombre;
    const clientes = await Cliente.find({ nombre: new RegExp(nombre, 'i') }).limit(5);
    res.json(clientes);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
