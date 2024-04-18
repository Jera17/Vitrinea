import { fetched } from "./models.js"

const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

var idModel = 0
var image = new Image();
image.src = fetched.frontAR[idModel]

const manualAjust = 10
var translationDistance = 2
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
let isFrontCamera = true;

function onResultsFaceMesh(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
    });
    imageDraw(results.multiFaceLandmarks[0], 323, 361, 401, 1)
    imageDraw(results.multiFaceLandmarks[0], 93, 132, 177, -1)

    drawPoints(results.multiFaceLandmarks[0], 93, 3, "yellow")
    drawPoints(results.multiFaceLandmarks[0], 132, 3, "blue")
    drawPoints(results.multiFaceLandmarks[0], 177, 3, "red")

    for (let index = 0; index < results.multiFaceLandmarks[0].length; index++) {
      drawPoints(results.multiFaceLandmarks[0], [index], 2, "green")
    }
  }
}

function drawPoints(f, a, r, c) {
  ctx.beginPath();
  ctx.arc(f[a].x, f[a].y, 0, 0, 2 * Math.PI);
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
  console.log(idModel, (idModel + 1) % fetched.frontAR.length, (idModel - 1 + 3) % fetched.frontAR.length)
  image.src = fetched.frontAR[idModel]
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


function imageDraw(rsl, Node1, Node2, Node3, Orientation) {
  const x0 = rsl[Node1].x
  const y0 = rsl[Node1].y
  const x1 = rsl[Node2].x
  const y1 = rsl[Node2].y
  const x2 = rsl[Node3].x
  const y2 = rsl[Node3].y
  const AuxOrigenX = ((x0 - x2) + (x0 + x2) / 2)
  const AuxOrigenY = (y0 + y1) / 2

  const xEarring = ((x0 + x1) / 2) + ((x0 - x1) * 0.75)
  if (x0 * Orientation > x2 * Orientation) {
    const imageWidth = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale
    const imageHeight = (image.height * imageWidth) / image.width

    ctx.drawImage(image, AuxOrigenX - (imageWidth / 2) + (newXposition * Orientation), AuxOrigenY - (imageWidth / 2) - newYposition, imageWidth, imageHeight)
  }
}
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
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
