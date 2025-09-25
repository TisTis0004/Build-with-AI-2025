// =============================
// File: background.js (service worker)
// =============================
const DEFAULTS = {
  backendUrl: "http://localhost:8000/transform",
  disability: "dyslexia",
  // Only include checkbox defaults here (booleans). Numeric sliders are NOT sent in options.
  options: {
    dyslexia: { fontMode: true },
    adhd: { chunking: true, bulletSummary: true },
    aphasia: { simplify: true, shortSentences: true },
    autism: { idiomSimplification: true, useEmojis: true }
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "neuroread_select",
    title: "NeuroRead: adapt selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "neuroread_select") return;
  const text = (info.selectionText || "").trim();
  if (!text) return;
  openViewerWithPayload({ sourceUrl: info.pageUrl || tab?.url || "", original: text });
});

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== "open-selection") return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;
  const [{ result: sel } = {}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => (window.getSelection()?.toString() || "").trim()
  });
  if (!sel) return;
  openViewerWithPayload({ sourceUrl: tab.url || "", original: sel });
});

function openViewerWithPayload(payload) {
  const url = chrome.runtime.getURL("viewer.html") +
    "?src=" + encodeURIComponent(payload.sourceUrl || "") +
    "&text=" + encodeURIComponent(payload.original || "");
  chrome.tabs.create({ url });
}

// === Backend call ===
// Must send ONLY: { text, disability_type, options }
async function requestTransform({ text, disabilityType, options }) {
  const { backendUrl } = await chrome.storage.sync.get({ backendUrl: DEFAULTS.backendUrl });
  const body = { text, disability_type: disabilityType, options };
  const res = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

// Handle popup actions
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "neuroread:getSelectionOrMain") {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) return sendResponse({ ok: false, error: "no-tab" });
      const [r1] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => (window.getSelection()?.toString() || "").trim()
      });
      let text = r1?.result || "";
      if (!text) {
        const [r2] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.__neuroread_extractMain?.() || ""
        });
        text = r2?.result || "";
      }
      sendResponse({ ok: true, text, sourceUrl: tab.url || "" });
    }

    if (msg?.type === "neuroread:transform") {
      try {
        const data = await requestTransform({
          text: msg.text,
          disabilityType: msg.disabilityType,
          options: msg.options
        });
        sendResponse({ ok: true, data });
      } catch (e) {
        // simple local fallback: truncate to first 5 sentences
        const fallback = (msg.text || "").split(/(?<=[.!?])\s+/).slice(0, 5).join(" ");
        sendResponse({ ok: false, error: String(e), fallback });
      }
    }
  })();
  return true; // async
});
