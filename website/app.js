/* ===== FLUENTIA - APP.JS (stream original on read; transform on click) ===== */

/* ----------------------- Configuration & Presets ------------------------ */

const DEFAULT_BACKEND = "http://localhost:8000/transform";

// === ElevenLabs (frontend only; insecure for public use) ===
const ELEVEN_API_KEY = "sk_fd8293850eac9f79ad8d1ad33d9d9a34b989b6e8297190f8";
const ELEVEN_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // e.g., "Rachel" – change to your favorite voice
const ELEVEN_TTS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`;

/** Minimal presets to keep your options UI working (extend if you like) */
const PRESETS = {
  dyslexia: [
    {
      key: "fontMode",
      label: "Use dyslexia-friendly font",
      type: "checkbox",
      def: true,
      localOnly: true,
    },
    {
      key: "lineHeight",
      label: "Line height",
      type: "number",
      step: 0.1,
      def: 1.8,
      localOnly: true,
    },
    {
      key: "letterSpacing",
      label: "Letter spacing (em)",
      type: "number",
      step: 0.05,
      def: 0.05,
      localOnly: true,
    },
    {
      key: "shorterParagraphs",
      label: "Shorter paragraphs",
      type: "checkbox",
      def: true,
    },
    {
      key: "highlightKeywords",
      label: "Highlight keywords",
      type: "checkbox",
      def: false,
    },
  ],
  adhd: [
    {
      key: "bulletPoints",
      label: "Use bullet points",
      type: "checkbox",
      def: true,
    },
    {
      key: "shorterParagraphs",
      label: "Shorter paragraphs",
      type: "checkbox",
      def: true,
    },
    {
      key: "highlightKeywords",
      label: "Highlight keywords",
      type: "checkbox",
      def: true,
    },
  ],
  aphasia: [
    {
      key: "shortSentences",
      label: "Short sentences",
      type: "checkbox",
      def: true,
    },
    {
      key: "simplerVocab",
      label: "Simpler vocabulary",
      type: "checkbox",
      def: true,
    },
  ],
  autism: [
    {
      key: "idiomSimplification",
      label: "Idiom simplification",
      type: "checkbox",
      def: true,
    },
    {
      key: "useEmojis",
      label: "Use emojis for context",
      type: "checkbox",
      def: true,
    },
  ],
};

const SAMPLE_TEXTS = {
  dyslexia: "This is a short sample to demonstrate adapted text.",
  adhd: "Here is a concise sample paragraph for ADHD mode.",
  aphasia: "A brief and clear sample sentence for Aphasia adaptation.",
  autism: "A neutral sample with straightforward phrasing for Autism mode.",
};

/* ----------------------------- State ----------------------------------- */

let currentProfile = "dyslexia";
let showingAdapted = false;

let extractedPages = []; // original text, per page
let adaptedPages = []; // adapted text, per page
let readingInProgress = false;

let speaking = false;
let utterance = null;
let ttsAudio = null; // HTMLAudioElement for ElevenLabs playback

/* ----------------------------- DOM ------------------------------------- */

const elements = {
  // Navigation
  navToggle: document.querySelector(".nav-toggle"),
  navMenu: document.querySelector(".nav-menu"),

  // Demo elements
  pdfFile: document.getElementById("pdfFile"),
  fileInfo: document.getElementById("fileInfo"),
  backendUrl: document.getElementById("backendUrl"),
  profile: document.getElementById("profile"),
  options: document.getElementById("options"),
  adaptBtn: document.getElementById("adaptBtn"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),

  // Text viewers
  originalText: document.getElementById("originalText"),
  adaptedText: document.getElementById("adaptedText"),
  originalContent: document.getElementById("originalContent"),
  adaptedContent: document.getElementById("adaptedContent"),

  // Controls
  toggleView: document.getElementById("toggleView"), // data-view="adapted"
  originalView: document.getElementById("originalView"), // data-view="original"
  playBtn: document.getElementById("playBtn"),
  stopBtn: document.getElementById("stopBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
};

/* -------------------------- Initialization ----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupEventListeners();
});


window.scrollToDemo = function () {
  const el = document.querySelector("#demo");
  if (el) {
    // close mobile menu if open
    if (document.querySelector(".nav-menu")?.classList.contains("open")) {
      document.querySelector(".nav-menu").classList.remove("open");
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

window.scrollToExtension = function () {
  const el = document.querySelector("#extension");
  if (el) {
    if (document.querySelector(".nav-menu")?.classList.contains("open")) {
      document.querySelector(".nav-menu").classList.remove("open");
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};





function initializeApp() {
  // Default backend
  if (elements.backendUrl) {
    elements.backendUrl.value = DEFAULT_BACKEND;
  }

  // Configure PDF.js worker (version must match index.html CDN)
  //   if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  //     pdfjsLib.GlobalWorkerOptions.workerSrc =
  //       "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.js";
  //   }

  // Options UI
  renderProfileOptions(currentProfile);
  applyLocalStyling();

  // Start on "Adapted View" (as your HTML marks active), but we’ll flip to Original while reading
  updateToggleButton();

  // Put a friendly sample in Adapted pane
  loadSampleContent();

  // Smooth scroll / animations (optional)
  setupScrollAnimations();
}

/* ------------------------ Event Listeners ------------------------------- */

function setupEventListeners() {
  // Mobile nav
  if (elements.navToggle) {
    elements.navToggle.addEventListener("click", toggleMobileMenu);
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-container")) closeMobileMenu();
  });

  // Profile
  if (elements.profile) {
    elements.profile.addEventListener("change", handleProfileChange);
  }

  // File upload -> read locally + stream Original
  if (elements.pdfFile) {
    elements.pdfFile.addEventListener("change", handleFileUpload);
  }

  // Transform button -> call backend using extracted text
  if (elements.adaptBtn) {
    elements.adaptBtn.addEventListener("click", handleTransform);
  }

  // View toggles
  if (elements.toggleView) {
    elements.toggleView.addEventListener("click", () => toggleView("adapted"));
  }
  if (elements.originalView) {
    elements.originalView.addEventListener("click", () =>
      toggleView("original")
    );
  }

  // TTS
  if (elements.playBtn) elements.playBtn.addEventListener("click", handlePlay);
  if (elements.stopBtn) elements.stopBtn.addEventListener("click", handleStop);

  // Download adapted
  if (elements.downloadBtn)
    elements.downloadBtn.addEventListener("click", handleDownload);
}

/* -------------------- File Read (stream Original) ----------------------- */

async function handleFileUpload() {
  const file = elements.pdfFile.files?.[0];
  if (!file) {
    elements.fileInfo.textContent = "No file selected";
    extractedPages = [];
    adaptedPages = [];
    renderTextPanes();
    return;
  }

  elements.fileInfo.textContent = `Selected: ${file.name} (${Math.round(
    file.size / 1024
  )} KB)`;

  // Reset UI
  extractedPages = [];
  adaptedPages = [];
  renderTextPanes();

  // Show Original pane, hide Adapted while reading
  if (elements.originalText) elements.originalText.style.display = "block";
  if (elements.adaptedText) elements.adaptedText.style.display = "none";
  showingAdapted = false;
  updateToggleButton();

  // Read client-side, stream per page
  try {
    await readPdfClientSide(file);
    showNotification(
      "PDF reading complete. You can now Transform Content.",
      "success"
    );
  } catch (e) {
    console.error(e);
    showNotification(e.message || "Failed to read PDF", "error");
  }
}

/** Reads the PDF locally and appends each page’s text to Original pane while updating progress. */
async function readPdfClientSide(file) {
  if (!window.pdfjsLib) throw new Error("PDF.js not loaded.");
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Please select a valid PDF file.");
  }

  readingInProgress = true;
  setBusy(true);

  // Prepare Original content container
  if (elements.originalContent) {
    elements.originalContent.innerHTML = "";
  }

  setProgress(0, 1, "Loading PDF…");
  const arrayBuf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
  const total = pdf.numPages;

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = (content.items || [])
      .map((it) => it.str)
      .join(" ")
      .replace(/\s+\n?/g, " ")
      .trim();

    extractedPages.push(text);

    // Append this page immediately
    if (elements.originalContent) {
      const block = document.createElement("div");
      block.className = "page-block";
      block.innerHTML = `<h4>Page ${i}</h4><p>${escapeHtml(
        text || "(no text on this page)"
      )}</p>`;
      elements.originalContent.appendChild(block);
    }

    setProgress(i, total, `Reading page ${i}/${total}…`);
  }

  setProgress(total, total, "PDF reading complete.");
  readingInProgress = false;
  setBusy(false);
}

/* ---------------------- Transform (backend call) ------------------------ */

async function handleTransform() {
  // If no file: demo with sample
  const file = elements.pdfFile.files?.[0];
  if (!file && !extractedPages.length) {
    await transformSampleText(); // uses SAMPLE_TEXTS
    return;
  }

  if (readingInProgress) {
    showNotification("Please wait until the PDF finishes reading.", "warning");
    return;
  }

  if (!extractedPages.length) {
    showNotification(
      "No PDF text available. Please upload a PDF first.",
      "warning"
    );
    return;
  }

  const backendUrl = (elements.backendUrl?.value || DEFAULT_BACKEND).trim();
  const disability = currentProfile;
  const options = collectCheckboxOptions(disability);
  const fullText = extractedPages.join("\n\n--- PAGE BREAK ---\n\n");

  setBusy(true);
  setProgress(0, 100, "Sending to backend…");

  try {
    const adapted = await adaptWithBackend({
      text: fullText,
      disability,
      options,
      backendUrl,
    });

    // Support either a string or an array of pages
    adaptedPages = Array.isArray(adapted) ? adapted : [String(adapted || "")];

    renderAdaptedPane();

    // Stay on Original until user switches
    showingAdapted = false;
    updateToggleButton();

    setProgress(
      100,
      100,
      "Adaptation complete. You can switch to Adapted View."
    );
    showNotification("Content transformed successfully!", "success");
  } catch (err) {
    console.error("Transform failed:", err);
    showNotification(
      err.message || "Something went wrong while processing the PDF.",
      "error"
    );
  } finally {
    setBusy(false);
  }
}

/** Makes the backend call. Expect either {text: "..."} or "...". Return string or string[] */
async function adaptWithBackend({ text, disability, options, backendUrl }) {
  const body = { text, disability_type: disability, options: options || {} };

  const resp = await fetch(backendUrl || DEFAULT_BACKEND, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status}: ${t || "Transform failed"}`);
  }

  // Accept either { text } payload or plain string/array
  const data = await resp.json();
  if (Array.isArray(data)) return data;
  if (typeof data === "string") return data;
  return data?.text ?? "";
}

