/**
 * Saves league data on this computer and keeps the admin password.
 * Viewers see whatever is stored here. Export the JSON if you want a backup.
 */

import { SEED } from "./seed.js?v=17";

const DATA_KEY = "ssl_league_fret_v6";
const ADMIN_KEY = "ssl_admin_v1";
const SESSION_KEY = "ssl_admin_session";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeGames(seedGames, savedGames) {
  const savedById = Object.fromEntries((savedGames || []).map((g) => [g.id, g]));
  return seedGames.map((g) => {
    if (g.played) return { ...g };
    const s = savedById[g.id];
    if (!s) return g;
    return {
      ...g,
      home: s.home,
      away: s.away,
      played: s.played,
      predHome: s.predHome ?? g.predHome,
      predAway: s.predAway ?? g.predAway,
    };
  });
}

export function loadLeague() {
  const seed = clone(SEED);
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(DATA_KEY) || "{}") || {};
  } catch {
    saved = {};
  }
  const seedTeamIds = new Set(seed.teams.map((t) => t.id));
  const drop = new Set(["team2", "team3", "team4"]);
  const extraTeams = (saved.teams || []).filter((t) => !seedTeamIds.has(t.id) && !drop.has(t.id));
  const seedPlayerIds = new Set(seed.players.map((p) => p.id));
  const extraPlayers = (saved.players || []).filter((p) => !seedPlayerIds.has(p.id) && !drop.has(p.teamId));
  const data = {
    ...seed,
    ...saved,
    leagueName: seed.leagueName,
    teams: [...seed.teams, ...extraTeams],
    players: [...seed.players, ...extraPlayers],
    games: mergeGames(seed.games, saved.games),
    powerRankings: seed.powerRankings,
    news: seed.news || [],
    videos: saved.videos || seed.videos,
  };
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  return data;
}

export function saveLeague(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  return data;
}

export function resetLeague() {
  localStorage.removeItem(DATA_KEY);
  return clone(SEED);
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
  if ((await hash(password)) !== stored) return { ok: false, error: "Wrong password." };
  sessionStorage.setItem(SESSION_KEY, "1");
  return { ok: true };
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
