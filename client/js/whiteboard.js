// Line color
document
  .getElementById("cyanRadioLine")
  .addEventListener("change", canvasCreator);
document
  .getElementById("purpleRadioLine")
  .addEventListener("change", canvasCreator);
document
  .getElementById("lightRadioLine")
  .addEventListener("change", canvasCreator);
document
  .getElementById("darkRadioLine")
  .addEventListener("change", canvasCreator);
document
  .getElementById("greenRadioLine")
  .addEventListener("change", canvasCreator);
document
  .getElementById("yellowRadioLine")
  .addEventListener("change", canvasCreator);
document
  .getElementById("redRadioLine")
  .addEventListener("change", canvasCreator);
document.getElementById("lineWidth").addEventListener("input", canvasCreator);

// Wallpaper color
document
  .getElementById("cyanRadioWall")
  .addEventListener("change", canvasCreator);
document
  .getElementById("purpleRadioWall")
  .addEventListener("change", canvasCreator);
document
  .getElementById("lightRadioWall")
  .addEventListener("change", canvasCreator);
document
  .getElementById("darkRadioWall")
  .addEventListener("change", canvasCreator);
document
  .getElementById("greenRadioWall")
  .addEventListener("change", canvasCreator);
document
  .getElementById("yellowRadioWall")
  .addEventListener("change", canvasCreator);
document
  .getElementById("redRadioWall")
  .addEventListener("change", canvasCreator);

// Save, Reset, Cancel clicks
document.getElementById("save").addEventListener("click", saveCanvas);
document.getElementById("reset").addEventListener("click", clearCanvas);
document.getElementById("cancel").addEventListener("click", back);

//  Generating the whiteboard
let canvas = new fabric.Canvas("canvas");
let blankCanvas = new fabric.Canvas("blankCanvas");
canvasCreator();
getLineWidth();
window.onresize = canvasCreator;

function canvasCreator() {
  canvas.backgroundColor = getColorRadioWall();
  canvas.setHeight(setCanvasHeight());
  canvas.setWidth(setCanvasWidth());
  canvas.isDrawingMode = 1;
  canvas.freeDrawingBrush.color = getColorRadioLine();
  canvas.freeDrawingBrush.width = getLineWidth();
  canvas.renderAll();
}

// Whiteboard informations
function getColorRadioLine() {
  let cyanRadio = document.querySelector("#cyanRadioLine").checked;
  if (cyanRadio == true) return "#17a2b8";
  let purpleRadio = document.querySelector("#purpleRadioLine").checked;
  if (purpleRadio == true) return "#8a008a";
  let lightRadio = document.querySelector("#lightRadioLine").checked;
  if (lightRadio == true) return "#f4f4f4";
  let darkRadio = document.querySelector("#darkRadioLine").checked;
  if (darkRadio == true) return "#343a40";
  let greenRadio = document.querySelector("#greenRadioLine").checked;
  if (greenRadio == true) return "#28a745";
  let yellowRadio = document.querySelector("#yellowRadioLine").checked;
  if (yellowRadio == true) return "#f2e931";
  let redRadio = document.querySelector("#redRadioLine").checked;
  if (redRadio == true) return "#dc3545";
}

function getColorRadioWall() {
  let cyanRadio = document.querySelector("#cyanRadioWall").checked;
  if (cyanRadio == true) return "#17a2b8";
  let purpleRadio = document.querySelector("#purpleRadioWall").checked;
  if (purpleRadio == true) return "#8a008a";
  let lightRadio = document.querySelector("#lightRadioWall").checked;
  if (lightRadio == true) return "#f4f4f4";
  let darkRadio = document.querySelector("#darkRadioWall").checked;
  if (darkRadio == true) return "#343a40";
  let greenRadio = document.querySelector("#greenRadioWall").checked;
  if (greenRadio == true) return "#28a745";
  let yellowRadio = document.querySelector("#yellowRadioWall").checked;
  if (yellowRadio == true) return "#f2e931";
  let redRadio = document.querySelector("#redRadioWall").checked;
  if (redRadio == true) return "#dc3545";
}

function getLineWidth() {
  document.getElementById("lineWidthLabel").innerHTML =
    "Width: " + document.getElementById("lineWidth").value;
  return document.getElementById("lineWidth").value;
}

function setCanvasHeight() {
  return window.innerHeight;
}

function setCanvasWidth() {
  if (window.innerWidth < 938) return window.innerWidth * 0.75;
  else return window.innerWidth * 0.85;
}

// Action Buttons
function clearCanvas() {
  canvas.clear();
  canvasCreator();
}

function back() {
  window.location.replace("/routes/message.html");
}

// Generating the blank canvas hashes
function blankCanvasCreator(wallpaper) {
  blankCanvas.backgroundColor = wallpaper;
  blankCanvas.setHeight(setCanvasHeight());
  blankCanvas.setWidth(setCanvasWidth());
  blankCanvas.renderAll();
}

function getBlankCanvasHash() {
  const blankCanvasArray = [];
  blankCanvasCreator("#17a2b8");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  blankCanvasCreator("#8a008a");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  blankCanvasCreator("#f4f4f4");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  blankCanvasCreator("#343a40");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  blankCanvasCreator("#28a745");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  blankCanvasCreator("#f2e931");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  blankCanvasCreator("#dc3545");
  blankCanvasArray.push(blankCanvas.toDataURL().split(",")[1]);
  return blankCanvasArray;
}

function saveCanvas() {
  let img = canvas.toDataURL().split(",")[1];
  let hashes = Object.values(getBlankCanvasHash());
  for (let i = 0; i < hashes.length; i++) {
    if (img == hashes[i]) {
      alert("Canvas is blank, the image won't be saved");
      return;
    }
  }

  let formData = new FormData();
  formData.append("type", "base64");
  formData.append("image", img);

  fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: new Headers({
      Authorization: "Client-ID 90ef1830bd083ba"
    }),
    body: formData
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        let link = result.data.link;
        localStorage.setItem("whiteboard", link);
        window.location.replace("../routes/message.html");
      } else {
        alert("Failed to upload the whiteboard image to imgur");
      }
    });
}
