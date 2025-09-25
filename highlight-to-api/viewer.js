// =============================
// File: viewer.js
// =============================

function getParam(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name) || "";
}
function getJsonParam(name) {
  const v = getParam(name);
  try {
    return JSON.parse(decodeURIComponent(escape(atob(v))));
  } catch {
    return {};
  }
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
const local = getJsonParam("local"); // e.g., { fontMode, lineHeight, letterSpacing }
if (src) {
  srcA.textContent = src;
  srcA.href = src;
} else {
  srcA.textContent = "(unknown)";
}

paneOriginal.textContent = original;

// ---- CHANGE START ----
if (disability === "adhd") {
  // for ADHD: preserve line breaks
  paneAdapted.innerHTML = `<pre class="adhd-pre">${adapted || "(no adapted text returned — showing fallback or original)"}</pre>`;
} else {
  // for all other profiles: plain text
  paneAdapted.textContent =
    adapted || "(no adapted text returned — showing fallback or original)";
}
// ---- CHANGE END ----

// Show ADAPTED by default
let showingAdapted = true;
paneAdapted.hidden = !showingAdapted;
paneOriginal.hidden = showingAdapted;
btnToggle.textContent = showingAdapted ? "Show Original" : "Show Adapted";

// Apply styling ONLY to the ADAPTED pane
function applyStylingToAdapted() {
  // Clear previous classes and inline vars
  for (const el of [paneOriginal, paneAdapted]) {
    el.classList.remove(
      "dyslexia-mode",
      "dyslexia-font",
      "adhd-mode",
      "autism-mode"
    );
    el.style.removeProperty("--dlh");
    el.style.removeProperty("--dls");
  }

  if (disability === "dyslexia") {
    // Apply spacing/flow always
    paneAdapted.classList.add("dyslexia-mode");
    if (local?.lineHeight)
      paneAdapted.style.setProperty("--dlh", local.lineHeight);
    if (local?.letterSpacing)
      paneAdapted.style.setProperty("--dls", local.letterSpacing + "em");

    // Apply font only when checkbox was ON in popup
    if (local?.fontMode) paneAdapted.classList.add("dyslexia-font");
  } else if (disability === "adhd") {
    paneAdapted.classList.add("adhd-mode");
  } else if (disability === "autism") {
    paneAdapted.classList.add("autism-mode");
  }
}
applyStylingToAdapted();

// … rest of your file unchanged …


btnToggle.addEventListener("click", () => {
  showingAdapted = !showingAdapted;
  paneAdapted.hidden = !showingAdapted;
  paneOriginal.hidden = showingAdapted;
  btnToggle.textContent = showingAdapted ? "Show Original" : "Show Adapted";
});

// ------- Simple Web Speech API TTS (client-side) -------
let utterance = null;
let isSpeaking = false;

function updateStopButton() {
  // Stop button is only clickable when audio is playing
  btnStop.disabled = !isSpeaking;
}

function speak(text) {
  if (!window.speechSynthesis) {
    alert("TTS not supported in this browser");
    return;
  }
  if (utterance) {
    window.speechSynthesis.cancel();
    utterance = null;
  }

  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = disability === "aphasia" ? 0.9 : 1.0; // slower for aphasia
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    isSpeaking = true;
    updateStopButton();
  };
  utterance.onend = () => {
    isSpeaking = false;
    updateStopButton();
  };
  utterance.onerror = () => {
    isSpeaking = false;
    updateStopButton();
  };

  window.speechSynthesis.speak(utterance);
}

btnTTS.addEventListener("click", () => {
  const t = showingAdapted && adapted ? adapted : original;
  if (!t) return;
  speak(t);
});

btnStop.addEventListener("click", () => {
  if (!isSpeaking) return;
  window.speechSynthesis.cancel();
  isSpeaking = false;
  updateStopButton();
});

// Initialize Stop button state
updateStopButton();