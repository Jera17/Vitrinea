import { fetched } from "./models.js"

//Crear Variables
const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
var loaded = document.getElementById('loading')

const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');
const carousel = document.querySelector(".carouselButtons");
const buttonPading = parseInt(window.getComputedStyle(buttons[0]).paddingLeft) * 2
var activeButton = buttonsCarousel[0]

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

var buttonFloatingImg1 = document.createElement('img');
var buttonFloatingImg2 = document.createElement('img');

buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = 'Tamaño'
buttonFloating2.id = 'Tamaño'

var idModel = 0
var image = new Image();
image.src = fetched.frontAR[idModel]

const manualAjust = 10
var translationDistance = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1
var isFrontCamera = true;

//Funcion donde se genera el trackeo de cuerpo
function onResultsFaceMesh(results) {
    //Quitar el gif de 'cargando' cuando se inicia la funcion actual
    if (loaded.style.display !== 'none') {
        loaded.style.display = 'none';
        //Establece el ancho del canva segun el ancho de el video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log("Mesh Loaded");
    }
    //Limpia el canva para que se pueda dibujar el siguiente frame de la simulación
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)
    //Si se realizó el trackeo, dibujar sobre este la simulación
    if (results.multiFaceLandmarks[0]) {
        //Escalar el trackeo para que se ajuste al tamaño de la imagen
        results.multiFaceLandmarks[0].forEach(multiFaceLandmarks => {
            multiFaceLandmarks.x *= video.videoWidth
            multiFaceLandmarks.y *= video.videoHeight
        });
        //dibujar simulación
        imageDraw(results.multiFaceLandmarks[0])
    }
}

//Cuando se scrollea el carrusel
carousel.addEventListener("scroll", () => {
    const carouselRect = carousel.getBoundingClientRect();
    buttonsCarousel.forEach(button => {
        const buttonRect = button.getBoundingClientRect();
        const buttonCenter = buttonRect.left + (buttonRect.width / 2) - carouselRect.left + buttonPading;
        if (buttonCenter >= carouselRect.width / 2 && buttonCenter <= carouselRect.width / 2 + buttonRect.width) {
            if (button != activeButton) { //Si el boton clickeado no es el activo, desplazarse hacia el y activarlo
                buttonsCarousel.forEach(btn => btn.classList.remove("active"));
                carouselButtonsLogic(button)
                button.classList.add("active");
                activeButton = button
            }
        }
    });
});

//Cuando se clicka un boton
buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        switch (this.className) {
            case "buttonCarousel":
            case "buttonCarousel active":
                //Desplazar al boton activo
                const scrollLeft = button.offsetLeft - (carousel.offsetWidth - button.offsetWidth) / 2;
                carousel.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth"
                });
                break;
            case "buttonPhoto":
                screenShot()
                break;
            case "buttonCam":
                flipCamera()
                break;
            case "buttonFloating1":
                floatingButtonsLogic(this, -1)
                break;
            case "buttonFloating2":
                floatingButtonsLogic(this, 1)
                break;
            default:
                console.log("error")
                break;
        }
    });
});

//Cuando se clicka un boton del carrusel, se activa solo ese boton
function carouselButtonsLogic(buttonClicked) {
    buttonsCarousel.forEach(button => button.classList.remove('active'));
    buttonClicked.classList.add('active');
    console.log('Botón clickeado:', buttonClicked.textContent);
    //Se cambia los iconos y ID de los botones flotantes
    switch (buttonClicked.textContent) {
        case 'Ajustar':
            buttonFloatingImg1.src = '../src/assets/icons/AjustarAcercar.svg';
            buttonFloatingImg2.src = '../src/assets/icons/AjustarAlejar.svg';
            buttonFloating1.id = 'Ajustar'
            buttonFloating2.id = 'Ajustar'
            break;
        case 'Tamaño':
            buttonFloatingImg1.src = '../src/assets/icons/TamañoMenos.svg';
            buttonFloatingImg2.src = '../src/assets/icons/TamañoMas.svg';
            buttonFloating1.id = 'Tamaño'
            buttonFloating2.id = 'Tamaño'
            break;
        case 'Modelo':
            buttonFloatingImg1.src = '../src/assets/icons/ModeloAnterior.svg';
            buttonFloatingImg2.src = '../src/assets/icons/ModeloSiguiente.svg';
            buttonFloating1.id = 'Modelo'
            buttonFloating2.id = 'Modelo'
            break;
        case 'Posición':
            buttonFloatingImg1.src = '../src/assets/icons/PosicionAbajo.svg';
            buttonFloatingImg2.src = '../src/assets/icons/PosicionArriba.svg';
            buttonFloating1.id = 'Posición'
            buttonFloating2.id = 'Posición'
            break;
        case 'Dedo':
            buttonFloatingImg1.src = '../src/assets/icons/DedoAnterior.svg';
            buttonFloatingImg2.src = '../src/assets/icons/DedoSiguiente.svg';
            buttonFloating1.id = 'Dedo'
            buttonFloating2.id = 'Dedo'
            break;
    }
}

