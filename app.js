// Құпия Санта — қазақ тіліндегі сыйлық алмасу ойыны.
// Firebase Auth (Google) + Cloud Firestore. Static hosting (GitHub Pages).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, collection, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const okImg = u => typeof u === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(u);
const MONTHS = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
const fmtDate = d => { if (!d) return "—"; const [y, m, dd] = d.split("-").map(Number); return dd + " " + MONTHS[m - 1] + " " + y; };
const daysTo = d => { if (!d) return null; const [y, m, dd] = d.split("-").map(Number); const t = new Date(y, m - 1, dd); const n = new Date(); n.setHours(0, 0, 0, 0); return Math.round((t - n) / 864e5); };
const fmtMoney = (v, c) => String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + (c || "₸");
const initials = n => (String(n || "?").trim()[0] || "?").toUpperCase();
const rnd = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const newId = () => { const A = "abcdefghijkmnpqrstuvwxyz23456789"; let s = ""; for (let i = 0; i < 10; i++) s += A[rnd(A.length)]; return s; };

const SANTA = `<svg viewBox="0 0 240 260" role="img" aria-label="Маска таққан Құпия Санта"><title>Құпия Санта</title>
<ellipse cx="120" cy="256" rx="90" ry="8" fill="#000" opacity=".08"/>
<path d="M58 260 L70 168 Q120 140 170 168 L182 260Z" fill="#D7362F"/>
<path d="M120 152 Q150 152 170 168 L182 260 H120Z" fill="#B92A24"/>
<rect x="64" y="214" width="112" height="16" fill="#2A2A2E"/><rect x="108" y="211" width="24" height="22" rx="4" fill="#F7C948"/><rect x="114" y="216" width="12" height="12" rx="2" fill="#2A2A2E"/>
<path d="M70 168 Q120 150 170 168 L166 180 Q120 166 74 180Z" fill="#fff"/>
<g class="wave"><path d="M168 172 Q196 160 206 120 L222 126 Q214 176 176 192Z" fill="#D7362F"/><circle cx="214" cy="116" r="15" fill="#2A2A2E"/><path d="M203 128 l20 6" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>
<path d="M74 176 Q50 196 56 226 L74 230 Q70 204 86 190Z" fill="#B92A24"/>
<rect x="34" y="208" width="46" height="40" rx="5" fill="#2E8B6E"/><rect x="53" y="208" width="8" height="40" fill="#F7C948"/><rect x="34" y="224" width="46" height="8" fill="#F7C948"/><path d="M57 208 q-16 -16 -4 -16 q8 0 4 16 q-4 -16 4 -16 q12 0 -4 16" fill="#F7C948"/>
<path d="M78 118 Q74 196 120 204 Q166 196 162 118 Q120 140 78 118Z" fill="#fff"/>
<path d="M86 160 q10 -8 34 -2 q24 -6 34 2 q-10 14 -34 6 q-24 8 -34 -6Z" fill="#F1F1F1"/>
<circle cx="120" cy="112" r="34" fill="#F6CDB0"/>
<circle cx="98" cy="128" r="7" fill="#F29B8C" opacity=".8"/><circle cx="142" cy="128" r="7" fill="#F29B8C" opacity=".8"/>
<path d="M84 104 Q120 92 156 104 L154 120 Q138 112 128 120 Q120 124 112 120 Q102 112 86 120Z" fill="#1E2A44"/>
<path d="M84 108 L72 102 M156 108 L170 100" stroke="#1E2A44" stroke-width="4" stroke-linecap="round"/>
<ellipse class="blink" cx="104" cy="111" rx="7" ry="5" fill="#fff"/><ellipse class="blink" cx="136" cy="111" rx="7" ry="5" fill="#fff"/>
<circle cx="105" cy="112" r="3" fill="#1E2A44"/><circle cx="137" cy="112" r="3" fill="#1E2A44"/>
<circle cx="120" cy="128" r="7" fill="#EF8F7E"/>
<path d="M98 140 q12 -10 22 -2 q10 -8 22 2 q-12 8 -22 2 q-10 6 -22 -2Z" fill="#fff"/>
<path d="M110 150 q10 6 20 0" stroke="#B5524A" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M84 90 Q100 28 156 40 Q190 50 196 92 L176 96 Q170 64 150 66 L156 90Z" fill="#D7362F"/>
<rect x="80" y="82" width="80" height="18" rx="9" fill="#fff"/>
<circle cx="194" cy="96" r="12" fill="#fff"/>
<path d="M78 170 Q120 186 162 170 L160 184 Q120 198 80 184Z" fill="#2E8B6E"/><path d="M92 176 v12 M108 180 v12 M124 181 v12 M140 179 v12 M154 175 v12" stroke="#E5463F" stroke-width="4"/>
</svg>`;
const GOOGLE = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;

/* ---------- state ---------- */
const params = new URLSearchParams(location.search);
const S = {
  setup: !firebaseConfig || !firebaseConfig.apiKey || /PASTE|ҚОЙЫҢЫЗ/i.test(firebaseConfig.apiKey),
  gid: (params.get("g") || "").replace(/[^a-z0-9]/gi, "").slice(0, 32) || null,
  user: null, uid: null, authReady: false,
  game: null, gameReady: false, failed: false,
  mine: null, mineReady: false, members: [], membersVisible: false,
  pair: null, key: null, recvId: null, pairErr: false,
  editGame: false, creating: false, editProfile: false, draftPhoto: undefined, draftHost: undefined,
  opened: false, filter: "all", confirm: null, armRemove: null, busy: false, invite: false, cta: "go"
};
let WANT_NEW = params.get("new") === "1";
const isOwner = () => !!(S.uid && S.game && S.game.hostUid === S.uid);
const isOpen = () => S.game && S.game.status !== "drawn";
const me = () => S.mine;

let app, auth, db;
const unsubs = { game: null, mine: null, members: null, pair: null };
const stop = k => { if (unsubs[k]) { unsubs[k](); unsubs[k] = null; } };

function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3400); }
function errMsg(e) {
  const c = (e && e.code) || "";
  if (c.includes("permission-denied")) return "Бұл әрекетке рұқсатыңыз жоқ.";
  if (c.includes("unavailable")) return "Интернет байланысы жоқ. Байланысты тексеріп, қайталаңыз.";
  if (c.includes("popup-closed") || c.includes("cancelled-popup")) return "Кіру терезесі жабылды.";
  if (c.includes("unauthorized-domain")) return "Бұл сайттың домені Firebase баптауларына қосылмаған (Authorized domains).";
  if (c.includes("resource-exhausted") || c.includes("invalid-argument")) return "Деректер тым үлкен. Кішірек сурет таңдаңыз.";
  return "Әрекет орындалмады. Қайталап көріңіз.";
}

