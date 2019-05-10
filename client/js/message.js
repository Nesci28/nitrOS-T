const balanceElement = document.getElementById("balance");
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
const imageTextElement = document.getElementById("imageText");
const videoTextElement = document.getElementById("videoText");
const whiteboardTextElement = document.getElementById("whiteboardText");

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

// Declaring the API endpoints
const API_GET =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/message/1"
    : "https://nitros.now.sh/message/1";
const API_POST =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/message"
    : "https://nitros.now.sh/message";
const API_BALANCE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-balance"
    : "https://nitros.now.sh/get-balance";

// Geting the wallet balance
getBalance();

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
imageDeleteElement.style.display = "none";
videoDeleteElement.style.display = "none";
whiteboardDeleteElement.style.display = "none";
imageTextElement.style.display = "none";
videoTextElement.style.display = "none";
whiteboardTextElement.style.display = "none";
getThumbnails();

function getThumbnails() {
  if (localStorage.getItem("image")) {
    imageThumbnailElement.style.display = "";
    imageDeleteElement.style.display = "";
    imageTextElement.style.display = "";
    imageThumbnailElement.src = localStorage
      .getItem("image")
      .replace(".png", "s.png");
  }
  if (localStorage.getItem("video")) {
    videoThumbnailElement.style.display = "";
    videoDeleteElement.style.display = "";
    videoTextElement.style.display = "";
    imageThumbnailElement.src = localStorage
      .getItem("video")
      .replace(".png", "s.png");
  }
  if (localStorage.getItem("whiteboard")) {
    whiteboardThumbnailElement.style.display = "";
    whiteboardDeleteElement.style.display = "";
    whiteboardTextElement.style.display = "";
    whiteboardThumbnailElement.src = localStorage
      .getItem("whiteboard")
      .replace(".png", "s.png");
  }
}

function getBalance() {
  fetch(API_BALANCE, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      localStorage["balance"] = res;
      localStorage["balance"] = res;
      const icon = document.createElement("i");
      icon.setAttribute("class", "fa fa-bitcoin");
      const text = document.createElement("a");
      text.append(icon);
      text.append(" ");
      text.append(res);
      balanceElement.append(text);
    });
}

listAllMessage();

function listAllMessage() {
  fetch(API_GET, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      res.posts.reverse().forEach(post => {
        let outerDiv = document.createElement("div");
        outerDiv.setAttribute("class", "boxMessage");
        let innerDiv = document.createElement("div");
        innerDiv.setAttribute("class", "contentMessage");
        const header = document.createElement("h2");
        const headerSpan = document.createElement("span");

        const title = document.createElement("h3");
        const message = document.createElement("p");
        const link = document.createElement("a");

        headerSpan.textContent = post.username;
        title.textContent = post.username;
        message.textContent = post.message;
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

async function submit() {
  const post = {
    message: document.getElementById("message").value,
    image: localStorage.getItem("image"),
    video: localStorage.getItem("video"),
    whiteboard: localStorage.getItem("whiteboard")
  };
  await fetch(API_POST, {
    method: "POST",
    body: JSON.stringify(post),
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => {
      containerMessageElement.innerHTML = "";
      balanceElement.innerHTML = "";
    })
    .catch(e => {
      console.log(e);
    });

  getBalance();
  listAllMessage();
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
