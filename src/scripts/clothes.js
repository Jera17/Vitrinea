const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
import { models } from "./clothes_models.js"

var idArrays = 0
var cooldown = true

function onResultsPose(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

  //gesture
  const Gx0 = (results.poseLandmarks[15].x * video.videoWidth)
  const Gy0 = (results.poseLandmarks[15].y * video.videoHeight)
  const Gx1 = (results.poseLandmarks[16].x * video.videoWidth)
  const Gy1 = (results.poseLandmarks[16].y * video.videoHeight)
  const Gx2 = (results.poseLandmarks[12].x * video.videoWidth) - (results.poseLandmarks[12].x * video.videoWidth * 0.5)
  const Gy2 = (results.poseLandmarks[12].y * video.videoHeight)
  drawNodes(Gx0, Gy0, 'purple')
  drawNodes(Gx1, Gy1, 'cyan')
  drawNodes(Gx2, Gy2, 'black')

  if (Gy0 < Gy2) {
    if (cooldown) {
      updateCounter('+'); // Increment by 1
      cooldown = false
      setTimeout(() => { cooldown = true; }, 1000);
    }
  } else if (Gy1 < Gy2) {
    if (cooldown) {
      updateCounter('-'); // Decrement by 1
      cooldown = false
      setTimeout(() => { cooldown = true; }, 1000);
    }
  }

  const polygon = getCoords(models[idArrays].nodes)
  var clotheModel = new Image();
  clotheModel.src = models[idArrays].img

  ctx.drawImage(clotheModel, polygon.x0 - (polygon.tangX / 2.5), polygon.y0 - (polygon.tangX / 4), polygon.tangX + (polygon.tangX / 1.25), polygon.tangY + (polygon.tangX / 4))

  drawNodes(polygon.x0 - (polygon.tangX / 2.5), polygon.y0 - (polygon.tangX / 4), 'green')
  drawNodes(polygon.x1 + (polygon.tangX / 2.5), polygon.y0 - (polygon.tangX / 4), 'green')

  function getCoords(polygonIdNodes) {
    const x0 = (results.poseLandmarks[polygonIdNodes[0]].x * video.videoWidth)
    const y0 = (results.poseLandmarks[polygonIdNodes[0]].y * video.videoHeight)
    const x1 = (results.poseLandmarks[polygonIdNodes[1]].x * video.videoWidth)
    const y1 = (results.poseLandmarks[polygonIdNodes[1]].y * video.videoHeight)
    const x2 = (results.poseLandmarks[polygonIdNodes[2]].x * video.videoWidth)
    const y2 = (results.poseLandmarks[polygonIdNodes[2]].y * video.videoHeight)
    const tangX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2))
    const tangY = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
    const magX = x1 - x0
    const magY = y1 - y0
    return {
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1,
      tangX: tangX,
      tangY: tangY,
      magX: magX,
      magY: magY
    }
  }
  // console.log(results.poseLandmarks)
  // for (let i = 0; i < results.poseLandmarks.length; i++) {
  //   const x = (results.poseLandmarks[i].x * video.videoWidth)
  //   const y = (results.poseLandmarks[i].y * video.videoHeight)
  //   console.log(i, x, y)
  //   drawNodes(x, y, "purple")
  // }
  function drawNodes(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath()
  }
  function updateCounter(operator) {
    if (operator === '+') {
      idArrays = (idArrays + 1) % 3;
    } else if (operator === '-') {
      idArrays = (idArrays - 1 + 3) % 3;
    }
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