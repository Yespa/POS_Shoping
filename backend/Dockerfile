FROM node:16

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Instala las dependencias del proyecto
COPY package*.json ./
RUN npm install

# Copia los archivos de tu proyecto
COPY . .

# Expone el puerto que usa tu aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
