const balanceElement = document.getElementById("balance");
const ulBlockchainElement = document.getElementById("ulBlockchain");
const blockElement = document.getElementById("block");
const timestampElement = document.getElementById("timestamp");
const transactionsElement = document.getElementById("transactions");
const difficultyElement = document.getElementById("difficulty");
const hashElement = document.getElementById("hash");
const proofElement = document.getElementById("proof");
const lastTimestampElement = document.getElementById("lastTimestamp");
const lastDifficultyElement = document.getElementById("lastDifficulty");
const previousHashElement = document.getElementById("previousHash");

// Event listeners
ulBlockchainElement.onclick = function(event) {
  var target = getEventTarget(event);
  const index = target.innerHTML;
  console.log(index);
  showBlock(index);
};

function getEventTarget(e) {
  e = e || window.event;
  return e.target || e.srcElement;
}

// Declaring the API endpoints
const API_EXPLORER =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/explorer"
    : "https://nitros-t-server.herokuapp.com/explorer";

// Show UI
showUI("blank");

function showUI(event) {
  if (event == "blank") blockElement.style.display = "none";
  else blockElement.style.display = "";
}

// Get the blockchain
getBlockchain();
let blockchain;

async function getBlockchain() {
  blockchain = await fetch(API_EXPLORER, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      res = res.reverse();
      res.forEach(block => {
        let li = document.createElement("li");
        li.textContent = block.index;
        ulBlockchainElement.append(li);
      });
      return res;
    });
}

function showBlock(index) {
  showUI("notblank");
  const block = blockchain[blockchain.length - 1 - index];
  timestampElement.textContent = block.timestamp;
  transactionsElement.textContent = JSON.stringify(block.transactions);
  difficultyElement.textContent = block.difficulty;
  hashElement.textContent = block.hash;
  proofElement.textContent = block.proof_of_work;
  lastTimestampElement.textContent = block.last_timestamp;
  lastDifficultyElement.textContent = block.last_difficulty;
  previousHashElement.textContent = block.previous_hash;
}
