const emailInputElement = document.getElementById("emailAddress");
const usernameInputElement = document.getElementById("username");
const passwordInputElement = document.getElementById("password");
const confirmPasswordInputElement = document.getElementById("confirmPassword");

// API endpoints
const API_REGISTER =
  window.location.hostname == "127.0.0.1" ||
  window.location.hostname == "localhost"
    ? "http://localhost:5000/register"
    : "https://nitros-t-server.herokuapp.com/register";

// Hiding the warnings
function hideWarnings() {
  missingEmail.style.display = "none";
  missingUsername.style.display = "none";
  passwordConfirmation.style.display = "none";
  invalidEmail.style.display = "none";
}
hideWarnings();

// Event listeners
window.addEventListener("keypress", e => {
  if (e.keyCode == 13) validateForm();
});
document.getElementById("submit").addEventListener("click", validateForm);

function validateForm() {
  hideWarnings();
  if (!emailInputElement.value) {
    missingEmail.style.display = "";
    return false;
  }
  if (
    !emailInputElement.value.match(
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    )
  ) {
    invalidEmail.style.display = "";
    return false;
  }
  if (!usernameInputElement.value) {
    missingUsername.style.display = "";
    return false;
  }
  if (!passwordInputElement || !confirmPasswordInputElement) {
    passwordConfirmation.style.display = "";
    return false;
  }
  if (passwordInputElement.value != confirmPasswordInputElement.value) {
    passwordConfirmation.style.display = "";
    return false;
  }
  const form = {
    email: emailInputElement.value,
    username: usernameInputElement.value,
    password: passwordInputElement.value
  };
  fetch(API_REGISTER, {
    method: "POST",
    body: JSON.stringify(form),
    headers: {
      "content-type": "application/json"
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.message == "Account created") {
        window.location.replace("/routes/login.html");
      }
    })
    .catch(e => {
      console.log(e);
    });
}
