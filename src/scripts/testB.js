import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, drawPoint, crossProductFromPoints, updateCounterRotating, startIntervals, getRangeValue
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
let giroID = 0;
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
    drawImage(results.poseLandmarks, 11, 23)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});


function drawImage(rsl, node1, node2) {
  try {
    ctx.save()
    const x0 = (rsl[node1].x) //hombro izquierdo
    const y0 = (rsl[node1].y)
    const x1 = (rsl[node1 + 1].x) //hombro derecho
    const y1 = (rsl[node1 + 1].y)
    const x2 = (rsl[node2].x) //cadera izquierdo
    const y2 = (rsl[node2].y)
    const x3 = (rsl[node2 + 1].x) //cadera derecha
    const y3 = (rsl[node2 + 1].y)
    const Xcenter = (x0 + x1 + x2 + x3) / 4
    const Ycenter = (y0 + y1 + y2 + y3) / 4
    ctx.translate(Xcenter, Ycenter)

    const torsosHeight = Math.sqrt(Math.pow((x2 - x0), 2) + Math.pow((y2 - y0), 2)) * 1.3 * (1 + (simulation.config.zoomInAndOut * 0.05))
    const shoulderWidth = (torsosHeight * simulation.img.front.width) / simulation.img.front.height

    const x = Math.abs(rsl[11].x - rsl[12].x);
    const z = Math.abs(rsl[11].z - rsl[12].z);

    const valor = rsl[11].z - rsl[12].z < 0 ? 1 : -1;
    const resultado = z / x;

    giroID = getRangeValue(resultado * valor);
    let giroAux

    if (giroID != giroAux) {
      switch (giroID) {
        case 0:
          simulation.img.selectedImage = simulation.img.front;
          break;
        case 1:
          simulation.img.selectedImage = simulation.img.frontRight;
          break;
        case -1:
          simulation.img.selectedImage = simulation.img.frontLeft;
          break;
      }
      giroID = giroAux;
    }

    ctx.drawImage(
      simulation.img.selectedImage,
      0 - (shoulderWidth / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), 0 - (torsosHeight / 2) - (simulation.config.upAndDown * simulation.config.translationDistance), shoulderWidth + (simulation.config.leftAndRight * simulation.config.translationDistance), torsosHeight)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);