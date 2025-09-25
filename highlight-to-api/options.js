// =============================
// File: options.js
// =============================
const DEF = { backendUrl: "http://localhost:8000/transform", disability: "dyslexia" };

async function load(){
  const v = await chrome.storage.sync.get({ backendUrl: DEF.backendUrl, disability: DEF.disability });
  document.getElementById('backend').value = v.backendUrl;
  document.getElementById('profile').value = v.disability;
}

async function save(){
  const backend = document.getElementById('backend').value.trim() || DEF.backendUrl;
  const disability = document.getElementById('profile').value;
  await chrome.storage.sync.set({ backendUrl: backend, disability });
  alert('Saved');
}

document.getElementById('save').addEventListener('click', save);
load();
