document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("ip_lan")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("ip_mgmt")?.focus();
    }
  });

  document.getElementById("ip_mgmt")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") generate();
  });

  document.getElementById("client_id")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("ip_lan")?.focus();
    }
  });

  document.getElementById("username")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginUser();
  });

  document.getElementById("report_template")?.addEventListener("input", (e) => {
    localStorage.setItem("report_template", e.target.value);
  });

  document.querySelector(".report-box")?.classList.add("report-collapsed");

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "u") {
      e.preventDefault();

      const confirmExport = confirm(
        "Exportar resumo de usuários (quantidade de registros)?"
      );

      if (!confirmExport) return;

      exportUsersSummary();
    }
  });

});

