const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

var buttonFloatingImg1 = buttonFloating1.querySelector('img');
var buttonFloatingImg2 = buttonFloating2.querySelector('img');

buttonFloatingImg1.src = '../src/assets/icons/AjustarAcercar.svg';
buttonFloatingImg2.src = '../src/assets/icons/AjustarAlejar.svg';
buttonFloating1.id = 'Ajustar'
buttonFloating2.id = 'Ajustar'

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        switch (this.className) {
            case "buttonCarousel":
            case "buttonCarousel active":
                carouselButtonsLogic(this)
                break;
            case "buttonPhoto":
                photoButtonsLogic(this)
                break;
            case "buttonCam":
                camButtonsLogic(this)
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

function carouselButtonsLogic(buttonClicked) {
    buttonsCarousel.forEach(button => button.classList.remove('active'));
    buttonClicked.classList.add('active');
    console.log('Botón clickeado:', buttonClicked.textContent);
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

function photoButtonsLogic(buttonClicked) {
    console.log("ewe")
}

function camButtonsLogic(buttonClicked) {
    console.log("uwu")
}

function floatingButtonsLogic(buttonClicked, factor) {
    console.log(buttonClicked, factor)
    switch (buttonClicked.id) {
        case 'Ajustar':
            console.log("Ajustar")
            break;
        case 'Tamaño':
            console.log("Tamaño")
            break;
        case 'Modelo':
            console.log("Modelo")
            break;
        case 'Posición':
            console.log("Posición")
            break;
        case 'Dedo':
            console.log("Dedo")
            break;
    }
}