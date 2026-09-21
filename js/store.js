/**
 * League data lives in this browser, and can also publish to the live site.
 * Seed is only the first-run default. Admin edits are the source of truth.
 */

import { SEED } from "./seed.js?v=23";

const DATA_KEY = "ssl_league_fret";
const OLD_KEYS = ["ssl_league_fret_v7", "ssl_league_fret_v6", "ssl_league_fret_v5", "ssl_league_fret_v4", "ssl_league_fret_v3"];
const ADMIN_KEY = "ssl_admin_v1";
const SESSION_KEY = "ssl_admin_session";
const TOKEN_KEY = "ssl_fret_github_token";
const LIVE_FILE = "data/league.json";
const LIVE_REPO = "cgoldstein27-maker/fret-footy";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function parseJson(raw) {
  try {
    return JSON.parse(raw || "null");
  } catch {
    return null;
  }
}

function looksLikeLeague(obj) {
  return !!(obj && Array.isArray(obj.teams) && obj.teams.length);
}

function isCustomized(saved, seed) {
  if (!looksLikeLeague(saved)) return false;
  if ((saved.players || []).length !== (seed.players || []).length) return true;
  if ((saved.videos || []).length) return true;
  if ((saved.teams || []).length !== (seed.teams || []).length) return true;
  const savedIds = (saved.players || []).map((p) => p.id).sort().join(",");
  const seedIds = (seed.players || []).map((p) => p.id).sort().join(",");
  if (savedIds !== seedIds) return true;
  if (saved.home?.news?.title && saved.home.news.title !== seed.home?.news?.title) return true;
  if (saved.home?.spot?.title && saved.home.spot.title !== seed.home?.spot?.title) return true;
  return false;
}

function readLocal() {
  const seed = clone(SEED);
  for (const key of [DATA_KEY, ...OLD_KEYS]) {
    const saved = parseJson(localStorage.getItem(key));
    if (!looksLikeLeague(saved)) continue;
    if (!saved.updatedAt && isCustomized(saved, seed)) saved.updatedAt = Date.now();
    if (key !== DATA_KEY) {
      localStorage.setItem(DATA_KEY, JSON.stringify(saved));
    }
    return saved;
  }
  return null;
}

function mergeHome(seed, saved) {
  const fallback = seed.home || {};
  const extra = saved?.home || {};
  return {
    news: { ...(fallback.news || {}), ...(extra.news || {}) },
    spot: { ...(fallback.spot || {}), ...(extra.spot || {}) },
  };
}

function hydrate(base) {
  const seed = clone(SEED);
  const saved = base && looksLikeLeague(base) ? base : seed;
  return {
    ...seed,
    ...saved,
    teams: saved.teams?.length ? saved.teams : seed.teams,
    players: saved.players?.length ? saved.players : seed.players,
    games: saved.games?.length ? saved.games : seed.games,
    powerRankings: saved.powerRankings?.length ? saved.powerRankings : seed.powerRankings,
    news: saved.news || seed.news || [],
    home: mergeHome(seed, saved),
    videos: saved.videos || seed.videos || [],
    updatedAt: saved.updatedAt || 0,
  };
}

function newer(a, b) {
  return (Number(a?.updatedAt) || 0) >= (Number(b?.updatedAt) || 0) ? a : b;
}

function choose(local, remote) {
  const seed = hydrate(clone(SEED));
  const loc = looksLikeLeague(local) ? hydrate(local) : null;
  const rem = looksLikeLeague(remote) ? hydrate(remote) : null;
  if (loc && rem) {
    if ((loc.updatedAt || 0) || (rem.updatedAt || 0)) return hydrate(newer(loc, rem));
    return loc;
  }
  return loc || rem || seed;
}

