loadDevices();
renderHistory();

const savedUser = getCurrentUser();

if (savedUser) {
  document.getElementById("username").value = savedUser;
}

updateUserUI();

const defaultTemplate = `
Cliente: {clientId}
IP: {ipAccess}
Uptime: {uptime}

Interface: {interface}
Speed: {speed}
Ping: {ping}
CRC: {crc}
ARP: {arp}

Logs:
{logs}
`;

const savedTemplate = localStorage.getItem("report_template");

document.getElementById("report_template").value =
  savedTemplate || defaultTemplate;