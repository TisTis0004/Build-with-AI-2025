/* ===== FLUENTIA - INTERACTIVE WEBSITE FUNCTIONALITY ===== */

// Configuration
const DEFAULT_BACKEND = "http://localhost:8000/transform";

// Profile option presets (matching the extension and backend)
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
      step: 0.01,
      def: 0.06,
      localOnly: true,
    },
  ],
  adhd: [
    { key: "chunking", label: "Chunk paragraphs", type: "checkbox", def: true },
    {
      key: "bulletSummary",
      label: "Bullet summary",
      type: "checkbox",
      def: true,
    },
  ],
  aphasia: [
    {
      key: "simplify",
      label: "Simplify vocabulary",
      type: "checkbox",
      def: true,
    },
    {
      key: "shortSentences",
      label: "Short sentences",
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

// Sample text for demo
const SAMPLE_TEXTS = {
  dyslexia:
    "The implementation of sophisticated algorithms requires comprehensive understanding of complex methodologies and intricate computational processes that demand meticulous attention to detail.",
  adhd: "When working with large datasets, it's important to understand the underlying patterns and relationships that exist within the data. This requires careful analysis and interpretation of the results.",
  aphasia:
    "The development of innovative solutions necessitates thorough research and comprehensive planning to ensure successful implementation and optimal performance outcomes.",
  autism:
    "The team collaborated effectively to deliver exceptional results that exceeded all expectations and demonstrated remarkable proficiency in their respective areas of expertise.",
};

// Global state
let extractedPages = [];
let adaptedPages = [];
let showingAdapted = true;
let speaking = false;
let utterance = null;
let currentProfile = "dyslexia";

// DOM elements
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
  toggleView: document.getElementById("toggleView"),
  originalView: document.getElementById("originalView"),
  playBtn: document.getElementById("playBtn"),
  stopBtn: document.getElementById("stopBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
};

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadSampleContent();
});

function initializeApp() {
  // Set default backend URL
  if (elements.backendUrl) {
    elements.backendUrl.value = DEFAULT_BACKEND;
  }

  // Initialize profile options
  renderProfileOptions(currentProfile);

  // Update UI state
  updateToggleButton();
  updateStopButton();

  // Smooth scrolling for navigation links
  setupSmoothScrolling();

  // Initialize animations
  setupScrollAnimations();
}

function setupEventListeners() {
  // Navigation
  if (elements.navToggle) {
    elements.navToggle.addEventListener("click", toggleMobileMenu);
  }

  // Profile selection
  if (elements.profile) {
    elements.profile.addEventListener("change", handleProfileChange);
  }

  // File upload
  if (elements.pdfFile) {
    elements.pdfFile.addEventListener("change", handleFileUpload);
  }

  // Transform button
  if (elements.adaptBtn) {
    elements.adaptBtn.addEventListener("click", handleTransform);
  }

  // View toggle
  if (elements.toggleView) {
    elements.toggleView.addEventListener("click", () => toggleView("adapted"));
  }
  if (elements.originalView) {
    elements.originalView.addEventListener("click", () =>
      toggleView("original")
    );
  }

  // Text-to-speech
  if (elements.playBtn) {
    elements.playBtn.addEventListener("click", handlePlay);
  }
  if (elements.stopBtn) {
    elements.stopBtn.addEventListener("click", handleStop);
  }

  // Download
  if (elements.downloadBtn) {
    elements.downloadBtn.addEventListener("click", handleDownload);
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-container")) {
      closeMobileMenu();
    }
  });
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        closeMobileMenu();
      }
    });
  });
}

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll(".feature-card, .profile-card, .tech-card")
    .forEach((el) => {
      observer.observe(el);
    });
}

function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu");
  const navToggle = document.querySelector(".nav-toggle");

  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
}

function closeMobileMenu() {
  const navMenu = document.querySelector(".nav-menu");
  const navToggle = document.querySelector(".nav-toggle");

  navMenu.classList.remove("active");
  navToggle.classList.remove("active");
}

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

  profilePresets.forEach((option) => {
    const row = document.createElement("div");
    row.className = "option-row";

    const input = document.createElement("input");
    input.type = option.type === "number" ? "number" : "checkbox";
    input.id = `opt_${option.key}`;

    if (option.type === "number") {
      input.step = option.step || 1;
      input.value = option.def;
    } else {
      input.checked = !!option.def;
    }

    const label = document.createElement("label");
    label.htmlFor = `opt_${option.key}`;
    label.textContent = option.label;

    row.appendChild(input);
    row.appendChild(label);
    elements.options.appendChild(row);
  });
}

