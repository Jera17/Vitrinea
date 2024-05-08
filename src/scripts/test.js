
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');




var url = "https://firebasestorage.googleapis.com/v0/b/vitrinea-4433b.appspot.com/o/vitrineaar%2Fglasses%2Fdefault%2Fglasses.png?alt=media&token=98fdbe39-e53e-4939-89bb-349d5bb2dfe5"


function drawImageOnCanvas(url) {
    var image = new Image();
    image.onload = function () {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = url;
}

function capturePhoto() {
    var link = document.createElement('a');
    link.download = 'canvas_photo.png';
    link.href = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
    link.click();
}

document.getElementById('capture-btn').addEventListener('click', function () {
    capturePhoto();
});

function imageToBase64(url, callback) {
    console.log("uwu"); // This is your Base64-encoded image string
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

imageToBase64(url, function (base64String) {
    console.log("ewe"); // This is your Base64-encoded image string
    console.log(base64String); // This is your Base64-encoded image string
    drawImageOnCanvas(base64String);
});
