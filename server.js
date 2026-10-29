require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const cliente = new MongoClient(process.env.MONGODB_URI);
let coleccion;

// top 5
app.get('/api/ranking', async (req, res) => {
  try {
    const top = await coleccion.find().sort({ puntos: -1 }).limit(5).toArray();
    res.json(top);
  } catch (err) {
    console.log(err);
    res.status(500).send('error');
  }
});

// guardar puntuacion
app.post('/api/ranking', async (req, res) => {
  const nombre = req.body.nombre;
  const puntos = req.body.puntos;

  if (!nombre || puntos < 0 || puntos > 55) {
    return res.status(400).send('datos mal');
  }

  try {
    await coleccion.insertOne({ nombre: nombre, puntos: puntos, fecha: new Date() });
    res.send('ok');
  } catch (err) {
    console.log(err);
    res.status(500).send('error');
  }
});

cliente.connect().then(() => {
  coleccion = cliente.db(process.env.MONGODB_DB).collection('puntuaciones');
  app.listen(process.env.PORT || 3000, () => {
    console.log('servidor en http://localhost:' + (process.env.PORT || 3000));
  });
}).catch((err) => {
  console.log('no se pudo conectar a mongo', err.message);
});
