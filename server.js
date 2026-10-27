require('dotenv').config();
const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const PUERTO = process.env.PORT || 3000;
const URI_MONGO = process.env.MONGODB_URI;
const NOMBRE_BD = process.env.MONGODB_DB || 'juego_parejas';

// 15 parejas + 40 de bonus como maximo
const PUNTOS_MAXIMOS = 15 + 40;

if (!URI_MONGO) {
  console.log('Falta MONGODB_URI. Copia .env.example a .env y rellenalo.');
  process.exit(1);
}

const cliente = new MongoClient(URI_MONGO);
let puntuaciones; // coleccion de Mongo

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/ranking -> devuelve el top 5 de mayor a menor
app.get('/api/ranking', async function (peticion, respuesta) {
  try {
    const top = await puntuaciones
      .find({}, { projection: { _id: 0, nombre: 1, puntos: 1 } })
      .sort({ puntos: -1, fecha: 1 })
      .limit(5)
      .toArray();

    respuesta.json(top);
  } catch (error) {
    console.log(error);
    respuesta.status(500).json({ error: 'No se pudo leer el ranking' });
  }
});

// POST /api/ranking -> guarda la puntuacion de una partida
app.post('/api/ranking', async function (peticion, respuesta) {
  try {
    const nombre = String(peticion.body.nombre || '').trim().slice(0, 20);
    const puntos = Number(peticion.body.puntos);

    if (nombre === '') {
      return respuesta.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (!Number.isInteger(puntos) || puntos < 0 || puntos > PUNTOS_MAXIMOS) {
      return respuesta.status(400).json({ error: 'Puntuacion no valida' });
    }

    await puntuaciones.insertOne({ nombre: nombre, puntos: puntos, fecha: new Date() });
    respuesta.status(201).json({ ok: true });
  } catch (error) {
    console.log(error);
    respuesta.status(500).json({ error: 'No se pudo guardar la puntuacion' });
  }
});

// Conectamos con Mongo Atlas y despues arrancamos el servidor
async function arrancar() {
  await cliente.connect();
  puntuaciones = cliente.db(NOMBRE_BD).collection('puntuaciones');
  app.listen(PUERTO, function () {
    console.log('Juego en http://localhost:' + PUERTO);
  });
}

arrancar().catch(function (error) {
  console.log('Error conectando con Mongo Atlas:', error.message);
  process.exit(1);
});
