const video5 = document.getElementsByClassName('input_video5')[0];
const controlsElement5 = document.getElementsByClassName('control5')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")

var idArrays = 0
var cooldown = true

function onResultsPose(results) {
  ctx.clearRect(0, 0, video5.videoWidth, video5.videoHeight)

    for (let i = 0; i <= 32; i++) {
      var x = results.poseLandmarks[i].x * video5.videoWidth
      var y = results.poseLandmarks[i].y * video5.videoHeight
      drawNodes(x, y, 'red')
    }
    
    canvas.width = video5.videoWidth;
    canvas.height = video5.videoHeight;

    var Clothe1 = new Image();
    Clothe1.src = 'assets/Tshirt.png';
    var Clothe2 = new Image();
    Clothe2.src = 'assets/ShortDress.png';
    var Clothe3 = new Image();
    Clothe3.src = 'assets/LongDress.png';

    //gesture
    const Gx0 = (results.poseLandmarks[15].x * video5.videoWidth)
    const Gy0 = (results.poseLandmarks[15].y * video5.videoHeight)
    const Gx1 = (results.poseLandmarks[16].x * video5.videoWidth)
    const Gy1 = (results.poseLandmarks[16].y * video5.videoHeight)
    const Gx2 = (results.poseLandmarks[12].x * video5.videoWidth)-(results.poseLandmarks[12].x * video5.videoWidth * 0.5)
    const Gy2 = (results.poseLandmarks[12].y * video5.videoHeight)
    drawNodes(Gx0, Gy0, 'purple')
    drawNodes(Gx1, Gy1, 'cyan')
    drawNodes(Gx2, Gy2, 'black')
    if (Gy0<Gy2) {
      console.log('+')
      console.log(idArrays)
      if(cooldown){
        if (idArrays <= 1) {
          idArrays++
        }else{
          idArrays = 0
        }
        cooldown = false
        setTimeout(() => { cooldown = true; }, 1000);
      }
    }else if(Gy1<Gy2){
      console.log('-')
      console.log(idArrays)
      if(cooldown){
        if (idArrays > 0) {
          idArrays--
        }else{
          idArrays = 2
        }
        cooldown = false
        setTimeout(() => { cooldown = true; }, 3000);
      }}


    //timer---------------

    // idArrays = 1
    const NodesArray = [
      [12, 11, 23], //Tshirt
      [12, 11, 25], //Dress
      [12, 11, 27] //Long Dress
    ]
    const clotheArray = [Clothe1, Clothe2, Clothe3]
    const polygon = getCoords(NodesArray[idArrays])
    const clotheId = clotheArray[idArrays]
    
    ctx.drawImage(clotheId, polygon.x0-(polygon.tangX/2.5), polygon.y0-(polygon.tangX/4), polygon.tangX+(polygon.tangX/1.25), polygon.tangY+(polygon.tangX/4))
    
    // if (12 > 11) {
    //   ctx.drawImage(clotheId, polygon.x0-(polygon.tangX/2.5), polygon.y0-(polygon.tangX/5), polygon.tangX+(polygon.tangX/1.25), polygon.tangY+(polygon.tangY/2.5))
    // }
    // else{
    //   ctx.drawImage(clotheId, polygon.x1-(polygon.tangX/2.5), polygon.y0-(polygon.tangX/5), polygon.tangX+(polygon.tangX/1.25), polygon.tangY+(polygon.tangY/2.5))
    // }
    drawNodes(polygon.x0-(polygon.tangX/2.5), polygon.y0-(polygon.tangX/4), 'green')
    drawNodes(polygon.x1+(polygon.tangX/2.5), polygon.y0-(polygon.tangX/4), 'green')

function getCoords(polygonIdNodes){
  const x0 = (results.poseLandmarks[polygonIdNodes[0]].x * video5.videoWidth)
  const y0 = (results.poseLandmarks[polygonIdNodes[0]].y * video5.videoHeight)
  const x1 = (results.poseLandmarks[polygonIdNodes[1]].x * video5.videoWidth)
  const y1 = (results.poseLandmarks[polygonIdNodes[1]].y * video5.videoHeight)
  const x2 = (results.poseLandmarks[polygonIdNodes[2]].x * video5.videoWidth)
  const y2 = (results.poseLandmarks[polygonIdNodes[2]].y * video5.videoHeight)
  const tangX =  Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) 
  const tangY =  Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)) 
  const magX = x1-x0
  const magY = y1-y0
  return {
    x0: x0,
    y0: y0,
    x1: x1,
    y1: y1,
    tangX: tangX,
    tangY: tangY,
    magX: magX,
    magY: magY
  }
}

function drawNodes(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath()
}
}


const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
}});
pose.onResults(onResultsPose);

const camera = new Camera(video5, {
  onFrame: async () => {
    await pose.send({image: video5});
  },
  width: 800,
  height: 600
});
camera.start();

new ControlPanel(controlsElement5, {
      selfieMode: true
    })
    .on(options => {
      video5.classList.toggle('selfie', options.selfieMode);
      pose.setOptions(options);
    });