/* ---------- my games (this browser only) ---------- */
const MYKEY = "qupiya-santa-games";
const myGames = () => { try { return JSON.parse(localStorage.getItem(MYKEY) || "[]"); } catch (_) { return []; } };
function rememberGame(id, name, host) {
  try { const l = myGames().filter(g => g.id !== id); l.unshift({ id, name, host: !!host }); localStorage.setItem(MYKEY, JSON.stringify(l.slice(0, 12))); } catch (_) { }
}
function forgetGame(id) { try { localStorage.setItem(MYKEY, JSON.stringify(myGames().filter(g => g.id !== id))); } catch (_) { } }
const gameLink = id => location.origin + location.pathname + "?g=" + id;

/* ---------- crypto: each assignment is encrypted with the giver's own key ---------- */
const RSA = { name: "RSA-OAEP", hash: "SHA-256" };
const b64e = buf => { let s = ""; new Uint8Array(buf).forEach(b => s += String.fromCharCode(b)); return btoa(s); };
const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function ensureKey() {
  if (S.key && S.key.priv && S.key.pub) return S.key;
  const ref = doc(db, "keys", S.uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().priv) { S.key = snap.data(); return S.key; }
  const kp = await crypto.subtle.generateKey({ ...RSA, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, true, ["encrypt", "decrypt"]);
  const priv = await crypto.subtle.exportKey("jwk", kp.privateKey);
  const pub = await crypto.subtle.exportKey("jwk", kp.publicKey);
  await setDoc(ref, { priv, pub });
  S.key = { priv, pub }; return S.key;
}
async function decryptPair() {
  S.pairErr = false;
  if (!S.pair || !S.pair.c) { S.recvId = null; render(); return; }
  if (!S.key || !S.key.priv) { S.recvId = null; S.pairErr = true; render(); return; }
  try {
    const k = await crypto.subtle.importKey("jwk", S.key.priv, RSA, false, ["decrypt"]);
    const pt = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, k, b64d(S.pair.c));
    S.recvId = new TextDecoder().decode(pt);
  } catch (e) { S.recvId = null; S.pairErr = true; }
  render();
}

/* ---------- draw: a man always gives to a woman; women give to men; extra women give to women ---------- */
function drawCheck(list) {
  const M = list.filter(p => p.gender === "m").length, W = list.filter(p => p.gender === "f").length;
  if (list.length < 3) return { ok: false, msg: "Жеребе үшін кемінде 3 қатысушы керек. Қазір: " + list.length + "." };
  if (M > W) return { ok: false, msg: "Ер адам тек әйелге сыйлық береді, сондықтан әйелдер саны ерлерден аз болмауы керек. Қазір: " + M + " ер, " + W + " әйел. Тағы " + (M - W) + " әйел қосылуы керек." };
  if (list.some(p => !p.pub)) return { ok: false, msg: "Кейбір қатысушылардың анкетасы толық сақталмаған. Олар анкетасын қайта сақтауы керек." };
  const ww = W - M;
  return { ok: true, msg: M === 0 ? "Барлық " + W + " қатысушы — әйелдер, сондықтан әйелдер бір-біріне сыйлық береді." :
    M + " ер адам әйелдерге, " + M + " әйел ерлерге сыйлық береді" + (ww > 0 ? ", қалған " + ww + " әйел әйелдерге сыйлық береді." : ".") };
}
function tryOnce(men, women) {
  const map = {}; const M = men.length;
  const wr = shuffle(women), wg = shuffle(women), mr = shuffle(men);
  for (let i = 0; i < M; i++) map[men[i]] = wr[i];          // every man -> a woman
  for (let i = 0; i < M; i++) map[wg[i]] = mr[i];           // M women -> the men
  const g2 = wg.slice(M), r2 = shuffle(wr.slice(M));        // remaining women -> remaining women
  for (let i = 0; i < g2.length; i++) { if (g2[i] === r2[i]) return null; map[g2[i]] = r2[i]; }
  return map;
}
export function makeDraw(list) {
  const men = list.filter(p => p.gender === "m").map(p => p.id), women = list.filter(p => p.gender === "f").map(p => p.id);
  let best = null, bestScore = Infinity;
  for (let t = 0; t < 6000; t++) {
    const map = tryOnce(men, women); if (!map) continue;
    let mutual = 0; for (const g in map) if (map[map[g]] === g) mutual++;
    if (mutual < bestScore) { best = map; bestScore = mutual; if (!mutual) break; }
  }
  if (!best) return null;
  const g = Object.fromEntries(list.map(p => [p.id, p.gender]));
  if (Object.keys(best).length !== list.length || new Set(Object.values(best)).size !== list.length) return null;
  for (const k in best) { if (k === best[k]) return null; if (g[k] === "m" && g[best[k]] !== "f") return null; }
  return best;
}
async function runDraw() {
  const list = S.members.slice(); const chk = drawCheck(list);
  if (!chk.ok) { toast(chk.msg); return; }
  const map = makeDraw(list); if (!map) { toast("Жеребе тарту мүмкін болмады. Қайталап көріңіз."); return; }
  S.busy = true; render();
  try {
    const old = await getDocs(collection(db, "games", S.gid, "pairs"));
    const b = writeBatch(db);
    old.forEach(d => b.delete(d.ref));
    for (const p of list) {
      const k = await crypto.subtle.importKey("jwk", p.pub, RSA, false, ["encrypt"]);
      const ct = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, k, new TextEncoder().encode(map[p.id]));
      b.set(doc(db, "games", S.gid, "pairs", p.id), { c: b64e(ct), at: Date.now() });
    }
    b.set(doc(db, "games", S.gid), { ...S.game, status: "drawn", drawnAt: Date.now() });
    await b.commit();
    S.opened = false; toast("Жеребе тартылды! Әр қатысушы өз конвертін аша алады.");
  } catch (e) { toast(errMsg(e)); }
  S.busy = false; S.confirm = null; render();
}

/* ---------- images ---------- */
function loadImage(file, max, limit, square) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) { rej(new Error("type")); return; }
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s; }
      const sc = Math.min(1, max / Math.max(sw, sh)); const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(sw * sc)); c.height = Math.max(1, Math.round(sh * sc));
      const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let q = .85, d = c.toDataURL("image/jpeg", q); while (d.length > limit && q > .35) { q -= .1; d = c.toDataURL("image/jpeg", q); }
      d.length > limit ? rej(new Error("big")) : res(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("read")); };
    img.src = url;
  });
}
const prevHTML = (u, ph) => okImg(u) ? `<img src="${u}" alt="">` : ph;

