// mete datos de prueba en la base de datos
require('dotenv').config();
const { MongoClient } = require('mongodb');

const cliente = new MongoClient(process.env.MONGODB_URI);

async function main() {
  await cliente.connect();
  const coleccion = cliente.db(process.env.MONGODB_DB).collection('puntuaciones');

  await coleccion.insertMany([
    { nombre: 'Amador', puntos: 52, fecha: new Date() },
    { nombre: 'Maite', puntos: 48, fecha: new Date() },
    { nombre: 'Enrique', puntos: 45, fecha: new Date() },
    { nombre: 'Coque', puntos: 13, fecha: new Date() },
    { nombre: 'Fermin', puntos: 41, fecha: new Date() },
    { nombre: 'Estela', puntos: 9, fecha: new Date() },
    { nombre: 'Vicente', puntos: 37, fecha: new Date() },
    { nombre: 'Judith', puntos: 11, fecha: new Date() }
  ]);

  console.log('datos metidos');
  await cliente.close();
}

main();