//Los botones flotantes llaman a una funcion con respecto a su ID
function floatingButtonsLogic(buttonClicked, factor) {
    switch (buttonClicked.id) {
        case 'Ajustar':
            console.log("Ajustar")
            break;
        case 'Tamaño':
            updateZoom(factor)
            break;
        case 'Modelo':
            updateCounter(factor)
            break;
        case 'Posición':
            updateY(factor)
            break;
        case 'Dedo':
            console.log("Dedo")
            break;
    }
}
//Actualiza la posicion en Y del elemento segun el factor (1 o -1), y lo acumula en una variable contador y multiplica por una constante
function updateY(factor) {
    if (Math.abs(upAndDown + factor) <= manualAjust) { //Si el contador + 1 es <= a la variable de cuantas veces se puede ajustar manualmente
        upAndDown += factor
        newYposition = upAndDown * translationDistance;
    }
}
//Actualiza la poel tamaño del elemento segun el factor (1 o -1), y lo acumula en una variable contador y multiplica por una constante
function updateZoom(factor) {
    if (Math.abs(zoomInAndOut + factor) <= manualAjust) { //Si el contador + 1 es <= a la variable de cuantas veces se puede ajustar manualmente
        zoomInAndOut += factor;
        newScale = 1 + (zoomInAndOut * 0.05);
    }
}
//Recorrer el array de imagenes
function updateCounter(factor) {
    idModel = (idModel + factor + fetched.frontAR.length) % fetched.frontAR.length;
    console.log(idModel)
    image.src = fetched.frontAR[idModel]
}
//Utilizar la camara de atras/adelante
function flipCamera() {
    isFrontCamera = !isFrontCamera;
    camera.h.facingMode = isFrontCamera ? "user" : "environment";
    video.style.transform = canvas.style.transform = isFrontCamera ? "scaleX(-1)" : "scaleX(1)"; //Girar horizontalmente para invertir la imagen
    camera.stop(); //apagar y encender para reiniciar la camara y se apliquen los cambios
    camera.start();
}

function screenShot() {
    const combinedCanvas = document.createElement('canvas'); //Crea canva para dibujar la simulacion y video sobre este
    const combinedCtx = combinedCanvas.getContext('2d');

    combinedCanvas.width = video.videoWidth;
    combinedCanvas.height = video.videoHeight;
    combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);//dibuja simulacion y video en el canva combinado
    combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

    let image_data_url = combinedCanvas.toDataURL('image/jpeg'); //convertir a jpeg
    const downloadLink = document.createElement('a');
    downloadLink.href = image_data_url;
    downloadLink.download = 'webcam_snapshot.jpg';
    downloadLink.click(); //empezar descarga de imagen
}

function imageDraw(rsl) {
    //Nodos de la simulacion cien izquirda, cien derecha y centro puente de la nariz
    const nodes = [127, 356, 168];
    ctx.save()
    const x0 = rsl[nodes[0]].x
    const y0 = rsl[nodes[0]].y
    const x1 = rsl[nodes[1]].x
    const y1 = rsl[nodes[1]].y
    const sizeX = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) * newScale //Distancia de cien a cien
    const sizeY = (sizeX * image.height) / image.width //Escala la altura de la imagen con respecto a su ancho 
    const originX = rsl[nodes[2]].x
    const originY = rsl[nodes[2]].y
    ctx.translate(originX, originY) //poner el origen de imagen en el puente de la nariz
    const angleHead = Math.atan((y1 - y0) / (x1 - x0)) //calcula la inclinacion de la cabeza para inclinar la imagen
    ctx.rotate(angleHead)
    ctx.drawImage(image, 0 - (sizeX / 2) + newXposition, 0 - (sizeY / 3) - newYposition, sizeX, sizeY)
    ctx.restore()
}
//tracking de rostro
const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});
faceMesh.onResults(onResultsFaceMesh);
//Configuracion de la camara
const camera = new Camera(video, {
    onFrame: async () => {
        await faceMesh.send({ image: video });
    },
    width: { ideal: 1280 },
    height: { ideal: 720 }
});
camera.start();