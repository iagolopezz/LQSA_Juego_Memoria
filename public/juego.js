// ============================================================
//  JUEGO DE PAREJAS 6x5 - Junta de Vecinos
// ============================================================

// ---------- CONSTANTES ----------
const COLUMNAS = 6;
const FILAS = 5;
const TOTAL_CARTAS = COLUMNAS * FILAS; // 30 cartas
const TOTAL_PAREJAS = TOTAL_CARTAS / 2; // 15 parejas
const TIEMPO_MAXIMO = 60; // segundos
const PUNTOS_ACIERTO = 1;
const PUNTOS_ERROR = -1;
const PUNTOS_EXTRA = 40; // si terminas antes de que acabe el tiempo
const ESPERA_VOLTEAR = 800; // milisegundos que se ven las cartas falladas

// Rutas de las imagenes (una por pareja, 15 en total)
const IMAGENES = ['img/amador.jpg', 'img/coque.jpeg', 'img/enrique.jpeg', 'img/estela.png', 'img/fermin.jpeg',
                  'img/fina.jpeg', 'img/izaskun.jpeg', 'img/vicente.jpeg', 'img/javi.jpeg', 'img/judith.jpg',
                  'img/leo.jpeg', 'img/maite.jpg', 'img/maxi.jpg', 'img/nines.jpeg', 'img/recio.jpg'];

// Si una imagen no existe en la lista, se usa el emoji de la misma posicion
const EMOJIS = ['🏊', '🚗', '🔑', '📋', '💶', '🐟', '🛗', '🗑️',
                '📢', '🌳', '🧯', '📬', '🪠', '🧹', '🍷'];

// ---------- ELEMENTOS DEL HTML ----------
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaJuego = document.getElementById('pantalla-juego');
const listaRanking = document.getElementById('ranking');
const botonJugar = document.getElementById('boton-jugar');

const ventanaNombre = document.getElementById('ventana-nombre');
const formularioNombre = document.getElementById('formulario-nombre');
const entradaNombre = document.getElementById('entrada-nombre');
const botonCancelar = document.getElementById('boton-cancelar');

const textoJugador = document.getElementById('texto-jugador');
const textoTiempo = document.getElementById('texto-tiempo');
const textoPuntos = document.getElementById('texto-puntos');
const barraTiempo = document.getElementById('barra-tiempo');
const tablero = document.getElementById('tablero');

const ventanaFinal = document.getElementById('ventana-final');
const tituloFinal = document.getElementById('titulo-final');
const textoFinal = document.getElementById('texto-final');
const puntosFinal = document.getElementById('puntos-final');
const botonRepetir = document.getElementById('boton-repetir');
const botonSalir = document.getElementById('boton-salir');

// ---------- VARIABLES DEL JUEGO ----------
let nombreJugador = '';
let puntos = 0;
let tiempoRestante = TIEMPO_MAXIMO;
let temporizador = null;
let primeraCarta = null; // primera carta girada del turno
let bloqueado = false; // true mientras se espera para voltear las cartas falladas
let parejasEncontradas = 0;
let jugando = false;

// ============================================================
//  PANTALLA INICIAL
// ============================================================

// Pide el top 5 al servidor y lo pinta en la lista
async function cargarRanking() {
  listaRanking.innerHTML = '<li class="apagado">Cargando...</li>';

  try {
    const respuesta = await fetch('/api/ranking');
    const jugadores = await respuesta.json();

    listaRanking.innerHTML = '';

    if (jugadores.length === 0) {
      listaRanking.innerHTML = '<li class="apagado">Aun no hay vecinos en el acta</li>';
      return;
    }

    for (let i = 0; i < jugadores.length; i++) {
      const fila = document.createElement('li');

      const posicion = document.createElement('span');
      posicion.className = 'posicion';
      posicion.textContent = i + 1;

      const nombre = document.createElement('span');
      nombre.className = 'nombre';
      nombre.textContent = jugadores[i].nombre;

      const puntosJugador = document.createElement('span');
      puntosJugador.className = 'puntos';
      puntosJugador.textContent = jugadores[i].puntos + ' pts';

      fila.appendChild(posicion);
      fila.appendChild(nombre);
      fila.appendChild(puntosJugador);
      listaRanking.appendChild(fila);
    }
  } catch (error) {
    listaRanking.innerHTML = '<li class="apagado">No se pudo cargar el ranking</li>';
  }
}

function mostrarInicio() {
  ventanaFinal.classList.add('oculto');
  pantallaJuego.classList.remove('activa');
  pantallaInicio.classList.add('activa');
  cargarRanking();
}

function abrirVentanaNombre() {
  ventanaNombre.classList.remove('oculto');
  entradaNombre.value = nombreJugador;
  entradaNombre.focus();
}

function cerrarVentanaNombre() {
  ventanaNombre.classList.add('oculto');
}

function confirmarNombre(evento) {
  evento.preventDefault(); // evita que el formulario recargue la pagina

  const nombre = entradaNombre.value.trim();
  if (nombre === '') {
    return;
  }

  nombreJugador = nombre;
  cerrarVentanaNombre();
  empezarJuego();
}

// ============================================================
//  JUEGO
// ============================================================

// Baraja un array (algoritmo de Fisher-Yates)
function mezclar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const auxiliar = lista[i];
    lista[i] = lista[j];
    lista[j] = auxiliar;
  }
  return lista;
}

// Devuelve el HTML que se ve al girar una carta (imagen o emoji)
function contenidoCarta(numeroPareja) {
  if (IMAGENES[numeroPareja]) {
    return '<img src="' + IMAGENES[numeroPareja] + '" alt="" draggable="false">';
  }
  return EMOJIS[numeroPareja];
}

