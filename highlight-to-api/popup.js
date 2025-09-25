// =============================
// File: popup.js
// =============================

// Define UI presets. We will only SEND checkbox values in the "options" object.
const PRESETS = {
  dyslexia: [
    { key: "fontMode", label: "Dyslexia-friendly font/style", type: "checkbox", def: true },
    { key: "lineHeight", label: "Line height", type: "number", step: 0.1, def: 1.8, localOnly: true },
    { key: "letterSpacing", label: "Letter spacing (em)", type: "number", step: 0.01, def: 0.06, localOnly: true }
  ],
  adhd: [
    { key: "chunking", label: "Chunk paragraphs", type: "checkbox", def: true },
    { key: "bulletSummary", label: "Bullet summary", type: "checkbox", def: true }
  ],
  aphasia: [
    { key: "simplify", label: "Simplify vocabulary", type: "checkbox", def: true },
    { key: "shortSentences", label: "Short sentences", type: "checkbox", def: true }
  ],
  autism: [
    { key: "idiomSimplification", label: "Idiom simplification to literal meaning", type: "checkbox", def: true },
    { key: "useEmojis", label: "Using emojis to clarify context", type: "checkbox", def: true }
  ]
};

const disabilitySel = document.getElementById("disability");
const optsDiv = document.getElementById("opts");

const btnRewrite = document.getElementById("rewrite");
const spinner = document.getElementById("spinner");

function renderOptions(kind) {
  optsDiv.innerHTML = "";
  for (const opt of PRESETS[kind]) {
    const id = `opt_${opt.key}`;
    const row = document.createElement("div");
    row.className = "row";
    const label = document.createElement("label");
    label.textContent = opt.label; label.htmlFor = id;
    const input = document.createElement("input");
    input.id = id; input.type = opt.type;
    if (opt.type === "checkbox") input.checked = opt.def;
    if (opt.type === "number") { input.step = opt.step || 1; input.value = opt.def; }
    row.appendChild(label); row.appendChild(input); optsDiv.appendChild(row);
  }
}

async function getSelectionOrMain() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "neuroread:getSelectionOrMain" }, resolve);
  });
}

// Collect ONLY checkbox options as { key: boolean }
function collectCheckboxOptions(kind) {
  const out = {};
  for (const opt of PRESETS[kind]) {
    if (opt.type !== "checkbox") continue;
    const el = document.getElementById(`opt_${opt.key}`);
    out[opt.key] = !!el?.checked;
  }
  return out;
}

// Local-only numeric styling to pass to viewer (not to backend)
function collectLocalStyling(kind) {
  const style = {};
  for (const opt of PRESETS[kind]) {
    if (opt.type === "number") {
      const el = document.getElementById(`opt_${opt.key}`);
      const val = parseFloat(el.value);
      if (!Number.isNaN(val)) style[opt.key] = val;
    }
  }
  return style;
}

function openViewer({ src, original, adapted, disability, localStyle }) {
  const url = new URL(chrome.runtime.getURL("viewer.html"));
  url.searchParams.set("src", src || "");
  url.searchParams.set("text", original || "");
  url.searchParams.set("disability", disability);

  if (localStyle && Object.keys(localStyle).length) {
    url.searchParams.set("local", btoa(unescape(encodeURIComponent(JSON.stringify(localStyle)))));
  }
  if (adapted) url.searchParams.set("adapted", adapted);
  chrome.tabs.create({ url: url.toString() });
}

// Trim very long texts before sending to backend
function trimForBackend(text, maxChars = 20000){
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastPunct = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
  return slice.slice(0, lastPunct > 0 ? lastPunct + 1 : maxChars);
}

function setBusy(b){
  for (const el of [btnRewrite, disabilitySel]) el.disabled = !!b;
  spinner.classList.toggle("show", !!b);
}

async function runRewrite() {
  const kind = disabilitySel.value;
  const { ok, text, sourceUrl } = await getSelectionOrMain();
  if (!ok || !text) { alert("No text found. Select text or try a readable page."); return; }

  const checkboxOptions = collectCheckboxOptions(kind);
  const localStyle = collectLocalStyling(kind);
  const payloadText = trimForBackend(text);

  setBusy(true);
  chrome.runtime.sendMessage(
    { type: "neuroread:transform", text: payloadText, disabilityType: kind, options: checkboxOptions },
    (res) => {
      setBusy(false);
      const adaptedText = res?.ok && res.data?.text ? res.data.text : (res?.fallback || "");
      openViewer({ src: sourceUrl, original: text, adapted: adaptedText, disability: kind, localStyle });
    }
  );
}

// init
renderOptions(disabilitySel.value);
disabilitySel.addEventListener("change", () => renderOptions(disabilitySel.value));
btnRewrite.addEventListener("click", runRewrite);