/* ---------- rendering ---------- */
function avatar(p) { return `<div class="av ${p.gender === "m" ? "m" : "f"}">${okImg(p.photo) ? `<img src="${p.photo}" alt="">` : esc(initials(p.name))}</div>`; }
function factsHTML(g) {
  const dd = daysTo(g.drawDate), gd = daysTo(g.giftDate);
  const left = (n, a, b) => n == null ? "" : n > 0 ? n + " күн қалды" : n === 0 ? a : b;
  return `<div class="facts">
    <div class="fact"><b>Сыйлық сомасы</b><span>${esc(fmtMoney(g.budget, g.currency))}</span><small>шамасында</small></div>
    <div class="fact"><b>Жеребе</b><span>${esc(fmtDate(g.drawDate))}</span><small>${esc(g.status === "drawn" ? "тартылды" : left(dd, "бүгін", "мерзімі өтті"))}</small></div>
    <div class="fact"><b>Сыйлық беру</b><span>${esc(fmtDate(g.giftDate))}</span><small>${esc(left(gd, "бүгін!", "өтіп кетті"))}</small></div>
    <div class="fact"><b>Тәсілі</b><span>${g.mode === "post" ? "Пошта" : "Кездесу"}</span><small>${g.mode === "post" ? "жеткізу арқылы" : "қолма-қол"}</small></div>
  </div>${g.note ? `<div class="note info"><b>Хосттан:</b> ${esc(g.note)}</div>` : ""}`;
}
function confirmHTML(id, text, yes) { return `<div class="confirm"><p>${esc(text)}</p><div class="btn-row"><button type="button" class="btn btn-ink" data-yes="${id}">${esc(yes)}</button><button type="button" class="btn btn-ghost" data-no="1">Болдырмау</button></div></div>`; }
const signinHTML = text => `<p class="lead">${esc(text)}</p><button type="button" class="gbtn" data-signin="1">${GOOGLE}Google арқылы кіру</button>`;

function stageHTML() {
  const r = stageCore();
  if (S.gid && S.game && S.uid && S.mineReady) {
    if (isOwner()) {
      r.h += `<div class="stack" style="border-top:1.5px solid var(--line);padding-top:18px;margin-top:6px"><h3>Ойынды басқару</h3>` +
        (S.confirm === "delete"
          ? confirmHTML("delete", "«" + S.game.name + "» ойыны, барлық қатысушы мен жеребе толық өшіріледі. Бұл әрекетті қайтару мүмкін емес.", "Иә, өшіру")
          : `<div class="btn-row"><button type="button" class="btn btn-ink" id="btnNewGame">+ Жаңа ойын құру</button><button type="button" class="btn btn-danger" id="btnDelGame">Ойынды өшіру</button></div>`) + `</div>`;
    } else {
      r.h += `<div class="btn-row"><button type="button" class="btn btn-ghost" id="btnNewGame">+ Өз ойынымды құру</button></div>`;
    }
  }
  return r;
}
function stageCore() {
  if (S.setup) return { t: "Сайт әлі бапталмаған", h: `<div class="note warn">Firebase баптаулары толтырылмаған. <b>firebase-config.js</b> файлына өз Firebase жобаңыздың деректерін қойыңыз. Толық нұсқаулық README.md файлында.</div>` };
  if (!S.authReady) return { t: "Жүктелуде…", h: `<p class="muted">Сәл күтіңіз.</p>` };
  if (!S.gid) {
    const list = myGames();
    let h = `<p class="lead">Ойын құрыңыз, сілтемені достарыңызға жіберіңіз, барлығы қосылған соң жеребе тартыңыз. Тегін және жарнамасыз.</p>`;
    if (!S.uid) return { t: "Құпия Санта ойынын құрыңыз", h: h + `<button type="button" class="gbtn" data-signin="1">${GOOGLE}Google арқылы кіру</button>` };
    h += `<button type="button" class="btn btn-main" id="btnNew">Жаңа ойын құру</button>`;
    if (list.length) h += `<h3>Менің ойындарым</h3><div class="games">${list.map(g => `<a href="?g=${esc(g.id)}"><span>${esc(g.name || "Ойын")}</span><small>${g.host ? "Хост" : "Қатысушы"} →</small></a>`).join("")}</div>`;
    return { t: "Құпия Санта ойынын құрыңыз", h };
  }
  if (S.failed && !S.gameReady) return { t: "Байланыс жоқ", h: `<div class="note warn">Ойын деректерін жүктеу мүмкін болмай тұр. Интернет байланысын тексеріп, бетті жаңартыңыз.</div>` };
  if (!S.gameReady) return { t: "Жүктелуде…", h: `<p class="muted">Ойын деректері ашылып жатыр.</p>` };
  const g = S.game;
  if (!g) return { t: "Ойын табылмады", h: `<p class="lead">Бұл сілтеме бойынша ойын жоқ. Мүмкін, хост оны өшірген. Сілтемені хосттан қайта сұраңыз.</p><a class="btn btn-ghost" href="${esc(location.pathname)}">Басты бетке</a>` };
  let h = factsHTML(g);
  const mine = me();
  if (!S.uid) {
    return { t: isOpen() ? "Сізді ойынға шақырды!" : "Жеребе тартылды!", h: signinHTML(isOpen() ? "Ойынға қосылу үшін Google аккаунтыңызбен кіріңіз. Бұл сізді танып, конвертіңізді тек өзіңізге көрсету үшін керек." : "Конвертіңізді ашу үшін ойынға қосылған Google аккаунтыңызбен кіріңіз.") + h };
  }
  if (!S.mineReady) return { t: "Жүктелуде…", h: `<p class="muted">Анкетаңыз тексеріліп жатыр.</p>` };
  if (isOpen()) {
    const chk = drawCheck(S.members);
    if (isOwner()) {
      h = `<p class="lead">Сіз — осы ойынның хостысыз. Сілтемені достарыңызға жіберіңіз, барлығы қосылған соң жеребе тартыңыз.</p>` + h;
      h += `<div class="note ${chk.ok ? "ok" : "warn"}">${esc(chk.msg)}</div>`;
      h += S.confirm === "draw" ? confirmHTML("draw", "Жеребе тартылғаннан кейін тіркелу жабылады. Әр қатысушы кімге сыйлық беретінін көреді. Жалғастырасыз ба?", "Иә, тарту")
        : `<button type="button" class="btn btn-main" id="btnDraw" ${S.busy ? "disabled" : ""}>${S.busy ? "Тартылып жатыр…" : "Жеребе тарту"}</button>`;
    } else {
      h = `<p class="lead">Жеребені хост тартады. Сонда осы жерде сіздің құпия конвертіңіз пайда болады.</p>` + h;
    }
    if (mine) {
      h += `<div class="note ok">Сіз ойындасыз! Анкетаңызды кез келген уақытта өзгерте аласыз.</div>
        <div class="btn-row"><button type="button" class="btn btn-ghost" id="btnEditMe">Анкетамды өзгерту</button>${S.confirm === "leave" ? "" : `<button type="button" class="btn btn-danger" id="btnLeave">Ойыннан шығу</button>`}</div>`;
      if (S.confirm === "leave") h += confirmHTML("leave", "Ойыннан шығасыз ба? Анкетаңыз өшіріледі.", "Иә, шығу");
    } else {
      h += `<button type="button" class="btn ${isOwner() ? "btn-ink" : "btn-main"}" id="btnJoin">${isOwner() ? "Өзім де қатысамын" : "Ойынға қосылу"}</button>`;
    }
    return { t: "Жеребені күтеміз", h };
  }
  let t = "Жеребе тартылды!";
  if (!mine) {
    h = `<p class="lead">Бұл ойында жеребе тартылып қойды. Келесі ойынға міндетті түрде қосылыңыз!</p>` + h;
  } else if (S.recvId) {
    const r = S.members.find(m => m.id === S.recvId);
    if (!S.opened) {
      t = "Сіздің конвертіңіз дайын";
      h = `<div class="env-wrap"><button type="button" class="envelope" id="btnOpen" aria-label="Конвертті ашу"><span class="body"></span><span class="flap snow"></span><span class="seal">?</span></button>
        <button type="button" class="btn btn-main" id="btnOpen2">Конвертті ашу</button>
        <p class="muted" style="text-align:center">Ішінде сіз сыйлық беретін адамның аты мен анкетасы. Ашқанда қасыңызда ешкім болмасын!</p></div>` + h;
    } else if (!r) {
      h = `<div class="note warn">Сізге түскен қатысушы ойыннан шығып кеткен. Хосттан жеребені қайта тартуды сұраңыз.</div>` + h;
    } else {
      t = "Сіз Құпия Сантасыз!";
      h = `<div class="reveal">
        <div class="reveal-top">${avatar(r)}<div class="who"><small>Сіз сыйлық беретін адам</small><strong>${esc(r.name)}</strong><small>${r.gender === "m" ? "Ер адам" : "Әйел адам"}</small></div></div>
        <div class="reveal-body">
          <div class="qa"><b>Сыйлыққа қалайды</b><p>${esc(r.wish || "Анкетада жазылмаған")}</p></div>
          <div class="qa no"><b>Сыйламау керек</b><p>${esc(r.avoid || "Шектеу жоқ")}</p></div>
          ${g.mode === "post" ? `<div class="qa"><b>Жеткізу мекенжайы</b><p>${esc(r.addr || "Мекенжай жазылмаған, хосттан сұраңыз")}</p></div>` : ""}
          <div class="note info">Сыйлық сомасы ${esc(fmtMoney(g.budget, g.currency))} шамасында. Сыйлық беру күні: ${esc(fmtDate(g.giftDate))}. Бұл құпияны ешкімге айтпаңыз!</div>
          <button type="button" class="btn btn-ghost" id="btnClose">Конвертті жабу</button>
        </div></div>` + h;
    }
  } else if (S.pairErr) {
    h = `<div class="note warn">Конвертті ашу мүмкін болмады. Хосттан жеребені қайта тартуды сұраңыз.</div>` + h;
  } else if (S.pair === null) {
    h = `<div class="note warn">Сіз жеребеден кейін қосылдыңыз, сондықтан конверт жоқ. Хост жеребені қайта тартуы керек.</div>` + h;
  } else {
    h = `<p class="muted">Конверт ашылып жатыр…</p>` + h;
  }
  if (isOwner()) {
    h += `<div class="note info">Хост ретінде сіз жұптарды көрмейсіз: олар әр қатысушының өз кілтімен шифрланған. Жаңа адам қосу үшін «Баптау → Қосымша» бөлімінде тіркелуді қайта ашыңыз.</div>`;
    h += S.confirm === "redraw" ? confirmHTML("redraw", "Жеребе қайта тартылады, барлық жұп өзгереді. Жалғастырасыз ба?", "Иә, қайта тарту")
      : `<button type="button" class="btn btn-ghost" id="btnRedraw" ${S.busy ? "disabled" : ""}>Жеребені қайта тарту</button>`;
  }
  return { t, h };
}

