// Import Objects from other .Js
import { gestures } from "./gestures.js"
import { models } from "./models.js"
//Cam Config
const config = {  video: { width: 640, height: 480, fps: 30 } }

//Initialize variables just 1 time when code start
var idModel;
if (!idModel) {
  var idModel = 0
  var fingerIndex = 1 //0 = Index, 1 = Middel, 2 = Ring, 3 = Pinky, 4 = Thumb, 
  var condicional = true
}
//Color Hand Land Mark Tracker
const landmarkColors = {
  thumb: 'red',
  index: 'blue',
  middle: 'yellow',
  ring: 'green',
  pinky: 'pink',
  wrist: 'white'
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

  const knownGestures = [...gestures]
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

    for (const hand of hands) {
      drawImage(ctx, hand, fingerIndex)

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

          // Gestures Control
          if(condicional == true ){
            if (found == '✊️') {
              cambiarDedo()
            }else if(found == '✌️' && idModel < 2){
              condicional = false
              idModel++
              console.log(idModel + " +1")
              setTimeout(() => {  condicional = true; }, 1000);
              console.log(models[idModel].front)
            }else if(found == '✌️' && idModel == 2){
              condicional = false
              idModel = 0
              console.log(idModel + " Reiniciado")
              setTimeout(() => {  condicional = true; }, 1000);
              console.log(models[idModel].front)
            }
          }

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
//Draw points from Hand Land Mark Tracker
function drawPoint(ctx, x, y, r, color) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
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
  imgBack.src = models[0].back;
  //Chose finger
  switch (fingerIndex) {
    case 0:
      var fingerIndexKnuckle = 5
      var fingerIndexPhalanges = 6
      break;
    case 1:
      var fingerIndexKnuckle = 9
      var fingerIndexPhalanges = 10
      break;
    case 2:
      var fingerIndexKnuckle = 13
      var fingerIndexPhalanges = 14
      break;
    case 3:
      var fingerIndexKnuckle = 17
      var fingerIndexPhalanges = 18
      break;
    case 4:
      var fingerIndexKnuckle = 2
      var fingerIndexPhalanges = 3
      break;
    default:
      break;
  }
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

  // const Ld = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
  var Ld = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
  var La = Ld/3
  var Aa = (imgFront.width*La)/imgFront.height
  var resolucion = Math.sqrt(Math.pow((640 - 0), 2) + Math.pow((480 - 0), 2))
  var Ra = (Ld/resolucion)*100

  //Flip
  var acumZ = 0
  acumZ = ((hand.keypoints3D[5].z + hand.keypoints3D[10].z + hand.keypoints3D[17].z + (hand.keypoints3D[0].z/10))/4)

  //draw Image
  if (hand.handedness === 'Left') {
    if (acumZ > 0) {
      ctx.drawImage(imgFront, 0-(Aa/2), 0-((La/1.25)), Aa, La)
    }else{
      ctx.drawImage(imgBack, 0-(Aa/2), 0-((La/1.25)), Aa, La)
    }
  }else{
    if (acumZ > 0) {
      ctx.drawImage(imgFront, 0-(Aa/2), 0-((La/1.25)), Aa, La)
    }else{
      ctx.drawImage(imgBack, 0-(Aa/2), 0-((La/1.25)), Aa, La)
    }
  }
  console.log(hand.handedness)
  
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