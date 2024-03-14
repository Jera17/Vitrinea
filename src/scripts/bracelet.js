const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

import { models } from "./bracelets_models.js"
var idModel = 0
var imgFront = new Image();
imgFront.src = models[idModel].front;
var imgBack = new Image();
imgBack.src = models[idModel].back;
var forearm = ""

function onResultsPose(results) {
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  //gesture
  const NodesForearm = [13, 14]

  for (let i = 0; i < NodesForearm.length; i++) {
    const x1 = results.poseLandmarks[NodesForearm[i]].x * video.videoWidth
    const y1 = results.poseLandmarks[NodesForearm[i]].y * video.videoHeight
    const x2 = results.poseLandmarks[NodesForearm[i]+2].x * video.videoWidth
    const y2 = results.poseLandmarks[NodesForearm[i]+2].y * video.videoHeight
    if(i==0){
      forearm = 'derecha'
    }else if(i==1){
      forearm = 'izquierda'
    }
    console.log(forearm, x1,y1,x2,y2)
    drawNodes(x1, y1, "red")
    drawNodes(x2, y2, "red")
    drawLines(x1, y1, x2, y2, "green")
  }

function drawNodes(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}
function drawLines(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath()
}
function updateCounter(operator) {
  if (operator === '+') {
    idModel = (idModel + 1) % 3;
  } else if (operator === '-') {
    idModel = (idModel - 1 + 3) % 3;
  }
}
}

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
}});
pose.onResults(onResultsPose);

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({image: video}); },
  width: 1280,
  height: 720
});
camera.start();