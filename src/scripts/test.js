import { fetched } from "./models.js"

//Simulation
const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll(".my-button");

var idModel = 0
var image = new Image();
image.src = fetched.frontAR[idModel]
// image.crossOrigin = 'Anonymous';

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
let isFrontCamera = true;
let meshLoaded = false;

function onResultsFaceMesh(results) {
    if (!meshLoaded) {
        console.log("Mesh Loaded");
        meshLoaded = true;
        document.getElementById('loading').style.display = 'none';
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

    if (results.multiFaceLandmarks[0]) {
        results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
            multiFaceLandmarks.x *= video.videoWidth
            multiFaceLandmarks.y *= video.videoHeight
        });
        imageDraw(results.multiFaceLandmarks[0])
    }
}

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        switch (button.id) {
            case "ChangeLeft":
            case "ChangeRight":
                updateCounter(button.id);
                break;
            case "FlipCamera":
                flipCamera()
                break;
            default:
                console.log("Unknown button clicked");
        }
    });
});

function updateCounter(operator) {
    idModel = (operator === 'ChangeRight') ? (idModel + 1) % fetched.frontAR.length : (idModel - 1 + 3) % fetched.frontAR.length;
    console.log(idModel, (idModel + 1) % fetched.frontAR.length, (idModel - 1 + fetched.frontAR.length) % fetched.frontAR.length)
    image.src = fetched.frontAR[idModel]
}

function flipCamera() {
    isFrontCamera = !isFrontCamera;
    camera.h.facingMode = isFrontCamera ? "user" : "environment";
    video.style.transform = canvas.style.transform = isFrontCamera ? "scaleX(-1)" : "scaleX(1)";
    camera.stop();
    camera.start();
}

function screenShot() {
    const combinedCanvas = document.createElement('canvas');
    const combinedCtx = combinedCanvas.getContext('2d');

    combinedCanvas.width = video.videoWidth;
    combinedCanvas.height = video.videoHeight;
    combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
    combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

    let image_data_url = combinedCanvas.toDataURL('image/jpeg');
    console.log(image_data_url)
    const downloadLink = document.createElement('a');
    downloadLink.href = image_data_url;
    downloadLink.download = 'webcam_snapshot.jpg';
    downloadLink.click();
}

function imageDraw(rsl) {
    const nodes = [127, 356, 168];
    ctx.save()
    const x0 = rsl[nodes[0]].x
    const y0 = rsl[nodes[0]].y
    const x1 = rsl[nodes[1]].x
    const y1 = rsl[nodes[1]].y
    const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale
    const sizeY = (sizeX * image.height) / image.width
    const originX = rsl[nodes[2]].x
    const originY = rsl[nodes[2]].y
    ctx.translate(originX, originY)
    const angleHead = Math.atan((y1 - y0) / (x1 - x0))
    ctx.rotate(angleHead)
    ctx.drawImage(image, 0 - (sizeX / 2) + newXposition, 0 - (sizeY / 3) - newYposition, sizeX, sizeY)
    ctx.restore()
}

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
    onFrame: async () => {
        await faceMesh.send({ image: video });
    },
    width: { ideal: 1280 },
    height: { ideal: 720 }
});
camera.start();