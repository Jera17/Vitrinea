import { fetched } from "./Utils/dataBase.js"
import {
  handleWebLoaded, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
    });
    simImage(results.poseLandmarks, 23, 25, 11)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched, flipCamera);
  });
});

function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function simImage(rsl, node1, node2, node3) {
  try {
    const x0 = (rsl[node1].x) //hombro izquierdo
    const y0 = (rsl[node1].y)
    const x1 = (rsl[node1 + 1].x) //hombro derecho
    const y1 = (rsl[node1 + 1].y)
    const x2 = (rsl[node2].x) //cadera izquierdo
    const y2 = (rsl[node2].y)
    const x3 = (rsl[node2 + 1].x) //cadera derecha
    const y3 = (rsl[node2 + 1].y)
    const x4 = (rsl[node2 + 1].x) //cadera derecha
    const y4 = (rsl[node3 + 1].y)
    const Xcenter = (x0 + x1 + x2 + x3) / 4
    const Ycenter = (y0 + y1 + y2 + y3) / 4

    const torsosHeightAux = Math.sqrt(Math.pow((x4 - x0), 2) + Math.pow((y4 - y0), 2)) * 0.3 //largo del hombro a la cadera
    const torsosHeight = (Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * 1.2) + torsosHeightAux * (1 + (simulation.config.zoomInAndOut * 0.05)) //largo del cadera a la rodilla
    const sizeX = (torsosHeight * simulation.img.front.width) / simulation.img.front.height
    const shoulderWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * 1.7 //ancho entre hombros
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
    const selectedImage = result[2] < 0 ? simulation.img.front : simulation.img.back
    ctx.drawImage(selectedImage,
      Xcenter - (sizeX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance),
      Ycenter - (torsosHeight / 2) - (simulation.config.upAndDown * simulation.config.translationDistance),
      sizeX + (simulation.config.leftAndRight * simulation.config.translationDistance), torsosHeight)
  } catch (error) {
    console.error('Error en simImage:', error);
  }
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