const video5 = document.getElementsByClassName('input_video5')[0];
const controlsElement5 = document.getElementsByClassName('control5')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

var idArrays = 0
var cooldown = true

function onResultsPose(results) {
  ctx.clearRect(0, 0, video5.videoWidth, video5.videoHeight)
  canvas.width = video5.videoWidth;
  canvas.height = video5.videoHeight;

  var Clothe1 = new Image();
  Clothe1.src = 'assets/Tshirt.png';
  //gesture
  const NodesForearm = [13, 14]

  for (let i = 0; i < NodesForearm.length; i++) {
    const x1 = results.poseLandmarks[NodesForearm[i]].x * video5.videoWidth
    const y1 = results.poseLandmarks[NodesForearm[i]].y * video5.videoHeight
    const x2 = results.poseLandmarks[NodesForearm[i]+2].x * video5.videoWidth
    const y2 = results.poseLandmarks[NodesForearm[i]+2].y * video5.videoHeight
    if(i==0){
      forearm = 'derecha'
    }else if(i==1){
      forearm = 'izquierda'
    }
    console.log(forearm, x1,y1,x2,y2)
    drawNodes(x1, y1, "red")
    drawNodes(x2, y2, "red")
    drawLines(x1, y1, x2, y2, "green")
  }

function drawNodes(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}
function drawLines(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
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

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
}});
pose.onResults(onResultsPose);

const camera = new Camera(video5, {
  onFrame: async () => {
    await pose.send({image: video5});
  },
  width: 800,
  height: 600
});
camera.start();

new ControlPanel(controlsElement5, {
      selfieMode: true
    })
    .on(options => {
      video5.classList.toggle('selfie', options.selfieMode);
      pose.setOptions(options);
    });
