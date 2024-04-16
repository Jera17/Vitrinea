import { fetched } from "./models.js"

const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll(".my-button");

var idModel = 0
console.log(fetched.frontAR[idModel])
console.log(fetched.name)
console.log(fetched.type)

// glasses.crossOrigin = 'Anonymous';
const glasses = new Image();
// glasses.crossOrigin = 'anonymous';
// glasses.src = "../src/assets/images/glasses/Glasses.png"
glasses.src = fetched.frontAR[idModel]

canvas.width = 200;
canvas.height = 200;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 5;
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
ctx.fillStyle = 'red';
ctx.fill();

glasses.onload = function() {
    ctx.drawImage(glasses, 50, 50, 100, 100);
};

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        switch (button.id) {
            case "ScreenShot":
                screenShot()
                break;
            default:
                console.log("Unknown button clicked");
        }
    });
});

function screenShot() {
    let image_data_url = canvas.toDataURL('image/jpeg');
    console.log(image_data_url)
    const downloadLink = document.createElement('a');
    downloadLink.href = image_data_url;
    downloadLink.download = 'webcam_snapshot.jpg';
    downloadLink.click();
}