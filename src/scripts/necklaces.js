import { fetched } from "./models.js"

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

buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = 'Tamaño'
buttonFloating2.id = 'Tamaño'

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
let isFrontCamera = true;
let webLoaded = false;
image.src = fetched.frontAR[idModel]

function onResultsPose(results) {
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
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
    });
    drawImage(results.poseLandmarks)
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


function updateY(factor) {
  if (Math.abs(upAndDown + factor) <= manualAjust) {
    upAndDown += factor
    console.log(upAndDown)
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

function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function screenShot() {
  const combinedCanvas = document.createElement('canvas');
  const combinedCtx = combinedCanvas.getContext('2d');

  combinedCanvas.width = video.videoWidth;
  combinedCanvas.height = video.videoHeight;
  combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
  combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

  let image_data_url = combinedCanvas.toDataURL('image/jpeg');
  console.log(image_data_url)
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
}


function drawImage(rst) {
  ctx.beginPath();
  const x1 = rst[11].x
  const y1 = rst[11].y
  const x2 = rst[12].x
  const y2 = rst[12].y
  const x3 = rst[0].x
  const y3 = rst[0].y
  const tanX = (x1 + x2) / 2
  const tanY = (((y1 + y2) / 2) + (y3 * 1.2)) / 2
  const distX = (x1 - x2) / 2 * newScale
  const distY = (distX * image.height) / image.width

  // drawPoints(x1, y1, 6, "red")
  // drawPoints(x2, y2, 6, "blue")
  // drawPoints(x3, y3, 6, "yellow")
  // drawPoints(tanX, tanY, 8, "green")
  ctx.drawImage(image, tanX - (distX / 2) + newXposition, tanY - newYposition, distX, distY)
  ctx.closePath();
}

function drawPoints(x, y, r, c) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); // Using arc() method to draw a circle representing the point
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResultsPose);

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 854,
  height: 480,
  facingMode: "environment"
});
camera.start();
video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";