function loadSampleContent() {
  if (!elements.adaptedContent) return;

  const sampleText = SAMPLE_TEXTS[currentProfile] || SAMPLE_TEXTS.dyslexia;
  elements.adaptedContent.innerHTML = `
        <p><strong>Sample adapted text for ${currentProfile.toUpperCase()}:</strong></p>
        <p>${sampleText}</p>
        <p class="placeholder">Upload a PDF or use the browser extension to see real transformations!</p>
    `;
  applyLocalStyling();
}

function handleFileUpload() {
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
  extractedPages = [];
  adaptedPages = [];
  renderTextPanes();
}

async function extractPdfText(file) {
  try {
    // Validate file type
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      throw new Error("Please select a valid PDF file.");
    }

    const arrayBuf = await file.arrayBuffer();
    const task = pdfjsLib.getDocument({ data: arrayBuf });
    const pdf = await task.promise;
    const pages = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pages.push(text);
    }

    return pages;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    if (error.message.includes("Please select")) {
      throw error;
    }
    throw new Error(
      "Failed to extract text from PDF. Please ensure the file is a valid PDF."
    );
  }
}

function collectCheckboxOptions(profile) {
  const options = {};
  const profilePresets = PRESETS[profile] || [];

  profilePresets.forEach((option) => {
    if (option.type !== "checkbox" || option.localOnly) return;

    const element = document.getElementById(`opt_${option.key}`);
    if (element) {
      options[option.key] = !!element.checked;
    }
  });

  // Special case for dyslexia fontMode
  if (profile === "dyslexia") {
    const fontToggle = document.getElementById("opt_fontMode");
    if (fontToggle) {
      options.fontMode = !!fontToggle.checked;
    }
  }

  return options;
}

function collectLocalStyling(profile) {
  const style = {};
  const profilePresets = PRESETS[profile] || [];

  profilePresets.forEach((option) => {
    const element = document.getElementById(`opt_${option.key}`);
    if (!element) return;

    if (option.type === "number") {
      const value = parseFloat(element.value);
      if (!Number.isNaN(value)) {
        style[option.key] = value;
      }
    } else if (option.type === "checkbox" && option.key === "fontMode") {
      style[option.key] = !!element.checked;
    }
  });

  return style;
}

function applyLocalStyling() {
  const style = collectLocalStyling(currentProfile);
  const adaptedPane = elements.adaptedContent;

  if (!adaptedPane) return;

  // Clear previous classes
  adaptedPane.className = "text-content";

  // Apply profile-specific styling
  if (currentProfile === "dyslexia") {
    adaptedPane.classList.add("dyslexia-mode");
    if (style.lineHeight) {
      adaptedPane.style.setProperty("--line-height", style.lineHeight);
    }
    if (style.letterSpacing) {
      adaptedPane.style.setProperty(
        "--letter-spacing",
        style.letterSpacing + "em"
      );
    }
    if (style.fontMode) {
      adaptedPane.classList.add("dyslexia-font");
    }
  } else if (currentProfile === "adhd") {
    adaptedPane.classList.add("adhd-mode");
  } else if (currentProfile === "autism") {
    adaptedPane.classList.add("autism-mode");
  }
}

async function adaptWithBackend({ text, disability, options, backendUrl }) {
  const body = {
    text,
    disability_type: disability,
    options: options || {},
  };

  try {
    const response = await fetch(backendUrl || DEFAULT_BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `HTTP ${response.status}: ${errorText || "Transform failed"}`
      );
    }

    const data = await response.json();
    return data?.text || "";
  } catch (error) {
    console.error("Backend call failed:", error);
    throw error;
  }
}

function setProgress(current, total, note = "") {
  const percentage = total ? Math.round((current / total) * 100) : 0;

  if (elements.progressBar) {
    elements.progressBar.style.width = `${percentage}%`;
  }

  if (elements.progressText) {
    elements.progressText.textContent = note
      ? `${note} (${percentage}%)`
      : `${percentage}%`;
  }
}

