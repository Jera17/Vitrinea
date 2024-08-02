import { fetched } from "./Utils/dataBase.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
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

buttonFloatingImg1.src = '../src/assets/icons/AjustarAcercar.svg';
buttonFloatingImg2.src = '../src/assets/icons/AjustarAlejar.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = 'Ajustar'
buttonFloating2.id = 'Ajustar'

let idModel = 0
let image = new Image();
let manualAjust = 10
let translationDistance = 2
let upAndDown = 0
let newYposition = 0
let leftAndRight = 0
let newXposition = 0
let zoomInAndOut = 0
let newScale = 1
let webLoaded = false;
image.src = fetched.frontAR[idModel]

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    simImage(results.multiFaceLandmarks[0], 323, 361, 401, 1)
    simImage(results.multiFaceLandmarks[0], 93, 132, 177, -1)
  }
}

carousel.addEventListener("scroll", () => {
  const carouselRect = carousel.getBoundingClientRect();
  buttonsCarousel.forEach(button => {
    const buttonRect = button.getBoundingClientRect();
    const buttonCenter = buttonRect.left + (buttonRect.width / 2) - carouselRect.left + buttonPading;
    if (buttonCenter >= carouselRect.width / 2 && buttonCenter <= carouselRect.width / 2 + buttonRect.width) {
      if (button != activeButton) {
        buttonsCarousel.forEach(btn => btn.classList.remove("active"));
        carouselButtonsLogic(button)
        button.classList.add("active");
        activeButton = button
      }
    }
  });
});

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (webLoaded === true) {
      switch (this.className) {
        case "buttonCarousel":
        case "buttonCarousel active":
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
          console.error("Unhandled button class: ", this.className);
          break;
      }
    }
  });
});

function carouselButtonsLogic(buttonClicked) {
  buttonsCarousel.forEach(button => button.classList.remove('active'));
  buttonClicked.classList.add('active');
  console.log('Botón clickeado:', buttonClicked.textContent);
  const iconMap = {
    'Ajustar': ['AjustarAcercar.svg', 'AjustarAlejar.svg', 'Ajustar'],
    'Tamaño': ['TamañoMenos.svg', 'TamañoMas.svg', 'Tamaño'],
    'Modelo': ['ModeloAnterior.svg', 'ModeloSiguiente.svg', 'Modelo'],
    'Posición': ['PosicionAbajo.svg', 'PosicionArriba.svg', 'Posición'],
    'Dedo': ['DedoAnterior.svg', 'DedoSiguiente.svg', 'Dedo']
  };
  const icons = iconMap[buttonClicked.textContent];
  if (icons) {
    [buttonFloatingImg1.src, buttonFloatingImg2.src] = icons.slice(0, 2).map(icon => `../src/assets/icons/${icon}`);
    buttonFloating1.id = buttonFloating2.id = icons[2];
  }
}

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

function updateX(factor) {
  if (Math.abs(leftAndRight + factor) <= manualAjust) {
    leftAndRight += factor
    newXposition = leftAndRight * translationDistance;
  }
}

function updateY(factor) {
  if (Math.abs(upAndDown + factor) <= manualAjust) {
    upAndDown += factor
    newYposition = upAndDown * translationDistance;
  }
}

function updateZoom(factor) {
  if (Math.abs(zoomInAndOut + factor) <= manualAjust) {
    zoomInAndOut += factor;
    newScale = 1 + (zoomInAndOut * 0.05);
  }
}

function updateCounter(factor) {
  idModel = (idModel + factor + fetched.frontAR.length) % fetched.frontAR.length;
  console.log(idModel)
  image.src = fetched.frontAR[idModel]
}

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
      botonTimer.disabled = false;
      console.log(botonTimer)
      console.log("Habilitado")
    }
  }, 1000);
}

function screenShot() {
  const cuentaRegresivaElemento = document.getElementById('cuenta-regresiva');
  cuentaRegresivaElemento.classList.add('blink');
  setTimeout(() => {
    cuentaRegresivaElemento.classList.remove('blink');
  }, 1000);

  const combinedCanvas = document.createElement('canvas');
  const combinedCtx = combinedCanvas.getContext('2d');

  combinedCanvas.width = video.videoWidth;
  combinedCanvas.height = video.videoHeight;
  combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
  combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

  let image_data_url = combinedCanvas.toDataURL('image/jpeg');
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
}

function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function simImage(rsl, Node1, Node2, Node3, Orientation) {
  const x0 = rsl[Node1].x
  const y0 = rsl[Node1].y
  const x1 = rsl[Node2].x
  const y1 = rsl[Node2].y
  const x2 = rsl[Node3].x
  const y2 = rsl[Node3].y
  const AuxOrigenX = ((x0 - x2) + (x0 + x2) / 2)
  const AuxOrigenY = (y0 + y1) / 2

  const xEarring = ((x0 + x1) / 2) + ((x0 - x1) * 0.75)
  if (x0 * Orientation > x2 * Orientation) {
    const imageWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale
    const imageHeight = (image.height * imageWidth) / image.width
    ctx.drawImage(image, AuxOrigenX - (imageWidth / 2) + (newXposition * Orientation), AuxOrigenY - (imageWidth / 2) - newYposition, imageWidth, imageHeight)
  }
}
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

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 854,
  height: 480,
  facingMode: "environment"
});
camera.start();