const User = require('../models/usuario');
const jwt = require('jsonwebtoken');

exports.registrarUsuario = async (req, res) => {
    try {
      const { username, password, role, name } = req.body;
  
      // Verificar si ya existe un usuario con el mismo username
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ mensaje: 'El usuario no está disponible' });
      }
  
      const newUser = new User({ username, password, role, name });
      const userSaved = await newUser.save();
      console.log('Usuario registrado con éxito');
      res.status(201).json(userSaved);
    } catch (error) {
      console.error('Error al registrar usuario:', error.message);
      res.status(400).json({ mensaje: error.message });
    }
  };

exports.iniciarSesion = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ mensaje: 'Autenticación fallida' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      token,
      name: user.name, 
      role: user.role,
      mensaje: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
  

// Función para obtener la información de un usuario
exports.obtenerUsuario = async (req, res) => {
  try {
    // Obtén el ID del usuario desde los parámetros de la ruta
    const { id } = req.params;

    // Busca al usuario por su ID
    const usuario = await User.findById(id, '-password'); // Excluye la contraseña en la respuesta

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.eliminarUsuario = async (req, res) => {
    try {
      // Obtén el ID del usuario desde los parámetros de la ruta
      const { id } = req.params;
  
      // Elimina al usuario por su ID
      const usuarioEliminado = await User.findByIdAndDelete(id);
  
      if (!usuarioEliminado) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
  
      res.status(200).json({ mensaje: 'Usuario eliminado con éxito', usuario: usuarioEliminado });
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };

exports.actualizarUsuario = async (req, res) => {
    try {
        // Obtén el ID del usuario desde los parámetros de la ruta
        const { id } = req.params;

        const usuarioActualizado = await User.findByIdAndUpdate(id, req.body, { new: true });

        if (!usuarioActualizado) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Excluye la contraseña del objeto a devolver por seguridad, si es necesario
        usuarioActualizado.password = undefined;

        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

exports.obtenerTodosLosUsuarios = async (req, res) => {
    try {
        // Busca todos los usuarios y excluye la contraseña en la respuesta
        const usuarios = await User.find({}, '-password');

        if (!usuarios) {
            return res.status(404).json({ mensaje: 'No se encontraron usuarios' });
        }

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ mensaje: error.message });
    }
};

