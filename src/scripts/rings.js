// Import Objects from other .Js
import { gestures } from "./rings_gestures.js"
import { models } from "./rings_models.js"
//Cam Config
const x = 400
const y = x/(16/9)
console.log(x)
const config = { video: { width: x, height: y, fps: 30 } }
//Initialize variables just ONE time when code start
var idModel;
if (!idModel) {
  var idModel = 0
  var fingerIndex = 1 // 0 = Index, 1 = Middel, 2 = Ring, 3 = Pinky
  var condicional = true
}
//Identify gestures 
const gestureStrings = {
  'rock': '✊️',
  'paper': '🖐',
  'scissors': '✌️'
}
//Create Hand Detector
async function createDetector() {
  return window.handPoseDetection.createDetector(
    window.handPoseDetection.SupportedModels.MediaPipeHands,
    {
      runtime: "mediapipe",
      modelType: "full",
      maxHands: 1,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`
    }
  )
}

async function main() {
  const video = document.getElementsByClassName('input_video')[0];
  var canvas = document.querySelector("#pose-canvas")
  const ctx = canvas.getContext("2d")
  console.log(video.width, canvas.height)
  const resultLayer = document.querySelector("#pose-results")
  const knownGestures = [...gestures]
  const GE = new fp.GestureEstimator(knownGestures)
  // load handpose model
  const detector = await createDetector()
  // main estimation loop
  const estimateHands = async () => {
    // clear canvas overlay
    ctx.clearRect(0, 0, config.video.width, config.video.height)
    // get hand landmarks from video
    const hands = await detector.estimateHands(video, {
      flipHorizontal: false
    })

    for (const hand of hands) {
      // console.log(hand)
      drawImage(ctx, hand, fingerIndex)
      const keypoints3D = hand.keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
      const predictions = GE.estimate(keypoints3D, 9)

      if (predictions.gestures.length > 0) {
        const result = predictions.gestures.reduce((p, c) => (p.score > c.score) ? p : c)
        const found = gestureStrings[result.name]
        if (condicional) {
          if (found === '✊️') {
            cambiarDedo();
          } else if (found === '✌️' && idModel < models.length - 1) {
            updateModel(resultLayer, 1);
          } else if (found === '✌️' && idModel === models.length - 1) {
            updateModel(resultLayer, - (models.length - 1));
          }
        }
      }
    }
    setTimeout(() => { estimateHands() }, 1000 / config.video.fps,)
  }
  estimateHands()
}
//Cam propieties
async function initCamera(width, height, fps) {
  const constraints = {
    audio: false,
    video: {
      facingMode: "user",
      width: width,
      height: height,
      frameRate: { max: fps }
    }
  }

  const video = document.getElementsByClassName('input_video')[0]
  video.width = width
  video.height = height
  // get video stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  video.srcObject = stream
  return new Promise(resolve => {
    video.onloadedmetadata = () => { resolve(video) }
  })
}

function updateModel(resultLayer, newId) {
  condicional = false;
  idModel = idModel + newId;
  setTimeout(() => { condicional = true; }, 2000);
  resultLayer.innerText = models[idModel].nombre;
  setTimeout(() => { resultLayer.innerText = ''; }, 3000);
}

function cambiarDedo() {
  condicional = false
  if (fingerIndex < 3) {
    fingerIndex++
  } else {
    fingerIndex = 0
  }
  setTimeout(() => { condicional = true; }, 1000);
}

function drawImage(ctx, hand, fingerIndex) {
  //Set sources Images
  var imgFront = new Image();
  imgFront.src = models[idModel].front;

  var imgBack = new Image();
  imgBack.src = models[idModel].back;
  //Chose finger
  const fingerIdNodes = [5, 9, 13, 17]
  const x1 = hand.keypoints[fingerIdNodes[fingerIndex]].x
  const y1 = hand.keypoints[fingerIdNodes[fingerIndex]].y
  const x2 = hand.keypoints[fingerIdNodes[fingerIndex] + 1].x
  const y2 = hand.keypoints[fingerIdNodes[fingerIndex] + 1].y

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
  HandRotationZ = ((hand.keypoints3D[5].z + hand.keypoints3D[10].z + hand.keypoints3D[17].z + (hand.keypoints3D[0].z / 10)) / 4)

  const isLeftHand = hand.handedness === 'Left';
  const selectedImage = (isLeftHand && HandRotationZ > 0) || (!isLeftHand && HandRotationZ > 0) ? imgFront : imgBack
  ctx.drawImage(selectedImage, (0 - FingerLenght / 4), (0 - FingerLenght / 2) / 1.25, FingerLenght / 2, FingerLenght / 2)

  ctx.restore()
  ctx.closePath()
}

window.addEventListener("DOMContentLoaded", () => {
  initCamera(
    config.video.width, config.video.height, config.video.fps
  ).then(video => {
    video.play()
    video.addEventListener("loadeddata", event => {
      main()
    })
  })
})