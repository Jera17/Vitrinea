
import { gestures } from "./gestures.js"
const config = {
  video: { width: 640, height: 480, fps: 30 }
}

// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Imagen ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

// const img = new Image();
// img.src = 'assets/Ring_Diamonds.png';
const img = new Image();
img.src = 'assets/Ring_Diamonds - copia.png';


//const pendiente = ((y2 - y1) / (x2 - x1))
//const angleHand = Math.atan(pendiente)

let diamondRingObject = {
  name : "Diamond Ring",
  offset: 50,
  size : 90
}


const landmarkColors = {
  thumb: 'red',
  index: 'blue',
  middle: 'yellow',
  ring: 'green',
  pinky: 'pink',
  wrist: 'white'
}

const gestureStrings = {
  'thumb_up': '👍',
  'rock': '✊️',
  'paper': '🖐',
  'scissors': '✌️',
  'dont': '🙅',
  'hole': ' 👌'
}

const base = ['Horizontal ', 'Diagonal Up ']
const dont = {
  left: [...base].map(i => i.concat(`Right`)),
  right: [...base].map(i => i.concat(`Left`))
}

async function createDetector() {
  return window.handPoseDetection.createDetector(
    window.handPoseDetection.SupportedModels.MediaPipeHands,
    {
      runtime: "mediapipe",
      modelType: "full",
      maxHands: 2,
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,
    }
  )
}

async function main() {

  const video = document.querySelector("#pose-video")
  const canvas = document.querySelector("#pose-canvas")
  const ctx = canvas.getContext("2d")

  const resultLayer = {
    right: document.querySelector("#pose-result-right"),
    left: document.querySelector("#pose-result-left")
  }
  // configure gesture estimator
  // add "✌🏻" and "👍" as sample gestures

//REVISAR PORQUE EXISTE LOS 2 GESTOS DE ARRIBA CON EL CODIGO DE ABAJO SI NO ESTAN EL EN gesture.js

  const knownGestures = [
    //fp.Gestures.VictoryGesture,
    //fp.Gestures.ThumbsUpGesture,
    ...gestures
  ]
  const GE = new fp.GestureEstimator(knownGestures)
  // load handpose model
  const detector = await createDetector()
  console.log("mediaPose model loaded")
  const pair = new Set()

  function checkGestureCombination(chosenHand, poseData) {
    const addToPairIfCorrect = (chosenHand) => {
      const containsHand = poseData.some(finger => dont[chosenHand].includes(finger[2]))
      if(!containsHand) return;
      pair.add(chosenHand)
    }

    addToPairIfCorrect(chosenHand)
    if(pair.size !== 2) return;
    resultLayer.left.innerText = resultLayer.right.innerText = gestureStrings.dont
    pair.clear()
  }
  // main estimation loop
  const estimateHands = async () => {

    // clear canvas overlay
    ctx.clearRect(0, 0, config.video.width, config.video.height)
    resultLayer.right.innerText = ''
    resultLayer.left.innerText = ''

    // get hand landmarks from video
    const hands = await detector.estimateHands(video, {
      flipHorizontal: true
    })

    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ PRUEBAS ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓


    for (const hand of hands) {
      // ------- Pruebas tracking Anillo -------

      drawLine(ctx, hand)
      //drawLine(ctx, hand.keypoints[9].x, hand.keypoints[9].y, hand.keypoints[10].x, hand.keypoints[10].y)

      for (const keypoint of hand.keypoints) {
        const name = keypoint.name.split('_')[0].toString().toLowerCase()
        const color = landmarkColors[name]
        drawPoint(ctx, keypoint.x, keypoint.y, 3, color)
      }

      const keypoints3D = hand.keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
      const predictions = GE.estimate(keypoints3D, 9)
      if(!predictions.gestures.length) {
        updateDebugInfo(predictions.poseData, 'left')
      }

      if (predictions.gestures.length > 0) {

        const result = predictions.gestures.reduce((p, c) => (p.score > c.score) ? p : c)
        const found = gestureStrings[result.name]
        // find gesture with highest match score
        const chosenHand = hand.handedness.toLowerCase()
        updateDebugInfo(predictions.poseData, chosenHand)

        if(found !== gestureStrings.dont) {
          resultLayer[chosenHand].innerText = found
          continue
        }
        checkGestureCombination(chosenHand, predictions.poseData)
      }

    }
    // ...and so on
    setTimeout(() => { estimateHands() }, 1000 / config.video.fps)
  }

  estimateHands()
  console.log("Starting predictions")
}

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


function drawPoint(ctx, x, y, r, color) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

function drawLine(ctx, hand) {
  const x1 = hand.keypoints[9].x
  const y1 = hand.keypoints[9].y
  const x2 = hand.keypoints[10].x
  const y2 =  hand.keypoints[10].y
  ctx.beginPath()
  ctx.save()
  
  //set position x and y from hand
  const pstx = ((x1+x2)/2)
  const psty = ((y1+y2)/2)
  ctx.translate(pstx,psty)

  console.log()

  //Ecuacion de angulo de dos rectas

  // var productopunto = ((x1*x2)+(y1*y2))
  // var vectorA = Math.sqrt((Math.pow(x1, 2))+ Math.pow(y1, 2))
  // var vectorB = Math.sqrt((Math.pow(x2, 2))+ Math.pow(y2, 2))



  var productopunto = ((x2*0)+(y2*4))
  var vectorA = Math.sqrt((Math.pow(x2,2))+ Math.pow(y2, 2))
  var vectorB = Math.sqrt((Math.pow(0,2))+ Math.pow(4, 2))

  console.log("pp" + productopunto)
  console.log(vectorA + " " + vectorB)

  var resultado = productopunto/(vectorA*vectorB)
  console.log(resultado)

  var coseno = Math.acos(resultado)
  console.log(coseno)

  var rad = coseno * (180 / Math.PI)
  console.log(rad)

  ctx.rotate(0)

  ctx.drawImage(img, 0-(img.width/36), 0-(img.height/36), img.width/18, img.height/18)

  // console.log(pstx)
  // console.log(psty)
  
  ctx.restore()
  ctx.closePath()
}


function updateDebugInfo(data, hand) {
  const summaryTable = `#summary-${hand}`
  for (let fingerIdx in data) {
    document.querySelector(`${summaryTable} span#curl-${fingerIdx}`).innerHTML = data[fingerIdx][1]
    document.querySelector(`${summaryTable} span#dir-${fingerIdx}`).innerHTML = data[fingerIdx][2]
  }
}

window.addEventListener("DOMContentLoaded", () => {

  initCamera(
    config.video.width, config.video.height, config.video.fps
  ).then(video => {
    video.play()
    video.addEventListener("loadeddata", event => {
      console.log("Camera is ready")
      main()
    })
  })

  const canvas = document.querySelector("#pose-canvas")
  canvas.width = config.video.width
  canvas.height = config.video.height
  console.log("Canvas initialized")
})