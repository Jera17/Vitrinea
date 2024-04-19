import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

var idModel = 0
var imgFront = new Image();
var imgBack = new Image();
updateModel(idModel)


var nodes = [11, 25] //Hombros-Cintura: [12, 11, 23], Hombros-Rodilla: [12, 11, 25], Hombros-Tobillo: [12, 11, 27]

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
let isFrontCamera = true;

function onResultsPose(results) {
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

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    switch (button.id) {
      case "Up":
      case "Down":
        updateY(button.id);
        break;
      case "Left":
      case "Right":
        updateX(button.id);
        break;
      case "ChangeLeft":
      case "ChangeRight":
        updateCounter(button.id);
        break;
      case "FlipCamera":
        flipCamera()
        break;
      case "ScreenShot":
        screenShot()
        break;
      default:
        console.log("Unknown button clicked");
    }
  });
});

function updateY(buttonId) {
  if (buttonId === "Up" && upAndDown < manualAjust) {
    upAndDown++;
  } else if (buttonId === "Down" && upAndDown > -manualAjust) {
    upAndDown--;
  }
  newYposition = upAndDown * translationDistance;
}

function updateX(buttonId) {
  if (buttonId === "Left" && leftAndRight < manualAjust) {
    leftAndRight++;
  } else if (buttonId === "Right" && leftAndRight > -manualAjust) {
    leftAndRight--;
  }
  newXposition = leftAndRight * translationDistance;
}

function updateCounter(operator) {
  idModel = (operator === 'ChangeRight') ? (idModel + 1) % fetched.frontAR.length : (idModel - 1 + fetched.frontAR.length) % fetched.frontAR.length;
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
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
}

function getCoords(rsl, nodes) {
  const x0 = (rsl[nodes[0]].x) //hombro izquierdo
  const y0 = (rsl[nodes[0]].y)
  const x1 = (rsl[nodes[0]+1].x) //hombro derecho
  const y1 = (rsl[nodes[0]+1].y)
  const x2 = (rsl[nodes[1]].x) //cadera izquierdo
  const y2 = (rsl[nodes[1]].y)
  const x3 = (rsl[nodes[1]+1].x) //cadera derecha
  const y3 = (rsl[nodes[1]+1].y)
  const Xcenter = (x0 + x1 + x2 + x3)/4 
  const Ycenter = (y0 + y1 + y2 + y3)/4
  
  const shoulderWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * 1.7 //ancho entre hombros
  const torsosHeight = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * 1.2 //largo del hombro a la cadera
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
  const selectedImage = result[2]<0 ? imgFront : imgBack
  ctx.drawImage(selectedImage, Xcenter - (shoulderWidth/2) + newXposition, Ycenter - (torsosHeight/2) - newYposition, shoulderWidth, torsosHeight)
}

function updateModel(newIdModel) {
  imgFront.src = fetched.frontAR[newIdModel];
  imgBack.src = fetched.backAR[newIdModel] ? fetched.backAR[newIdModel] : fetched.frontAR[newIdModel];
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