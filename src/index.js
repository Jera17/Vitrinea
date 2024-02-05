// Import Objects from other .Js
import { gestures } from "./gestures.js"
import { models } from "./models.js"
//Cam Config
const config = {  video: { width: 640, height: 480, fps: 30 } }
//Initialize variables just 1 time when code start
var idModel;
if (!idModel) {
  var idModel = 0
  var fingerIndex = 2 //0 = Thumb, 1 = Index, 2 = Middel, 3 = Ring, 4 = Pinky
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
  const video = document.querySelector("#pose-video")
  const canvas = document.querySelector("#pose-canvas")
  const ctx = canvas.getContext("2d")
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
      flipHorizontal: true
    })

    for (const hand of hands) {
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
    setTimeout(() => { estimateHands() }, 1000 / config.video.fps, )
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

  const video = document.querySelector("#pose-video")
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
  setTimeout(() => { condicional = true; }, 1000);
  resultLayer.innerText = models[idModel].nombre;
  setTimeout(() => { resultLayer.innerText = ''; }, 3000);
}

function cambiarDedo() {
  condicional = false 
  if (fingerIndex < 4) {
    fingerIndex++
  }else{
    fingerIndex = 0
  }
  setTimeout(() => {  condicional = true; }, 1000);
}

function drawImage(ctx, hand, fingerIndex) {
  //Set sources Images
  var imgFront = new Image();
  imgFront.src = models[idModel].front;
    
  var imgBack = new Image();
  imgBack.src = models[idModel].back;
  //Chose finger
  const fingerIdNodes = [2, 5, 9, 13, 17]
  const fingerIndexKnuckle = fingerIdNodes[fingerIndex]
  const fingerIndexPhalanges = fingerIdNodes[fingerIndex] + 1

  const x1 = hand.keypoints[fingerIndexKnuckle].x
  const y1 = hand.keypoints[fingerIndexKnuckle].y
  const x2 = hand.keypoints[fingerIndexPhalanges].x
  const y2 =  hand.keypoints[fingerIndexPhalanges].y

  ctx.beginPath()
  ctx.save()
  //set the position center of the canva and from hand
  const pstx = ((x1+x2)/2)
  const psty = ((y1+y2)/2)
  ctx.translate(pstx,psty)

  //set angle of the image
  var componenteX = 1
  if((x1-x2) > 0 ){
    componenteX = -1
  }
  const pendiente = ((y2 - y1) / (x2 - x1))
  const angleHand = Math.atan(pendiente)
  ctx.rotate(angleHand+((Math.PI/2)*componenteX))

  //Scale
  var Ld = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
  var La = Ld/3
  var Aa = (imgFront.width*La)/imgFront.height
  var resolucion = Math.sqrt(Math.pow((640 - 0), 2) + Math.pow((480 - 0), 2))
  var Ra = (Ld/resolucion)*100

  //Flip
  var acumZ = 0
  acumZ = ((hand.keypoints3D[5].z + hand.keypoints3D[10].z + hand.keypoints3D[17].z + (hand.keypoints3D[0].z/10))/4)

  const isLeftHand = hand.handedness === 'Left';
  if ((isLeftHand && acumZ > 0) || (!isLeftHand && acumZ > 0)) {
    ctx.drawImage(imgFront, 0 - Aa / 2, 0 - La / 1.25, Aa, La);
  } else {
    ctx.drawImage(imgBack, 0 - Aa / 2, 0 - La / 1.25, Aa, La);
  }

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
  const canvas = document.querySelector("#pose-canvas")
  canvas.width = config.video.width
  canvas.height = config.video.height
})