const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

import { models } from "./glasses_models.js"
var idModel = 0
var glasses = new Image();
glasses.src = models[idModel].img

function onResultsFaceMesh(results) {
  let Vw = ctx.canvas.clientWidth
  let Vh = ctx.canvas.clientHeight
  canvas.width = Vw 
  canvas.height = Vh 
  
  ctx.clearRect(0, 0, Vw, Vh)
  document.body.classList.add('loaded');

  if (results.multiFaceLandmarks) {
    // for (let index = 0; index < results.multiFaceLandmarks[0].length; index++) {
    //   const x = results.multiFaceLandmarks[0][index].x * Vw
    //   const y = results.multiFaceLandmarks[0][index].y * Vh
    //   ctx.beginPath();
    //   ctx.arc(x, y, 3, 0, 2 * Math.PI);
    //   ctx.fillStyle = 'blue';
    //   ctx.fill();
    //   ctx.stroke();
      
    // }
    const listaNodos = [127, 356, 168];
    ctx.save()
    const x0 = results.multiFaceLandmarks[0][listaNodos[0]].x * Vw
    const y0 = results.multiFaceLandmarks[0][listaNodos[0]].y * Vh
    const x1 = results.multiFaceLandmarks[0][listaNodos[1]].x * Vw
    const y1 = results.multiFaceLandmarks[0][listaNodos[1]].y * Vh
    const xGlasses = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) 
    const yGlasses = (xGlasses * glasses.height) / glasses.width
    const imageX0 = (results.multiFaceLandmarks[0][listaNodos[2]].x * Vw)
    const imageY0 = results.multiFaceLandmarks[0][listaNodos[2]].y * Vh

    ctx.translate(imageX0, imageY0)
    const pendiente = ((y1 - y0) / (x1 - x0))
    const angleHead = Math.atan(pendiente)
    ctx.rotate(angleHead)
    ctx.drawImage(glasses, 0 - (xGlasses / 2),  0 - (yGlasses / 3), xGlasses, yGlasses)
    ctx.restore()
    console.log(Vh, Vw)
  }
}


const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  }
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: ctx.canvas.clientWidth,
  height: ctx.canvas.clientHeight
});

camera.start();
