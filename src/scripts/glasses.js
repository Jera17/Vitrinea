const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll(".my-button");

import { models } from "./glasses_models.js"
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
  }
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
      case "ScreenShot":
        const combinedCanvas = document.createElement('canvas');
        const combinedCtx = combinedCanvas.getContext('2d');

        // Set the dimensions of the combined canvas
        combinedCanvas.width = video.videoWidth;
        combinedCanvas.height = video.videoHeight;

        // Draw the video frame onto the combined canvas
        // Draw the contents of the canvas onto the combined canvas (overlay)
        combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
        combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);


        let image_data_url = combinedCanvas.toDataURL('image/jpeg');
        // data url of the image
        // Create a link element
        const downloadLink = document.createElement('a');
        downloadLink.href = image_data_url;

        // Set the filename for the downloaded image
        downloadLink.download = 'webcam_snapshot.jpg';

        // Simulate a click event to trigger the download
        downloadLink.click();



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
  const nodes = [127, 356, 168];
  ctx.save()
  const x0 = rsl[nodes[0]].x * video.videoWidth
  const y0 = rsl[nodes[0]].y * video.videoHeight
  const x1 = rsl[nodes[1]].x * video.videoWidth
  const y1 = rsl[nodes[1]].y * video.videoHeight
  const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale
  const sizeY = (sizeX * glasses.height) / glasses.width
  const originX = (rsl[nodes[2]].x * video.videoWidth)
  const originY = rsl[nodes[2]].y * video.videoHeight
  ctx.translate(originX, originY)
  const angleHead = Math.atan((y1 - y0) / (x1 - x0))
  ctx.rotate(angleHead)
  ctx.drawImage(glasses, 0 - (sizeX / 2) + newXposition, 0 - (sizeY / 3) - newYposition, sizeX, sizeY)
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