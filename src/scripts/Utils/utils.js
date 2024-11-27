import {
  video, canvas, ctx, loaded, buttons, buttonsCarousel, carousel, buttonPading,
  buttonFloating1, buttonFloating2, buttonFloatingImg1, buttonFloatingImg2,
  loadingTextDiv, simulation
} from "./var.js";
import { flipCamera, currentCamera } from "./simulation.js"
import { updateData } from "./dataBase.js"

var activeButton = buttonsCarousel[0]
const texts = [
  "Transformando la pantalla en tu pasarela personal",
  "Tus productos favoritos están a punto de cobrar vida",
  "Ajustando tu experiencia de prueba"
];
let intervalId, dotIntervalId;
let currentIndex = Math.floor(Math.random() * texts.length); // Índice del texto actual generado aleatoriamente
let dotCount = 0; // Contador de puntos suspensivos

export function changeText() {
  dotCount = 0; // Reiniciar contador de puntos cuando cambia el texto
  loadingTextDiv.textContent = texts[currentIndex]; // Mostrar el texto sin puntos inicialmente
  currentIndex = (currentIndex + 1) % texts.length;
}

export function updateDots() {
  dotCount = (dotCount + 1) % 4; // Incrementar puntos, reiniciar cuando llega a 4 (3 puntos suspensivos)
  const dots = '.'.repeat(dotCount); // Crear una cadena de puntos según dotCount
  loadingTextDiv.textContent = texts[currentIndex] + dots; // Actualizar el texto con puntos
}

export function startIntervals() {
  changeText(); // Mostrar el primer texto al iniciar
  intervalId = setInterval(changeText, 6000); // Cambiar texto cada 3 segundos
  dotIntervalId = setInterval(updateDots, 1000); // Agregar puntos cada 1 segundo
}

export function stopIntervals() {
  loadingTextDiv.style.display = 'none'; // Ocultar el texto de carga
  clearInterval(intervalId);
  clearInterval(dotIntervalId);
}

export function updateSimulationConfig(fetched, simulation) {
  if (fetched.simConfig.length === 3) {
    simulation.config.leftAndRight = fetched.simConfig[0];
    simulation.config.upAndDown = fetched.simConfig[1];
    simulation.config.zoomInAndOut = fetched.simConfig[2];
    console.log("Settings Fetched");
  } else {
    console.log("Settings Not Fetched");
  }
  console.log(simulation);
  console.log(simulation.config);
}

export function modeSelector() {
  if (window.location.hash.substring(1) === 'A') {
    console.log("Modo Admin")
    document.querySelector('.buttonPhoto').querySelector('img').src = '../src/assets/icons/PosicionArriba.svg';
    document.querySelector('.buttonPhoto').classList.replace('buttonPhoto', 'buttonUpdate');
    document.querySelector('.buttonShop').style.display = 'none';
  } else if (window.location.hash.substring(1) === 'T') {
    console.log("Modo Totem")
    document.querySelector('.buttonCam').querySelector('img').src = '../src/assets/icons/home.svg';
    document.querySelector('.buttonCam').classList.replace('buttonCam', 'buttonBack');
    // var css = document.getElementById("styles");
    // css.href = "../src/styles/cameraCanvaT.css";
    // document.querySelector('.buttonShop').style.display = 'none';
  } else {
    console.log("Modo Cliente")
    document.querySelector('.buttonShop').style.display = 'none';
  }
}

export function handleWebLoaded(webLoaded) {
  if (!webLoaded) {
    stopIntervals();
    webLoaded = true;
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

export function handleButtonClick(button, fetched) {
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
      flipCamera(video, canvas)
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
    case "buttonBack":
      window.location.href = "https://vitrinea-4433b.web.app/totem";
      break;
    case "buttonShop":

      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '40%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'white';
      modal.style.padding = '0vw';
      modal.style.borderRadius = '10px';
      modal.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
      modal.style.fontFamily = 'Lato, sans-serif';
      modal.style.fontSize = '2vw'; // Adjust text size relative to screen width
      modal.style.maxWidth = '50vw';  // Ensures the modal width doesn't exceed 80% of the viewport width
      modal.style.width = '50vw'; // Modal width will take 80% of the screen
      modal.style.maxHeight = '70vh'; // Limits the modal height to 70% of the screen height
      modal.style.height = 'auto';
      modal.style.textAlign = 'center';
      modal.style.overflowY = 'auto'; // Allows the modal to scroll if the content overflows
      modal.style.zIndex = '1000'; // Ensures the modal is on top of other elements

      // Text content for the modal
      const textContent = document.createElement('p');
      textContent.textContent = "Vitrinea desde tu celular.";
      textContent.style.fontSize = '3vw'; // Make text size responsive
      textContent.style.marginBottom = '0vw'; // Space between text and QR code
      modal.appendChild(textContent);

      // Close Button
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '1vw';
      closeButton.style.right = '1vw';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '3vw';
      closeButton.style.color = '#333';
      closeButton.style.cursor = 'pointer';
      closeButton.style.transition = 'all 0.3s ease';
      closeButton.onclick = () => document.body.removeChild(modal);
      closeButton.onmouseover = () => closeButton.style.color = '#f44336'; // On hover change color
      closeButton.onmouseleave = () => closeButton.style.color = '#333'; // Revert color
      modal.appendChild(closeButton);

      // QR code generation
      const queryString = window.location.search.substring(1);
      const data = `https://vitrinea-4433b.web.app/product/${queryString}`;
      console.log(data);

      const qrCanvas = document.createElement('canvas');
      qrCanvas.id = 'qrcode';
      qrCanvas.style.marginTop = '2vw'; // Space between text and QR code
      qrCanvas.style.maxWidth = '100%'; // Ensures the QR doesn't exceed the container width
      qrCanvas.style.maxHeight = '60vh'; // Prevents QR from being too large vertically
      modal.appendChild(qrCanvas);

      const options = {
        width: 500,  // QR Code size (smaller for responsiveness)
        height: 500,
        color: {
          dark: '#000000',  // dark color of the QR
          light: '#ffffff'  // light color of the QR (background)
        }
      };

      QRCode.toCanvas(qrCanvas, data, options, function (error) {
        if (error) console.error(error);
        console.log('QR Code generated!');
      });

      // Append the modal to the body
      document.body.appendChild(modal);

      // Close modal when clicking outside of it
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });


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
  img.back.src = fetched.backAR ? fetched.backAR[img.id] : fetched.frontAR[img.id];
  img.frontLeft.src = fetched.frontLeftAR ? fetched.frontLeftAR[img.id] : fetched.frontAR[img.id];
  img.frontRight.src = fetched.frontRightAR ? fetched.frontRightAR[img.id] : fetched.frontAR[img.id];
}

