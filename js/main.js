loadDevices();
renderHistory();

const savedUser = getCurrentUser();

if (savedUser) {
  document.getElementById("username").value = savedUser;
}

updateUserUI();