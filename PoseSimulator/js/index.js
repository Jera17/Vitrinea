const video5 = document.getElementsByClassName('input_video5')[0];
const out5 = document.getElementsByClassName('output5')[0];
const controlsElement5 = document.getElementsByClassName('control5')[0];
const canvasCtx5 = out5.getContext('2d');
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

/*
function zColor(data) {
  //console.log(data.from.z)
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}
*/
function onResultsPose(results) {
  ctx.clearRect(0, 0, video5.videoWidth, video5.videoHeight)

    for (let i = 0; i <= 32; i++) {
      var x = results.poseLandmarks[i].x * video5.videoWidth
      var y = results.poseLandmarks[i].y * video5.videoHeight
      drawNodes(x, y)
      //console.log(i)
    }
    
    var imgFront = new Image();
    imgFront.src = 'assets/Tshirt_Green.png';

    const polygonIdNodes = [12, 11, 23]
    const polygon = getCoords(polygonIdNodes)

    ctx.drawImage(imgFront, polygon.x0, polygon.y0, polygon.magX, polygon.magY)
    console.log(imgFront, polygon.x0, polygon.y0, polygon.magX, polygon.magY)
    console.log("Poligono dibujado con exito")

    //drawImage()

// function drawImage(){
//   //Set sources Images
//   var imgFront = new Image();
//   imgFront.src = 'assets/Tshirt_Green.png';
//   ctx.drawImage(imgFront, 20, 20, 200, 300)
//   // ctx.drawImage(selectedImage, (0 - FingerLenght / 4), (0 - FingerLenght/2) / 1.25, FingerLenght / 2, FingerLenght / 2 )
// }

function getCoords(polygonIdNodes){
  const x0 = results.poseLandmarks[polygonIdNodes[0]].x * video5.videoWidth
  const y0 = results.poseLandmarks[polygonIdNodes[0]].y * video5.videoHeight
  const x1 = results.poseLandmarks[polygonIdNodes[1]].x * video5.videoWidth
  const y1 = results.poseLandmarks[polygonIdNodes[2]].y * video5.videoHeight
  const magX = x1-x0
  const magY = y1-y0
  console.log(x0, y0, x1, y1, magX, magY)
  console.log("Poligono calculado con exito")
  return {
    x0: x0,
    y0: y0,
    magX: magX,
    magY: magY
  }
}

function drawNodes(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath()
}

/*
  document.body.classList.add('loaded');
  canvasCtx5.save();
  canvasCtx5.clearRect(0, 0, out5.width, out5.height);
  canvasCtx5.drawImage(
      results.image, 0, 0, out5.width, out5.height);
  drawConnectors(
      canvasCtx5, results.poseLandmarks, POSE_CONNECTIONS, {
        color: (data) => {
          const x0 = out5.width * data.from.x;
          const y0 = out5.height * data.from.y;
          const x1 = out5.width * data.to.x;
          const y1 = out5.height * data.to.y;
          // console.log(results.poseLandmarks[0])
          const z0 = clamp(data.from.z + 0.5, 0, 1);
          const z1 = clamp(data.to.z + 0.5, 0, 1);

          const gradient = canvasCtx5.createLinearGradient(x0, y0, x1, y1);
          gradient.addColorStop(
              0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
          gradient.addColorStop(
              1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
          return gradient;
        }
      });
  drawLandmarks(
      canvasCtx5,
      Object.values(POSE_LANDMARKS_LEFT)
          .map(index => results.poseLandmarks[index]),
      {color: zColor, fillColor: '#FF0000'});
  drawLandmarks(
      canvasCtx5,
      Object.values(POSE_LANDMARKS_RIGHT)
          .map(index => results.poseLandmarks[index]),
      {color: zColor, fillColor: '#00FF00'});
  drawLandmarks(
      canvasCtx5,
      Object.values(POSE_LANDMARKS_NEUTRAL)
          .map(index => results.poseLandmarks[index]),
      {color: zColor, fillColor: '#AAAAAA'});
  canvasCtx5.restore();
*/
}
const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
}});
pose.onResults(onResultsPose);

const camera = new Camera(video5, {
  onFrame: async () => {
    await pose.send({image: video5});
  },
  width: 640,
  height: 480
});
camera.start();

new ControlPanel(controlsElement5, {
      selfieMode: true
    })
    .on(options => {
      video5.classList.toggle('selfie', options.selfieMode);
      pose.setOptions(options);
    });