/* --------------------------- Rendering ---------------------------------- */

function renderTextPanes() {
  renderOriginalPane();
  renderAdaptedPane();
}

function renderOriginalPane() {
  if (!elements.originalContent) return;
  const text = extractedPages.length
    ? extractedPages.join("\n\n--- Page Break ---\n\n")
    : "";
  elements.originalContent.innerHTML = text
    ? `<pre class="pre-wrap">${escapeHtml(text)}</pre>`
    : '<p class="placeholder">Upload a PDF file to see the original text here...</p>';
}

function renderAdaptedPane() {
  if (!elements.adaptedContent) return;
  const text = adaptedPages.length
    ? adaptedPages.join("\n\n--- Page Break ---\n\n")
    : "";

  if (!text) {
    // keep a placeholder unless sample already loaded
    if (!elements.adaptedContent.innerHTML.includes("Sample")) {
      elements.adaptedContent.innerHTML =
        '<p class="placeholder">No adapted text yet</p>';
    }
    if (elements.downloadBtn) elements.downloadBtn.disabled = true;
    return;
  }

  elements.adaptedContent.innerHTML = `<pre class="pre-wrap">${escapeHtml(
    text
  )}</pre>`;
  applyLocalStyling();
  if (elements.downloadBtn) elements.downloadBtn.disabled = false;
}

