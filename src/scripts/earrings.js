import { fetched } from "./Utils/dataBase.js"
import { initializeFaceTracking } from "./Utils/simulation.js"
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

function onResultsFaceMesh(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    simImage(results.multiFaceLandmarks[0], 323, 361, 401, 1)
    simImage(results.multiFaceLandmarks[0], 93, 132, 177, -1)
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function simImage(rsl, Node1, Node2, Node3, Orientation) {
  try {
    const x0 = rsl[Node1].x
    const y0 = rsl[Node1].y
    const x1 = rsl[Node2].x
    const y1 = rsl[Node2].y
    const x2 = rsl[Node3].x
    const y2 = rsl[Node3].y
    const AuxOrigenX = ((x0 - x2) + (x0 + x2) / 2)
    const AuxOrigenY = (y0 + y1) / 2

    const xEarring = ((x0 + x1) / 2) + ((x0 - x1) * 0.75)
    if (x0 * Orientation > x2 * Orientation) {
      const imageWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * (1 + (simulation.config.zoomInAndOut * 0.05))
      const imageHeight = (simulation.img.front.height * imageWidth) / simulation.img.front.width
      ctx.drawImage(simulation.img.front, AuxOrigenX - (imageWidth / 2) + ((simulation.config.leftAndRight * simulation.config.translationDistance) * Orientation), AuxOrigenY - (imageWidth / 2) - (simulation.config.upAndDown * simulation.config.translationDistance), imageWidth, imageHeight)
    }
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}
initializeFaceTracking(video, onResultsFaceMesh);