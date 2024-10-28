import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, startIntervals,
  drawPoint
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
    ctx.save()
    const x1 = rst[node1].x
    const y1 = rst[node1].y
    const x2 = rst[node2].x
    const y2 = rst[node2].y
    const x3 = rst[node3].x
    const y3 = rst[node3].y
    // const originX = (x1 + x2) / 2;
    const originX = (x1 + x2 + x3) / 3;
    const originY = (y1 + y2 + y3) / 3;
    ctx.translate(originX, originY)
    // const tanX = (x1 + x2) / 2
    // const tanY = (((y1 + y2) / 2) + (y3 * 1.2)) / 2
    const distX = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2 * (1 + (simulation.config.zoomInAndOut * 0.05))
    const distY = (distX * simulation.img.front.height) / simulation.img.front.width

    //set angle of the image
    const angle = Math.atan2((y2 - y1), (x2 - x1))
    ctx.rotate(angle + Math.PI)

    ctx.drawImage(simulation.img.front, 0 - (distX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), 0 - (simulation.config.upAndDown * simulation.config.translationDistance), distX, distY)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);