function getHistory() {
  const user = getCurrentUser();
  const all = getAllHistory();
  return all[user] || [];
}

function saveToHistory(entry) {
  const user = getCurrentUser();
  if (!user) return;

  const all = getAllHistory();

  if (!all[user]) all[user] = [];

  let history = all[user];

  history.unshift(entry);
  history = history.slice(0, 20);

  all[user] = history;

  saveAllHistory(all);
  renderHistory();
}

function clearHistory() {
  const user = getCurrentUser();
  if (!user) return;

  if (!confirm("Recomendamos exportar! Deseja limpar o histórico?")) return;

  const all = getAllHistory();
  all[user] = [];

  saveAllHistory(all);
  renderHistory();
}

function formatRelativeDate(dateString) {
  const now = new Date();
  const date = new Date(dateString);

  const diffMin = Math.floor((now - date) / 60000);
  const diffHour = Math.floor((now - date) / 3600000);
  const diffDay = Math.floor((now - date) / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHour < 24) return `há ${diffHour}h`;
  if (diffDay === 1) return "ontem";
  if (diffDay < 7) return `há ${diffDay} dias`;

  return date.toLocaleDateString("pt-BR");
}

function renderHistory() {
  const history = getHistory();
  const search = document.getElementById("history_search").value.toLowerCase();

  const container = document.getElementById("history");

  const filtered = history.filter(item =>
    item.clientId?.toLowerCase().includes(search) ||
    (item.ipAccess || "").includes(search)
  );

  container.innerHTML = filtered.map((item, i) => {
    const formatted = formatRelativeDate(item.date);

    return `
      <div class="history-item" onclick="loadHistory('${item.date}')"">
        <strong>${item.clientId || "Sem ID"}</strong>
        <small>${item.ipAccess}</small>
        <small class="history-date" title="${new Date(item.date).toLocaleString("pt-BR")}">
          ${formatted}
        </small>
      </div>
    `;
  }).join("");
}

function loadHistory(date) {
  const item = getHistory().find(h => h.date === date);
  if (!item) return;

  // restaura inputs
  document.getElementById("device").value = item.deviceId;
  document.getElementById("client_id").value = item.clientId;
  document.getElementById("ip_lan").value = item.ipAccess;
  document.getElementById("ip_mgmt").value = item.ipMgmt;

  // restaura TS
  if (item.rawOutput) {
    document.getElementById("raw_output").value = item.rawOutput;

    // 👉 garante que está no parser
    showParser();

    // 👉 força reprocessamento (ESSENCIAL)
    setTimeout(() => {
      parseOutput();
    }, 50);
  } else {
    // fallback: volta pra aba de comandos
    showResult();
    generate(true);
  }
}

function exportHistory() {
  const user = getCurrentUser();

  if (!user) {
    alert("Nenhum usuário logado 👀");
    return;
  }

  const data = {
    user,
    exportedAt: new Date().toISOString(),
    history: getHistory()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `history-${user}.json`;
  a.click();
}

function exportUsersSummary() {
  const all = getAllHistory();

  const users = Object.entries(all).map(([user, history]) => ({
    user,
    total: history.length
  }));

  const data = {
    exportedAt: new Date().toISOString(),
    users
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ts-tool-users-summary.json";
  a.click();
}