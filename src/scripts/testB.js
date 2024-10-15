import { fetched } from "./Utils/dataBase.js"
import { initializePoseTracking2 } from "./Utils/simulation.js"
import {
  handleWebLoaded, modeSelector, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel, drawPoint, crossProductFromPoints, updateCounterRotating, startIntervals
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
startIntervals();
let giroID = 0;
console.log(simulation.img);
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

let max = -Infinity; // Inicializamos con el valor más bajo posible
let min = Infinity;  // Inicializamos con el valor más alto posible
let media = 0;
let totalDistance = 0;
let count = 0;
modeSelector();

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
      poseLandmarks.z *= video.videoWidth
      // drawPoint(ctx, poseLandmarks.x, poseLandmarks.y, 5, "black")
      // console.log(poseLandmarks, poseLandmarks.z);
    });
    drawImage(results.poseLandmarks, 11, 23)

    // Acceder a los landmarks de los hombros
    const puntoA = 11
    const puntoB = 12
    const leftShoulder = results.poseWorldLandmarks[puntoA]; // LEFT_SHOULDER
    const rightShoulder = results.poseWorldLandmarks[puntoB]; // RIGHT_SHOULDER

    // Extraer coordenadas
    const x1 = leftShoulder.x;
    const y1 = leftShoulder.y;
    const z1 = leftShoulder.z;

    const x2 = rightShoulder.x;
    const y2 = rightShoulder.y;
    const z2 = rightShoulder.z;

    // Calcular la distancia entre los hombros
    const distance = Math.sqrt(
      Math.pow(x2 - x1, 2) +
      Math.pow(y2 - y1, 2) +
      Math.pow(z2 - z1, 2)
    );

    totalDistance += distance;
    count++;

    let media = totalDistance / count;

    drawPoint(ctx, results.poseLandmarks[puntoB].x, results.poseLandmarks[puntoB].y, 2, "red")
    drawPoint(ctx, results.poseLandmarks[puntoA].x, results.poseLandmarks[puntoA].y, 2, "red")

    console.log(`El ancho de los puntos de los hombros de la persona es de: ${distance * 100} centimetros`);
    console.log(`El ancho de "real" de los hombros de la persona es de: ${distance * 150} centimetros`);
    // console.log(`El ancho de los hombros de la persona es de: ${distance*155} centimetros`);
    console.log(`Numero de iteración = ${count}, Media Puntos = ${media * 100}, Media Hombros = ${media * 150}`);
  }
}

function getRangeValue(value) {
  // console.log(value);
  //TO DO: Revisar la logica de que valor hay que retornar
  let range = 1.0;
  if (value < -range) {
    return 1;
    return -1;
  } else if (value > range) {
    return -1;
    return 1;
  } else {
    return 0;
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched);
  });
});


function drawImage(rsl, node1, node2) {
  // try {
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

  const a = rsl[11];
  const b = rsl[12];

  let x = Math.abs(a.x - b.x);
  let z = Math.abs(a.z - b.z);

  const valor = a.z - b.z < 0 ? 1 : -1;
  const resultado = z / x;

  giroID = getRangeValue(resultado * valor);
  simulation.img.selectedImage = updateCounterRotating(simulation.img, fetched, giroID)


  // ctx.drawImage(simulation.img.selectedImage,
  //   Xcenter - (shoulderWidth / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance),
  //   Ycenter - (torsosHeight / 2) - (simulation.config.upAndDown * simulation.config.translationDistance),
  //   shoulderWidth + (simulation.config.leftAndRight * simulation.config.translationDistance),
  //   torsosHeight)

  // } catch (error) {
  //   console.error('Error en simImage:', error);
  // }
}

initializePoseTracking2(video, onResultsPose);