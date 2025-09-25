// Default values shown/used if nothing saved yet
const DEF = {
  backendUrl: "http://127.0.0.1:8000/generate",
  disease: "dyslexia",
  mock: false
};

async function load() {
  const v = await chrome.storage.sync.get(DEF);
  document.getElementById("backend").value = v.backendUrl;
  document.getElementById("profile").value = v.disease;
  document.getElementById("mock").checked = !!v.mock;
}

async function save() {
  const backend = document.getElementById("backend").value.trim() || DEF.backendUrl;
  const disease = document.getElementById("profile").value;
  const mock = document.getElementById("mock").checked;

  await chrome.storage.sync.set({ backendUrl: backend, disease, mock });
  alert("Saved!");
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  document.getElementById("save").addEventListener("click", save);
});
