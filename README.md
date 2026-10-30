# LQSA Memory - Juego de Parejas

Juego de memoria de parejas hecho con HTML, CSS y JavaScript, con un servidor en Node.js y un ranking guardado en MongoDB Atlas. La temática es la serie *La que se avecina*: las cartas son fotos de los vecinos.

![reverso de las cartas](public/img/reverso.png)

---

## 1. Qué hace el juego

- Al entrar se ve una pantalla de inicio con el **Top 5** de las mejores puntuaciones, de mayor a menor, sacado de la base de datos.
- Al pulsar **Jugar** se pide el nombre del jugador.
- Se reparte un tablero de **30 cartas (6 x 5)**, es decir, 15 parejas, todas boca abajo y desordenadas.
- Hay **60 segundos** para encontrar todas las parejas.
- Arriba del tablero hay un marcador con el nombre, el tiempo que queda y los puntos.
- Al terminar sale una ventana con la puntuación y los botones **Volver a jugar** y **Salir**.
- La puntuación se guarda automáticamente en MongoDB y aparece en el ranking si está entre las 5 mejores.

### Puntuación

| Acción | Puntos |
|---|---|
| Acertar una pareja | +1 |
| Fallar | -1 (no baja de 0) |
| Acabar todas las parejas antes de tiempo | +40 |

La máxima es 55 puntos.

---

## 2. Tecnologías

| Parte | Tecnología |
|---|---|
| Página web | HTML, CSS y JavaScript, sin librerías |
| Servidor | Node.js con Express |
| Base de datos | MongoDB Atlas |
| Configuración | dotenv (archivo `.env`) |

---

## 3. Estructura del proyecto

```
junta-de-vecinos/
├── public/
│   ├── img/          fotos de los vecinos y reverso.png
│   ├── index.html    pantallas y ventanas
│   ├── estilos.css   estilos
│   └── juego.js      lógica del juego
├── server.js         servidor Express y conexión a MongoDB
├── datos.js          datos de prueba para el ranking
├── .env.example      plantilla de la configuración
└── package.json      dependencias y comandos
```

---

## 4. La parte visual

### index.html

Tiene dos pantallas y dos ventanas. Solo se ve la pantalla que tiene la clase `activa`, y las ventanas se esconden con la clase `oculto`.

| Elemento | Para qué sirve |
|---|---|
| `#pantalla-inicio` | Título, Top 5 y botón Jugar |
| `#pantalla-juego` | Marcador y tablero de cartas |
| `#ventana-nombre` | Pide el nombre antes de empezar |
| `#ventana-final` | Muestra la puntuación al acabar |

### Las cartas

Cada carta es un botón con dos caras:

- **Frontal**: la que se ve boca abajo, con la imagen `reverso.png` de fondo.
- **Trasera**: la foto del vecino.

Al pulsarla se oculta la frontal y se muestra la trasera. El estado de cada carta se controla con clases:

| Clase | Significado |
|---|---|
| `girada` | Está boca arriba |
| `acertada` | Su pareja ya se ha encontrado; se queda boca arriba con borde verde y no se puede volver a pulsar |
| `fallada` | Borde rojo durante el momento en que se ve el fallo |

Las fotos están en `public/img/`, una por pareja: Amador, Coque, Enrique, Estela, Fermín, Fina, Izaskun, Javi, Judith, Leo, Maite, Maxi, Nines, Recio y Vicente.

### estilos.css

- Fondo con un degradado suave en tonos melocotón.
- Ventanas blancas con bordes redondeados y una sombra ligera.
- Título en naranja y subtítulos en azul.
- En el ranking cada puesto es una fila, y el primero se destaca en amarillo.
- El marcador son tres etiquetas de colores: nombre (azul), tiempo (naranja) y puntos (verde).
- El tablero es un `grid` de 6 columnas.
- Hay un `@media` para que en el móvil el tablero y el marcador se vean más pequeños.

---

## 5. La lógica del juego (juego.js)

