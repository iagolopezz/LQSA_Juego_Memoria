# Juego de Parejas (6x5)

HTML + CSS + JS en el cliente, Node/Express como servidor y MongoDB Atlas para el ranking.

## Cómo ponerlo en marcha

1. En [Mongo Atlas](https://cloud.mongodb.com) crea un cluster gratuito, un usuario de base de datos y
   añade tu IP en *Network Access*.
2. Copia la cadena de conexión (*Connect → Drivers*).
3. En esta carpeta:

```bash
cp .env.example .env     # edita MONGODB_URI con tu cadena
npm install
npm start
```

4. Abre http://localhost:3000

## Reglas

- Tablero 6 columnas x 5 filas = 30 cartas (15 parejas), todas boca abajo al empezar.
- Tiempo máximo: 60 segundos.
- Acierto: +1 punto. Error: -1 punto (la puntuación no baja de 0).
- Si completas todas las parejas antes de los 60 s: +40 puntos extra.
- Al terminar: ventana con "Volver a jugar" y "Salir".

## Estructura

```
server.js          API (GET/POST /api/ranking) + servidor estático
public/index.html  Pantalla inicial (top 5 + Jugar) y pantalla de juego
public/estilos.css  Estilos
public/juego.js     Lógica del juego
```

La colección `puntuaciones` se crea sola en la base `juego_parejas` la primera vez que se guarda una puntuación.
