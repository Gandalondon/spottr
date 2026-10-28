
/* =================== data =================== */
const MAP = window.BLUE_GATE;
const R = MAP.rows.map(([k, c, n, y, x]) => ({ k, c, n, y, x }));
const pt = (n, y, x) => ({ n, y, x });
const byName = s => R.find(r => r.n.toLowerCase().includes(s.toLowerCase()));
const fromRow = (r, label) => r ? pt(label || r.n, r.y, r.x) : null;

const EXITS = R.filter(r => r.c === "extraction").map(r => pt(r.n, r.y, r.x));
const HATCHES = R.filter(r => r.c === "hatch").map(r => pt(r.n, r.y, r.x));
const ENEMIES = {};
R.filter(r => r.k === "a").forEach(r => { (ENEMIES[r.c] = ENEMIES[r.c] || []).push(pt(r.c, r.y, r.x)); });

/* places you can say you're at (names from MetaForge markers) */
const P = (n, y, x, al) => ({ n, y, x, al });
const PLACES = [
  ...EXITS.map(e => P(e.n, e.y, e.x, [e.n.split(" ")[0].toLowerCase()])),
  ...HATCHES.map(e => P(e.n, e.y, e.x, [e.n.toLowerCase(), e.n.split(" ")[0].toLowerCase() + " hatch"])),
  P("Blue Gate Village", 3180, 5753, ["village"]),
  P("Pilgrim's Peak", 3245, 9568, ["pilgrim", "peak tower"]),
  P("the Communication Tower", 3374, 9539, ["communication tower", "comms tower", "comm tower", "radio tower"]),
  P("the Cellar", 6684, 6461, ["cellar"]),
  P("the Security Wing", 3922, 7049, ["security wing"]),
  P("the Control Room", 4206, 7380, ["control room"]),
  P("the Confiscation Room", 4017, 7387, ["confiscation room"]),
  P("the Checkpoint", 5800, 5918, ["checkpoint"]),
  P("the Traffic Tunnel", 4367, 7335, ["traffic tunnel", "the tunnel"]),
  P("the Olive Grove", 6329, 6683, ["olive grove", "olives"]),
  P("the Collapsed Highway", 5430, 4553, ["collapsed highway", "highway"]),
  P("the Barren Clearing", 3695, 4528, ["barren clearing", "clearing"]),
  P("the Maintenance Bunker", 5818, 7518, ["maintenance bunker", "bunker"]),
  P("the Enelica Building", 5721, 7795, ["enelica"]),
  P("the Abandoned Housing Project", 4879, 9485, ["housing project", "abandoned housing"]),
  P("the Raider Camp", 5252, 8836, ["raider camp"]),
  P("the Ancient Fort", 7025, 7501, ["ancient fort", "fort"])
];

