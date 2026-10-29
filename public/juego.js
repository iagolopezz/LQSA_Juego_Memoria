// juego de parejas

var imagenes = ['img/amador.jpg', 'img/coque.jpeg', 'img/enrique.jpeg', 'img/estela.png', 'img/fermin.jpeg',
  'img/fina.jpeg', 'img/izaskun.jpeg', 'img/vicente.jpeg', 'img/javi.jpeg', 'img/judith.jpg',
  'img/leo.jpeg', 'img/maite.jpg', 'img/maxi.jpg', 'img/nines.jpeg', 'img/recio.jpg'];

var nombre = '';
var puntos = 0;
var tiempo = 60;
var reloj;
var carta1 = null;
var esperando = false;
var aciertos = 0;
var jugando = false;

// ranking
function cargarRanking() {
  var lista = document.getElementById('ranking');
  lista.innerHTML = '<li class="apagado">Cargando...</li>';

  fetch('/api/ranking')
    .then(function (res) {
      return res.json();
    })
    .then(function (datos) {
      lista.innerHTML = '';
      if (datos.length == 0) {
        lista.innerHTML = '<li class="apagado">Todavia no hay nadie</li>';
      }
      for (var i = 0; i < datos.length; i++) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="posicion">' + (i + 1) + '</span>' +
          '<span class="nombre"></span>' +
          '<span class="puntos">' + datos[i].puntos + ' pts</span>';
        li.querySelector('.nombre').textContent = datos[i].nombre;
        lista.appendChild(li);
      }
    })
    .catch(function () {
      lista.innerHTML = '<li class="apagado">No se pudo cargar el ranking</li>';
    });
}

function irInicio() {
  document.getElementById('ventana-final').classList.add('oculto');
  document.getElementById('pantalla-juego').classList.remove('activa');
  document.getElementById('pantalla-inicio').classList.add('activa');
  cargarRanking();
}

function pedirNombre() {
  document.getElementById('ventana-nombre').classList.remove('oculto');
  document.getElementById('entrada-nombre').value = nombre;
  document.getElementById('entrada-nombre').focus();
}

function cancelar() {
  document.getElementById('ventana-nombre').classList.add('oculto');
}

function aceptarNombre(e) {
  e.preventDefault();
  var texto = document.getElementById('entrada-nombre').value.trim();
  if (texto == '') return;
  nombre = texto;
  cancelar();
  empezar();
}

// juego
function crearCartas() {
  var numeros = [];
  for (var i = 0; i < 15; i++) {
    numeros.push(i);
    numeros.push(i);
  }
  // desordenar
  for (var i = numeros.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var aux = numeros[i];
    numeros[i] = numeros[j];
    numeros[j] = aux;
  }

  var tablero = document.getElementById('tablero');
  tablero.innerHTML = '';

  for (var i = 0; i < numeros.length; i++) {
    var carta = document.createElement('button');
    carta.className = 'carta';
    carta.dataset.pareja = numeros[i];
    carta.innerHTML = '<div class="carta-interior">' +
      '<div class="cara frontal"></div>' +
      '<div class="cara trasera"><img src="' + imagenes[numeros[i]] + '" draggable="false"></div>' +
      '</div>';
    carta.onclick = function () {
      pulsarCarta(this);
    };
    tablero.appendChild(carta);
  }
}

function pintarMarcador() {
  document.getElementById('texto-jugador').textContent = nombre;
  document.getElementById('texto-tiempo').textContent = tiempo;
  document.getElementById('texto-puntos').textContent = puntos;
}

function empezar() {
  clearInterval(reloj);
  puntos = 0;
  tiempo = 60;
  carta1 = null;
  esperando = false;
  aciertos = 0;
  jugando = true;

  document.getElementById('pantalla-inicio').classList.remove('activa');
  document.getElementById('pantalla-juego').classList.add('activa');
  document.getElementById('ventana-final').classList.add('oculto');

  crearCartas();
  pintarMarcador();

  reloj = setInterval(function () {
    tiempo--;
    pintarMarcador();
    if (tiempo <= 0) {
      fin(false);
    }
  }, 1000);
}

function pulsarCarta(carta) {
  if (!jugando || esperando) return;
  if (carta.classList.contains('girada') || carta.classList.contains('acertada')) return;

  carta.classList.add('girada');

  if (carta1 == null) {
    carta1 = carta;
    return;
  }

  var carta2 = carta;

  if (carta1.dataset.pareja == carta2.dataset.pareja) {
    carta1.classList.add('acertada');
    carta2.classList.add('acertada');
    puntos++;
    aciertos++;
    carta1 = null;
    pintarMarcador();
    if (aciertos == 15) {
      fin(true);
    }
  } else {
    puntos--;
    if (puntos < 0) puntos = 0;
    pintarMarcador();

    esperando = true;
    carta1.classList.add('fallada');
    carta2.classList.add('fallada');

    var c1 = carta1;
    setTimeout(function () {
      c1.classList.remove('girada', 'fallada');
      carta2.classList.remove('girada', 'fallada');
      carta1 = null;
      esperando = false;
    }, 800);
  }
}

function fin(ganado) {
  if (!jugando) return;
  jugando = false;
  clearInterval(reloj);

  if (ganado && tiempo > 0) {
    puntos += 40;
    document.getElementById('titulo-final').textContent = '¡Junta aprobada!';
    document.getElementById('texto-final').textContent = 'Te han sobrado ' + tiempo + ' segundos, +40 puntos';
  } else {
    document.getElementById('titulo-final').textContent = 'Se levanta la sesion';
    document.getElementById('texto-final').textContent = 'Se acabo el tiempo';
  }

  pintarMarcador();
  document.getElementById('puntos-final').textContent = puntos;
  document.getElementById('ventana-final').classList.remove('oculto');

  // guardar en la base de datos
  fetch('/api/ranking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: nombre, puntos: puntos })
  });
}

document.getElementById('boton-jugar').onclick = pedirNombre;
document.getElementById('boton-cancelar').onclick = cancelar;
document.getElementById('formulario-nombre').onsubmit = aceptarNombre;
document.getElementById('boton-repetir').onclick = empezar;
document.getElementById('boton-salir').onclick = irInicio;

irInicio();
