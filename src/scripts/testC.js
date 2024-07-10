import { fetched } from "./models.js"

//Crear Variables
const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
const loaded = document.getElementsByClassName('loading')[0];

const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');
const carousel = document.querySelector(".carouselButtons");
const buttonPading = parseInt(window.getComputedStyle(buttons[0]).paddingLeft) * 2
var activeButton = buttonsCarousel[0]

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

const buttonFloatingImg1 = document.createElement('img');
const buttonFloatingImg2 = document.createElement('img');

buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = 'Tamaño'
buttonFloating2.id = 'Tamaño'

const nodes = [127, 356, 168];
let idModel = 0
let image = new Image();
let manualAjust = 10
let translationDistance = 5
let upAndDown = 0
let newYposition = 0
let leftAndRight = 0
let newXposition = 0
let zoomInAndOut = 0
let newScale = 1
let webLoaded = false;
image.src = fetched.frontAR[idModel]

//Funcion donde se genera el trackeo de cuerpo
function onResultsFaceMesh(results) {
  if (!webLoaded) {
    webLoaded = true;
    console.log("Mesh Loaded");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    loaded.classList.add('fadeOut');
    setTimeout(() => {
      loaded.classList.remove('fadeOut');
      loaded.style.display = 'none';
    }, 500);
  }
  //Si se realizó el trackeo, dibujar sobre este la simulación
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  //Limpia el canva para que se pueda dibujar el siguiente frame de la simulación
  if (results.multiFaceLandmarks[0]) {
    //Escalar el trackeo para que se ajuste al tamaño de la imagen
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
      drawPoints(multiFaceLandmarks.x, multiFaceLandmarks.y, 2, "red")
    });
    //dibujar simulación
    simImage(results.multiFaceLandmarks[0])
    drawPoints(results.multiFaceLandmarks[0][nodes[0]].x, results.multiFaceLandmarks[0][nodes[0]].y, 4, "blue")
    drawPoints(results.multiFaceLandmarks[0][nodes[1]].x, results.multiFaceLandmarks[0][nodes[1]].y, 4, "blue")
  }
}

function drawPoints(x, y, r, c) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); // Using arc() method to draw a circle representing the point
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();
}

//Cuando se scrollea el carrusel
carousel.addEventListener("scroll", () => {
  const carouselRect = carousel.getBoundingClientRect();
  buttonsCarousel.forEach(button => {
    const buttonRect = button.getBoundingClientRect();
    const buttonCenter = buttonRect.left + (buttonRect.width / 2) - carouselRect.left + buttonPading;
    if (buttonCenter >= carouselRect.width / 2 && buttonCenter <= carouselRect.width / 2 + buttonRect.width) {
      if (button != activeButton) { //Si el boton clickeado no es el activo, desplazarse hacia el y activarlo
        buttonsCarousel.forEach(btn => btn.classList.remove("active"));
        carouselButtonsLogic(button)
        button.classList.add("active");
        activeButton = button
      }
    }
  });
});

//Cuando se clicka un boton
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (webLoaded === true) {
      switch (this.className) {
        case "buttonCarousel":
        case "buttonCarousel active":
          //Desplazar al boton activo
          const scrollLeft = button.offsetLeft - (carousel.offsetWidth - button.offsetWidth) / 2;
          carousel.scrollTo({
            left: scrollLeft,
            behavior: "smooth"
          });
          break;
        case "buttonPhoto":
          screenShot()
          break;
        case "buttonCam":
          flipCamera()
          break;
        case "timer":
          timerStart(this, 5, screenShot)
          break;
        case "buttonFloating1":
          floatingButtonsLogic(this, -1)
          break;
        case "buttonFloating2":
          floatingButtonsLogic(this, 1)
          break;
        default:
          console.log("error")
          break;
      }
    }
  });
});

//Cuando se clicka un boton del carrusel, se activa solo ese boton
function carouselButtonsLogic(buttonClicked) {
  buttonsCarousel.forEach(button => button.classList.remove('active'));
  buttonClicked.classList.add('active');
  console.log('Botón clickeado:', buttonClicked.textContent);
  const iconMap = {
    'Ajustar': ['AjustarAcercar.svg', 'AjustarAlejar.svg', 'Ajustar'],
    'Tamaño': ['TamañoMenos.svg', 'TamañoMas.svg', 'Tamaño'],
    'Modelo': ['ModeloAnterior.svg', 'ModeloSiguiente.svg', 'Modelo'],
    'Posición': ['PosicionAbajo.svg', 'PosicionArriba.svg', 'Posición']
  };
  const icons = iconMap[buttonClicked.textContent];
  if (icons) {
    [buttonFloatingImg1.src, buttonFloatingImg2.src] = icons.slice(0, 2).map(icon => `../src/assets/icons/${icon}`);
    buttonFloating1.id = buttonFloating2.id = icons[2];
  }
}

