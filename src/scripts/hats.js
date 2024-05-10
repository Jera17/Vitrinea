import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
var loaded = document.getElementById('loading')

const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

var buttonFloatingImg1 = buttonFloating1.querySelector('img');
var buttonFloatingImg2 = buttonFloating2.querySelector('img');

buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
buttonFloating1.id = 'Tamaño'
buttonFloating2.id = 'Tamaño'

var idModel = 0
var image = new Image();
image.src = fetched.frontAR[idModel]

const manualAjust = 10
var translationDistance = 5
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
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

  if (results.multiFaceLandmarks) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    imageDraw(results.multiFaceLandmarks[0])
    // drawPoints(results.multiFaceLandmarks[0][162].x, results.multiFaceLandmarks[0][162].y, 3, "yellow")
    // drawPoints(results.multiFaceLandmarks[0][389].x, results.multiFaceLandmarks[0][389].y, 3, "blue")
    // drawPoints(results.multiFaceLandmarks[0][10].x, results.multiFaceLandmarks[0][10].y, 3, "red")
    // drawPoints(results.multiFaceLandmarks[0][0].x, results.multiFaceLandmarks[0][4].y, 3, "purple")
  }
}


function drawPoints(x, y, r, c) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); // Using arc() method to draw a circle representing the point
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
          console.log("Ajustar")
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
  console.log(image_data_url)
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
}

function imageDraw(rsl) {
  const nodes = [162, 389, 10, 0];  //Right, left, center
  ctx.save()
  const x0 = rsl[nodes[0]].x
  const y0 = rsl[nodes[0]].y
  const x1 = rsl[nodes[1]].x
  const y1 = rsl[nodes[1]].y
  const x2 = rsl[nodes[2]].x
  const y2 = rsl[nodes[2]].y
  const x3 = rsl[nodes[3]].x
  const y3 = rsl[nodes[3]].y

  const sizeY = Math.sqrt(Math.pow((x3 - x2), 2) + Math.pow((y3 - y2), 2)) * newScale * 1.25
  const sizeX = (sizeY * image.width) / image.height
  // const originX = x2
  const originX = (x1 + x0) / 2
  const originY = y2
  ctx.translate(originX, originY)
  const angleHead = Math.atan((y1 - y0) / (x1 - x0))
  ctx.rotate(angleHead)
  ctx.drawImage(image, 0 - (sizeX / 2) + newXposition, 0 - (sizeY / 1.3) - newYposition, sizeX, sizeY)
  ctx.restore()
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  }
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 1280,
  height: 720
});
camera.start();