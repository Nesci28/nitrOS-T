// Route protection
if (!sessionStorage["loggedIn"]) {
  window.location.replace("/routes/login.html");
}

// Element declarations
const loadingDotsElement = document.querySelector(".loadingDots");
const balanceElement = document.getElementById("balance");
const containerMessageElement = document.querySelector(".containerMessage");
const nameElement = document.getElementById("name");
const textElement = document.getElementById("text");
const imageThumbnailElement = document.getElementById("imageThumbnail");
const videoThumbnailElement = document.getElementById("videoThumbnail");
const whiteboardThumbnailElement = document.getElementById(
  "whiteboardThumbnail"
);
const imageTextElement = document.getElementById("imageText");
const videoTextElement = document.getElementById("videoText");
const whiteboardTextElement = document.getElementById("whiteboardText");
const replyElement = document.getElementById("reply");
const alertEmptyElement = document.getElementById("alertEmpty");
const alertCreditElement = document.getElementById("alertCredit");
const replyAreaElement = document.getElementById("replyArea");
const repliesDivElement = document.getElementById("repliesDiv");

// Event listeners
// Thumbnails
imageThumbnailElement.addEventListener("click", showImage);
videoThumbnailElement.addEventListener("click", showVideo);
whiteboardThumbnailElement.addEventListener("click", showWhiteboard);
replyElement.addEventListener("click", validateReply);

let url_string = window.location.href;
let url = new URL(url_string);
let index = url.searchParams.get("postId");
const id = index;

// Loading UI
showUI("start");

function showUI(event) {
  if (event == "start") {
    loadingDotsElement.style.display = "";
    containerMessageElement.style.display = "none";

    imageThumbnailElement.style.display = "none";
    videoThumbnailElement.style.display = "none";
    whiteboardThumbnailElement.style.display = "none";
    imageTextElement.style.display = "none";
    videoTextElement.style.display = "none";
    whiteboardTextElement.style.display = "none";

    alertEmptyElement.style.display = "none";
    alertCreditElement.style.display = "none";
  }
}

// Declaring the API endpoints
const API_GET_POST =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-message/"
    : "https://nitros.now.sh/get-message/";
const API_BALANCE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-balance"
    : "https://nitros.now.sh/get-balance";
const API_REPLY =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/reply"
    : "https://nitros.now.sh/reply";
const API_SOCKET =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000"
    : "https://nitros.now.sh";

// Connecting to the list of nodes
const socket = io.connect(API_SOCKET);
socket.on("response", function(msg) {
  console.log(msg);
});

// Geting the wallet balance
getBalance("start");

function getBalance(event) {
  if (sessionStorage["balance"] && event == "start") {
    const icon = document.createElement("i");
    icon.setAttribute("class", "fa fa-bitcoin");
    const text = document.createElement("a");
    text.textContent = sessionStorage["balance"];
    balanceElement.append(icon);
    balanceElement.append(text);
  } else {
    fetch(API_BALANCE, {
      method: "GET",
      headers: {
        "content-type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        sessionStorage["balance"] = res;
        if (event == "start") {
          const icon = document.createElement("i");
          icon.setAttribute("class", "fa fa-bitcoin");
          let text = document.createElement("a");
          text.setAttribute("id", "balance");
          text.setAttribute("class", "walletBalance");
          text.append(icon);
          text.append(" ");
          text.append(res);
          balanceElement.append(text);
        } else {
          const walletBalanceElement = document.getElementById("balance");
          walletBalanceElement.getElementsByTagName("a")[0].textContent = res;
        }
      });
  }
}

// Get the post
getPost(id);

async function getPost(id) {
  posts = await fetch(API_GET_POST + id, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      let post = res.post.posts;

      nameElement.textContent = post.username;
      textElement.textContent = post.message;

      getThumbnails(post);

      showReplies(post);

      loadingDotsElement.style.display = "none";
      containerMessageElement.style.display = "";
      sessionStorage["post"] = JSON.stringify(res);
    });
}

// Load the thumbnails
function getThumbnails(post) {
  if (post.image) {
    imageThumbnailElement.style.display = "";
    imageTextElement.style.display = "";
    imageThumbnailElement.src = post.image.replace(".png", "s.png");
  }
  if (post.video) {
    videoThumbnailElement.style.display = "";
    videoTextElement.style.display = "";
    imageThumbnailElement.src = post.video.replace(".png", "s.png");
  }
  if (post.whiteboard) {
    whiteboardThumbnailElement.style.display = "";
    whiteboardTextElement.style.display = "";
    whiteboardThumbnailElement.src = post.whiteboard.replace(".png", "s.png");
  }
}

function showReplies(post) {
  post.replies.reverse().forEach(reply => {
    let innerDiv = document.createElement("div");
    innerDiv.setAttribute("class", "messageBox");
    innerDiv.setAttribute("style", "margin-bottom:30px;padding:10px;");
    const title = document.createElement("h3");
    let message = document.createElement("textarea");
    message.setAttribute("disabled", true);
    title.textContent = reply.username;
    message.textContent = reply.message;

    innerDiv.appendChild(title);
    innerDiv.appendChild(message);
    repliesDivElement.append(innerDiv);
  });
}

function showImage() {
  let post = JSON.parse(sessionStorage.getItem("post"));
  window.open(post.post.posts.image, "_blank");
}
function showVideo() {
  let post = JSON.parse(sessionStorage.getItem("post"));
  window.open(post.post.posts.video, "_blank");
}
function showWhiteboard() {
  let post = JSON.parse(sessionStorage.getItem("post"));
  window.open(post.post.posts.whiteboard, "_blank");
}

function validateReply() {
  alertEmptyElement.style.display = "none";
  alertCreditElement.style.display = "none";
  if (!replyAreaElement.value) alertEmptyElement.style.display = "";
  else {
    let post = JSON.parse(sessionStorage.getItem("post"));
    postId = post.id;

    fetch(API_REPLY, {
      method: "POST",
      body: JSON.stringify({
        id: postId,
        reply: replyAreaElement.value
      }),
      headers: {
        "content-type": "application/json"
      },
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        if (res.message == "reply posted successfully") {
          replyAreaElement.textContent = "";
          repliesDivElement.innerHTML = "";
          loadingDotsElement.style.display = "";
          getBalance();
          getPost(id);
        } else {
          alertCreditElement.style.display = "";
        }
      })
      .catch(e => {
        console.log(e);
      });
  }
}