/* quests: steps follow the in-game order; pins from MetaForge quest markers */
const HTR = n => fromRow(byName("Part " + n + " -"), "Step " + n);
const QUESTS = [
  { n: "Home to Roost", al: ["home to roost", "roost"], who: "Shani",
    note: "Steps placed by MetaForge. Route in our own words from Destructoid and All Things How. It's underground, so the star marks the spot above you.",
    steps: [
      { t: "Reach the back of the Blue Gate tunnels", go: "Head into the traffic tunnels and keep left, past the burnt-out vehicles, to the back wall.", show: "Into the tunnels. Keep left to the back wall.", pin: HTR(1), al: ["back of the tunnel", "tunnel entrance", "the tunnels"] },
      { t: "Scan an Android at the back of the Traffic Tunnels", go: "At the back wall, the Android stands behind a booth. Get close to scan it.", show: "Android behind the booth. Get close to scan.", pin: HTR(2), al: ["android", "scan"] },
      { t: "Head to the MANTIKOR locker room", go: "From the Android, take the route on your right to a short staircase and a door into the Security Wing. Go up the second short flight. The locker room door is immediately on your right. You may need to breach it.", show: "Right from the Android. Up two flights. Door on your right.", pin: HTR(3), al: ["mantikor", "locker room"] },
      { t: "Search the locker room for clues", go: "Interact with the mural on the back wall of the locker room.", show: "Mural on the back wall.", pin: HTR(4), al: ["clue", "mural"] },
      { t: "Read the final vehicle weighing logs", go: "Go back down the stairs to the platform over the underground garage. The weighing station is among the parked vehicles, panel on its right side.", show: "Down to the garage platform. Panel on the weighing station's right.", pin: HTR(5), al: ["weighing", "logs", "weigh"] },
      { t: "Optional: find the hidden key", go: "Behind the concrete barrier next to the weighing terminal. It opens the Confiscation Room, so grab it if you haven't got one.", show: "Behind the barrier by the weighing terminal.", pin: HTR(6), al: ["hidden key", "the key", "spare key"] },
      { t: "Enter the Confiscation Room", go: "Back up on the Security Wing platform, with the stairs on your right. The door is locked and needs the Confiscation Room key.", show: "Up to the Security Wing platform. Locked door, use the key.", pin: HTR(7), al: ["confiscation"] },
      { t: "Send MANTIKOR's last security recordings to Shani", go: "Inside the Confiscation Room, the white box is on top of the central server rack. Climb the rack or the crates beside it.", show: "White box on top of the server rack. Climb up.", pin: HTR(8), al: ["recording", "white box", "server rack"] }
    ] },
  { n: "Nothing Ventured", al: ["nothing ventured"], who: "Apollo", note: "Spawn points: MetaForge.",
    steps: [
      { t: "Destroy 3 Comets", enemy: "comet" }, { t: "Destroy 5 Rocketeers", enemy: "rocketeer" }, { t: "Destroy 2 Sentinels", enemy: "sentinel" },
      { t: "Deliver 3 Comet Igniters to Apollo", go: "Comet Igniters drop from Comets." }, { t: "Deliver 3 Rocketeer Drivers to Apollo", go: "Rocketeer Drivers drop from Rocketeers." },
      { t: "Deliver 6 ARC Circuitry to Apollo" }, { t: "Deliver 6 ARC Motion Cores to Apollo" }
    ] },
  { n: "Wires Crossed", al: ["wires crossed", "snitch scanner"], who: "Celeste", note: "Position: MetaForge.",
    steps: [
      { t: "On Blue Gate, attach a Snitch Scanner to the antenna at Pilgrim's Peak", go: "The antenna is on Pilgrim's Peak, in the north-east.", pin: fromRow(byName("attach a Snitch Scanner"), "Antenna") },
      { t: "On Spaceport, attach a Surveyor Vault to the antenna on the Launch Towers", go: "Spottr only has Blue Gate's map so far." },
      { t: "On Buried City, attach a Sentinel Firing Core to the antenna on the Grandioso Apartments roof", go: "Spottr only has Blue Gate's map so far." }
    ] },
  { n: "The First Nomads", al: ["first nomads", "nomads"], who: "", note: "Positions: MetaForge.",
    steps: [
      { t: "Reach the Security Wing", pin: fromRow(byName("1. Reach the Security Wing"), "Security Wing") },
      { t: "Find the Control Room in the Security Wing", pin: fromRow(byName("2. Find the Control Room"), "Control Room") },
      { t: "Use the frequency converter in the Control Room", pin: fromRow(byName("3. Use the frequency converter"), "Frequency converter") },
      { t: "Reach the antenna at Pilgrim's Peak", pin: fromRow(byName("4. Reach the Antenna"), "Antenna") },
      { t: "Search the antenna exterior for tampered frequency boosters", pin: fromRow(byName("5. Search the Antenna"), "Antenna exterior") }
    ] },
  { n: "A Path Not Yours", al: ["path not yours", "bilguun"], who: "", note: "Positions: MetaForge.",
    steps: [
      { t: "Find the start of the Nomad trail under the Highway Collapse", pin: fromRow(byName("1. Find the start of the Nomad trail"), "Trail start") },
      { t: "Follow the trail markers to the Nomad hideout", pin: fromRow(byName("2. Follow the trail markers"), "Hideout") },
      { t: "Find Bilguun's gift at the buried cache under the hideout", pin: fromRow(byName("3. Find Bilguun's gift"), "Buried cache") },
      { t: "Loot the secret stash in Bilguun's hideout", pin: fromRow(byName("4. Loot the secret stash"), "Secret stash") }
    ] },
  { n: "A First Foothold", al: ["first foothold", "foothold"], who: "", note: "Positions: MetaForge.",
    steps: [
      { t: "Rotate the satellite dishes", pin: fromRow(byName("Rotate Satellite Dishes"), "Satellite dishes"), al: ["satellite", "dishes"] },
      { t: "Stabilise the observation deck", pin: fromRow(byName("Stabilize Observation Deck"), "Observation deck"), al: ["observation deck"] },
      { t: "Enable the comms terminal", pin: fromRow(byName("Enable Comms Terminal"), "Comms terminal"), al: ["comms terminal"] },
      { t: "Nail down the roof plates", pin: fromRow(byName("Nail Down Roof Plates"), "Roof plates"), al: ["roof plates"] }
    ] },
  { n: "Reduced to Rubble", al: ["reduced to rubble", "rubble"], who: "", note: "Positions: MetaForge.",
    steps: [
      { t: "Take a photo of the Collapsed Highway", pin: fromRow(byName("Take a photo of the Collapsed"), "Photo spot"), al: ["photo"] },
      { t: "Go to the Broken Earth", pin: fromRow(byName("Go to the Broken Earth"), "Broken Earth"), al: ["broken earth"] },
      { t: "Follow the trail of destruction", pin: fromRow(byName("Follow the trail of destruction"), "Trail"), al: ["trail"] },
      { t: "Investigate the unknown ARC machines", pin: fromRow(byName("Investigate the Unknown Arc"), "ARC machines"), al: ["unknown arc", "machines"] }
    ] },
  { n: "Bait, Fetch, Blast", al: ["bait", "fetch", "blast", "bully"], who: "Apollo",
    steps: [ { t: "Destroy a Bully, its head, or 4 of its legs", go: "This one's on Pendola Pass. Spottr only has Blue Gate's map so far." }, { t: "Deliver a Bully Fragmenter to Apollo", go: "The Fragmenter comes from the Bully." } ] },
  { n: "Taking Stock", al: ["taking stock"], who: "Cassio",
    steps: [ { t: "On Stella Montis, photograph the sculpture in the Atrium" }, { t: "On Spaceport, photograph a Baron Husk" }, { t: "Deliver 3 Industrial Batteries to the Nomadic Envoy" }, { t: "Ping a Bombardier on Dam, or a Bastion on Buried City" } ] },
  { n: "Boarding the Frigate", al: ["frigate"], who: "Shani",
    steps: [ { t: "Find a way onto the Frigate's top" }, { t: "Damage a Hydra, a Vaporizer and a Rocketeer" } ] },
  { n: "Belly of the Beast", al: ["belly", "emperor"], who: "Shani",
    steps: [ { t: "Enter the Emperor" }, { t: "Find the source of the Emperor's power" }, { t: "Find out what happens to Harvester Payloads inside" }, { t: "Find where the Payloads are stored" }, { t: "Search 5 containers inside the Emperor" }, { t: "Take a unique piece of Emperor loot" } ] }
];
const OTHER_MAPS = ["dam", "spaceport", "buried city", "stella montis", "pendola", "riven tides"];
const ENEMY_WORDS = Object.keys(ENEMIES);

