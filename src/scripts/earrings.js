import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
var loaded = document.getElementById('loading')

const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

var buttonFloatingImg1 = buttonFloating1.querySelector('img');
var buttonFloatingImg2 = buttonFloating2.querySelector('img');

buttonFloatingImg1.src = '../src/assets/icons/AjustarAcercar.svg';
buttonFloatingImg2.src = '../src/assets/icons/AjustarAlejar.svg';
buttonFloating1.id = 'Ajustar'
buttonFloating2.id = 'Ajustar'

var idModel = 0
var image = new Image();
image.src = fetched.frontAR[idModel]

const manualAjust = 10
var translationDistance = 2
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
let isFrontCamera = true;

function onResultsFaceMesh(results) {
  if (loaded.style.display !== 'none') {
    loaded.style.display = 'none';
    console.log("Mesh Loaded");
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    imageDraw(results.multiFaceLandmarks[0], 323, 361, 401, 1)
    imageDraw(results.multiFaceLandmarks[0], 93, 132, 177, -1)
  }
}

function drawPoints(f, a, r, c) {
  ctx.beginPath();
  ctx.arc(f[a].x, f[a].y, r, 0, 2 * Math.PI);
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    switch (this.className) {
      case "buttonCarousel":
      case "buttonCarousel active":
        carouselButtonsLogic(this)
        break;
      case "buttonPhoto":
        photoButtonsLogic()
        break;
      case "buttonCam":
        camButtonsLogic()
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

function photoButtonsLogic() {
  screenShot()
}

function camButtonsLogic(buttonClicked) {
  console.log("uwu")
  flipCamera()
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
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
}


function imageDraw(rsl, Node1, Node2, Node3, Orientation) {
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
  height: 480
});
camera.start();
