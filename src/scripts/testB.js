console.time('Mesh');


const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
var loaded = document.getElementsByClassName('spinner')[0];


function onResultsPose(results) {
    if (loaded.style.display !== 'none') {
        loaded.style.display = 'none';
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log("Mesh Loaded");
        console.timeEnd('Mesh');
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks) {
        console.log(results.segmentationMask)
        results.poseLandmarks.forEach(poseLandmarks => {
            poseLandmarks.x *= video.videoWidth
            poseLandmarks.y *= video.videoHeight
        });

        for (let index = 0; index < results.poseLandmarks.length; index++) {
            drawPoints(results.poseLandmarks[index])
        }
    }
}

function drawPoints(point) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  
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