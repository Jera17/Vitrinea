import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
var loaded = document.getElementById('loading')

const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');
const carousel = document.querySelector(".carouselButtons");
const buttonPading = parseInt(window.getComputedStyle(buttons[0]).paddingLeft) * 2
var activeButton = buttonsCarousel[0]

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

var buttonFloatingImg1 = document.createElement('img');
var buttonFloatingImg2 = document.createElement('img');

buttonFloatingImg1.src = '../src/assets/icons/AjustarAcercar.svg';
buttonFloatingImg2.src = '../src/assets/icons/AjustarAlejar.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = 'Ajustar'
buttonFloating2.id = 'Ajustar'

var idModel = 0
var imgFront = new Image();
var imgBack = new Image();
updateModel(idModel)

var nodes = [11, 23]

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 1
var zoomInAndOut = 0
var newScale = 1
let isFrontCamera = true;

function onResultsPose(results) {
  if (loaded.style.display !== 'none') {
    loaded.style.display = 'none';
    console.log("Mesh Loaded");
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
    });
    getCoords(results.poseLandmarks, nodes)
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
  });
});

function carouselButtonsLogic(buttonClicked) {
  buttonsCarousel.forEach(button => button.classList.remove('active'));
  buttonClicked.classList.add('active');
  console.log('Botón clickeado:', buttonClicked.textContent);
  switch (buttonClicked.textContent) {
    case 'Ajustar':
      buttonFloatingImg1.src = '../src/assets/icons/AjustarAcercar.svg';
      buttonFloatingImg2.src = '../src/assets/icons/AjustarAlejar.svg';
      buttonFloating1.id = 'Ajustar'
      buttonFloating2.id = 'Ajustar'
      break;
    case 'Tamaño':
      buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
      buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
      buttonFloating1.id = 'Tamaño'
      buttonFloating2.id = 'Tamaño'
      break;
    case 'Modelo':
      buttonFloatingImg1.src = '../src/assets/icons/ModeloAnterior.svg';
      buttonFloatingImg2.src = '../src/assets/icons/ModeloSiguiente.svg';
      buttonFloating1.id = 'Modelo'
      buttonFloating2.id = 'Modelo'
      break;
    case 'Posición':
      buttonFloatingImg1.src = '../src/assets/icons/PosicionAbajo.svg';
      buttonFloatingImg2.src = '../src/assets/icons/PosicionArriba.svg';
      buttonFloating1.id = 'Posición'
      buttonFloating2.id = 'Posición'
      break;
    case 'Dedo':
      buttonFloatingImg1.src = '../src/assets/icons/DedoAnterior.svg';
      buttonFloatingImg2.src = '../src/assets/icons/DedoSiguiente.svg';
      buttonFloating1.id = 'Dedo'
      buttonFloating2.id = 'Dedo'
      break;
  }
}

function floatingButtonsLogic(buttonClicked, factor) {
  switch (buttonClicked.id) {
    case 'Ajustar':
      updateX(factor)
      break;
    case 'Tamaño':
      updateZoom(factor)
      break;
    case 'Modelo':
      updateCounter(factor)
      break;
    case 'Posición':
      updateY(factor)
      break;
    case 'Dedo':
      console.log("Dedo")
      break;
  }
}

function updateX(factor) {
  console.log(newXposition)
  if (Math.abs(leftAndRight + factor) <= manualAjust) {
    leftAndRight += factor
    newXposition = 1 + (leftAndRight * 0.05);
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
  updateModel(idModel)
}

function flipCamera() {
  isFrontCamera = !isFrontCamera;
  camera.h.facingMode = isFrontCamera ? "user" : "environment";
  video.style.transform = canvas.style.transform = isFrontCamera ? "scaleX(-1)" : "scaleX(1)";
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

function getCoords(rsl, nodes) {
  const x0 = (rsl[nodes[0]].x) //hombro izquierdo
  const y0 = (rsl[nodes[0]].y)
  const x1 = (rsl[nodes[0] + 1].x) //hombro derecho
  const y1 = (rsl[nodes[0] + 1].y)
  const x2 = (rsl[nodes[1]].x) //cadera izquierdo
  const y2 = (rsl[nodes[1]].y)
  const x3 = (rsl[nodes[1] + 1].x) //cadera derecha
  const y3 = (rsl[nodes[1] + 1].y)
  const Xcenter = (x0 + x1 + x2 + x3) / 4
  const Ycenter = (y0 + y1 + y2 + y3) / 4

  const shoulderWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * 1.7 * newScale//ancho entre hombros
  const torsosHeight = (shoulderWidth * imgFront.height) / imgFront.width * 1.1//largo del hombro a la cadera
  const magX = x1 - x0
  const magY = y1 - y0


  function crossProductFromPoints(point1A, point2A, point1B, point2B) {
    const vectorA = [point2A[0] - point1A[0], point2A[1] - point1A[1], point2A[2] - point1A[2]];
    const vectorB = [point2B[0] - point1B[0], point2B[1] - point1B[1], point2B[2] - point1B[2]];
    const result = [
      vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
      vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
      vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
    ];
    return result;
  }

  // Ejemplo de uso:
  const point1A = [x0, y0, 0];
  const point2A = [x1, y1, 0];
  const point1B = [x0, y0, 0];
  const point2B = [x2, y2, 0];

  const result = crossProductFromPoints(point1A, point2A, point1B, point2B);
  const selectedImage = result[2] < 0 ? imgFront : imgBack
  ctx.drawImage(selectedImage, Xcenter - (shoulderWidth * newXposition / 2), Ycenter - (torsosHeight / 2) - newYposition, shoulderWidth * newXposition, torsosHeight)
}

function updateModel(newIdModel) {
  imgFront.src = fetched.frontAR[newIdModel];
  imgBack.src = fetched.backAR ? fetched.backAR[newIdModel] : fetched.frontAR[newIdModel];
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
  width: 1280,
  height: 720
});
camera.start();