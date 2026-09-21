/**
 * Public league site + a private admin desk for stats and videos.
 */
import {
  loadLeague, saveLeague, resetLeague, hasAdmin, setAdminPassword, loginAdmin,
  isAdmin, logoutAdmin, clearAdminPassword, standings, teamById, latestPower, uid, saveVideoFile,
  loadVideoFile, youtubeId,
} from "./store.js?v=22";

const app = document.getElementById("app");
const ui = {
  view: (location.hash.replace("#", "") || "home"),
  adminTab: "home",
  teamId: null,
  playerId: null,
  toast: null,
  powerWeek: null,
};

let data = loadLeague();

function persist() {
  saveLeague(data);
}

window.addEventListener("hashchange", () => {
  ui.view = location.hash.replace("#", "") || "home";
  render();
});

function go(view) {
  ui.view = view;
  location.hash = view === "home" ? "" : view;
  render();
}

function toast(msg) {
  ui.toast = msg;
  render();
  setTimeout(() => { ui.toast = null; render(); }, 2600);
}

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function crest(team, size = "") {
  if (!team) return "";
  if (team.logo) {
    return `<span class="crest logo ${size}" title="${esc(team.name)}" style="--crest:${esc(team.color)}"><img alt="${esc(team.name)}" src="${esc(team.logo)}" /></span>`;
  }
  const ring = team.color2 ? `box-shadow: inset 0 0 0 2px ${team.color2}` : "";
  return `<span class="crest ${size}" style="background:${team.color};${ring}">${esc(team.short)}</span>`;
}

function header() {
  const views = [
    ["home", "Home"],
    ["standings", "Standings"],
    ["players", "Players"],
    ["schedule", "Schedule"],
    ["rankings", "Power rankings"],
    ["videos", "Videos"],
  ];
  return `
    <header class="site-header">
      <button class="brand" data-act="nav" data-view="home">
        <span class="brand-mark"><img alt="Fret Footy" src="img/fret-footy-logo.jpg" /></span>
        <span>
          <small>${esc(data.season)} season</small>
          <strong>${esc(data.leagueName)}</strong>
        </span>
      </button>
      <nav class="nav">
        ${views.map(([id, label]) => `<button class="${ui.view === id ? "active" : ""}" data-act="nav" data-view="${id}">${label}</button>`).join("")}
        <button class="${ui.view === "admin" ? "active" : ""}" data-act="nav" data-view="admin">Admin</button>
      </nav>
    </header>`;
}

function render() {
  const page = {
    home: viewHome,
    standings: viewStandings,
    players: viewPlayers,
    schedule: viewSchedule,
    rankings: viewRankings,
    videos: viewVideos,
    admin: viewAdmin,
  }[ui.view] || viewHome;
  app.innerHTML = header() + `<main class="wrap">${page()}</main>` + (ui.toast ? `<div class="toast">${esc(ui.toast)}</div>` : "") + (ui.playerId ? playerModal() : "");
  bind();
  if (ui.view === "videos") hydrateVideos();
}

function bind() {
  app.onclick = (e) => {
    if (e.target.closest("input, textarea, select, option, label")) return;
    const el = e.target.closest("[data-act]");
    if (!el || el.tagName === "FORM") return;
    if (el.dataset.act?.startsWith("close") && e.target.closest("[data-stop]") && e.target !== el) return;
    handle(el.dataset.act, el);
  };
  app.onchange = (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.tagName === "FORM") return;
    handle(el.dataset.act, el);
  };
  app.onsubmit = (e) => {
    const form = e.target.closest("form[data-act]");
    if (!form) return;
    e.preventDefault();
    handle(form.dataset.act, form);
  };
}

function val(form, name) {
  if (form?.tagName === "FORM") {
    const fd = new FormData(form);
    if (fd.has(name)) return String(fd.get(name) ?? "").trim();
  }
  return form?.querySelector?.(`[name="${name}"]`)?.value?.trim() || "";
}

function passwordFrom(el) {
  return el?.querySelector?.('[name="password"]')?.value ?? val(el, "password");
}

