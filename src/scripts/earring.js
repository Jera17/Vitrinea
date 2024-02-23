const video = document.getElementsByClassName('input_video')[0];
var canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

console.log(window.getComputedStyle(video).getPropertyValue("width"))

canvas.width = 800
canvas.height = 600

import { models } from "./earring_models.js"
var idModel = 0
var EarringModel = new Image();
EarringModel.src = models[idModel].img

function onResultsFaceMesh(results) {
  document.body.classList.add('loaded');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {

      const listaNodos = [323, 401];
      for (let i = 0; i < listaNodos.length; i++) {
        const x0 = results.multiFaceLandmarks[0][listaNodos[0]].x * video.videoWidth
        const y0 = results.multiFaceLandmarks[0][listaNodos[0]].y * video.videoHeight
        const x1 = results.multiFaceLandmarks[0][listaNodos[1]].x * video.videoWidth
        const y1 = results.multiFaceLandmarks[0][listaNodos[1]].y * video.videoHeight
        const xEarring = ((x0 + x1)/2)+((x0-x1)*0.75)
        const yEarring = y0 + (y1 - y0)/3
        if (x0 > x1) {
        const imageX0 = results.multiFaceLandmarks[0][352].x * video.videoWidth
        const imageY0 = results.multiFaceLandmarks[0][352].y * video.videoHeight
        const imageY1 = results.multiFaceLandmarks[0][433].y * video.videoHeight
        const imageY = (imageY1 - imageY0)
        const imageX = imageY*0.75
        ctx.drawImage(EarringModel, xEarring-(imageX/2), yEarring*0.99, imageX, imageY)
        }
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

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
}});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({image: video});
  },
  width: canvas.width,
  height: canvas.height
});
camera.start();
