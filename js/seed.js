/** Fret Footy — all four clubs are in. */

function skater(ovr, role) {
  if (role === "gk") {
    return { pace: 42, shoot: 16, pass: 52, defend: 28, gk: ovr };
  }
  if (role === "def") {
    return { pace: Math.max(50, ovr - 10), shoot: Math.max(30, ovr - 38), pass: ovr - 14, defend: ovr, gk: 12 };
  }
  if (role === "cm") {
    return { pace: ovr - 6, shoot: ovr - 18, pass: ovr - 8, defend: ovr - 10, gk: 12 };
  }
  return { pace: Math.min(99, ovr - 2), shoot: ovr, pass: Math.max(50, ovr - 16), defend: Math.max(28, ovr - 48), gk: 10 };
}

export const SEED = {
  leagueName: "Fret Footy",
  season: "2026",
  week: 1,
  teams: [
    { id: "dukes", name: "Dukes FC", short: "DUK", color: "#0d4d2b", color2: "#ffffff", logo: "img/dukes-fc.jpg" },
    { id: "rico", name: "Rico Footy", short: "RICO", color: "#ea580c", color2: "#111111", logo: "img/rico-footy.jpg", coach: "Uncle Ricardo", coachTitle: "GM / Coach" },
    { id: "bnb", name: "Team Sins", short: "SIN", color: "#7a2be2", color2: "#e10600", logo: "img/sins.jpg" },
    { id: "showtime", name: "Team Showtime", short: "SHOW", color: "#7a1020", color2: "#f4c430", logo: "img/showtime.png" },
  ],
  players: [
    {
      id: "p-dono",
      name: "Nathan Dono",
      teamId: "dukes",
      pos: "ST",
      ovr: 95,
      ...skater(95, "st"),
      offence: 95,
      shoot: 95,
      defend: 0,
      note: "95 offence. 0 defense.",
      gp: 0, goals: 0, assists: 0,
    },
    {
      id: "p-schindler",
      name: "Cole Schindler",
      aka: "Warm Palmer",
      teamId: "dukes",
      pos: "ST",
      ovr: 78,
      ...skater(78, "st"),
      gp: 0, goals: 0, assists: 0,
    },
    {
      id: "p-dorian",
      name: "Brody Dorian",
      teamId: "dukes",
      pos: "CB",
      ovr: 87,
      ...skater(87, "def"),
      defend: 87,
      vision: 35,
      note: "87 defense. 35 vision.",
      gp: 0, goals: 0, assists: 0,
    },
    {
      id: "p-zooms",
      name: "Zach Zooms",
      teamId: "dukes",
      pos: "GK",
      ovr: 76,
      ...skater(76, "gk"),
      gk: 90,
      touch: 15,
      note: "76 overall. 90 goalkeeper. 15 touch.",
      gp: 0, goals: 0, assists: 0, saves: 0,
    },

    { id: "p-rivet", name: "Sammy Rivet", teamId: "rico", pos: "ST", ovr: 86, ...skater(86, "st"), gp: 0, goals: 0, assists: 0 },
    {
      id: "p-proulx",
      name: "Grayson Proulx",
      teamId: "rico",
      pos: "CB",
      ovr: 67,
      ...skater(67, "def"),
      shoot: 99,
      finishing: 99,
      note: "67 overall, but 99 finishing.",
      gp: 0, goals: 0, assists: 0,
    },
    {
      id: "p-wrenn",
      name: "Nolan Wrenn",
      teamId: "rico",
      pos: "GK",
      ovr: 83,
      ...skater(83, "gk"),
      anger: 94,
      ineligible: true,
      note: "High anger.",
      gp: 0, goals: 0, assists: 0, saves: 0,
    },
    {
      id: "p-goldstein",
      name: "Colby Goldstein",
      teamId: "rico",
      pos: "CM",
      ovr: 80,
      ...skater(80, "cm"),
      skill: 42,
      compete: 95,
      iq: 93,
      note: "Low skill. High compete and IQ.",
      gp: 0, goals: 0, assists: 0,
    },
    {
      id: "p-gordon",
      name: "Mason Gordon",
      teamId: "rico",
      pos: "—",
      ovr: null,
      gp: 0, goals: 0, assists: 0,
    },

    { id: "p-daniels", name: "Brett Daniels", teamId: "bnb", pos: "GK", ovr: 79, ...skater(79, "gk"), gp: 0, goals: 0, assists: 0, saves: 0 },
    { id: "p-varano", name: "Mark Varano", teamId: "bnb", pos: "ST", ovr: 88, ...skater(88, "st"), gp: 0, goals: 0, assists: 0 },
    { id: "p-schwarz", name: "Ben Schwarz", teamId: "bnb", pos: "ST", ovr: 78, ...skater(78, "st"), gp: 0, goals: 0, assists: 0 },
    { id: "p-murdock", name: "Landon Murdock", teamId: "bnb", pos: "CB", ovr: 81, ...skater(81, "def"), gp: 0, goals: 0, assists: 0 },
    { id: "p-tober", name: "Mikey Tober", teamId: "bnb", pos: "ST", ovr: 78, ...skater(78, "st"), gp: 0, goals: 0, assists: 0 },

    { id: "p-grislis", name: "Brady Grislis", teamId: "showtime", pos: "ST", ovr: 97, ...skater(97, "st"), gp: 0, goals: 0, assists: 0 },
    { id: "p-hayward", name: "James Hayward", teamId: "showtime", pos: "GK", ovr: 89, ...skater(89, "gk"), gp: 0, goals: 0, assists: 0, saves: 0 },
    { id: "p-gerum", name: "Max Gerum", teamId: "showtime", pos: "CB", ovr: 84, ...skater(84, "def"), gp: 0, goals: 0, assists: 0 },
    { id: "p-falls", name: "Fred Falls", teamId: "showtime", pos: "ST", ovr: 73, ...skater(73, "st"), gp: 0, goals: 0, assists: 0 },
    {
      id: "p-pacheco",
      name: "Colten Pacheco",
      aka: "Stache",
      teamId: "showtime",
      pos: "ST",
      ovr: 82,
      ...skater(82, "st"),
      gp: 0, goals: 0, assists: 0,
    },
  ],
  games: [
    // Week 1 — Mon Sep 21 & Wed Sep 23
    { id: "g01", week: 1, date: "2026-09-21", homeId: "dukes", awayId: "rico", home: null, away: null, played: false, predHome: 2, predAway: 1, label: "Week 1 Showcase Championship" },
    { id: "g02", week: 1, date: "2026-09-21", homeId: "bnb", awayId: "showtime", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g03", week: 1, date: "2026-09-23", homeId: "dukes", awayId: "bnb", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    { id: "g04", week: 1, date: "2026-09-23", homeId: "rico", awayId: "showtime", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    // Week 2 — Sun Sep 27 & Wed Sep 30
    { id: "g05", week: 2, date: "2026-09-27", homeId: "dukes", awayId: "showtime", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g06", week: 2, date: "2026-09-27", homeId: "rico", awayId: "bnb", home: null, away: null, played: false, predHome: 1, predAway: 1 },
    { id: "g07", week: 2, date: "2026-09-30", homeId: "rico", awayId: "dukes", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g08", week: 2, date: "2026-09-30", homeId: "showtime", awayId: "bnb", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    // Week 3 — Sun Oct 4 & Wed Oct 7
    { id: "g09", week: 3, date: "2026-10-04", homeId: "bnb", awayId: "dukes", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g10", week: 3, date: "2026-10-04", homeId: "showtime", awayId: "rico", home: null, away: null, played: false, predHome: 2, predAway: 0 },
    { id: "g11", week: 3, date: "2026-10-07", homeId: "showtime", awayId: "dukes", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    { id: "g12", week: 3, date: "2026-10-07", homeId: "bnb", awayId: "rico", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    // Week 4 — Sun Oct 11 & Wed Oct 14
    { id: "g13", week: 4, date: "2026-10-11", homeId: "dukes", awayId: "rico", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    { id: "g14", week: 4, date: "2026-10-11", homeId: "showtime", awayId: "bnb", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    { id: "g15", week: 4, date: "2026-10-14", homeId: "bnb", awayId: "dukes", home: null, away: null, played: false, predHome: 1, predAway: 1 },
    { id: "g16", week: 4, date: "2026-10-14", homeId: "showtime", awayId: "rico", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    // Week 5 — Sun Oct 18 & Wed Oct 21
    { id: "g17", week: 5, date: "2026-10-18", homeId: "showtime", awayId: "dukes", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    { id: "g18", week: 5, date: "2026-10-18", homeId: "rico", awayId: "bnb", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g19", week: 5, date: "2026-10-21", homeId: "rico", awayId: "dukes", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g20", week: 5, date: "2026-10-21", homeId: "bnb", awayId: "showtime", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    // Week 6 — Sun Oct 25 & Wed Oct 28
    { id: "g21", week: 6, date: "2026-10-25", homeId: "dukes", awayId: "bnb", home: null, away: null, played: false, predHome: 2, predAway: 1 },
    { id: "g22", week: 6, date: "2026-10-25", homeId: "rico", awayId: "showtime", home: null, away: null, played: false, predHome: 0, predAway: 2 },
    { id: "g23", week: 6, date: "2026-10-28", homeId: "dukes", awayId: "showtime", home: null, away: null, played: false, predHome: 1, predAway: 2 },
    { id: "g24", week: 6, date: "2026-10-28", homeId: "bnb", awayId: "rico", home: null, away: null, played: false, predHome: 2, predAway: 1 },
  ],
  powerRankings: [
    {
      week: 1,
      blurb: "Four clubs, full rosters. Grislis at 97 is the new headline act.",
      ranks: [
        { teamId: "showtime", rank: 1, prev: 4, note: "Brady Grislis at 97 OVR is the best player in Fret Footy. Hayward is a 89 in net." },
        { teamId: "dukes", rank: 2, prev: 1, note: "Nathan Dono is still a 95 with zero defense. Zooms is a 76 overall with a 90 in net." },
        { teamId: "rico", rank: 3, prev: 2, note: "Uncle Ricardo’s side. Proulx finishes at 99. Goldstein wins the ugly minutes." },
        { teamId: "bnb", rank: 4, prev: 3, note: "Mark Varano at 88 is the spear. Daniels is steady in net." },
      ],
    },
  ],
  videos: [],
  news: [
    {
      id: "n1",
      date: "2026-09-18",
      kicker: "Season preview",
      title: "The wait is almost over",
      body: "Fret Footy is locked in for 2026 and the countdown is on. Four clubs, full rosters, Sundays and Wednesdays from September 21 through October 28. Dukes FC, Rico Footy, Team Sins, and Team Showtime are ready. Kickoff cannot come soon enough.",
    },
  ],
  home: {
    news: {
      heading: "News",
      kicker: "Season preview",
      title: "The wait is almost over",
      body: "Fret Footy is locked in for 2026 and the countdown is on. Four clubs, full rosters, Sundays and Wednesdays from September 21 through October 28. Dukes FC, Rico Footy, Team Sins, and Team Showtime are ready. Kickoff cannot come soon enough.",
    },
    spot: {
      heading: "#1 this week",
      teamId: "showtime",
      title: "Team Showtime",
      body: "Brady Grislis at 97 OVR is the best player in Fret Footy. Hayward is a 89 in net.",
    },
  },
};
