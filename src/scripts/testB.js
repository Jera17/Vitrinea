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

function onResultsPose(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
      drawPoints(poseLandmarks.x, poseLandmarks.y, "red")
    });
    drawImage(results.poseLandmarks, 11, 23)
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

function drawPoints(x, y, c) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI); // Using arc() method to draw a circle representing the point
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();
}

function drawImage(rst) {
  try {
    ctx.beginPath();
    const x1 = rst[11].x
    const y1 = rst[11].y
    const x2 = rst[12].x
    const y2 = rst[12].y
    const x3 = rst[0].x
    const y3 = rst[0].y
    const tanX = (x1 + x2) / 2
    const tanY = (((y1 + y2) / 2) + (y3 * 1.2)) / 2
    const distX = (x1 - x2) / 2 * (1 + (simulation.config.zoomInAndOut * 0.05))
    const distY = (distX * simulation.img.front.height) / simulation.img.front.width

    drawPoints(x1, y1, "blue")
    drawPoints(x2, y2, "blue")
    drawPoints(x3, y3, "blue")
    ctx.drawImage(simulation.img.front, tanX - (distX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), tanY - (simulation.config.upAndDown * simulation.config.translationDistance), distX, distY)
    drawPoints(tanX - (distX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance) + (distX / 2), tanY, "green")
    ctx.closePath();
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResultsPose);

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 854,
  height: 480,
  facingMode: "environment"
});
camera.start();