export function updateCounter(img, fetched, factor) {
  img.id = (img.id + factor + fetched.frontAR.length) % fetched.frontAR.length;
  updateModel(img, fetched);
  return img;
}

export function getRangeValue(value) {
  //TO DO: Revisar la logica de que valor hay que retornar
  let range = 2.0;
  if (value < -range) {
    return -1;
  } else if (value > range) {
    return 1;
  } else {
    return 0;
  }
}

export function girarModelo(giroID, giroAux, simulation) {
  if (giroID !== giroAux) {
    console.log(giroAux, giroID)
    switch (giroID) {
      case 0:
        simulation.img.selectedImage = simulation.img.front;
        break;
      case 1:
        simulation.img.selectedImage = simulation.img.frontRight;
        break;
      case -1:
        simulation.img.selectedImage = simulation.img.frontLeft;
        break;
    }
    giroAux = giroID;
  }
  return giroAux;
}

export function updateCounterRotating(img, fetched, factor) {
  switch (factor) {
    case 1:
      img.selectedImage.src = fetched.frontRightAR[img.id];
      break;
    case 0:
      img.selectedImage.src = fetched.frontAR[img.id];
      break;
    case -1:
      img.selectedImage.src = fetched.frontLeftAR[img.id];
      break;
    default:
      console.log("Unhandled case");
      break;
  }
  return img.selectedImage;
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
  if (window.location.hash.substring(1) === 'T') {
    console.log("FoTotem")
    const combinedCanvas = document.createElement('canvas');
    const combinedCtx = combinedCanvas.getContext('2d');
    // Cambiamos las dimensiones del canvas para rotarlo 90 grados
    combinedCanvas.width = video.videoHeight;
    combinedCanvas.height = video.videoWidth;
    // Guardamos el estado actual del canvas antes de rotarlo
    combinedCtx.save();
    // Movemos el origen (0,0) al centro y lo rotamos -90 grados
    combinedCtx.translate(0, combinedCanvas.height);
    combinedCtx.rotate(-Math.PI / 2);
    // Dibujamos la imagen rotada
    combinedCtx.drawImage(video, 0, 0, combinedCanvas.height, combinedCanvas.width);
    combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.height, combinedCanvas.width);
    // Restauramos el estado del canvas
    combinedCtx.restore();
    // Convertimos el contenido del canvas a una imagen
    let image_data_url = combinedCanvas.toDataURL('image/jpeg');
    const downloadLink = document.createElement('a');
    downloadLink.href = image_data_url;
    downloadLink.download = 'vitrinea.jpg';
    downloadLink.click();
    return;
  }
  const combinedCanvas = document.createElement('canvas');
  const combinedCtx = combinedCanvas.getContext('2d');
  const watermarkImage = document.querySelector('.vitrineaWatermark');

  combinedCanvas.width = video.videoWidth;
  combinedCanvas.height = video.videoHeight;

  // If the camera is front-facing, flip the canvas horizontally
  if (currentCamera.h.facingMode === "user") {
    combinedCtx.save(); // Save the current canvas state
    combinedCtx.scale(-1, 1); // Flip horizontally

    combinedCtx.drawImage(video, -combinedCanvas.width, 0, combinedCanvas.width, combinedCanvas.height);
    combinedCtx.drawImage(canvas, -combinedCanvas.width, 0, combinedCanvas.width, combinedCanvas.height);

    combinedCtx.restore();
  } else {
    combinedCtx.drawImage(video, 0, 0, combinedCanvas.width, combinedCanvas.height);
    combinedCtx.drawImage(canvas, 0, 0, combinedCanvas.width, combinedCanvas.height);
  }
  combinedCtx.drawImage(watermarkImage, (combinedCanvas.width - watermarkImage.width) / 2, 0, watermarkImage.width, watermarkImage.height);
  // Convert the canvas to an image data URL and trigger the download
  let image_data_url = combinedCanvas.toDataURL('image/jpeg');
  const downloadLink = document.createElement('a');
  downloadLink.href = image_data_url;
  downloadLink.download = 'vitrinea_flipped_or_not.jpg';
  downloadLink.click();

}

export function timerStart(botonTimer, segundos) {
  let cuentaRegresivaElemento = document.getElementById('cuenta-regresiva');
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

export function crossProductFromPoints(point1A, point2A, point1B, point2B) {
  const vectorA = [point2A[0] - point1A[0], point2A[1] - point1A[1], point2A[2] - point1A[2]];
  const vectorB = [point2B[0] - point1B[0], point2B[1] - point1B[1], point2B[2] - point1B[2]];
  const result = [
    vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
    vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
    vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
  ];
  return result;
}

export function drawPoint(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}