function toggleView(view) {
  showingAdapted = view === "adapted";

  if (elements.adaptedText)
    elements.adaptedText.style.display = showingAdapted ? "block" : "none";
  if (elements.originalText)
    elements.originalText.style.display = showingAdapted ? "none" : "block";

  updateToggleButton();
}

function updateToggleButton() {
  const buttons = [elements.toggleView, elements.originalView];
  buttons.forEach((btn) => {
    if (!btn) return;
    const isActive =
      (btn.dataset.view === "adapted" && showingAdapted) ||
      (btn.dataset.view === "original" && !showingAdapted);
    btn.classList.toggle("active", isActive);
  });
}

/* ------------------------- Profile Options ------------------------------ */

function handleProfileChange() {
  currentProfile = elements.profile.value;
  renderProfileOptions(currentProfile);
  applyLocalStyling();
  loadSampleContent();
}

function renderProfileOptions(profile) {
  if (!elements.options) return;
  elements.options.innerHTML = "";

  const profilePresets = PRESETS[profile] || [];
  profilePresets.forEach((opt) => {
    const row = document.createElement("div");
    row.className = "option-row";

    const input = document.createElement("input");
    input.type = opt.type === "number" ? "number" : "checkbox";
    input.id = `opt_${opt.key}`;
    if (opt.type === "number" && opt.step) input.step = opt.step;
    if (opt.type === "number" && typeof opt.def === "number")
      input.value = opt.def;
    if (opt.type === "checkbox") input.checked = !!opt.def;

    const label = document.createElement("label");
    label.setAttribute("for", input.id);
    label.textContent = opt.label;

    row.appendChild(input);
    row.appendChild(label);
    elements.options.appendChild(row);
  });
}