async function fetchRemote() {
  try {
    const res = await fetch(`${LIVE_FILE}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function loadLeagueSync() {
  return choose(readLocal(), null);
}

export async function loadLeague() {
  const data = choose(readLocal(), await fetchRemote());
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  return data;
}

export function saveLeague(data) {
  data.updatedAt = Date.now();
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  queuePublish(data);
  return data;
}

export function resetLeague() {
  localStorage.removeItem(DATA_KEY);
  OLD_KEYS.forEach((key) => localStorage.removeItem(key));
  return clone(SEED);
}

export function hasGithubToken() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function setGithubToken(token) {
  const value = String(token || "").trim();
  if (!value) {
    localStorage.removeItem(TOKEN_KEY);
    return { ok: false, error: "Paste a GitHub token first." };
  }
  localStorage.setItem(TOKEN_KEY, value);
  return { ok: true };
}

export function clearGithubToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

let publishTimer = null;
let publishChain = Promise.resolve();

function queuePublish(data) {
  if (!hasGithubToken()) return;
  clearTimeout(publishTimer);
  publishTimer = setTimeout(() => {
    publishChain = publishChain.then(() => publishLive(data)).catch(() => {});
  }, 1200);
}

async function githubHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function publishLive(data) {
  if (!hasGithubToken()) return { ok: false, skipped: true };
  const payload = clone(data);
  delete payload.githubToken;
  const body = JSON.stringify(payload, null, 2);
  const headers = await githubHeaders();
  const url = `https://api.github.com/repos/${LIVE_REPO}/contents/${LIVE_FILE}`;
  let sha;
  const current = await fetch(`${url}?ref=main`, { headers });
  if (current.ok) {
    const json = await current.json();
    sha = json.sha;
  } else if (current.status !== 404) {
    return { ok: false, error: "Could not reach GitHub. Check the token." };
  }
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update live league data from admin",
      content: toBase64(body),
      sha,
      branch: "main",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.message || "Live publish failed." };
  }
  return { ok: true };
}

export function hasAdmin() {
  return !!localStorage.getItem(ADMIN_KEY);
}

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setAdminPassword(password) {
  if (String(password || "").length < 4) return { ok: false, error: "Use at least 4 characters." };
  localStorage.setItem(ADMIN_KEY, await hash(password));
  sessionStorage.setItem(SESSION_KEY, "1");
  return { ok: true };
}

export async function loginAdmin(password) {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) return { ok: false, error: "No admin password yet." };
  const raw = String(password ?? "");
  const options = [...new Set([raw, raw.trim()].filter((p) => p.length > 0))];
  if (!options.length) return { ok: false, error: "Wrong password." };
  for (const p of options) {
    if ((await hash(p)) === stored) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return { ok: true };
    }
  }
  return { ok: false, error: "Wrong password." };
}

export function clearAdminPassword() {
  localStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdmin() {
  return sessionStorage.getItem(SESSION_KEY) === "1" && hasAdmin();
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function standings(data) {
  const rows = data.teams.map((t) => ({
    ...t,
    gp: 0, w: 0, l: 0, d: 0, gf: 0, ga: 0, gd: 0, pts: 0,
  }));
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  for (const g of data.games) {
    if (!g.played) continue;
    const home = byId[g.homeId];
    const away = byId[g.awayId];
    if (!home || !away) continue;
    home.gp += 1;
    away.gp += 1;
    home.gf += Number(g.home) || 0;
    home.ga += Number(g.away) || 0;
    away.gf += Number(g.away) || 0;
    away.ga += Number(g.home) || 0;
    if (g.home > g.away) {
      home.w += 1;
      away.l += 1;
      home.pts += 3;
    } else if (g.home < g.away) {
      away.w += 1;
      home.l += 1;
      away.pts += 3;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }
  for (const r of rows) r.gd = r.gf - r.ga;
  rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
  rows.forEach((r, i) => { r.place = i + 1; });
  return rows;
}

export function teamById(data, id) {
  return data.teams.find((t) => t.id === id);
}

export function latestPower(data) {
  return [...(data.powerRankings || [])].sort((a, b) => b.week - a.week)[0] || null;
}

export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

const DB_NAME = "ssl_videos";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVideoFile(id, file) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(file, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadVideoFile(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const req = tx.objectStore("files").get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export function youtubeId(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] || null;
}
