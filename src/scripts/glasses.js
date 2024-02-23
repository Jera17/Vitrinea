const video2 = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

canvas.width = 800
canvas.height = 600

import { models } from "./glasses_models.js"
var idModel = 0
var glasses = new Image();
glasses.src = models[idModel].img

function onResultsFaceMesh(results) {
  document.body.classList.add('loaded');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    const listaNodos = [127, 356, 168];
    ctx.save()
    const x0 = results.multiFaceLandmarks[0][listaNodos[0]].x * video2.videoWidth
    const y0 = results.multiFaceLandmarks[0][listaNodos[0]].y * video2.videoHeight
    const x1 = results.multiFaceLandmarks[0][listaNodos[1]].x * video2.videoWidth
    const y1 = results.multiFaceLandmarks[0][listaNodos[1]].y * video2.videoHeight
    const xGlasses = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) 
    const yGlasses = (xGlasses * glasses.height) / glasses.width
    const imageX0 = (results.multiFaceLandmarks[0][listaNodos[2]].x * video2.videoWidth)
    const imageY0 = results.multiFaceLandmarks[0][listaNodos[2]].y * video2.videoHeight

    ctx.translate(imageX0, imageY0)
    const pendiente = ((y1 - y0) / (x1 - x0))
    const angleHead = Math.atan(pendiente)
    ctx.rotate(angleHead)
    ctx.drawImage(glasses, 0 - (xGlasses / 2),  0 - (yGlasses / 3), xGlasses, yGlasses)
    ctx.restore()
  }
}


const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  }
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({ image: video2 });
  },
  width: canvas.width,
  height: canvas.height
});

camera.start();
