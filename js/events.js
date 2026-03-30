document.getElementById("ip_lan").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("ip_mgmt").focus();
  }
});

document.getElementById("ip_mgmt").addEventListener("keydown", (e) => {
  if (e.key === "Enter") generate();
});

document.getElementById("client_id").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("ip_lan").focus();
  }
});

document.getElementById("username").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginUser();
});