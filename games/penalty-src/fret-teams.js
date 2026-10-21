/* Fret Footy Cup: crests, jersey names, and season or classic mode. */
(function () {
  var TEAMS = [
    { name: "DUKES FC", logo: "logos/dukes.jpg" },
    { name: "RICO FOOTY", logo: "logos/rico.jpg" },
    { name: "TEAM SINS", logo: "logos/sins.jpg" },
    { name: "SHOWTIME", logo: "logos/showtime.png" }
  ];
  var SQUADS = {
    "DUKES FC": ["DONO", "SCHINDLER", "DORIAN", "ZOOMS"],
    "RICO FOOTY": ["RIVET", "PROULX", "WRENN", "GOLDSTEIN", "GORDON"],
    "TEAM SINS": ["DANIELS", "VARANO", "SCHWARZ", "FAN", "TOBER"],
    "SHOWTIME": ["GRISLIS", "HAYWARD", "GERUM", "PACHECO"]
  };
  var OVERALL = {
    DONO: 95, SCHINDLER: 78, DORIAN: 87, ZOOMS: 76,
    RIVET: 86, PROULX: 67, WRENN: 83, GOLDSTEIN: 80, GORDON: 75,
    DANIELS: 79, VARANO: 88, SCHWARZ: 78, FAN: 81, TOBER: 84,
    GRISLIS: 97, HAYWARD: 87, GERUM: 84, PACHECO: 90
  };
  var TEAM_NAMES = ["DUKES FC", "RICO FOOTY", "TEAM SINS", "SHOWTIME"];
  var LAYOUT_W = 800;
  var LAYOUT_H = 450;

  var root = document.getElementById("c2canvasdiv");
  if (!root) return;
  root.style.position = "relative";

  var box = document.createElement("div");
  box.id = "ff-logos";
  box.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:5;";
  root.appendChild(box);

  var imgs = TEAMS.map(function (team) {
    var img = document.createElement("img");
    img.alt = team.name;
    img.src = team.logo;
    img.style.cssText = "position:absolute;object-fit:cover;border-radius:50%;display:none;background:#111;box-shadow:0 0 0 2px rgba(0,0,0,.8);";
    box.appendChild(img);
    return img;
  });

  var jersey = document.createElement("div");
  jersey.id = "ff-jersey-name";
  jersey.style.cssText = [
    "position:absolute",
    "display:none",
    "pointer-events:none",
    "z-index:6",
    "transform:translate(-50%,-50%) perspective(140px) rotateX(24deg)",
    "transform-origin:center center",
    "filter:drop-shadow(0 1px 0 rgba(0,0,0,.45))"
  ].join(";");
  box.appendChild(jersey);

  function paintJersey(name) {
    if (jersey.getAttribute("data-name") === name) return;
    jersey.setAttribute("data-name", name);
    var letters = name.split("");
    var count = letters.length;
    var width = 220;
    var height = 58;
    var mid = (count - 1) / 2;
    var gap = Math.min(22, 168 / Math.max(count, 1));
    var parts = [];
    function letter(ch, i, dy, fill, stroke) {
      var offset = i - mid;
      var curve = mid === 0 ? 0 : offset / mid;
      var x = width / 2 + offset * gap;
      var y = 24 + curve * curve * 16 + dy;
      var rot = curve * 16;
      return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" transform="rotate(' + rot.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.7" paint-order="stroke" font-family="Arial Black,Impact,sans-serif" font-size="20" text-anchor="middle">' + ch + '</text>';
    }
    for (var i = 0; i < count; i++) parts.push(letter(letters[i], i, 1.4, "#1a1a1a", "#1a1a1a"));
    for (var k = 0; k < count; k++) parts.push(letter(letters[k], k, 0, "#f4f4f2", "#202020"));
    jersey.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" height="100%" aria-hidden="true">' + parts.join("") + "</svg>";
  }

  var shoot = { key: "", userQ: [], oppQ: [], sig: null, who: "", shotNum: null, ovr: 0 };

  function onScreen(inst) {
    return inst && inst.x > -20 && inst.y > 80 && inst.y < 220 && inst.x < LAYOUT_W && inst.visible !== false && inst.opacity !== 0;
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function globalValue(rt, name) {
    var lists = [rt.cq, rt.yX];
    for (var i = 0; i < lists.length; i++) {
      var list = lists[i];
      if (!list) continue;
      for (var j = 0; j < list.length; j++) {
        if (list[j] && list[j].name === name) return list[j].data;
      }
    }
    return undefined;
  }

  function shirtOnScreen(rt) {
    var found = null;
    [rt.types.t1, rt.types.t5].forEach(function (type) {
      (type && type.u || []).forEach(function (inst) {
        if (!inst || inst.visible === false || inst.opacity < 0.35) return;
        if (inst.x < -30 || inst.x > LAYOUT_W + 30 || inst.y < 40 || inst.y > LAYOUT_H + 40) return;
        var area = Math.abs(inst.width * inst.height);
        if (!found || area > Math.abs(found.width * found.height)) found = inst;
      });
    });
    return found;
  }

  function placeJersey(rt, canvas) {
    var who = globalValue(rt, "whoShoots");
    var shot = Number(globalValue(rt, "shotNumber"));
    var userId = Number(globalValue(rt, "myTeamID"));
    var oppId = Number(globalValue(rt, "opponentID"));
    if (!(oppId >= 0 && oppId <= 3)) oppId = Number(globalValue(rt, "myOpponentId"));
    var shirt = shirtOnScreen(rt);
    var live = who === "player" || who === "cpu";
    if (!live || !shirt || !(userId >= 0 && userId <= 3) || !(oppId >= 0 && oppId <= 3) || isNaN(shot)) {
      jersey.style.display = "none";
      return;
    }

    var key = userId + ":" + oppId;
    if (shoot.key !== key || (shoot.shotNum != null && shot < shoot.shotNum)) {
      shoot.key = key;
      shoot.userQ = shuffle(SQUADS[TEAM_NAMES[userId]]);
      shoot.oppQ = shuffle(SQUADS[TEAM_NAMES[oppId]]);
      shoot.sig = null;
      shoot.who = "";
      shoot.shotNum = null;
    }

    var sig = who + ":" + shot;
    if (shoot.sig && shoot.sig !== sig) {
      var finished = shoot.who === "cpu" ? shoot.oppQ : shoot.userQ;
      if (finished.length) finished.shift();
      var refillName = shoot.who === "cpu" ? TEAM_NAMES[oppId] : TEAM_NAMES[userId];
      if (!finished.length) finished.push.apply(finished, shuffle(SQUADS[refillName]));
    }
    shoot.sig = sig;
    shoot.who = who;
    shoot.shotNum = shot;

    var queue = who === "cpu" ? shoot.oppQ : shoot.userQ;
    if (!queue.length) queue.push.apply(queue, shuffle(SQUADS[who === "cpu" ? TEAM_NAMES[oppId] : TEAM_NAMES[userId]]));
    var name = queue[0];

    var canvasRect = canvas.getBoundingClientRect();
    var rootRect = root.getBoundingClientRect();
    var scaleX = canvasRect.width / LAYOUT_W;
    var scaleY = canvasRect.height / LAYOUT_H;
    var hx = shirt.Zc == null ? 0.5 : shirt.Zc;
    var hy = shirt.$c == null ? 0.5 : shirt.$c;
    var centerX = shirt.x + (0.5 - hx) * shirt.width;
    var nameY = shirt.y - hy * shirt.height + shirt.height * 0.42;
    var shirtPx = Math.abs(shirt.width) * scaleX;
    var printW = Math.max(54, Math.min(118, shirtPx * 1.15));

    paintJersey(name);
    shoot.ovr = OVERALL[name] || 75;
    if (who === "player") tuneAim(rt, shoot.ovr);
    jersey.style.display = "block";
    jersey.style.width = Math.round(printW) + "px";
    jersey.style.height = Math.round(printW * 0.28) + "px";
    jersey.style.left = (canvasRect.left - rootRect.left + centerX * scaleX) + "px";
    jersey.style.top = (canvasRect.top - rootRect.top + nameY * scaleY) + "px";
  }

  var REGULAR_ROUNDS = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]]
  ];
  var SEASON_ROUNDS = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[3, 0], [1, 2]],
    [[1, 0], [3, 2]],
    [[2, 0], [3, 1]],
    [[0, 3], [2, 1]],
    [[0, 1], [2, 3]],
    [[2, 0], [3, 1]],
    [[3, 0], [1, 2]]
  ];
  var RATINGS = [87, 84, 84, 90];
  var MATCH_LAYOUTS = { matchIntro: 1, matchIntroV2: 1, ballFlight3: 1, actionPS: 1, beforeMatch: 1 };

  var mode = "";
  try { mode = sessionStorage.getItem("ff_cup_mode") || ""; } catch (e) { mode = ""; }
  var season = null;
  var lastLayout = "";

  var ui = document.createElement("div");
  ui.id = "ff-mode-ui";
  ui.style.cssText = "position:absolute;inset:0;z-index:20;display:none;pointer-events:auto;";
  ui.innerHTML = [
    "<style>",
    "#ff-mode-ui *{box-sizing:border-box;}",
    "#ff-mode-ui .ff-scrim{position:absolute;inset:0;background:#10141b;color:#f4f1ea;font-family:rockoultraflfregular,Impact,sans-serif;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto;}",
    "#ff-mode-ui .ff-card{width:min(640px,100%);}",
    "#ff-mode-ui .ff-kicker{margin:0 0 6px;letter-spacing:.16em;font-size:12px;color:#e23b4a;}",
    "#ff-mode-ui h2{margin:0 0 14px;font-size:28px;font-weight:400;letter-spacing:.04em;}",
    "#ff-mode-ui .ff-choices{display:grid;grid-template-columns:1fr 1fr;gap:12px;}",
    "#ff-mode-ui button.ff-choice{text-align:left;background:#14181f;color:#f4f1ea;border:1px solid #3a3128;border-radius:14px;padding:16px;cursor:pointer;font:inherit;}",
    "#ff-mode-ui button.ff-choice strong{display:block;font-size:18px;margin-bottom:8px;letter-spacing:.04em;}",
    "#ff-mode-ui button.ff-choice span{display:block;font-family:Arial,sans-serif;font-size:13px;line-height:1.4;color:#d9d3c7;}",
    "#ff-mode-ui button.ff-choice:hover{border-color:#e23b4a;}",
    "#ff-mode-ui .ff-banner{position:absolute;top:8px;left:50%;transform:translateX(-50%);background:rgba(8,10,14,.82);color:#f4f1ea;font-family:rockoultraflfregular,Impact,sans-serif;letter-spacing:.08em;font-size:13px;padding:6px 12px;border-radius:999px;pointer-events:none;}",
    "#ff-mode-ui table{width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;margin:8px 0 14px;}",
    "#ff-mode-ui th{font-size:11px;letter-spacing:.08em;color:#b7b1a6;font-weight:600;text-align:right;padding:4px 6px;}",
    "#ff-mode-ui th:first-child,#ff-mode-ui td:first-child{text-align:left;}",
    "#ff-mode-ui td{padding:5px 6px;border-top:1px solid rgba(255,255,255,.08);text-align:right;}",
    "#ff-mode-ui td.club{text-align:left;font-family:rockoultraflfregular,Impact,sans-serif;letter-spacing:.03em;}",
    "#ff-mode-ui .ff-club{display:flex;align-items:center;gap:8px;}",
    "#ff-mode-ui .ff-club img{width:22px;height:22px;border-radius:50%;object-fit:cover;}",
    "#ff-mode-ui .ff-you{color:#f2c14b;}",
    "#ff-mode-ui .ff-next{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#14181f;border:1px solid #3a3128;border-radius:12px;padding:12px;margin-top:8px;}",
    "#ff-mode-ui .ff-next p{margin:0;font-family:Arial,sans-serif;font-size:14px;}",
    "#ff-mode-ui button.ff-go,#ff-mode-ui button.ff-menu{font:inherit;letter-spacing:.06em;border:0;border-radius:999px;padding:10px 16px;cursor:pointer;background:#e23b4a;color:white;}",
    "#ff-mode-ui button.ff-menu{background:transparent;color:#d9d3c7;border:1px solid #3a3128;margin-top:12px;}",
    "#ff-mode-ui .ff-tie{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 0;border-top:1px solid rgba(255,255,255,.08);font-family:Arial,sans-serif;}",
    "#ff-mode-ui .ff-score{font-family:rockoultraflfregular,Impact,sans-serif;letter-spacing:.04em;}",
    "@media (max-width:720px){#ff-mode-ui .ff-choices{grid-template-columns:1fr;}}",
    "</style>",
    "<div class='ff-scrim' id='ff-scrim' style='display:none'></div>",
    "<div class='ff-banner' id='ff-banner' style='display:none'></div>"
  ].join("");
  root.appendChild(ui);

  function setGlobal(rt, name, value) {
    [rt.cq, rt.yX].forEach(function (list) {
      (list || []).forEach(function (g) {
        if (g && g.name === name) g.data = value;
      });
    });
  }

  function layoutName(rt) {
    return rt.Ra && rt.Ra.name || "";
  }

  function goTo(rt, name) {
    var layout = null;
    (rt.sd || []).forEach(function (item) {
      if (item && item.name === name) layout = item;
    });
    if (layout && rt.vQ) rt.vQ(layout);
  }

  function rememberMode(next) {
    mode = next;
    try { sessionStorage.setItem("ff_cup_mode", next); } catch (e) {}
  }

  function clearMode() {
    mode = "";
    season = null;
    try { sessionStorage.removeItem("ff_cup_mode"); } catch (e) {}
  }

  function ratingOf(rt, id) {
    var teams = rt.types.t13 && rt.types.t13.u && rt.types.t13.u[0];
    var value = teams && teams.Xc && teams.Xc[id] && teams.Xc[id][1] && Number(teams.Xc[id][1][0]);
    return value || RATINGS[id] || 80;
  }

  function simulateScore(rt, home, away) {
    var homeRate = ratingOf(rt, home);
    var awayRate = ratingOf(rt, away);
    var homeWins = Math.random() < homeRate / (homeRate + awayRate);
    var winnerGoals = 3 + Math.floor(Math.random() * 3);
    var loserGoals = Math.max(1, winnerGoals - 1 - Math.floor(Math.random() * 2));
    return homeWins
      ? { hg: winnerGoals, ag: loserGoals }
      : { hg: loserGoals, ag: winnerGoals };
  }

  function freshSeason(userId) {
    return { userId: userId, played: [], semis: [null, null], final: null, pending: null };
  }

  function playedCount(home, away) {
    var count = 0;
    season.played.forEach(function (match) {
      if (match.home === home && match.away === away) count++;
    });
    return count;
  }

  function scheduledThrough(home, away, roundCount) {
    var rounds = schedule();
    var count = 0;
    var limit = roundCount == null ? rounds.length : roundCount;
    for (var r = 0; r < limit && r < rounds.length; r++) {
      rounds[r].forEach(function (pair) {
        if (pair[0] === home && pair[1] === away) count++;
      });
    }
    return count;
  }

  function stillDue(home, away, round) {
    return playedCount(home, away) < scheduledThrough(home, away, round + 1);
  }

  function recordResult(home, away, hg, ag) {
    if (playedCount(home, away) >= scheduledThrough(home, away)) return;
    season.played.push({ home: home, away: away, hg: hg, ag: ag });
  }

  function standings() {
    var rows = [0, 1, 2, 3].map(function (id) {
      return { id: id, p: 0, w: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });
    season.played.forEach(function (match) {
      if (match.playoff) return;
      var home = rows[match.home];
      var away = rows[match.away];
      home.p += 1;
      away.p += 1;
      home.gf += match.hg;
      home.ga += match.ag;
      away.gf += match.ag;
      away.ga += match.hg;
      if (match.hg > match.ag) home.pts += 3;
      else away.pts += 3;
      home.w = home.pts / 3;
      away.w = away.pts / 3;
    });
    rows.forEach(function (row) { row.gd = row.gf - row.ga; });
    rows.sort(function (a, b) {
      return (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf) || (a.id - b.id);
    });
    return rows;
  }

  function schedule() {
    return mode === "classic" ? REGULAR_ROUNDS : SEASON_ROUNDS;
  }

  function leagueRound() {
    var rounds = schedule();
    for (var r = 0; r < rounds.length; r++) {
      var open = rounds[r].some(function (pair) {
        return stillDue(pair[0], pair[1], r);
      });
      if (open) return r;
    }
    return rounds.length;
  }

  function clubCell(id, mine) {
    return "<span class='ff-club" + (mine ? " ff-you" : "") + "'><img alt='' src='" + TEAMS[id].logo + "'>" + TEAMS[id].name + "</span>";
  }

  function showScrim(html, sig) {
    var scrim = document.getElementById("ff-scrim");
    var banner = document.getElementById("ff-banner");
    ui.style.display = "block";
    ui.style.pointerEvents = "auto";
    scrim.style.display = "flex";
    if (banner) banner.style.display = "none";
    if (ui.getAttribute("data-paint") === sig) return;
    ui.setAttribute("data-paint", sig);
    scrim.innerHTML = "<div class='ff-card'>" + html + "</div>";
  }

  function hideScrim() {
    var scrim = document.getElementById("ff-scrim");
    if (scrim) scrim.style.display = "none";
  }

  function choiceScreen() {
    showScrim([
      "<p class='ff-kicker'>FRET FOOTY CUP</p>",
      "<h2>Choose a mode</h2>",
      "<div class='ff-choices'>",
      "<button class='ff-choice' data-ff-mode='season'><strong>Season</strong><span>Play every club three times. The table seeds the playoffs: 1st against 4th, 2nd against 3rd, then the final.</span></button>",
      "<button class='ff-choice' data-ff-mode='classic'><strong>Regular</strong><span>Play every club once, then the playoffs. 1st plays 4th, 2nd plays 3rd, and the winners meet in the final.</span></button>",
      "</div>"
    ].join(""), "choice");
  }

  function signed(n) { return n > 0 ? "+" + n : String(n); }

  function seasonScreen(rt) {
    var rounds = schedule();
    var round = leagueRound();
    var rows = standings();
    var mine = season.userId;
    var body = [
      "<p class='ff-kicker'>" + (mode === "classic" ? "REGULAR" : "SEASON") + "</p>",
      "<h2>" + (round < rounds.length ? "Round " + (round + 1) + " of " + rounds.length : "Playoffs") + "</h2>"
    ];
    if (round < rounds.length) {
      var pair = rounds[round].filter(function (item) { return item.indexOf(mine) === -1; })[0];
      if (pair && stillDue(pair[0], pair[1], round)) {
        var sim = simulateScore(rt, pair[0], pair[1]);
        recordResult(pair[0], pair[1], sim.hg, sim.ag);
        rows = standings();
      }
      body.push("<table><thead><tr><th>Club</th><th>P</th><th>GD</th><th>Pts</th></tr></thead><tbody>");
      rows.forEach(function (row, index) {
        body.push("<tr><td class='club'>" + (index + 1) + " " + clubCell(row.id, row.id === mine) + "</td><td>" + row.p + "</td><td>" + signed(row.gd) + "</td><td>" + row.pts + "</td></tr>");
      });
      body.push("</tbody></table>");
      var yours = rounds[round].filter(function (item) { return item.indexOf(mine) !== -1; })[0];
      if (yours && stillDue(yours[0], yours[1], round)) {
        body.push("<div class='ff-next'><p>Your match<br>" + TEAMS[yours[0]].name + " vs " + TEAMS[yours[1]].name + "</p><button class='ff-go' data-ff-play='" + yours[0] + "," + yours[1] + "'>Play</button></div>");
      }
    } else {
      var seeds = rows.map(function (row) { return row.id; });
      body.push("<table><thead><tr><th>Seed</th><th>P</th><th>GD</th><th>Pts</th></tr></thead><tbody>");
      rows.forEach(function (row, index) {
        body.push("<tr><td class='club'>" + (index + 1) + " " + clubCell(row.id, row.id === mine) + "</td><td>" + row.p + "</td><td>" + signed(row.gd) + "</td><td>" + row.pts + "</td></tr>");
      });
      body.push("</tbody></table><p class='ff-kicker'>PLAYOFFS</p>");
      ensurePlayoffs(rt, seeds);
      body.push(playoffTie("Semifinal", seeds[0], seeds[3], season.semis[0], mine));
      body.push(playoffTie("Semifinal", seeds[1], seeds[2], season.semis[1], mine));
      var winners = season.semis[0] && season.semis[1] ? [season.semis[0].winner, season.semis[1].winner] : null;
      if (winners) {
        var finalists = winners.slice().sort(function (a, b) { return seeds.indexOf(a) - seeds.indexOf(b); });
        if (!season.final && finalists.indexOf(mine) === -1) {
          var simFinal = simulateScore(rt, finalists[0], finalists[1]);
          season.final = { home: finalists[0], away: finalists[1], hg: simFinal.hg, ag: simFinal.ag, winner: simFinal.hg > simFinal.ag ? finalists[0] : finalists[1] };
        }
        body.push(playoffTie("Final", finalists[0], finalists[1], season.final, mine));
        if (season.final) body.push("<h2>" + TEAMS[season.final.winner].name + (mode === "classic" ? " win the regular season" : " win the season") + "</h2>");
      }
    }
    body.push("<button class='ff-menu' data-ff-menu='1'>Main menu</button>");
    showScrim(body.join(""), JSON.stringify({
      played: season.played,
      semis: season.semis,
      final: season.final,
      round: leagueRound()
    }));
  }

  function playoffTie(label, home, away, result, mine) {
    var score = result
      ? "<span class='ff-score'>" + result.hg + " – " + result.ag + "</span>"
      : (home === mine || away === mine
        ? "<button class='ff-go' data-ff-play='" + home + "," + away + "' data-ff-playoff='1'>Play</button>"
        : "<span>Simulating</span>");
    return "<div class='ff-tie'><div><div class='ff-kicker'>" + label + "</div>" + clubCell(home, home === mine) + "<br>" + clubCell(away, away === mine) + "</div>" + score + "</div>";
  }

  function ensurePlayoffs(rt, seeds) {
    [[0, seeds[0], seeds[3]], [1, seeds[1], seeds[2]]].forEach(function (item) {
      var index = item[0];
      var home = item[1];
      var away = item[2];
      if (season.semis[index] || home === season.userId || away === season.userId) return;
      var sim = simulateScore(rt, home, away);
      season.semis[index] = { home: home, away: away, hg: sim.hg, ag: sim.ag, winner: sim.hg > sim.ag ? home : away };
    });
  }

  function startFixture(rt, home, away, playoff) {
    var mine = season.userId;
    var opp = home === mine ? away : home;
    setGlobal(rt, "myTeamID", mine);
    setGlobal(rt, "opponentID", opp);
    setGlobal(rt, "myOpponentId", opp);
    setGlobal(rt, "wePlayHome", home === mine ? "yes" : "no");
    setGlobal(rt, "ourGoals", 0);
    setGlobal(rt, "opponentGoals", 0);
    setGlobal(rt, "tempResultPlayer", 0);
    setGlobal(rt, "tempResultCPU", 0);
    setGlobal(rt, "shotNumber", 0);
    season.pending = { home: home, away: away, playoff: !!playoff };
    hideScrim();
    goTo(rt, "matchIntroV2");
  }

  function finishPending(rt) {
    if (!season || !season.pending) return false;
    var ours = Number(globalValue(rt, "ourGoals"));
    var theirs = Number(globalValue(rt, "opponentGoals"));
    if (ours === theirs) {
      ours = Number(globalValue(rt, "tempResultPlayer"));
      theirs = Number(globalValue(rt, "tempResultCPU"));
    }
    if (!(ours >= 0) || ours === theirs) return false;
    var pending = season.pending;
    var mine = season.userId;
    var hg = pending.home === mine ? ours : theirs;
    var ag = pending.away === mine ? ours : theirs;
    season.pending = null;
    if (pending.playoff) {
      var winner = hg > ag ? pending.home : pending.away;
      var pack = { home: pending.home, away: pending.away, hg: hg, ag: ag, winner: winner };
      var seeds = season.seeds || standings().map(function (row) { return row.id; });
      var bothSemis = season.semis[0] && season.semis[1];
      if (!season.final && bothSemis && leagueRound() >= schedule().length) season.final = pack;
      else {
        var first = (pending.home === seeds[0] && pending.away === seeds[3]) || (pending.home === seeds[3] && pending.away === seeds[0]);
        season.semis[first ? 0 : 1] = pack;
        if (season.semis[0] && season.semis[1]) {
          var finalists = [season.semis[0].winner, season.semis[1].winner].sort(function (a, b) {
            return seeds.indexOf(a) - seeds.indexOf(b);
          });
          if (finalists.indexOf(mine) === -1 && !season.final) {
            var sim = simulateScore(rt, finalists[0], finalists[1]);
            season.final = { home: finalists[0], away: finalists[1], hg: sim.hg, ag: sim.ag, winner: sim.hg > sim.ag ? finalists[0] : finalists[1] };
          }
        }
      }
    } else {
      recordResult(pending.home, pending.away, hg, ag);
    }
    return true;
  }

  ui.addEventListener("click", function (event) {
    var choice = event.target.closest && event.target.closest("[data-ff-mode]");
    var play = event.target.closest && event.target.closest("[data-ff-play]");
    var menu = event.target.closest && event.target.closest("[data-ff-menu]");
    var rt = window.cr_getC2Runtime && window.cr_getC2Runtime();
    if (choice) {
      rememberMode(choice.getAttribute("data-ff-mode"));
      hideScrim();
      if (mode === "classic") ui.style.display = "none";
      return;
    }
    if (menu && rt) {
      clearMode();
      hideScrim();
      ui.style.display = "none";
      goTo(rt, "mainMenu");
      return;
    }
    if (play && rt && season) {
      var pair = play.getAttribute("data-ff-play").split(",").map(Number);
      startFixture(rt, pair[0], pair[1], play.hasAttribute("data-ff-playoff"));
    }
  });

  function runMode(rt) {
    var layout = layoutName(rt);
    var banner = document.getElementById("ff-banner");
    if (layout === "mainMenu" && lastLayout && lastLayout !== "mainMenu" && lastLayout !== "pickLeague" && lastLayout !== "loading" && lastLayout !== "first") {
      clearMode();
    }
    if (!mode && layout === "mainMenu") {
      choiceScreen();
      banner.style.display = "none";
      lastLayout = layout;
      return;
    }
    if (mode !== "season" && mode !== "classic") {
      hideScrim();
      banner.style.display = "none";
      ui.style.display = "none";
      lastLayout = layout;
      return;
    }

    ui.style.pointerEvents = "auto";
    banner.style.display = "none";
    var userId = Number(globalValue(rt, "myTeamID"));
    if (layout === "teamPick" || layout === "beforeMatchGroups" || MATCH_LAYOUTS[layout] || layout === "afterMatch") {
      if (userId >= 0 && userId <= 3) {
        if (!season) season = freshSeason(userId);
      }
    }
    if (layout === "teamPick") {
      hideScrim();
      banner.style.display = "block";
      banner.textContent = "Fret Footy Conference";
      ui.style.display = "block";
      ui.style.pointerEvents = "none";
      lastLayout = layout;
      return;
    }
    if (!season || MATCH_LAYOUTS[layout]) {
      hideScrim();
      ui.style.display = "none";
      lastLayout = layout;
      return;
    }
    if (layout === "afterMatch" || layout === "results" || layout === "gameOver" || layout === "knockoutPhase" || layout === "beforeMatchGroups") {
      finishPending(rt);
      seasonScreen(rt);
    } else {
      hideScrim();
      ui.style.display = "none";
    }
    lastLayout = layout;
  }

  function tuneAim(rt, overall) {
    var skill = Math.max(0, Math.min(1, (overall - 60) / 40));
    var period = 0.55 + skill * 2.3;
    var sweep = 460 - skill * 260;
    (rt.types.t33 && rt.types.t33.u || []).forEach(function (inst) {
      (inst.Y || []).forEach(function (beh) {
        if (!beh || beh.$e == null || beh.Qc == null || !beh.G || beh.G.length < 8) return;
        beh.$e = period;
        beh.Qc = sweep;
        beh.G[3] = period;
        beh.G[7] = sweep;
      });
    });
  }

  var roar = new Audio("media/crowd_middle_goal.m4a");
  roar.volume = 1;
  var horn = new Audio("https://www.myinstants.com/media/sounds/boston-bruins-goal-horn-2011-2012-mp3cut.mp3");
  horn.preload = "auto";
  var lastGoalSound = null;
  var goalsSeen = null;
  var celebratedAt = 0;
  var hornTimer = 0;
  var hornShot = null;

  function stopHorn() {
    hornTimer = 0;
    horn.pause();
    try { horn.currentTime = 0; } catch (e) {}
  }

  function playHorn(rt) {
    stopHorn();
    hornShot = Number(globalValue(rt, "shotNumber"));
    horn.volume = 1;
    try { horn.currentTime = 0; } catch (e) {}
    var played = horn.play();
    if (played && played.catch) played.catch(function () {});
    hornTimer = Date.now();
  }

  function watchHorn(rt) {
    if (!hornTimer) return;
    var shot = Number(globalValue(rt, "shotNumber"));
    if (Date.now() - hornTimer >= 5000 || (!isNaN(hornShot) && !isNaN(shot) && shot !== hornShot)) stopHorn();
  }

  function boostCrowd() {
    try {
      roar.currentTime = 0;
      var played = roar.play();
      if (played && played.catch) played.catch(function () {});
    } catch (e) {}
    var sound = lastGoalSound;
    if (!sound) return;
    sound.volume = 2.6;
    if (sound.Xb && sound.Xb.gain) sound.Xb.gain.value = 2.6;
  }

  function celebrate(rt) {
    var now = Date.now();
    if (now - celebratedAt < 4000) return;
    celebratedAt = now;
    boostCrowd();
    playHorn(rt);
  }

  function hookCrowd(rt) {
    var audio = rt && rt.mi;
    if (!audio || audio.ffHooked || typeof audio.IQ !== "function") return;
    audio.ffHooked = true;
    var orig = audio.IQ;
    audio.IQ = function () {
      var sound = orig.apply(this, arguments);
      if (sound && typeof sound.src === "string" && sound.src.indexOf("crowd_middle_goal") !== -1) {
        setTimeout(function () {
          if (sound.volume > 0.2) lastGoalSound = sound;
        }, 0);
      }
      return sound;
    };
  }

  function watchGoals(rt) {
    var shoot = Number(globalValue(rt, "tempResultPlayer")) + Number(globalValue(rt, "tempResultCPU"));
    if (isNaN(shoot)) return;
    if (goalsSeen == null) {
      goalsSeen = shoot;
      return;
    }
    if (shoot > goalsSeen) celebrate(rt);
    goalsSeen = shoot;
  }

  function tick() {
    requestAnimationFrame(tick);
    var rt = window.cr_getC2Runtime && window.cr_getC2Runtime();
    var canvas = document.getElementById("c2canvas");
    if (!rt || !canvas || !rt.types || !rt.types.t85) {
      jersey.style.display = "none";
      return;
    }

    runMode(rt);
    hookCrowd(rt);
    watchGoals(rt);
    watchHorn(rt);

    if (layoutName(rt) === "teamPick") {
      Object.keys(rt.types).forEach(function (key) {
        (rt.types[key].u || []).forEach(function (inst) {
          var text = inst.text && String(inst.text).trim();
          if (text && /^group\b/i.test(text)) {
            inst.opacity = 0;
            inst.visible = false;
          }
        });
      });
      (rt.types.t105 && rt.types.t105.u || []).forEach(function (row) {
        row.opacity = 0;
      });
    }

    var buttons = (rt.types.t85.u || []).filter(onScreen).sort(function (a, b) { return a.x - b.x; });
    var labels = (rt.types.t71 && rt.types.t71.u || []).filter(onScreen).sort(function (a, b) { return a.x - b.x; });
    var show = buttons.length >= TEAMS.length && labels.length >= TEAMS.length;

    var rows = rt.types.t105 && rt.types.t105.u || [];
    for (var r = 0; r < rows.length; r++) {
      if (rows[r].y > 200) rows[r].opacity = show ? 0 : rows[r].opacity;
    }

    if (show) {
      var draw = rt.types.t10 && rt.types.t10.u && rt.types.t10.u[0];
      var canvasRect = canvas.getBoundingClientRect();
      var rootRect = root.getBoundingClientRect();
      var scaleX = canvasRect.width / LAYOUT_W;
      var scaleY = canvasRect.height / LAYOUT_H;
      var originX = canvasRect.left - rootRect.left;
      var originY = canvasRect.top - rootRect.top;
      var size = Math.round(34 * scaleY);

      for (var i = 0; i < TEAMS.length; i++) {
        var button = buttons[i];
        var label = labels[i];
        if (button.Zb && button.Zb.length) button.Zb[0] = i;
        if (draw && draw.Xc && draw.Xc[i] && draw.Xc[i][0]) draw.Xc[i][0][0] = i;
        if (label.text !== TEAMS[i].name) {
          label.text = TEAMS[i].name;
          label.Mc = true;
          if (label.j) label.j.aa = true;
        }
        var img = imgs[i];
        img.style.display = "block";
        img.style.width = size + "px";
        img.style.height = size + "px";
        img.style.left = (originX + (button.x + button.width - 10) * scaleX - size) + "px";
        img.style.top = (originY + (button.y + button.height / 2) * scaleY - size / 2) + "px";
      }
    }

    for (var n = 0; n < imgs.length; n++) {
      if (!show) imgs[n].style.display = "none";
    }

    placeJersey(rt, canvas);
  }

  requestAnimationFrame(tick);
})();
