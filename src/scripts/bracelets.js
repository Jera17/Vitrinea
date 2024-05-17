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

buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = 'Tamaño'
buttonFloating2.id = 'Tamaño'

var idModel = 0
var imgFront = new Image();
var imgBack = new Image();
updateModel(idModel)

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
var isFrontCamera = true;

function onResultsHands(results) {
  if (loaded.style.display !== 'none') {
    loaded.style.display = 'none';
    console.log("Mesh Loaded");
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks[0]) {
    results.multiHandLandmarks[0].forEach(multiHandLandmarks => {
      multiHandLandmarks.x *= video.videoWidth
      multiHandLandmarks.y *= video.videoHeight
    });
    drawImage(results);
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
      updateFinger(factor)
      console.log("Dedo")
      break;
  }
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
  updateModel(idModel)
  console.log(idModel)
}

function updateFinger(operator) {
  fingerId = (operator > 0) ? (fingerId + 1) % 4 : (fingerId - 1 + 4) % 4;
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

function drawImage(hand) {
  const rslt = hand.multiHandLandmarks[0]
  const rslt3D = hand.multiHandWorldLandmarks[0]
  // console.log(rslt3D[0].x, rslt3D[0].y, rslt3D[0].z)
  const handeness = hand.multiHandedness[0].label === "Left" ? -1 : 1;

  ctx.save();
  const x1 = rslt[0].x
  const y1 = rslt[0].y
  const x2 = rslt[9].x
  const y2 = rslt[9].y

  ctx.beginPath()
  ctx.save()
  //set the position center of the canva and from hand
  const tanx = (x1 - x2)
  const tany = (y1 - y2)
  const pstx = x1 + tanx
  const psty = y1 + tany
  ctx.translate(pstx, psty)

  //set angle of the image
  var componenteX = 1
  if ((x1 - x2) > 0) {
    componenteX = -1
  }
  const pendiente = ((y2 - y1) / (x2 - x1))
  const angleHand = Math.atan(pendiente)
  ctx.rotate(angleHand + ((Math.PI / 2)) * componenteX)

  //Scale
  // var FingerLenght = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * 2 * newScale
  var FingerLenght = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * 2 * newScale

  //Flip (Usando producto punto)
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
  const point1A = [rslt[9].x, rslt[9].y, 0];
  const point2A = [rslt[10].x, rslt[10].y, 0];
  const point1B = [rslt[9].x, rslt[9].y, 0];
  const point2B = [rslt[13].x, rslt[13].y, 0];

  const result = crossProductFromPoints(point1A, point2A, point1B, point2B);

  const selectedImage = ((result[2] * handeness) < 0) ? imgFront : imgBack
  ctx.drawImage(selectedImage, (0 - FingerLenght / 4) + newXposition, ((0 - FingerLenght / 2) / 1.25) - newYposition, FingerLenght / 2, FingerLenght / 2)

  ctx.restore()
  ctx.closePath()
}
function updateModel(newIdModel) {
  imgFront.src = fetched.frontAR[newIdModel];
  imgBack.src = fetched.backAR ? fetched.backAR[newIdModel] : fetched.frontAR[newIdModel];
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResultsHands);

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});
camera.start();