async function handle(act, el) {
  const actions = {
    nav: () => go(el.dataset.view),
    team: () => { ui.teamId = el.dataset.id || null; go("players"); },
    player: () => { ui.playerId = el.dataset.id; render(); },
    "close-modal": () => { ui.playerId = null; render(); },
    "power-week": () => { ui.powerWeek = Number(el.dataset.id || el.value); render(); },
    "admin-tab": () => { ui.adminTab = el.dataset.id; render(); },
    "admin-setup": async () => {
      const res = await setAdminPassword(passwordFrom(el));
      toast(res.ok ? "Admin password saved. You are in." : res.error);
      render();
    },
    "admin-login": async () => {
      const res = await loginAdmin(passwordFrom(el));
      toast(res.ok ? "Welcome back." : res.error);
      render();
    },
    "admin-reset": () => {
      if (!confirm("Clear the saved admin password on this browser so you can set a new one?")) return;
      clearAdminPassword();
      toast("Password cleared. Set a new one.");
      render();
    },
    "admin-logout": () => { logoutAdmin(); go("home"); },
    "save-league": () => {
      data.leagueName = val(el, "leagueName") || data.leagueName;
      data.season = val(el, "season") || data.season;
      data.week = Number(val(el, "week")) || data.week;
      persist();
      toast("League info saved.");
    },
    "add-team": () => {
      const name = val(el, "name");
      if (!name) return toast("Need a team name.");
      data.teams.push({
        id: uid("t"),
        name,
        short: (val(el, "short") || name.slice(0, 3)).toUpperCase().slice(0, 3),
        color: val(el, "color") || "#145c3a",
      });
      persist();
      toast("Team added.");
    },
    "add-player": () => {
      const name = val(el, "name");
      if (!name) return toast("Need a player name.");
      data.players.push({
        id: uid("p"),
        name,
        teamId: val(el, "teamId"),
        pos: val(el, "pos") || "CM",
        ovr: Number(val(el, "ovr")) || 70,
        pace: Number(val(el, "pace")) || 70,
        shoot: Number(val(el, "shoot")) || 70,
        pass: Number(val(el, "pass")) || 70,
        defend: Number(val(el, "defend")) || 70,
        gk: Number(val(el, "gk")) || 20,
        gp: Number(val(el, "gp")) || 0,
        goals: Number(val(el, "goals")) || 0,
        assists: Number(val(el, "assists")) || 0,
        saves: Number(val(el, "saves")) || 0,
      });
      persist();
      toast("Player added.");
    },
    "add-game": () => {
      data.games.push({
        id: uid("g"),
        week: Number(val(el, "week")) || data.week,
        date: val(el, "date"),
        homeId: val(el, "homeId"),
        awayId: val(el, "awayId"),
        home: null,
        away: null,
        played: false,
        predHome: Number(val(el, "predHome")) || 0,
        predAway: Number(val(el, "predAway")) || 0,
      });
      persist();
      toast("Match added to the schedule.");
    },
    "save-score": () => {
      const g = data.games.find((x) => x.id === el.dataset.id);
      if (!g) return;
      const home = el.querySelector('[name="home"]').value;
      const away = el.querySelector('[name="away"]').value;
      if (home === "" || away === "") {
        g.played = false;
        g.home = null;
        g.away = null;
      } else {
        g.played = true;
        g.home = Number(home);
        g.away = Number(away);
      }
      persist();
      toast("Score saved. Standings updated.");
    },
    "save-pred": () => {
      const g = data.games.find((x) => x.id === el.dataset.id);
      if (!g) return;
      g.predHome = Number(el.querySelector('[name="predHome"]').value);
      g.predAway = Number(el.querySelector('[name="predAway"]').value);
      persist();
      toast("Prediction saved.");
    },
    "save-power": () => {
      const week = Number(val(el, "week")) || data.week;
      const ranks = data.teams.map((t) => ({
        teamId: t.id,
        rank: Number(el.querySelector(`[name="rank-${t.id}"]`)?.value) || 99,
        prev: Number(el.querySelector(`[name="prev-${t.id}"]`)?.value) || 99,
        note: el.querySelector(`[name="note-${t.id}"]`)?.value || "",
      })).sort((a, b) => a.rank - b.rank);
      const existing = data.powerRankings.find((p) => p.week === week);
      const entry = { week, blurb: val(el, "blurb"), ranks };
      if (existing) Object.assign(existing, entry);
      else data.powerRankings.push(entry);
      persist();
      toast(`Week ${week} power rankings published.`);
    },
    "save-home-news": () => {
      data.home = data.home || { news: {}, spot: {} };
      data.home.news = {
        heading: val(el, "heading") || "News",
        kicker: val(el, "kicker"),
        title: val(el, "title"),
        body: val(el, "body"),
      };
      persist();
      toast("News card published.");
    },
    "save-home-spot": () => {
      data.home = data.home || { news: {}, spot: {} };
      const teamId = val(el, "teamId");
      const team = teamById(data, teamId);
      data.home.spot = {
        heading: val(el, "heading") || "#1 this week",
        teamId,
        title: val(el, "title") || team?.name || "",
        body: val(el, "body"),
      };
      persist();
      toast("Spotlight card published.");
    },
    "add-video": async () => {
      const title = val(el, "title");
      if (!title) return toast("Need a video title.");
      const id = uid("v");
      const file = el.querySelector('[name="file"]')?.files?.[0];
      const rec = {
        id,
        title,
        week: Number(val(el, "week")) || data.week,
        url: val(el, "url"),
        note: val(el, "note"),
        hasFile: !!file,
      };
      if (file) await saveVideoFile(id, file);
      data.videos.unshift(rec);
      persist();
      toast("Video posted for viewers.");
    },
    export: () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "league.json";
      a.click();
    },
    "import-data": async () => {
      const file = el.querySelector('[name="file"]')?.files?.[0];
      if (!file) return toast("Choose a JSON file first.");
      try {
        data = { ...data, ...JSON.parse(await file.text()) };
        persist();
        toast("League file loaded.");
      } catch {
        toast("That file is not valid league JSON.");
      }
    },
    reset: () => {
      if (!confirm("Wipe custom data and restore the sample league?")) return;
      data = resetLeague();
      toast("Sample league restored.");
    },
  };
  if (actions[act]) await actions[act]();
}

