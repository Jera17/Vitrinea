const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

import { models } from "./bracelets_models.js"
var idModel = 0
var imgFront = new Image();
imgFront.src = models[idModel].front;
var imgBack = new Image();
imgBack.src = models[idModel].back;

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
let isFrontCamera = true;

function onResultsHands(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiHandLandmarks[0]) {
    drawImage(results);
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
      case "ZoomIn":
      case "ZoomOut":
        updateZoom(button.id);
        break;
      case "ChangeLeft":
      case "ChangeRight":
        updateCounter(button.id);
        break;
      case "ChangeFingerLeft":
      case "ChangeFingerRight":
        updateFinger(button.id);
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

function updateZoom(direction) {
  const delta = (direction === "ZoomIn") ? 1 : -1;
  if (zoomInAndOut + delta >= -manualAjust && zoomInAndOut + delta <= manualAjust) {
    zoomInAndOut += delta;
    newScale = 1 + (zoomInAndOut * 0.05);
  }
}

function updateCounter(operator) {
  idModel = (operator === 'ChangeRight') ? (idModel + 1) % models.length : (idModel - 1 + 3) % models.length;
  imgFront.src = models[idModel].front;
  imgBack.src = models[idModel].back;
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
  console.log(rslt3D[0].x, rslt3D[0].y, rslt3D[0].z)
  const handeness = hand.multiHandedness[0].label === "Left" ? -1 : 1;

  ctx.save();
  const x1 = rslt[0].x * video.videoWidth
  const y1 = rslt[0].y * video.videoHeight
  const x2 = rslt[9].x * video.videoWidth
  const y2 = rslt[9].y * video.videoHeight

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
  ctx.rotate(angleHand + ((Math.PI / 2))*componenteX)

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

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResultsHands);

const camera = new Camera(video, {
  onFrame: async () => { 
    await hands.send({ image: video }); },
  width: 1280,
  height: 720
});
camera.start();