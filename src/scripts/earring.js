const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

console.log(window.getComputedStyle(video).getPropertyValue("width"))

import { models } from "./earring_models.js"
var idModel = 0
var EarringModel = new Image();
EarringModel.src = models[idModel].img

function onResultsFaceMesh(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  document.body.classList.add('loaded');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    for (let index = 0; index < results.multiFaceLandmarks[0].length; index++) {
      drawNodes(results.multiFaceLandmarks[0][index].x * canvas.width, results.multiFaceLandmarks[0][index].y * canvas.height, 2, "green")
    }
    drawSimulation(356, 323, 401, 1)
    drawSimulation(127, 93, 177, -1)
  }


  function drawSimulation(Node1, Node2, Node3, Orientation) {
    drawNodes(results.multiFaceLandmarks[0][Node1].x * canvas.width, results.multiFaceLandmarks[0][Node1].y * canvas.height, 3, "yellow")
    drawNodes(results.multiFaceLandmarks[0][Node2].x * canvas.width, results.multiFaceLandmarks[0][Node2].y * canvas.height, 3, "blue")
    drawNodes(results.multiFaceLandmarks[0][Node3].x * canvas.width, results.multiFaceLandmarks[0][Node3].y * canvas.height, 3, "red")
    const x0 = results.multiFaceLandmarks[0][Node2].x * canvas.width
    const y0 = results.multiFaceLandmarks[0][Node2].y * canvas.height
    const x1 = results.multiFaceLandmarks[0][Node3].x * canvas.width
    const xEarring = ((x0 + x1) / 2) + ((x0 - x1) * 0.75)
    if (x0 * Orientation > x1 * Orientation) {
      const imageY0 = results.multiFaceLandmarks[0][Node1].y * canvas.height
      const imageY1 = results.multiFaceLandmarks[0][Node2].y * canvas.height
      const imageY = (imageY1 - imageY0)
      const imageX = imageY * 0.75
      ctx.drawImage(EarringModel, xEarring - (imageX / 2), y0, imageX, imageY)
    }
  }

  function drawNodes(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath()
  }
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  }
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 854,
  height: 480
});
camera.start();
