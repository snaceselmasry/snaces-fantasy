/* ============================================================
   تحديث data/fpl.json من واجهة FPL الرسمية (الموسم الحالي)
   بدون أي مفتاح — bootstrap-static + fixtures
   ============================================================ */
import { writeFileSync } from "node:fs";

const BASE = process.env.FPL_BASE || "https://fantasy.premierleague.com/api/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function jget(url, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (r.status === 429 || r.status >= 500) { last = new Error("HTTP " + r.status); await sleep(3000 * i); continue; }
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { last = e; await sleep(1500 * i); }
  }
  throw last;
}

const pk = (o, ks) => Object.fromEntries(ks.map(k => [k, o[k]]));

const b = await jget(BASE + "bootstrap-static/");
await sleep(1200);
const fx = await jget(BASE + "fixtures/");
if (!b.elements?.length || !b.teams?.length) throw new Error("bootstrap ناقص");

const cur = (b.events || []).find(e => e.is_current) || (b.events || []).find(e => e.is_next);

const out = {
  updated: new Date().toISOString(),
  season: b.game_settings ? b.game_settings.season : cur ? new Date(cur.deadline_time).getFullYear() : null,
  total_players: b.total_players,
  elements: b.elements.map(p => ({
    ...pk(p, [
      "id", "web_name", "first_name", "second_name", "team", "element_type", "now_cost",
      "total_points", "points_per_game", "form", "selected_by_percent", "minutes",
      "expected_goals", "goals_scored", "assists", "clean_sheets", "status", "news", "bonus",
      "cost_change_start", "cost_change_event", "cost_change_start_fall", "cost_change_event_fall",
      "transfers_in_event", "transfers_out_event", "transfers_in", "transfers_out",
      "chance_of_playing_next_round"
    ]),
    /* FPL بيرجّع photo زي "123456.jpg" — نحوّله لاسم ملف الصورة على CDN */
    photo: p.photo ? "p" + String(p.photo).replace(/^p/, "").replace(/\.(jpg|jpeg|png)$/i, "") + ".png" : null
  })),
  teams: b.teams.map(t => pk(t, ["id", "name", "short_name", "code"])),
  events: b.elements && b.events
    ? b.events.map(e => pk(e, ["id", "name", "is_current", "is_next", "finished", "deadline_time"]))
    : [],
  fixtures: fx
    .filter(f => f.event)
    .map(f => pk(f, ["event", "team_h", "team_a", "team_h_difficulty", "team_a_difficulty", "finished"]))
};

writeFileSync("data/fpl.json", JSON.stringify(out));
console.log("ok FPL | موسم:", out.season, "| لاعبين:", out.elements.length, "| فرق:", out.teams.length,
  "| جولات:", out.events.length, "| مباريات:", out.fixtures.length,
  "| الجولة الحالية:", (out.events.find(e => e.is_current) || {}).id,
  "| الجاية:", (out.events.find(e => e.is_next) || {}).id);
const top = out.elements.slice().sort((a, b) => b.total_points - a.total_points).slice(0, 3);
console.log("أعلى 3:", top.map(p => p.web_name + " " + p.total_points).join(" | "));
