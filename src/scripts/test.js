import { fetched } from "./Utils/dataBase.js"
import { initializeHandTracking2 } from "./Utils/simulation.js"
import {
  handleWebLoaded, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, crossProductFromPoints, drawPoint
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

function onResultsHands(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  // console.log(results);
  if (results.multiHandLandmarks[0]) {
    results.multiHandLandmarks[0].forEach(multiHandLandmarks => {
      multiHandLandmarks.x *= video.videoWidth
      multiHandLandmarks.y *= video.videoHeight
      drawPoint(ctx, multiHandLandmarks.x, multiHandLandmarks.y, 5, 'red');
    });
    simImage(results, 0);
  }
  if (results.multiHandLandmarks[1]) {
    results.multiHandLandmarks[1].forEach(multiHandLandmarks => {
      multiHandLandmarks.x *= video.videoWidth
      multiHandLandmarks.y *= video.videoHeight
      drawPoint(ctx, multiHandLandmarks.x, multiHandLandmarks.y, 5, 'red');
    });
    simImage(results, 1);
  }
  if (results.multiHandLandmarks[0] 
    // && results.multiHandLandmarks[1]
  ) {

    // Acceder a los landmarks de los hombros

    // const leftHand = results.multiHandWorldLandmarks[0][8];
    // const rightHand = results.multiHandWorldLandmarks[1][8];

    const leftHand = results.multiHandWorldLandmarks[0][4];
    const rightHand = results.multiHandWorldLandmarks[0][8];

    console.log(leftHand, rightHand);

    // Extraer coordenadas
    const x1 = leftHand.x;
    const y1 = leftHand.y;
    const z1 = leftHand.z;

    const x2 = rightHand.x;
    const y2 = rightHand.y;
    const z2 = rightHand.z;

    // Calcular la distancia entre los hombros
    const distance = Math.sqrt(
      Math.pow(x2 - x1, 2) +
      Math.pow(y2 - y1, 2) +
      Math.pow(z2 - z1, 2)
    );

    // Mostrar el resultado en consola
    console.log(`Distancia entre los hombros: ${distance.toFixed(2)} metros`);
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});

function simImage(hand, id) {
  try {
    const rslt = hand.multiHandLandmarks[id]
    const handeness = hand.multiHandedness[id].label === "Left" ? -1 : 1;

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
    // ctx.drawImage(selectedImage, (0 - scaleHand / 4) + (simulation.config.leftAndRight * simulation.config.translationDistance), ((0 - scaleHand / 2) / 1.25) - (simulation.config.upAndDown * simulation.config.translationDistance), sizeX, sizeY)
    drawPoint(ctx, (0 - scaleHand / 4) + (simulation.config.leftAndRight * simulation.config.translationDistance) + (sizeX / 2), ((0 - scaleHand / 2) / 1.25) - (simulation.config.upAndDown * simulation.config.translationDistance) + (sizeY / 2), 5, 'green')
    ctx.restore()
    ctx.closePath()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializeHandTracking2(video, onResultsHands);