// Route protection
if (!sessionStorage["loggedIn"]) {
  window.location.replace("/routes/login.html");
}

const balanceElement = document.getElementById("balance");
const titleElement = document.getElementById("title");
const loadingElement = document.querySelector(".loadingDots");
const viewBlockchainElement = document.getElementById("viewBlockchain");

// Event listeners
viewBlockchainElement.addEventListener("click", viewBlockchain);

// Show UI
showUI("mining");

function showUI(event, block) {
  if (event == "mining") {
    loadingElement.style.display = "";
    titleElement.textContent = "Currently Mining";
  } else if (event == "found") {
    loadingElement.style.display = "none";
    titleElement.textContent = `Found a block: ${block.index}`;
    setTimeout(function() {
      showUI("mining");
    }, 5000);
  }
}

// Declaring API endpoints
const API_BALANCE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/get-balance"
    : "https://nitros.now.sh/get-balance";
const API_MINE =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/mine"
    : "https://nitros.now.sh/mine";
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
getBalance();

function getBalance() {
  if (sessionStorage["balance"]) {
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
        sessionStorage["balance"] = res;
        const icon = document.createElement("i");
        icon.setAttribute("class", "fa fa-bitcoin");
        const text = document.createElement("a");
        text.append(icon);
        text.append(" ");
        text.append(res);
        balanceElement.append(text);
      });
  }
}

// Start mining
startMining();

function startMining() {
  socket.emit("mine", function() {});
}

socket.on("found_block", function(msg) {
  console.log(msg);
  if (msg.message == "Found a block") {
    showUI("found", msg.block);
    startMining();
  }
});

// Event listeners functions
function viewBlockchain() {
  window.location.replace("/routes/explorer.html");
}