/* =================== state =================== */
const EMPTY = { place: null, placeAt: null, minutesLeft: null, minutesAt: null, quest: null, step: 0, last: null, raidAt: null, pending: null };
let S = Object.assign({}, EMPTY);
try { const saved = JSON.parse(localStorage.getItem("spottr-state") || "null"); if (saved) S = Object.assign(S, saved); } catch (e) {}
function save() { try { localStorage.setItem("spottr-state", JSON.stringify(S)); } catch (e) {} }
const inRaid = () => S.raidAt && Date.now() - S.raidAt < 40 * 60 * 1000;
function minsNow() { if (S.minutesLeft == null) return null; return Math.max(0, Math.round(S.minutesLeft - (Date.now() - S.minutesAt) / 60000)); }

/* =================== geometry (y grows south, as MetaForge draws it) =================== */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function compass(from, to) {
  const a = (Math.atan2(to.x - from.x, -(to.y - from.y)) * 180 / Math.PI + 360) % 360;
  return ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(a / 45) % 8];
}
const near = (p, list) => list.slice().sort((a, b) => dist(p, a) - dist(p, b))[0];

/* =================== understanding =================== */
const has = (t, words) => words.some(w => t.includes(w));
const norm = raw => " " + raw.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ") + " ";
function findPlace(t) { return PLACES.find(p => p.al.some(a => t.includes(a))); }
function findQuest(t) { return QUESTS.find(q => q.al.some(a => t.includes(a))); }
const placeAge = () => S.placeAt ? (Date.now() - S.placeAt) / 60000 : Infinity;
function posState() { if (!S.place) return "none"; const a = placeAge(); return a < 2 ? "fresh" : a <= 10 ? "stale" : "none"; }
const NEAREST = ["nearest", "closest", "which way", "quickest", "how do i get", "way out", "get out", "where can i", "where do i", "where should i"];
const LISTING = [" all ", "list", "how many", "what are the"];

