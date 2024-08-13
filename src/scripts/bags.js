import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking } from "./Utils/simulation.js"
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
    simImage(results.poseLandmarks, 11, 23)
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
    const x0 = (rsl[node1 + simulation.config.relativePosition].x) //hombro izquierdo
    const y0 = (rsl[node1 + simulation.config.relativePosition].y)
    const x1 = (rsl[node2 + simulation.config.relativePosition].x) //cadera izquierdo
    const y1 = (rsl[node2 + simulation.config.relativePosition].y)

    const torsosHeight = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * 1.0 * (1 + (simulation.config.zoomInAndOut * 0.05)) //ancho entre hombros
    const torsosWidth = (torsosHeight * simulation.img.front.width) / simulation.img.front.height * 1.0 //largo del hombro a la cadera

    ctx.drawImage(simulation.img.front, x0 - (torsosWidth / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), y0 * 0.9 - (simulation.config.upAndDown * simulation.config.translationDistance), torsosWidth, torsosHeight)
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);