import {
  video, canvas, 
  buttonsCarousel, loaded, carousel, buttonPading,
  buttonFloating1, buttonFloating2, buttonFloatingImg1, buttonFloatingImg2,
  simulation
} from "./var.js";
import { updateData } from "./dataBase.js"

var activeButton = buttonsCarousel[0]

export function updateSimulationConfig(fetched, simulation) {
  if (fetched.simConfig.length === 3) {
    simulation.config.leftAndRight = fetched.simConfig[0];
    simulation.config.upAndDown = fetched.simConfig[1];
    simulation.config.zoomInAndOut = fetched.simConfig[2];
    console.log("Settings Fetched");
  }else{
    console.log("Settings Not Fetched");
  }
  console.log(simulation);
  console.log(simulation.config);
}

export function handleWebLoaded(webLoaded) {
  if (!webLoaded) {
    webLoaded = true;
    if (window.location.hash.substring(1) === 'A') {
      console.log("Modo Admin")
      document.querySelector('.buttonPhoto').querySelector('img').src = '../src/assets/icons/PosicionArriba.svg';
      document.querySelector('.buttonPhoto').classList.replace('buttonPhoto', 'buttonUpdate');
    }
    console.log("Mesh Loaded");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    loaded.classList.add('fadeOut');
    setTimeout(() => {
      loaded.classList.remove('fadeOut');
      loaded.style.display = 'none';
    }, 500);
  }
  return webLoaded;
}

export function setupCarouselScrollHandler() {
  carousel.addEventListener("scroll", () => {
    const carouselRect = carousel.getBoundingClientRect();
    buttonsCarousel.forEach(button => {
      const buttonRect = button.getBoundingClientRect();
      const buttonCenter = buttonRect.left + (buttonRect.width / 2) - carouselRect.left + buttonPading;
      if (buttonCenter >= carouselRect.width / 2 && buttonCenter <= carouselRect.width / 2 + buttonRect.width) {
        if (button != activeButton) {
          buttonsCarousel.forEach(btn => btn.classList.remove("active"));
          carouselButtonsLogic(button);
          button.classList.add("active");
          activeButton = button;
        }
      }
    });
  });
}

export function carouselButtonsLogic(buttonClicked) {
  buttonsCarousel.forEach(button => button.classList.remove('active'));
  buttonClicked.classList.add('active');
  console.log('Botón clickeado:', buttonClicked.textContent);
  const iconMap = {
    'Ajustar': ['AjustarAcercar.svg', 'AjustarAlejar.svg', 'Ajustar'],
    'Tamaño': ['TamañoMenos.svg', 'TamañoMas.svg', 'Tamaño'],
    'Modelo': ['ModeloAnterior.svg', 'ModeloSiguiente.svg', 'Modelo'],
    'Posición': ['PosicionAbajo.svg', 'PosicionArriba.svg', 'Posición'],
    'Dedo': ['DedoAnterior.svg', 'DedoSiguiente.svg', 'Dedo'],
    'Hombro': ['DedoAnterior.svg', 'DedoSiguiente.svg', 'Hombro']
  };
  const icons = iconMap[buttonClicked.textContent];
  if (icons) {
    [buttonFloatingImg1.src, buttonFloatingImg2.src] = icons.slice(0, 2).map(icon => `../src/assets/icons/${icon}`);
    buttonFloating1.id = buttonFloating2.id = icons[2];
  }
}

export function handleButtonClick(button,
  fetched, flipCamera) {
  switch (button.className) {
    case "buttonCarousel":
    case "buttonCarousel active":
      const scrollLeft = button.offsetLeft - (carousel.offsetWidth - button.offsetWidth) / 2;
      carousel.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
      break;
    case "buttonPhoto":
      screenShot();
      break;
    case "buttonUpdate":
      updateSimulationData(updateData)
      break;
    case "buttonCam":
      flipCamera();
      break;
    case "timer":
      timerStart(button, 5);
      break;
    case "buttonFloating1":
      floatingButtonsLogic(button, -1, fetched);
      break;
    case "buttonFloating2":
      floatingButtonsLogic(button, 1, fetched);
      break;
    default:
      console.error("Unhandled button class: ", button.className);
      break;
  }
  
  function floatingButtonsLogic(buttonClicked, factor, fetched) {
    const logicMap = {
      'Ajustar': () => simulation.config.leftAndRight = updateRelativeSimulationData(simulation.config.leftAndRight, factor),
      'Tamaño': () => simulation.config.zoomInAndOut = updateRelativeSimulationData(simulation.config.zoomInAndOut, factor),
      'Modelo': () => simulation.img = updateCounter(simulation.img, fetched, factor),
      'Posición': () => simulation.config.upAndDown = updateRelativeSimulationData(simulation.config.upAndDown, factor),
      'Dedo': () => simulation.config.relativePosition = updateFinger(simulation.config.relativePosition, factor),
      'Hombro': () => simulation.config.relativePosition = updateShoulder(simulation.config.relativePosition, factor)
    };
    const logicFunction = logicMap[buttonClicked.id];
    if (logicFunction) logicFunction();
  }
}

export function updateSimulationData(updateData) {
  let newData = {
    "arModel.simConfig": [
      simulation.config.leftAndRight,
      simulation.config.upAndDown,
      simulation.config.zoomInAndOut,
    ],
  };
  console.log(newData["arModel.simConfig"]);
  updateData(newData);
}

export function updateModel(img, fetched) {
  img.front.src = fetched.frontAR[img.id];
  img.back.src = fetched.backAR ? fetched.backAR[img.id] : fetched.frontAR[newIdModel];
}

export function updateCounter(img, fetched, factor) {
  img.id = (img.id + factor + fetched.frontAR.length) % fetched.frontAR.length;
  updateModel(img, fetched);
  return img;
}

function updateFinger(fingerId, operator) {
  console.log(fingerId)
  fingerId = (operator > 0) ? (fingerId + 1) % 4 : (fingerId - 1 + 4) % 4;
  return fingerId;
}

function updateShoulder(shoulderId, operator) {
  shoulderId = (operator > 0) ? (shoulderId + 1) % 2 : (shoulderId - 1 + 2) % 2;
  return shoulderId;
}

export function updateRelativeSimulationData(relativeData, factor) {
  if (Math.abs(relativeData + factor) <= 10) {
    relativeData += factor
  }
  console.log(relativeData)
  return relativeData
}

export function screenShot() {
  const combinedCanvas = document.createElement('canvas');
  const combinedCtx = combinedCanvas.getContext('2d');

  combinedCanvas.width = video.videoWidth;
  combinedCanvas.height = video.videoHeight;
  combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
  combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

  let image_data_url = combinedCanvas.toDataURL('image/jpeg');
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'webcam_snapshot.jpg';
  downloadLink.click();
}

export function timerStart(botonTimer, segundos) {
  const cuentaRegresivaElemento = document.getElementById('cuenta-regresiva');
  botonTimer.disabled = true;
  console.log("Deshabilitado")

  const intervalo = setInterval(() => {
    cuentaRegresivaElemento.textContent = segundos;
    console.log(segundos);
    segundos--;

    if (segundos < 0) {
      clearInterval(intervalo);
      cuentaRegresivaElemento.textContent = "";
      screenShot();

      cuentaRegresivaElemento.classList.add('blink');
      setTimeout(() => {
        cuentaRegresivaElemento.classList.remove('blink');
      }, 1000);

      botonTimer.disabled = false;
      console.log(botonTimer)
      console.log("Habilitado")
    }
  }, 1000);
}
