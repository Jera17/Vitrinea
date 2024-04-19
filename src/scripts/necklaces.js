import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

var idModel = 0
var imgFront = new Image();
imgFront.src = fetched.frontAR[idModel]

const manualAjust = 10
var translationDistance = 2
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
let isFrontCamera = true;

function onResultsPose(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)
  if (results.poseLandmarks) {
    results.poseLandmarks.forEach(poseLandmarks => {
      poseLandmarks.x *= video.videoWidth
      poseLandmarks.y *= video.videoHeight
    });
    drawImage(results.poseLandmarks)
  }
}


function drawImage(rst) {
  ctx.beginPath();
  const x1 = rst[11].x
  const y1 = rst[11].y
  const x2 = rst[12].x
  const y2 = rst[12].y
  const x3 = rst[0].x
  const y3 = rst[0].y
  const tanX = (x1 + x2) / 2
  const tanY = (((y1 + y2) / 2) + (y3 * 1.2)) / 2
  const distX = (x1 - x2) / 2  * newScale
  const distY = (distX * imgFront.height) / imgFront.width
  
  // drawPoints(x1, y1, 6, "red")
  // drawPoints(x2, y2, 6, "blue")
  // drawPoints(x3, y3, 6, "yellow")
  // drawPoints(tanX, tanY, 8, "green")
  ctx.drawImage(imgFront, tanX - (distX / 2) + newXposition, tanY - newYposition, distX, distY)
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
      case "ZoomIn":
      case "ZoomOut":
        updateZoom(button.id);
        break;
      case "ChangeLeft":
      case "ChangeRight":
        updateCounter(button.id);
        break;
        case "FlipCamera":
          flipCamera()
          break;
        case "ScreenShot":
          screenShot()
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
    console.log(newScale)
  }
}

function updateCounter(operator) {
  idModel = (operator === 'ChangeRight') ? (idModel + 1) % fetched.frontAR.length : (idModel - 1 + fetched.frontAR.length) % fetched.frontAR.length;
  console.log(idModel, (idModel + 1) % fetched.frontAR.length, (idModel - 1 + fetched.frontAR.length) % fetched.frontAR.length)
  imgFront.src = fetched.frontAR[idModel];
}

function flipCamera() {
  isFrontCamera = !isFrontCamera;
  camera.h.facingMode = isFrontCamera ? "user" : "environment";
  video.style.transform = canvas.style.transform = isFrontCamera ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function screenShot() {
  const combinedCanvas = document.createElement('canvas');
  const combinedCtx = combinedCanvas.getContext('2d');

  combinedCanvas.width = video.videoWidth;
  combinedCanvas.height = video.videoHeight;
  combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
  combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

  let image_data_url = combinedCanvas.toDataURL('image/jpeg');
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
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