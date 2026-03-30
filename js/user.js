function loginUser() {
  const input = document.getElementById("username");
  const user = input.value.trim().toLowerCase();

  if (!user) {
    alert("Digite um usuário 👀");
    return;
  }

  setCurrentUser(user);

  updateUserUI();
  renderHistory();

  document.getElementById("device").focus();
}

function logoutUser() {
  localStorage.removeItem(STORAGE.USER);
  updateUserUI();
  document.getElementById("history").innerHTML = "";
}