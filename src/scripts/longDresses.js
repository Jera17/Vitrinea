import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, crossProductFromPoints, startIntervals,
  getRangeValue, girarModelo
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
let giroID = 0;
let giroAux
startIntervals();
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);
modeSelector();

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
      poseLandmarks.z *= video.videoWidth
    });
    simImage(results.poseLandmarks, 11, 27)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function simImage(rsl, node1, node2) {
  try {
    ctx.save()
    const x0 = (rsl[node1].x)
    const y0 = (rsl[node1].y)
    const x1 = (rsl[node1 + 1].x)
    const y1 = (rsl[node1 + 1].y)
    const x2 = (rsl[node2].x)
    const y2 = (rsl[node2].y)
    const x3 = (rsl[node2 + 1].x)
    const y3 = (rsl[node2 + 1].y)
    //Punto de origen
    const Xcenter = (x0 + x1 + x2 + x3) / 4
    const Ycenter = (y0 + y1 + y2 + y3) / 4
    ctx.translate(Xcenter, Ycenter)
    //Tamaño de la simulacion
    const torsosHeight = Math.sqrt(Math.pow((x2 - x0), 2) + Math.pow((y2 - y0), 2)) * 1.2 * (1 + (simulation.config.zoomInAndOut * 0.05))
    const shoulderWidth = (torsosHeight * simulation.img.front.width) / simulation.img.front.height
    //Rotacion de la simulacion
    const x = Math.abs(rsl[11].x - rsl[12].x);
    const z = Math.abs(rsl[11].z - rsl[12].z);
    const valor = rsl[11].z - rsl[12].z < 0 ? 1 : -1;
    const resultado = z / x;
    giroID = getRangeValue(resultado * valor);
    //Saber si está mirando hacia adelante o hacia atrás
    const point1A = [x0, y0, 0];
    const point2A = [x1, y1, 0];
    const point1B = [x0, y0, 0];
    const point2B = [x2, y2, 0];
    const result = crossProductFromPoints(point1A, point2A, point1B, point2B);
    const isFront = result[2] <= 0 ? 1 : 0;
    //Giro de la simulacion
    const angle = Math.atan2((y1 - y0), (x1 - x0))
    ctx.rotate(angle + (Math.PI * isFront))
    giroAux = girarModelo(giroID, giroAux, simulation);
    //Dibujar la simulacion
    ctx.drawImage(
      simulation.img.selectedImage,
      0 - (shoulderWidth / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance),
      0 - (torsosHeight / 2) - (simulation.config.upAndDown * simulation.config.translationDistance),
      shoulderWidth + (simulation.config.leftAndRight * simulation.config.translationDistance),
      torsosHeight)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);