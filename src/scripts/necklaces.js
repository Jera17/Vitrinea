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
    drawImage(results.poseLandmarks, 11, 12, 0)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function drawImage(rst, node1, node2, node3) {
  try {
    ctx.beginPath();
    const x1 = rst[node1].x
    const y1 = rst[node1].y
    const x2 = rst[node2].x
    const y2 = rst[node2].y
    const x3 = rst[node3].x
    const y3 = rst[node3].y
    const tanX = (x1 + x2) / 2
    const tanY = (((y1 + y2) / 2) + (y3 * 1.2)) / 2
    const distX = (x1 - x2) / 2 * (1 + (simulation.config.zoomInAndOut * 0.05))
    const distY = (distX * simulation.img.front.height) / simulation.img.front.width

    ctx.drawImage(simulation.img.front, tanX - (distX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), tanY - (simulation.config.upAndDown * simulation.config.translationDistance), distX, distY)
    ctx.closePath();
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);