import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking } from "./Utils/simulation.js"
import {
  handleWebLoaded, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, drawPoint, crossProductFromPoints, updateCounterRotating
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
let giro = 0;
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
      poseLandmarks.z *= video.videoWidth
      drawPoint(ctx, poseLandmarks.x, poseLandmarks.y, 5, "black")
    });
    drawImage(results.poseLandmarks, 11, 23)

    const a = results.poseLandmarks[11];
    const b = results.poseLandmarks[12];
    // const z3 = results.poseLandmarks[23];
    // const z4 = results.poseLandmarks[24];
    
    let x = Math.abs(a.x - b.x); 
    let z = Math.abs(a.z - b.z);

    const valor = a.z - b.z > 0 ? 1 : -1;
    const resultado = z / x;

    giro = getRangeValue(resultado*valor) + 2;
    console.log(resultado*valor)
    updateCounterRotating(simulation.img, fetched, giro)
  }
}

function getRangeValue(value) {
  if (value < -(4)) {
    return 2;
  } else if (value >= -(4) && value < -(2)) {
    return 1;
  } else if (value >= -(2) && value < (2)) {
    return 0;
  } else if (value >= (2) && value < (4)) {
    return -1;
  } else {
    return -2;
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

    const torsosHeight = Math.sqrt(Math.pow((x2 - x0), 2) + Math.pow((y2 - y0), 2)) * 1.3 * (1 + (simulation.config.zoomInAndOut * 0.05))
    const shoulderWidth = (torsosHeight * simulation.img.front.width) / simulation.img.front.height * 1.0
    // const shoulderWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * 1.7 * (1 + (simulation.config.zoomInAndOut * 0.05))
    // const torsosHeight = (shoulderWidth * simulation.img.front.height) / simulation.img.front.width * 1.1
    const magX = x1 - x0
    const magY = y1 - y0



    // Ejemplo de uso:
    const point1A = [x0, y0, 0];
    const point2A = [x1, y1, 0];
    const point1B = [x0, y0, 0];
    const point2B = [x2, y2, 0];

    // const result = crossProductFromPoints(point1A, point2A, point1B, point2B);
    const selectedImage = giro === 0 ? simulation.img.front : (giro === 1 ? simulation.img.back : simulation.img.back);

    ctx.drawImage(selectedImage,
      Xcenter - (shoulderWidth / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance),
      Ycenter - (torsosHeight / 2) - (simulation.config.upAndDown * simulation.config.translationDistance),
      shoulderWidth + (simulation.config.leftAndRight * simulation.config.translationDistance),
      torsosHeight)
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

initializePoseTracking(video, onResultsPose);