const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const loaded = document.getElementsByClassName('loading')[0];

const buttons = document.querySelectorAll('button');
const buttonsCarousel = document.querySelectorAll('.buttonCarousel');
const carousel = document.querySelector(".carouselButtons");
const buttonPading = parseInt(window.getComputedStyle(buttons[0]).paddingLeft) * 2

const buttonFloating1 = document.querySelector('.buttonFloating1');
const buttonFloating2 = document.querySelector('.buttonFloating2');

const buttonFloatingImg1 = document.createElement('img');
const buttonFloatingImg2 = document.createElement('img');
buttonFloatingImg1.src = '../src/assets/icons/ModeloAnterior.svg';
buttonFloatingImg2.src = '../src/assets/icons/ModeloSiguiente.svg';
buttonFloating1.appendChild(buttonFloatingImg1);
buttonFloating2.appendChild(buttonFloatingImg2);
buttonFloating1.id = buttonFloating2.id = 'Modelo';

let simulation = {
  img: {
    id: 0,
    front: new Image(),
    back: new Image()
  },
  config: {
    upAndDown: 0,
    leftAndRight: 0,
    zoomInAndOut: 0,
    relativePosition: 0,
    translationDistance: 5
  }
}

simulation.img.front.crossOrigin = 'anonymous';
simulation.img.back.crossOrigin = 'anonymous';

export {
  video, canvas, ctx, loaded, buttons, buttonsCarousel, carousel, buttonPading,
  buttonFloating1, buttonFloating2, buttonFloatingImg1, buttonFloatingImg2,
  simulation
};