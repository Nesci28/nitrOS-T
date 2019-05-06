const messageBoxElement = document.querySelector(".messageBox");
const loadingDotsElement = document.querySelector(".loadingDots");
const containerMessageElement = document.querySelector(".containerMessage");
const API_URL =
  window.location.hostname !== "127.0.0.1"
    ? "http://localhost:5000/v2/mews"
    : "https://meower-api.now.sh/v2/mews";

messageBoxElement.style.display = "none";
loadingDotsElement.style.display = "";
containerMessageElement.style.display = "none";

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
        link.textContent = "Read More";

        header.appendChild(headerSpan);
        innerDiv.appendChild(header);
        innerDiv.appendChild(title);
        innerDiv.appendChild(message);
        innerDiv.appendChild(link);
        outerDiv.appendChild(innerDiv);
        containerMessageElement.appendChild(outerDiv);
      });
    });
  messageBoxElement.style.display = "";
  loadingDotsElement.style.display = "none";
  containerMessageElement.style.display = "";
}
