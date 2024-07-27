const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true,
        unique: true },
    password: { 
        type: String,
        required: true },
    name: { 
        type: String,
        required: true },   
    role: { 
        type: String,
        required: true }
});

// Middleware que se ejecuta antes de guardar un usuario para hashear su contraseña
userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
  next();
});

// Método para verificar la contraseña del usuario
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Usuario', userSchema);
