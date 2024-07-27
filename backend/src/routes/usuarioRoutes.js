const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');

router.post('/register', UsuarioController.registrarUsuario);
router.post('/login', UsuarioController.iniciarSesion);
router.get('/user/all', UsuarioController.obtenerTodosLosUsuarios);
router.get('/user/:id', UsuarioController.obtenerUsuario);
router.put('/user/:id', UsuarioController.actualizarUsuario);
router.delete('/user/:id', UsuarioController.eliminarUsuario);


module.exports = router;
