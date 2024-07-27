const Producto = require('../models/producto');

// Agregar un producto
exports.agregarProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
    console.log('Producto agregado');
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener un producto por ID
exports.obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findById(id);
    if (!producto) {
        res.status(404).json({ mensaje: 'Producto no encontrado' });
    } else {
        res.status(200).json(producto);
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await Producto.findByIdAndDelete(id);
    if (!productoEliminado) res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(200).json(productoEliminado);
    console.log('Producto eliminado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un producto
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });
    if (!productoActualizado) res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(200).json(productoActualizado);
    console.log('Producto actualizado');
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Buscar un producto por código
exports.buscarProductosCodigo = async (req, res) => {
  try {
    const codigoBuscado = req.params.codigo;
    const producto = await Producto.findOne({ codigo: codigoBuscado });

    if (producto) {
      res.status(200).json(producto);
    } else {
      res.status(404).send('Producto no encontrado');
    }

  } catch (error) {
    res.status(500).send('Error en el servidor: ' + error.message);
  }
};

// Obtener productos con límite especificado en la consulta
exports.obtenerProductosLimitados = async (req, res) => {
  try {
    // Obtener el límite de la solicitud y aplicar un límite máximo de 100
    let limite = parseInt(req.query.limite) || 10;
    limite = Math.min(limite, 100); // Asegura que el límite no exceda 100

    const productos = await Producto.find().limit(limite);
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.buscarProductosLimitados = async (req, res) => {
  try {
    const { nombre, codigo } = req.query;
    let query = {};

    if (nombre) {
      query.nombre = new RegExp(nombre, 'i');
    } else if (codigo) {
      const regex = new RegExp("^" + codigo);
      query.codigo = { $regex: regex };
    }

    const productos = await Producto.find(query).limit(50);
    res.json(productos);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.procesaVenta = async (req, res) => {
  try {
    const productosVendidos = req.body;
    
    for (const productoVendido of productosVendidos) {
      // Obtener el producto actual del inventario por ID
      const producto = await Producto.findById(productoVendido._id);
      if (!producto) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      
      // Calcular la nueva cantidad en inventario
      const nuevaCantidad = producto.cantidad - productoVendido.cantidad;

      if (nuevaCantidad < 0) {
        return res.status(400).json({ mensaje: `Cantidad en inventario insuficiente - ${producto.nombre}` });
      }
      
      // Actualizar la cantidad del producto en el inventario
      const productoActualizado = await Producto.findByIdAndUpdate(productoVendido._id, { cantidad: nuevaCantidad }, { new: true });
      if (!productoActualizado) {
        return res.status(404).json({ mensaje: 'Producto no encontrado al intentar actualizar' });
      }
    }
    
    res.json({ mensaje: 'Inventario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

 // Función para obtener la suma de precio_inventario y la suma por tipo_producto
 exports.obtenerSumaPrecioInventarioPorTipo = async (req, res) => {
  try {
      // Primero, calculamos la suma total de precio_inventario
      const sumaTotal = await Producto.aggregate([
          {
              $group: {
                  _id: null, // Agrupa todos los documentos sin importar su _id
                  sumaTotalPrecioInventario: { $sum: "$precio_inventario" } // Suma los valores de precio_inventario
              }
          }
      ]);

      // Luego, calculamos la suma de precio_inventario por cada tipo_producto
      const sumaPorTipo = await Producto.aggregate([
          {
              $group: {
                  _id: "$tipo_producto", // Agrupa los documentos por tipo_producto
                  sumaPrecioInventario: { $sum: "$precio_inventario" } // Suma los valores de precio_inventario por grupo
              }
          },
          {
              $sort: { _id: 1 } // Opcional: ordena los resultados por tipo_producto
          }
      ]);

      res.status(200).json({
          sumaTotalPrecioInventario: sumaTotal.length > 0 ? sumaTotal[0].sumaTotalPrecioInventario : 0,
          sumaPorTipoProducto: sumaPorTipo
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: error.message });
  }
};