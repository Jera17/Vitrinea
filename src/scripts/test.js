import { fetched } from "./Utils/dataBase.js"
import {
  handleWebLoaded, setupCarouselScrollHandler, 
  handleButtonClick, updateModel
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let config = fetched.name.split(',').map(num => parseFloat(num))
if (fetched.name && fetched.name.split(',').map(num => parseFloat(num)).length === 3) {
// if (fetched.name && fetched.name.split(',').map(num => parseFloat(num)).length === 5) {
  simulation.config.leftAndRight = config[0];
  simulation.config.upAndDown = config[1];
  simulation.config.zoomInAndOut = config[2];
  // simulation.relativePosition = config[3];
  // simulation.config.translationDistance = config[4];
  console.log("Settings Fetched")
  console.log(simulation)
  console.log(simulation.config)
}

let webLoaded = false;
updateModel(simulation.img, fetched);

function onResultsHands(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.multiHandLandmarks[0]) {
    results.multiHandLandmarks[0].forEach(multiHandLandmarks => {
      multiHandLandmarks.x *= video.videoWidth
      multiHandLandmarks.y *= video.videoHeight
      drawPoint(multiHandLandmarks.x, multiHandLandmarks.y, 'red');
    });
    simImage(results);
  }
}

function drawPoint(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

setupCarouselScrollHandler();
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (webLoaded === true) {
      let result = handleButtonClick(this,
        simulation, fetched, flipCamera
      );
      simulation.config = result.config
      simulation.img = result.img
    }
  });
});

function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function simImage(hand) {
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
  const tanx = (x1 - x2)
  const tany = (y1 - y2)
  const pstx = x1 + tanx
  const psty = y1 + tany
  ctx.translate(pstx, psty)

  //set angle of the image
  var componenteX = 1
  if ((x1 - x2) > 0) {
    componenteX = -1
  }
  const pendiente = ((y2 - y1) / (x2 - x1))
  const angleHand = Math.atan(pendiente)
  ctx.rotate(angleHand + ((Math.PI / 2)) * componenteX)

  //Scale
  var scaleHand = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * 2 * (1 + (simulation.config.zoomInAndOut * 0.05))
  var sizeX = scaleHand / 2
  var sizeY = (sizeX * simulation.img.front.height) / simulation.img.front.width

  //Flip (Usando producto punto)
  function crossProductFromPoints(point1A, point2A, point1B, point2B) {
    const vectorA = [point2A[0] - point1A[0], point2A[1] - point1A[1], point2A[2] - point1A[2]];
    const vectorB = [point2B[0] - point1B[0], point2B[1] - point1B[1], point2B[2] - point1B[2]];
    const result = [
      vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
      vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
      vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
    ];
    return result;
  }

  // Ejemplo de uso:
  const point1A = [rslt[9].x, rslt[9].y, 0];
  const point2A = [rslt[10].x, rslt[10].y, 0];
  const point1B = [rslt[9].x, rslt[9].y, 0];
  const point2B = [rslt[13].x, rslt[13].y, 0];

  const result = crossProductFromPoints(point1A, point2A, point1B, point2B);

  const selectedImage = ((result[2] * handeness) < 0) ? simulation.img.front : simulation.img.back
  ctx.drawImage(selectedImage, (0 - scaleHand / 4) + (simulation.config.leftAndRight * simulation.config.translationDistance), ((0 - scaleHand / 2) / 1.25) - (simulation.config.upAndDown * simulation.config.translationDistance), sizeX, sizeY)
  drawPoint((0 - scaleHand / 4) + (simulation.config.leftAndRight * simulation.config.translationDistance) + (sizeX / 2), ((0 - scaleHand / 2) / 1.25) - (simulation.config.upAndDown * simulation.config.translationDistance) + (sizeY / 2), 'green')
  ctx.restore()
  ctx.closePath()
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResultsHands);

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: "environment"
});
camera.start();