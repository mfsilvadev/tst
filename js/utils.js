function sanitizeIP(input) {
  input.value = input.value.replace(/[^0-9.]/g, "");
}

function isValidIP(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}