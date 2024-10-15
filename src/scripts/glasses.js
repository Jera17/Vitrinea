import { fetched } from "./Utils/dataBase.js"
import { initializeFaceTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, startIntervals
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
startIntervals();
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);
modeSelector();

function onResultsFaceMesh(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    simImage(results.multiFaceLandmarks[0], 127, 356, 168)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function simImage(rsl, nodes1, nodes2, nodes3) {
  try {
    ctx.save()
    const x0 = rsl[nodes1].x
    const y0 = rsl[nodes1].y
    const x1 = rsl[nodes2].x
    const y1 = rsl[nodes2].y
    const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * (1 + (simulation.config.zoomInAndOut * 0.05)) //Distancia de cien a cien
    const sizeY = (sizeX * simulation.img.front.height) / simulation.img.front.width //Escala la altura de la imagen con respecto a su ancho 
    const originX = rsl[nodes3].x
    const originY = rsl[nodes3].y
    ctx.translate(originX, originY)
    const angle = Math.atan((y1 - y0) / (x1 - x0))
    ctx.rotate(angle)
    ctx.drawImage(simulation.img.front, 0 - (sizeX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), 0 - (sizeY / 3) - (simulation.config.upAndDown * simulation.config.translationDistance), sizeX, sizeY)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializeFaceTracking(video, onResultsFaceMesh);