| Función | Qué hace |
|---|---|
| `cargarRanking()` | Pide el Top 5 al servidor con `fetch` y lo pinta en la lista |
| `irInicio()` | Muestra la pantalla de inicio y recarga el ranking |
| `pedirNombre()` | Abre la ventana del nombre |
| `aceptarNombre()` | Guarda el nombre y empieza la partida |
| `cancelar()` | Cierra la ventana del nombre |
| `empezar()` | Pone puntos y tiempo a cero, crea las cartas y arranca el reloj con `setInterval` |
| `crearCartas()` | Crea una lista con cada número de pareja dos veces, la desordena y crea los 30 botones |
| `pulsarCarta()` | Da la vuelta a la carta; si es la segunda, comprueba si es pareja |
| `pintarMarcador()` | Actualiza nombre, tiempo y puntos |
| `fin()` | Para el reloj, suma el bonus si toca, enseña la ventana final y manda la puntuación al servidor |

**Cómo se desordenan las cartas:** se recorre la lista desde el final y cada posición se intercambia con otra al azar.

**Cómo se sabe si dos cartas son pareja:** cada carta guarda su número de pareja en `data-pareja`. Al girar la segunda se comparan los dos números:

- Si coinciden, las dos se marcan como `acertada` y se suma 1 punto. Si ya están las 15 parejas, se acaba la partida.
- Si no coinciden, se resta 1 punto, se marcan como `fallada` y a los 800 ms se vuelven a tapar. Mientras tanto la variable `esperando` impide pulsar más cartas.

**El tiempo:** cada segundo se resta 1 a `tiempo` y se actualiza el marcador. Cuando llega a 0 se llama a `fin()`.

---

## 6. El servidor (server.js)

1. Carga la configuración del `.env` con `dotenv`.
2. Se conecta a MongoDB Atlas.
3. Sirve la carpeta `public` para que se vea la web.
4. Atiende las rutas del ranking.
5. Arranca en `http://localhost:3000`.

### Rutas

**`GET /api/ranking`**: devuelve las 5 mejores puntuaciones ordenadas de mayor a menor.

```json
[
  { "nombre": "Amador", "puntos": 52 },
  { "nombre": "Maite", "puntos": 48 }
]
```

**`POST /api/ranking`**: guarda una puntuación. Recibe:

```json
{ "nombre": "3ºB", "puntos": 30 }
```

Antes de guardar comprueba que hay nombre y que los puntos están entre 0 y 55. Si no, responde con error 400.

---

## 7. La base de datos

- Base de datos: `juego_parejas`
- Colección: `puntuaciones`

Cada partida se guarda como un documento:

```json
{ "nombre": "Amador", "puntos": 52, "fecha": "2026-10-29T15:57:54.958Z" }
```

El Top 5 se saca con:

```js
coleccion.find().sort({ puntos: -1 }).limit(5)
```

La conexión se configura en el archivo `.env`, así los datos de acceso no están escritos dentro del código:

```
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/
MONGODB_DB=juego_parejas
PORT=3000
```

### Datos de prueba

El archivo `datos.js` mete 8 puntuaciones para que el ranking no salga vacío:

| Nombre | Puntos |
|---|---|
| Amador | 52 |
| Maite | 48 |
| Enrique | 45 |
| Fermin | 41 |
| Vicente | 37 |
| Coque | 13 |
| Judith | 11 |
| Estela | 9 |

---

## 8. Cómo ponerlo en marcha

1. Instalar [Node.js](https://nodejs.org).
2. En la carpeta del proyecto, instalar las dependencias:
   ```
   npm install
   ```
3. Copiar `.env.example` a `.env` y poner la cadena de conexión de MongoDB Atlas.
4. Meter los datos de prueba (solo una vez):
   ```
   npm run datos
   ```
5. Arrancar el servidor:
   ```
   npm start
   ```
6. Abrir [http://localhost:3000](http://localhost:3000).

En Windows, si PowerShell da error de scripts, usar `npm.cmd` en lugar de `npm`.

Para que Atlas deje conectarse, la IP del ordenador tiene que estar añadida en **Network Access**.
