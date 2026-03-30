const STORAGE = {
  USER: "ts_current_user",
  HISTORY: "ts_history_users"
};

function getCurrentUser() {
  return localStorage.getItem(STORAGE.USER);
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE.USER, user);
}

function getAllHistory() {
  return JSON.parse(localStorage.getItem(STORAGE.HISTORY)) || {};
}

function saveAllHistory(data) {
  localStorage.setItem(STORAGE.HISTORY, JSON.stringify(data));
}