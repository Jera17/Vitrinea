import { fetched } from "./Utils/dataBase.js"
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
    handleButtonClick(this, fetched, flipCamera);
  });
});

function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function simImage(hand) {
  try {
    const rslt = hand.multiHandLandmarks[0]
    const handeness = hand.multiHandedness[0].label === "Left" ? -1 : 1;

    ctx.save();
    const fingerIdNodes = [5, 9, 13, 17]
    // console.log(simulation.img.id)
    const x1 = rslt[fingerIdNodes[simulation.config.relativePosition]].x
    const y1 = rslt[fingerIdNodes[simulation.config.relativePosition]].y
    const x2 = rslt[fingerIdNodes[simulation.config.relativePosition] + 1].x
    const y2 = rslt[fingerIdNodes[simulation.config.relativePosition] + 1].y

    ctx.beginPath()
    ctx.save()
    //set the position center of the canva and from hand
    const pstx = ((x1 + x2) / 2)
    const psty = ((y1 + y2) / 2)
    ctx.translate(pstx, psty)

    //set angle of the image
    var componenteX = 1
    if ((x1 - x2) > 0) {
      componenteX = -1
    }
    const pendiente = ((y2 - y1) / (x2 - x1))
    const angleHand = Math.atan(pendiente)
    ctx.rotate(angleHand + ((Math.PI / 2) * componenteX))

    //Scale
    var FingerLenght = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) * (1 + (simulation.config.zoomInAndOut * 0.05))

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

    const point1A = [rslt[9].x, rslt[9].y, 0];
    const point2A = [rslt[10].x, rslt[10].y, 0];
    const point1B = [rslt[9].x, rslt[9].y, 0];
    const point2B = [rslt[13].x, rslt[13].y, 0];

    const result = crossProductFromPoints(point1A, point2A, point1B, point2B);

    const selectedImage = ((result[2] * handeness) < 0) ? simulation.img.front : simulation.img.back
    ctx.drawImage(selectedImage, (0 - FingerLenght / 4) + (simulation.config.leftAndRight * simulation.config.translationDistance), ((0 - FingerLenght / 2) / 1.25) - (simulation.config.upAndDown * simulation.config.translationDistance), FingerLenght / 2, FingerLenght / 2)

    ctx.restore()
    ctx.closePath()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
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
  width: 854,
  height: 480,
  facingMode: "environment"
});
camera.start();