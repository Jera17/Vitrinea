
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function imageToBase64(url, callback) {
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

async function convertUrlsToBase64(urls, callback) {
    var counter = 0;

    urls.forEach(function (url, index) {
        imageToBase64(url, function (base64) {
            urls[index] = base64;
            counter++;
            if (counter === urls.length) {
                callback();
            }
        });
    });
}


var urls = [
    'https://firebasestorage.googleapis.com/v0/b/vitrinea-4433b.appspot.com/o/vitrineaar%2Fglasses%2Fdefault%2Fglasses.png?alt=media&token=98fdbe39-e53e-4939-89bb-349d5bb2dfe5',
    'https://i.imgur.com/pptqNMs.jpeg'
];

// Example usage:
var ewe = await convertUrlsToBase64(urls, function () {
    console.log(urls);
    return urls
});



function drawImageOnCanvas(url) {
    var image = new Image();
    image.onload = function () {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = url;
}