function viewHome() {
  const table = standings(data).slice(0, 4);
  const upcoming = data.games.filter((g) => !g.played).slice(0, 3);
  const news = data.home?.news || {};
  const spot = data.home?.spot || {};
  const spotTeam = teamById(data, spot.teamId);
  return `
    <section class="hero">
      <div class="hero-main">
        <div class="kicker">Week ${data.week}</div>
        <h1>${esc(data.leagueName)}</h1>
        <p class="sub">Standings, player overalls, the weekly slate, and power rankings — updated from the admin desk.</p>
        <p class="muted" style="margin-top:16px">${data.teams.map((t) => `${t.name}`).join(" · ")}</p>
      </div>
      <div class="hero-side">
        <div class="card">
          <h3>${esc(news.heading || "News")}</h3>
          ${news.kicker || news.title || news.body ? `
            ${news.kicker ? `<div class="kicker">${esc(news.kicker)}</div>` : ""}
            ${news.title ? `<div>${esc(news.title)}</div>` : ""}
            ${news.body ? `<div class="muted">${esc(news.body)}</div>` : ""}
          ` : `<p class="muted">Update this card in Admin → Home.</p>`}
        </div>
        <div class="card">
          <h3>${esc(spot.heading || "#1 this week")}</h3>
          ${spot.title || spot.body || spotTeam ? `
            <div>${spotTeam ? crest(spotTeam) : ""}${esc(spot.title || spotTeam?.name || "")}</div>
            ${spot.body ? `<div class="muted">${esc(spot.body)}</div>` : ""}
          ` : `<p class="muted">Update this card in Admin → Home.</p>`}
        </div>
      </div>
    </section>
    <div class="grid two">
      <div class="card">
        <h3>Table</h3>
        ${standingsTable(table)}
        <p class="faint" style="margin-top:10px"><button class="btn small" data-act="nav" data-view="standings">Full standings</button></p>
      </div>
      <div class="card">
        <h3>Next matches</h3>
        ${upcoming.length ? upcoming.map(matchRow).join("") : `<p class="muted">No upcoming games yet.</p>`}
      </div>
    </div>`;
}

