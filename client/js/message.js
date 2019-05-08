const messageBoxElement = document.querySelector(".messageBox");
const loadingDotsElement = document.querySelector(".loadingDots");
const containerMessageElement = document.querySelector(".containerMessage");
const imageThumbnailElement = document.getElementById("imageThumbnail");
const videoThumbnailElement = document.getElementById("videoThumbnail");
const whiteboardThumbnailElement = document.getElementById(
  "whiteboardThumbnail"
);
const imageDeleteElement = document.getElementById("imageDelete");
const videoDeleteElement = document.getElementById("videoDelete");
const whiteboardDeleteElement = document.getElementById("whiteboardDelete");

// Event listeners
// Buttons
document.getElementById("image").addEventListener("click", saveInfo);
document.getElementById("video").addEventListener("click", saveInfo);
document.getElementById("whiteboard").addEventListener("click", saveInfo);
document.getElementById("submit").addEventListener("click", submit);

// Thumbnails
imageThumbnailElement.addEventListener("click", showImage);
videoThumbnailElement.addEventListener("click", showVideo);
whiteboardThumbnailElement.addEventListener("click", showWhiteboard);
imageDeleteElement.addEventListener("click", imageDelete);
videoDeleteElement.addEventListener("click", videoDelete);
whiteboardDeleteElement.addEventListener("click", whiteboardDelete);

// Loading UI
loadingDotsElement.style.display = "";
messageBoxElement.style.display = "none";
containerMessageElement.style.display = "none";

// Load the message
let message = localStorage.getItem("message");
if (message) setTextarea(message);

// Load the thumbnails
imageThumbnailElement.style.display = "none";
videoThumbnailElement.style.display = "none";
whiteboardThumbnailElement.style.display = "none";
imageDeleteElement.style.display = "none";
videoDeleteElement.style.display = "none";
whiteboardDeleteElement.style.display = "none";
getThumbnails();

function getThumbnails() {
  imageThumbnailElement.style.display = "none";
  videoThumbnailElement.style.display = "none";
  whiteboardThumbnailElement.style.display = "none";

  if (localStorage.getItem("image")) {
    imageThumbnailElement.style.display = "";
    imageDeleteElement.style.display = "";
    imageThumbnailElement.src = localStorage
      .getItem("image")
      .replace(".png", "s.png");
  }
  if (localStorage.getItem("video")) {
    videoThumbnailElement.style.display = "";
    videoDeleteElement.style.display = "";
    imageThumbnailElement.src = localStorage
      .getItem("video")
      .replace(".png", "s.png");
  }
  if (localStorage.getItem("whiteboard")) {
    whiteboardThumbnailElement.style.display = "";
    whiteboardDeleteElement.style.display = "";
    whiteboardThumbnailElement.src = localStorage
      .getItem("whiteboard")
      .replace(".png", "s.png");
  }
}

const API_URL = "https://meower-api.now.sh/v2/mews";

listAllMessage();

function listAllMessage() {
  fetch(`${API_URL}`)
    .then(res => res.json())
    .then(res => {
      res.mews.forEach(post => {
        let outerDiv = document.createElement("div");
        outerDiv.setAttribute("class", "boxMessage");
        let innerDiv = document.createElement("div");
        innerDiv.setAttribute("class", "contentMessage");
        const header = document.createElement("h2");
        const headerSpan = document.createElement("span");

        const title = document.createElement("h3");
        const message = document.createElement("p");
        const link = document.createElement("a");

        headerSpan.textContent = post.name;
        title.textContent = post.name;
        message.textContent = post.content;
        link.textContent = "See Post";

        header.appendChild(headerSpan);
        innerDiv.appendChild(header);
        innerDiv.appendChild(title);
        innerDiv.appendChild(message);
        innerDiv.appendChild(link);
        outerDiv.appendChild(innerDiv);
        containerMessageElement.appendChild(outerDiv);

        messageBoxElement.style.display = "";
        loadingDotsElement.style.display = "none";
        containerMessageElement.style.display = "";
      });
    });
}

function saveInfo() {
  let message = document.getElementById("message").value;
  localStorage.setItem("message", message);
}

function setTextarea(message) {
  document.getElementById("message").value = message;
}

function submit() {
  clearLocalStorage();
  setTextarea("");
}

function clearLocalStorage() {
  localStorage.setItem("message", "");
  localStorage.setItem("image", "");
  localStorage.setItem("video", "");
  localStorage.setItem("whiteboard", "");
}

function showImage() {
  window.open(localStorage.getItem("image"), "_blank");
}
function showVideo() {
  window.open(localStorage.getItem("video"), "_blank");
}
function showWhiteboard() {
  window.open(localStorage.getItem("whiteboard"), "_blank");
}
function imageDelete() {
  localStorage.setItem("image", "");
  window.location.replace("../routes/message.html");
}
function videoDelete() {
  localStorage.setItem("video", "");
  window.location.replace("../routes/message.html");
}
function whiteboardDelete() {
  localStorage.setItem("whiteboard", "");
  window.location.replace("../routes/message.html");
}