//Los botones flotantes llaman a una funcion con respecto a su ID
function floatingButtonsLogic(buttonClicked, factor) {
  const logicMap = {
    'Ajustar': () => updateX(factor),
    'Tamaño': () => updateZoom(factor),
    'Modelo': () => updateCounter(factor),
    'Posición': () => updateY(factor)
  };
  const logicFunction = logicMap[buttonClicked.id];
  if (logicFunction) logicFunction();
}

//Actualiza la posicion en Y del elemento segun el factor (1 o -1), y lo acumula en una variable contador y multiplica por una constante
function updateY(factor) {
  if (Math.abs(upAndDown + factor) <= manualAjust) { //Si el contador + 1 es <= a la variable de cuantas veces se puede ajustar manualmente
    upAndDown += factor
    newYposition = upAndDown * translationDistance;
  }
}
//Actualiza la poel tamaño del elemento segun el factor (1 o -1), y lo acumula en una variable contador y multiplica por una constante
function updateZoom(factor) {
  if (Math.abs(zoomInAndOut + factor) <= manualAjust) { //Si el contador + 1 es <= a la variable de cuantas veces se puede ajustar manualmente
    zoomInAndOut += factor;
    newScale = 1 + (zoomInAndOut * 0.05);
  }
}
//Recorrer el array de imagenes
function updateCounter(factor) {
  idModel = (idModel + factor + fetched.frontAR.length) % fetched.frontAR.length;
  console.log(idModel)
  image.src = fetched.frontAR[idModel]
}
//Funcion de cuenta regresiva
function timerStart(botonTimer, segundos, callback) {
  const cuentaRegresivaElemento = document.getElementById('cuenta-regresiva');
  botonTimer.disabled = true;
  console.log(botonTimer)
  console.log("Deshabilitado")

  const intervalo = setInterval(() => {
    cuentaRegresivaElemento.textContent = segundos;
    console.log(segundos);
    segundos--;

    if (segundos < 0) {
      clearInterval(intervalo);
      cuentaRegresivaElemento.textContent = "";
      callback();

      cuentaRegresivaElemento.classList.add('blink');
      setTimeout(() => {
        cuentaRegresivaElemento.classList.remove('blink');
      }, 1000);

      botonTimer.disabled = false;
      console.log(botonTimer)
      console.log("Habilitado")
    }
  }, 1000);
}

//Utilizar la camara de atras/adelante
function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function screenShot() {
  const combinedCanvas = document.createElement('canvas'); //Crea canva para dibujar la simulacion y video sobre este
  const combinedCtx = combinedCanvas.getContext('2d');

  combinedCanvas.width = video.videoWidth;
  combinedCanvas.height = video.videoHeight;
  combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);//dibuja simulacion y video en el canva combinado
  combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

  let image_data_url = combinedCanvas.toDataURL('image/jpeg'); //convertir a jpeg
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click(); //empezar descarga de imagen
}

function simImage(rsl) {
  //Nodos de la simulacion cien izquirda, cien derecha y centro puente de la nariz
  ctx.save()
  const x0 = rsl[nodes[0]].x
  const y0 = rsl[nodes[0]].y
  const x1 = rsl[nodes[1]].x
  const y1 = rsl[nodes[1]].y
  const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale //Distancia de cien a cien
  const sizeY = (sizeX * image.height) / image.width //Escala la altura de la imagen con respecto a su ancho 
  const originX = rsl[nodes[2]].x
  const originY = rsl[nodes[2]].y
  ctx.translate(originX, originY) //poner el origen de imagen en el puente de la nariz
  const angleHead = Math.atan((y1 - y0) / (x1 - x0)) //calcula la inclinacion de la cabeza para inclinar la imagen
  ctx.rotate(angleHead)
  ctx.drawImage(image, 0 - (sizeX / 2) + newXposition, 0 - (sizeY / 3) - newYposition, sizeX, sizeY)
  drawPoints(0 - (sizeX / 2) + newXposition + (sizeX / 2), 0 - (sizeY / 3) - newYposition + (sizeY / 2), 4, "green")
  ctx.restore()
}
//tracking de rostro
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  }
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResultsFaceMesh);

//Configuracion de la camara
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 854,
  height: 480,
  facingMode: "environment"
});
camera.start();