function standingsTable(rows) {
  return `<table>
    <thead><tr><th>#</th><th>Team</th><th class="num">GP</th><th class="num">W</th><th class="num">D</th><th class="num">L</th><th class="num">GD</th><th class="num">Pts</th></tr></thead>
    <tbody>
      ${rows.map((t) => `<tr class="clickable" data-act="team" data-id="${t.id}">
        <td>${t.place}</td>
        <td>${crest(t)}${esc(t.name)}</td>
        <td class="num">${t.gp}</td><td class="num">${t.w}</td><td class="num">${t.d}</td><td class="num">${t.l}</td>
        <td class="num">${t.gd > 0 ? "+" : ""}${t.gd}</td>
        <td class="num"><strong>${t.pts}</strong></td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function viewStandings() {
  return `<div class="kicker">League table</div><h1>Standings</h1>
    <p class="muted">Sorted by points, then goal difference. Click a club for its roster.</p>
    <div class="card" style="margin-top:16px">${standingsTable(standings(data))}</div>`;
}

function ovrLabel(p) {
  return p.ovr == null ? "?" : p.ovr;
}

function viewPlayers() {
  const team = ui.teamId ? teamById(data, ui.teamId) : null;
  let list = [...data.players];
  if (team) list = list.filter((p) => p.teamId === team.id);
  list.sort((a, b) => (b.ovr ?? -1) - (a.ovr ?? -1));
  const leaders = [...data.players].sort((a, b) => (b.goals || 0) - (a.goals || 0) || (b.assists || 0) - (a.assists || 0)).slice(0, 5);
  return `
    <div class="kicker">${team ? esc(team.name) : "League"}</div>
    <h1>${team?.logo ? `${crest(team, "lg")} ` : ""}Players & overalls</h1>
    ${team?.coach ? `<p class="muted">${esc(team.coachTitle || "Coach")}: ${esc(team.coach)}</p>` : ""}
    <div class="tabs" style="margin-top:14px">
      <button class="tab ${!ui.teamId ? "active" : ""}" data-act="team" data-id="">All clubs</button>
      ${data.teams.map((t) => `<button class="tab ${ui.teamId === t.id ? "active" : ""}" data-act="team" data-id="${t.id}">${crest(t)} ${esc(t.name)}</button>`).join("")}
    </div>
    <div class="grid two">
      <div class="grid">
        ${list.map((p) => {
          const t = teamById(data, p.teamId);
          return `<div class="player-card" data-act="player" data-id="${p.id}">
            <span class="ovr">${ovrLabel(p)}</span>
            <span class="pos">${esc(p.pos)}</span>
            <div>
              <strong>${esc(p.name)}</strong>${p.aka ? ` <span class="faint">“${esc(p.aka)}”</span>` : ""}
              ${p.ineligible ? `<div class="ineligible">Currently ineligible</div>` : ""}
              <div class="faint">${esc(t?.name)} · ${p.goals || 0} G · ${p.assists || 0} A${p.note && !p.ineligible ? ` · ${esc(p.note)}` : ""}</div>
            </div>
          </div>`;
        }).join("")}
      </div>
      <div class="card">
        <h3>Scoring leaders</h3>
        <table>${leaders.map((p, i) => `<tr class="clickable" data-act="player" data-id="${p.id}"><td>${i + 1}</td><td>${esc(p.name)}</td><td class="num">${p.goals || 0}</td><td class="num">${p.assists || 0}</td></tr>`).join("")}</table>
      </div>
    </div>`;
}

function playerModal() {
  const p = data.players.find((x) => x.id === ui.playerId);
  if (!p) return "";
  const t = teamById(data, p.teamId);
  const bars = [
    ["Offence", p.offence],
    ["Pace", p.pace],
    ["Shooting", p.shoot],
    ["Passing", p.pass],
    ["Defense", p.defend],
    ["GK", p.gk],
    ["Touch", p.touch],
    ["Vision", p.vision],
    ["Finishing", p.finishing],
    ["Skill", p.skill],
    ["Compete", p.compete],
    ["IQ", p.iq],
    ["Anger", p.anger],
  ].filter(([, v]) => v != null);
  return `<div class="modal-bg" data-act="close-modal"><div class="modal" data-stop="1">
    <div class="kicker">${esc(t?.name)} · ${esc(p.pos)}${t?.coach ? ` · ${esc(t.coachTitle || "Coach")} ${esc(t.coach)}` : ""}</div>
    <h2>${esc(p.name)} ${p.aka ? `<span class="faint">“${esc(p.aka)}”</span>` : ""} <span class="ovr">${ovrLabel(p)}</span></h2>
    ${p.ineligible ? `<p class="ineligible">Currently ineligible</p>` : ""}
    <p class="muted">${p.gp || 0} GP · ${p.goals || 0} goals · ${p.assists || 0} assists${p.saves ? ` · ${p.saves} saves` : ""}</p>
    ${p.note ? `<p class="muted">${esc(p.note)}</p>` : ""}
    <div class="attrs" style="margin-top:14px">
      ${bars.map(([k, v]) => `<span>${k}</span><div class="bar"><i style="width:${clamp(v)}%"></i></div>`).join("")}
    </div>
    <div style="margin-top:16px;text-align:right"><button class="btn" data-act="close-modal">Close</button></div>
  </div></div>`;
}

function clamp(n) {
  return Math.max(0, Math.min(100, Number(n) || 0));
}

function formatMatchDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

function matchRow(g) {
  const home = teamById(data, g.homeId);
  const away = teamById(data, g.awayId);
  return `<div class="match">
    <div class="side">${crest(home)} ${esc(home?.name)}</div>
    <div class="score">vs</div>
    <div class="side away">${esc(away?.name)} ${crest(away)}</div>
  </div>
  <div class="faint">${g.label ? `${esc(g.label)} · ` : ""}${esc(formatMatchDate(g.date))}</div>`;
}

function viewSchedule() {
  const weeks = [...new Set(data.games.map((g) => g.week))].sort((a, b) => a - b);
  return `<div class="kicker">2026 season</div><h1>Schedule</h1>
    <p class="muted">Every team plays each Sunday and Wednesday. 12 games a side. Season starts September 21.</p>
    ${weeks.map((w) => {
      const games = data.games.filter((g) => g.week === w);
      const days = [...new Set(games.map((g) => g.date))];
      return `<div class="card" style="margin-top:14px">
        <h3>Week ${w}</h3>
        ${days.map((day) => `
          <div class="muted" style="margin-top:12px">${esc(formatMatchDate(day))}</div>
          ${games.filter((g) => g.date === day).map(matchRow).join("")}
        `).join("")}
      </div>`;
    }).join("")}`;
}

function viewRankings() {
  const weeks = [...data.powerRankings].sort((a, b) => b.week - a.week);
  const selected = weeks.find((w) => w.week === (ui.powerWeek || weeks[0]?.week)) || weeks[0];
  if (!selected) return `<h1>Power rankings</h1><p class="muted">No weekly rankings yet. Publish them from Admin.</p>`;
  const upcoming = data.games.filter((g) => !g.played);
  return `
    <div class="kicker">Week ${selected.week}</div>
    <h1>Power rankings</h1>
    <p class="muted">${esc(selected.blurb)}</p>
    <div class="tabs" style="margin-top:12px">
      ${weeks.map((w) => `<button class="tab ${w.week === selected.week ? "active" : ""}" data-act="power-week" data-id="${w.week}">Week ${w.week}</button>`).join("")}
    </div>
    <div class="card">
      ${selected.ranks.map((r) => {
        const t = teamById(data, r.teamId);
        const delta = r.prev - r.rank;
        const move = delta > 0 ? `<span class="move up">▲ ${delta}</span>` : delta < 0 ? `<span class="move down">▼ ${Math.abs(delta)}</span>` : `<span class="muted">—</span>`;
        return `<div class="rank-row">
          <div class="rank-num">${r.rank}</div>
          <div>${crest(t)}<strong>${esc(t?.name)}</strong><div class="faint">${esc(r.note)}</div></div>
          <div>${move}</div>
        </div>`;
      }).join("")}
    </div>
    <div class="card" style="margin-top:14px">
      <h3>Upcoming matches</h3>
      ${upcoming.map((g) => {
        const home = teamById(data, g.homeId);
        const away = teamById(data, g.awayId);
        return `<div class="match">
          <div class="side">${crest(home)}${esc(home?.name)}</div>
          <div class="score">vs</div>
          <div class="side away">${esc(away?.name)}${crest(away)}</div>
        </div>`;
      }).join("") || `<p class="muted">No upcoming games to pick.</p>`}
    </div>`;
}

function viewVideos() {
  if (!data.videos.length) return `<h1>Videos</h1><p class="muted">Highlights show up here after they are added in Admin.</p>`;
  return `<div class="kicker">Film room</div><h1>Videos</h1>
    <div class="grid two" style="margin-top:16px">
      ${data.videos.map((v) => `
        <div class="card" data-vid="${v.id}">
          <h3>${esc(v.title)}</h3>
          <div class="faint">Week ${v.week}</div>
          <div class="video-slot" style="margin-top:10px">${v.url && youtubeId(v.url)
            ? `<iframe class="video-frame" src="https://www.youtube.com/embed/${youtubeId(v.url)}" allowfullscreen></iframe>`
            : v.url ? `<p><a href="${esc(v.url)}" target="_blank" rel="noopener">Open clip</a></p>`
            : `<p class="muted">${esc(v.note || "Video file loads if you uploaded one on this computer.")}</p>`}</div>
        </div>`).join("")}
    </div>`;
}

async function hydrateVideos() {
  for (const v of data.videos) {
    if (!v.hasFile) continue;
    const file = await loadVideoFile(v.id);
    if (!file) continue;
    const slot = app.querySelector(`[data-vid="${v.id}"] .video-slot`);
    if (!slot) continue;
    const url = URL.createObjectURL(file);
    slot.innerHTML = `<video class="video-local" controls src="${url}"></video>`;
  }
}

function viewAdmin() {
  if (!hasAdmin()) {
    return `<div class="card admin-login">
      <div class="kicker">First time</div>
      <h1>Set admin password</h1>
      <p class="muted">This is your private desk. Viewers never see this page unless they know the password.</p>
      <form class="grid" style="margin-top:16px" data-act="admin-setup" autocomplete="on">
        <label class="field">Password <input name="password" type="password" required minlength="4" autocomplete="new-password" /></label>
        <button class="btn gold" type="submit">Create admin access</button>
      </form>
    </div>`;
  }
  if (!isAdmin()) {
    return `<div class="card admin-login">
      <div class="kicker">Private</div>
      <h1>Admin login</h1>
      <form class="grid" style="margin-top:16px" data-act="admin-login" autocomplete="on">
        <label class="field">Password <input name="password" id="admin-password" type="password" required autocomplete="current-password" /></label>
        <button class="btn gold" type="submit">Log in</button>
      </form>
      <p class="faint" style="margin-top:14px">The password lives only in this browser. The live site and localhost are separate logins.</p>
      <p style="margin-top:10px"><button class="btn ghost" type="button" data-act="admin-reset">Reset password</button></p>
    </div>`;
  }
  const tabs = [
    ["home", "Home cards"],
    ["league", "League"],
    ["teams", "Teams"],
    ["players", "Players"],
    ["games", "Scores"],
    ["rankings", "Rankings"],
    ["videos", "Videos"],
  ];
  return `
    <div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap">
      <div><div class="kicker">Private desk</div><h1>Upload stats & film</h1></div>
      <button class="btn ghost" data-act="admin-logout">Log out</button>
    </div>
    <div class="tabs" style="margin-top:16px">
      ${tabs.map(([id, l]) => `<button class="tab ${ui.adminTab === id ? "active" : ""}" data-act="admin-tab" data-id="${id}">${l}</button>`).join("")}
    </div>
    ${adminPanels()[ui.adminTab] || adminPanels().games}`;
}

function teamOptions(selected, includeBlank = false) {
  const blank = includeBlank ? `<option value="">None</option>` : "";
  return blank + data.teams.map((t) => `<option value="${t.id}" ${t.id === selected ? "selected" : ""}>${esc(t.name)}</option>`).join("");
}

function adminPanels() {
  const news = data.home?.news || {};
  const spot = data.home?.spot || {};
  return {
    home: `
      <div class="card">
        <h3>News card</h3>
        <p class="faint">This is the top-right card on Home. Edit any line, hit publish, and it updates on the homepage.</p>
        <form class="form-grid" style="margin-top:12px" data-act="save-home-news">
          <label class="field">Card title <input name="heading" value="${esc(news.heading || "News")}" /></label>
          <label class="field">Kicker <input name="kicker" value="${esc(news.kicker || "")}" placeholder="GAMEDAY" /></label>
          <label class="field span">Headline <input name="title" value="${esc(news.title || "")}" /></label>
          <label class="field span">Body <textarea name="body" rows="5">${esc(news.body || "")}</textarea></label>
          <div><button class="btn gold" type="submit">Publish news</button></div>
        </form>
      </div>
      <div class="card" style="margin-top:14px">
        <h3>Spotlight card</h3>
        <p class="faint">This is the card under News. Heading, team crest, name, and write-up are all yours.</p>
        <form class="form-grid" style="margin-top:12px" data-act="save-home-spot">
          <label class="field">Card title <input name="heading" value="${esc(spot.heading || "#1 this week")}" /></label>
          <label class="field">Team crest <select name="teamId">${teamOptions(spot.teamId, true)}</select></label>
          <label class="field span">Headline <input name="title" value="${esc(spot.title || "")}" /></label>
          <label class="field span">Body <textarea name="body" rows="4">${esc(spot.body || "")}</textarea></label>
          <div><button class="btn gold" type="submit">Publish spotlight</button></div>
        </form>
      </div>`,
    league: `
      <div class="card">
        <form class="form-grid" data-act="save-league">
          <label class="field">League name <input name="leagueName" value="${esc(data.leagueName)}" /></label>
          <label class="field">Season <input name="season" value="${esc(data.season)}" /></label>
          <label class="field">Current week <input name="week" type="number" value="${data.week}" /></label>
          <div><button class="btn gold" type="submit">Save</button></div>
        </form>
        <div style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" data-act="export">Download backup JSON</button>
          <form data-act="import-data" style="display:flex;gap:8px;align-items:end">
            <label class="field">Import JSON <input name="file" type="file" accept="application/json" /></label>
            <button class="btn" type="submit">Load</button>
          </form>
          <button class="btn danger" data-act="reset">Reset sample data</button>
        </div>
        <p class="faint" style="margin-top:12px">This computer stores the live league. Download a backup if you want to move it.</p>
      </div>`,
    teams: `
      <div class="card">
        <form class="form-grid" data-act="add-team">
          <label class="field">Team name <input name="name" required /></label>
          <label class="field">Abbr <input name="short" maxlength="3" placeholder="LIO" /></label>
          <label class="field">Color <input name="color" type="color" value="#145c3a" /></label>
          <div><button class="btn gold" type="submit">Add team</button></div>
        </form>
        <table style="margin-top:16px">${data.teams.map((t) => `<tr><td>${crest(t)}</td><td>${esc(t.name)}</td><td>${esc(t.short)}</td><td class="faint">${esc(t.coach ? `${t.coachTitle || "Coach"}: ${t.coach}` : "")}</td></tr>`).join("")}</table>
      </div>`,
    players: `
      <div class="card">
        <form class="form-grid" data-act="add-player">
          <label class="field">Name <input name="name" required /></label>
          <label class="field">Team <select name="teamId">${teamOptions()}</select></label>
          <label class="field">Pos <input name="pos" placeholder="ST" /></label>
          <label class="field">OVR <input name="ovr" type="number" value="75" /></label>
          <label class="field">Pace <input name="pace" type="number" value="70" /></label>
          <label class="field">Shoot <input name="shoot" type="number" value="70" /></label>
          <label class="field">Pass <input name="pass" type="number" value="70" /></label>
          <label class="field">Defend <input name="defend" type="number" value="70" /></label>
          <label class="field">GK <input name="gk" type="number" value="20" /></label>
          <label class="field">GP <input name="gp" type="number" value="0" /></label>
          <label class="field">Goals <input name="goals" type="number" value="0" /></label>
          <label class="field">Assists <input name="assists" type="number" value="0" /></label>
          <div><button class="btn gold" type="submit">Add player</button></div>
        </form>
      </div>`,
    games: `
      <div class="card">
        <h3>Add fixture</h3>
        <form class="form-grid" data-act="add-game">
          <label class="field">Week <input name="week" type="number" value="${data.week}" /></label>
          <label class="field">Date <input name="date" type="date" /></label>
          <label class="field">Home <select name="homeId">${teamOptions()}</select></label>
          <label class="field">Away <select name="awayId">${teamOptions(data.teams[1]?.id)}</select></label>
          <label class="field">Pred home <input name="predHome" type="number" value="1" /></label>
          <label class="field">Pred away <input name="predAway" type="number" value="1" /></label>
          <div><button class="btn gold" type="submit">Add match</button></div>
        </form>
      </div>
      ${data.games.map((g) => {
        const home = teamById(data, g.homeId);
        const away = teamById(data, g.awayId);
        return `<div class="card" style="margin-top:12px">
          <strong>Week ${g.week}</strong> · ${esc(home?.name)} vs ${esc(away?.name)}
          <form class="form-grid" style="margin-top:10px" data-act="save-score" data-id="${g.id}">
            <label class="field">${esc(home?.short)} <input name="home" type="number" value="${g.home ?? ""}" /></label>
            <label class="field">${esc(away?.short)} <input name="away" type="number" value="${g.away ?? ""}" /></label>
            <div><button class="btn" type="submit">Save score</button></div>
          </form>
          <form class="form-grid" style="margin-top:8px" data-act="save-pred" data-id="${g.id}">
            <label class="field">Pick ${esc(home?.short)} <input name="predHome" type="number" value="${g.predHome ?? 0}" /></label>
            <label class="field">Pick ${esc(away?.short)} <input name="predAway" type="number" value="${g.predAway ?? 0}" /></label>
            <div><button class="btn ghost" type="submit">Save pick</button></div>
          </form>
        </div>`;
      }).join("")}`,
    rankings: `
      <div class="card">
        <form data-act="save-power">
          <div class="form-grid">
            <label class="field">Week <input name="week" type="number" value="${data.week}" /></label>
            <label class="field" style="grid-column:1/-1">Blurb <textarea name="blurb" rows="2">${esc(latestPower(data)?.blurb || "")}</textarea></label>
          </div>
          <table style="margin-top:12px">
            <thead><tr><th>Team</th><th>Rank</th><th>Last week</th><th>Note</th></tr></thead>
            <tbody>
              ${data.teams.map((t, i) => {
                const cur = latestPower(data)?.ranks?.find((r) => r.teamId === t.id);
                return `<tr>
                  <td>${esc(t.name)}</td>
                  <td><input name="rank-${t.id}" type="number" value="${cur?.rank || i + 1}" style="width:70px" /></td>
                  <td><input name="prev-${t.id}" type="number" value="${cur?.prev || i + 1}" style="width:70px" /></td>
                  <td><input name="note-${t.id}" value="${esc(cur?.note || "")}" /></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
          <p style="margin-top:12px"><button class="btn gold" type="submit">Publish rankings</button></p>
        </form>
      </div>`,
    videos: `
      <div class="card">
        <form class="grid" data-act="add-video">
          <label class="field">Title <input name="title" required /></label>
          <label class="field">Week <input name="week" type="number" value="${data.week}" /></label>
          <label class="field">YouTube or video link <input name="url" placeholder="https://youtu.be/..." /></label>
          <label class="field">Upload a file from this computer <input name="file" type="file" accept="video/*" /></label>
          <label class="field">Note <input name="note" placeholder="optional" /></label>
          <button class="btn gold" type="submit">Post video</button>
        </form>
        <p class="faint" style="margin-top:10px">YouTube links work for anyone. A file upload stays on this computer unless you also add a public link.</p>
      </div>`,
  };
}

render();
