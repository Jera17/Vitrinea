import { fetched } from "./Utils/dataBase.js"
import { initializeFaceTracking } from "./Utils/simulation.js"
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

function onResultsFaceMesh(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    simImage(results.multiFaceLandmarks[0], 162, 389, 10, 0)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function simImage(rsl, Node1, Node2, Node3, Node4) {
  try {
    ctx.save()
    const x0 = rsl[Node1].x
    const y0 = rsl[Node1].y
    const x1 = rsl[Node2].x
    const y1 = rsl[Node2].y
    const x2 = rsl[Node3].x
    const y2 = rsl[Node3].y
    const x3 = rsl[Node4].x
    const y3 = rsl[Node4].y

    const sizeY = Math.sqrt(Math.pow((x3 - x2), 2) + Math.pow((y3 - y2), 2)) * (1 + (simulation.config.zoomInAndOut * 0.05)) * 1.25
    const sizeX = (sizeY * simulation.img.front.width) / simulation.img.front.height
    const originX = x2
    const originY = y2
    ctx.translate(originX, originY)
    //set angle of the image
    const angle = Math.atan2((y1 - y0), (x1 - x0))
    ctx.rotate(angle + 2*Math.PI)
    
    ctx.drawImage(simulation.img.front, 0 - (sizeX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), 0 - (sizeY / 1.3) - (simulation.config.upAndDown * simulation.config.translationDistance), sizeX, sizeY)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}
initializeFaceTracking(video, onResultsFaceMesh);
