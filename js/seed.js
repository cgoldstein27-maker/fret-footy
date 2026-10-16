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
  week: 5,
  teams: [
    { id: "dukes", name: "Dukes FC", short: "DUK", color: "#0d4d2b", color2: "#ffffff", logo: "img/dukes-fc.jpg" },
    { id: "rico", name: "Rico Footy", short: "RICO", color: "#ea580c", color2: "#111111", logo: "img/rico-footy.jpg?v=3", coach: "Uncle Ricardo", coachTitle: "GM / Coach" },
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
      photo: "img/players/nathan.jpg",
      ...skater(95, "st"),
      offence: 95,
      shoot: 95,
      defend: 0,
      note: "95 offence. 0 defense.",
      gp: 8, goals: 7, assists: 0,
    },
    {
      id: "p-schindler",
      name: "Cole Schindler",
      aka: "Warm Palmer",
      teamId: "dukes",
      pos: "ST",
      ovr: 78,
      photo: "img/players/cole.jpg",
      ...skater(78, "st"),
      gp: 8, goals: 4, assists: 1,
    },
    {
      id: "p-dorian",
      name: "Brody Dorian",
      teamId: "dukes",
      pos: "CB",
      ovr: 87,
      photo: "img/players/brody.jpg",
      ...skater(87, "def"),
      defend: 87,
      vision: 35,
      note: "87 defense. 35 vision.",
      gp: 8, goals: 0, assists: 3,
    },
    {
      id: "p-zooms",
      name: "Zach Zooms",
      teamId: "dukes",
      pos: "GK",
      ovr: 76,
      photo: "img/players/zach.jpg",
      ...skater(76, "gk"),
      gk: 90,
      touch: 15,
      note: "76 overall. 90 goalkeeper. 15 touch.",
      gp: 8, goals: 0, assists: 0, saves: 0,
    },

    { id: "p-rivet", name: "Sammy Rivet", teamId: "rico", pos: "ST", ovr: 86, photo: "img/players/sammy.jpg?v=2", ...skater(86, "st"), gp: 8, goals: 9, assists: 0 },
    {
      id: "p-proulx",
      name: "Grayson Proulx",
      teamId: "rico",
      photo: "img/players/grayson.jpg?v=2",
      pos: "CB",
      ovr: 67,
      ...skater(67, "def"),
      shoot: 99,
      finishing: 99,
      note: "67 overall, but 99 finishing.",
      gp: 8, goals: 2, assists: 0,
    },
    {
      id: "p-wrenn",
      name: "Nolan Wrenn",
      teamId: "rico",
      photo: "img/players/nolan.jpg?v=2",
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
      photo: "img/players/colby.jpg",
      pos: "CM",
      ovr: 80,
      ...skater(80, "cm"),
      skill: 42,
      compete: 95,
      iq: 93,
      note: "Low skill. High compete and IQ.",
      gp: 8, goals: 0, assists: 4,
    },
    {
      id: "p-gordon",
      name: "Mason Gordon",
      teamId: "rico",
      photo: "img/players/mason.jpg",
      pos: "—",
      ovr: null,
      gp: 8, goals: 0, assists: 2,
    },

    { id: "p-daniels", name: "Brett Daniels", teamId: "bnb", pos: "GK", ovr: 79, photo: "img/players/brett.jpg", ...skater(79, "gk"), gp: 8, goals: 0, assists: 0, saves: 0 },
    { id: "p-varano", name: "Mark Varano", teamId: "bnb", pos: "ST", ovr: 88, photo: "img/players/mark.jpg", ...skater(88, "st"), gp: 8, goals: 5, assists: 0 },
    { id: "p-schwarz", name: "Ben Schwarz", teamId: "bnb", pos: "ST", ovr: 78, photo: "img/players/ben.jpg", ...skater(78, "st"), gp: 8, goals: 0, assists: 3 },
    { id: "p-fan", name: "Frank Fan", teamId: "bnb", pos: "CB", ovr: 81, photo: "img/players/frank.jpg", ...skater(81, "def"), gp: 8, goals: 0, assists: 2 },
    { id: "p-tober", name: "Mikey Tober", teamId: "bnb", pos: "ST", ovr: 84, photo: "img/players/mikey.jpg", ...skater(84, "st"), gp: 8, goals: 4, assists: 0 },

    { id: "p-grislis", name: "Brady Grislis", teamId: "showtime", pos: "ST", ovr: 97, photo: "img/players/brady.jpg", ...skater(97, "st"), gp: 8, goals: 8, assists: 0 },
    { id: "p-hayward", name: "James Hayward", teamId: "showtime", pos: "GK", ovr: 87, photo: "img/players/james.jpg", ...skater(87, "gk"), gp: 8, goals: 0, assists: 0, saves: 0 },
    { id: "p-gerum", name: "Max Gerum", teamId: "showtime", pos: "CB", ovr: 84, photo: "img/players/max.jpg", ...skater(84, "def"), gp: 8, goals: 0, assists: 3 },
    {
      id: "p-pacheco",
      name: "Colten Pacheco",
      aka: "Stache",
      teamId: "showtime",
      pos: "ST",
      ovr: 90,
      photo: "img/players/colten.jpg",
      ...skater(90, "st"),
      gp: 8, goals: 5, assists: 0,
    },
  ],
  games: [
    // Week 1 — Mon Sep 21 & Wed Sep 23
    { id: "g01", week: 1, date: "2026-09-21", homeId: "dukes", awayId: "rico", home: 2, away: 1, played: true, predHome: 2, predAway: 1, label: "Week 1 Showcase Championship", events: [{ playerId: "p-dono", goals: 1 }, { playerId: "p-schindler", goals: 1 }, { playerId: "p-dorian", assists: 1 }, { playerId: "p-rivet", goals: 1 }, { playerId: "p-goldstein", assists: 1 }] },
    { id: "g02", week: 1, date: "2026-09-21", homeId: "bnb", awayId: "showtime", home: 2, away: 1, played: true, predHome: 1, predAway: 2, events: [{ playerId: "p-varano", goals: 1 }, { playerId: "p-tober", goals: 1 }, { playerId: "p-schwarz", assists: 1 }, { playerId: "p-grislis", goals: 1 }] },
    { id: "g03", week: 1, date: "2026-09-23", homeId: "dukes", awayId: "bnb", home: 1, away: 1, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-dono", goals: 1 }, { playerId: "p-varano", goals: 1 }] },
    { id: "g04", week: 1, date: "2026-09-23", homeId: "rico", awayId: "showtime", home: 2, away: 1, played: true, predHome: 1, predAway: 2, events: [{ playerId: "p-rivet", goals: 1 }, { playerId: "p-proulx", goals: 1 }, { playerId: "p-goldstein", assists: 1 }, { playerId: "p-grislis", goals: 1 }, { playerId: "p-gerum", assists: 1 }] },
    // Week 2 — Sun Sep 27 & Wed Sep 30
    { id: "g05", week: 2, date: "2026-09-27", homeId: "dukes", awayId: "showtime", home: 0, away: 2, played: true, predHome: 1, predAway: 2, events: [{ playerId: "p-grislis", goals: 1 }, { playerId: "p-pacheco", goals: 1 }, { playerId: "p-gerum", assists: 1 }] },
    { id: "g06", week: 2, date: "2026-09-27", homeId: "rico", awayId: "bnb", home: 1, away: 1, played: true, predHome: 1, predAway: 1, events: [{ playerId: "p-rivet", goals: 1 }, { playerId: "p-tober", goals: 1 }, { playerId: "p-fan", assists: 1 }] },
    { id: "g07", week: 2, date: "2026-09-30", homeId: "rico", awayId: "dukes", home: 2, away: 0, played: true, predHome: 1, predAway: 2, events: [{ playerId: "p-rivet", goals: 2 }, { playerId: "p-gordon", assists: 1 }] },
    { id: "g08", week: 2, date: "2026-09-30", homeId: "showtime", awayId: "bnb", home: 3, away: 1, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-grislis", goals: 2 }, { playerId: "p-pacheco", goals: 1 }, { playerId: "p-varano", goals: 1 }, { playerId: "p-schwarz", assists: 1 }] },
    // Week 3 — Sun Oct 4 & Wed Oct 7
    { id: "g09", week: 3, date: "2026-10-04", homeId: "bnb", awayId: "dukes", home: 2, away: 1, played: true, predHome: 1, predAway: 2, events: [{ playerId: "p-varano", goals: 1 }, { playerId: "p-tober", goals: 1 }, { playerId: "p-fan", assists: 1 }, { playerId: "p-dono", goals: 1 }, { playerId: "p-schindler", assists: 1 }] },
    { id: "g10", week: 3, date: "2026-10-04", homeId: "showtime", awayId: "rico", home: 1, away: 2, played: true, predHome: 2, predAway: 0, events: [{ playerId: "p-pacheco", goals: 1 }, { playerId: "p-rivet", goals: 1 }, { playerId: "p-proulx", goals: 1 }, { playerId: "p-goldstein", assists: 1 }] },
    { id: "g11", week: 3, date: "2026-10-07", homeId: "showtime", awayId: "dukes", home: 2, away: 2, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-grislis", goals: 1 }, { playerId: "p-pacheco", goals: 1 }, { playerId: "p-gerum", assists: 1 }, { playerId: "p-dono", goals: 1 }, { playerId: "p-schindler", goals: 1 }] },
    { id: "g12", week: 3, date: "2026-10-07", homeId: "bnb", awayId: "rico", home: 0, away: 1, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-rivet", goals: 1 }] },
    // Week 4 — Sun Oct 11 & Wed Oct 14
    { id: "g13", week: 4, date: "2026-10-11", homeId: "dukes", awayId: "rico", home: 3, away: 1, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-dono", goals: 2 }, { playerId: "p-schindler", goals: 1 }, { playerId: "p-dorian", assists: 1 }, { playerId: "p-rivet", goals: 1 }, { playerId: "p-gordon", assists: 1 }] },
    { id: "g14", week: 4, date: "2026-10-11", homeId: "showtime", awayId: "bnb", home: 1, away: 0, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-grislis", goals: 1 }] },
    { id: "g15", week: 4, date: "2026-10-14", homeId: "bnb", awayId: "dukes", home: 2, away: 2, played: true, predHome: 1, predAway: 1, events: [{ playerId: "p-varano", goals: 1 }, { playerId: "p-tober", goals: 1 }, { playerId: "p-schwarz", assists: 1 }, { playerId: "p-dono", goals: 1 }, { playerId: "p-schindler", goals: 1 }, { playerId: "p-dorian", assists: 1 }] },
    { id: "g16", week: 4, date: "2026-10-14", homeId: "showtime", awayId: "rico", home: 2, away: 1, played: true, predHome: 2, predAway: 1, events: [{ playerId: "p-grislis", goals: 1 }, { playerId: "p-pacheco", goals: 1 }, { playerId: "p-rivet", goals: 1 }, { playerId: "p-goldstein", assists: 1 }] },
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
        { teamId: "showtime", rank: 1, prev: 4, note: "Brady Grislis at 97 OVR is the best player in Fret Footy. Hayward is a 87 in net." },
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
      body: "Brady Grislis at 97 OVR is the best player in Fret Footy. Hayward is a 87 in net.",
    },
  },
};