function playersHTML() {
  if (!S.membersVisible) return `<div class="empty">Ойыншылар тізімі ойынға қосылғаннан кейін көрінеді.</div>`;
  const list = S.members;
  if (!S.members.length) return `<div class="empty">Әзірге ешкім қосылмады. Бірінші болып қосылыңыз!</div>`;
  const drawn = S.game && S.game.status === "drawn";
  return list.map(p => {
    const mineRow = p.id === S.uid;
    let act = "";
    if (mineRow && isOpen()) act = `<button type="button" class="pact" data-edit="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>Анкета</button>`;
    else if (isOwner() && isOpen() && !mineRow) act = `<button type="button" class="pact del" data-rm="${esc(p.id)}">${S.armRemove === p.id ? "Растау" : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg>Өшіру`}</button>`;
    return `<div class="player">${avatar(p)}<div class="pinfo">
      <div class="pname">${esc(p.name)} <span class="tag ${p.gender}">${p.gender === "m" ? "Ер" : "Әйел"}</span>${mineRow ? `<span class="tag me">Сіз</span>` : ""}${p.id === (S.game && S.game.hostUid) ? `<span class="tag me">Хост</span>` : ""}</div>
      <div class="pstat ${drawn ? "done" : ""}">${drawn ? "Конверт дайын" : "Жеребені күтуде"}</div></div>${act}</div>`;
  }).join("");
}

function render() {
  const g = S.game;
  $("#heroName").textContent = g && g.name ? g.name : "Құпия Санта";
  $("#heroSub").textContent = "Қош келдіңіз, қымбатты дос! Шығыстың ертегідей түнінде сізді құпия сыйлық күтіп тұр";
  $("#signCount").textContent = S.membersVisible ? S.members.length : (g ? "?" : "0");
  const slot = $("#santaSlot"), want = g && okImg(g.photo) ? "img:" + g.photo.length + g.photo.slice(-24) : "svg";
  if (slot.dataset.k !== want) { slot.dataset.k = want; slot.innerHTML = want === "svg" ? SANTA : `<img src="${g.photo}" alt="Хост — Құпия Санта">`; }

  $("#btnSettings").hidden = !(isOwner() && g);
  $("#btnAuth").hidden = S.setup || !S.authReady;
  $("#btnAuth").textContent = S.uid ? "Шығу" : "Кіру";
  $("#btnAuth").title = S.user ? (S.user.displayName || S.user.email || "") : "";

  const mine = me();
  S.cta = S.setup || !S.authReady ? "go" : !S.uid ? "signin" : !S.gid ? "create" : !g ? "go" : isOpen() ? (mine ? "go" : "join") : (mine ? "open" : "go");
  $("#heroCta").textContent = { signin: "Google арқылы кіру", create: "Ойын құру", join: isOwner() ? "Өзім де қатысамын" : "Ойынға қосылу", open: "Конвертімді ашу", go: "Ойынға өту" }[S.cta];

  const showCreate = !!S.uid && ((!S.gid && S.creating) || (isOwner() && S.editGame));
  const showJoin = !showCreate && g && isOpen() && S.uid && S.editProfile;
  $("#createSec").hidden = !showCreate;
  $("#joinSec").hidden = !showJoin;
  $("#statusSec").hidden = showCreate || showJoin;
  $("#playersSec").hidden = !g || !S.uid || showCreate || showJoin;
  if (!showCreate && !showJoin) { const st = stageHTML(); $("#statusTitle").textContent = st.t; $("#stage").innerHTML = st.h; }
  if (!$("#playersSec").hidden) {
    $("#pCount").textContent = S.membersVisible ? S.members.length : "";
    $("#players").innerHTML = playersHTML();
    $("#btnAddMe").hidden = !(g && isOpen() && S.uid && S.mineReady && !mine);
  }
  const ib = $("#inviteBox"); ib.hidden = !S.invite;
  if (S.invite) {
    ib.innerHTML = S.gid && g
      ? `<div class="stack"><h3>Ойынға шақыру</h3><p class="muted">Осы сілтемені достарыңызға WhatsApp, Telegram немесе Instagram арқылы жіберіңіз. Олар Google арқылы кіріп, анкета толтырады.</p>
         <div class="linkbox"><input class="in" id="linkInput" readonly value="${esc(gameLink(S.gid))}" aria-label="Ойын сілтемесі"><button type="button" class="btn btn-ink" id="btnCopy">Көшіру</button></div>
         <div class="btn-row"><button type="button" class="btn btn-ghost" id="inviteClose">Жабу</button></div></div>`
      : `<div class="stack"><h3>Ойынға шақыру</h3><p class="muted">Алдымен ойын құрыңыз. Содан кейін осы жерде шақыру сілтемесі пайда болады.</p><div class="btn-row"><button type="button" class="btn btn-ghost" id="inviteClose">Жабу</button></div></div>`;
  }
}

/* ---------- data subscriptions ---------- */
function subscribeGame() {
  stop("game"); if (!S.gid) { S.gameReady = true; return; }
  const timer = setTimeout(() => { if (!S.gameReady) { S.failed = true; render(); } }, 10000);
  unsubs.game = onSnapshot(doc(db, "games", S.gid), s => {
    S.game = s.exists() ? s.data() : null; S.gameReady = true; S.failed = false; clearTimeout(timer);
    if (S.game) rememberGame(S.gid, S.game.name, isOwner()); else forgetGame(S.gid);
    syncMembers(); render();
  }, () => { S.failed = true; render(); });
}
function subscribeUser() {
  stop("mine"); stop("pair"); stop("members");
  S.mine = null; S.mineReady = false; S.members = []; S.membersVisible = false; S.pair = null; S.key = null; S.recvId = null;
  if (!S.uid || !S.gid) { S.mineReady = true; return; }
  unsubs.mine = onSnapshot(doc(db, "games", S.gid, "members", S.uid), s => {
    S.mine = s.exists() ? { id: s.id, ...s.data() } : null; S.mineReady = true; syncMembers(); render();
  }, () => { S.mineReady = true; render(); });
  getDoc(doc(db, "keys", S.uid)).then(k => { if (k.exists()) S.key = k.data(); decryptPair(); }).catch(() => { });
  unsubs.pair = onSnapshot(doc(db, "games", S.gid, "pairs", S.uid), s => { S.pair = s.exists() ? s.data() : null; decryptPair(); }, () => { S.pair = null; render(); });
}
function syncMembers() {
  const allowed = !!(S.uid && S.gid && S.game && (S.mine || isOwner()));
  if (allowed && !unsubs.members) {
    unsubs.members = onSnapshot(collection(db, "games", S.gid, "members"), q => {
      S.members = q.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.name && (p.gender === "m" || p.gender === "f")).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
      S.membersVisible = true; render();
    }, () => { stop("members"); S.membersVisible = false; S.members = []; render(); });
  } else if (!allowed && unsubs.members) { stop("members"); S.membersVisible = false; S.members = []; }
}

/* ---------- auth ---------- */
async function signIn() {
  const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
  try { await signInWithPopup(auth, p); }
  catch (e) {
    const c = (e && e.code) || "";
    if (c.includes("popup-blocked") || c.includes("operation-not-supported")) { await signInWithRedirect(auth, p); return; }
    toast(errMsg(e));
  }
}

/* ---------- forms ---------- */
function setTab(id) { ["Main", "Look", "More"].forEach(k => { $("#tab" + k).setAttribute("aria-selected", String(k === id)); $("#pane" + k).hidden = k !== id; }); }
function openGameForm(edit) {
  const g = (edit && S.game) || {};
  $("#gName").value = g.name || ""; $("#gBudget").value = g.budget || ""; $("#gCur").value = g.currency || "₸";
  (g.mode === "post" ? $("#gModePost") : $("#gModeLive")).checked = true;
  const t = new Date(), iso = d => d.toISOString().slice(0, 10), y = t.getFullYear();
  $("#gDraw").value = g.drawDate || iso(new Date(t.getTime() + 7 * 864e5));
  $("#gGift").value = g.giftDate || ((y + "-12-28") < iso(t) ? (y + 1) + "-12-28" : y + "-12-28");
  $("#gNote").value = g.note || ""; S.draftHost = g.photo || null;
  $("#hostPrev").innerHTML = prevHTML(S.draftHost, "Сурет жоқ");
  $("#createTitle").textContent = edit ? "Ойын баптаулары" : "Ойын құру";
  $("#createSub").textContent = edit ? "Өзгерістерді сақтағанда барлық ойыншы оларды бірден көреді." : "Сіз — хостсыз. Ойынды баптап, қатысушыларды шақырыңыз.";
  $("#gameSubmit").textContent = edit ? "Сақтау" : "Ойынды құру";
  $("#gameCancel").hidden = false; $("#dangerZone").hidden = !edit; $("#dangerConfirm").innerHTML = "";
  $("#btnReopen").hidden = !(edit && g.status === "drawn");
  document.querySelectorAll("#gameForm .err").forEach(e => e.textContent = "");
  setTab("Main");
}
function openJoinForm() {
  const m = me() || {};
  $("#pName").value = m.name || (S.user && S.user.displayName ? S.user.displayName.split(" ")[0] : "");
  $("#pGenderM").checked = m.gender === "m"; $("#pGenderF").checked = m.gender === "f";
  $("#pWish").value = m.wish || ""; $("#pAvoid").value = m.avoid || ""; $("#pAddr").value = m.addr || "";
  $("#addrField").hidden = !(S.game && S.game.mode === "post");
  S.draftPhoto = m.photo || null; $("#pPrev").innerHTML = prevHTML(S.draftPhoto, "Сурет");
  $("#joinTitle").textContent = me() ? "Менің анкетам" : "Ойынға қосылу";
  $("#joinSubmit").textContent = me() ? "Анкетаны сақтау" : "Ойынға қосылу";
  $("#joinCancel").hidden = false;
  document.querySelectorAll("#joinForm .err").forEach(e => e.textContent = "");
}
function startJoin() {
  if (!S.uid) { signIn(); return; }
  S.editProfile = true; S.confirm = null; openJoinForm(); render();
  $("#joinSec").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $("#pName").focus({ preventScroll: true }), 300);
}
function startCreate() {
  if (!S.uid) { signIn(); return; }
  if (S.gid) { location.href = location.pathname; return; }
  S.creating = true; openGameForm(false); render(); $("#createSec").scrollIntoView({ behavior: "smooth" });
}

$("#tabMain").onclick = () => setTab("Main"); $("#tabLook").onclick = () => setTab("Look"); $("#tabMore").onclick = () => setTab("More");
$("#nameSuggest").onclick = e => { if (e.target.tagName === "BUTTON") { $("#gName").value = e.target.textContent; $("#eName").textContent = ""; } };
$("#budgetSuggest").onclick = e => { if (e.target.dataset.v) { $("#gBudget").value = e.target.dataset.v; $("#eBudget").textContent = ""; } };
$("#gBudget").addEventListener("input", e => { e.target.value = e.target.value.replace(/[^\d]/g, "").slice(0, 9); $("#eBudget").textContent = ""; });
["gName", "gDraw", "gGift"].forEach(id => $("#" + id).addEventListener("input", () => { $("#e" + id.slice(1)).textContent = ""; }));
$("#hostFile").onchange = async e => {
  const f = e.target.files[0]; e.target.value = ""; $("#eHost").textContent = "";
  try { S.draftHost = await loadImage(f, 720, 300000, false); $("#hostPrev").innerHTML = prevHTML(S.draftHost, ""); }
  catch (_) { $("#eHost").textContent = "Суретті ашу мүмкін болмады. JPG немесе PNG суретін таңдаңыз."; }
};
$("#hostClear").onclick = () => { S.draftHost = null; $("#hostPrev").innerHTML = "Сурет жоқ"; };
$("#gameCancel").onclick = () => { S.editGame = false; S.creating = false; render(); };

$("#gameForm").addEventListener("submit", async e => {
  e.preventDefault(); if (S.busy || !S.uid) return;
  const name = $("#gName").value.trim(), budget = Number($("#gBudget").value), draw = $("#gDraw").value, gift = $("#gGift").value;
  let bad = false; const fail = (id, t) => { $(id).textContent = t; bad = true; };
  if (!name) fail("#eName", "Ойын атауын жазыңыз");
  if (!budget || budget < 1) fail("#eBudget", "Сыйлық сомасын жазыңыз немесе таңдаңыз");
  if (!draw) fail("#eDraw", "Жеребе күнін таңдаңыз");
  if (!gift) fail("#eGift", "Сыйлық беру күнін таңдаңыз");
  else if (draw && gift < draw) fail("#eGift", "Сыйлық беру күні жеребе күнінен кейін болуы керек");
  if (bad) { setTab("Main"); return; }
  const editing = S.editGame && isOwner();
  const prev = editing ? S.game : {};
  const data = {
    name, budget, currency: $("#gCur").value, mode: $("#gModePost").checked ? "post" : "live", drawDate: draw, giftDate: gift,
    note: $("#gNote").value.trim(), photo: okImg(S.draftHost) ? S.draftHost : null,
    status: prev.status || "open", hostUid: editing ? prev.hostUid : S.uid, createdAt: prev.createdAt || Date.now(), drawnAt: prev.drawnAt || null
  };
  S.busy = true; $("#gameSubmit").disabled = true; $("#eGame").textContent = "";
  try {
    if (editing) {
      await setDoc(doc(db, "games", S.gid), data); toast("Баптаулар сақталды"); S.editGame = false;
    } else {
      const id = newId();
      await setDoc(doc(db, "games", id), data);
      rememberGame(id, name, true);
      history.replaceState(null, "", "?g=" + id);
      S.gid = id; S.creating = false; S.invite = true;
      subscribeGame(); subscribeUser();
      toast("Ойын құрылды! Енді сілтемені достарыңызға жіберіңіз.");
    }
  } catch (err) { $("#eGame").textContent = errMsg(err); }
  S.busy = false; $("#gameSubmit").disabled = false; render();
  if (S.invite) $("#inviteBox").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("#pFile").onchange = async e => {
  const f = e.target.files[0]; e.target.value = ""; $("#epPhoto").textContent = "";
  try { S.draftPhoto = await loadImage(f, 320, 80000, true); $("#pPrev").innerHTML = prevHTML(S.draftPhoto, ""); }
  catch (_) { $("#epPhoto").textContent = "Суретті ашу мүмкін болмады. JPG немесе PNG суретін таңдаңыз."; }
};
$("#pClear").onclick = () => { S.draftPhoto = null; $("#pPrev").innerHTML = "Сурет"; };
$("#joinCancel").onclick = () => { S.editProfile = false; render(); };
["pName", "pWish", "pAddr"].forEach(id => $("#" + id).addEventListener("input", () => { $("#ep" + id.slice(1)).textContent = ""; }));
document.querySelectorAll('input[name="pGender"]').forEach(r => r.addEventListener("change", () => { $("#epGender").textContent = ""; }));

$("#joinForm").addEventListener("submit", async e => {
  e.preventDefault(); if (S.busy || !S.uid) return;
  const name = $("#pName").value.trim(), gender = $("#pGenderM").checked ? "m" : $("#pGenderF").checked ? "f" : "", wish = $("#pWish").value.trim();
  const post = S.game && S.game.mode === "post", addr = $("#pAddr").value.trim();
  let bad = false; const fail = (id, t) => { $(id).textContent = t; bad = true; };
  if (!name) fail("#epName", "Атыңызды жазыңыз");
  if (!gender) fail("#epGender", "Жынысыңызды таңдаңыз");
  if (!wish) fail("#epWish", "Қандай сыйлық қалайтыныңызды жазыңыз");
  if (post && !addr) fail("#epAddr", "Жеткізу мекенжайын жазыңыз");
  if (bad) return;
  if (!isOpen()) { $("#epForm").textContent = "Жеребе тартылып қойды, тіркелу жабық."; return; }
  S.busy = true; $("#joinSubmit").disabled = true; $("#epForm").textContent = "";
  const was = !!me();
  try {
    const key = await ensureKey();
    const prev = me() || {};
    await setDoc(doc(db, "games", S.gid, "members", S.uid), {
      name, gender, wish, avoid: $("#pAvoid").value.trim(), addr: post ? addr : (prev.addr || ""),
      photo: okImg(S.draftPhoto) ? S.draftPhoto : null, pub: key.pub, joinedAt: prev.joinedAt || Date.now()
    });
    rememberGame(S.gid, S.game.name, isOwner());
    S.editProfile = false; toast(was ? "Анкета сақталды" : "Сіз ойынға қосылдыңыз!");
  } catch (err) { $("#epForm").textContent = errMsg(err); }
  S.busy = false; $("#joinSubmit").disabled = false; render();
});

/* ---------- actions ---------- */
async function wipePairs(batch) { const q = await getDocs(collection(db, "games", S.gid, "pairs")); q.forEach(d => batch.delete(d.ref)); }
document.addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const id = b.id;
  if (b.dataset.signin) { signIn(); return; }
  if (id === "btnAuth") { if (S.uid) { await signOut(auth); toast("Сіз аккаунттан шықтыңыз"); } else signIn(); return; }
  if (id === "btnSettings") { S.editGame = true; S.editProfile = false; openGameForm(true); render(); $("#createSec").scrollIntoView({ behavior: "smooth" }); return; }
  if (id === "btnInvite") { S.invite = !S.invite; render(); if (S.invite) $("#inviteBox").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
  if (id === "inviteClose") { S.invite = false; render(); return; }
  if (id === "btnCopy") {
    const inp = $("#linkInput");
    try { await navigator.clipboard.writeText(inp.value); toast("Сілтеме көшірілді"); }
    catch (_) { inp.focus(); inp.select(); toast("Сілтемені белгілеп, көшіріңіз"); }
    return;
  }
  if (id === "heroRules") { $("#rulesSec").scrollIntoView({ behavior: "smooth" }); return; }
  if (id === "heroCta") {
    if (S.cta === "signin") { signIn(); return; }
    if (S.cta === "create") { startCreate(); return; }
    if (S.cta === "join") { startJoin(); return; }
    if (S.cta === "open") { S.opened = true; render(); }
    $(!$("#createSec").hidden ? "#createSec" : !$("#joinSec").hidden ? "#joinSec" : "#statusSec").scrollIntoView({ behavior: "smooth" }); return;
  }
  if (id === "btnNew") { startCreate(); return; }
  if (id === "btnNewGame") { location.href = location.pathname + "?new=1"; return; }
  if (id === "btnDelGame") { S.confirm = "delete"; render(); return; }
  if (id === "btnJoin" || id === "btnAddMe" || id === "btnEditMe" || b.dataset.edit) { startJoin(); return; }
  if (id === "btnDraw") { S.confirm = "draw"; render(); return; }
  if (id === "btnRedraw") { S.confirm = "redraw"; render(); return; }
  if (id === "btnLeave") { S.confirm = "leave"; render(); return; }
  if (id === "btnOpen" || id === "btnOpen2") { S.opened = true; render(); return; }
  if (id === "btnClose") { S.opened = false; render(); return; }
  if (b.dataset.no) { S.confirm = null; $("#dangerConfirm").innerHTML = ""; render(); return; }
  if (b.dataset.yes) {
    const y = b.dataset.yes;
    if (y === "draw" || y === "redraw") { runDraw(); return; }
    if (y === "leave") { S.confirm = null; try { await deleteDoc(doc(db, "games", S.gid, "members", S.uid)); toast("Сіз ойыннан шықтыңыз"); } catch (err) { toast(errMsg(err)); } render(); return; }
    if (y === "reopen") {
      try { const bt = writeBatch(db); await wipePairs(bt); bt.set(doc(db, "games", S.gid), { ...S.game, status: "open", drawnAt: null }); await bt.commit(); S.editGame = false; toast("Тіркелу қайта ашылды"); }
      catch (err) { toast(errMsg(err)); } render(); return;
    }
    if (y === "delete") {
      try {
        const bt = writeBatch(db); await wipePairs(bt);
        (await getDocs(collection(db, "games", S.gid, "members"))).forEach(d => bt.delete(d.ref));
        bt.delete(doc(db, "games", S.gid)); await bt.commit();
        forgetGame(S.gid); S.confirm = null; stop("game"); stop("members"); stop("mine"); stop("pair");
        toast("Ойын өшірілді. Жаңа ойын құра аласыз."); setTimeout(() => location.href = location.pathname + "?new=1", 1100);
      } catch (err) { toast(errMsg(err)); } render(); return;
    }
  }
  if (b.dataset.rm) {
    const rid = b.dataset.rm;
    if (S.armRemove !== rid) { S.armRemove = rid; render(); setTimeout(() => { if (S.armRemove === rid) { S.armRemove = null; render(); } }, 4000); return; }
    S.armRemove = null; try { await deleteDoc(doc(db, "games", S.gid, "members", rid)); toast("Қатысушы өшірілді"); } catch (err) { toast(errMsg(err)); } render(); return;
  }
  if (id === "btnReopen") { $("#dangerConfirm").innerHTML = confirmHTML("reopen", "Жеребе өшіріліп, тіркелу қайта ашылады. Барлық конверт жойылады.", "Иә, қайта ашу"); return; }
  if (id === "btnDelete") { $("#dangerConfirm").innerHTML = confirmHTML("delete", "Ойын, барлық қатысушы мен жеребе өшіріледі. Бұл әрекетті қайтару мүмкін емес.", "Иә, өшіру"); return; }
});

/* ---------- sky lanterns rising, sakura petals drifting ---------- */
(function sky() {
  const c = $("#snow"), x = c.getContext && c.getContext("2d"); if (!x) return;
  const host = c.parentElement;
  const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, lanterns = [], petals = [];
  const lantern = (y) => ({ x: Math.random() * W, y: y ?? H + Math.random() * H * .5, s: .18 + Math.random() * .35, w: 7 + Math.random() * 9, ph: Math.random() * 6.28, fl: Math.random() * 6.28 });
  const petal = (y) => ({ x: Math.random() * W, y: y ?? -10, s: .35 + Math.random() * .6, r: 3 + Math.random() * 3, a: Math.random() * 6.28, sp: (Math.random() - .5) * .04, ph: Math.random() * 6.28 });
  const size = () => {
    const d = Math.min(2, window.devicePixelRatio || 1); const b = host.getBoundingClientRect();
    W = b.width; H = b.height; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
    lanterns = Array.from({ length: Math.round(Math.min(26, W / 50)) }, () => lantern(Math.random() * H));
    petals = Array.from({ length: Math.round(Math.min(34, W / 36)) }, () => petal(Math.random() * H));
  };
  const drawLantern = l => {
    const fl = .75 + Math.sin(l.fl) * .25, w = l.w, h = w * 1.25;
    const g = x.createRadialGradient(l.x, l.y, 0, l.x, l.y, w * 3);
    g.addColorStop(0, `rgba(255,190,90,${.35 * fl})`); g.addColorStop(1, "rgba(255,150,60,0)");
    x.fillStyle = g; x.beginPath(); x.arc(l.x, l.y, w * 3, 0, 6.283); x.fill();
    x.fillStyle = `rgba(255,${170 + 40 * fl | 0},90,.95)`;
    x.beginPath(); x.moveTo(l.x - w * .5, l.y - h * .5); x.lineTo(l.x + w * .5, l.y - h * .5); x.lineTo(l.x + w * .38, l.y + h * .5); x.lineTo(l.x - w * .38, l.y + h * .5); x.closePath(); x.fill();
    x.fillStyle = "rgba(255,245,210,.9)"; x.fillRect(l.x - w * .2, l.y + h * .3, w * .4, h * .14);
  };
  const drawPetal = p => {
    x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = "rgba(246,170,195,.85)";
    x.beginPath(); x.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.283); x.fill();
    x.fillStyle = "rgba(255,225,235,.7)"; x.beginPath(); x.ellipse(-p.r * .3, 0, p.r * .4, p.r * .22, 0, 0, 6.283); x.fill(); x.restore();
  };
  const frame = () => {
    x.clearRect(0, 0, W, H);
    for (const l of lanterns) {
      drawLantern(l);
      if (!still) { l.y -= l.s; l.ph += .008; l.fl += .08; l.x += Math.sin(l.ph) * .25; if (l.y < -40) Object.assign(l, lantern()); }
    }
    for (const p of petals) {
      drawPetal(p);
      if (!still) { p.y += p.s; p.ph += .02; p.x += Math.sin(p.ph) * .6 + .25; p.a += p.sp; if (p.y > H + 10 || p.x > W + 10) Object.assign(p, petal()); }
    }
    if (!still) requestAnimationFrame(frame);
  };
  size(); if (window.ResizeObserver) new ResizeObserver(size).observe(host); else addEventListener("resize", size); frame();
})();

/* ---------- music: music.mp3 if present, otherwise "Jingle Bells" (J. Pierpont, 1857, public domain) played in the browser ---------- */
const Music = (() => {
  let ctx = null, master = null, echo = null, noise = null, timer = null, on = false;
  let audioEl = null, fileState = "unknown";
  let nextTime = 0, noteIdx = 0, beatIdx = 0, nextBeat = 0;
  const btn = $("#btnMusic"), label = $("#musicLabel");
  const BEAT = 0.36;                                   // ~167 bpm, quarter note
  const C4 = 261.63, hz = s => C4 * Math.pow(2, s / 12);
  // chorus melody in C major: [semitones from C4, beats]; null = rest
  const E = 4, F = 5, G = 7, D = 2, C = 0;
  const MELODY = [
    [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C, 1.5], [D, .5], [E, 4],
    [F, 1], [F, 1], [F, 1.5], [F, .5], [F, 1], [E, 1], [E, 1], [E, .5], [E, .5], [E, 1], [D, 1], [D, 1], [E, 1], [D, 2], [G, 2],
    [E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C, 1.5], [D, .5], [E, 4],
    [F, 1], [F, 1], [F, 1.5], [F, .5], [F, 1], [E, 1], [E, 1], [E, .5], [E, .5], [G, 1], [G, 1], [F, 1], [D, 1], [C, 4]
  ];
  // one chord root per bar (4 beats), 16 bars, as semitones from C2
  const BASS = [0, 0, 0, 0, 5, 0, 2, 7, 0, 0, 0, 0, 5, 0, 7, 0];
  const LOOP_BEATS = 64;

  async function hasFile() {
    if (fileState !== "unknown") return fileState === "yes";
    try { const r = await fetch("music.mp3", { method: "HEAD", cache: "no-store" }); fileState = r.ok && /audio/.test(r.headers.get("content-type") || "") ? "yes" : "no"; }
    catch (_) { fileState = "no"; }
    return fileState === "yes";
  }
  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const d = ctx.createDelay(1); d.delayTime.value = .27;
    const fb = ctx.createGain(); fb.gain.value = .22;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
    echo = ctx.createGain(); echo.gain.value = .22;
    echo.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate * .3, ctx.sampleRate);
    const ch = noise.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  }
  function tone(f, t, dur) {                           // bright music-box / glockenspiel voice
    [[1, "triangle", .16], [2, "sine", .06], [4, "sine", .025]].forEach(([m, type, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.35, dur * BEAT * 1.1));
      o.connect(g); g.connect(master); g.connect(echo); o.start(t); o.stop(t + dur * BEAT * 1.2 + .4);
    });
  }
  function bass(f, t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + BEAT * .9);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + BEAT);
  }
  function sleigh(t, accent) {                         // sleigh bells: filtered noise shake
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; bp.type = "bandpass"; bp.frequency.value = 7500; bp.Q.value = 1.4;
    g.gain.setValueAtTime(accent ? .22 : .12, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + .2);
  }
  function schedule() {
    const ahead = ctx.currentTime + .25;
    while (nextTime < ahead) {                          // melody
      const [semi, beats] = MELODY[noteIdx];
      if (semi != null) tone(hz(semi), nextTime, beats);
      nextTime += beats * BEAT;
      noteIdx = (noteIdx + 1) % MELODY.length;
    }
    while (nextBeat < ahead) {                          // bass "oom-pah" and bells, locked to the same grid
      const b = beatIdx % LOOP_BEATS, root = BASS[Math.floor(b / 4)], f = C4 / 2 * Math.pow(2, root / 12);
      bass(b % 2 === 0 ? f : f * 1.5, nextBeat);
      sleigh(nextBeat, b % 4 === 0); sleigh(nextBeat + BEAT / 2, false);
      nextBeat += BEAT; beatIdx++;
    }
  }
  function ui() { btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", String(on)); label.textContent = on ? "Әуенді өшіру" : "Әуенді қосу"; }
  async function start() {
    if (await hasFile()) {
      if (!audioEl) { audioEl = new Audio("music.mp3"); audioEl.loop = true; audioEl.volume = .55; }
      try { await audioEl.play(); on = true; } catch (_) { on = false; toast("Әуенді қосу мүмкін болмады."); }
      ui(); return;
    }
    if (!ctx) setup();
    await ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(.85, ctx.currentTime, .15);
    if (!timer) {
      nextTime = nextBeat = ctx.currentTime + .1; noteIdx = 0; beatIdx = 0;
      timer = setInterval(schedule, 60); schedule();
    }
    on = true; ui();
  }
  function stopAll() {
    if (audioEl) audioEl.pause();
    if (ctx) { master.gain.setTargetAtTime(0, ctx.currentTime, .2); setTimeout(() => { if (!on && timer) { clearInterval(timer); timer = null; } }, 800); }
    on = false; ui();
  }
  btn.addEventListener("click", () => on ? stopAll() : start());
  ui();
  return { start, stop: stopAll };
})();

/* ---------- boot ---------- */
render();
if (!S.setup) {
  try {
    app = initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app);
    subscribeGame();
    onAuthStateChanged(auth, u => {
      S.user = u; S.uid = u ? u.uid : null; S.authReady = true;
      S.editProfile = false; S.editGame = false; S.creating = false; S.confirm = null;
      subscribeUser(); syncMembers(); render();
      if (WANT_NEW && S.uid && !S.gid) { WANT_NEW = false; history.replaceState(null, "", location.pathname); startCreate(); }
    });
  } catch (e) { S.setup = true; render(); }
}