function askWhere(raw) {
  S.pending = { q: raw, asks: S.pending ? S.pending.asks : 0 }; save();
  return { show: "Where are you?", say: "Where are you? Name something you can see, like an airshaft, a hatch or a building." };
}
function askStill(raw) {
  S.pending = { q: raw, asks: S.pending ? S.pending.asks : 0 }; save();
  return { show: "Still near " + S.place.n + "?", say: "Are you still near " + S.place.n + "? You told me " + Math.round(placeAge()) + " minutes ago.", ctx: "Say yes, or where you are now" };
}
function resolvePending(q) {
  const p = S.pending, t = norm(q);
  const place = findPlace(t);
  if (place) { S.place = place; S.placeAt = Date.now(); S.raidAt = S.raidAt || Date.now(); S.pending = null; save(); const a = answer(p.q); a.say = "Got it. " + a.say; return a; }
  if (/\b(yes|yeah|yep|yup|still|same|correct)\b/.test(t) && S.place) { S.placeAt = Date.now(); S.pending = null; save(); return answer(p.q); }
  if (/(don't know|dont know|no idea|not sure|lost|no clue|skip)/.test(t)) { S.pending = null; save(); return answer(p.q, { general: true }); }
  if (/\b(no|nope|moved)\b/.test(t)) { S.place = null; save(); return askWhere(p.q); }
  const newQ = has(t, ["extract", "exit", "quest", "where's", "where is", "what", "died", "new raid", "recap", "where were we", "step", "next", "done", ...ENEMY_WORDS]) || findQuest(t);
  if (newQ) { S.pending = null; save(); return null; }
  p.asks += 1; save();
  if (p.asks >= 2) { S.pending = null; save(); const a = answer(p.q, { general: true }); a.say = "I can't place that, so here's everything. " + a.say; return a; }
  return { show: "Can you see an airshaft, a hatch or a tower?", say: "I can't place that. Can you see an airshaft, a hatch or a tower?" };
}

const NUM = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, first:1, second:2, third:3, fourth:4, fifth:5, sixth:6, seventh:7, eighth:8, last:99 };
function stepAnswer(q, i, prefix) {
  i = Math.max(0, Math.min(i, q.steps.length - 1));
  const st = q.steps[i];
  S.quest = q.n; S.step = i; save();
  let go = st.go || "";
  let map = null;
  const you = posState() === "fresh" ? S.place : null;
  if (st.enemy) {
    const pts = ENEMIES[st.enemy] || [];
    if (pts.length) {
      if (you) { const b = near(you, pts); map = { you, stars: [b], others: pts.filter(p => p !== b) }; go = go || "Nearest " + st.enemy + " spawn is " + compass(you, b) + " of you."; }
      else { map = { you: null, stars: pts, others: [] }; go = go || pts.length + " " + st.enemy + " spawn points on Blue Gate."; }
    } else go = go || "I have no " + st.enemy + " spawn points on Blue Gate.";
  }
  if (st.pin) { map = { you, stars: [st.pin], others: [] }; if (you) go += (go ? " " : "") + "It's " + compass(you, st.pin) + " of you."; }
  if (!go) go = st.pin ? "It's marked on the map." : "I don't have a verified location for this step yet.";
  const last = i === q.steps.length - 1;
  const tail = last ? (q.who ? " That's the last step. Then hand it in to " + q.who + "." : " That's the last step.") : " Say done when you've finished.";
  const firstSentence = s => (s.match(/^[^.!?]*[.!?]/) || [s])[0];
  const show = st.show || (st.pin && !st.go ? st.t + "." : firstSentence(go));
  const say = (prefix || "") + "Step " + (i + 1) + ", " + st.t.charAt(0).toLowerCase() + st.t.slice(1) + ". " + go;
  return { show, say, full: say + tail, ctx: q.n + ", step " + (i + 1) + " of " + q.steps.length, map, text: show };
}
function stepIntent(t) {
  const named = findQuest(t);
  const cur = named || QUESTS.find(q => q.n === S.quest);
  if (!cur) return null;
  const sm = t.match(/step\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/) || t.match(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|last)\s+step/);
  if (sm) { const n = NUM[sm[1]] || parseInt(sm[1], 10); return stepAnswer(cur, n - 1); }
  if (named && named.n !== S.quest) return stepAnswer(named, 0, "Starting at step 1. Tell me if you're further in. ");
  const hit = cur.steps.findIndex(s => (s.al || []).some(a => t.includes(a)));
  if (hit >= 0 && hit !== (S.step || 0)) return stepAnswer(cur, hit, "That's step " + (hit + 1) + ". ");
  if (has(t, [" done ", " next ", "did that", "found it", "finished", "already done", "what now", "completed", "got that"])) {
    const i = (S.step || 0) + 1;
    if (i >= cur.steps.length) { S.step = cur.steps.length - 1; save(); return { show: cur.who ? "All done. Hand it in to " + cur.who + "." : "All done.", say: "That was the last step of " + cur.n + "." + (cur.who ? " Hand it in to " + cur.who + "." : ""), ctx: cur.n }; }
    return stepAnswer(cur, i);
  }
  if (has(t, ["previous", "go back a step", "step back"])) return stepAnswer(cur, (S.step || 0) - 1);
  if (named || hit >= 0 || has(t, ["where is it", "where do i go", "this step", "how do i get there", "what step", "where am i up to"])) return stepAnswer(cur, S.step || 0);
  return null;
}

