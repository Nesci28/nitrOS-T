const API_URL =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/login"
    : "https://nitros-t-server.herokuapp.com/login";

checkSession();

function checkSession() {
  fetch(API_URL, {
    method: "GET",
    headers: {
      "content-type": "application/json"
    },
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => {
      if (res.message == "Already logged in") {
        window.location.replace("/routes/message.html");
      }
    });
}