function setBusy(busy) {
  const elementsToDisable = [
    elements.adaptBtn,
    elements.pdfFile,
    elements.profile,
    elements.backendUrl,
    elements.toggleView,
    elements.originalView,
    elements.playBtn,
  ];

  elementsToDisable.forEach((el) => {
    if (el) {
      el.disabled = !!busy;
    }
  });

  updateStopButton();
}

async function handleTransform() {
  const file = elements.pdfFile.files?.[0];

  if (!file) {
    // Use sample text for demo
    await transformSampleText();
    return;
  }

  const backendUrl = (elements.backendUrl.value || DEFAULT_BACKEND).trim();
  const disability = currentProfile;
  const checkboxOptions = collectCheckboxOptions(disability);

  extractedPages = [];
  adaptedPages = [];
  renderTextPanes();
  setProgress(0, 100, "Starting...");
  setBusy(true);

  try {
    // Extract PDF text
    extractedPages = await extractPdfText(file);
    renderTextPanes();

    // Adapt each page
    let completed = 0;
    const total = extractedPages.length;

    for (let i = 0; i < total; i++) {
      const pageText = (extractedPages[i] || "").trim();

      if (!pageText) {
        adaptedPages.push("");
        completed++;
        setProgress(completed, total, `Skipping empty page ${i + 1}/${total}`);
        continue;
      }

      // Clip long text to avoid token limits
      const clippedText =
        pageText.length <= 20000 ? pageText : pageText.slice(0, 20000);

      setProgress(completed, total, `Adapting page ${i + 1}/${total}...`);

      try {
        const adapted = await adaptWithBackend({
          text: clippedText,
          disability,
          options: checkboxOptions,
          backendUrl,
        });
        adaptedPages.push(adapted || "");
      } catch (error) {
        console.warn(`Transform failed on page ${i + 1}:`, error);
        // Fallback to first few sentences
        const fallback = clippedText
          .split(/(?<=[.!?])\s+/)
          .slice(0, 5)
          .join(" ");
        adaptedPages.push(fallback);
      }

      completed++;
      setProgress(completed, total, `Adapted page ${i + 1}/${total}`);
      renderTextPanes();
    }

    showingAdapted = true;
    updateToggleButton();
    setProgress(100, 100, "Complete!");

    // Show success message
    showNotification("Content transformed successfully!", "success");
  } catch (error) {
    console.error("Transform failed:", error);
    showNotification(
      error.message || "Something went wrong while processing the PDF.",
      "error"
    );
  } finally {
    setBusy(false);
  }
}

async function transformSampleText() {
  const backendUrl = (elements.backendUrl.value || DEFAULT_BACKEND).trim();
  const disability = currentProfile;
  const checkboxOptions = collectCheckboxOptions(disability);
  const sampleText = SAMPLE_TEXTS[currentProfile] || SAMPLE_TEXTS.dyslexia;

  setProgress(0, 100, "Transforming sample text...");
  setBusy(true);

  try {
    const adapted = await adaptWithBackend({
      text: sampleText,
      disability,
      options: checkboxOptions,
      backendUrl,
    });

    elements.adaptedContent.innerHTML = `
            <p><strong>Original:</strong></p>
            <p style="background: var(--gray-100); padding: var(--space-md); border-radius: var(--radius-lg); margin-bottom: var(--space-lg);">${sampleText}</p>
            <p><strong>Adapted for ${disability.toUpperCase()}:</strong></p>
            <p>${adapted}</p>
        `;

    applyLocalStyling();
    showingAdapted = true;
    updateToggleButton();
    setProgress(100, 100, "Complete!");

    showNotification("Sample text transformed successfully!", "success");
  } catch (error) {
    console.error("Sample transform failed:", error);
    showNotification(
      "Failed to connect to backend. Please ensure your server is running.",
      "error"
    );

    // Show fallback content
    elements.adaptedContent.innerHTML = `
            <p><strong>Backend not available</strong></p>
            <p>Please ensure your FastAPI backend is running on ${backendUrl}</p>
            <p><strong>Sample adapted text for ${disability.toUpperCase()}:</strong></p>
            <p>${sampleText}</p>
        `;
  } finally {
    setBusy(false);
  }
}