function answer(raw, opts) {
  opts = opts || {};
  const t = norm(raw);
  const terse = inRaid();
  const ps = opts.general ? "general" : posState();

  if (has(t, ["that's all", "thats all", "stop listening", "thanks", "thank you", "cheers", "that's it", "thats it"]) && t.trim().split(" ").length <= 4) return { show: "Standing by.", say: "Standing by.", follow: false, keepLast: true };
  if (S.last && S.last.a && has(t, ["more detail", "more details", "tell me more", "say again", "say that again", "repeat", "not sure", "didn't catch", "didnt catch", " what ", "pardon", "explain"]) && t.trim().split(" ").length <= 6) {
    const a = Object.assign({}, S.last.a); a.say = a.full || a.say; return a;
  }
  if (has(t, [" new raid", "just spawned", " spawned"])) { S.place = null; S.pending = null; S.minutesLeft = null; S.raidAt = Date.now(); save(); return { show: "New raid. Good luck.", say: "New raid. Good luck. I'll ask where you are when an answer needs it." }; }
  if (has(t, [" i died", " died ", " dead "])) { S.place = null; S.minutesLeft = null; S.raidAt = null; save(); return { show: "Unlucky. Your quest's still here.", say: "Unlucky. Your quest and step are still here when you drop back in.", ctx: S.quest ? S.quest + ", step " + ((S.step || 0) + 1) : "" }; }
  if (has(t, ["extracted", " made it out", " got out "])) { S.place = null; S.minutesLeft = null; S.raidAt = null; save(); return { show: "Nice. Raid cleared.", say: "Nice one. Raid cleared." }; }
  if (has(t, ["where were we", "recap"])) {
    const bits = [];
    const cq = QUESTS.find(q => q.n === S.quest);
    if (cq) bits.push("You're on " + cq.n + ", step " + ((S.step || 0) + 1) + ": " + cq.steps[S.step || 0].t + ".");
    if (S.place) bits.push("Last place you told me: " + S.place.n + ".");
    const m = minsNow(); if (m != null) bits.push("About " + m + " minutes left, from what you told me.");
    const s = bits.length ? bits.join(" ") : "Nothing yet. Tell me a quest, or where you are.";
    return { show: cq ? cq.n + ", step " + ((S.step || 0) + 1) + "." : "Nothing yet.", say: s, ctx: cq ? cq.steps[S.step || 0].t : "" };
  }

  const mm = t.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(minute|min)/);
  if (mm) { S.minutesLeft = NUM[mm[1]] || parseInt(mm[1], 10); S.minutesAt = Date.now(); S.raidAt = S.raidAt || Date.now(); save(); }

  const placeMention = findPlace(t);
  const setsLocation = placeMention && (/\b(i'm|i am|im)\s+(at|near|in|by|next to|outside|on)\b/.test(t) || (/\b(at|near|by)\b/.test(t) && !has(t, ["where", "how"])));
  if (setsLocation) {
    S.place = { n: placeMention.n, y: placeMention.y, x: placeMention.x }; S.placeAt = Date.now(); S.raidAt = S.raidAt || Date.now(); save();
    if (!has(t, ["extract", "exit", "out", "leave", "step", "where", ...ENEMY_WORDS])) return { show: "Got it. " + placeMention.n.charAt(0).toUpperCase() + placeMention.n.slice(1) + ".", say: "Got it, " + placeMention.n + "." };
  }
  const psNow = opts.general ? "general" : posState();

  const stepRes = stepIntent(t);
  if (stepRes) return stepRes;

  const otherMap = OTHER_MAPS.find(m => t.includes(m));
  if (otherMap && !has(t, ["blue gate"])) return { show: "Blue Gate only, for now.", say: "I only have Blue Gate's map so far." };

  if (has(t, ["extract", "exit", "way out", "get out", "get me out", "out of here", "leave", "airshaft", "evac", "escape"])) {
    const m = minsNow(); const urgent = m != null && m <= 2; const rush = m != null && m <= 5 ? "Move now. " : "";
    const wantsNearest = !has(t, LISTING);
    if (wantsNearest && !urgent && psNow === "stale") return askStill(raw);
    if (wantsNearest && !urgent && psNow === "none") return askWhere(raw);
    if (psNow !== "fresh" || !wantsNearest) {
      const tail = urgent ? " Tell me where you are for the nearest." : "";
      return { show: (rush ? "Move. " : "") + "Four airshafts, starred.", say: rush + "There are four airshafts: Warehouse, Overlook, Forest and Cliffside. They're all starred on the map." + tail, map: { you: psNow === "fresh" ? S.place : null, stars: EXITS } };
    }
    const best = near(S.place, EXITS);
    const dir = compass(S.place, best);
    return { show: (rush ? "Move. " : "") + best.n + ", " + dir + ".", say: rush + "Head " + dir + " to " + best.n + ". It's your nearest way out." + (terse ? "" : " A hatch can be closer, but you'd need a Raider Hatch key."), map: { you: S.place, stars: [best] } };
  }
  if (has(t, ["hatch"])) {
    if (psNow === "fresh") { const b = near(S.place, HATCHES); const dir = compass(S.place, b); return { show: b.n + ", " + dir + ". Needs a key.", say: "The nearest hatch is " + b.n + ", " + dir + " of you. You'll need a Raider Hatch key.", map: { you: S.place, stars: [b] } }; }
    return { show: "Four hatches, starred. Needs a key.", say: "There are four Raider Hatches: Prefab, Fragrant, Lucky and Reinforced. They're starred on the map, and you'll need a key.", map: { you: null, stars: HATCHES } };
  }

  const enemy = ENEMY_WORDS.find(k => t.includes(k));
  if (enemy) {
    const pts = ENEMIES[enemy];
    const wantsNearest = has(t, NEAREST);
    if (wantsNearest && psNow === "stale") return askStill(raw);
    if (wantsNearest && psNow === "none") return askWhere(raw);
    const E = enemy.charAt(0).toUpperCase() + enemy.slice(1);
    if (psNow === "fresh") { const b = near(S.place, pts); const dir = compass(S.place, b); return { show: "Nearest " + E + ": " + dir + ".", say: "The nearest " + enemy + " spawn is " + dir + " of you.", map: { you: S.place, stars: [b] } }; }
    return { show: pts.length + " " + E + " spawns, starred.", say: "There are " + pts.length + " " + enemy + " spawn points on Blue Gate. They're starred on the map. Tell me where you are and I'll find the nearest.", map: { you: null, stars: pts } };
  }

  if (placeMention && has(t, ["where"])) {
    const P1 = placeMention.n.charAt(0).toUpperCase() + placeMention.n.slice(1);
    const dir = psNow === "fresh" ? compass(S.place, placeMention) : "";
    return { show: P1 + (dir ? ", " + dir + "." : "."), say: P1 + (dir ? " is " + dir + " of you." : " is starred on the map."), map: { you: psNow === "fresh" ? S.place : null, stars: [placeMention] } };
  }
  if (has(t, ["grandioso", "launch tower"])) return { show: "Blue Gate only, for now.", say: "That's on another map. I only have Blue Gate so far." };

  return { show: "Say again?", say: "Sorry, say that again? You can tell me a quest and step, or ask for the way out.", ctx: "Try: I'm on Home to Roost, step 3" };
}

/* =================== voice: native app or browser =================== */
const CAP = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() ? window.Capacitor.Plugins : null;
const WebRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let voice = null;
function pickVoice() { try { const v = speechSynthesis.getVoices(); voice = v.find(x => /en-GB/i.test(x.lang)) || v.find(x => /^en/i.test(x.lang)) || null; } catch (e) {} }
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}
let speakId = 0;
function speak(s, done) {
  if (!s) { if (done) done(); return; }
  const id = ++speakId;
  const fin = ok => { if (id !== speakId) return; setVoiceState("idle"); if (ok && done) done(); };
  setVoiceState("speaking");
  if (CAP && CAP.TextToSpeech) { CAP.TextToSpeech.stop().catch(() => {}).finally(() => CAP.TextToSpeech.speak({ text: s, lang: "en-GB", rate: 1.0 }).then(() => fin(true)).catch(() => fin(false))); return; }
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(s); if (voice) u.voice = voice; u.rate = 1.05; u.onend = () => fin(true); u.onerror = () => fin(false); speechSynthesis.speak(u); } catch (e) { fin(false); }
}
function stopSpeaking() { speakId++; setVoiceState("idle"); try { if (CAP && CAP.TextToSpeech) CAP.TextToSpeech.stop(); else speechSynthesis.cancel(); } catch (e) {} }

