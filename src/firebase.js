// 로그인(Google·이메일)과 클라우드 저장.
// 게임은 localStorage의 'pol-save'(진행 중인 판)와 'pol-hof'(명예의 전당)에 저장한다.
// 로그인하면 두 값을 Firestore users/<uid>/games/politician 문서와 맞춰서
// 다른 기기에서도 이어 할 수 있게 한다. 더 최근에 저장된 쪽이 이긴다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut, setPersistence, browserLocalPersistence,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSpHxsAAc8_Q1Qj0OE433hRfxJuEkQNyM",
  authDomain: "minbeop-2f119.firebaseapp.com",
  projectId: "minbeop-2f119",
  storageBucket: "minbeop-2f119.firebasestorage.app",
  messagingSenderId: "175607410608",
  appId: "1:175607410608:web:49a3cd645e5378a836f075",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const fs = getFirestore(app);
let user = null, state = "off", pushTimer = null; // state: off | sync | ok | err

const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const localTs = () => +(localStorage.getItem("pol-ts") || 0);
const ref = () => doc(fs, "users", user.uid, "games", "politician");
const key = (h) => [h.name, h.party, h.best, h.end, h.y].join("|");
// 업적 도감: 얻은 업적은 합치고(먼저 얻은 날짜 유지), 엔딩 횟수는 큰 쪽을 쓴다.
function mergeAch(a, b) {
  if (!a) return b || null; if (!b) return a;
  const out = { ach: { ...(b.ach || {}) }, ends: { ...(b.ends || {}) }, runs: Math.max(a.runs || 0, b.runs || 0) };
  for (const [k, v] of Object.entries(a.ach || {})) out.ach[k] = out.ach[k] ? Math.min(out.ach[k], v) : v;
  for (const [k, v] of Object.entries(a.ends || {})) out.ends[k] = Math.max(out.ends[k] || 0, v);
  return out;
}
function mergeHof(a, b) {
  const seen = new Set(), out = [];
  for (const h of [...(a || []), ...(b || [])]) { const k = key(h); if (!seen.has(k)) { seen.add(k); out.push(h); } }
  return out.slice(0, 30);
}

// 게임이 저장할 때마다 불린다.
// (pol-ts 기록은 index.html 의 __cloudPut 이 먼저 해 둔다)
window.__cloudHook = () => {
  if (!user) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 1500);
};
async function push() {
  if (!user) return;
  clearTimeout(pushTimer); pushTimer = null;
  setState("sync");
  try {
    const body = { save: ls.get("pol-save"), hof: ls.get("pol-hof") || [], ach: ls.get("pol-ach") || null };
    await setDoc(ref(), { json: JSON.stringify(body), updated: localTs() || Date.now() });
    setState("ok");
  } catch (e) { console.warn(e); setState("err"); }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && pushTimer) push(); });

async function pull() {
  setState("sync");
  try {
    const snap = await getDoc(ref());
    const cloud = snap.exists() ? (() => { try { return { ...JSON.parse(snap.data().json), updated: snap.data().updated || 0 }; } catch { return null; } })() : null;
    const hof = mergeHof(cloud && cloud.hof, ls.get("pol-hof"));
    const ach = mergeAch(cloud && cloud.ach, ls.get("pol-ach"));
    if (cloud && cloud.updated > localTs()) {
      const busy = window.__polBusy && window.__polBusy();
      ls.set("pol-save", cloud.save || null);
      ls.set("pol-hof", hof);
      ls.set("pol-ach", ach);
      try { localStorage.setItem("pol-ts", String(cloud.updated)); } catch {}
      if (window.__polRefresh) window.__polRefresh(busy);
      if (cloud.save) toast("다른 기기에서 하던 판을 불러왔어요. ‘이어하기’로 계속하세요.");
      setState("ok");
    } else {
      ls.set("pol-hof", hof);
      ls.set("pol-ach", ach);
      await push();
    }
  } catch (e) { console.warn(e); setState("err"); }
}