function renderTextPanes() {
  renderOriginalPane();
  renderAdaptedPane();
}

function renderOriginalPane() {
  if (!elements.originalContent) return;

  const text = extractedPages.length
    ? extractedPages.join("\n\n--- Page Break ---\n\n")
    : "";

  elements.originalContent.innerHTML =
    text || '<p class="placeholder">No original text available</p>';
}

function renderAdaptedPane() {
  if (!elements.adaptedContent) return;

  const text = adaptedPages.length
    ? adaptedPages.join("\n\n--- Page Break ---\n\n")
    : "";

  if (!text && !elements.adaptedContent.innerHTML.includes("Sample")) {
    elements.adaptedContent.innerHTML =
      '<p class="placeholder">No adapted text available yet</p>';
  }

  applyLocalStyling();

  // Enable download if we have content
  if (elements.downloadBtn) {
    elements.downloadBtn.disabled = !text;
  }
}

function toggleView(view) {
  showingAdapted = view === "adapted";

  if (elements.adaptedText) {
    elements.adaptedText.style.display = showingAdapted ? "block" : "none";
  }
  if (elements.originalText) {
    elements.originalText.style.display = showingAdapted ? "none" : "block";
  }

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

function handlePlay() {
  const text = showingAdapted
    ? adaptedPages.join("\n\n") || ""
    : extractedPages.join("\n\n") || "";

  if (!text) {
    showNotification("No text available to play", "warning");
    return;
  }

  speak(text);
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

  utterance.onstart = () => {
    speaking = true;
    updateStopButton();
    if (elements.playBtn) elements.playBtn.disabled = true;
  };

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

function handleStop() {
  if (!speaking) return;

  window.speechSynthesis.cancel();
  speaking = false;
  updateStopButton();
  if (elements.playBtn) elements.playBtn.disabled = false;
}

function updateStopButton() {
  if (elements.stopBtn) {
    elements.stopBtn.disabled = !speaking;
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

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

  // Add styles if not already added
  if (!document.getElementById("notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
    styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                padding: var(--space-md) var(--space-lg);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
                border-left: 4px solid;
            }
            
            .notification-success { border-left-color: var(--accent); }
            .notification-error { border-left-color: var(--danger); }
            .notification-warning { border-left-color: var(--secondary); }
            .notification-info { border-left-color: var(--primary); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
            }
            
            .notification-content i {
                color: var(--primary);
            }
            
            .notification-error .notification-content i { color: var(--danger); }
            .notification-success .notification-content i { color: var(--accent); }
            .notification-warning .notification-content i { color: var(--secondary); }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideInRight 0.3s ease-out reverse";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };
  return icons[type] || "info-circle";
}

// Scroll to functions for navigation
function scrollToDemo() {
  const demoSection = document.getElementById("demo");
  if (demoSection) {
    demoSection.scrollIntoView({ behavior: "smooth" });
  }
}

function scrollToExtension() {
  const extensionSection = document.getElementById("extension");
  if (extensionSection) {
    extensionSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Add CSS for mobile navigation
const mobileNavStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid var(--gray-200);
            box-shadow: var(--shadow-lg);
            flex-direction: column;
            padding: var(--space-lg);
            gap: var(--space-md);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

// Inject mobile navigation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = mobileNavStyles;
document.head.appendChild(styleSheet);

// Add CSS for animations
const animationStyles = `
    .feature-card, .profile-card, .tech-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .feature-card.animate-in, .profile-card.animate-in, .tech-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .feature-card:nth-child(1).animate-in { transition-delay: 0.1s; }
    .feature-card:nth-child(2).animate-in { transition-delay: 0.2s; }
    .feature-card:nth-child(3).animate-in { transition-delay: 0.3s; }
    
    .profile-card:nth-child(1).animate-in { transition-delay: 0.1s; }
    .profile-card:nth-child(2).animate-in { transition-delay: 0.2s; }
    .profile-card:nth-child(3).animate-in { transition-delay: 0.3s; }
    .profile-card:nth-child(4).animate-in { transition-delay: 0.4s; }
`;

const animationSheet = document.createElement("style");
animationSheet.textContent = animationStyles;
document.head.appendChild(animationSheet);
