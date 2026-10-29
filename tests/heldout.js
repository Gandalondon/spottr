/* Phrasings written after the rules were tuned, never tuned against: an honest read of how well Relay generalises. */
const HTR = { quest: "Home to Roost", step: 3 }, NONE = {}, AT = { place: "Blue Gate Village" };
module.exports = [
  { set: HTR, say: "alright I'm in the locker room", want: { advance: true } },
  { set: HTR, say: "yep sorted", want: { advance: true } },
  { set: HTR, say: "okay what's the next bit", want: { advance: true } },
  { set: HTR, say: "cool, where now", want: { advance: true } },
  { set: HTR, say: "I'm upstairs now", want: { advance: true } },
  { set: HTR, say: "hang on where was I meant to go", want: { same: true } },
  { set: HTR, say: "remind me what I'm doing", want: { same: true } },
  { set: HTR, say: "come again", want: { same: true } },
  { set: HTR, say: "what was the instruction", want: { same: true } },
  { set: HTR, say: "I'm getting shot get me outta here", want: { exit: true } },
  { set: HTR, say: "quickest way home", want: { exit: true } },
  { set: HTR, say: "I'm low on health where do I extract", want: { exit: true } },
  { set: HTR, say: "need to bail", want: { exit: true } },
  { set: AT, say: "fastest way out", want: { exit: true } },
  { set: HTR, say: "I got wiped", want: { died: true } },
  { set: HTR, say: "lost all my stuff, I'm back in the lobby", want: { died: true } },
  { set: HTR, say: "jumping back in now", want: { newraid: true } },
  { set: HTR, say: "I'm home safe", want: { extracted: true } },
  { set: NONE, say: "doing the roost quest, on the weighing logs", want: { quest: "Home to Roost", step: 5 } },
  { set: NONE, say: "I'm on that home to roost mission step six", want: { quest: "Home to Roost", step: 6 } },
  { set: NONE, say: "frigate quest", want: { quest: "Boarding the Frigate" } },
  { set: HTR, say: "go to step one", want: { quest: "Home to Roost", step: 1 } },
  { set: NONE, say: "I'm standing by the radio tower", want: { place: "the Communication Tower" } },
  { set: NONE, say: "we're near the highway", want: { place: "the Collapsed Highway" } },
  { set: HTR, say: "ta, that's me done", want: { stop: true } }
];