let listening = false, webRec = null;
function setVoiceState(s) {
  document.body.classList.toggle("speaking", s === "speaking");
  const label = { idle: "Tap to talk", listening: "Listening\u2026 tap to stop", speaking: "Speaking\u2026 tap to interrupt" }[s] || "Tap to talk";
  const el = document.getElementById("vstate"); if (el) el.textContent = label;
  const m = document.getElementById("mic"); if (m) { m.textContent = s === "listening" ? "graphic_eq" : s === "speaking" ? "volume_up" : "mic"; m.setAttribute("aria-label", label); }
}
async function listen(opts) {
  const auto = !!(opts && opts.auto);
  if (listening) { stopListening(); return; }
  if (document.body.classList.contains("speaking")) { stopSpeaking(); return; }
  stopSpeaking();
  if (!navigator.onLine) { showError("No connection. Speech recognition needs one on most phones. Check your Wi-Fi and tap again."); return; }
  if (CAP && CAP.SpeechRecognition) {
    try {
      const p = await CAP.SpeechRecognition.requestPermissions();
      if (p && p.speechRecognition && p.speechRecognition !== "granted") { showError("Spottr needs the microphone to hear you. Allow it in Settings, Apps, Spottr, Permissions."); return; }
      listening = true; renderListening();
      const r = await CAP.SpeechRecognition.start({ language: "en-GB", maxResults: 1, partialResults: false, popup: false });
      listening = false;
      const text = r && r.matches && r.matches[0];
      if (text) handle(text); else if (auto) renderBack(); else { renderBack(); showError("Didn't catch that. Tap and try again."); }
    } catch (e) { listening = false; renderBack(); if (!auto) showError("Didn't catch that. Tap and try again."); }
    return;
  }
  if (!WebRec) { showError("Voice isn't available here. Open Spottr on your phone."); return; }
  webRec = new WebRec(); webRec.lang = "en-GB"; webRec.interimResults = true; webRec.maxAlternatives = 1;
  let finalText = "";
  listening = true; renderListening();
  webRec.onresult = e => { let interim = ""; for (const r of e.results) { if (r.isFinal) finalText = r[0].transcript; else interim += r[0].transcript; } renderListening(finalText || interim); };
  webRec.onerror = e => {
    listening = false; renderBack();
    if (auto && (e.error === "no-speech" || e.error === "aborted")) return;
    const msg = e.error === "not-allowed" || e.error === "service-not-allowed" ? "Spottr needs the microphone. Allow it for this site in Chrome's settings." : e.error === "network" ? "Speech needs a connection. Check your Wi-Fi and tap again." : e.error === "no-speech" ? "Didn't hear anything. Tap and try again." : "Didn't catch that. Tap and try again.";
    showError(msg);
  };
  webRec.onend = () => { const was = listening; listening = false; if (finalText) handle(finalText); else if (was) renderBack(); };
  try { webRec.start(); } catch (e) { listening = false; renderBack(); }
}
function stopListening() { try { if (CAP && CAP.SpeechRecognition) CAP.SpeechRecognition.stop(); else if (webRec) webRec.stop(); } catch (e) {} }

