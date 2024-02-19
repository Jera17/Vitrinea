const video2 = document.getElementsByClassName('input_video2')[0];
const controlsElement2 = document.getElementsByClassName('control2')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

var glasses = new Image();
glasses.src = './assets/Glasses.png';

function onResultsFaceMesh(results) {
  document.body.classList.add('loaded');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    const listaNodos = [127, 356, 9];
      const x0 = results.multiFaceLandmarks[0][listaNodos[0]].x * video2.videoWidth
      const x1 = results.multiFaceLandmarks[0][listaNodos[1]].x * video2.videoWidth
      const xEarring = (x1 - x0)
      const yEarring = (xEarring*glasses.height)/glasses.width
      const imageX0 = (results.multiFaceLandmarks[0][listaNodos[2]].x * video2.videoWidth)-(xEarring/2)
      const imageY0 = results.multiFaceLandmarks[0][listaNodos[2]].y * video2.videoHeight
      ctx.drawImage(glasses, imageX0, imageY0, xEarring, yEarring)
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