function crearTablero() {
  // Lista con cada numero de pareja dos veces: 0,0,1,1,2,2...
  const parejas = [];
  for (let i = 0; i < TOTAL_PAREJAS; i++) {
    parejas.push(i);
    parejas.push(i);
  }
  mezclar(parejas);

  tablero.innerHTML = '';

  for (let i = 0; i < parejas.length; i++) {
    const numeroPareja = parejas[i];

    const carta = document.createElement('button');
    carta.className = 'carta';
    carta.dataset.pareja = numeroPareja;
    carta.innerHTML =
      '<div class="carta-interior">' +
        '<div class="cara frontal"></div>' +
        '<div class="cara trasera">' + contenidoCarta(numeroPareja) + '</div>' +
      '</div>';

    carta.addEventListener('click', function () {
      alPulsarCarta(carta);
    });

    tablero.appendChild(carta);
  }
}

function actualizarMarcador() {
  textoJugador.textContent = nombreJugador;
  textoTiempo.textContent = tiempoRestante;
  textoPuntos.textContent = puntos;

  const porcentaje = (tiempoRestante / TIEMPO_MAXIMO) * 100;
  barraTiempo.style.width = porcentaje + '%';

  if (tiempoRestante <= 10) {
    barraTiempo.classList.add('poco-tiempo');
  } else {
    barraTiempo.classList.remove('poco-tiempo');
  }
}

function empezarJuego() {
  clearInterval(temporizador);

  puntos = 0;
  tiempoRestante = TIEMPO_MAXIMO;
  primeraCarta = null;
  bloqueado = false;
  parejasEncontradas = 0;
  jugando = true;

  pantallaInicio.classList.remove('activa');
  pantallaJuego.classList.add('activa');
  ventanaFinal.classList.add('oculto');

  crearTablero(); // las cartas empiezan boca abajo
  actualizarMarcador();

  temporizador = setInterval(pasarSegundo, 1000);
}

function pasarSegundo() {
  tiempoRestante = tiempoRestante - 1;
  actualizarMarcador();

  if (tiempoRestante <= 0) {
    terminarJuego(false);
  }
}

function alPulsarCarta(carta) {
  // Ignoramos el click si no se puede jugar
  if (jugando === false || bloqueado === true) {
    return;
  }
  if (carta.classList.contains('girada') || carta.classList.contains('acertada')) {
    return;
  }

  carta.classList.add('girada');

  if (primeraCarta === null) {
    // Es la primera carta del turno
    primeraCarta = carta;
  } else {
    // Es la segunda: comprobamos si forman pareja
    comprobarPareja(primeraCarta, carta);
  }
}

function comprobarPareja(carta1, carta2) {
  if (carta1.dataset.pareja === carta2.dataset.pareja) {
    // ----- ACIERTO -----
    carta1.classList.add('acertada');
    carta2.classList.add('acertada');
    puntos = puntos + PUNTOS_ACIERTO;
    parejasEncontradas = parejasEncontradas + 1;
    primeraCarta = null;
    actualizarMarcador();

    if (parejasEncontradas === TOTAL_PAREJAS) {
      terminarJuego(true);
    }
  } else {
    // ----- ERROR -----
    puntos = puntos + PUNTOS_ERROR;
    if (puntos < 0) {
      puntos = 0; // la puntuacion no baja de 0
    }
    actualizarMarcador();

    bloqueado = true;
    carta1.classList.add('fallada');
    carta2.classList.add('fallada');

    // Despues de un momento, volvemos a ocultar las dos cartas
    setTimeout(function () {
      carta1.classList.remove('girada', 'fallada');
      carta2.classList.remove('girada', 'fallada');
      primeraCarta = null;
      bloqueado = false;
    }, ESPERA_VOLTEAR);
  }
}

// ============================================================
//  FIN DE LA PARTIDA
// ============================================================

// completado = true si se han encontrado todas las parejas
function terminarJuego(completado) {
  if (jugando === false) {
    return;
  }
  jugando = false;
  clearInterval(temporizador);

  if (completado === true && tiempoRestante > 0) {
    puntos = puntos + PUNTOS_EXTRA;
    tituloFinal.textContent = '🎉 ¡Junta aprobada!';
    textoFinal.textContent = 'Terminaste con ' + tiempoRestante + 's de sobra. ¡+' + PUNTOS_EXTRA + ' puntos extra!';
  } else {
    tituloFinal.textContent = '⏰ Se levanta la sesion';
    textoFinal.textContent = 'Se acabo el tiempo y quedaron parejas sin encontrar.';
  }

  actualizarMarcador();
  puntosFinal.textContent = puntos;
  ventanaFinal.classList.remove('oculto');

  guardarPuntuacion();
}

// Envia la puntuacion al servidor para guardarla en Mongo
async function guardarPuntuacion() {
  try {
    await fetch('/api/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreJugador, puntos: puntos })
    });
  } catch (error) {
    console.log('No se pudo guardar la puntuacion', error);
  }
}

// ============================================================
//  EVENTOS Y ARRANQUE
// ============================================================
botonJugar.addEventListener('click', abrirVentanaNombre);
botonCancelar.addEventListener('click', cerrarVentanaNombre);
formularioNombre.addEventListener('submit', confirmarNombre);
botonRepetir.addEventListener('click', empezarJuego);
botonSalir.addEventListener('click', mostrarInicio);

mostrarInicio();
