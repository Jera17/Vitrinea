const video2 = document.getElementsByClassName('input_video2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

var EarringPearl = new Image();
EarringPearl.src = './assets/Earring_Pearl.png';

function onResultsFaceMesh(results) {
  document.body.classList.add('loaded');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {

      const listaNodos = [323, 401];
      for (let i = 0; i < listaNodos.length; i++) {
        const x0 = results.multiFaceLandmarks[0][listaNodos[0]].x * video2.videoWidth
        const y0 = results.multiFaceLandmarks[0][listaNodos[0]].y * video2.videoHeight
        const x1 = results.multiFaceLandmarks[0][listaNodos[1]].x * video2.videoWidth
        const y1 = results.multiFaceLandmarks[0][listaNodos[1]].y * video2.videoHeight
        const xEarring = ((x0 + x1)/2)+((x0-x1)*0.75)
        const yEarring = y0 + (y1 - y0)/3
        if (x0 > x1) {
        const imageX0 = results.multiFaceLandmarks[0][352].x * video2.videoWidth
        const imageY0 = results.multiFaceLandmarks[0][352].y * video2.videoHeight
        const imageY1 = results.multiFaceLandmarks[0][433].y * video2.videoHeight
        console.log(imageX0, imageY0, imageY1)
        const imageY = (imageY1 - imageY0)
        const imageX = imageY*0.75
        console.log("   " + xEarring, yEarring, imageY, imageX)
        ctx.drawImage(EarringPearl, xEarring-(imageX/2), yEarring, imageX, imageY)
        }
      }
      console.log(landmarks)
    }
  }

function drawNodes(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}

}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
}});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video2, {
  onFrame: async () => {
    await faceMesh.send({image: video2});
  },
  width: 510,
  height: 382
});

camera.start();

new ControlPanel(controlsElement2, {
      selfieMode: true
    })
    .on(options => {
      video2.classList.toggle('selfie', options.selfieMode);
      faceMesh.setOptions(options);
    });