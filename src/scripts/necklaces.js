const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

import { models } from "./necklaces_models.js"
var idModel = 0
var clotheModel = new Image();
clotheModel.src = models[idModel].img

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0

function onResultsPose(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)
  if (results.poseLandmarks) {
    drawImage(results.poseLandmarks)



    // for (let i = 0; i < results.poseLandmarks.length; i++) {
    //   console.log(i, results.poseLandmarks[i].x, results.poseLandmarks[i].y)
    //   drawPoints(results.poseLandmarks[i].x * video.videoWidth, results.poseLandmarks[i].y * video.videoHeight, 4, "red")
    // }



    // const coords = getCoords(results.poseLandmarks, nodes)
    // ctx.drawImage(clotheModel, 
    //   coords.x0 - (coords.SW / 2.5) + newXposition, 
    //   coords.y0 - (coords.SW / 4) - newYposition, 
    //   coords.SW + (coords.SW / 1.25), 
    //   coords.TH + (coords.SW / 4))
  }
}


function drawImage(rst) {
  ctx.beginPath();
  
  const x1 = rst[11].x * video.videoWidth
  const y1 = rst[11].y * video.videoHeight
  const x2 = rst[12].x * video.videoWidth
  const y2 = rst[12].y * video.videoHeight
  const x3 = rst[0].x * video.videoWidth
  const y3 = rst[0].y * video.videoHeight
  drawPoints(x1, y1, 3, "blue")
  drawPoints(x2, y2, 3, "blue")
  drawPoints(x3, y3, 3, "blue")
  const tanx = (x1 + x2)/2
  const tany = (((y1 + y2)/2) + (y3*1.2))/2

  drawPoints(tanx, tany, 3, "green")

  ctx.closePath();
}

function drawPoints(x, y, r, c) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); // Using arc() method to draw a circle representing the point
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    switch (button.id) {
      case "Up":
      case "Down":
        updateY(button.id);
        break;
      case "Left":
      case "Right":
        updateX(button.id);
        break;
      case "ChangeLeft":
      case "ChangeRight":
        updateCounter(button.id);
        break;
      default:
        console.log("Unknown button clicked");
    }
  });
});

function updateY(buttonId) {
  if (buttonId === "Up" && upAndDown < manualAjust) {
    upAndDown++;
  } else if (buttonId === "Down" && upAndDown > -manualAjust) {
    upAndDown--;
  }
  newYposition = upAndDown * translationDistance;
}

function updateX(buttonId) {
  if (buttonId === "Left" && leftAndRight < manualAjust) {
    leftAndRight++;
  } else if (buttonId === "Right" && leftAndRight > -manualAjust) {
    leftAndRight--;
  }
  newXposition = leftAndRight * translationDistance;
}

function updateCounter(operator) {
  idModel = (operator === 'ChangeRight') ? (idModel + 1) % models.length : (idModel - 1 + 3) % models.length;
  console.log(idModel, (idModel + 1) % models.length, (idModel - 1 + models.length) % models.length)
  clotheModel.src = models[idModel].img;
}

function getCoords(rsl, nodes) {
  const x0 = (rsl[nodes[0]].x * video.videoWidth) //hombro izquierdo
  const y0 = (rsl[nodes[0]].y * video.videoHeight)
  const x1 = (rsl[nodes[1]].x * video.videoWidth) //hombro derecho
  const y1 = (rsl[nodes[1]].y * video.videoHeight)
  const x2 = (rsl[nodes[2]].x * video.videoWidth) //cadera derecha
  const y2 = (rsl[nodes[2]].y * video.videoHeight)
  const shoulderWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) //ancho entre hombros
  const torsosHeight = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) //largo del hombro a la cadera
  const magX = x1 - x0
  const magY = y1 - y0
  return {
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1,
    SW: shoulderWidth,
    TH: torsosHeight,
    magX: magX,
    magY: magY
  }
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  }
});
pose.onResults(onResultsPose);

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 1280,
  height: 720
});
camera.start();