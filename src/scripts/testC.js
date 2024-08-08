import { fetched } from "./Utils/dataBase.js"
import {
  handleWebLoaded, updateSimulationConfig, setupCarouselScrollHandler,
  handleButtonClick, updateModel
} from "./Utils/utils.js"
import {
  video, canvas, ctx, buttons, simulation
} from "./Utils/var.js";

let webLoaded = false;
updateModel(simulation.img, fetched);
updateSimulationConfig(fetched, simulation);

function onResultsFaceMesh(results) {
  webLoaded = handleWebLoaded(webLoaded);
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (results.multiFaceLandmarks[0]) {
    results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
      multiFaceLandmarks.x *= video.videoWidth
      multiFaceLandmarks.y *= video.videoHeight
      drawPoints(multiFaceLandmarks.x, multiFaceLandmarks.y, 2, "red")
    });
    simImage(results.multiFaceLandmarks[0], 127, 356, 168)
    drawPoints(results.multiFaceLandmarks[0][127].x, results.multiFaceLandmarks[0][127].y, 4, "blue")
    drawPoints(results.multiFaceLandmarks[0][356].x, results.multiFaceLandmarks[0][356].y, 4, "blue")
  }
}

setupCarouselScrollHandler();

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    handleButtonClick(this, fetched, flipCamera);
  });
});

function flipCamera() {
  camera.h.facingMode = camera.h.facingMode === "user" ? "environment" : "user";
  video.style.transform = canvas.style.transform = camera.h.facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
  camera.stop();
  camera.start();
}

function simImage(rsl, nodes1, nodes2, nodes3) {
  try {
    ctx.save()
    const x0 = rsl[nodes1].x
    const y0 = rsl[nodes1].y
    const x1 = rsl[nodes2].x
    const y1 = rsl[nodes2].y
    const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * (1 + (simulation.config.zoomInAndOut * 0.05)) //Distancia de cien a cien
    const sizeY = (sizeX * simulation.img.front.height) / simulation.img.front.width //Escala la altura de la imagen con respecto a su ancho 
    const originX = rsl[nodes3].x
    const originY = rsl[nodes3].y
    ctx.translate(originX, originY) //poner el origen de imagen en el puente de la nariz
    const angleHead = Math.atan((y1 - y0) / (x1 - x0)) //calcula la inclinacion de la cabeza para inclinar la imagen
    ctx.rotate(angleHead)
    ctx.drawImage(simulation.img.front, 0 - (sizeX / 2) + (simulation.config.leftAndRight * simulation.config.translationDistance), 0 - (sizeY / 3) - (simulation.config.upAndDown * simulation.config.translationDistance), sizeX, sizeY)
    ctx.restore()
  } catch (error) {
    console.error('Error en simImage:', error);
  }
}

function drawPoints(x, y, r, c) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); // Using arc() method to draw a circle representing the point
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();
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

//Configuracion de la camara
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 854,
  height: 480,
  facingMode: "environment"
});
camera.start();