import { fetched } from "./Utils/dataBase.js"
import { initializeHandTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, crossProductFromPoints, startIntervals
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
startIntervals();
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);
modeSelector();

function onResultsHands(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.multiHandLandmarks[0]) {
    results.multiHandLandmarks[0].forEach(multiHandLandmarks => {
      multiHandLandmarks.x *= video.videoWidth
      multiHandLandmarks.y *= video.videoHeight
    });
    simImage(results);
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function simImage(hand) {
  try {
    const rslt = hand.multiHandLandmarks[0]
    const handeness = hand.multiHandedness[0].label === "Left" ? -1 : 1;

    ctx.save();
    const x1 = rslt[0].x
    const y1 = rslt[0].y
    const x2 = rslt[9].x
    const y2 = rslt[9].y
    ctx.beginPath()
    ctx.save()
    //set the position center of the canva and from hand 
    const pstx = x1 + (x1 - x2) //Muñeca + (punto medio entre la muñeca y el nudillo)
    const psty = y1 + (y1 - y2)
    ctx.translate(pstx, psty)

    //set angle of the image
    var componenteX = (x1 - x2) > 0 ? -1 : 1;
    const angle = Math.atan((y2 - y1) / (x2 - x1))
    ctx.rotate(angle + ((Math.PI / 2) * componenteX))

    //Scale
    var scaleHand = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * 2 * (1 + (simulation.config.zoomInAndOut * 0.05))
    var sizeX = scaleHand / 2
    var sizeY = (sizeX * simulation.img.front.height) / simulation.img.front.width

    //Flip (Usando producto punto)

    // Ejemplo de uso:
    const point1A = [rslt[9].x, rslt[9].y, 0];
    const point2A = [rslt[10].x, rslt[10].y, 0];
    const point1B = [rslt[9].x, rslt[9].y, 0];
    const point2B = [rslt[13].x, rslt[13].y, 0];

    const result = crossProductFromPoints(point1A, point2A, point1B, point2B);

    const selectedImage = ((result[2] * handeness) < 0) ? simulation.img.front : simulation.img.back
    ctx.drawImage(selectedImage, (0 - scaleHand / 4) + (simulation.config.leftAndRight * simulation.config.translationDistance), ((0 - scaleHand / 2) / 1.25) - (simulation.config.upAndDown * simulation.config.translationDistance), sizeX, sizeY)

    ctx.restore()
    ctx.closePath()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializeHandTracking(video, onResultsHands);