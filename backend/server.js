const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Usuario de MySQL
  password: '', // Sin contraseña
  database: 'practica' // Nombre de la base de datos
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});

// Ruta básica para verificar que el backend está corriendo
app.get('/', (req, res) => {
  res.send('¡El servidor backend está corriendo correctamente!');
});

// Registro de usuario
app.post('/register', async (req, res) => {
  const { nombre, correo, clave } = req.body;

  // Verificar si el usuario ya existe
  db.query('SELECT * FROM Usuario WHERE correo = ?', [correo], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al verificar el usuario' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(clave, 10);

    // Insertar usuario en la base de datos
    db.query('INSERT INTO Usuario (nombre, correo, clave) VALUES (?, ?, ?)', [nombre, correo, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error al registrar el usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  });
});

// Login de usuario
app.post('/login', (req, res) => {
  const { correo, clave } = req.body;

  db.query('SELECT * FROM Usuario WHERE correo = ?', [correo], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al verificar el usuario' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Verificar si el usuario está activo
    if (user.status === 0) {
      return res.status(400).json({ message: 'Cuenta eliminada. Por favor regístrese nuevamente' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(clave, user.clave);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Retornar los datos del usuario
    res.status(200).json({ message: 'Inicio de sesión exitoso', user });
  });
});

// Actualizar el nombre de usuario
app.post('/update-username', (req, res) => {
  const { id, nuevoNombre } = req.body;

  db.query('UPDATE Usuario SET nombre = ? WHERE id = ?', [nuevoNombre, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar el nombre de usuario' });
    }

    res.status(200).json({ message: 'Nombre de usuario actualizado correctamente' });
  });
});

// Eliminar cuenta (cambiar status a 0)
app.post('/delete-account', (req, res) => {
  const { id } = req.body;

  db.query('UPDATE Usuario SET status = 0 WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar la cuenta' });
    }

    res.status(200).json({ message: 'Cuenta eliminada correctamente (status cambiado a 0)' });
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
