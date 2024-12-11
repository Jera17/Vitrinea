import { fetched } from "./Utils/dataBase.js"
import { initializeFaceTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, drawPoint, startIntervals
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
startIntervals();
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);
modeSelector();

const outerLips = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61]
const innerLips = [13, 14, 78, 80, 81, 82, 87, 88, 95, 178, 191, 308, 310, 311, 312, 317, 318, 324, 402, 415]

function onResultsFaceMesh(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    // Calcula y recorta la imagen del video según los puntos de innerLips
    const cropArea = calculateBoundingBox(results.multiFaceLandmarks[0], outerLips);
    cropAndDrawImage(cropArea);
    drawBoundingBox(cropArea);
    // drawPointsArray(results.multiFaceLandmarks[0], outerLips, 'blue');
    // drawPointsArray(results.multiFaceLandmarks[0], innerLips, 'green');
  }
}

function drawPointsArray(landmarks, pointsArray, color) {
  ctx.beginPath();
  for (let i = 0; i < pointsArray.length; i++) {
    const index = pointsArray[i];
    const point = landmarks[index];
    drawPoint(ctx, point.x, point.y, 2, color);
  }
  ctx.closePath();
}

// Calcula el bounding box (área de recorte)
function calculateBoundingBox(landmarks, pointsArray) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < pointsArray.length; i++) {
    const point = landmarks[pointsArray[i]];
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  // Devolver el área de recorte
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Recorta y dibuja la imagen sobre el canvas
function cropAndDrawImage(cropArea) {
  // Recorta la imagen del video y dibújala sobre el canvas
  ctx.drawImage(
    video,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,  // Área a recortar
    cropArea.x, cropArea.y, cropArea.width, cropArea.height   // Dibuja en el canvas
  );
}

function drawBoundingBox(cropArea) {
  ctx.strokeStyle = 'red'; // Color del borde de la caja
  ctx.lineWidth = 2; // Grosor de la línea
  ctx.beginPath();
  ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height); // Dibuja el rectángulo
  ctx.stroke(); // Aplica el trazo
}

initializeFaceTracking(video, onResultsFaceMesh);