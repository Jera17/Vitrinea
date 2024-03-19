const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll(".my-button");

import { models } from "./hats_models.js"
var idModel = 0
var glasses = new Image();
glasses.src = models[idModel].img

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1

function onResultsFaceMesh(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

  if (results.multiFaceLandmarks) {
    imageDraw(results.multiFaceLandmarks[0])
    for (let i = 0; i < results.multiFaceLandmarks[0].length; i++) {
      drawPoints(results.multiFaceLandmarks[0][162].x * canvas.width, results.multiFaceLandmarks[0][162].y * canvas.height, 3, "blue")
      drawPoints(results.multiFaceLandmarks[0][389].x * canvas.width, results.multiFaceLandmarks[0][389].y * canvas.height, 3, "red")
      drawPoints(results.multiFaceLandmarks[0][10].x * canvas.width, results.multiFaceLandmarks[0][10].y * canvas.height, 3, "yellow")
      drawPoints(results.multiFaceLandmarks[0][4].x * canvas.width, results.multiFaceLandmarks[0][4].y * canvas.height, 3, "purple")
    }
  }
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
      case "ZoomIn":
      case "ZoomOut":
        updateZoom(button.id);
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

function updateZoom(direction) {
  const delta = (direction === "ZoomIn") ? 1 : -1;
  if (zoomInAndOut + delta >= -manualAjust && zoomInAndOut + delta <= manualAjust) {
    zoomInAndOut += delta;
    newScale = 1 + (zoomInAndOut * 0.05);
  }
}

function updateCounter(operator) {
  idModel = (operator === 'ChangeRight') ? (idModel + 1) % models.length : (idModel - 1 + 3) % models.length;
  console.log(idModel, (idModel + 1) % models.length, (idModel - 1 + models.length) % models.length)
  glasses.src = models[idModel].img;
}


function imageDraw(rsl) {
  const nodes = [162, 389, 10, 4];  //Right, left, center
  ctx.save()
  const x0 = rsl[nodes[0]].x * video.videoWidth
  const y0 = rsl[nodes[0]].y * video.videoHeight
  const x1 = rsl[nodes[1]].x * video.videoWidth
  const y1 = rsl[nodes[1]].y * video.videoHeight
  const x2 = rsl[nodes[2]].x * video.videoWidth
  const y2 = rsl[nodes[2]].y * video.videoHeight
  const x3 = rsl[nodes[3]].x * video.videoWidth 
  // Si  x3 < x0 y x3 > x1  todo  bienn, sino  x3 > x0  -> originX + (x3 - x0), sino  x3 < x1  -> originX + (x1 - x3)
  if (x3 > x0 && x3 < x1) {
    console.log("uwu")
  // }else if(x3 < x0){
  //   console.log("derecha")
  // }else if(x3 > x1){
  //   console.log("izquierda")
  }else if(x3 < x0 || x3 > x1){
    console.log("uwun't")
  }
  const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale * 1.5
  const sizeY = (sizeX * glasses.height) / glasses.width
  // const originX = x2
  const originX = (x1 + x0)/2
  const originY = y2
  ctx.translate(originX, originY)
  const angleHead = Math.atan((y1 - y0) / (x1 - x0))
  ctx.rotate(angleHead)
  ctx.drawImage(glasses, 0 - (sizeX / 2) + newXposition, 0 - (sizeY/1.3) - newYposition, sizeX, sizeY)
  ctx.restore()
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
  width: 1280,
  height: 720
});
camera.start();