function collectCheckboxOptions(profile) {
  const options = {};
  const profilePresets = PRESETS[profile] || [];

  profilePresets.forEach((opt) => {
    if (opt.type !== "checkbox" || opt.localOnly) return;
    const el = document.getElementById(`opt_${opt.key}`);
    if (el) options[opt.key] = !!el.checked;
  });

  // special handling for dyslexia font toggle (used locally)
  if (profile === "dyslexia") {
    const fontToggle = document.getElementById("opt_fontMode");
    if (fontToggle) options.fontMode = !!fontToggle.checked;
  }
  return options;
}

function collectLocalStyling(profile) {
  const style = {};
  const profilePresets = PRESETS[profile] || [];

  profilePresets.forEach((opt) => {
    const el = document.getElementById(`opt_${opt.key}`);
    if (!el) return;
    if (opt.type === "number") {
      const v = parseFloat(el.value);
      if (!Number.isNaN(v)) style[opt.key] = v;
    } else if (opt.type === "checkbox" && opt.key === "fontMode") {
      style[opt.key] = !!el.checked;
    }
  });

  return style;
}

function applyLocalStyling() {
  const style = collectLocalStyling(currentProfile);
  const pane = elements.adaptedContent;
  if (!pane) return;

  // Reset to base class
  pane.className = "text-content";
  const orig = elements.originalContent;

// Remove any previous font flag first
if (orig) orig.classList.remove("ar-en-font");
pane.classList.remove("ar-en-font");

// For all profiles EXCEPT dyslexia, use an Arabic+Latin friendly font
if (currentProfile !== "dyslexia") {
  if (orig) orig.classList.add("ar-en-font");
  pane.classList.add("ar-en-font");
}

  if (currentProfile === "dyslexia") {
    pane.classList.add("dyslexia-mode");
    if (style.lineHeight)
      pane.style.setProperty("--line-height", style.lineHeight);
    if (style.letterSpacing)
      pane.style.setProperty("--letter-spacing", style.letterSpacing + "em");
    if (style.fontMode) pane.classList.add("dyslexia-font");
  } else if (currentProfile === "adhd") {
    pane.classList.add("adhd-mode");
  } else if (currentProfile === "autism") {
    pane.classList.add("autism-mode");
  }
}

function loadSampleContent() {
  if (!elements.adaptedContent) return;
  const sampleText = SAMPLE_TEXTS[currentProfile] || SAMPLE_TEXTS.dyslexia;
  elements.adaptedContent.innerHTML = `
    <p><strong>Sample adapted text for ${currentProfile.toUpperCase()}:</strong></p>
    <p>${escapeHtml(sampleText)}</p>
    <p class="placeholder">Upload a PDF and click “Transform Content” to see real results.</p>
  `;
  applyLocalStyling();
}

/* ---------------------------- TTS & Download ---------------------------- */

function handlePlay() {
  const text = showingAdapted
    ? adaptedPages.join("\n\n") || ""
    : extractedPages.join("\n\n") || "";

  if (!text) {
    showNotification("No text available to play", "warning");
    return;
  }
  speakEleven(text);
}

