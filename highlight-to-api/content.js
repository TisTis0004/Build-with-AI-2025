(function () {
  // Lightweight heuristic extractor to avoid large libs at hackathon
  function textLen(el) {
    return (el?.innerText || "").trim().length;
  }
  function pickMain() {
    // 1) Prefer <article>
    const art = document.querySelector("article");
    if (art && textLen(art) > 200) return art.innerText.trim();
    // 2) Largest <main> or central container
    const cands = Array.from(
      document.querySelectorAll(
        "main, [role='main'], .content, .article, .post, .entry, .readable, #content"
      )
    );
    const scored = cands
      .map((n) => ({ n, score: textLen(n) }))
      .sort((a, b) => b.score - a.score);
    if (scored[0]?.score > 200) return scored[0].n.innerText.trim();
    // 3) Fallback: biggest paragraph cluster
    const blocks = Array.from(document.querySelectorAll("p"))
      .map((p) => ({ p, s: textLen(p) }))
      .sort((a, b) => b.s - a.s);
    const top = blocks
      .slice(0, 20)
      .map((b) => b.p.innerText.trim())
      .join("\n\n");
    return top;
  }
  // Expose extractor under Fluentia namespace for background.js
  window.__fluentia_extractMain = () => pickMain();
})();

// Get selection or fall back to main article using the content script extractor
// (Helper; not currently invoked by popup directly.)
async function getSelectionOrMainFromActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tab?.id || !tab.url) return { ok: false, error: "no-tab" };

  // Block restricted pages early
  const url = tab.url;
  const restricted =
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.includes("chromewebstore.google.com");
  if (restricted) return { ok: false, error: "restricted-page" };

  // Ensure we have host permission for this origin (MV3 requirement)
  const originPattern = new URL(url).origin + "/*";
  const hasPerm = await chrome.permissions.contains({
    origins: [originPattern],
  });
  if (!hasPerm) {
    const granted = await chrome.permissions.request({
      origins: [originPattern],
    });
    if (!granted) return { ok: false, error: "perm-denied" };
  }

  // 1) Try selected text
  const [selRes] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => (window.getSelection()?.toString() || "").trim(),
  });
  let text = selRes?.result || "";

  // 2) If no selection, ask the content script to extract main article
  if (!text) {
    const cs = await chrome.tabs
      .sendMessage(tab.id, { type: "fluentia:extractMain" })
      .catch(() => null);
    text = cs?.text || "";
  }

  return { ok: true, text, sourceUrl: url };
}