/* ---------- 화면 ---------- */
const bar = document.getElementById("acct");
const dlg = document.getElementById("loginDlg");
const body = document.getElementById("lgBody");
const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function setState(s) { state = s; renderBar(); }
function renderBar() {
  bar.hidden = false;
  if (!user) {
    bar.innerHTML = `<span>로그인하면 다른 기기에서도 이어서 할 수 있어요</span><button type="button" id="acIn">로그인</button>`;
    bar.querySelector("#acIn").onclick = () => openDlg("in");
    return;
  }
  const t = { sync: "저장 중…", ok: "클라우드에 저장됨", err: "저장 실패 · 다시 시도", off: "" }[state];
  bar.innerHTML = `<span class="dot ${state === "ok" ? "on" : ""}" aria-hidden="true"></span><span>${t}</span><button type="button" id="acMe">${esc(user.email || user.displayName || "내 계정")}</button>`;
  bar.querySelector("#acMe").onclick = () => openDlg("me");
  if (state === "err") bar.querySelector("span:nth-child(2)").onclick = pull;
}
let mode = "in", msg = "", ok = false, busy = false;
function openDlg(m) { mode = m; msg = ""; ok = false; renderDlg(); if (!dlg.open) dlg.showModal(); }
function renderDlg() {
  if (mode === "me") {
    body.innerHTML = `<h2 id="lgT">내 계정</h2><p>${esc(user && (user.email || user.displayName))}<br>진행 중인 판과 명예의 전당이 이 계정에 저장돼요.</p>
      <div class="row"><button type="button" id="lgSync">지금 동기화</button><button type="button" id="lgOut">로그아웃</button></div>`;
    body.querySelector("#lgSync").onclick = async () => { await pull(); dlg.close(); };
    body.querySelector("#lgOut").onclick = async () => { if (pushTimer) await push(); await signOut(auth); dlg.close(); };
    return;
  }
  const up = mode === "up";
  body.innerHTML = `<h2 id="lgT">${up ? "회원가입" : "로그인"}</h2><p>로그인하면 휴대폰과 컴퓨터에서 같은 판을 이어서 할 수 있어요.</p>
    <button type="button" class="g" id="lgG" ${busy ? "disabled" : ""}><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.2C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.2A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.2 0-11.5-4.1-13.4-9.8l-8 6.2C6.6 42.6 14.6 48 24 48z"/></svg>Google로 계속하기</button>
    <div class="or">또는 이메일</div>
    <label for="lgE">이메일</label><input id="lgE" type="email" autocomplete="email" inputmode="email">
    <label for="lgP">비밀번호</label><input id="lgP" type="password" autocomplete="${up ? "new-password" : "current-password"}" minlength="6">
    <div class="row"><button type="button" class="pri" id="lgGo" ${busy ? "disabled" : ""}>${up ? "가입하기" : "로그인"}</button></div>
    <div class="msg ${ok ? "ok" : ""}" role="status">${esc(msg)}</div>
    <button type="button" class="link" id="lgSw">${up ? "이미 계정이 있어요 · 로그인" : "처음이에요 · 회원가입"}</button>
    ${up ? "" : `<button type="button" class="link" id="lgR" style="margin-left:12px">비밀번호를 잊었어요</button>`}`;
  const E = body.querySelector("#lgE"), P = body.querySelector("#lgP");
  body.querySelector("#lgG").onclick = google;
  body.querySelector("#lgGo").onclick = () => run(() => (up ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, E.value.trim(), P.value));
  P.onkeydown = (e) => { if (e.key === "Enter") body.querySelector("#lgGo").click(); };
  body.querySelector("#lgSw").onclick = () => { mode = up ? "in" : "up"; msg = ""; renderDlg(); };
  const r = body.querySelector("#lgR");
  if (r) r.onclick = () => { if (!E.value.trim()) { msg = "이메일을 먼저 적어 주세요."; ok = false; renderDlg(); return; }
    run(() => sendPasswordResetEmail(auth, E.value.trim()), "재설정 메일을 보냈어요. 스팸함도 확인해 주세요."); };
}
dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.hasAttribute("data-close")) dlg.close(); });

async function run(fn, okMsg) {
  busy = true; msg = ""; renderDlg();
  try { await setPersistence(auth, browserLocalPersistence); await fn(); msg = okMsg || ""; ok = !!okMsg; if (!okMsg) dlg.close(); }
  catch (e) { msg = messageFor(e); ok = false; }
  finally { busy = false; if (dlg.open) renderDlg(); }
}
async function google() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  busy = true; renderDlg();
  try { await setPersistence(auth, browserLocalPersistence); await signInWithPopup(auth, provider); dlg.close(); }
  catch (e) {
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
      try { await signInWithRedirect(auth, provider); return; } catch (e2) { msg = messageFor(e2); }
    } else msg = messageFor(e);
  } finally { busy = false; if (dlg.open) renderDlg(); }
}
function messageFor(err) {
  const code = (err && err.code) || "";
  if (code === "auth/unauthorized-domain") return "Firebase 승인된 도메인에 이 사이트 주소가 없어요.";
  if (code === "auth/network-request-failed") return "인터넷 연결을 확인하고 다시 시도해 주세요.";
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-login-credentials"].includes(code))
    return "이메일 또는 비밀번호가 맞지 않아요. 처음이면 ‘회원가입’에서 계정을 만들어 주세요.";
  if (code === "auth/email-already-in-use") return "이미 가입된 이메일이에요. 로그인해 주세요.";
  if (code === "auth/weak-password") return "비밀번호는 6자 이상이어야 해요.";
  if (code === "auth/invalid-email") return "이메일 주소를 확인해 주세요.";
  if (code === "auth/too-many-requests") return "시도가 너무 많아 잠시 막혔어요. 몇 분 뒤 다시 시도해 주세요.";
  if (code === "auth/account-exists-with-different-credential") return "이 이메일은 다른 방법으로 가입되어 있어요.";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "";
  return "로그인하지 못했어요 (" + (code || "알 수 없는 오류") + ").";
}
function toast(t) {
  const d = document.createElement("div");
  d.textContent = t; d.setAttribute("role", "status");
  d.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1D2A44;color:#fff;padding:10px 16px;border-radius:10px;font:14px/1.4 'IBM Plex Sans KR',sans-serif;z-index:50;max-width:calc(100vw - 32px);box-shadow:0 8px 24px rgba(0,0,0,.25)";
  document.body.appendChild(d); setTimeout(() => d.remove(), 4200);
}

renderBar();
getRedirectResult(auth).catch((e) => { msg = messageFor(e); });
onAuthStateChanged(auth, (u) => {
  user = u;
  if (u) pull(); else setState("off");
});
