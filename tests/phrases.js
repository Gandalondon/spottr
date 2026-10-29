/* Relay understanding test set: what a player on a sofa actually says, mid-raid, with gunfire and half-heard words.
   Each case sets up where the player is, then says one thing. `want` is what Relay should do.
   want: quest + step (1-based) | advance (next step) | same (repeat the current step) | exit | died | newraid | extracted
         | place (they said where they are) | hatch | enemy | stop | fallback (genuinely meaningless) */
const HTR = { quest: "Home to Roost", step: 3 };   /* mid-quest: on step 3, just told to go to the locker room */
const NONE = {};
const AT_VILLAGE = { place: "Village" };
module.exports = [
  /* starting or switching a quest, said well and badly */
  { set: NONE, say: "I'm on Home to Roost, step 3", want: { quest: "Home to Roost", step: 3 } },
  { set: NONE, say: "home to boost step five", want: { quest: "Home to Roost", step: 5 } },
  { set: NONE, say: "I'm doing home to roast", want: { quest: "Home to Roost" } },
  { set: NONE, say: "the roost one, step two", want: { quest: "Home to Roost", step: 2 } },
  { set: NONE, say: "I'm on the frigate one", want: { quest: "Boarding the Frigate" } },
  { set: NONE, say: "nothing ventured", want: { quest: "Nothing Ventured" } },
  { set: NONE, say: "first nomads step 4", want: { quest: "The First Nomads", step: 4 } },
  { set: NONE, say: "reduced to rubble", want: { quest: "Reduced to Rubble" } },
  { set: NONE, say: "a path not yours", want: { quest: "A Path Not Yours" } },
  { set: NONE, say: "wires crossing", want: { quest: "Wires Crossed" } },
  { set: HTR, say: "step five", want: { quest: "Home to Roost", step: 5 } },
  { set: HTR, say: "I'm on five now", want: { quest: "Home to Roost", step: 5 } },
  { set: HTR, say: "the fifth one", want: { quest: "Home to Roost", step: 5 } },
  { set: HTR, say: "skip to step 7", want: { quest: "Home to Roost", step: 7 } },
  { set: HTR, say: "go back a step", want: { quest: "Home to Roost", step: 2 } },

  /* arriving and moving on */
  { set: HTR, say: "done", want: { advance: true } },
  { set: HTR, say: "okay done what's next", want: { advance: true } },
  { set: HTR, say: "I'm in the room, what do I do now?", want: { advance: true } },
  { set: HTR, say: "I'm here", want: { advance: true } },
  { set: HTR, say: "made it", want: { advance: true } },
  { set: HTR, say: "got there", want: { advance: true } },
  { set: HTR, say: "found it", want: { advance: true } },
  { set: HTR, say: "next", want: { advance: true } },
  { set: HTR, say: "next step", want: { advance: true } },
  { set: HTR, say: "now what", want: { advance: true } },
  { set: HTR, say: "right, I'm through the door", want: { advance: true } },
  { set: HTR, say: "ok I'm in", want: { advance: true } },
  { set: HTR, say: "that's done", want: { advance: true } },
  { set: HTR, say: "finished that", want: { advance: true } },

  /* lost, didn't hear */
  { set: HTR, say: "say that again", want: { same: true } },
  { set: HTR, say: "what was that", want: { same: true } },
  { set: HTR, say: "sorry what", want: { same: true } },
  { set: HTR, say: "repeat", want: { same: true } },
  { set: HTR, say: "where am I going", want: { same: true } },
  { set: HTR, say: "which way", want: { same: true } },
  { set: HTR, say: "where do I go", want: { same: true } },
  { set: HTR, say: "what do I do", want: { same: true } },
  { set: HTR, say: "what am I looking for", want: { same: true } },
  { set: HTR, say: "I'm lost", want: { same: true } },
  { set: HTR, say: "where is it", want: { same: true } },

  /* panic: get me out */
  { set: HTR, say: "get me out", want: { exit: true } },
  { set: HTR, say: "help I need to get out", want: { exit: true } },
  { set: HTR, say: "exit", want: { exit: true } },
  { set: HTR, say: "where's the exit", want: { exit: true } },
  { set: HTR, say: "nearest extract", want: { exit: true } },
  { set: HTR, say: "evac", want: { exit: true } },
  { set: HTR, say: "I need to leave now", want: { exit: true } },
  { set: HTR, say: "how do I get out of here", want: { exit: true } },
  { set: HTR, say: "extraction point", want: { exit: true } },
  { set: AT_VILLAGE, say: "nearest way out", want: { exit: true } },
  { set: AT_VILLAGE, say: "I've got two minutes, get me out", want: { exit: true } },
  { set: HTR, say: "help", want: { exit: true } },
  { set: HTR, say: "airshaft", want: { exit: true } },
  { set: HTR, say: "where's the nearest hatch", want: { hatch: true } },

  /* where I am */
  { set: HTR, say: "I'm at the village", want: { place: "Village" } },
  { set: NONE, say: "I'm by the comms tower", want: { place: "the Communication Tower" } },
  { set: NONE, say: "near the checkpoint", want: { place: "Checkpoint" } },
  { set: NONE, say: "I'm in the cellar", want: { place: "the Cellar" } },
  { set: NONE, say: "I'm at the olive grove", want: { place: "Olive Grove" } },
  { set: NONE, say: "next to the fort", want: { place: "Ancient Fort" } },

  /* where I am, the way people actually say it (29 Oct test: "I'm near the farm, south east") */
  { set: NONE, say: ["I need an evac point", "I'm near the farm, south east"], want: { exitName: "Overlook Airshaft", place: "Farmlands" } },
  { set: NONE, say: ["get me out", "south east"], want: { exitName: "Overlook Airshaft" } },
  { set: NONE, say: ["get me out", "somewhere in the southeast"], want: { exitName: "Overlook Airshaft" } },
  { set: NONE, say: ["evac", "no idea, top left I think"], want: { exitName: "Cliffside Airshaft" } },
  { set: NONE, say: ["way out", "by the big wrecks on the left"], want: { exitName: "Forest Airshaft" } },
  { set: NONE, say: ["where's the exit", "the homestead"], want: { exitName: "Overlook Airshaft" } },
  { set: NONE, say: ["evac", "I'm in the village"], want: { exitName: "Cliffside Airshaft" } },
  { set: NONE, say: ["where's the nearest extract", "warehouse"], want: { exitName: "Warehouse Airshaft" } },
  { set: NONE, say: ["get me out", "blah blah the thing"], want: { near: "which side of the map" } },
  { set: NONE, say: "evac from the south east", want: { exitName: "Overlook Airshaft" } },
  { set: NONE, say: "I'm at the farm, where's the nearest way out", want: { exitName: "Overlook Airshaft", place: "Farmlands" } },
  { set: NONE, say: "I'm at the olive grove, get me out", want: { exitName: "Forest Airshaft" } },
  { set: NONE, say: "I'm near the data vault", want: { place: "Data Vault" } },
  { set: NONE, say: "I'm at pilgrim's peak", want: { place: "Pilgrim's Peak" } },
  { set: NONE, say: "near the gate control room", want: { place: "Gate Control Room" } },
  { set: NONE, say: "I'm at trappers glade", want: { place: "Trapper's Glade" } },
  { set: NONE, say: "I'm in the forest", want: { place: "The Forest" } },
  { set: NONE, say: "I'm at the forest airshaft", want: { place: "Forest Airshaft" } },
  { set: NONE, say: "I'm at the warehouse", want: { place: "Warehouse Complex" } },
  { set: NONE, say: "I'm by the highway collapse", want: { place: "Highway Collapse" } },
  { set: NONE, say: ["I'm at the farm", "what's around me"], want: { near: "Ruined Homestead" } },

  /* raid events */
  { set: HTR, say: "I died", want: { died: true } },
  { set: HTR, say: "I'm dead", want: { died: true } },
  { set: HTR, say: "got killed", want: { died: true } },
  { set: HTR, say: "they got me", want: { died: true } },
  { set: HTR, say: "new raid", want: { newraid: true } },
  { set: HTR, say: "just dropped in", want: { newraid: true } },
  { set: HTR, say: "starting a new run", want: { newraid: true } },
  { set: HTR, say: "I made it out", want: { extracted: true } },
  { set: HTR, say: "extracted", want: { extracted: true } },
  { set: HTR, say: "got out", want: { extracted: true } },

  /* enemies */
  { set: AT_VILLAGE, say: "where's the nearest sentinel", want: { enemy: true } },
  { set: NONE, say: "rocketeer spawns", want: { enemy: true } },

  /* ending the conversation */
  { set: HTR, say: "thanks", want: { stop: true } },
  { set: HTR, say: "cheers mate", want: { stop: true } },
  { set: HTR, say: "that's all", want: { stop: true } },

  /* noise: speech recognition picked up the TV */
  { set: HTR, say: "the uh behind the", want: { same: true } },
  { set: NONE, say: "pass me the remote", want: { fallback: true } }
];
