function getParam(name){ const u=new URL(location.href); return u.searchParams.get(name)||""; }
function getJsonParam(name){ const v=getParam(name); try{ return JSON.parse(decodeURIComponent(escape(atob(v)))); }catch{ return {}; }}


const srcA = document.getElementById("src");
const paneOriginal = document.getElementById("original");
const paneAdapted = document.getElementById("adapted");
const btnToggle = document.getElementById("toggle");
const btnTTS = document.getElementById("tts");
const btnStop = document.getElementById("stop");


const src = getParam("src");
const original = getParam("text");
const adapted = getParam("adapted");
const disease = getParam("disease") || "dyslexia";
const opts = getJsonParam("opts");

srcA.textContent = src || "(unknown)"; if (src) srcA.href = src;


paneOriginal.textContent = original;
paneAdapted.textContent = adapted || "(no adapted text returned — showing fallback or original)";


let showingAdapted = false;
btnToggle.addEventListener("click", () => {
showingAdapted = !showingAdapted;
paneAdapted.hidden = !showingAdapted;
paneOriginal.hidden = showingAdapted;
btnToggle.textContent = showingAdapted ? "Show Original" : "Show Adapted";
});


// Apply per-disease styling locally
function applyStyling(el){
el.classList.remove("dyslexia-mode","adhd-mode");
if (disease === "dyslexia" && opts?.fontMode){
el.classList.add("dyslexia-mode");
if (opts.lineHeight) el.style.setProperty("--dlh", opts.lineHeight);
if (opts.letterSpacing) el.style.setProperty("--dls", opts.letterSpacing + "em");
}
if (disease === "adhd"){ el.classList.add("adhd-mode"); }
}
applyStyling(paneOriginal);
applyStyling(paneAdapted);

// Simple Web Speech API TTS (client-side)
let utterance = null;
function speak(text){
if (!window.speechSynthesis) { alert("TTS not supported in this browser"); return; }
if (utterance) { window.speechSynthesis.cancel(); utterance = null; }
utterance = new SpeechSynthesisUtterance(text);
utterance.rate = (disease === "aphasia") ? 0.9 : 1.0; // slower for aphasia
utterance.pitch = 1.0;
speechSynthesis.speak(utterance);
}
btnTTS.addEventListener("click", () => { const t = showingAdapted && adapted ? adapted : original; speak(t); });
btnStop.addEventListener("click", () => speechSynthesis.cancel());


// =============================
// File: content.css (for inline helpers later)
// =============================
/* empty for now (you can add selection toolbar styles here if desired) */


// =============================
// File: content.js (runs in pages) — main-content extractor
// =============================
(function(){
// Lightweight heuristic extractor to avoid large libs at hackathon
function textLen(el){ return (el?.innerText || "").trim().length; }
function pickMain(){
// 1) Prefer <article>
const art = document.querySelector("article");
if (art && textLen(art) > 200) return art.innerText.trim();
// 2) Largest <main> or central container
const cands = Array.from(document.querySelectorAll("main, [role='main'], .content, .article, .post, .entry, .readable, #content"));
const scored = cands.map(n => ({ n, score: textLen(n) })).sort((a,b)=>b.score-a.score);
if (scored[0]?.score > 200) return scored[0].n.innerText.trim();
// 3) Fallback: biggest paragraph cluster
const blocks = Array.from(document.querySelectorAll("p")).map(p=>({p, s: textLen(p)})).sort((a,b)=>b.s-a.s);
const top = blocks.slice(0, 20).map(b=>b.p.innerText.trim()).join("\n\n");
return top;
}
window.__neuroread_extractMain = () => pickMain();
})();