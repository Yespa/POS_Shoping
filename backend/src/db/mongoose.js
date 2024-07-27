const mongoose = require('mongoose');

const { MONGO_URI, MONGO_DATABASE } = process.env;

const mongoURI = process.env.MONGO_URI || `mongodb://${MONGO_URI}/${MONGO_DATABASE}`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    // Salir de la aplicación con error
    process.exit(1);
  }
};

module.exports = connectDB;