/* =================== rendering =================== */
/* the big top word: same place and style on every screen; shrinks only when a line is too wide */
function setWord(txt, instr) {
  const w = document.getElementById("word");
  w.hidden = false; w.textContent = txt; w.style.fontSize = ""; w.style.lineHeight = "";
  w.classList.toggle("instr", !!instr);
  if (instr) return;
  requestAnimationFrame(() => {
    const avail = w.parentElement.clientWidth - (document.getElementById("close").hidden ? 0 : 64);
    w.style.whiteSpace = "pre";
    const need = w.scrollWidth;
    w.style.whiteSpace = "";
    if (need > avail && avail > 0) { const size = Math.max(32, Math.floor(72 * avail / need)); w.style.fontSize = size + "px"; w.style.lineHeight = size + "px"; }
  });
}
window.addEventListener("resize", () => { const w = document.getElementById("word"); setWord(w.textContent, w.classList.contains("instr")); });
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let lmap = null;
function clearMap() { if (lmap) { lmap.remove(); lmap = null; } }

function renderReady() {
  clearMap();
  document.body.classList.remove("listening", "session"); $("close").hidden = true;
  const hr = new Date().getHours();
  const part = hr < 5 ? "Evening" : hr < 12 ? "Morning" : hr < 18 ? "Afternoon" : "Evening";
  setWord(part + ",\nRaider.");
  const rows = ['<p class="big">What do you need help with?</p>'];
  const cq = QUESTS.find(q => q.n === S.quest);
  if (cq) { const i = Math.min(S.step || 0, cq.steps.length - 1); rows.push('<div><p class="big strong">' + esc(cq.n) + '</p><p class="small">Step ' + (i + 1) + " of " + cq.steps.length + ": " + esc(cq.steps[i].t) + "</p></div>"); }
  if (S.place) { const ago = Math.round(placeAge()); rows.push('<div><p class="big strong">Blue Gate</p><p class="small">At ' + esc(S.place.n) + (ago ? ", " + ago + (ago === 1 ? " minute" : " minutes") + " ago" : ", just now") + "</p></div>"); }
  const m = minsNow();
  if (m != null) rows.push('<div><p class="big strong' + (m <= 5 ? " warn" : "") + '">About ' + m + ' minutes left</p><p class="small">From what you told me, not live</p></div>');

  $("stage").innerHTML = '<div class="ctx">' + rows.join("") + "</div>";
}
function renderListening(partial) {
  clearMap(); setVoiceState("listening");
  document.body.classList.add("listening");
  setWord("Go\nahead.");
  $("stage").innerHTML = '<p class="big">' + esc(partial || "Listening…") + "</p>";
}
function renderBack() { setVoiceState("idle"); document.body.classList.remove("listening"); if (S.last) renderAnswer(S.last.q, S.last.a); else renderReady(); }
function showError(msg) { setVoiceState("idle"); document.body.classList.remove("listening"); document.body.classList.add("session"); $("close").hidden = false; clearMap(); setWord(msg, true); $("stage").innerHTML = ""; }

function renderAnswer(q, a) {
  clearMap();
  document.body.classList.remove("listening"); document.body.classList.add("session"); $("close").hidden = false;
  setWord(a.show || a.text || "", true);
  let html = a.ctx ? '<p class="ctxline">' + esc(a.ctx) + "</p>" : "";
  const hasMap = a.map && (a.map.stars.length || a.map.you);
  if (hasMap) html += '<div class="mapwrap"><div class="map" id="map" role="img" aria-label="' + esc(mapLabel(a.map)) + '"></div><div class="mapctl"><button type="button" id="zin" aria-label="Zoom in">add</button><button type="button" id="zout" aria-label="Zoom out">remove</button><button type="button" id="recentre" aria-label="Recentre">my_location</button><button type="button" id="full" aria-label="Whole map">zoom_out_map</button></div><div class="mapnote" id="mapnote" hidden></div></div>';
  $("stage").innerHTML = html;
  if (hasMap) drawMap(a.map);
}
function mapLabel(m) { const p = []; if (m.you) p.push("you at " + m.you.n); if (m.stars.length) p.push("starred " + m.stars.map(s => s.n).join(", ")); return "Blue Gate map: " + p.join("; "); }

