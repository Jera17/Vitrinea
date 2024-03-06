const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
import { models } from "./rings_models.js"
var idModel = 0
var glasses = new Image();
glasses.src = models[idModel].img

function onResultsHands(results) {
  //set Canva
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks) {
    for (let index = 0; index < results.multiHandLandmarks[0].length; index++) {
      const isRight = (results.multiHandedness[0].label === 'Left') ? 1 : -1;
      drawImage(results.multiHandLandmarks[0], isRight);
    }
  }
}
ctx.restore();

function drawImage(rslt, isRight) {
  var imgFront = new Image();
  imgFront.src = models[idModel].front;

  var imgBack = new Image();
  imgBack.src = models[idModel].back;

  const x1 = rslt[9].x * video.videoWidth
  const y1 = rslt[9].y * video.videoHeight
  const x2 = rslt[10].x * video.videoWidth
  const y2 = rslt[10].y * video.videoHeight
  //draw circles
  ctx.beginPath();
  ctx.arc(x1, y1, 3, 0, 2 * Math.PI);
  ctx.arc(x2, y2, 3, 0, 2 * Math.PI);
  ctx.fillStyle = 'blue';
  ctx.fill();

  ctx.beginPath()
  ctx.save()
  //set the position center of the canva and from hand
  const pstx = ((x1 + x2) / 2)
  const psty = ((y1 + y2) / 2)
  ctx.translate(pstx, psty)

  //set angle of the image
  var componenteX = 1
  if ((x1 - x2) > 0) {
    componenteX = -1
  }
  const pendiente = ((y2 - y1) / (x2 - x1))
  const angleHand = Math.atan(pendiente)
  ctx.rotate(angleHand + ((Math.PI / 2) * componenteX))

  //Scale
  var FingerLenght = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))

  //Flip
  var HandRotationZ = 0
  HandRotationZ = ((rslt[5].z + rslt[10].z + rslt[17].z + (rslt[0].z / 10)) / 4)
  const selectedImage = (isRight && HandRotationZ > 0) || (!isRight && HandRotationZ > 0) ? imgFront : imgBack


  //Producto punto
  //Vectores
  function crossProductFromPoints(point1A, point2A, point1B, point2B) {
    const vectorA = [point2A[0] - point1A[0], point2A[1] - point1A[1], point2A[2] - point1A[2]];
    const vectorB = [point2B[0] - point1B[0], point2B[1] - point1B[1], point2B[2] - point1B[2]];

    const result = [
        vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
        vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
        vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
    ];

    return result;
}

// Ejemplo de uso:
const point1A = [rslt[9].x, rslt[9].y, 0];
const point2A = [rslt[10].x, rslt[10].y, 0];
const point1B = [rslt[9].x, rslt[9].y, 0];
const point2B = [rslt[13].x, rslt[13].y, 0];

const result = crossProductFromPoints(point1A, point2A, point1B, point2B);

//ARREGLAR QUE RECONOZCA QUE MANO ES CUAL Y SEGUN ESO ES POSITIVO O NEGATIVO
// console.log(result[2], isRight)

if ((result[2]*isRight) < 0) {
  console.log('palma');
} else {
  console.log('dorso');
}


  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, 2 * Math.PI);
  ctx.fillStyle = 'blue';
  ctx.fill();


  ctx.drawImage(selectedImage, (0 - FingerLenght / 4), (0 - FingerLenght / 2) / 1.25, FingerLenght / 2, FingerLenght / 2)

  ctx.restore()
  ctx.closePath()
}




const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  }
});
hands.onResults(onResultsHands);

const camera = new Camera(video, {
  onFrame: async () => { await hands.send({ image: video }); },
  width: canvas.width,
  height: canvas.height
});
camera.start();