function handleStop() {
  if (!speaking && !ttsAudio) return;

  // Stop ElevenLabs audio if playing
  if (ttsAudio) {
    try {
      ttsAudio.pause();
      ttsAudio.src = "";
    } catch {}
    ttsAudio = null;
  }

  // Also cancel browser TTS (fallback path)
  if (window.speechSynthesis && speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  speaking = false;
  updateStopButton();
  if (elements.playBtn) elements.playBtn.disabled = false;
}

function updateStopButton() {
  if (elements.stopBtn) elements.stopBtn.disabled = !speaking;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showNotification("Text-to-speech not supported in this browser", "error");
    return;
  }

  if (utterance) {
    window.speechSynthesis.cancel();
    utterance = null;
  }

  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = currentProfile === "aphasia" ? 0.9 : 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  speaking = true;
  updateStopButton();
  if (elements.playBtn) elements.playBtn.disabled = true;

  utterance.onend = () => {
    speaking = false;
    updateStopButton();
    if (elements.playBtn) elements.playBtn.disabled = false;
  };
  utterance.onerror = () => {
    speaking = false;
    updateStopButton();
    if (elements.playBtn) elements.playBtn.disabled = false;
    showNotification("Text-to-speech failed", "error");
  };

  window.speechSynthesis.speak(utterance);
}

async function speakEleven(text) {
  if (!text) {
    showNotification("No text available to play", "warning");
    return;
  }
  if (!ELEVEN_API_KEY) {
    showNotification("Missing ELEVEN_API_KEY in app.js", "error");
    return;
  }

  speaking = true;
  updateStopButton();
  if (elements.playBtn) elements.playBtn.disabled = true;

  try {
    const resp = await fetch(ELEVEN_TTS_URL, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
      }),
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      throw new Error(`TTS HTTP ${resp.status}: ${msg}`);
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);

    ttsAudio = new Audio(url);
    ttsAudio.onended = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      ttsAudio = null;
      speaking = false;
      updateStopButton();
      if (elements.playBtn) elements.playBtn.disabled = false;
    };
    ttsAudio.onerror = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      ttsAudio = null;
      speaking = false;
      updateStopButton();
      if (elements.playBtn) elements.playBtn.disabled = false;
      showNotification("Audio playback failed", "error");
    };

    await ttsAudio.play();
  } catch (err) {
    console.error("ElevenLabs TTS failed:", err);
    showNotification("TTS fell back to browser voice", "warning");
    speaking = false;
    if (elements.playBtn) elements.playBtn.disabled = false;
    // Fallback to your existing browser TTS
    speak(text);
  }
}

function handleDownload() {
  const text = adaptedPages.join("\n\n--- Page Break ---\n\n");
  if (!text) return;

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fluentia_adapted_${currentProfile}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("File downloaded successfully!", "success");
}

/* --------------------------- Utilities ---------------------------------- */

function setProgress(current, total, note = "") {
  const pct = total ? Math.round((current / total) * 100) : 0;
  if (elements.progressBar) elements.progressBar.style.width = `${pct}%`;
  if (elements.progressText) {
    elements.progressText.textContent = note ? `${note} (${pct}%)` : `${pct}%`;
  }
}

function setBusy(busy) {
  const toDisable = [
    elements.adaptBtn,
    elements.pdfFile,
    elements.profile,
    elements.backendUrl,
    elements.toggleView,
    elements.originalView,
    elements.playBtn,
  ];
  toDisable.forEach((el) => el && (el.disabled = !!busy));
  updateStopButton();
}

function escapeHtml(s = "") {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

/* ------------------------ Notifications & UX ---------------------------- */

function showNotification(message, type = "info") {
  const el = document.createElement("div");
  el.className = `notification notification-${type}`;
  el.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
  document.body.appendChild(el);
  // auto hide
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 300);
  }, 4000);
}

function getNotificationIcon(type) {
  const map = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };
  return map[type] || "info-circle";
}

/* ---------------------- Nav & Animations (optional) --------------------- */

function toggleMobileMenu() {
  if (!elements.navMenu) return;
  elements.navMenu.classList.toggle("open");
}

function closeMobileMenu() {
  if (!elements.navMenu) return;
  elements.navMenu.classList.remove("open");
}

function setupScrollAnimations() {
  const opts = { threshold: 0.08 };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(
      (e) => e.isIntersecting && e.target.classList.add("animate-in")
    );
  }, opts);
  document
    .querySelectorAll(".feature-card, .profile-card, .tech-card")
    .forEach((el) => obs.observe(el));
}