const STAR = '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M16 2l4.1 9.4 10.2.9-7.8 6.8 2.3 10L16 23.9 7.2 29.1l2.3-10L1.7 12.3l10.2-.9z" fill="#F2B33D" stroke="#0F1218" stroke-width="2" stroke-linejoin="round"/></svg>';
const YOU = '<div style="width:24px;height:24px;border-radius:50%;background:#F2F0EA;border:4px solid #0F1218;box-shadow:0 0 0 2px #F2F0EA"></div>';
function drawMap(m) {
  if (!window.L) { $("mapnote").hidden = false; $("mapnote").textContent = "Map couldn't load."; return; }
  const [a, b, c, d] = MAP.transform;
  const crs = L.extend({}, L.CRS.Simple, { transformation: new L.Transformation(a, b, c, d) });
  lmap = L.map("map", { crs, zoomControl: false, attributionControl: true, minZoom: 0, maxZoom: 7, zoomSnap: 0.25, maxBounds: [[1500, 3000], [9000, 11500]], maxBoundsViscosity: 0.8 });
  lmap.attributionControl.setPrefix(false);
  let fails = 0;
  const tl = L.tileLayer(MAP.tiles, { tileSize: 512, maxNativeZoom: 5, noWrap: true, bounds: [[37.2, 78.5], [16218, 16271]], attribution: 'Map and markers: <a href="https://metaforge.app/arc-raiders" target="_blank" rel="noopener">MetaForge</a>' }).addTo(lmap);
  tl.on("tileerror", () => { fails++; if (fails === 3) { $("mapnote").hidden = false; $("mapnote").textContent = "Map needs a connection. The answer above still stands."; } });
  const ll = p => [p.y, p.x];
  if (m.you && m.stars.length === 1) L.polyline([ll(m.you), ll(m.stars[0])], { color: "#F2F0EA", weight: 3, opacity: .7, dashArray: "6 8" }).addTo(lmap);
  m.stars.forEach(p => {
    L.marker(ll(p), { icon: L.divIcon({ className: "", html: m.stars.length > 1 ? STAR.replace(/32/g, "24") : STAR.replace(/"32"/g, '"40"'), iconSize: m.stars.length > 1 ? [24, 24] : [40, 40], iconAnchor: m.stars.length > 1 ? [12, 13] : [20, 21] }), keyboard: false }).addTo(lmap);
  });
  if (m.you) L.marker(ll(m.you), { icon: L.divIcon({ className: "", html: YOU, iconSize: [24, 24], iconAnchor: [12, 12] }), keyboard: false }).addTo(lmap);
  const pts = [...m.stars, ...(m.you ? [m.you] : [])].map(ll);
  const frame = () => {
    if (pts.length === 1) lmap.setView(pts[0], 4);
    else lmap.fitBounds(L.latLngBounds(pts), { padding: [48, 64], maxZoom: 4.5 });
  };
  frame();
  $("zin").onclick = () => lmap.zoomIn(); $("zout").onclick = () => lmap.zoomOut();
  $("recentre").onclick = frame;
  $("full").onclick = () => lmap.fitBounds(MAP.bounds, { padding: [16, 16] });
}

/* =================== flow =================== */
function handle(q) {
  q = (q || "").trim(); if (!q) return;
  let a = S.pending ? resolvePending(q) : null;
  if (!a) a = answer(q);
  if (a.keepLast && S.last) { renderAnswer(S.last.q, S.last.a); speak(a.say); return; }
  S.last = { q, a }; save();
  renderAnswer(q, a);
  /* keep the conversation going: listen once more after each answer; silence ends it */
  speak(a.say, () => { if (a.follow !== false && !document.hidden) listen({ auto: true }); });
}
$("word").addEventListener("click", listen);

/* on the greeting screen, tapping anywhere talks */
$("stage").addEventListener("click", () => { if ($("close").hidden && !listening) listen(); });
$("mic").addEventListener("click", listen);
$("close").addEventListener("click", () => { stopSpeaking(); S = Object.assign({}, EMPTY); save(); renderReady(); });



if (S.last) renderAnswer(S.last.q, S.last.a); else renderReady();
async function keepAwake() { try { if (CAP && CAP.KeepAwake) await CAP.KeepAwake.keepAwake(); else if (navigator.wakeLock) await navigator.wakeLock.request("screen"); } catch (e) {} }
keepAwake(); document.addEventListener("visibilitychange", () => { if (!document.hidden) keepAwake(); });
if ("serviceWorker" in navigator && !CAP && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
