import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
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
//cambie todas las instancias de "frontAr" por "image" tener en cuenta por
//si durante pruebas hay un error, de lo contrario eliminar esta linea
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
let meshLoaded = false;

function onResultsPose(results) {
  if (!meshLoaded) {
      console.log("Mesh Loaded");
      meshLoaded = true;
      document.getElementById('loading').style.display = 'none';
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
    });
    drawImage(results.poseLandmarks)
  }
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

function updateY(factor) {
  upAndDown += factor
  newYposition = upAndDown * translationDistance;
}

function updateZoom(factor) {
  zoomInAndOut += factor;
  newScale = 1 + (zoomInAndOut * 0.05);
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
  const distX = (x1 - x2) / 2  * newScale
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
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  }
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