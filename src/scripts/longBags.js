import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking } from "./Utils/simulation.js"
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

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
    });
    simImage(results.poseLandmarks, 11, 25)
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
    const x0 = (rsl[node1 + simulation.config.relativePosition].x) //hombro izquierdo
    const y0 = (rsl[node1 + simulation.config.relativePosition].y)
    const x1 = (rsl[node2 + simulation.config.relativePosition].x) //cadera izquierdo
    const y1 = (rsl[node2 + simulation.config.relativePosition].y)
    ctx.translate(x0, y0)

    const torsosHeight = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * 0.8 * (1 + (simulation.config.zoomInAndOut * 0.05)) //ancho entre hombros
    const torsosWidth = (torsosHeight * simulation.img.front.width) / simulation.img.front.height * 1.0 //largo del hombro a la cadera

    //set angle of the image
    const angle = Math.atan2((y1 - y0), (x1 - x0))
    ctx.rotate(angle + -Math.PI/2)

    ctx.drawImage(simulation.img.front, 0 - (torsosWidth / 2) - (simulation.config.leftAndRight * simulation.config.translationDistance), 0 * 0.9 - (simulation.config.upAndDown * simulation.config.translationDistance), torsosWidth, torsosHeight)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);