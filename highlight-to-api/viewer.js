// =============================
// File: viewer.js
// =============================
function getParam(name){ const u=new URL(location.href); return u.searchParams.get(name)||""; }
function getJsonParam(name){
  const v=getParam(name);
  try{ return JSON.parse(decodeURIComponent(escape(atob(v)))); }catch{ return {}; }
}

const srcA = document.getElementById("src");
const paneOriginal = document.getElementById("original");
const paneAdapted = document.getElementById("adapted");
const btnToggle = document.getElementById("toggle");
const btnTTS = document.getElementById("tts");
const btnStop = document.getElementById("stop");

const src = getParam("src");
const original = getParam("text");
const adapted = getParam("adapted");
const disability = getParam("disability") || getParam("disease") || "dyslexia"; // backward compat
const local = getJsonParam("local"); // dyslexia local styling (lineHeight/letterSpacing)

if (src) { srcA.textContent = src; srcA.href = src; } else { srcA.textContent = "(unknown)"; }

paneOriginal.textContent = original;
paneAdapted.textContent = adapted || "(no adapted text returned — showing fallback or original)";

let showingAdapted = false;
btnToggle.addEventListener("click", () => {
  showingAdapted = !showingAdapted;
  paneAdapted.hidden = !showingAdapted;
  paneOriginal.hidden = showingAdapted;
  btnToggle.textContent = showingAdapted ? "Show Original" : "Show Adapted";
});

// Apply per-disability styling locally
function applyStyling(el){
  el.classList.remove("dyslexia-mode","adhd-mode","autism-mode");
  // Dyslexia visual helpers
  if (disability === "dyslexia"){
    el.classList.add("dyslexia-mode");
    if (local?.lineHeight) el.style.setProperty("--dlh", local.lineHeight);
    if (local?.letterSpacing) el.style.setProperty("--dls", local.letterSpacing + "em");
  }
  if (disability === "adhd"){ el.classList.add("adhd-mode"); }
  if (disability === "autism"){ el.classList.add("autism-mode"); }
}
applyStyling(paneOriginal);
applyStyling(paneAdapted);

// Simple Web Speech API TTS (client-side)
let utterance = null;
function speak(text){
  if (!window.speechSynthesis) { alert("TTS not supported in this browser"); return; }
  if (utterance) { window.speechSynthesis.cancel(); utterance = null; }
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = (disability === "aphasia") ? 0.9 : 1.0; // slower for aphasia
  utterance.pitch = 1.0;
  speechSynthesis.speak(utterance);
}
btnTTS.addEventListener("click", () => {
  const t = showingAdapted && adapted ? adapted : original;
  speak(t);
});
btnStop.addEventListener("click", () => speechSynthesis.cancel());
