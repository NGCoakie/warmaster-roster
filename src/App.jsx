import { useState, useRef, useEffect, useCallback } from "react";

// ── SUPABASE CLIENT ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ynksmucteglcuterdpig.supabase.co";
const SUPABASE_KEY = "sb_publishable_HmIwlQb2Y2mi83l1iRA1Ug_-iviDKdt";

// Lightweight Supabase REST client — no npm package needed
const sb = {
  headers: {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
  },

  async signUp(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method:"POST", headers: this.headers,
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },

  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method:"POST", headers: this.headers,
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },

  async signOut(accessToken) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method:"POST",
      headers: { ...this.headers, "Authorization": `Bearer ${accessToken}` },
    });
  },

  async getUser(accessToken) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { ...this.headers, "Authorization": `Bearer ${accessToken}` },
    });
    return r.json();
  },

  authHeaders(accessToken) {
    return { ...this.headers, "Authorization": `Bearer ${accessToken}` };
  },

  async getLists(accessToken) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/army_lists?select=*&order=updated_at.desc`,
      { headers: this.authHeaders(accessToken) }
    );
    return r.json();
  },

  async saveList(accessToken, listData) {
    // Upsert by id
    const r = await fetch(`${SUPABASE_URL}/rest/v1/army_lists`, {
      method:"POST",
      headers: {
        ...this.authHeaders(accessToken),
        "Prefer": "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(listData),
    });
    return r.json();
  },

  async deleteList(accessToken, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/army_lists?id=eq.${id}`, {
      method:"DELETE", headers: this.authHeaders(accessToken),
    });
  },
};

// ── AUTH TOKEN STORAGE ────────────────────────────────────────────────────────
function loadSession() {
  try {
    const s = localStorage.getItem("wmr_session");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function saveSession(session) {
  try {
    if (session) localStorage.setItem("wmr_session", JSON.stringify(session));
    else localStorage.removeItem("wmr_session");
  } catch {}
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// ── MAGIC ITEMS (from WMR Armies v2.24 p.88) ─────────────────────────────────
const MAGIC_STANDARDS = [
  { id:"battle_banner",            category:"Banner",  name:"Battle Banner",                    cost:30, restriction:"Infantry, Cavalry or Chariot unit only. One per army.", desc:"+1 Attack in the first Combat engagement. Carried by Infantry, Cavalry, or Chariot units only. Maximum one per army." },
  { id:"banner_shielding_sup",     category:"Banner",  name:"Banner of Shielding (Superior)",   cost:50, restriction:"4+ Armour units only. One per army.",                  desc:"+1 Armour value until stand is lost. Only units with 4+ Armour save may carry this banner. Maximum one per army." },
  { id:"banner_shielding_maj",     category:"Banner",  name:"Banner of Shielding (Major)",      cost:30, restriction:"5+ Armour units only. One per army.",                  desc:"+1 Armour value until stand is lost. Only units with 5+ Armour save may carry this banner. Maximum one per army." },
  { id:"banner_shielding_min",     category:"Banner",  name:"Banner of Shielding (Minor)",      cost:15, restriction:"6+ or 0 Armour units only. One per army.",             desc:"+1 Armour value until stand is lost. Only units with 6+ or no Armour save may carry this banner. Maximum one per army." },
  { id:"banner_fortitude_maj",     category:"Banner",  name:"Banner of Fortitude (Major)",      cost:50, restriction:"4 Hits units only. One per army.",                     desc:"+1 Hit in first Combat engagement. Only units with 4 Hits per stand may carry this. Maximum one per army." },
  { id:"banner_fortitude_min",     category:"Banner",  name:"Banner of Fortitude (Minor)",      cost:30, restriction:"2–3 Hits units only. One per army.",                   desc:"+1 Hit in first Combat engagement. Only units with 2 or 3 Hits per stand may carry this. Maximum one per army." },
  { id:"banner_steadfastness_sup", category:"Banner",  name:"Banner of Steadfastness (Superior)",cost:20,restriction:"4+ Armour only. One per army.",                        desc:"Ignore 1 shooting hit after saves until stand is lost. 4+ Armour units only. Maximum one per army." },
  { id:"banner_steadfastness_maj", category:"Banner",  name:"Banner of Steadfastness (Major)",  cost:15, restriction:"5+ Armour only. One per army.",                       desc:"Ignore 1 shooting hit after saves until stand is lost. 5+ Armour units only. Maximum one per army." },
  { id:"banner_steadfastness_min", category:"Banner",  name:"Banner of Steadfastness (Minor)",  cost:10, restriction:"6+ Armour only. One per army.",                       desc:"Ignore 1 shooting hit after saves until stand is lost. 6+ Armour units only. Maximum one per army." },
  { id:"banner_fortune",           category:"Banner",  name:"Banner of Fortune",                cost:15, restriction:"Any unit. One per army.",                              desc:"Once per game re-roll all Attack dice in one Shooting or Combat phase. Any unit may carry this banner. Maximum one per army." },
];
const MAGIC_WEAPONS = [
  { id:"sword_destruction", category:"Weapon", name:"Sword of Destruction", cost:10, restriction:"General or Hero only. One per army.", desc:"Enemy must re-roll one successful Armour save per combat round. Carried by a General or Hero character stand. Maximum one per army." },
  { id:"sword_fate",        category:"Weapon", name:"Sword of Fate",        cost:5,  restriction:"General or Hero only. One per army.", desc:"+1 Attack to the character's unit in the first Combat round only. Carried by a General or Hero. Maximum one per army." },
  { id:"sword_cleaving",    category:"Weapon", name:"Sword of Cleaving",    cost:10, restriction:"General or Hero only. One per army.", desc:"Re-roll one unsuccessful Attack dice per combat round. Carried by a General or Hero character stand. Maximum one per army." },
  { id:"sword_might",       category:"Weapon", name:"Sword of Might",       cost:10, restriction:"General or Hero only. One per army.", desc:"+1 Attack to the character's unit in every Combat Phase. Carried by a General or Hero. Maximum one per army." },
];
const DEVICES_OF_POWER = [
  { id:"crown_command",     category:"Device", name:"Crown of Command",     cost:70, restriction:"General only. One per army.",          desc:"The General's first command roll each turn is made at unmodified Command 10. Lost permanently if the roll is failed. General only. Maximum one per army." },
  { id:"helm_dominion",     category:"Device", name:"Helm of Dominion",     cost:40, restriction:"General only. One per army.",          desc:"+1 to Command (max 10) for one Command phase per game. General only. Maximum one per army." },
  { id:"orb_majesty",       category:"Device", name:"Orb of Majesty",       cost:30, restriction:"General only. One per army.",          desc:"Re-roll one failed Command roll at Command value 8. General only. Maximum one per army." },
  { id:"ring_magic",        category:"Device", name:"Ring of Magic",        cost:30, restriction:"Wizard only. One per army.",           desc:"Cast one spell automatically without making a casting roll. Wizard only. Maximum one per army." },
  { id:"staff_spellbinding",category:"Device", name:"Staff of Spellbinding",cost:30, restriction:"Wizard or Runesmith only. One per army.",desc:"If an enemy Wizard fails to cast a spell, they are spellbound on a 4+ and suffer -1 to all future casting rolls. Wizard or Runesmith only. Maximum one per army." },
  { id:"sceptre_sovereignty",category:"Device",name:"Sceptre of Sovereignty",cost:30,restriction:"General only. One per army.",          desc:"Ignore one Blunder roll; the order is treated as successful instead. General only. Maximum one per army." },
  { id:"scroll_dispelling", category:"Device", name:"Scroll of Dispelling", cost:20, restriction:"Wizard or Runesmith only. One per army.",desc:"Automatically dispel one enemy spell without a roll. One use only. Wizard or Runesmith only. Maximum one per army." },
  { id:"wand_power",        category:"Device", name:"Wand of Power",        cost:10, restriction:"Wizard only. One per army.",           desc:"+1 to one spell casting attempt. A roll of 1 always fails. Wizard only. Maximum one per army." },
  { id:"rod_repetition",    category:"Device", name:"Rod of Repetition",    cost:10, restriction:"Wizard only. One per army.",           desc:"After successfully casting a spell, immediately attempt to cast it again. Once per game only. Wizard only. Maximum one per army." },
];

// ── ARMY DATA (Official WMR Armies v2.24) ────────────────────────────────────
// ── IMAGE URLS ────────────────────────────────────────────────────────────────
// Paste Midjourney URLs here after generating. All fields are optional —
// if a URL is missing the card shows the placeholder.
const IMAGES = {
  // ── Faction card border frames ─────────────────────────────────────────────
  factionBorders: {
    empire: "",
    tomb_kings: "",
    chaos: "",
    orcs: "",
    high_elves: "",
    dwarfs: "",
    skaven: "",
    lizardmen: "",
    bretonnia: "",
    kislev: "",
    dark_elves: "",
    daemons: "",
    vampire_counts: "",
    araby: "",
    dogs_of_war: "",
    ogre_kingdoms: "",
    albion: "",
    goblin_army: "",
    witch_hunters: "",
    chaos_dwarfs: "",
    wood_elves: "",
    beastmen: "",
    norse: "",
    cathay: "",
    nippon: "",
  },
  // ── Unit art ──────────────────────────────────────────────────────────────
  units: {
    emp_general: "",
    emp_hero: "",
    emp_wizard: "",
    emp_griffon: "",
    emp_warAltar: "",
    emp_halberdiers: "",
    emp_crossbowmen: "",
    emp_handgunners: "",
    emp_flagellants: "",
    emp_skirmishers: "",
    emp_knights: "",
    emp_pistoliers: "",
    emp_helblaster: "",
    emp_cannon: "",
    emp_steamTank: "",
    orc_general: "",
    orc_hero: "",
    orc_shaman: "",
    orc_goblinHero: "",
    orc_goblinShaman: "",
    orc_wyvern: "",
    orc_chariot_mount: "",
    orc_warriors: "",
    orc_goblins: "",
    orc_blackOrcs: "",
    orc_trolls: "",
    orc_ogres: "",
    orc_boarRiders: "",
    orc_wolfRiders: "",
    orc_wolfChariots: "",
    orc_giant: "",
    orc_rockLobber: "",
    dow_general: "",
    dow_hero: "",
    dow_paymaster: "",
    dow_wizard: "",
    dow_griffon: "",
    dow_payWagon: "",
    dow_pikemen: "",
    dow_crossbowmen: "",
    dow_handgunners: "",
    dow_swordsmen: "",
    dow_ogres: "",
    dow_dwarfs: "",
    dow_marauders: "",
    dow_lightCavalry: "",
    dow_knights: "",
    dow_galloperguns: "",
    dow_giant: "",
    dow_birdmen: "",
    wh_general: "",
    wh_hero: "",
    wh_warriorPriest: "",
    wh_zealots: "",
    wh_halberdiers: "",
    wh_crossbowmen: "",
    wh_handgunners: "",
    wh_flagellants: "",
    wh_warhounds: "",
    wh_knights: "",
    wh_pistoliers: "",
    wh_cannon: "",
  },
  // ── Spell art ─────────────────────────────────────────────────────────────
  spells: {
    albion_downpour: "",
    albion_mists_of_albion: "",
    albion_storm_of_hail: "",
    albion_summon_fenbeast: "",
    araby_djinn_summons: "",
    araby_mirage: "",
    araby_sand_storm: "",
    araby_sunstrike: "",
    beastmen_chaos_bolt: "",
    beastmen_hunting_for_gore: "",
    beastmen_power_of_herd: "",
    beastmen_traitor_kin: "",
    bretonnia_aerial_shield: "",
    bretonnia_eerie_mist: "",
    bretonnia_ladys_favour: "",
    bretonnia_shield_of_combat: "",
    cathay_ferocity_of_tigers: "",
    cathay_glory_of_cathay: "",
    cathay_lion_dogs_attack: "",
    cathay_tranquility_of_heaven: "",
    chaos_anger_of_the_gods: "",
    chaos_boon_of_chaos: "",
    chaos_dwarfs_flaming_hand: "",
    chaos_dwarfs_meteor_storm: "",
    chaos_dwarfs_volcanic_eruption: "",
    chaos_dwarfs_word_of_fear: "",
    chaos_rage_of_chaos: "",
    daemons_daemonic_rage: "",
    daemons_frenzy_of_chaos: "",
    daemons_sorcerous_blast: "",
    daemons_summon_daemons: "",
    dark_elves_black_horror: "",
    dark_elves_dominion: "",
    dark_elves_doom_bolt: "",
    dark_elves_soul_stealer: "",
    dogs_of_war_ball_of_flame: "",
    dogs_of_war_voice_of_command: "",
    dogs_of_war_weird_enchantment: "",
    empire_ball_of_flame: "",
    empire_voice_of_command: "",
    empire_weird_enchantment: "",
    goblin_army_brain_busta: "",
    goblin_army_gerroff: "",
    goblin_army_mork_save_uz: "",
    goblin_army_waaagh: "",
    high_elves_hail_of_destruction: "",
    high_elves_heavens_fire: "",
    high_elves_light_of_battle: "",
    high_elves_storm_of_stone: "",
    kislev_chill: "",
    kislev_freeze: "",
    kislev_icy_blast: "",
    kislev_monster_bear: "",
    lizardmen_gaze_of_sotek: "",
    lizardmen_mazdamundis_revenge: "",
    lizardmen_shield_of_the_old_ones: "",
    lizardmen_wings_of_the_jungle: "",
    nippon_divine_wind: "",
    nippon_honour_of_ancestors: "",
    nippon_kami_strike: "",
    nippon_spirit_ward: "",
    norse_aspect_of_wulfen: "",
    norse_eye_of_the_raven: "",
    norse_thunder_of_fowor: "",
    ogre_kingdoms_bone_cruncher: "",
    ogre_kingdoms_bull_gorger: "",
    ogre_kingdoms_tooth_cracker: "",
    ogre_kingdoms_troll_guts: "",
    orcs_foot_of_gork: "",
    orcs_gerroff: "",
    orcs_gotcha: "",
    skaven_death_frenzy: "",
    skaven_warp_lightning: "",
    skaven_wither: "",
    tomb_kings_desert_wind: "",
    tomb_kings_incantation_of_summoning: "",
    tomb_kings_raise_dead: "",
    tomb_kings_touch_of_death: "",
    vampire_counts_death_bolt: "",
    vampire_counts_raise_dead: "",
    vampire_counts_vanhels_danse_macabre: "",
    vampire_counts_vile_curse: "",
    witch_hunters_divine_curse: "",
    witch_hunters_doctrine_of_sigmar: "",
    witch_hunters_holy_fervour: "",
    witch_hunters_sanctuary: "",
    wood_elves_call_of_the_hunt: "",
    wood_elves_fury_of_the_forest: "",
    wood_elves_tree_singing: "",
    wood_elves_twilight_host: "",
  },
  // ── Magic item art (neutral — used across all factions) ───────────────────
  magicItems: {
    battle_banner: "",
    banner_shielding_sup: "",
    banner_shielding_maj: "",
    banner_shielding_min: "",
    banner_fortitude_maj: "",
    banner_fortitude_min: "",
    banner_steadfastness_sup: "",
    banner_steadfastness_maj: "",
    banner_steadfastness_min: "",
    banner_fortune: "",
    sword_destruction: "",
    sword_fate: "",
    sword_cleaving: "",
    sword_might: "",
    crown_command: "",
    helm_dominion: "",
    orb_majesty: "",
    ring_magic: "",
    staff_spellbinding: "",
    sceptre_sovereignty: "",
    scroll_dispelling: "",
    wand_power: "",
    rod_repetition: "",
  },
};

// Helper: slugify spell name to match IMAGES.spells keys
function spellKey(armyKey, spellName) {
  return (armyKey + "_" + spellName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const ARMIES = {

  empire: {
    name:"The Empire", color:"#c8940a", bg:"#0f0c02", accent:"#f0c040",
    lore:"The largest human nation of the Old World, fielding disciplined soldiers, battle wizards and fearsome war machines.",
    armyRules:[{name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun (3+ counts as 4+, 4+ as 5+, 5+ as 6+, 6+ gives no save). One Crossbowmen unit per 1000pts can be replaced by Handgunners at +10pts, still counting for Crossbowmen min/max."}, {name:"Flagellants", desc:"Always use initiative to charge an enemy if possible; cannot be given orders instead. Never evade. Cannot be driven back by shooting and do not roll for drive backs. Must pursue or advance if victorious. Unaffected by terror — no -1 Attack modifier."}, {name:"Skirmishers", desc:"Not deployed independently. Any infantry unit (except Flagellants) may add one Skirmisher stand, making the unit 4 stands total. Skirmishers share the unit Armour value, fight as part of the unit and can be removed as a casualty. Their casualties never count for Command penalties and they never cause Irregular Formation."}, {name:"Pistoliers", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies. Still needs Line of Sight from front edge to charge."}, {name:"Helblaster", desc:"Range 30cm. Attacks vary by range: 01-10cm = 8 attacks, 11-20cm = 4 attacks, 21-30cm = 2 attacks. Targets count Armour one worse than normal. If any 1s are rolled when shooting, count them: 1-2 = Fizzle (resolve attacks normally); 3 = Misfire (no shots this turn); 4+ = Ka-boom! (Helblaster destroyed, no hits struck on enemy)."}, {name:"Steam Tank", desc:"Always counts as defended (5 or 6 to hit). Cannot be driven back or routed by shooting. Cannot brigade. No character may join it. 360 degree vision. Shoots to front, side or rear against closest enemy target (30cm range, counts armour one worse). On a double-6 order, roll Malfunction: 1=Destroyed; 2=Broken Down (cannot move ever again); 3=Stuck (no move/shoot this turn); 4=Commander Slain (-1 Command permanently); 5=Momentary Halt; 6=Steam Overload (cannot move but shoots with 6 Attacks)."}, {name:"Griffon", desc:"Generals, Wizards and Heroes can ride Griffons. Flies (move 100cm), adds +2 Attacks to rider. Unit causes terror. Max 1 per army."}, {name:"War Altar", desc:"Only one War Altar in the entire army regardless of size. Can only be a mount for a Wizard (who becomes the Grand Theogonist). Adds +1 Attack. Once per battle the Grand Theogonist may add +1 to a casting dice result (announce before rolling)."}],
        spells:[{name:"Ball of Flame", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Wizard in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Voice of Command", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). The unit can be moved as if it had received an order. Character stands that have joined the unit do not move with it."}, {name:"Weird Enchantment", cast:"4+", range:"30cm", desc:"Cast on any enemy unit (no LoS needed). Lasts until end of opposing player's next turn. The unit moves at half pace in all situations, even when charging. The unit counts all enemies as terrifying (-1 Attack), even if normally immune to terror."}, {name:"Teleport", cast:"2+", range:"N/A", desc:"The Wizard vanishes and reappears anywhere on the battlefield. Move the Wizard to any position on the table — he may leave or join a unit. Once Teleported, he may cast a second (different) spell this turn, potentially casting two spells total."}],
    playstyle:"A versatile, well-rounded army. Solid infantry, powerful war machines and support magic make the Empire strong in defence and capable of punishing aggression. Best played with layered brigades.",
    fluff:"The Empire is the mightiest of all human nations, stretching from the Grey Mountains to the Worlds Edge. Divided into rival Elector States yet united under a single Emperor, its armies blend veteran state soldiery, fanatic warrior-priests, thunderous cannons and Colleges of Magic wizards. Where other realms field purer forces, the Empire fields everything \u2014 a grinding, adaptive war machine that has survived every Chaos incursion for two millennia.",
    traits:["Diverse combined arms", "Powerful artillery", "Battle wizards", "State troops backbone"],
    strengths:"War machines, flexible unit mix, Steam Tank",
    weaknesses:"Infantry mediocre individually \u2014 relies on combined arms",
    generalCmd:9,
    units:[
      { id:"emp_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"emp_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"emp_wizard", name:"Wizard", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"emp_griffon", name:"Griffon", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"emp_warAltar", name:"War Altar", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Hero/Wizard may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"emp_halberdiers", name:"Halberdiers", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Standard Empire core infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_crossbowmen", name:"Crossbowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:2, max:"-", special:"Shoot 30cm.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_handgunners", name:"Handgunners", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:"-", max:3, special:"Armour piercing: enemy armour one worse. Up to 1 per 1000pts can replace Crossbowmen and count toward their min/max.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_flagellants", name:"Flagellants", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Immune to terror. Must pursue/advance.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_skirmishers", name:"Skirmishers", type:"Infantry", atk:"4", hits:"3", armour:"0 or 6+", cmd:"-", size:"+1", pts:25, min:"-", max:"-", special:"Attached to any infantry (except Flagellants) as an extra stand. Brings unit to 4 stands.", upgrades:[], magic:[] },
      { id:"emp_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Standard heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_pistoliers", name:"Pistoliers", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:4, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_helblaster", name:"Helblaster", type:"Artillery", atk:"1/8-4-2", hits:"2", armour:"0", cmd:"-", size:1, pts:50, min:"-", max:1, special:"Range varies by distance (8/4/2 attacks). Armour piercing. On 3+ ones: misfires. On 4+ ones: explodes.", upgrades:[], magic:[] },
      { id:"emp_cannon", name:"Cannon", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"0", cmd:"-", size:2, pts:85, min:"-", max:1, special:"Bouncing cannonball. See rulebook p.74.", upgrades:[], magic:[] },
      { id:"emp_steamTank", name:"Steam Tank", type:"Machine", atk:"3/3", hits:"4", armour:"3+", cmd:"-", size:1, pts:130, min:"-", max:1, special:"Causes terror. Cannot be driven back by shooting.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  tomb_kings: {
    name:"Tomb Kings", color:"#c8a44a", bg:"#0a0800", accent:"#f0d060",
    lore:"Ancient undead rulers of the desert, commanding skeletal armies that never tire, never waver, and never retreat.",
    armyRules:[{name:"Undead (Army Rule)", desc:"All Undead units never act on initiative and only move in the Command phase if given orders. They are unaffected by: the -1 Command penalty for enemy within 20cm; the -1 Combat penalty for fighting terrifying troops; and the Confusion rule — they cannot become confused for any reason."}, {name:"Carrion", desc:"Carrion can fly. They can always return to a character by homing back at the start of the Command phase without requiring an order."}, {name:"Bone Giant", desc:"Causes terror. When a Tomb King (not a Liche Priest) issues an order to a Bone Giant or brigade containing one, apply a -1 Command penalty. No penalty when a Liche Priest issues the order."}, {name:"Sphinx", desc:"Causes terror. With 4-5 accumulated hits at end of Shooting or Combat phase (while not engaged) it becomes Badly Hurt — all accumulated hits discounted, Hits and Attacks halved for the rest of battle (3 Hits, 2 Attacks)."}, {name:"Skull Chukka", desc:"Stone Thrower. When a unit is driven back by Skull Chukka hits, any drive-back dice cause Confusion on rolls of 4, 5 or 6 (rather than 6 as normal). Roll the Skull Chukka dice separately if other hits were also inflicted."}, {name:"Tomb King", desc:"Once per battle, the Tomb King can use his burial magic to give all stands in one unit within 20cm a +1 Combat Attack bonus for the duration of one Combat phase."}],
        spells:[{name:"Raise Dead", cast:"5+", range:"30cm", desc:"Cast on a combat engagement within 30cm (no LoS needed). Creates a 3-stand Skeleton unit placed in contact with the engagement or supporting a friendly unit. If stands cannot be legally placed the spell fails. Raised dead do not count as charging and are ignored for breakpoint and victory points."}, {name:"Touch of Death", cast:"4+", range:"N/A", desc:"Cast when the Wizard has joined a unit in combat. Targets one enemy unit touching the Wizard's unit. That unit loses one stand — no armour save permitted. If the unit is reduced to zero stands it is destroyed."}, {name:"Incantation of Summoning", cast:"5+", range:"30cm", desc:"Cast on a friendly unit within range (no LoS needed). The unit may be moved as if it had received an order. The Wizard moves with the unit if he has joined it; other characters do not move."}, {name:"Desert Wind", cast:"4+", range:"30cm", desc:"Cast on any friendly unit within range (no LoS needed). Lasts until end of the opposing player's next turn. The unit is immune to the effects of Confusion and cannot become confused for any reason."}],
    playstyle:"An attrition army immune to psychology. Skeleton units are cheap and numerous; Chariots are the offensive backbone. Magic is critical \u2014 Liche Priests keep the host moving. Build brigades around chariot charges.",
    fluff:"Beneath the searing sands of Nehekhara lie the mummified remains of an ancient civilisation, entombed for millennia in vast pyramid-cities. When desecrators disturb their rest, the Tomb Kings stir \u2014 rising not as mindless shuffling corpses but as proud warrior-kings commanding the same armies that brought the ancient world to its knees, now animated by sacred incantations and bound to serve for eternity.",
    traits:["Undead \u2014 immune to terror", "Liche Priest magic", "Chariots as core", "Desert monsters"],
    strengths:"Undead immunity, chariots, cheap skeletons",
    weaknesses:"Low attack values on most infantry",
    generalCmd:9,
    units:[
      { id:"tk_general", name:"Tomb King", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:130, min:1, max:1, special:"Command range covers entire battlefield. Once per battle: +1 Attack to one unit within 20cm for one Combat phase.", upgrades:[], magic:["devices"] },
      { id:"tk_lichePriest", name:"Liche Priest", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:2, special:"Command range 60cm. Casts spells. No -1 penalty when ordering Bone Giants.", upgrades:[], magic:["weapons","devices"] },
      { id:"tk_zombieDragon", name:"Zombie Dragon", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"Tomb King or Liche Priest may ride. Flies (move 100cm). Causes terror. Breath attack: 20cm, 3 attacks.", upgrades:[], magic:[] },
      { id:"tk_licheChariot", name:"Liche Chariot", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"Tomb King or Liche Priest may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"tk_skeletons", name:"Skeletons", type:"Infantry", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:30, min:2, max:"-", special:"Undead: no initiative moves, immune to terror penalty & confusion, unaffected by enemy within 20cm penalty.", upgrades:[], magic:["standards","weapons"] },
      { id:"tk_skeletonBowmen", name:"Skeleton Bowmen", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Undead. Shoot 30cm.", upgrades:[], magic:["standards","weapons"] },
      { id:"tk_skeletonCavalry", name:"Skeleton Cavalry", type:"Cavalry", atk:"2", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:"-", max:"-", special:"Undead.", upgrades:[], magic:["standards","weapons"] },
      { id:"tk_skelChariots", name:"Skeletal Chariots", type:"Chariot", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Undead. +1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"tk_carrion", name:"Carrion", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:65, min:"-", max:1, special:"Undead. Flies. Can always home back to a character at start of Command phase.", upgrades:[], magic:[] },
      { id:"tk_boneGiant", name:"Bone Giant", type:"Monster", atk:"6", hits:"4", armour:"4+", cmd:"-", size:1, pts:110, min:"-", max:1, special:"Undead. Causes terror. -1 Command when Tomb King orders it (not Liche Priest).", upgrades:[], magic:[] },
      { id:"tk_sphinx", name:"Sphinx", type:"Monster", atk:"4", hits:"6", armour:"3+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Undead. Causes terror. At 4-5 hits: badly hurt, halved to 3H/2A.", upgrades:[], magic:[] },
      { id:"tk_skullChukka", name:"Skull Chukka", type:"Artillery", atk:"1/3", hits:"3", armour:"0", cmd:"-", size:1, pts:85, min:"-", max:1, special:"Stone Thrower. Drive-back hits cause Confusion on 4+ (not 6).", upgrades:[], magic:[] },
      { id:"tk_boneThrower", name:"Bone Thrower", type:"Artillery", atk:"1/2+skewer", hits:"2", armour:"0", cmd:"-", size:2, pts:65, min:"-", max:1, special:"Bolt Thrower. Skewer rule applies.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  chaos: {
    name:"Chaos", color:"#a01010", bg:"#080202", accent:"#e03030",
    lore:"Bloodthirsty northern tribes devoted to the Dark Gods, bringing destruction to the civilised world.",
    armyRules:[{name:"Ogres", desc:"If an Ogre unit can use initiative to charge an enemy unit of humans at the start of the Command phase it must do so automatically — commanders cannot prevent it. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Trolls", desc:"Distance Command penalties to Trolls are always doubled (40cm = -2, 60cm = -4, etc.). Trolls regenerate wounds: in each combat round after whole stands are removed, Trolls automatically regenerate one outstanding hit. Regenerated hits still count towards the combat result."}, {name:"Harpies", desc:"Harpies are based facing the long edge of the base like infantry. They can fly. A unit of Harpies cannot be joined by a character."}, {name:"Dragon Ogres", desc:"Dragon Ogres are immune to terror."}, {name:"Chaos Spawn", desc:"Spawn have -1 Command penalty unless in a brigade with more non-Spawn than Spawn units. Up to two Spawn can be in any brigade without counting towards maximum brigade size. Spawn cause terror in combat. Cannot be driven back by shooting. Must pursue or advance if victorious. 15cm shooting range and 360 degree vision."}, {name:"Chaos Dragon", desc:"Generals, Wizards and Heroes can ride a Chaos Dragon. Flies (move 100cm), adds +3 Attacks to rider. Dragon breathes fire at 20cm range with 3 Attacks. Unit causes terror. Dragon with 4-5 hits becomes Badly Hurt — Hits and Attacks halved."}],
        spells:[{name:"Boon of Chaos", cast:"4+", range:"N/A", desc:"The Sorcerer must have joined a unit in combat. Every stand in that unit, including the Sorcerer and any other characters, adds +1 to its Attacks value for the duration of the following Combat phase."}, {name:"Anger of the Gods", cast:"4+", range:"30cm", desc:"Cast on the Sorcerer himself. Affects all enemy units within 30cm. Lasts until end of the opposing player's following turn. All affected enemy units suffer a -1 Command penalty when orders are issued to them."}, {name:"Rage of Chaos", cast:"5+", range:"30cm", desc:"Cast on a friendly unit engaged in combat and within range (no LoS needed). Lasts for the following Combat phase. The unit gains bonus Rage attacks — roll D6 repeatedly (up to 1 per stand), adding results. Stop at any time, but if a repeat value is rolled all attacks hit the Chaos unit instead."},
      { name:"Curse of Chaos", cast:"5+", range:"30cm",
        desc:"Cast on any enemy unit within range regardless of visibility. The unit suffers −1 to its Command value for the rest of the battle. The curse cannot be removed and multiple curses stack. Cannot be cast on the same unit twice in the same turn." }],
    playstyle:"A small, elite army. Every unit hits hard \u2014 Chaos Warriors and Knights are among the best in the game. You will be outnumbered. Win by smashing enemy lines in decisive charges before attrition kills you.",
    fluff:"From the frozen wastes beyond Kislev they come \u2014 the Chaos Warriors, men so consumed by devotion to the Dark Gods that they have become something other than human. Alongside hordes of Marauder tribesmen, terrifying Chaos Knights, spell-hurling Sorcerers and abominations like Dragon Ogres and Chaos Spawn, they represent an existential threat to every civilised nation. When the Chaos tide rises, the world trembles.",
    traits:["Elite heavy warriors", "Devastating cavalry", "Powerful monsters", "High points cost"],
    strengths:"Best infantry and cavalry stats in the game",
    weaknesses:"Expensive \u2014 small numbers, very limited artillery",
    generalCmd:9,
    units:[
      { id:"cha_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"cha_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"cha_sorcerer", name:"Sorcerer", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"cha_dragon", name:"Chaos Dragon", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"General/Hero/Sorcerer may ride. Flies (move 100cm). Causes terror. Breath attack: 20cm, 3 attacks.", upgrades:[], magic:[] },
      { id:"cha_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Sorcerer may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"cha_warriors", name:"Chaos Warriors", type:"Infantry", atk:"4", hits:"4", armour:"4+", cmd:"-", size:3, pts:140, min:1, max:"-", special:"Elite heavy infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cha_marauders", name:"Chaos Marauders", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:1, max:"-", special:"Core Chaos infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cha_ogres", name:"Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:"-", max:1, special:"Must charge humans on initiative.", upgrades:[], magic:[] },
      { id:"cha_trolls", name:"Trolls", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Regenerate 1 hit per combat round. Command penalty for distance doubled.", upgrades:[], magic:[] },
      { id:"cha_marauderHorsemen", name:"Marauder Horsemen", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:4, special:"Fast light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cha_knights", name:"Chaos Knights", type:"Cavalry", atk:"4", hits:"4", armour:"4+", cmd:"-", size:3, pts:180, min:"-", max:2, special:"Devastating heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cha_hounds", name:"Chaos Hounds", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:2, special:"Fast war hounds.", upgrades:[], magic:[] },
      { id:"cha_chariots", name:"Chaos Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:3, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"cha_harpies", name:"Harpies", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:65, min:"-", max:1, special:"Flies. Based on long edge like infantry. Cannot be joined by characters.", upgrades:[], magic:[] },
      { id:"cha_dragonOgres", name:"Dragon Ogres", type:"Monster", atk:"6", hits:"4", armour:"5+", cmd:"-", size:3, pts:230, min:"-", max:1, special:"Immune to terror.", upgrades:[], magic:[] },
      { id:"cha_spawn", name:"Chaos Spawn", type:"Monster", atk:"3/3", hits:"4", armour:"3+", cmd:"-", size:1, pts:110, min:"-", max:2, special:"Causes terror. Cannot be driven back. Must pursue. Shoot 15cm 360°. -1 Cmd if not in brigade with more non-Spawn than Spawn.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  orcs: {
    name:"Orcs & Goblins", color:"#2a7a10", bg:"#040a02", accent:"#60c020",
    lore:"A vast greenskin horde driven by the Waaagh! — terrifying in numbers but plagued by animosity and infighting.",
    armyRules:[{name:"Goblins", desc:"A Goblin unit can shoot as if it had bows but range is reduced to 15cm."}, {name:"Trolls", desc:"Distance Command penalties to Trolls are always doubled (40cm = -2, 60cm = -4). Trolls regenerate: in each combat round after whole stands are removed, Trolls automatically regenerate one outstanding hit. Regenerated hits still count towards the combat result."}, {name:"Ogres", desc:"If an Ogre unit can use initiative to charge an enemy unit of humans at the start of the Command phase it must do so automatically. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Wolf Riders", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies. Still needs Line of Sight from front edge to charge."}, {name:"Giants", desc:"Must always be given a separate order and cannot brigade with other troops (can brigade with other Giants). On a failed order roll on the Giant Goes Wild chart. Giants with 5-7 accumulated hits (while not engaged) become Badly Hurt — Hits and Attacks halved to 4 each. Giants cause terror."}, {name:"Rock Lobber", desc:"Stone Thrower as per Rulebook p.75."}],
        spells:[{name:"Foot of Gork", cast:"6+", range:"50cm", desc:"Cast on any unengaged enemy unit within range (no LoS needed). The unit suffers 6 attacks. Cannot be driven back by the Foot of Gork (it descends from above)."}, {name:"Gotcha!", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Shaman in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Gerroff!!!", cast:"5+", range:"60cm", desc:"Cast on any unengaged enemy unit within range (no LoS needed). The enemy unit is driven back 1D6×5cm towards its own table edge. Cannot be routed by this drive back. If the unit leaves the table it rolls as normal."}],
    playstyle:"Overwhelming mass of bodies backed by hard-hitting monsters and trolls. Animosity can cause chaos in your own lines \u2014 build brigades to mitigate it. Let the greenskin tide roll forward and drown the enemy.",
    fluff:"The Orc tribes of the Old World need little reason to go to war \u2014 a good scrap is its own reward. When a powerful Warboss emerges to unite the clans under a single Waaagh!, entire regions tremble. Greenskin hordes pour south in an unstoppable tide of violence, noise and barely-contained chaos. Their greatest weakness is themselves.",
    traits:["Massive numbers", "Animosity mechanic", "Varied unit types", "Giants and trolls"],
    strengths:"Numbers, monsters, cheap options",
    weaknesses:"Animosity can cost orders at critical moments",
    generalCmd:8,
    units:[
      { id:"orc_general", name:"Orc General", type:"General", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:95, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"orc_hero", name:"Orc Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_shaman", name:"Orc Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_goblinHero", name:"Goblin Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_goblinShaman", name:"Goblin Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_wyvern", name:"Wyvern", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Shaman may ride. Flies (move 100cm). Unit causes terror.", upgrades:[], magic:[] },
      { id:"orc_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Shaman may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"orc_warriors", name:"Orc Warriors", type:"Infantry", atk:"4", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core orc infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_goblins", name:"Goblins", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:2, max:"-", special:"Shoot 15cm (bows).", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_blackOrcs", name:"Black Orcs", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Elite orcs.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_trolls", name:"Trolls", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Regenerate 1 hit per combat round. Command penalty for distance doubled.", upgrades:[], magic:[] },
      { id:"orc_ogres", name:"Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:"-", max:1, special:"Must charge humans on initiative.", upgrades:[], magic:[] },
      { id:"orc_boarRiders", name:"Boar Riders", type:"Cavalry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Heavy orc cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_wolfRiders", name:"Wolf Riders", type:"Cavalry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_wolfChariots", name:"Wolf Chariots", type:"Chariot", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:80, min:"-", max:3, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Must be given separate order. Rolls on Giant Goes Wild if order fails. At 5–7 hits: badly hurt, halved.", upgrades:[], magic:[] },
      { id:"orc_rockLobber", name:"Rock Lobber", type:"Artillery", atk:"1/3", hits:"3", armour:"0", cmd:"-", size:1, pts:75, min:"-", max:1, special:"Stone Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  high_elves: {
    name:"High Elves", color:"#1060c0", bg:"#010510", accent:"#50a0ff",
    lore:"Ancient guardians of Ulthuan and the world's greatest bulwark against Chaos, fielding disciplined warriors and mighty dragons.",
    armyRules:[{name:"Archers", desc:"High Elf Archers add +1 to their dice roll when making Shooting attacks. They score a hit against targets in the open on 3+, defended on 4+, and fortified on 5+."}, {name:"Giant Eagles", desc:"Giant Eagles can fly."}, {name:"Dragons", desc:"Fly (move 100cm). Dragon Rider units and units with a Dragon-riding character cause terror. Dragon breathes fire: 20cm range, 3 Attacks at 4+. Generals, Wizards and Heroes can ride Dragons (+3 Attacks). Dragon Riders with 4-5 hits become Badly Hurt — Hits and Attacks halved (3 Hits, 3/2 Attacks). A Dragon ridden by a lone character (not in a unit) cannot breathe fire."}, {name:"High Elf Wizard", desc:"High Elf Mages can re-roll a failed spell on any dice result except a 1. If a spell is failed because a 1 is rolled, no re-roll is permitted."}],
        spells:[{name:"Storm of Stone", cast:"6+", range:"30cm", desc:"Affects every enemy unit within range. Each unit takes 3 attacks. Unengaged units are not driven back (assault comes from below). Engaged units carry over hits into combat."}, {name:"Light of Battle", cast:"5+", range:"30cm", desc:"Affects every friendly unit within range. Lasts for the following Combat phase. Every unit and character that has joined a unit gains +1 attack (can be allocated to any stand, a different stand each round)."}, {name:"Heaven's Fire", cast:"4+", range:"30cm", desc:"Cast on a friendly unengaged missile-armed infantry or cavalry unit within range (no LoS to target needed). The unit can shoot twice this turn. The second shot is always at -1 to hit."}, {name:"Hail of Destruction", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Mage in any direction. Each unit under the line takes 3 shooting attacks with no armour saves. Unengaged units can be driven back; engaged units carry over hits."}],
    playstyle:"A premium army where every unit is better than its equivalent elsewhere. The Command 10 General gives outstanding reliability. Use superior shooting to soften targets, then deliver decisive cavalry and dragon charges.",
    fluff:"From their island kingdom of Ulthuan, the High Elves have stood as the world's foremost bulwark against Chaos since time immemorial. Ancient beyond reckoning, their warriors train for centuries before seeing battle. Their Silver Helm cavalry are unmatched, their archers deadly, and their Dragon riders among the most feared creatures in existence. They fight not for conquest but for survival \u2014 and will not countenance failure.",
    traits:["Command 10 General", "Superior archers", "Dragons", "Balanced elite force"],
    strengths:"Command 10, reliable orders, all-round excellence",
    weaknesses:"Expensive \u2014 few units relative to points",
    generalCmd:10,
    units:[
      { id:"he_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:10, size:1, pts:180, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"he_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"he_wizard", name:"Wizard", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"he_giantEagle_mount", name:"Giant Eagle Mount", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"he_dragon_mount", name:"Dragon Mount", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm). Causes terror. Fire breath: 20cm, 3 attacks at 4+.", upgrades:[], magic:[] },
      { id:"he_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Wizard may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"he_spearmen", name:"Spearmen", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core High Elf infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_archers", name:"Archers", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:1, max:"-", special:"+1 to shooting dice rolls (hit on 3+ in open, 4+ defended, 5+ fortified).", upgrades:[], magic:["standards","weapons"] },
      { id:"he_silverHelms", name:"Silver Helms", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Elite heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_reavers", name:"Reavers", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:3, special:"Fast light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_chariots", name:"Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:3, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_giantEagles", name:"Giant Eagles", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Flies.", upgrades:[], magic:[] },
      { id:"he_dragonRider", name:"Dragon Rider", type:"Monster", atk:"6/3", hits:"6", armour:"4+", cmd:"-", size:1, pts:270, min:"-", max:1, special:"Causes terror. Flies. Fire breath: 20cm, 3 attacks at 4+. At 4–5 hits: badly hurt, halved to 3H/3A.", upgrades:[], magic:[] },
      { id:"he_boltThrower", name:"Elven Bolt Thrower", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:55, min:"-", max:1, special:"Bolt Thrower with skewer rule.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  dwarfs: {
    name:"Dwarfs", color:"#8b4513", bg:"#050202", accent:"#cd7f32",
    lore:"Stubborn mountain folk with the finest artillery in the world and warriors who hold grudges for generations.",
    armyRules:[{name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun. One Handgunner unit per 1000pts can replace a Warrior unit while still counting for Warriors min/max value."}, {name:"Rangers", desc:"One unit of Rangers per 1000pts may infiltrate instead of deploying normally. Issue an infiltration order from any character (ignoring dense terrain penalties and Command range limits) to a point in dense terrain or on any table edge except the enemy's. On success the unit appears there, using that as their first order. Rangers can pursue any type of retreating enemy despite being infantry."}, {name:"Troll Slayers", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier. Add +1 Attack when fighting Monster stands. Victory points are scored differently: if any stands remain at end of battle the full points value goes to the opponent; if all stands are destroyed the Slayers earn their points value for themselves."}, {name:"Gyrocopter", desc:"Can fly. Acts like artillery in most respects but is a flying machine. Has its own special rules for movement."}, {name:"Hero (Oathstone)", desc:"A Hero may carry an Oathstone (+15pts). Once per battle, invoke it: all stands of the joined unit (except Troll Slayers) gain +1 Attack and are Immune to Terror until the end of that Combat phase."}, {name:"Runesmith (Anti-Magic)", desc:"If an enemy Wizard within 50cm casts a spell, the Runesmith can attempt to dispel it on a D6 roll of 4+. Only one attempt per spell. A Runesmith with the Anvil of Doom may add +1 to this roll once per battle and can strike the Anvil to grant units within 20cm Terror Immunity."}],
    spells:[],
    playstyle:"The ultimate defensive army. Dwarf Warriors are the hardest infantry to kill. Multiple artillery pieces punish approaching enemies. Runesmiths neutralise enemy magic. Hold ground, shoot everything, then counter-charge.",
    fluff:"Dwelling in their mountain strongholds since before men walked the earth, the Dwarfs are a proud and stubborn race nursing grudges that span millennia. Their warriors are shorter than men but far tougher, clad in the finest gromril armour. Behind them roar Cannons, Flame Cannons and whirring Gyrocopters. Dwarfs never forget an insult, never break their word, and never, ever retreat.",
    traits:["Toughest infantry", "Finest artillery", "No cavalry", "Runesmiths dispel magic"],
    strengths:"Best infantry toughness, best artillery, anti-magic",
    weaknesses:"No cavalry, slow, vulnerable to flanking",
    generalCmd:10,
    units:[
      { id:"dwf_general", name:"Dwarf Lord", type:"General", atk:"-", hits:"-", armour:"-", cmd:10, size:1, pts:155, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"dwf_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"dwf_runesmith", name:"Runesmith", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Can dispel spells (Staff/Scroll of Spellbinding allowed).", upgrades:[], magic:["devices"] },
      { id:"dwf_anvil", name:"Anvil of Doom", type:"Special", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:50, min:"-", max:1, special:"Attached to Runesmith. Special Bonus +1. See special rules.", upgrades:[], magic:[] },
      { id:"dwf_warriors", name:"Warriors", type:"Infantry", atk:"3", hits:"4", armour:"4+", cmd:"-", size:3, pts:110, min:2, max:"-", special:"Tough core infantry. One Handgunner unit per 1000pts may replace a Warrior unit and count for Warrior min/max.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_handgunners", name:"Handgunners", type:"Infantry", atk:"3/1", hits:"4", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:"-", special:"Armour piercing: enemy armour one worse.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_rangers", name:"Rangers", type:"Infantry", atk:"3/1", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"One unit per 1000pts may infiltrate. Can pursue any troop type.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_trollSlayers", name:"Troll Slayers", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:80, min:"-", max:2, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Immune to terror. Must pursue. +1 vs Monsters. If any survive: enemy scores full VPs. If destroyed: no VPs either side.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_cannon", name:"Cannon", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"6+", cmd:"-", size:2, pts:90, min:"-", max:1, special:"Bouncing cannonball. See rulebook p.74.", upgrades:[], magic:[] },
      { id:"dwf_flameCannon", name:"Flame Cannon", type:"Artillery", atk:"1/2D6", hits:"2", armour:"6+", cmd:"-", size:1, pts:50, min:"-", max:1, special:"Range 30cm. 2D6 attacks (if double: misfire). On double: roll on Flame Cannon Misfire Chart.", upgrades:[], magic:[] },
      { id:"dwf_gyrocopter", name:"Gyrocopter", type:"Machine", atk:"1/3", hits:"3", armour:"5+", cmd:"-", size:1, pts:75, min:"-", max:1, special:"Flies (move 60cm).", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  skaven: {
    name:"Skaven", color:"#6b8e23", bg:"#030402", accent:"#9acd32",
    lore:"Devious ratmen swarming from underground warrens, wielding deadly warp-powered war machines and overwhelming numbers.",
    armyRules:[{name:"Strength in Numbers (Army Rule)", desc:"Brigades may be of any size and are not restricted to the normal four unit maximum."}, {name:"Vermintide (Army Rule)", desc:"Skaven units that win a round of combat can choose to pursue retreating enemy regardless of troop type. Any Skaven unit (including artillery) can pursue any enemy (including flyers, cavalry and chariots). Normal terrain and fortified status restrictions still apply."}, {name:"Under the Lash (Army Rule)", desc:"All Skaven characters — General, Heroes and Wizards alike — have a Command range of only 20cm. Even the General's range is reduced to 20cm."}, {name:"Jezzails", desc:"Count enemy armour values as one worse than normal (3+ becomes 4+, 5+ becomes 6+, 6+ gives no save)."}, {name:"Plague Monks", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Rat Swarms", desc:"Cannot be driven back by shooting and do not roll for drive backs. Can only be supported by other Rat Swarm stands (not other infantry), though they can support other infantry as normal. Cannot be given magic items."}, {name:"Gutter Runners", desc:"Shoot with throwing stars/darts at 15cm range with 360 degree vision. May infiltrate: issue an infiltration order to a point in dense terrain or on any table edge except the enemy's. On success the unit appears there. Infiltrators can attempt infiltration again on subsequent turns if they fail."}, {name:"Screaming Bell", desc:"The Screaming Bell is a Machine (not a mount). A unit with the Screaming Bell is unaffected by the -1 Command penalty from enemy within 20cm."}],
        spells:[
      { name:"Wither", cast:"5+", range:"30cm", desc:"Cast on any enemy unit (no LoS needed). The unit's Armour save is reduced by 1 for the rest of the battle (3+ becomes 4+, etc). Multiple Withers stack. Units with no armour are unaffected." },
      { name:"Warp Lightning", cast:"5+", range:"30cm", desc:"3 shooting attacks that ignore all armour. Wizard must see target. Cannot target a unit in combat. Target can be driven back as with ordinary shooting." },
      { name:"Death Frenzy", cast:"5+", range:"30cm", desc:"Cast on a friendly unit in combat within range. Roll D6s one at a time (max 1 per stand in unit) — total is bonus attacks for that combat phase. If any die repeats a previous result, all Death Frenzy attacks hit your own unit instead." },
      { name:"Plague", cast:"6+", range:"30cm", desc:"6 attacks on any unengaged enemy unit (no LoS needed). Cannot target units in combat. The unit cannot be driven back — the Plague erupts from within." }
    ],
    strengths:"Masses of cheap troops, devastating machines",
    weaknesses:"Short command range severely limits flexibility",
    generalCmd:9,
    units:[
      { id:"sk_greySeer", name:"Grey Seer", type:"General", atk:"+1", hits:"-", armour:"-", cmd:9, size:1, pts:130, min:1, max:1, special:"Command range 20cm only (Under the Lash). Casts spells as a Wizard. Can be given magic items restricted to either a General or a Wizard.", upgrades:[], magic:["devices","weapons"], greySeer:true },
      { id:"sk_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:70, min:"-", max:2, special:"Command range 20cm only (Under the Lash).", upgrades:[], magic:["weapons"] },
      { id:"sk_warlock", name:"Warlock", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:1, special:"Command range 20cm only. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"sk_ratOgreBodyguard", name:"Rat Ogre Bodyguard", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:"-", pts:10, min:"-", max:1, special:"Grey Seer, Heroes and Warlocks may take a Rat Ogre Bodyguard (+1 Attack, +10pts). A character with a bodyguard adds +1 to his Attacks.", upgrades:[], magic:[] },
      { id:"sk_clanrats", name:"Clanrats", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:40, min:2, max:"-", special:"Strength in Numbers: brigades unlimited size.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_stormvermin", name:"Stormvermin", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:55, min:"-", max:2, special:"Elite Skaven infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_jezzails", name:"Jezzails", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:70, min:"-", max:2, special:"Armour piercing: enemy armour one worse.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_plaguemonks", name:"Plague Monks", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:2, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_ratSwarms", name:"Rat Swarms", type:"Infantry", atk:"2", hits:"3", armour:"0", cmd:"-", size:3, pts:25, min:2, max:"-", special:"Cannot be driven back. Can only support/be supported by other Rat Swarms. Cannot have magic items.", upgrades:[], magic:[] },
      { id:"sk_gutterRunners", name:"Gutter Runners", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:2, special:"Shoot 15cm, 360° vision. Can infiltrate.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_ratOgres", name:"Rat Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Powerful monsters.", upgrades:[], magic:[] },
      { id:"sk_warpLightning", name:"Warp Lightning Cannon", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:60, min:"-", max:1, special:"Stone Thrower.", upgrades:[], magic:[] },
      { id:"sk_doomWheel", name:"Doom Wheel", type:"Machine", atk:"5", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"Powerful war machine.", upgrades:[], magic:[] },
      { id:"sk_screamingBell", name:"Screaming Bell", type:"Machine", atk:"0", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"Special machine. Army special rules apply.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  lizardmen: {
    name:"Lizardmen", color:"#1a7a3a", bg:"#010502", accent:"#30d060",
    lore:"Ancient servants of the Old Ones, guided by the mighty Slann Mage-Priests and cold-blooded Saurus warriors.",
    armyRules:[{name:"Born in Jungle (Army Rule)", desc:"No command penalty is applied to any units in the Lizardmen army on account of dense terrain. The Lizardmen are used to communicating through thick jungle by instinct and subsonic noises inaudible to other races."}, {name:"Skinks", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Reptilian", desc:"Reptilian troops (Saurus, Temple Guard, Kroxigor, Cold One Riders) can only be issued an order by a character within 20cm. If Reptilian units are in a brigade, all Reptilian units must be within 20cm of the character issuing the order."}, {name:"Salamanders", desc:"Salamander stands are not deployed independently — any Skink infantry unit may add one Salamander stand (making 4 stands total). Salamanders share unit Armour, fight as part of the unit, and casualties never count for Command penalties. The whole unit (including Salamander) gains Salamander Venom: enemy Armour saves suffer -1 penalty (e.g. 5+ requires a 6)."}, {name:"Stegadon", desc:"Uses a 40x60mm base. Causes terror. Can only brigade with Skink units (not Skinks with Salamanders, not other units, not other Stegadons). The crew has 15cm shooting range and 360 degree vision."}, {name:"Slann Mage Palanquin", desc:"The Slann General has no personal Command value (Command 0) but grants all characters in the army +1 to their Command value. The Slann is a powerful spellcaster and casts spells as a Wizard."}],
        spells:[{name:"Gaze of Sotek", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat. Treated as 3 shooting attacks but armour has no effect. The unit can be driven back as with ordinary shooting."}, {name:"Mazdamundi's Revenge", cast:"4+", range:"60cm", desc:"Cast on any enemy unit within range (no LoS needed). Takes effect until end of opposing player's next turn. The unit cannot charge and if in combat will not pursue or advance — even units otherwise compelled to do so."}, {name:"Wings of the Jungle", cast:"5+", range:"N/A", desc:"Cast on the unengaged friendly unit the Wizard has joined. That unit moves as if it had received an order. The Wizard moves with it. Other characters that have joined the unit do not move."}, {name:"Shield of the Old Ones", cast:"5+", range:"30cm", desc:"Cast on a friendly unit engaged in combat (no LoS needed). Lasts for the following Combat phase. The unit's Armour value counts as 1 better (max 4+): 0→6+, 6+→5+, 5+→4+."}],
    playstyle:"Unique: the Slann General has Command 0 \u2014 succeeds on almost any roll but must be close. Cold-blooded Saurus are tough fighters; Terradons and Stegadons provide shock and terror. Dense terrain is your friend.",
    fluff:"Created by the mystical Old Ones as instruments of cosmic order, the Lizardmen of Lustria are ancient beyond comprehension. At their apex float the vast Slann Mage-Priests, borne on golden palanquins, their minds brushing the fabric of reality. Below them march cold-blooded Saurus warriors and nimble Skink skirmishers, while Stegadons crash through jungle and foe alike like living siege engines.",
    traits:["Command 0 Slann General", "Reptilian 20cm command range", "Massive monsters", "Born in Jungle"],
    strengths:"Slann Command 0, tough infantry, terrifying monsters",
    weaknesses:"20cm command range \u2014 brigades must stay very tight",
    generalCmd:0,
    units:[
      { id:"lz_slann", name:"Slann Mage Palanquin", type:"General", atk:"-", hits:"-", armour:"-", cmd:0, size:1, pts:95, min:1, max:1, special:"Command value 0 — issues orders on any roll except 11-12. Command range covers entire battlefield. Casts spells. Born in Jungle: no command penalty for dense terrain.", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_saurusHero", name:"Saurus Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:6, size:1, pts:45, min:"-", max:1, special:"Command range 20cm (Reptilian — all Reptilian units must be within 20cm to receive orders).", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_skinkHero", name:"Skink Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:70, min:"-", max:3, special:"Command range 20cm (Reptilian).", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_skinkShaman", name:"Skink Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:1, special:"Command range 20cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_stegadon_mount", name:"Stegadon Mount", type:"Monstrous Mount", atk:"+5", hits:"-", armour:"-", cmd:"-", size:1, pts:90, min:"-", max:1, special:"Slann/Saurus Hero may ride. +5 Attacks. Causes terror.", upgrades:[], magic:[] },
      { id:"lz_carnosaur", name:"Carnosaur", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:65, min:"-", max:1, special:"Saurus Hero may ride. +2 Attacks. Causes terror.", upgrades:[], magic:[] },
      { id:"lz_skinks", name:"Skinks", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:35, min:2, max:"-", special:"Shoot 15cm, 360° vision. Reptilian. Salamander stands may be added.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_saurus", name:"Saurus", type:"Infantry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:75, min:2, max:"-", special:"Reptilian.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_templeGuard", name:"Temple Guard", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Reptilian. Elite guard.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_salamander", name:"Salamander", type:"Infantry", atk:"2/2", hits:"3", armour:"0", cmd:"-", size:"+1", pts:25, min:"-", max:2, special:"Attached to Skink unit as extra stand. Salamander Venom: -1 armour save for enemy hit by shooting.", upgrades:[], magic:[] },
      { id:"lz_kroxigor", name:"Kroxigor", type:"Infantry", atk:"5", hits:"3", armour:"4+", cmd:"-", size:3, pts:135, min:"-", max:2, special:"Reptilian. Heavy infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_coldOneRiders", name:"Cold One Riders", type:"Cavalry", atk:"4", hits:"3", armour:"4+", cmd:"-", size:3, pts:140, min:"-", max:2, special:"Reptilian. Elite cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_terradons", name:"Terradons", type:"Monster", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flies.", upgrades:[], magic:[] },
      { id:"lz_stegadon", name:"Stegadon", type:"Monster", atk:"10/3", hits:"10", armour:"4+", cmd:"-", size:1, pts:225, min:"-", max:1, special:"Causes terror. Massive creature.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  bretonnia: {
    name:"Bretonnia", color:"#1a4a8a", bg:"#010308", accent:"#3070d0",
    lore:"A feudal kingdom of honourable knights blessed by the Lady of the Lake, backed by masses of expendable peasantry.",
    armyRules:[{name:"Feudal Society (Army Rule)", desc:"Calculate army withdrawal differently: only count Knights, Grail Knights and Pegasus Knights at the start of the game. Once half or more of these units are lost, the army must withdraw. Peasants and other infantry do not count."}, {name:"Peasants", desc:"Peasants suffer an additional -1 Command penalty when ordered. This penalty is waived if the Peasant unit is in a brigade with at least one non-Peasant unit. Cannot use initiative to charge (but can evade as usual). Capable of supporting charges. When they charge, they receive no bonus attack modifier."}, {name:"Knights", desc:"Always use initiative to charge an enemy if possible; cannot be given orders instead. Never evade. Immune to terror — no -1 Attack modifier."}, {name:"Grail Knights", desc:"In addition to Knight rules, if charging an enemy in the open they receive an additional +1 Attack modifier (same as chariots and monsters)."}, {name:"Trebuchet", desc:"Uses a 40x60mm base. Can move but cannot shoot in the same turn it moves. Destroyed if driven back more than 10cm by shooting or if forced to retreat from combat. Range 80cm. Fortified counts as defended, defended counts as open. No armour rolls allowed. Cannot shoot at charging enemies. Can shoot over the heads of friendly troops on lower ground."}, {name:"Hippogriff Mount", desc:"Only the General can ride a Hippogriff. Flies (move 100cm), adds +2 Attacks. Unit causes terror."}],
        spells:[{name:"Shield of Combat", cast:"4+", range:"N/A", desc:"Cast on the unit the Enchantress has joined. Lasts until end of opposing player's following turn. The unit may re-roll any failed armour rolls during the Combat phase. Only one re-roll is ever permitted."}, {name:"Eerie Mist", cast:"4+", range:"30cm", desc:"Cast on any enemy unit within range (no LoS needed). Lasts until end of opposing player's following turn. The unit cannot use initiative. Any order to the unit or brigade suffers -1 Command penalty."}, {name:"Aerial Shield", cast:"5+", range:"30cm", desc:"Cast on a friendly unit (no LoS needed). Lasts until beginning of next Bretonnian Shooting phase. All enemies that shoot at the enchanted unit get -1 on shooting rolls (minimum 6+ regardless of other modifiers)."}, {name:"Lady's Favour", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade, no supporting charge. The unit moves as if it had received an order. Characters that have joined do not move."}],
    playstyle:"A cavalry-focused army where Knights always charge on initiative. Use them as your strike force. Peasant units are cheap filler \u2014 keep them brigaded with Knights to avoid their command penalty.",
    fluff:"A feudal realm of chivalric tradition, Bretonnia is ruled by a warrior nobility who dedicate their lives to feats of arms and the quest for the Grail. Blessed by the Lady of the Lake, Grail Knights are touched by divinity. Below them masses of expendable Peasant levies form a backdrop to the glittering cavalry charge \u2014 unstoppable, honour-bound, glorious.",
    traits:["Always-charging Knights", "Feudal withdrawal rule", "Peasant limitations", "Grail Knights elite"],
    strengths:"Powerful knight charges, Trebuchet",
    weaknesses:"Peasants are a liability; knights must always charge",
    generalCmd:9,
    units:[
      { id:"br_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Feudal: withdrawal based only on Knights/Grail Knights/Pegasus Knights lost.", upgrades:[], magic:["devices"] },
      { id:"br_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"br_enchantress", name:"Enchantress", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"br_unicorn", name:"Unicorn", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"Enchantress only. +1 Attack. Once per battle: +1 to spell casting roll.", upgrades:[], magic:[] },
      { id:"br_pegasus", name:"Pegasus", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Hero/Enchantress may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"br_hippogriff", name:"Hippogriff", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Enchantress may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"br_grailReliquae", name:"Grail Reliquae", type:"Special", atk:"-", hits:"-", armour:"-", cmd:"-", size:1, pts:60, min:"-", max:1, special:"Special bonus to nearby Peasant units. See special rules.", upgrades:[], magic:[] },
      { id:"br_menAtArms", name:"Men-at-Arms", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:1, max:"-", special:"Standard infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_bowmen", name:"Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Archers.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_peasants", name:"Peasants", type:"Infantry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:"-", max:4, special:"-1 Command penalty (waived if brigaded with non-Peasants). Cannot charge on initiative. No bonus attack when charging.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_squires", name:"Squires", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:90, min:1, max:4, special:"Light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:1, max:"-", special:"Always charge on initiative. Cannot evade. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_grailKnights", name:"Grail Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:120, min:"-", max:1, special:"As Knights. +1 Attack modifier when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_pegasusKnights", name:"Pegasus Knights", type:"Monster", atk:"2", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:"-", max:1, special:"Flies. Counts as Knights for withdrawal.", upgrades:[], magic:["standards","weapons"] },
      { id:"br_trebuchet", name:"Trebuchet", type:"Artillery", atk:"1/4", hits:"4", armour:"0", cmd:"-", size:1, pts:100, min:"-", max:1, special:"Range 80cm. No armour saves. Fortified counts as defended. Can shoot blind at targets it can't see (6+ to hit).", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  kislev: {
    name:"Kislev", color:"#1080a0", bg:"#010508", accent:"#30b0d0",
    lore:"Hardy northern warriors of the steppes, masters of mounted combat and fierce defenders against Chaos.",
    armyRules:[{name:"Winged Lancers", desc:"Receive +1 Attack in the first round of every combat when fighting to the front. Immune to Terror."}, {name:"Horse Archers and Cossacks", desc:"Kislevite Horsemen have 15cm shooting range and 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Bowmen", desc:"One unit of Bowmen per 1000pts can replace a unit of Axemen while still counting for Axemen min/max value."}, {name:"Red Guard", desc:"Armed with handguns in addition to long axes. Count enemy Armour values as one worse when shot (3+ = 4+, 4+ = 5+, 5+ = 6+, 6+ = no save)."}, {name:"Bears", desc:"Defined as infantry for movement purposes but add +1 Attack when charging an enemy in the open (like monsters and chariots). Can only give and receive support from other Bear units. Must pursue retreating enemies where possible. Never count as defended outside dense terrain."}, {name:"War Wagon", desc:"Cannot charge and moves 20cm at full pace. Moving up to 5cm can end in laager formation (360 degree fire, 4+ Armour). Moving more than 5cm must end in column formation. Either stand can be removed as casualty; can only move while the team stand remains. 30cm range, counts enemy Armour one worse. Can shoot over lower friendly troops. Cannot pursue but is not destroyed if forced to retreat."}, {name:"Tzarina Upgrade", desc:"The General may be upgraded to the Tzarina (+25pts, max 1 per army). She casts spells as a Wizard and may carry a Wizard magic item. Once per battle she may add +1 to a casting dice result (announce before rolling)."}],
        spells:[{name:"Monster Bear!", cast:"5+", range:"N/A", desc:"The Wizard must have joined a unit engaged in combat. Lasts for the following Combat phase. The unit causes terror and the Wizard gains +2 Attacks. Note: if the Tzarina casts this she adds +4 total (+2 General, +2 spell)."}, {name:"Icy Blast", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat. Treated as 3 shooting attacks but armour has no effect — all targets count as having no armour. The unit can be driven back as with ordinary shooting."}, {name:"Chill", cast:"4+", range:"30cm", desc:"Cast on an enemy unit engaged in combat and within range (no LoS needed). Lasts for the following Combat phase. Every stand in the unit, including characters, deducts -1 from its Attacks value."}, {name:"Freeze", cast:"6+", range:"60cm", desc:"Cast on any enemy unit not engaged in combat within range (no LoS needed). Roll a D6 — if the score exceeds the unit's Hits value, one stand is destroyed (no save). If not, no effect. Cannot cause drive back."}],
    playstyle:"A fast, mobile army dominating open ground. Horse Archers screen and harry; Winged Lancers deliver the killing blow. The War Wagon is a powerful firebase. Avoid dense terrain \u2014 you want room to manoeuvre.",
    fluff:"Between the Empire and the Realm of Chaos stands Kislev \u2014 a cold, windswept land hardened by centuries of brutal winters and Chaos raids. Kislevite armies are dominated by cavalry: swift Horse Archers, heavy Cossacks and the feared Winged Lancers whose charge has broken many a Chaos warband. Their shamans call upon the elemental spirits of ice and storm.",
    traits:["Cavalry-heavy", "Good missile units", "War Wagon anchor", "Winged Lancer shock troops"],
    strengths:"Fast and mobile, great shooting cavalry",
    weaknesses:"Weaker in dense terrain; lighter infantry",
    generalCmd:9,
    units:[
      { id:"ki_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ki_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ki_shaman", name:"Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ki_bear", name:"Bear Mount", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero may ride a Bear. +1 Attack.", upgrades:[], magic:[] },
      { id:"ki_yozhin", name:"Yozhin of the Bog", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:40, min:"-", max:1, special:"General/Hero may ride Yozhin. +1 Attack. Special monster mount.", upgrades:[], magic:[] },
      { id:"ki_tzarina", name:"Tzarina", type:"Special", atk:"+0", hits:"-", armour:"-", cmd:"-", size:1, pts:25, min:"-", max:1, special:"Attached to General. Ice Queen: special ice magic ability.", upgrades:[], magic:[] },
      { id:"ki_wingedLancers", name:"Winged Lancers", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"+1 Attack in first round when fighting to front. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_horseArchers", name:"Horse Archers", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:2, max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_cossacks", name:"Cossacks", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:2, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_bowmen", name:"Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Standard missile troops.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_redGuard", name:"Red Guard", type:"Infantry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:1, special:"Handguns: armour piercing (enemy armour one worse).", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_axemen", name:"Axemen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Core infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_bears", name:"Bears", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:90, min:"-", max:1, special:"+1 Attack charging in open (like monster). Can only give/receive support from other Bears. Must pursue. Never count as defended outside dense terrain.", upgrades:[], magic:[] },
      { id:"ki_warWagon", name:"War Wagon", type:"Artillery", atk:"4/4", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"4 shooting + 4 combat attacks. Shoot 360°, 30cm. Armour piercing. Two stands: wagon and team.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  dark_elves: {
    name:"Dark Elves", color:"#6010a0", bg:"#040008", accent:"#9020e0",
    lore:"Bitter exiles of Naggaroth devoted to Khaine, fielding merciless warriors and monstrous beasts.",
    armyRules:[{name:"Crossbowmen and Dark Riders", desc:"These units have repeating crossbows. They shoot twice (2 attacks per stand) at targets within 15cm, and once (1 per stand) at 16-30cm range. Against charging enemies they shoot once per stand regardless of range."}, {name:"Witch Elves", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Cold One Knights", desc:"Add +1 Attack in the first round of each combat when fighting to the front (front edge or frontal corners contact). Cannot form brigades except with other Cold One Knight units."}, {name:"War Hydra", desc:"Cannot brigade even with other War Hydras. Causes terror. Breathes fire: 20cm range, 2 Attacks. After all hits are struck in a round (if not slain), the Hydra automatically regenerates 1 hit suffered that round. Regenerated hits still count towards the combat result."}, {name:"Dark Elf General", desc:"If a Hero or Sorceress rolls a double 6 when issuing orders, the General must either lose 1 Command value (e.g. 10 becomes 9) or execute the failed underling — the character is removed as a casualty but does not count for enemy victory points. If the General rolls a double 6 (blunder), the General automatically loses 1 Command value regardless."}],
        spells:[{name:"Doom Bolt", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Sorceress in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Black Horror", cast:"6+", range:"50cm", desc:"Cast on a visible enemy unit not engaged in combat. The unit suffers 4 attacks with no armour saves. The unit is not driven back — the vortex sucks victims down."}, {name:"Dominion", cast:"4+", range:"60cm", desc:"Cast on any enemy unit within range (no LoS needed). Takes effect until end of opposing player's next turn. The unit cannot charge and will not pursue or advance — even units otherwise compelled to do so."}, {name:"Soul Stealer", cast:"5+", range:"N/A", desc:"The Sorceress must have joined a unit in combat. Targets one enemy unit touching the Sorceress's unit. That unit loses one stand with no armour save. The Sorceress gains +1 Attack for the rest of the game."}],
    playstyle:"An aggressive high-risk army. Repeating crossbows generate huge shooting volume. Cold One Knights cannot brigade \u2014 use them as independent hammers. The execution mechanic means characters may be killed for blunders.",
    fluff:"Exiled from Ulthuan ten thousand years ago, the Dark Elves of Naggaroth have nursed their hatred into something magnificent and terrible. Witch Elves driven to ecstatic frenzy, Cold One-riding knights, and monstrous War Hydras march alongside soldiers whose repeating crossbows can riddle an enemy unit before it reaches combat. Beauty and death are the same thing in Naggarond.",
    traits:["Repeating crossbows", "Execution mechanic", "Cold One Knights", "Witch Elves frenzy"],
    strengths:"Massive shooting volume, elite cavalry",
    weaknesses:"Execution mechanic punishes bad dice; Cold Ones can't brigade",
    generalCmd:10,
    units:[
      { id:"de_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:10, size:1, pts:155, min:1, max:1, special:"If Hero/Sorceress rolls double-6, General loses 1 Command or executes them (remove, no VPs). Blunder by General also loses 1 Command. Minimum Command 8.", upgrades:[], magic:["devices"] },
      { id:"de_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"de_sorceress", name:"Sorceress", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"de_manticore", name:"Manticore", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Sorceress may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"de_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Sorceress may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"de_cauldronBlood", name:"Cauldron of Blood", type:"Chariot Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Hero/Sorceress may ride. +2 Attacks. Special rules apply.", upgrades:[], magic:[] },
      { id:"de_spearmen", name:"Spearmen", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core Dark Elf infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_crossbowmen", name:"Crossbowmen", type:"Infantry", atk:"3/2", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:1, max:"-", special:"Repeating crossbow: shoot twice at ≤15cm (6 attacks), once at ≤30cm (3 attacks). 1 attack/stand when shooting at chargers.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_witchElves", name:"Witch Elves", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:2, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_darkRiders", name:"Dark Riders", type:"Cavalry", atk:"3/2", hits:"3", armour:"6+", cmd:"-", size:3, pts:95, min:"-", max:3, special:"Repeating crossbow: shoot twice at ≤15cm. 1 attack/stand at chargers.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_coldOneKnights", name:"Cold One Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:130, min:"-", max:3, special:"+1 Attack in first round of each combat when fighting to front. Cannot brigade except with other Cold One Knights.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_harpies", name:"Harpies", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:65, min:"-", max:1, special:"Flies. Based on long edge. Cannot be joined by characters.", upgrades:[], magic:[] },
      { id:"de_warHydra", name:"War Hydra", type:"Monster", atk:"6/2", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"Powerful monster. Causes terror.", upgrades:[], magic:[] },
      { id:"de_boltThrower", name:"Bolt Thrower", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:55, min:"-", max:1, special:"Bolt Thrower with skewer rule.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DAEMONS OF KHORNE — Blood God, Lord of Slaughter
  // No magic whatsoever. Pure combat aggression. Fastest, hardest-hitting.
  // ══════════════════════════════════════════════════════════════════════════

  daemons: {
    name:"Daemons", color:"#7a3a8a", bg:"#08010a", accent:"#cc88ff",
    lore:"The daemon armies of Chaos constantly reshape and reform from mankind's ever shifting fears, servants of the four great gods erupting from the Realm of Chaos to destroy the mortal world.",
    armyRules:[{name:"Ignore Terror", desc:"All units ignore the -1 Attack penalty in combat for fighting terrifying troops."}, {name:"Daemonic Instability", desc:"At the start of the Command phase, all Daemon units with casualties roll D6 (−1 if 1 stand remains and >20cm from a Wizard). 0–1: stand destroyed; 2–3: confused; 4–5: no effect/clears confusion; 6: regain one stand."}],
    playstyle:"A versatile, hard-hitting force immune to terror. Daemon Hordes are elite infantry, Daemon Cavalry are fast and powerful, and the Greater Daemon is a game-ending monster that flies and causes terror. The Daemon Sorcerer provides crucial support — keeping damaged units within 20cm improves their Instability rolls. Balance offence with proximity to your Sorcerer.",
    fluff:"The world is awash with unseen magic from the dark dimension between time and space. The great gods of Chaos — Khorne the Blood God, Tzeentch the Changer of Ways, Nurgle the Plague Lord, and Slaanesh the Lord of Pleasure — send forth their daemonic servants in a tide of nightmare. These are not creatures of flesh but ethereal forces given terrible purpose, reshaping themselves in the face of mortal fear.",
    traits:["Immune to Terror","Daemonic Instability","Flies (Greater Daemon)","Mixed daemon types"],
    strengths:"Strong combat infantry; Greater Daemon is the most powerful monster in the game; Sorcerer keeps Instability in check",
    weaknesses:"Daemonic Instability can destroy units; no shooting except magic; Daemon Swarms cannot be magic-itemed",
    generalCmd:9,
    spells:[
      { name:"Summon Daemons", cast:"4+", range:"60cm",
        desc:"Fresh Daemons emerge from the warp to reinforce their beleaguered kindred. Cast on any friendly Daemon unit of three stands that has lost one or two stands as casualties — the unit regains one stand, placed behind, in front or beside another stand. If already in combat, the stand may be placed touching the enemy and counts as charging." },
      { name:"Daemonic Rage", cast:"5+", range:"30cm",
        desc:"Magical energy surges through daemonic bodies. Affects every friendly unit within 30cm range — lasts during the following Combat phase. Every unit gains a bonus +1 attack that can be allocated to any stand in the unit." },
      { name:"Sorcerous Blast", cast:"5+", range:"30cm",
        desc:"A bolt of black lightning leaps from fingertip to foe. Treated like three ordinary shooting attacks except armour has no effect — all targets count as having no armour. May not target a unit engaged in combat. Target must be visible to the Wizard." },
      { name:"Frenzy of Chaos", cast:"6+", range:"30cm",
        desc:"Thunderous power drives the daemonic ranks into a frenzied thirst for blood. Cast on a friendly unit engaged in combat within range (Sorcerer does not need line of sight). Effect lasts until end of following Combat phase — the unit may re-roll any failed attack dice in combat (dice that fail to score hits may be rolled again, but no dice may be re-rolled twice)." },
    ],
    instabilityTable:[
      { roll:"0–1", result:"Stand Destroyed",    effect:"One stand is destroyed — the daemons fade away and are absorbed back into the Realm of Chaos. Remove one stand from play. If a character is with the unit and the last stand is removed, the character is destroyed too." },
      { roll:"2–3", result:"Confused",            effect:"The unit becomes confused (if not already). It is torn between this world and the next." },
      { roll:"4–5", result:"No Effect",           effect:"No effect — unless the unit is confused, in which case it ceases to be confused as it is favoured with the invigorating power of Chaos." },
      { roll:"6",   result:"Regain Stand",        effect:"The unit regains one stand. Place it directly behind, in front, or beside another stand from the same unit facing the same direction. If impossible to position, the stand cannot be added." },
    ],
    units:[
      // ── CHARACTERS ──────────────────────────────────────────────────────
      { id:"d_overlord", name:"Daemon Overlord", type:"General",
        atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1,
        special:"Command range covers entire battlefield. May be given magical powers for +25pts (can then take General or Wizard magic items). Daemonic Instability.",
        upgrades:["daemonicWings","favourOfGods"], magic:["devices"] },
      { id:"d_lord", name:"Daemon Lord", type:"Hero",
        atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1,
        special:"Command range 60cm. Daemonic Instability.",
        upgrades:["daemonicWings","favourOfGods"], magic:[] },
      { id:"d_sorcerer", name:"Daemon Sorcerer", type:"Wizard",
        atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1,
        special:"Command range 20cm. Casts spells. Friendly Daemon units within 20cm with only 1 stand remaining add +1 to Daemonic Instability rolls. Daemonic Instability.",
        upgrades:["daemonicWings","favourOfGods"], magic:["arcane"] },
      // ── INFANTRY ────────────────────────────────────────────────────────
      { id:"d_horde", name:"Daemon Horde", type:"Infantry",
        atk:4, hits:3, armour:"5+", cmd:"-", size:3, pts:75, min:3, max:"-",
        special:"Daemonic Instability: test at start of own Command phase if unit has suffered casualties.",
        upgrades:[], magic:["standards","weapons"] },
      { id:"d_swarm", name:"Daemon Swarm", type:"Infantry",
        atk:2, hits:4, armour:0, cmd:"-", size:3, pts:45, min:"-", max:4,
        special:"Cannot be driven back by shooting and do not roll for drive backs. Cannot be given a magic item. Daemonic Instability.",
        upgrades:[], magic:[] },
      // ── CAVALRY ─────────────────────────────────────────────────────────
      { id:"d_cavalry", name:"Daemon Cavalry", type:"Cavalry",
        atk:4, hits:3, armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3,
        special:"Daemonic Instability.",
        upgrades:[], magic:["standards","weapons"] },
      { id:"d_hounds", name:"Daemon Hounds", type:"Cavalry",
        atk:3, hits:3, armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:2,
        special:"Daemonic Instability.",
        upgrades:[], magic:["standards","weapons"] },
      // ── CHARIOTS ────────────────────────────────────────────────────────
      { id:"d_chariots", name:"Daemon Chariots", type:"Chariot",
        atk:3, hits:3, armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:3,
        special:"Daemonic Instability.",
        upgrades:[], magic:["standards","weapons"] },
      // ── MONSTERS ────────────────────────────────────────────────────────
      { id:"d_beasts", name:"Daemon Beasts", type:"Monster",
        atk:5, hits:4, armour:"5+", cmd:"-", size:3, pts:200, min:"-", max:1,
        special:"Daemonic Instability.",
        upgrades:[], magic:[] },
      { id:"d_flyers", name:"Daemon Flyers", type:"Monster",
        atk:2, hits:3, armour:"5+", cmd:"-", size:3, pts:80, min:"-", max:1,
        special:"Flies. Stands face long edge (like infantry) rather than short edge. Daemonic Instability.",
        upgrades:[], magic:[] },
      { id:"d_greater", name:"Greater Daemon", type:"Monster",
        atk:8, hits:6, armour:"4+", cmd:"-", size:1, pts:280, min:"-", max:1,
        special:"Flies (regardless of whether model has wings — aerial propulsion by sheer will). Causes terror. If it accumulates 4–5 hits at end of Shooting or Combat phase while not engaged in combat, it is Badly Hurt: discard accumulated hits and halve Hits (to 3) and Attacks (to 4) for the rest of the battle. Daemonic Instability.",
        upgrades:[], magic:[] },
    ],
    upgradeRules:{
      daemonicWings:{ label:"Daemonic Wings", cost:10, desc:"Character gains the ability to fly. Move 100cm. One per army.", appliesTo:["General","Hero","Wizard"] },
      favourOfGods:{ label:"Favour of the Gods", cost:50, desc:"Character gains +1 extra Attack and causes terror in enemies. One per army.", appliesTo:["General","Hero","Wizard"] },
    },
  },

  vampire_counts: {
    name:"Vampire Counts", color:"#6a0a6a", bg:"#050005", accent:"#b020b0",
    lore:"Ancient vampires commanding legions of undead in an eternal crusade to devour the living.",
    armyRules:[{name:"Undead (Army Rule)", desc:"All units except Ghouls: never act on initiative; only move in the Command phase if ordered (Fell Bats may home back). Unaffected by: the -1 Command penalty for enemy within 20cm; the -1 Combat penalty for fighting terrifying troops; the Confusion rule. Undead units cannot make a supporting charge for a unit of Ghouls charging on initiative."}, {name:"Ethereal Host", desc:"Attacks always inflict a hit on 4+ regardless of enemy status (open, defended or fortified). Cannot be driven back by shooting. Cause terror. Cannot have magic items."}, {name:"Dire Wolves", desc:"If charging an enemy in the open, receive +1 Attack modifier (like chariots and monsters). Cannot have magic items."}, {name:"Fell Bats", desc:"Can fly. Can home back without requiring an order. Based along the long base edge like infantry (not the short edge like most monsters)."}, {name:"Vampire Lord", desc:"A powerful sorcerer as well as General. Can cast spells as a Wizard and may be given magic items restricted to either Generals or Wizards. Command range still extends over the whole battlefield."}],
        spells:[{name:"Raise Dead", cast:"5+", range:"30cm", desc:"Cast on a combat engagement within 30cm (no LoS needed). Creates a 3-stand Skeleton unit placed in contact with the engagement. If stands cannot be legally placed the spell fails. Raised dead do not count as charging and are ignored for breakpoint and victory points."}, {name:"Vanhel's Danse Macabre", cast:"5+", range:"40cm", desc:"Cast on any friendly unit except Ghouls within range (no LoS needed). Affects a single unit only — no brigade. The unit moves as if it had received an order. Characters that have joined do not move."}, {name:"Death Bolt", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat. Treated as 3 shooting attacks with no armour saves. The unit can be driven back as with ordinary shooting."}, {name:"Vile Curse", cast:"4+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat within range. The unit suffers -1 to its Command value until the end of the opposing player's following turn."}],
    playstyle:"Undead immunity makes this army psychologically unbreakable. The Vampire Lord doubles as a Wizard. Ethereal Hosts ignore armour entirely. Build a solid infantry core and use Dire Wolves and Fell Bats to threaten flanks.",
    fluff:"In the cursed lands of Sylvania dwell the Vampire Counts \u2014 ancient undead nobles who rule over legions of risen dead. Driven by insatiable hunger and iron will, they marshal skeletal warriors, shambling Zombies, spectral Wraith-hosts and galloping Black Knights in a relentless crusade against the living. At their head stands the Vampire Lord \u2014 warrior, sorcerer and monster in one immortal form.",
    traits:["Undead immunity", "Vampire Lord also a Wizard", "Black Knights cavalry", "Ethereal Host ignores armour"],
    strengths:"Undead immunity, Ethereal Hosts, versatile characters",
    weaknesses:"Many units have low attack values",
    generalCmd:9,
    units:[
      { id:"vc_general", name:"Vampire Lord", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:150, min:1, max:1, special:"Command range covers entire battlefield. Also a Wizard: casts spells. Can take General OR Wizard magic items.", upgrades:[], magic:["weapons","devices"] },
      { id:"vc_vampire", name:"Vampire", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"vc_necromancer", name:"Necromancer", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"vc_wingedNightmare", name:"Winged Nightmare", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Any character may ride. Flies (move 100cm). Unit causes terror.", upgrades:[], magic:[] },
      { id:"vc_blackCoach", name:"Black Coach", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:40, min:"-", max:1, special:"Vampire Lord or Vampire may ride. +1 Attack. Unit causes terror.", upgrades:[], magic:[] },
      { id:"vc_skeletons", name:"Skeletons", type:"Infantry", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:30, min:2, max:"-", special:"Undead: no initiative, immune to terror penalty/confusion/enemy-within-20cm penalty.", upgrades:[], magic:["standards","weapons"] },
      { id:"vc_zombies", name:"Zombies", type:"Infantry", atk:"2", hits:"4", armour:"0", cmd:"-", size:3, pts:35, min:2, max:"-", special:"Undead.", upgrades:[], magic:["standards","weapons"] },
      { id:"vc_ghouls", name:"Ghouls", type:"Infantry", atk:"4", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Mortal troops — not Undead. Normal rules apply.", upgrades:[], magic:["standards","weapons"] },
      { id:"vc_graveGuard", name:"Grave Guard", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:"-", max:4, special:"Undead. Elite skeletons.", upgrades:[], magic:["standards","weapons"] },
      { id:"vc_etherealHost", name:"Ethereal Host", type:"Infantry", atk:"3", hits:"4", armour:"0", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Undead. Attacks always hit on 4+ regardless of status. Cannot be driven back. Causes terror. Cannot have magic items.", upgrades:[], magic:[] },
      { id:"vc_blackKnights", name:"Black Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:4, special:"Undead. Heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"vc_direWolves", name:"Dire Wolves", type:"Cavalry", atk:"2", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:4, special:"Undead. +1 Attack when charging in open (like monster). Cannot have magic items.", upgrades:[], magic:[] },
      { id:"vc_fellBats", name:"Fell Bats", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:65, min:"-", max:1, special:"Undead. Flies. Based on long edge. Can home back to character.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  araby: {
    name:"Araby", color:"#c07010", bg:"#080500", accent:"#e0a020",
    lore:"Proud desert warriors of the Southern lands, commanding war elephants, magic carpet riders and powerful djinn.",
    armyRules:[{name:"Guards", desc:"The Sultan Guards obey the first order each turn on a Command roll of 10 or less when ordered by the General, with no penalties applied. Further orders use normal Command and penalties. Applies only to Guards, not brigades containing Guards."}, {name:"Desert Riders", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Camel Riders", desc:"Ignore distance modifiers when receiving orders (applies to Camel Riders only, not brigades containing them). However, all orders to Camel Riders or brigades containing them suffer a -1 Command penalty due to the camels' intractable nature."}, {name:"Magic Carpets", desc:"Fly. Rated as aerial cavalry. Because they are awkward flyers, they can be pursued by any troop type. Have 15cm shooting range and 360 degree vision."}, {name:"Elephants", desc:"Cause terror. Cannot brigade with cavalry (but can brigade with other troop types including other Elephants). If they would become Confused, they Stampede instead (no normal confusion rules apply). Stampeding Elephants: cannot be given orders or use initiative; roll D6 at start of Command phase to determine movement direction. Cease stampeding at end of their own Command phase."}],
        spells:[{name:"Sand Storm", cast:"4+", range:"30cm", desc:"Cast on the Sorcerer himself. Lasts until end of opposing player's following turn. All enemy units within 30cm of the Sorcerer suffer -1 Command penalty when orders are issued to them."}, {name:"Mirage", cast:"4+", range:"60cm", desc:"Place an illusionary unit (chosen from the Araby list) within 60cm of the Sorcerer and more than 20cm from any enemy. The illusion cannot move or fight but is treated as real by the enemy until contacted. While the Mirage is on the table the Wizard cannot cast any other spells."}, {name:"Sunstrike", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Wizard in any direction. Each unit under the line takes 3 shooting attacks (all modifiers apply). Unengaged units can be driven back; engaged units carry over hits."}, {name:"Djinn Summons", cast:"5+", range:"N/A", desc:"The Wizard must have joined a unit in combat. All stands in the unit, including characters, gain +1 Attack for the duration of the following Combat phase."}],
    playstyle:"An exotic, fast-moving army with unique options. Djinn-mounted wizards can shoot and fight. Magic Carpet cavalry fly. Elephants cause terror but can stampede. Blend missile cavalry harassment with elephant charges.",
    fluff:"South of the Old World lie the golden desert kingdoms of Araby \u2014 a land of ancient learning, extravagant wealth and powerful magic. Their armies march behind banners of silk, mounted on swift desert horses or lumbering War Elephants, their sorcerers carried aloft on Flying Carpets or bound Djinn. To face Araby is to face mystery.",
    traits:["Flying Carpets", "War Elephants", "Djinn sorcery", "Good cavalry mix"],
    strengths:"Unique flying options, elephants cause terror",
    weaknesses:"Elephants can stampede; coordination is complex",
    generalCmd:9,
    units:[
      { id:"ar_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ar_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ar_wizard", name:"Wizard", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ar_flyingCarpet", name:"Flying Carpet", type:"Chariot Mount", atk:"+0", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"ar_elephant_mount", name:"Elephant Mount", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:65, min:"-", max:1, special:"General/Hero/Wizard may ride. +2 Attacks. Causes terror.", upgrades:[], magic:[] },
      { id:"ar_djinn", name:"Djinn", type:"Monstrous Mount", atk:"+2/+2", hits:"-", armour:"-", cmd:"-", size:1, pts:90, min:"-", max:1, special:"General/Hero/Wizard may ride. +2 Attacks in combat and +2 shooting attacks. Flies.", upgrades:[], magic:[] },
      { id:"ar_spearmen", name:"Spearmen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Core infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_bowmen", name:"Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:2, max:"-", special:"Archers.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_guards", name:"Guards", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:65, min:"-", max:4, special:"Sultan's elite guard. First order from General each turn at Command 10 (no penalties).", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_desertRiders", name:"Desert Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_camelRiders", name:"Camel Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:100, min:"-", max:2, special:"Ignore distance command modifiers. -1 Command penalty for all orders to them.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_magicCarpets", name:"Magic Carpets", type:"Cavalry", atk:"1/2", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flying cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_elephants", name:"Elephants", type:"Monster", atk:"5", hits:"4", armour:"5+", cmd:"-", size:3, pts:200, min:"-", max:1, special:"Causes terror. Stampede: if fails order, rolls on stampede chart.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  dogs_of_war: {
    name:"Dogs of War", color:"#808020", bg:"#050500", accent:"#c0c030",
    lore:"Mercenary companies from across the Old World, hiring out to the highest bidder with diverse troops and tactics.",
    armyRules:[{name:"Pikemen", desc:"Never benefit from defended or fortified status in dense terrain or on fortress walls. Count as defended against cavalry or chariots charging their front (first combat round only). Based as cavalry but move as infantry. Can only give/receive support from infantry or other Pikemen stands facing the same direction, touching flank with whole flank. No support from behind or in front."}, {name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun. One Crossbowmen unit per 1000pts can be replaced by Handgunners at +10pts, still counting for Crossbowmen min/max."}, {name:"Ogres", desc:"Must use initiative to charge enemy human units within 20cm at start of Command phase. Automatic — commanders cannot prevent it. 'Humans' includes most men but not Dwarfs or Elves."}, {name:"Light Cavalry", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Giants", desc:"Must be given separate orders; cannot brigade with other troops. On a failed order, roll on the Giant Goes Wild chart. Giants with 5-7 hits while not engaged become Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Giants cause terror."}, {name:"Paymaster", desc:"Only one Paymaster per army. Once per game using the Pay Wagon, the Paymaster may add +1 to all his Command checks for a single turn (announce before rolling)."}],
        spells:[{name:"Ball of Flame", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Wizard in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Voice of Command", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). The unit moves as if it had received an order. Character stands that have joined do not move with it."}, {name:"Weird Enchantment", cast:"4+", range:"30cm", desc:"Cast on any enemy unit (no LoS needed). Lasts until end of opposing player's following turn. The unit moves at half pace in all situations. Counts all enemies as terrifying (-1 Attack), even if normally immune — unless the target is Undead or Daemon."},
      { name:"Teleport", cast:"2+", range:"N/A",
        desc:"The Wizard vanishes to reappear anywhere on the battlefield. Move the Wizard to any new position on the table — he can leave or join a unit if he wishes. Once moved, he can cast a second (different) spell this turn. A Wizard that Teleports can therefore potentially cast two spells that turn." }],
    playstyle:"The most diverse army in the game. You can field Dwarfs, Ogres, Birdmen, Giants and Knights together. The Paymaster's Pay Wagon provides morale bonuses. Build a balanced force exploiting the best of every culture.",
    fluff:"Coin is the language that all people speak. The Dogs of War are mercenary companies from every corner of the Old World, selling their blades to whoever can afford them. Tilean pike blocks march beside Norse Marauders; Dwarf engineers maintain the Galloper Guns; even Ogres hire out for plunder. Led by their Paymaster, these disparate warriors fight with surprising cohesion when the gold is good.",
    traits:["Mixed races in one army", "Dwarfs and Ogres available", "Pikemen formation bonus", "Paymaster morale rules"],
    strengths:"Incredible unit variety, Dwarfs and Ogres in one list",
    weaknesses:"No single specialisation; coordination complex",
    generalCmd:9,
    units:[
      { id:"dow_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"dow_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"dow_paymaster", name:"Paymaster", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Special Paymaster rules.", upgrades:[], magic:["weapons","devices"] },
      { id:"dow_wizard", name:"Wizard", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"dow_griffon", name:"Griffon", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"dow_payWagon", name:"Pay Wagon", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"Paymaster may ride. +1 Attack. Special morale bonus.", upgrades:[], magic:[] },
      { id:"dow_pikemen", name:"Pikemen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:50, min:2, max:"-", special:"Never defended/fortified in dense terrain. Defended vs charging cavalry/chariots to front in first round. Based as cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_crossbowmen", name:"Crossbowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:2, max:"-", special:"Standard crossbowmen.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_handgunners", name:"Handgunners", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:"-", max:2, special:"Armour piercing.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_swordsmen", name:"Swordsmen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:"-", max:4, special:"Standard infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_ogres", name:"Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:"-", max:1, special:"Must charge humans on initiative.", upgrades:[], magic:[] },
      { id:"dow_dwarfs", name:"Dwarfs", type:"Infantry", atk:"3", hits:"4", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Tough mercenary dwarfs.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_marauders", name:"Marauders", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:"-", max:2, special:"Northern mercenaries.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_lightCavalry", name:"Light Cavalry", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:4, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"dow_galloperguns", name:"Galloper Guns", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"0", cmd:"-", size:2, pts:85, min:"-", max:1, special:"Light cannon. Move 20cm (10cm half-pace).", upgrades:[], magic:[] },
      { id:"dow_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"dow_birdmen", name:"Birdmen of Catrazza", type:"Infantry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flies. Shoot 15cm.", upgrades:[], magic:["standards","weapons"] },
    ],
    upgradeRules:{}
  },

  ogre_kingdoms: {
    name:"Ogre Kingdoms", color:"#a05020", bg:"#060300", accent:"#e07030",
    lore:"Massive, brutal warriors from the mountains who eat everything and fear nothing.",
    armyRules:[{name:"Bull Ogres / Ogre infantry", desc:"If any Ogre infantry unit can use initiative to charge an enemy human unit within 20cm at start of Command phase, it must do so automatically. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Leadbelchers", desc:"15cm shooting range, 2 shooting attacks per unit. Shooting attacks impose a -1 penalty to armour rolls."}, {name:"Yhetees", desc:"Add +1 Attack when charging in the open (like monsters and chariots). Can only give/receive support from other Yhetee stands. Must pursue retreating enemies where possible and must advance into combat if able."}, {name:"Gnoblars", desc:"Shoot as if with bows at 15cm range. Cannot be supported by non-Gnoblar infantry (can support others as normal). Cannot have magic items. Characters cannot join Gnoblar units."}, {name:"Gorgers", desc:"Always -1 Command penalty when ordered due to beastly nature. Always ignore distance Command modifiers when receiving orders. Can pursue any retreating enemy type. May infiltrate onto the battlefield instead of deploying normally."}, {name:"Slave Giant", desc:"Must be given separate orders; cannot brigade. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}],
        spells:[{name:"Tooth Cracker", cast:"3+", range:"30cm", desc:"Target friendly unit cannot be driven back or confused until your next turn."}, {name:"Bone Cruncher", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Counts as 3 shooting attacks with no armour save. Causes drive back as normal shooting."}, {name:"Bull Gorger", cast:"4+", range:"N/A", desc:"The Butcher must have joined a unit in combat. Adds +1 Attack for each stand in the unit including the Butcher's own stand. Lasts for the following Combat phase."}, {name:"Troll Guts", cast:"5+", range:"30cm", desc:"Cast on a friendly unit in combat. Each stand in the affected unit gains +1 Hit during the following Combat phase."}],
    playstyle:"Pure aggression. Bull Ogres must charge humans on initiative \u2014 use this as a feature, not a bug. Ironguts and Rhinox Riders are devastating. Gnoblars screen your approach cheaply. Every engagement should end in one round.",
    fluff:"High in the mountains east of the Old World dwell the Ogres \u2014 massive, brutish beings driven by an insatiable hunger. They eat everything: livestock, enemies, the occasional ally. Rhinox-riding Maneaters charge like siege weapons; Yhetees howl through snowstorms; Gorgers emerge from underground to attack where least expected.",
    traits:["All units hit like monsters", "Must charge humans on initiative", "Rhinox Riders cause terror", "Gnoblars as cheap filler"],
    strengths:"Extremely high damage output, terrifying cavalry",
    weaknesses:"Forced charges can be exploited; limited shooting",
    generalCmd:9,
    units:[
      { id:"ok_tyrant", name:"Tyrant", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ok_bruiser", name:"Bruiser", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ok_butcher", name:"Butcher", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ok_bullRhinox", name:"Bull Rhinox", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:65, min:"-", max:1, special:"Tyrant/Bruiser/Butcher may ride. +2 Attacks. Causes terror.", upgrades:[], magic:[] },
      { id:"ok_bullOgres", name:"Bull Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:2, max:"-", special:"Must charge humans on initiative.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_leadbelchers", name:"Leadbelchers", type:"Infantry", atk:"3/2", hits:"4", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Cannon range 15cm, 2 attacks. -1 armour saves against their shots.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_ironguts", name:"Ironguts", type:"Infantry", atk:"4", hits:"4", armour:"4+", cmd:"-", size:3, pts:140, min:"-", max:2, special:"Elite Ogre warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_yhetees", name:"Yhetees", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:90, min:"-", max:2, special:"+1 Attack when charging in open (like monster). Can only support/be supported by other Yhetees. Must pursue.", upgrades:[], magic:[] },
      { id:"ok_gnoblars", name:"Gnoblars", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:"-", max:4, special:"Shoot 15cm (bows). Cannot be supported by other types. Cannot have magic items. Characters cannot join.", upgrades:[], magic:[] },
      { id:"ok_gorgers", name:"Gorgers", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"-1 Command penalty. Ignore distance modifiers. Can infiltrate. Can pursue any type.", upgrades:[], magic:[] },
      { id:"ok_rhinoxRiders", name:"Rhinox Riders", type:"Cavalry", atk:"5", hits:"4", armour:"5+", cmd:"-", size:3, pts:200, min:"-", max:1, special:"Devastating heavy cavalry. Causes terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_sabretusks", name:"Sabretusks", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:1, special:"Fast hunting cats.", upgrades:[], magic:[] },
      { id:"ok_slaveGiant", name:"Slave Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"ok_scrapLauncher", name:"Scrap Launcher", type:"Artillery", atk:"1/3", hits:"3", armour:"0", cmd:"-", size:1, pts:75, min:"-", max:1, special:"Stone Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  albion: {
    name:"Albion", color:"#507030", bg:"#030502", accent:"#80b040",
    lore:"Mist-shrouded isle of fierce barbarian chieftains, druids, giants and great wolfhounds.",
    armyRules:[{name:"Ogres", desc:"If an Ogre unit can use initiative to charge an enemy human unit within 20cm at start of Command phase, it must do so automatically. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Giant", desc:"Must be given separate orders; cannot brigade with other troops. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}, {name:"Fenbeast", desc:"Cannot be deployed normally. A Druid may summon Fenbeasts using the Summon Fenbeast spell. Fenbeasts can only be ordered by Druids and cannot brigade with any other unit type. The army cannot have more Fenbeasts on the table at any time than it has Druids. Fenbeasts are not counted towards break point or victory points."}],
        spells:[{name:"Downpour", cast:"4+", range:"30cm", desc:"Until the start of the Druid player's next turn, all enemy units within 30cm of the casting Druid suffer -1 to their Command."}, {name:"Storm of Hail", cast:"5+", range:"30cm", desc:"Targets a single visible enemy unit within range. Counts as 3 shooting attacks ignoring any armour save. The target can be driven back as for shooting."}, {name:"Mists of Albion", cast:"5+", range:"30cm", desc:"Cast on a single unengaged friendly Infantry unit within range (no LoS needed). Lasts until start of caster's next turn or until the target moves. The target counts as Defended even in open terrain."}, {name:"Summon Fenbeast", cast:"6+", range:"30cm", desc:"Summons a Fenbeast under the casting Druid's control. Cannot have more Fenbeasts on table than Druids. Fenbeasts may only be ordered by Druids, cannot brigade, have no points value and do not count for breakpoint or victory points."}],
    playstyle:"A classic barbarian army of chariots, cavalry and monster support. Wolfhounds are cheap and fast. Chariots are required minimums and form the offensive core. Giants add shock value. Simple, direct, effective.",
    fluff:"Lost in the mists of the northern ocean lies Albion \u2014 a wild, rain-soaked isle of standing stones, ancient power and fierce tribal warriors. The natives paint themselves for war and hurl themselves at invaders from chariots and horseback with savage ferocity. Giant wolfhounds the size of ponies run at their sides. Albion may seem barbaric \u2014 but it has never been conquered.",
    traits:["Chariots as core", "Massive wolfhound packs", "Giants available", "Druid magic"],
    strengths:"Strong chariots, cheap wolfhounds, giant support",
    weaknesses:"Limited range and shooting options",
    generalCmd:9,
    units:[
      { id:"al_general", name:"Chieftain General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"al_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"al_druid", name:"Druid", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"al_giantEagle_mount", name:"Giant Eagle Mount", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"General/Hero/Druid may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"al_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Druid may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"al_warriors", name:"Warriors", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core Albion warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_slingers", name:"Slingers", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:1, max:6, special:"Shoot 15cm.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_ogres", name:"Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:"-", max:2, special:"Must charge humans on initiative.", upgrades:[], magic:[] },
      { id:"al_wolfhounds", name:"Wolfhounds", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:6, special:"Fast war hounds.", upgrades:[], magic:[] },
      { id:"al_cavalry", name:"Cavalry", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:4, special:"Albion horse cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_chariots", name:"Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:1, max:4, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"al_giantEagles", name:"Giant Eagles", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Flies.", upgrades:[], magic:[] },
      { id:"al_fenbeast", name:"Fenbeast", type:"Monster", atk:"6", hits:"4", armour:"5+", cmd:"-", size:1, pts:"-", min:"-", max:1, special:"Special individual unit. Cannot be fielded normally — see special rules.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  goblin_army: {
    name:"Goblin Army", color:"#1a6010", bg:"#010400", accent:"#50b020",
    lore:"A vast all-goblin horde of wolf riders, night goblins, pump wagons and lumbering giants.",
    armyRules:[{name:"Goblins", desc:"A Goblin unit can shoot as if it had bows at 15cm range. Up to two units per 1000pts can be replaced by Squig Herd while still counting for the Goblin min/max value."}, {name:"Trolls", desc:"Distance Command penalties to Trolls are always doubled (40cm = -2, 60cm = -4). Trolls regenerate: in each combat round after whole stands are removed, Trolls automatically regenerate one outstanding hit. Regenerated hits still count towards the combat result."}, {name:"Wolf Riders", desc:"15cm shooting range with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Pump Wagon", desc:"Does not move by initiative or orders. Instead it always moves once automatically up to 1D6x10cm during the Command phase (no Command roll required). This can happen at any time during the Command phase but cannot interrupt orders or other movements. In the combat round it charges/pursues/advances, a Pump Wagon receives D6 Attacks in addition to normal extra charge attacks."}, {name:"Giants", desc:"Must be given separate orders; cannot brigade. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}],
        spells:[{name:"Mork Save Uz!", cast:"5+", range:"30cm", desc:"Cast on any friendly unit within 30cm. The unit gains a 5+ save (worked out normally) until the beginning of their next turn. If the unit already has a saving roll, choose which to use — may not take both."}, {name:"Gerroff!!!", cast:"5+", range:"60cm", desc:"Cast on any unengaged enemy unit within range (no LoS needed). The enemy unit is driven back 1D6×5cm towards its own table edge. Cannot be routed by this drive back."}, {name:"Brain Busta", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Treated as 3 shooting attacks but armour has no effect. Can cause drive back as normal shooting."}, {name:"Waaagh!", cast:"4+", range:"30cm", desc:"Cast on a friendly unit of Goblins (including Squig Herds, Wolf Riders, Wolf Chariots, Pump Wagons — not Trolls, Giants, or non-greenskins) engaged in combat (no LoS needed). Every stand gains +1 Attack for the following Combat phase."}],
    playstyle:"Masses of cheap goblins backed by hard-hitting Trolls and chaotic Pump Wagons. Win by sheer volume and troll-fuelled brawls in the middle. Pump Wagons are hilarious and occasionally devastating.",
    fluff:"When left entirely to their own devices \u2014 without even Orcs to boss them about \u2014 Goblins organise. Sort of. A Goblin Warboss of sufficient cunning can marshal Wolf Rider hordes, Night Goblin mobs clutching their beloved Squigs, lumbering Trolls and the utterly unpredictable Pump Wagons into a force perfectly capable of burying an enemy in sheer green numbers.",
    traits:["All-goblin force", "Pump Wagons auto-move", "Trolls regenerate", "Low command values"],
    strengths:"Very cheap troops, trolls, unpredictable pump wagons",
    weaknesses:"Low stats, low command values",
    generalCmd:8,
    units:[
      { id:"ga_general", name:"Goblin Warboss", type:"General", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ga_hero", name:"Goblin Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:4, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ga_shaman", name:"Goblin Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:2, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ga_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"Warboss/Hero/Shaman may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"ga_wyvern", name:"Wyvern", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Warboss/Hero/Shaman may ride. Flies (move 100cm). Unit causes terror.", upgrades:[], magic:[] },
      { id:"ga_goblins", name:"Goblins", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:4, max:"-", special:"Shoot 15cm. Up to 2 per 1000pts replaced by Squig Herds.", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_squigHerd", name:"Squig Herd", type:"Infantry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:"-", max:"-", special:"Counts toward Goblin min/max (max 2 per 1000pts).", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_trolls", name:"Trolls", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:4, special:"Regenerate 1 hit per combat round. Command penalty for distance doubled.", upgrades:[], magic:[] },
      { id:"ga_wolfRiders", name:"Wolf Riders", type:"Cavalry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_wolfChariots", name:"Wolf Chariots", type:"Chariot", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:80, min:"-", max:4, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_pumpWagon", name:"Pump Wagon", type:"Chariot", atk:"D6", hits:"3", armour:"5+", cmd:"-", size:1, pts:50, min:"-", max:2, special:"Auto-moves 1D6×10cm (no order needed). D6 attacks when charging/pursuing. Cannot brigade. Cannot be driven back. No VPs if destroyed.", upgrades:[], magic:[] },
      { id:"ga_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"ga_doomDiver", name:"Doom Diver", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:80, min:"-", max:1, special:"Stone Thrower.", upgrades:[], magic:[] },
      { id:"ga_spearChukka", name:"Spear Chukka", type:"Artillery", atk:"1/2+skewer", hits:"2", armour:"0", cmd:"-", size:2, pts:65, min:"-", max:2, special:"Bolt Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  witch_hunters: {
    name:"Witch Hunters", color:"#505050", bg:"#030303", accent:"#909090",
    lore:"Fanatical warriors of righteousness hunting Chaos and Undead with purging fire and righteous steel.",
    armyRules:[{name:"Chaos and Undead Definitions (Army Rule)", desc:"'Chaos' means Chaos, Daemons, Beastmen, Chaos Dwarf and Skaven armies. 'Undead' means Tomb Kings and Vampire Counts armies (including Ghouls). These definitions apply to all special rules that reference 'Chaos or Undead'."}, {name:"Zealots", desc:"Gain +1 Attack in the first round of combat against Undead or Chaos (regardless of who charged). Always use initiative to charge Undead or Chaos enemies if possible. Must pursue or advance if victorious against Undead or Chaos."}, {name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun (3+ = 4+, 4+ = 5+, 5+ = 6+, 6+ = no save)."}, {name:"Flagellants", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Warhounds", desc:"Warhound stands are not deployed independently. Any infantry unit may add one Warhound stand, making the unit 4 stands total. Warhounds share the unit Armour, fight as part of the unit and can be removed as a casualty. Warhound casualties never count for Command penalties and they never cause Irregular Formation."}, {name:"Pistoliers", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}],
        spells:[{name:"Sanctuary", cast:"5+", range:"N/A", desc:"The Warrior Priest must be with the unit. The unit counts as Defended (even in open); if already Defended it counts as Fortified — including Cavalry. Effect lasts until the unit moves, the Priest leaves it, or he casts another spell."}, {name:"Doctrine of Sigmar", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade. The unit moves as if it had received an order. Characters that have joined do not move."}, {name:"Holy Fervour", cast:"4+", range:"N/A", desc:"The Warrior Priest must be with the unit. Each stand in the unit, including character stands, gains +1 Attack during the following Combat phase."}, {name:"Divine Curse", cast:"4+", range:"30cm", desc:"Cast on any enemy unit within range (no LoS needed). Lasts until end of opposing player's following turn. The unit moves at half pace. Counts all enemies as terrifying (-1 Attack penalty) even if normally immune — unless the target is Undead or Daemon."}],
    playstyle:"A specialised Empire variant optimised against Chaos and Undead opponents. Zealots charge those enemies for free and fight with bonus attacks. Stack Handgunners for armour-piercing fire. Best against specific matchups.",
    fluff:"In a world riven by Chaos corruption and undead horror, the Witch Hunters stand as humanity's last line of sanity. Armed with pistols, torches and unshakeable faith, they lead armies of fanatic Zealots who gain supernatural courage when facing Chaos or the Undead \u2014 fighting beings that would break ordinary soldiers with righteous fury instead of fear.",
    traits:["Zealots bonus vs Chaos/Undead", "Heavy on Handgunners", "Warrior Priest spells", "Righteous fury theme"],
    strengths:"Zealot bonuses vs Chaos/Undead, lots of handguns",
    weaknesses:"Mediocre against non-Chaos/Undead opponents",
    generalCmd:9,
    units:[
      { id:"wh_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"wh_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"wh_warriorPriest", name:"Warrior Priest", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:55, min:"-", max:1, special:"Command range 60cm. Casts spells. Spells affect Chaos and Undead.", upgrades:[], magic:["weapons","devices"] },
      { id:"wh_zealots", name:"Zealots", type:"Infantry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:35, min:3, max:"-", special:"+1 Attack in first round vs Chaos/Undead. Always charge Chaos/Undead on initiative. Must pursue Chaos/Undead.", upgrades:[], magic:["standards","weapons"] },
      { id:"wh_halberdiers", name:"Halberdiers", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:"-", max:4, special:"Standard infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"wh_crossbowmen", name:"Crossbowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:2, special:"Standard crossbowmen.", upgrades:[], magic:["standards","weapons"] },
      { id:"wh_handgunners", name:"Handgunners", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:"-", max:4, special:"Armour piercing: enemy armour one worse.", upgrades:[], magic:["standards","weapons"] },
      { id:"wh_flagellants", name:"Flagellants", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:4, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"wh_warhounds", name:"Warhounds", type:"Infantry", atk:"3", hits:"3", armour:"0 or 6+", cmd:"-", size:"+1", pts:20, min:"-", max:"-", special:"Attached to any infantry as extra stand. Unit can pursue cavalry/chariots.", upgrades:[], magic:[] },
      { id:"wh_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Standard heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"wh_pistoliers", name:"Pistoliers", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:1, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:[] },
      { id:"wh_cannon", name:"Cannon", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"0", cmd:"-", size:2, pts:85, min:"-", max:1, special:"Bouncing cannonball.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  chaos_dwarfs: {
    name:"Chaos Dwarfs", color:"#803010", bg:"#050100", accent:"#c04010",
    lore:"Cruel subjugators of Zharr-Naggrund, commanding enslaved Orcs and Hobgoblins, riding monstrous flying beasts.",
    armyRules:[{name:"Blunderbusses", desc:"15cm shooting range, 2 shooting attacks. Hits impose -1 penalty to armour rolls. One unit per 1000pts can replace a Warrior unit while still counting for Warriors min/max value."}, {name:"Hobgoblins", desc:"15cm shooting range with 360 degree vision. Hobgoblins and Hobgoblin Wolf Riders may not brigade with Black Orcs or Orc Slaves unless a unit of Chaos Dwarfs or Blunderbusses is also in the brigade."}, {name:"Orc Slaves", desc:"Suffer an additional -1 Command penalty when ordered. This penalty is waived if brigaded with Black Orcs, Chaos Dwarfs or Blunderbusses."}, {name:"Earthshaker Cannon", desc:"Acts as a Stone Thrower. Drive-back from Earthshaker shots causes Confusion on rolls of 4+ (instead of the normal 6+). Units in base contact with the target unit also risk Confusion on a roll of 6 (roll for each such unit). Cannot fire if enemy is within 30cm."}, {name:"Death Rocket", desc:"Fires a 1D6 Attacks stone-thrower style shot. Area of effect may vary."}, {name:"Sorcerer Lord Upgrade", desc:"One Sorcerer per army can be upgraded to Sorcerer Lord (+25pts, max 1). The Sorcerer Lord gains enhanced spellcasting abilities."}],
        spells:[{name:"Flaming Hand", cast:"4+", range:"N/A", desc:"The Sorcerer must have joined a unit in combat. Automatically makes 3 attacks on one enemy unit touching the Sorcerer's unit. Hits are carried over into the first round of combat."}, {name:"Volcanic Eruption", cast:"6+", range:"30cm", desc:"Each enemy unit within 30cm takes 3 attacks (normal way). Units are not driven back. Engaged units carry over hits into the first round of combat."}, {name:"Word of Fear", cast:"4+", range:"30cm", desc:"Cast on any friendly unit within range (no LoS needed). The unit counts as causing terror for the duration of the Combat phase."}, {name:"Meteor Storm", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Sorcerer in any direction. Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits."}],
    playstyle:"A hybrid of Dwarf toughness and Chaos aggression with slave infantry. The Earthshaker is the best stone thrower available. Great Taurus gives characters terrifying mobility. Mix Chaos Dwarfs and Blunderbusses for a devastating combined arms centre.",
    fluff:"Deep in the Dark Lands, in the shadow of the Tower of Zharr-Naggrund, dwell the Chaos Dwarfs \u2014 a civilisation twisted by dark sorcery into cruel, hat-wearing slavers. They enslave Orcs and Hobgoblins as expendable infantry, ride monstrous fire-breathing Taurus beasts, and build the most devastating siege weapons in the world. Their Sorcerer-Priests literally turn to stone over centuries of dark power.",
    traits:["Best stone thrower in game", "Flying Great Taurus mount", "Enslaved orc soldiers", "Lammasu anti-magic"],
    strengths:"Earthshaker cannon, tough core infantry, flying characters",
    weaknesses:"Slave troops have limitations; expensive core",
    generalCmd:9,
    units:[
      { id:"cd_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. May upgrade to Sorcerer Lord (+25pts): can cast spells, +1 to one spell per battle.", upgrades:[], magic:["devices"] },
      { id:"cd_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"cd_sorcerer", name:"Sorcerer", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"cd_greatTaurus", name:"Great Taurus", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Any character may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"cd_lammasu", name:"Lammasu", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:35, min:"-", max:1, special:"Sorcerer only. Flies (move 100cm). Once per turn: dispel one hostile spell within 30cm on 4+.", upgrades:[], magic:[] },
      { id:"cd_chaosDwarfs", name:"Chaos Dwarfs", type:"Infantry", atk:"3", hits:"4", armour:"4+", cmd:"-", size:3, pts:110, min:2, max:4, special:"Core Chaos Dwarf infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_blunderbusses", name:"Blunderbusses", type:"Infantry", atk:"3/2", hits:"4", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Range 15cm, 2 attacks. -1 to enemy armour saves. Up to 1 per 1000pts replaces Chaos Dwarf unit.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_hobgoblins", name:"Hobgoblins", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:45, min:"-", max:"-", special:"Shoot 15cm. Cannot brigade with Black Orcs/Orc Slaves unless Chaos Dwarfs present.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_blackOrcs", name:"Black Orcs", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Elite orc slaves.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_orcSlaves", name:"Orc Slaves", type:"Infantry", atk:"4", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:2, special:"-1 Command penalty (waived if brigaded with Black Orcs/Chaos Dwarfs/Blunderbusses).", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_hobgoblinWolfRiders", name:"Hobgoblin Wolf Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:"-", special:"Shoot 15cm. Cannot brigade with Black Orcs/Orc Slaves unless Chaos Dwarfs present.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_bullCentaurs", name:"Bull Centaurs", type:"Cavalry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:140, min:"-", max:2, special:"Powerful cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_earthshaker", name:"Earthshaker Cannon", type:"Artillery", atk:"1/3", hits:"3", armour:"6+", cmd:"-", size:1, pts:90, min:"-", max:1, special:"Stone Thrower. Drive-backs cause Confusion on 4+. Adjacent units confused on 6. Max 1 Earthshaker+Death Rocket per 1000pts.", upgrades:[], magic:[] },
      { id:"cd_deathRocket", name:"Death Rocket", type:"Artillery", atk:"1/1D6", hits:"2", armour:"6+", cmd:"-", size:1, pts:60, min:"-", max:1, special:"D6 attacks per shot. Max 1 Earthshaker+Death Rocket per 1000pts.", upgrades:[], magic:[] },
      { id:"cd_boltThrower", name:"Bolt Thrower", type:"Artillery", atk:"1/2+skewer", hits:"2", armour:"0", cmd:"-", size:2, pts:65, min:"-", max:1, special:"Bolt Thrower with skewer rule.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  wood_elves: {
    name:"Wood Elves", color:"#2a6020", bg:"#020501", accent:"#40a030",
    lore:"Guardians of the enchanted forest of Loren, masters of ambush and the bow, aided by the forest's living denizens.",
    armyRules:[{name:"Woodland Folk (Army Rule)", desc:"All Wood Elf infantry does not suffer the usual -1 Command penalty when within woodland."}, {name:"Glade Guard", desc:"Add +1 to shooting dice rolls (hit on 3+ in open, 4+ defended, 5+ fortified)."}, {name:"Wardancers", desc:"Not deployed independently. Any Glade Guard or Eternal Guard unit may add one Wardancer stand (making 4 stands total). Wardancers share the unit Armour, fight as part of the unit and can be removed as a casualty. Their casualties never count for Command penalties and they never cause Irregular Formation."}, {name:"Waywatchers", desc:"Add +1 to shooting dice rolls AND resolve attacks at -1 to enemy Armour value. May also infiltrate: issue an infiltration order to a point in dense terrain or any table edge except the enemy's. On success the unit appears there."}, {name:"Dryads, Treekin, Wild Riders, Treeman", desc:"Wood Elf nature spirits. These units do not suffer the -1 Command penalty in dense terrain. Treeman with 4-5 hits while not engaged becomes Badly Hurt — Hits and Attacks halved. The Treeman Ancient and Branchwraith are Hero characters, not Wizard or General types."}],
        spells:[{name:"Tree Singing", cast:"5+", range:"30cm", desc:"Cast on a single unengaged friendly Infantry unit within range (no LoS needed). Lasts until start of caster's next turn or until target moves. The target Infantry unit counts as Defended even in open terrain."}, {name:"Twilight Host", cast:"5+", range:"30cm", desc:"Target unit causes terror until the Wood Elf's next magic phase."}, {name:"Call of the Hunt", cast:"5+", range:"30cm", desc:"Cast on an unengaged friendly unit within range (no LoS needed). The unit may make a charge move into contact with the nearest visible enemy. Enemy may not shoot at the chargers."}, {name:"Fury of the Forest", cast:"6+", range:"60cm", desc:"Makes 3 shooting attacks on all enemy units within 10cm of a chosen wooded terrain piece. Units get no armour save if within the wooded terrain. Unengaged units are not driven back. Engaged units carry over hits."}],
    playstyle:"Masters of terrain. Woodland Folk units suffer no command penalty in dense terrain \u2014 turn forests into fortresses. Waywatchers infiltrate and pick off weak units. Treemen anchor your line.",
    fluff:"Within the enchanted forest of Athel Loren dwell the Wood Elves \u2014 ancient guardians grown as much a part of the forest as the trees themselves. They do not conquer; they protect. Those who threaten the forest meet ghostly Waywatchers materialising from nowhere, Glade Guard arrows darkening the sky, and eventually the slow inevitable advance of living Treemen who have seen ten thousand years pass.",
    traits:["Woodland Folk \u2014 dense terrain bonus", "Waywatcher ambush", "Treemen monsters", "Forest Dragon"],
    strengths:"Dense terrain mastery, infiltrating Waywatchers, solid all-round",
    weaknesses:"Weaker in open terrain; limited heavy hitting outside Treeman",
    generalCmd:10,
    units:[
      { id:"we_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:10, size:1, pts:155, min:1, max:1, special:"Command range covers entire battlefield. Woodland Folk: no -1 Command penalty in woodland.", upgrades:[], magic:["devices"] },
      { id:"we_noble", name:"Noble", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"we_treemanAncient", name:"Treeman Ancient", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:130, min:"-", max:1, special:"Command range 60cm. Special tree rules.", upgrades:[], magic:["weapons","devices"] },
      { id:"we_branchwraith", name:"Branchwraith", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Forest spirit.", upgrades:[], magic:["weapons","devices"] },
      { id:"we_spellWeaver", name:"Spell Weaver", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"we_giantStag", name:"Giant Stag", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Noble may ride. +1 Attack. Move 30cm (not 60cm).", upgrades:[], magic:[] },
      { id:"we_unicorn", name:"Unicorn", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Noble may ride. +1 Attack. Once per battle: +1 to spell roll.", upgrades:[], magic:[] },
      { id:"we_warhawk_mount", name:"Warhawk Mount", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Noble may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"we_forestDragon", name:"Forest Dragon", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"General/Noble may ride. Flies (move 100cm). Causes terror. Breath attack.", upgrades:[], magic:[] },
      { id:"we_gladeGuard", name:"Glade Guard", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:2, max:4, special:"+1 to shooting dice rolls. Wardancer stands may be added.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_eternalGuard", name:"Eternal Guard", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:"-", max:3, special:"Woodland Folk. Wardancer stands may be added.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_wardancers", name:"Wardancers", type:"Infantry", atk:"4", hits:"3", armour:"0 or 5+", cmd:"-", size:"+1", pts:30, min:"-", max:4, special:"Attached to Glade Guard or Eternal Guard as extra stand.", upgrades:[], magic:[] },
      { id:"we_waywatchers", name:"Waywatchers", type:"Infantry", atk:"1/2", hits:"3", armour:"0", cmd:"-", size:2, pts:60, min:"-", max:1, special:"+1 to shooting, -1 enemy armour vs shots. Can infiltrate (ambush). 2-stand unit.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_dryads", name:"Dryads", type:"Infantry", atk:"4", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:1, max:"-", special:"Forest spirits. Woodland Folk.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_treekin", name:"Treekin", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Forest spirits. Woodland Folk.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_gladeRiders", name:"Glade Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:3, special:"Light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_wildRiders", name:"Wild Riders", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Woodland Folk.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_warhawkRiders", name:"Warhawk Riders", type:"Monster", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flies.", upgrades:[], magic:[] },
      { id:"we_treeman", name:"Treeman", type:"Monster", atk:"6", hits:"4", armour:"4+", cmd:"-", size:1, pts:130, min:"-", max:1, special:"Woodland Folk. Causes terror.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  beastmen: {
    name:"Beastmen", color:"#6b4010", bg:"#040200", accent:"#a06020",
    lore:"Savage half-beasts of the forest, devoted to Chaos, ambushing from the dark woods.",
    armyRules:[{name:"The Things in the Woods (Army Rule)", desc:"Beastmen infantry do not suffer the usual -1 Command penalty when within woodland."}, {name:"Gor and Ungor Ambushers", desc:"Up to half the Gor units (rounded down) and half the Ungor units (rounded down) may be designated Ambushers. Ambushers are deployed during any Command phase rather than at the start. Issue an Ambush order to a point in dense terrain or on any table edge except the enemy's (ignoring Command range limits but applying distance and enemy proximity penalties). On success, place one stand at the point and deploy the rest in formation around it. The Ambush order counts as their first order. Ungor have 15cm shooting range."}, {name:"Minotaurs (Bloodlust)", desc:"Minotaurs always use initiative to charge if possible and cannot be given orders instead. Never use initiative to evade. Must pursue or advance if victorious. Bloodlust: when they charge and the unit they are charging is destroyed before combat is resolved (by other charging units), Minotaurs move towards the nearest enemy unit."}, {name:"Chaos Spawn", desc:"Spawn have -1 Command penalty unless in a brigade with more non-Spawn than Spawn units. Up to two Spawn per brigade without counting towards brigade maximum. Cause terror in combat. Cannot be driven back by shooting. Must pursue or advance if victorious. 15cm shooting range and 360 degree vision."}, {name:"Dragon Ogres", desc:"Dragon Ogres are immune to terror."}],
        spells:[{name:"Traitor Kin", cast:"4+", range:"30cm", desc:"Cast on any enemy Cavalry, Chariot or Monster unit within range (no LoS needed). Lasts until end of opposing player's next turn. The unit cannot use initiative. Orders to the unit or its brigade suffer -1 Command penalty."}, {name:"Hunting for Gore!", cast:"5+", range:"30cm", desc:"Cast on an unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade. The unit moves as if it had received an order. Characters that have joined do not move."}, {name:"Chaos Bolt", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Treated as 3 shooting attacks but armour has no effect. Can cause drive back as normal shooting."}, {name:"Power of Herd", cast:"6+", range:"30cm", desc:"Cast on all Gor, Ungor and Centigor units engaged in combat within range (no LoS needed). Each affected unit receives +1 Attack per stand (including characters) for the duration of its first following combat engagement."}],
    playstyle:"Ambush is everything. Up to half your core infantry can deploy using ambush rules. Push into dense terrain. Minotaurs always charge and cannot be driven back \u2014 use them as shock hammers.",
    fluff:"Deep in the forests of the Old World dwell creatures neither man nor beast but something horrible in between. The Beastmen descend from settlements at night, driven by dark devotion to Chaos and primal hatred of civilisation. Led by towering Doombulls and cunning Bray Shamans, they are at their most dangerous in forest depths where ambush is everything and civilised tactics count for nothing.",
    traits:["Woodland Folk", "Ambush up to half core infantry", "Minotaur frenzy", "Chaos Spawn surprise"],
    strengths:"Ambush deployment, Woodland Folk, Minotaur hammers",
    weaknesses:"Weaker in open terrain; minotaurs cannot evade",
    generalCmd:9,
    units:[
      { id:"bm_beastlord", name:"Beastlord", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Woodland Folk.", upgrades:[], magic:["devices"] },
      { id:"bm_doombull", name:"Doombull", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:6, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Powerful minotaur hero.", upgrades:[], magic:["weapons","devices"] },
      { id:"bm_wargor", name:"Wargor", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"bm_brayShaman", name:"Bray Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"bm_tuskgorChariot", name:"Tuskgor Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"Beastlord/Wargor/Shaman may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"bm_gor", name:"Gor", type:"Infantry", atk:"4", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Woodland Folk. Up to half total Gor/Ungor may ambush.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_ungor", name:"Ungor", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Woodland Folk. Shoot 15cm. Up to half total Gor/Ungor may ambush.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_bestigors", name:"Bestigors", type:"Infantry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:75, min:"-", max:2, special:"Woodland Folk. Elite beastmen.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_minotaurs", name:"Minotaurs", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:80, min:"-", max:2, special:"Bloodlust: always charge on initiative, immune to terror, cannot be driven back, must pursue.", upgrades:[], magic:[] },
      { id:"bm_centigors", name:"Centigors", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:2, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_chaosHounds", name:"Chaos Hounds", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:6, special:"Fast war hounds.", upgrades:[], magic:[] },
      { id:"bm_tuskgorChariots", name:"Tuskgor Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:4, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_dragonOgres", name:"Dragon Ogres", type:"Monster", atk:"6", hits:"4", armour:"5+", cmd:"-", size:3, pts:230, min:"-", max:1, special:"Immune to terror.", upgrades:[], magic:[] },
      { id:"bm_chaosSpawn", name:"Chaos Spawn", type:"Monster", atk:"3/3", hits:"4", armour:"3+", cmd:"-", size:1, pts:110, min:"-", max:2, special:"Causes terror. Cannot be driven back. Must pursue. Shoot 15cm 360°.", upgrades:[], magic:[] },
      { id:"bm_shaggoth", name:"Dragon Ogre Shaggoth", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:160, min:"-", max:1, special:"Causes terror. Massive beast.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  norse: {
    name:"Norse", color:"#406080", bg:"#010305", accent:"#6090c0",
    lore:"Fearless raiders from the frozen north, with berserkers, mammoths and the Valkyries of the gods.",
    armyRules:[{name:"Berserkers", desc:"Always use initiative to charge an enemy if possible; cannot be given orders instead. Never evade. Cannot be driven back by shooting and do not roll for drive backs. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Ulfwerener", desc:"Based facing the short edge like cavalry. Receive +1 Attack when charging in the open (like monsters and chariots). Can pursue cavalry and chariots. Cannot support or be supported. Cannot take magic items. Only characters with the Were Kin upgrade may join them."}, {name:"Storm Giant", desc:"Must be given separate orders; cannot brigade. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}, {name:"War Mammoth", desc:"Uses a 40x60mm base. Causes terror. Can attack troops on ramparts with its trunk (like a Giant) or batter wall sections. If it would become Confused it Stampedes instead — moving automatically each turn until the end of its own Command phase. Uses special Stampede movement rules."}],
        spells:[{name:"Aspect of Wulfen", cast:"4+", range:"30cm", desc:"Cast on any friendly unit within range (no LoS needed). The unit counts as causing terror for the duration of the Combat phase."}, {name:"Thunder of Fo'Wor", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Shaman in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits."}, {name:"Eye of the Raven", cast:"5+", range:"N/A", desc:"The Norse player may re-roll a single D6 at any time during the rest of his turn, through the opponent's turn, or in his following turn (until end of next Command phase). Cannot be used on blunder Command rolls, but can re-roll the blunder chart result."}, {name:"Spite of Low'Key", cast:"5+", range:"30cm",
        desc:"The Shaman curses the enemy with bad luck and failure. Cast on any enemy unit within range regardless of visibility. Until the end of the opposing player's next turn, the unit must re-roll one successful dice result of the owning player's choice each phase — the first successful roll of 5+ must be re-rolled."}],
    playstyle:"An aggressive hard-hitting infantry army with monster support. Huscarls are excellent heavy infantry. Berserkers always charge and cannot evade. The War Mammoth is devastating in open battles and can batter fortress walls.",
    fluff:"In the frozen seas north of the Empire, Viking warriors launch their longships toward warmer shores. The Norse are fearless raiders who worship gods of war, storm and death. Their Berserkers fight in a trance-like fury; and when they march overland, War Mammoths break walls and trample armies flat. They come for glory, for plunder, and for the joy of battle.",
    traits:["Huscarls elite infantry", "Berserkers frenzy", "War Mammoth siege capability", "Valkyries fly"],
    strengths:"Strong infantry, War Mammoth destroys fortifications",
    weaknesses:"Berserkers are unpredictable; limited shooting",
    generalCmd:9,
    units:[
      { id:"nr_jarl", name:"Jarl", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"nr_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"nr_shaman", name:"Shaman", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"nr_wereKin", name:"Were Kin", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:40, min:"-", max:1, special:"General/Hero may take Were Kin upgrade. +1 Command. Can join Ulfwerener units.", upgrades:[], magic:[] },
      { id:"nr_hornOfResounding", name:"Horn of Resounding", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"Jarl/Hero may ride. +1 Attack. Special morale horn effect.", upgrades:[], magic:[] },
      { id:"nr_bondsmen", name:"Bondsmen", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core Norse warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_huscarls", name:"Huscarls", type:"Infantry", atk:"4", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:1, max:4, special:"Elite Norse warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_huntsmen", name:"Huntsmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Missile troops.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_berserkers", name:"Berserkers", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_ulfwerener", name:"Ulfwerener", type:"Infantry", atk:"4", hits:"4", armour:"6+", cmd:"-", size:3, pts:115, min:"-", max:1, special:"Based on short edge (like cavalry). +1 Attack charging in open. Can pursue cavalry/chariots. Cannot give/receive support. Only joined by Were Kin characters. No magic items.", upgrades:[], magic:[] },
      { id:"nr_cavalry", name:"Cavalry", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:4, special:"Standard Norse cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_stormGiant", name:"Storm Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"nr_warMammoth", name:"War Mammoth", type:"Monster", atk:"8", hits:"10", armour:"5+", cmd:"-", size:1, pts:180, min:"-", max:1, special:"Causes terror. Can batter fortress walls. Infantry may assault walls via Mammoth. At 6–9 hits: badly hurt, halved.", upgrades:[], magic:[] },
      { id:"nr_valkyries", name:"Valkyries", type:"Monster", atk:"2", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:"-", max:1, special:"Flies. Always charge on initiative. Cannot evade.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  cathay: {
    name:"Cathay", color:"#c01010", bg:"#080000", accent:"#e83030",
    lore:"The disciplined armies of a vast eastern empire, combining advanced weapons with ancient magical traditions.",
    armyRules:[{name:"Structure and Discipline (Army Rule)", desc:"Cathay commanders may issue orders to brigades of up to 6 units (instead of the usual 4). However, the 6-unit brigade must include at least 2 units of Bannermen. The 6-unit brigade cannot include chariots, cavalry or Terracotta Warriors."}, {name:"Handguns", desc:"Any or all Crossbow units can be replaced by Handgun units while still counting for Crossbow min/max. Handgun hits impose -1 penalty to armour rolls."}, {name:"Terracotta Warriors", desc:"Undead: cannot act on initiative; unaffected by terror or enemy within 20cm; cannot be confused. Can only brigade with other Terracotta Warriors and can only give/receive support from other Terracotta Warriors. Can only be ordered by Sorcerers, who gain +1 Command when doing so."}, {name:"Hu Cavalry", desc:"15cm shooting range with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Rocket Launcher", desc:"Treated as a Stone Thrower except it shoots 1D6 times per phase. Hits have -1 armour save modifier (as handguns). If the shot roll comes up a 1, the Rocket Launcher has misfired — roll on the Rocket Launcher Misfire Chart."}, {name:"Celestial Dragon Upgrade", desc:"One Sorcerer per army can be upgraded to a Celestial Dragon (a form of dragon that flies, gives orders, casts spells and causes terror). The Dragon cannot give orders to Terracotta Warriors. Max 1 per army."}],
        spells:[{name:"Glory of Cathay", cast:"4+", range:"30cm", desc:"Cast on a friendly unengaged missile-armed infantry or chariot unit within range (no LoS to target needed). The unit can shoot twice this turn. The second shot is at -1 to hit."}, {name:"Lion Dogs Attack", cast:"4+", range:"30cm", desc:"Cast on any enemy unit within range (no LoS needed). Lasts until end of opposing player's next turn. The unit cannot charge and will not pursue or advance — even if otherwise compelled."}, {name:"Ferocity of Tigers", cast:"5+", range:"30cm", desc:"Cast on a friendly unit engaged in combat (no LoS needed). Lasts for the following Combat phase. Every stand adds +1 to its Attacks. The unit also becomes immune to terror."}, {name:"Tranquility of Heaven", cast:"5+", range:"15cm", desc:"All friendly units within 15cm of the Sorcerer count as immune to terror until end of the enemy player's next turn."}],
    playstyle:"Unique large brigade rule lets you field 6-unit brigades if Bannermen are included. This gives exceptional order efficiency. Terracotta Warriors are Undead \u2014 only ordered by Sorcerers. Celestial Dragon upgrade is a standout choice.",
    fluff:"Far to the east lies Cathay \u2014 a vast empire of rivers and mountains, silk and jade, ruled by the Grand Celestial Emperor. Its armies march in serried ranks of Bannermen and crossbowmen, supported by rocket-hurling war engines. Ancient Terracotta Warriors animated by sorcery guard sacred sites. And above all wheels the Celestial Dragon \u2014 a divine beast and the ultimate expression of Cathayan power.",
    traits:["Large brigade rule (6 units)", "Terracotta Warriors undead", "Rocket Launcher war machine", "Celestial Dragon wizard-mount"],
    strengths:"Unique large brigade rule, Celestial Dragon, varied war machines",
    weaknesses:"Terracotta Warriors limited to Sorcerer orders only",
    generalCmd:9,
    units:[
      { id:"ca_general", name:"General", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Brigades of up to 6 units allowed if ≥2 Bannermen included (no cavalry/chariots/Terracotta Warriors).", upgrades:[], magic:["devices"] },
      { id:"ca_hero", name:"Hero", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ca_sorcerer", name:"Sorcerer", type:"Wizard", atk:"-", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells. +1 Command when ordering Terracotta Warriors.", upgrades:[], magic:["weapons","devices"] },
      { id:"ca_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"ca_celestialDragon", name:"Celestial Dragon", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"One Sorcerer only may upgrade to Celestial Dragon: becomes dragon, flies, casts spells, causes terror. Cannot order Terracotta Warriors.", upgrades:[], magic:[] },
      { id:"ca_tiger", name:"Tiger Mount", type:"Special Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"General/Hero only (not Sorcerers). +2 Attacks. Move 30cm.", upgrades:[], magic:[] },
      { id:"ca_qilin", name:"Qilin", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"Sorcerer only. +1 Attack. Once per battle: +1 to spell casting roll.", upgrades:[], magic:[] },
      { id:"ca_bannermen", name:"Bannermen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:50, min:3, max:"-", special:"Core infantry. Required for large brigades.", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_crossbows", name:"Crossbows", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:1, max:"-", special:"Can be replaced by Handguns (same min/max count).", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_handguns", name:"Handguns", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:50, min:"-", max:"-", special:"Armour piercing: -1 to enemy armour saves.", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_terracottaWarriors", name:"Terracotta Warriors", type:"Infantry", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:30, min:"-", max:6, special:"Undead. No initiative. Immune to terror/confusion. Only ordered by Sorcerers (+1 Command). Can only brigade/support with each other.", upgrades:[], magic:[] },
      { id:"ca_maneaters", name:"Maneaters", type:"Infantry", atk:"4", hits:"4", armour:"4+", cmd:"-", size:3, pts:140, min:"-", max:1, special:"Mercenary Ogres.", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_chariots", name:"Chariots", type:"Chariot", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_imperialCavalry", name:"Imperial Cavalry", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Standard heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_huCavalry", name:"Hu Cavalry", type:"Cavalry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:3, special:"Shoot 15cm, 360° vision. Light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ca_rocketLauncher", name:"Rocket Launcher", type:"Artillery", atk:"1/1D6", hits:"2", armour:"0", cmd:"-", size:1, pts:55, min:"-", max:1, special:"Stone Thrower. D6 shots per phase. -1 to armour saves. On roll of 1: misfire.", upgrades:[], magic:[] },
      { id:"ca_tripleBows", name:"Triple Bows", type:"Artillery", atk:"1/2+skewer", hits:"2", armour:"0", cmd:"-", size:2, pts:65, min:"-", max:1, special:"Bolt Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  nippon: {
    name:"Nippon", color:"#c01818", bg:"#080000", accent:"#ff4040",
    lore:"Stoic samurai warriors from the eastern islands, bolstered by bound spirit creatures from their temple shrines.",
    armyRules:[{name:"Honour and Duty (Army Rule)", desc:"A Nippon army adds 1 to the number of units that must be lost before the army will withdraw. For example an army of 16 units will normally withdraw once 8 are destroyed — with this rule, it will not withdraw until 9 are destroyed."}, {name:"Ashigaru Tepo (Handguns)", desc:"Ashigaru Tepo use black powder handguns. Units hit by Ashigaru Tepo suffer -1 penalty to their armour rolls (armour piercing)."}, {name:"Bushido (Samurai)", desc:"Samurai live by a strict code of honour. They cannot use initiative to evade and roll 1 fewer die for drive backs."}, {name:"Mikata", desc:"Mikata always use initiative to charge if possible; cannot be given orders instead. Never evade. Cannot be driven back by shooting and do not roll for drive backs. Must pursue or advance if victorious. Unaffected by terror — no -1 Attack modifier."}, {name:"Ninja", desc:"15cm shooting range with 360 degree vision. May infiltrate: issue an infiltration order to a point in dense terrain or on any table edge except the enemy's (Command range extends over entire table for infiltration). On success the unit appears there."}, {name:"Shugenja", desc:"If an enemy Wizard within 50cm casts a spell, the Shugenja can attempt to dispel it on a D6 roll of 4+. Only one attempt per spell. Also adds +1 to Daemonic Instability table rolls for friendly Daemon units within 20cm. Shugenjas may take a Dispel Scroll."}],
        spells:[{name:"Spirit Ward", cast:"4+", range:"30cm", desc:"Cast on a friendly unit within range (no LoS needed). The unit gains a 5+ Ward save against all attacks until the beginning of their next turn. If the unit already has a save, choose which to use."}, {name:"Kami Strike", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Treated as 3 shooting attacks but armour has no effect. Can cause drive back as normal shooting."}, {name:"Divine Wind", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Shugenja in any direction. Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits."}, {name:"Honour of Ancestors", cast:"4+", range:"N/A", desc:"The Shugenja must have joined a unit in combat. Every stand in the unit, including characters, adds +1 to its Attacks for the duration of the following Combat phase."}],
    playstyle:"A disciplined army that fights with stubborn honour. Samurai and Samurai Cavalry cannot evade \u2014 position them carefully. The Honour and Duty rule means you need one more unit lost before withdrawal. Ninja infiltrators threaten artillery.",
    fluff:"On islands far to the east lies a land of rigid honour, meticulous ceremony and devastating martial tradition. The samurai warriors of Nippon have perfected the art of war over centuries of civil conflict. They march in disciplined formations behind silk banners, their blades among the finest in the world. Alongside them march bound spirit creatures \u2014 Tengu bird-men, Komainu lion-dogs \u2014 called forth by Shugenja priests.",
    traits:["Bushido \u2014 Samurai cannot evade", "Honour and Duty \u2014 harder to break", "Shrine summons spirits", "Ninja infiltrators"],
    strengths:"Stubborn, hard to break, Ninja disruption",
    weaknesses:"Samurai cannot evade \u2014 positioning is critical",
    generalCmd:9,
    units:[
      { id:"ni_shogun", name:"Shogun", type:"General", atk:"-", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Honour and Duty: army needs 1 extra unit lost before withdrawal.", upgrades:[], magic:["devices"] },
      { id:"ni_daimyo", name:"Daimyo", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ni_shugenja", name:"Shugenja", type:"Hero", atk:"-", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells (spirit magic).", upgrades:[], magic:["weapons","devices"] },
      { id:"ni_tatsu", name:"Tatsu (Dragon)", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Shogun/Daimyo/Shugenja may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"ni_shrine", name:"Shrine", type:"Special", atk:"-", hits:"-", armour:"-", cmd:"-", size:1, pts:50, min:1, max:1, special:"Special army bonus. Bound to Shugenja. Required to summon spirit creatures.", upgrades:[], magic:[] },
      { id:"ni_ashigaru", name:"Ashigaru", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:1, max:"-", special:"Core spearmen.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_ashigaruBowmen", name:"Ashigaru Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Standard archers.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_ashigaruTeppo", name:"Ashigaru Teppo", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:"-", max:2, special:"Armour piercing: -1 to enemy armour saves.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_samurai", name:"Samurai", type:"Infantry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:2, max:4, special:"Bushido: cannot evade, -1 drive-back dice.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_mikata", name:"Mikata (Ronin & Monks)", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:2, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_ninja", name:"Ninja", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:2, special:"Shoot 15cm, 360° vision. Can infiltrate.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_oni", name:"Oni", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Spirit Ogres.", upgrades:[], magic:[] },
      { id:"ni_samuraiCavalry", name:"Samurai Cavalry", type:"Cavalry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Bushido: cannot evade, -1 drive-back dice.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_komainu", name:"Komainu", type:"Cavalry", atk:"2", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:3, special:"Spirit lion-dogs.", upgrades:[], magic:[] },
      { id:"ni_tengu", name:"Tengu", type:"Monster", atk:"2", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:"-", max:1, special:"Flies. Spirit creatures.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

};

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
function calcUnitCost(unit, selectedUpgrades, selectedMagic) {
  let cost = typeof unit.pts === "number" ? unit.pts : 0;
  return cost;
}

// ── ELIGIBILITY HELPERS ───────────────────────────────────────────────────────
// Per WMR Armies v2.24 p.88 and core rules:
//   Magic Standards  → Infantry / Cavalry / Chariot units only (not characters, not monsters/artillery)
//   Magic Weapons    → Characters only (General, Hero, Wizard)
//   Devices of Power → Characters, but each item restricted to sub-type:
//       Crown of Command      → General only
//       Helm of Dominion      → General only
//       Orb of Majesty        → General only
//       Sceptre of Sovereignty→ General only
//       Ring of Magic         → Wizard only
//       Wand of Power         → Wizard only
//       Rod of Repetition     → Wizard only
//       Staff of Spellbinding → Wizard only (also Runesmith heroes who have dispel ability)
//       Scroll of Dispelling  → Wizard only (also Runesmith heroes)
//
// A "Runesmith" is a Hero whose name contains "Runesmith" — they can take the
// two wizard-adjacent dispel items.
//
// Banner Shielding variants are further gated by the unit's actual armour value.
// Banner Fortitude variants are gated by the unit's actual hits value.
// Banner Steadfastness variants are gated by armour value.

const GENERAL_DEVICES = new Set(["crown_command","helm_dominion","orb_majesty","sceptre_sovereignty"]);
const WIZARD_DEVICES   = new Set(["ring_magic","wand_power","rod_repetition","staff_spellbinding","scroll_dispelling"]);
const RUNESMITH_DEVICES= new Set(["staff_spellbinding","scroll_dispelling"]);

function armourNumeric(armourStr) {
  // Returns the armour save number, or 0 if no save (armour "0")
  if (!armourStr || armourStr === "0" || armourStr === "-") return 0;
  const m = armourStr.match(/(\d+)\+/);
  return m ? parseInt(m[1]) : 0;
}

function getBannerEligibility(unit) {
  // Returns which banner_shielding / banner_steadfastness tier fits the unit's armour
  // and which banner_fortitude tier fits the unit's hits
  const armNum = armourNumeric(unit.armour);
  const hitsNum = typeof unit.hits === "string" ? parseInt(unit.hits) : (unit.hits || 0);

  const eligible = new Set();

  // Battle Banner — any combatant
  eligible.add("battle_banner");

  // Banner of Shielding — tiered by armour
  if (armNum === 4) eligible.add("banner_shielding_sup");
  else if (armNum === 5) eligible.add("banner_shielding_maj");
  else if (armNum === 6 || armNum === 0) eligible.add("banner_shielding_min");

  // Banner of Fortitude — tiered by hits
  if (hitsNum === 4) eligible.add("banner_fortitude_maj");
  else if (hitsNum === 3 || hitsNum === 2) eligible.add("banner_fortitude_min");

  // Banner of Steadfastness — tiered by armour
  if (armNum === 4) eligible.add("banner_steadfastness_sup");
  else if (armNum === 5) eligible.add("banner_steadfastness_maj");
  else if (armNum === 6) eligible.add("banner_steadfastness_min");

  // Banner of Fortune — any unit with a banner
  eligible.add("banner_fortune");

  return eligible;
}

function isWizardType(unit) {
  return unit.type === "Wizard";
}
function isGeneralType(unit) {
  return unit.type === "General";
}
function isHeroType(unit) {
  return unit.type === "Hero";
}
function isRunesmith(unit) {
  return unit.type === "Hero" && unit.name.toLowerCase().includes("runesmith");
}
function isCharacter(unit) {
  return ["General","Hero","Wizard"].includes(unit.type);
}
function isBannerUnit(unit) {
  return ["Infantry","Cavalry","Chariot"].includes(unit.type);
}

function getMagicItemsForUnit(unit) {
  const items = [];

  // ── Magic Standards (Infantry / Cavalry / Chariot only) ───────────────────
  if (isBannerUnit(unit)) {
    const eligible = getBannerEligibility(unit);
    MAGIC_STANDARDS.forEach(item => {
      if (eligible.has(item.id)) items.push(item);
    });
  }

  // ── Magic Weapons (Characters only) ──────────────────────────────────────
  if (isCharacter(unit)) {
    MAGIC_WEAPONS.forEach(item => items.push(item));
  }

  // ── Devices of Power (Characters, sub-filtered by type) ───────────────────
  // Grey Seer is a General who can also take Wizard items (greySeer:true flag)
  const isGreySeer = unit.greySeer === true;

  if (isCharacter(unit)) {
    DEVICES_OF_POWER.forEach(item => {
      if (GENERAL_DEVICES.has(item.id) && (isGeneralType(unit) || isGreySeer)) {
        items.push(item);
      } else if (WIZARD_DEVICES.has(item.id) && (isWizardType(unit) || isGreySeer)) {
        items.push(item);
      } else if (RUNESMITH_DEVICES.has(item.id) && isRunesmith(unit)) {
        if (!isWizardType(unit)) items.push(item);
      }
    });
  }

  return items;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: 'Crimson Text', Georgia, serif; background: #0a0806; color: #d4c8a8; -webkit-text-size-adjust:100%; overflow-x:hidden; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #888; }
    button { cursor: pointer; font-family: inherit; border: none; }
    * { -webkit-tap-highlight-color: transparent; }
    @media print {
      .no-print { display: none !important; }
      body { margin: 0 !important; padding: 0 !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  `}</style>
);

// ── TYPE BADGE ─────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  "General":"#c8940a","Hero":"#c8940a","Wizard":"#6060c0",
  "Infantry":"#4a8a4a","Cavalry":"#6a4aaa","Chariot":"#aa6a20",
  "Monster":"#aa2020","Artillery":"#606060","Machine":"#506080",
  "Monstrous Mount":"#c03060","Chariot Mount":"#c03060",
  "Special Mount":"#c03060","Special":"#808080",
};
function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || "#666";
  return (
    <span style={{ fontSize:"0.93rem", fontFamily:"'Cinzel',serif", padding:"1px 6px", background: c+"30", color: c, border:`1px solid ${c}60`, borderRadius:3, whiteSpace:"nowrap" }}>
      {type}
    </span>
  );
}

// ── HOW TO PLAY ───────────────────────────────────────────────────────────────
function HowToPlay({ onBack }) {
  const S = { // section style
    bg:"#0d0b08", border:"1px solid #2a2510", borderRadius:6, padding:"16px 18px", marginBottom:12
  };
  const H = { // heading style
    fontFamily:"'Cinzel',serif", fontSize:"0.93rem", color:"#888", letterSpacing:2, marginBottom:10, textTransform:"uppercase"
  };
  const tip = (icon, title, body) => (
    <div style={{ display:"flex", gap:10, marginBottom:10 }}>
      <div style={{ fontSize:"1.1rem", flexShrink:0, marginTop:1 }}>{icon}</div>
      <div>
        <div style={{ fontSize:"0.93rem", color:"#d4b060", fontWeight:600, marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:"1.1rem", color:"#9a9070", lineHeight:1.55 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0806", padding:"20px 16px" }}>
      <GS />
      <div style={{ maxWidth:720, margin:"0 auto" }}>

        <button onClick={onBack}
          style={{ background:"transparent", color:"#555", border:"1px solid #333", borderRadius:4, padding:"5px 12px", fontSize:"1.1rem", marginBottom:20, cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:1 }}
          onMouseEnter={e => e.currentTarget.style.color="#999"}
          onMouseLeave={e => e.currentTarget.style.color="#555"}
        >← BACK</button>

        <div style={{ textAlign:"center", marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.2rem,3.5vw,1.8rem)", color:"#f0c040", letterSpacing:2 }}>⚔ HOW TO PLAY</h1>
          <p style={{ color:"#555", fontSize:"0.97rem", marginTop:6, letterSpacing:1 }}>Warmaster Revolution — Community Tips & Basics</p>
          <div style={{ width:80, height:1, background:"linear-gradient(90deg,transparent,#c8940a,transparent)", margin:"10px auto 0" }} />
        </div>

        {/* What is WMR */}
        <div style={S}>
          <div style={H}>What Is Warmaster Revolution?</div>
          <p style={{ fontSize:"0.97rem", color:"#9a9070", lineHeight:1.65 }}>
            Warmaster Revolution is the community-maintained 2nd edition of Rick Priestley's <em>Warmaster</em> — a 10mm fantasy mass-battle game set in the Warhammer world. Armies are typically 2,000pts played on a 6′×4′ table. The game centres not on individual warriors but on <strong style={{color:"#c8a060"}}>command and control</strong> — your general's ability to order regiments around the battlefield is more decisive than any unit's stats.
          </p>
        </div>

        {/* Core turn sequence */}
        <div style={S}>
          <div style={H}>Turn Sequence</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
            {[
              ["1","Command Phase","Issue orders to brigades — the heart of the game. Each failed order ends your commander's ability to order further that turn."],
              ["2","Shooting Phase","Units with ranged attacks fire. Shooting disrupts formations and pushes units back rather than destroying them outright."],
              ["3","Combat Phase","Units in base contact fight. Combats resolve quickly — winners pursue, losers fall back or are destroyed."],
              ["4","End Phase","Check army breakpoint. An army that has lost one-third of its units must begin withdrawing."],
            ].map(([n,t,b]) => (
              <div key={n} style={{ background:"#0a0806", border:"1px solid #1e1c10", borderRadius:5, padding:"10px 12px" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.2rem", color:"#c8940a", fontWeight:700, marginBottom:4 }}>{n}</div>
                <div style={{ fontSize:"0.88rem", color:"#d4b060", fontWeight:600, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:"1.2rem", color:"#777", lineHeight:1.5 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Command basics */}
        <div style={S}>
          <div style={H}>The Command Phase — Key Concepts</div>
          {tip("🎲","Roll under Command Value","To issue an order, roll 2D6 and score equal to or less than the character's Command value. Success means the unit moves. Failure ends that character's orders for the turn.")}
          {tip("📏","Distance Penalties","Each 20cm between the character and the target unit adds −1 to the Command value. Keep your characters close to the units they need to lead.")}
          {tip("⚠️","Cumulative Penalties","Each order after the first in a turn adds −1. Being within 20cm of the enemy adds −1. Dense terrain adds −1. These stack — choose your order sequence carefully.")}
          {tip("❌","Blunders","Rolling 11 or 12 always fails and causes a Blunder — the unit moves in the wrong direction. This is why reliable Command values matter so much.")}
        </div>

        {/* Brigades */}
        <div style={S}>
          <div style={H}>Brigades — The Core Tactical Tool</div>
          {tip("🔗","Group Up to 4 Units","Up to four touching units can be issued a single order as a brigade. One roll moves all of them together — far more efficient than ordering each unit separately.")}
          {tip("📐","Distance is to the Furthest Unit","When issuing an order to a brigade, measure to the most distant unit in it. If that unit is far away or in terrain, you take all the penalties for all of them.")}
          {tip("🏹","Mix Missiles and Melee","A classic brigade: 2 missile units at the front with 2 melee units behind them. The melee units provide support in combat while the missiles can shoot from behind in the shooting phase.")}
          {tip("🛡️","Protect Your Artillery","Artillery charged without support is almost certainly lost. Station one or two infantry units nearby — they can stand and shoot if charged, making the attacker pay dearly.")}
        </div>

        {/* Army building */}
        <div style={S}>
          <div style={H}>Army Building Basics (Community Advice)</div>
          {tip("⚖️","Aim for ~10 Units per 1,000pts","This gives you a healthy breakpoint and 2–4 task forces. Fewer units means each loss hurts more; too many and you struggle to move them all effectively. Source: brumbaer.de")}
          {tip("⚔️","One Striking Force per 1,000pts","Include 2–4 hard-hitting units (knights, chariots, monsters) whose job it is to smash enemy units. You need something that can actually destroy opponents, not just hold ground.")}
          {tip("💨","Include Fast Harassers","Light cavalry, flyers or fast skirmishers serve a vital role: blocking enemy movement, drawing missile fire, and forcing the opponent to react to you rather than executing their own plan.")}
          {tip("☠️","Have a Sacrificial Unit","One cheap unit whose job is to absorb fire, act as bait, or block an enemy charge aimed at something more valuable. It doesn't need to survive — it just needs to buy time.")}
          {tip("🧙","Characters Per 4 Units","As a rule of thumb: one character per four units. A Command 10 General counts as three, Command 9 as two, Command 8 as one. Don't over-invest in characters at the expense of units.")}
          {tip("💍","Magic Items — Less is More","Don't buy magic items if you could take a unit instead. The exception: always give your General an Orb of Majesty. That one re-roll will decide a game.")}
        </div>

        {/* Shooting */}
        <div style={S}>
          <div style={H}>Shooting — Disruption Not Destruction</div>
          {tip("↩️","Shooting Drives Units Back","Hits from shooting force drive-back rolls — units may be pushed away from the action, costing the opponent orders to bring them back. Use this to disrupt enemy formations.")}
          {tip("🎯","Armour Piercing is Powerful","Several units have armour-piercing attacks (Handgunners, Jezzails, etc.) — enemy armour saves one worse than normal. Prioritise these against heavily armoured cavalry.")}
        </div>

        {/* Combat */}
        <div style={S}>
          <div style={H}>Combat — Flanks, Support & Pursuit</div>
          {tip("🔄","Flanks & Rear are Devastating","A unit attacking the flank or rear of an enemy doesn't grant the enemy supporting attacks. Position fast cavalry to threaten flanks before committing your main attack.")}
          {tip("🤝","Support Attacks","Adjacent friendly units in the same combat add support attacks (+1 per supporting stand, up to the width of the fighting unit). Brigades fighting together are far stronger than isolated units.")}
          {tip("🏃","Pursuit Matters","Winning units pursue or advance. If they pursue into fresh enemy units they fight again immediately. Chain-routing an enemy brigade in one turn is possible — and often decisive.")}
        </div>

        {/* Key rules reminders */}
        <div style={S}>
          <div style={H}>Easy-to-Forget Rules</div>
          {tip("🌲","Dense Terrain = −1 Command","Ordering any unit in or through dense terrain adds −1 to Command. Build your line away from forests if possible, or choose armies with Woodland Folk.")}
          {tip("😱","Terror","Units charged by Terror-causing enemies take −1 Attack in the first round of combat unless they pass a Command test to ignore it. Terror units are disproportionately powerful against low-Command armies.")}
          {tip("🗺️","Measure Anytime","You can measure any distance at any time. Warmaster is not a hidden-measurement game. Use this constantly to plan charges, brigade ranges and character command radii.")}
          {tip("🎯","Characters Move Freely","Characters move up to 60cm in the characters sub-phase without any order roll. Use them to reposition between units each turn to be in range for the orders you need.")}
        </div>

        <div style={{ textAlign:"center", marginTop:16, marginBottom:8 }}>
          <p style={{ fontSize:"1.25rem", color:"#444", fontStyle:"italic" }}>
            Tips sourced from the WMR community at brumbaer.de, warmaster.info, and player discussions.
          </p>
        </div>

      </div>
    </div>
  );
}

// ── FACTION SELECTOR ──────────────────────────────────────────────────────────
function FactionSelector({ onPreview, onHowToPlay, onSavedLists, session, onLogout, isGuest }) {
  const factions = Object.entries(ARMIES);
  return (
    <div style={{ minHeight:"100vh", background:"#0a0806", padding:"16px" }}>
      <GS />
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.7rem,5vw,2.8rem)", color:"#f0c040", letterSpacing:3 }}>⚔ WARMASTER REVOLUTION</h1>
          <p style={{ color:"#666", fontSize:"1.25rem", marginTop:6, letterSpacing:1 }}>Official Armies v2.24 · Choose your faction</p>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
            <button onClick={onHowToPlay}
              style={{ background:"transparent", color:"#888", border:"1px solid #333", borderRadius:4, padding:"6px 16px", fontSize:"1.25rem", fontFamily:"'Cinzel',serif", letterSpacing:1, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color="#c8a060"; e.currentTarget.style.borderColor="#666"; }}
              onMouseLeave={e => { e.currentTarget.style.color="#888"; e.currentTarget.style.borderColor="#333"; }}
            >📖 HOW TO PLAY</button>
            <button onClick={() => onPreview && onPreview("magic_items")}
              style={{ background:"transparent", color:"#c8a040", border:"1px solid #6a4a10", borderRadius:4, padding:"6px 16px", fontSize:"1.25rem", fontFamily:"'Cinzel',serif", letterSpacing:1, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#c8a04022"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
            >✦ MAGIC ITEMS</button>
            {!isGuest && (
              <button onClick={onSavedLists}
                style={{ background:"transparent", color:"#888", border:"1px solid #333", borderRadius:4, padding:"6px 16px", fontSize:"1.25rem", fontFamily:"'Cinzel',serif", letterSpacing:1, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color="#c8a060"; e.currentTarget.style.borderColor="#666"; }}
                onMouseLeave={e => { e.currentTarget.style.color="#888"; e.currentTarget.style.borderColor="#333"; }}
              >📋 SAVED LISTS</button>
            )}
            <button onClick={onLogout}
              style={{ background:"transparent", color:"#555", border:"1px solid #222", borderRadius:4, padding:"6px 14px", fontSize:"1.1rem", fontFamily:"'Cinzel',serif", letterSpacing:1, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color= isGuest ? "#60a060" : "#c05050"; e.currentTarget.style.borderColor= isGuest ? "#306030" : "#553030"; }}
              onMouseLeave={e => { e.currentTarget.style.color="#555"; e.currentTarget.style.borderColor="#222"; }}
            >{isGuest ? "⇢ SIGN IN" : "⏻ LOG OUT"}</button>
          </div>
          <div style={{ fontSize:"0.72rem", marginTop:6, letterSpacing:1 }}>
            {isGuest
              ? <span style={{ color:"#6a4a00" }}>⚠ Guest mode — lists will not be saved</span>
              : session?.email && <span style={{ color:"#333" }}>Signed in as {session.email}</span>
            }
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10 }}>
          {factions.map(([key, army]) => (
            <button key={key} onClick={() => onPreview(key)}
              style={{ background:`linear-gradient(150deg, ${army.bg} 0%, ${army.color}18 100%)`, border:`1px solid ${army.color}50`, borderRadius:8, padding:"14px 10px", textAlign:"center", color:"#d4c8a8", transition:"all 0.18s", cursor:"pointer", position:"relative", overflow:"hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = army.accent; e.currentTarget.style.background = `linear-gradient(150deg, ${army.bg} 0%, ${army.color}35 100%)`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = army.color+"50"; e.currentTarget.style.background = `linear-gradient(150deg, ${army.bg} 0%, ${army.color}18 100%)`; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.2rem", color: army.accent, fontWeight:700, marginBottom:5, lineHeight:1.3, letterSpacing:0.5 }}>{army.name.toUpperCase()}</div>
              {army.wip && (
                <div style={{ display:"inline-block", background:"#3a2000", border:"1px solid #c87800", borderRadius:3, padding:"1px 6px", fontSize:"0.6rem", color:"#c87800", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:3 }}>⚠ WIP</div>
              )}
              <div style={{ fontSize:"1.1rem", color:"#666", lineHeight:1.35 }}>{army.lore.substring(0,55)}…</div>
              <div style={{ marginTop:8, fontSize:"1.25rem", color: army.color, opacity:0.8, letterSpacing:1 }}>VIEW DETAILS →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ARMY CONFIRMATION SCREEN ──────────────────────────────────────────────────
function ArmyConfirm({ armyKey, onConfirm, onBack }) {
  const army = ARMIES[armyKey];
  // Attach key to army object for convenient access in sub-components
  if (army && !army.key) army.key = armyKey;
  const unitCounts = { Infantry:0, Cavalry:0, Chariot:0, Monster:0, Artillery:0, Machine:0, Character:0, Mount:0, Special:0 };
  army.units.forEach(u => {
    if (["General","Hero","Wizard"].includes(u.type)) unitCounts.Character++;
    else if (["Monstrous Mount","Chariot Mount","Special Mount"].includes(u.type)) unitCounts.Mount++;
    else if (u.type === "Special") unitCounts.Special++;
    else if (unitCounts[u.type] !== undefined) unitCounts[u.type]++;
  });
  const unitSummary = Object.entries(unitCounts).filter(([,v]) => v > 0);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0806", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"24px 16px" }}>
      <GS />
      <div style={{ width:"100%", maxWidth:680 }}>

        {/* Back button */}
        <button onClick={onBack}
          style={{ background:"transparent", color:"#555", border:"1px solid #333", borderRadius:4, padding:"5px 12px", fontSize:"1.1rem", marginBottom:20, cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:1 }}
          onMouseEnter={e => e.currentTarget.style.color="#999"}
          onMouseLeave={e => e.currentTarget.style.color="#555"}
        >← BACK</button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:"0.93rem", fontFamily:"'Cinzel',serif", color:"#555", letterSpacing:3, marginBottom:8 }}>YOU HAVE CHOSEN</div>
          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,5vw,2.4rem)", color: army.accent, letterSpacing:2, lineHeight:1.1 }}>{army.name.toUpperCase()}</h2>
          <div style={{ width:80, height:2, background:`linear-gradient(90deg, transparent, ${army.color}, transparent)`, margin:"12px auto" }} />
        </div>

        {/* WIP Warning */}
        {army.wip && (
          <div style={{ background:"#1a0d00", border:"2px solid #c87800", borderRadius:8, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ fontSize:"1.3rem", flexShrink:0 }}>⚠</div>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", color:"#c87800", fontSize:"0.88rem", fontWeight:700, letterSpacing:1, marginBottom:4 }}>WORK IN PROGRESS — UNOFFICIAL LIST</div>
              <div style={{ fontSize:"0.82rem", color:"#8a6030", lineHeight:1.5 }}>
                This army list has been created as a custom/unofficial supplement and is not part of the official Warmaster Revolution v2.24 ruleset. Stats, points and rules may not be balanced for competitive play. Use with your opponent's agreement.
              </div>
            </div>
          </div>
        )}

        {/* Fluff text */}
        <div style={{ background:`linear-gradient(135deg, ${army.bg}, ${army.color}15)`, border:`1px solid ${army.color}40`, borderRadius:8, padding:"20px 24px", marginBottom:16, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${army.color}80, transparent)` }} />
          <p style={{ fontFamily:"'Crimson Text',Georgia,serif", fontSize:"1.25rem", color:"#c8b880", lineHeight:1.75, fontStyle:"italic", textAlign:"justify" }}>
            {army.fluff}
          </p>
        </div>

        {/* Traits + Playstyle in two columns */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          {/* Key traits */}
          <div style={{ background:"#0d0b08", border:`1px solid ${army.color}30`, borderRadius:6, padding:"14px 16px" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color:"#555", letterSpacing:2, marginBottom:10 }}>ARMY TRAITS</div>
            {(army.traits || []).map((t,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background: army.color, flexShrink:0 }} />
                <span style={{ fontSize:"0.93rem", color:"#b0a070" }}>{t}</span>
              </div>
            ))}
          </div>
          {/* Strengths / Weaknesses */}
          <div style={{ background:"#0d0b08", border:`1px solid ${army.color}30`, borderRadius:6, padding:"14px 16px" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color:"#555", letterSpacing:2, marginBottom:10 }}>STRENGTHS & WEAKNESSES</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:"1.25rem", fontFamily:"'Cinzel',serif", color:"#3a7a3a", letterSpacing:1, marginBottom:4 }}>STRENGTHS</div>
              <div style={{ fontSize:"1.1rem", color:"#70a070", lineHeight:1.4 }}>{army.strengths}</div>
            </div>
            <div>
              <div style={{ fontSize:"1.25rem", fontFamily:"'Cinzel',serif", color:"#7a3a3a", letterSpacing:1, marginBottom:4 }}>WEAKNESSES</div>
              <div style={{ fontSize:"1.1rem", color:"#a07070", lineHeight:1.4 }}>{army.weaknesses}</div>
            </div>
          </div>
        </div>

        {/* Playstyle */}
        <div style={{ background:"#0d0b08", border:`1px solid ${army.color}30`, borderRadius:6, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color:"#555", letterSpacing:2, marginBottom:8 }}>HOW TO PLAY</div>
          <p style={{ fontSize:"1.2rem", color:"#9a9070", lineHeight:1.6 }}>{army.playstyle}</p>
        </div>

        {/* ── BLOOD RITES (Khorne only) ──────────────────────────────────── */}
        {army.bloodRites && army.bloodRites.length > 0 && (
          <div style={{ background:"#0a0200", border:`2px solid ${army.color}60`, borderRadius:6, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color: army.accent, letterSpacing:2, marginBottom:2 }}>⚔ BLOOD RITES</div>
            <div style={{ fontSize:"0.93rem", color:"#7a3020", marginBottom:10, fontStyle:"italic" }}>Khorne grants no spells — only blood-soaked commandments and battle fury.</div>
            {army.bloodRites.map((rite, i) => (
              <div key={i} style={{ marginBottom:10, paddingBottom:10, borderBottom: i < army.bloodRites.length-1 ? `1px solid ${army.color}25` : "none" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.97rem", color: army.accent, fontWeight:700, marginBottom:3 }}>{rite.title}</div>
                <div style={{ fontSize:"0.93rem", color:"#c05030", marginBottom:3 }}>
                  <span style={{ color:"#664428" }}>When: </span>{rite.trigger}
                </div>
                <div style={{ fontSize:"0.88rem", color:"#b89060", lineHeight:1.5, marginBottom:3 }}>
                  <span style={{ color:"#888", fontSize:"1.1rem" }}>Effect: </span>{rite.effect}
                </div>
                <div style={{ fontSize:"0.93rem", color:"#7a4030", fontStyle:"italic" }}>"{rite.flavour}"</div>
              </div>
            ))}
          </div>
        )}
        {/* ── SPELL LIST ────────────────────────────────────────────────── */}
        {army.spells && army.spells.length > 0 && (
          <div style={{ background:"#0d0b08", border:`1px solid ${army.color}30`, borderRadius:6, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color:"#555", letterSpacing:2, marginBottom:10 }}>SPELL LIST</div>
            {army.spells.map((spell, i) => (
              <div key={i} style={{ marginBottom:8, paddingBottom:8, borderBottom: i < army.spells.length-1 ? "1px solid #1a1a1a" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.93rem", color: army.accent, fontWeight:700, fontFamily:"'Cinzel',serif" }}>{spell.name}</span>
                  <span style={{ fontSize:"0.93rem", color:"#888", flexShrink:0 }}>
                    <span style={{ color: army.color }}>{spell.cast}</span> to cast · Range {spell.range}
                  </span>
                </div>
                <p style={{ fontSize:"0.88rem", color:"#9a9070", lineHeight:1.5, marginTop:3 }}>{spell.desc}</p>
              </div>
            ))}
          </div>
        )}
        {/* ── DAEMONIC INSTABILITY TABLE ────────────────────────────────── */}
        {army.instabilityTable && army.instabilityTable.length > 0 && (
          <div style={{ background:"#08080d", border:`1px solid ${army.color}40`, borderRadius:6, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color: army.color, letterSpacing:2, marginBottom:4 }}>☠ DAEMONIC INSTABILITY TABLE</div>
            <div style={{ fontSize:"0.93rem", color:"#555", marginBottom:10, fontStyle:"italic" }}>Roll at start of Command phase for every daemon unit with ≥1 lost stand. −1 to roll if only 1 stand remains and no friendly Wizard within 20cm.</div>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"4px 12px" }}>
              {army.instabilityTable.map((row, i) => (
                <React.Fragment key={i}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.93rem", color: army.accent, fontWeight:700, padding:"4px 0", borderBottom: i < army.instabilityTable.length-1 ? `1px solid ${army.color}15` : "none", minWidth:36 }}>{row.roll}</div>
                  <div style={{ padding:"4px 0", borderBottom: i < army.instabilityTable.length-1 ? `1px solid ${army.color}15` : "none" }}>
                    <div style={{ fontSize:"0.88rem", color:"#a08858", fontWeight:600, marginBottom:1 }}>{row.result}</div>
                    <div style={{ fontSize:"1.2rem", color:"#7a7050", lineHeight:1.4 }}>{row.effect}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        {/* Unit roster summary */}
        <div style={{ background:"#0d0b08", border:`1px solid ${army.color}30`, borderRadius:6, padding:"14px 16px", marginBottom:24 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color:"#555", letterSpacing:2, marginBottom:10 }}>ROSTER OVERVIEW</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {unitSummary.map(([type, count]) => (
              <div key={type} style={{ background: army.color+"18", border:`1px solid ${army.color}30`, borderRadius:4, padding:"4px 10px", fontSize:"1.25rem", color:"#a09060" }}>
                <span style={{ color: army.accent, fontWeight:700 }}>{count}</span>
                <span style={{ marginLeft:4, color:"#666" }}>{type} option{count !== 1 ? "s":""}</span>
              </div>
            ))}
            <div style={{ background: army.color+"18", border:`1px solid ${army.color}30`, borderRadius:4, padding:"4px 10px", fontSize:"1.25rem", color:"#a09060" }}>
              <span style={{ color: army.accent, fontWeight:700 }}>{army.units.length}</span>
              <span style={{ marginLeft:4, color:"#666" }}>total entries</span>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button onClick={onConfirm}
          style={{ width:"100%", background:`linear-gradient(135deg, ${army.color}cc, ${army.color}88)`, color:"#000", border:"none", borderRadius:8, padding:"16px 0", fontFamily:"'Cinzel',serif", fontSize:"1.2rem", fontWeight:700, letterSpacing:3, cursor:"pointer", transition:"all 0.2s", boxShadow:`0 4px 20px ${army.color}40` }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 28px ${army.color}70`; e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${army.color}40`; e.currentTarget.style.transform="translateY(0)"; }}
        >
          MARCH TO WAR →
        </button>

      </div>
    </div>
  );
}

// ── UNIT LIST PANEL ────────────────────────────────────────────────────────────

// ── PER-1K BRACKET HELPERS ────────────────────────────────────────────────────
// WMR: unit min/max are per 1000pts. A 2000pt army gets 2× the normal max/min.
// Brackets round UP: 1001pts = 2 brackets, 2001pts = 3 brackets.
function ptsToKBrackets(totalPts) {
  return Math.max(1, Math.ceil(totalPts / 1000));
}
function effectiveMax(unit, totalPts) {
  if (unit.max === "-" || unit.max === null || unit.max === undefined) return Infinity;
  const n = Number(unit.max);
  if (isNaN(n)) return Infinity;
  // General type is always exactly 1 total — never scales with army size
  if (unit.type === "General") return 1;
  return n * ptsToKBrackets(totalPts);
}
function effectiveMin(unit, totalPts) {
  if (unit.min === "-" || unit.min === null || unit.min === undefined) return 0;
  const n = Number(unit.min);
  if (isNaN(n)) return 0;
  // Generals: always exactly 1 total, never multiplied by army size
  if (unit.type === "General") return 1;
  return n * ptsToKBrackets(totalPts);
}
// Validation: returns array of warning strings for the current roster
function validateRoster(roster, army, totalPts) {
  const warnings = [];
  const brackets = ptsToKBrackets(totalPts);
  const counts = {};
  roster.forEach(e => { counts[e.unit.id] = (counts[e.unit.id] || 0) + 1; });

  // Check minimums for all non-General units (Generals handled below)
  army.units.forEach(unit => {
    if (unit.type === "General") return;
    const minReq = effectiveMin(unit, totalPts);
    if (minReq > 0) {
      const taken = counts[unit.id] || 0;
      if (taken < minReq) {
        warnings.push(`${unit.name}: need ${minReq} (min ${unit.min}×${brackets}k), have ${taken}`);
      }
    }
  });

  // General: always exactly 1 — never multiplied by army size
  const generals = roster.filter(e => e.unit.type === "General").length;
  if (generals === 0) warnings.push("Army must include 1 General");
  if (generals > 1)  warnings.push("Army may only include 1 General");
  return warnings;
}

function UnitList({ army, armyKey, selectedUnit, onSelectUnit, roster, onAddUnit }) {
  // Mount types are handled via character upgrade dropdowns, not as standalone units
  // Exception: units explicitly marked as purchasable (isUnit:true) still show
  const mountTypes = ["Monstrous Mount","Chariot Mount","Special Mount"];
  const types = ["General","Hero","Wizard","Special","Infantry","Cavalry","Chariot","Monster","Artillery","Machine"];
  const byType = {};
  army.units.forEach(u => {
    const t = u.type;
    // Skip mount-type entries unless explicitly flagged as a purchasable unit
    if (mountTypes.includes(t) && !u.isUnit) return;
    if (!byType[t]) byType[t] = [];
    byType[t].push(u);
  });
  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"8px 0" }}>
      {types.filter(t => byType[t]).map(type => (
        <div key={type}>
          <div style={{ padding:"4px 12px", fontSize:"0.88rem", fontFamily:"'Cinzel',serif", color:"#666", letterSpacing:2, textTransform:"uppercase", borderBottom:"1px solid #1a1a1a", background:"#0d0b08" }}>
            {type}
          </div>
          {byType[type].map(unit => {
            const count = roster.filter(r => r.unit.id === unit.id).length;
            const effMax = effectiveMax(unit, roster.reduce((s,e)=>{ const b=typeof e.unit.pts==="number"?e.unit.pts:0; const mt=e.mount?e.mount.pts||0:0; const mg=e.magicItem?e.magicItem.cost||0:0; return s+b+mt+mg; },0));
            const effMin = effectiveMin(unit, roster.reduce((s,e)=>{ const b=typeof e.unit.pts==="number"?e.unit.pts:0; const mt=e.mount?e.mount.pts||0:0; const mg=e.magicItem?e.magicItem.cost||0:0; return s+b+mt+mg; },0));
            const atMax = effMax !== Infinity && count >= effMax;
            const belowMin = effMin > 0 && count < effMin;
            const minStr = unit.min === "-" ? "—" : String(unit.min);
            const maxStr = unit.max === "-" ? "—" : String(unit.max);
            return (
              <div key={unit.id}
                style={{ padding:"8px 12px", background:"transparent", borderLeft:"3px solid transparent", borderBottom:"1px solid #111", display:"flex", justifyContent:"space-between", alignItems:"center", opacity: atMax ? 0.55 : 1 }}
              >
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontSize:"0.97rem", color:"#d4c8a8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{unit.name}</div>
                  <div style={{ fontSize:"1.1rem", color:"#666", display:"flex", gap:6, flexWrap:"wrap", marginTop:1 }}>
                    <span>{typeof unit.pts === "number" ? `${unit.pts}pts` : unit.pts}</span>
                    <span style={{ color:"#444" }}>·</span>
                    <span style={{ color: belowMin ? "#c05050" : "#555" }}>
                      Min: <span style={{ color: belowMin ? "#c07050" : "#666" }}>{effMin > 0 ? effMin : "—"}</span>
                    </span>
                    <span style={{ color: atMax ? "#c07000" : "#555" }}>
                      Max: <span style={{ color: atMax ? "#c09020" : "#666" }}>{effMax === Infinity ? "—" : effMax}</span>
                    </span>
                    {count > 0 && <span style={{ color: army.accent }}>({count} taken)</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:4, alignItems:"center", flexShrink:0, marginLeft:6 }}>
                  <button
                    onClick={e => { e.stopPropagation(); if (!atMax) onAddUnit(unit); }}
                    disabled={atMax}
                    title={atMax ? `Maximum ${effMax} reached` : `Add ${unit.name}`}
                    style={{ width:22, height:22, borderRadius:"50%", background: atMax ? "#1a1a1a" : army.color+"30", color: atMax ? "#333" : army.accent, fontSize:"1.2rem", lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center", cursor: atMax ? "not-allowed" : "pointer" }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── UNIT DETAIL PANEL ──────────────────────────────────────────────────────────
function UnitDetail({ unit, army, onAdd, roster }) {
  if (!unit) return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#444", fontSize:"1.25rem", fontStyle:"italic" }}>
      Select a unit to view details
    </div>
  );

  const allMagic = getMagicItemsForUnit(unit);

  // Group eligible items by category for display
  const magicStandardItems = allMagic.filter(i => MAGIC_STANDARDS.some(s => s.id === i.id));
  const magicWeaponItems   = allMagic.filter(i => MAGIC_WEAPONS.some(s => s.id === i.id));
  const deviceItems        = allMagic.filter(i => DEVICES_OF_POWER.some(s => s.id === i.id));

  // Eligibility label for this unit
  const eligNote = (() => {
    if (unit.greySeer)          return "Grey Seer — Magic Weapons + General AND Wizard Devices";
    if (isGeneralType(unit))    return "General — Magic Weapons + General Devices";
    if (isWizardType(unit))     return "Wizard — Magic Weapons + Wizard Devices";
    if (isRunesmith(unit))      return "Runesmith — Magic Weapons + Dispel Devices";
    if (isHeroType(unit))       return "Hero — Magic Weapons only";
    if (isBannerUnit(unit))     return "Unit — Magic Standards only";
    return null;
  })();

  const statStyle = { flex:1, textAlign:"center", padding:"6px 4px" };

  const ItemGroup = ({ label, items, accent }) => items.length === 0 ? null : (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:"1.25rem", fontFamily:"'Cinzel',serif", color: accent || "#555", letterSpacing:1.5, marginBottom:5, textTransform:"uppercase" }}>{label}</div>
      {items.map(item => (
        <div key={item.id} style={{ background:"#0a0806", border:"1px solid #1e1c10", borderRadius:4, padding:"6px 10px", marginBottom:3 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8 }}>
            <span style={{ fontSize:"1.1rem", color:"#d4b060", fontWeight:600 }}>{item.name}</span>
            <span style={{ fontSize:"1.25rem", color: accent || "#888", flexShrink:0 }}>{item.cost}pts</span>
          </div>
          <div style={{ fontSize:"1.25rem", color:"#888", marginTop:2, lineHeight:1.4 }}>{item.desc}</div>
          {item.restriction && (
            <div style={{ fontSize:"1.1rem", color:"#6a5a10", fontStyle:"italic", marginTop:1 }}>⚠ {item.restriction}</div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:16 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:8 }}>
        <div>
          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.1rem", color: army.accent }}>{unit.name}</h2>
          <TypeBadge type={unit.type} />
        </div>
        {(() => {
          const generalInRoster = unit.type === "General" && roster && roster.some(e => e.unit.type === "General");
          return (
            <button onClick={() => !generalInRoster && onAdd(unit)} disabled={generalInRoster}
              style={{ background: generalInRoster ? "#333" : army.color, color: generalInRoster ? "#666" : "#000", padding:"6px 14px", borderRadius:4, fontFamily:"'Cinzel',serif", fontSize:"1.25rem", fontWeight:700, letterSpacing:1, cursor: generalInRoster ? "not-allowed" : "pointer", opacity: generalInRoster ? 0.6 : 1 }}>
              {generalInRoster ? "✓ GENERAL ADDED" : "+ ADD TO ROSTER"}
            </button>
          );
        })()}
      </div>

      {/* Stats */}
      <div style={{ background:"#0d0b08", border:`1px solid ${army.color}40`, borderRadius:6, overflow:"hidden", marginBottom:12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:`1px solid ${army.color}20` }}>
          {["Atk","Hits","Armour","Cmd","Size","Pts","Min/Max"].map(h => (
            <div key={h} style={{ ...statStyle, borderRight:"1px solid #1a1a1a", fontSize:"0.55rem", fontFamily:"'Cinzel',serif", color:"#555", letterSpacing:1, background:"#0a0806" }}>{h}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {[unit.atk, unit.hits, unit.armour, unit.cmd==="-"?"-":unit.cmd, unit.size, unit.pts, `${unit.min}/${unit.max}`].map((v,i) => (
            <div key={i} style={{ ...statStyle, borderRight:"1px solid #111", fontSize:"1.25rem", fontWeight:600, color: army.accent }}>{String(v)}</div>
          ))}
        </div>
      </div>

      {/* Special rules */}
      {unit.special && (
        <div style={{ background:"#0d0b08", border:`1px solid #2a2a1a`, borderRadius:6, padding:10, marginBottom:12 }}>
          <div style={{ fontSize:"0.88rem", fontFamily:"'Cinzel',serif", color:"#666", letterSpacing:1, marginBottom:4 }}>SPECIAL RULES</div>
          <p style={{ fontSize:"0.97rem", color:"#b0a080", lineHeight:1.5 }}>{unit.special}</p>
        </div>
      )}

      {/* Magic items — grouped with eligibility note */}
      {allMagic.length > 0 ? (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:"0.88rem", fontFamily:"'Cinzel',serif", color:"#666", letterSpacing:1 }}>ELIGIBLE MAGIC ITEMS</div>
            {eligNote && <div style={{ fontSize:"1.25rem", color: army.color, fontStyle:"italic" }}>{eligNote}</div>}
          </div>
          <ItemGroup label="Magic Standards" items={magicStandardItems} accent="#70a070" />
          <ItemGroup label="Magic Weapons" items={magicWeaponItems} accent="#a07030" />
          <ItemGroup label="Devices of Power" items={deviceItems} accent="#6070c0" />
        </div>
      ) : (
        <div style={{ background:"#0d0b08", border:"1px solid #1a1a1a", borderRadius:6, padding:10 }}>
          <div style={{ fontSize:"1.1rem", color:"#444", fontStyle:"italic" }}>
            {["Artillery","Machine","Monster"].includes(unit.type)
              ? "War machines and monsters cannot carry magic items."
              : "No magic items available for this unit type."}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROSTER ENTRY EDITOR ────────────────────────────────────────────────────────
// Shown when a roster entry is expanded. Lets the user pick a magic item AND
// (for characters) a mount from the same army's mount units.
function RosterEntryEditor({ entry, idx, army, onUpdate, roster, totalPts }) {
  const unit = entry.unit;
  const isCharacter = ["General","Hero","Wizard"].includes(unit.type);

  // ── Magic items ──────────────────────────────────────────────────────────────
  const allMagic = getMagicItemsForUnit(unit);
  const selectedMagic = entry.magicItem || null;

  function handleMagicChange(e) {
    const id = e.target.value;
    const item = allMagic.find(m => m.id === id) || null;
    onUpdate(idx, { magicItem: item });
  }

  // ── Mounts ───────────────────────────────────────────────────────────────────
  // Collect all mount-type units in the army
  const mountTypes = ["Monstrous Mount","Chariot Mount","Special Mount"];
  const availableMounts = isCharacter
    ? army.units.filter(u => mountTypes.includes(u.type))
    : [];
  const selectedMount = entry.mount || null;

  function handleMountChange(e) {
    const id = e.target.value;
    const mount = availableMounts.find(m => m.id === id) || null;
    onUpdate(idx, { mount });
  }

  // Count how many of each mount are already taken across the whole roster
  const mountCounts = {};
  roster.forEach((e, i) => {
    if (i !== idx && e.mount) {
      mountCounts[e.mount.id] = (mountCounts[e.mount.id] || 0) + 1;
    }
  });
  // A mount option is available if it's not at max for this army size
  const isMountAvailable = (mount) => {
    if (!mount.max || mount.max === "-") return true;
    const maxAllowed = effectiveMax(mount, totalPts);
    const taken = mountCounts[mount.id] || 0;
    // If current entry already has this mount, it counts as "not using a slot" here
    return taken < maxAllowed;
  };

  const hasMagic = allMagic.length > 0;
  const hasMounts = availableMounts.length > 0;
  if (!hasMagic && !hasMounts) return (
    <div style={{ fontSize:"1.25rem", color:"#444", fontStyle:"italic", padding:"4px 0" }}>No upgrades available for this unit.</div>
  );

  const selStyle = {
    width:"100%", background:"#0a0806", border:`1px solid ${army.color}40`,
    color:"#d4b060", borderRadius:3, padding:"4px 6px", fontSize:"0.88rem",
    marginTop:4, outline:"none",
  };
  const labelStyle = {
    fontSize:"1.25rem", fontFamily:"'Cinzel',serif", color:"#555",
    letterSpacing:1, textTransform:"uppercase", display:"block", marginTop:8, marginBottom:2,
  };

  return (
    <div style={{ paddingTop:4 }}>
      {hasMounts && (
        <div>
          <span style={labelStyle}>Mount</span>
          <select value={selectedMount?.id || ""} onChange={handleMountChange} style={selStyle}>
            <option value="">— On foot / no mount —</option>
            {availableMounts.map(m => {
              const available = isMountAvailable(m) || (selectedMount?.id === m.id);
              return (
                <option key={m.id} value={m.id} disabled={!available}>
                  {m.name} (+{m.pts}pts) — {m.atk} atk{!available ? " [MAX REACHED]" : ""}
                </option>
              );
            })}
          </select>
          {selectedMount && (
            <div style={{ fontSize:"0.93rem", color:"#888", marginTop:3, lineHeight:1.4, paddingLeft:2 }}>
              {selectedMount.special}
            </div>
          )}
        </div>
      )}
      {hasMagic && (
        <div>
          <span style={labelStyle}>Magic Item</span>
          <select value={selectedMagic?.id || ""} onChange={handleMagicChange} style={selStyle}>
            <option value="">— None —</option>
            {/* Standards */}
            {allMagic.filter(m => MAGIC_STANDARDS.some(s => s.id === m.id)).length > 0 && (
              <optgroup label="── Magic Standards ──">
                {allMagic.filter(m => MAGIC_STANDARDS.some(s => s.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} (+{m.cost}pts)</option>
                ))}
              </optgroup>
            )}
            {/* Weapons */}
            {allMagic.filter(m => MAGIC_WEAPONS.some(s => s.id === m.id)).length > 0 && (
              <optgroup label="── Magic Weapons ──">
                {allMagic.filter(m => MAGIC_WEAPONS.some(s => s.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} (+{m.cost}pts)</option>
                ))}
              </optgroup>
            )}
            {/* Devices */}
            {allMagic.filter(m => DEVICES_OF_POWER.some(s => s.id === m.id)).length > 0 && (
              <optgroup label="── Devices of Power ──">
                {allMagic.filter(m => DEVICES_OF_POWER.some(s => s.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} (+{m.cost}pts)</option>
                ))}
              </optgroup>
            )}
          </select>
          {selectedMagic && (
            <div style={{ fontSize:"0.93rem", lineHeight:1.4, marginTop:3, paddingLeft:2 }}>
              <span style={{ color:"#d4b060" }}>{selectedMagic.name}</span>
              {selectedMagic.restriction && <span style={{ color:"#665500" }}> [{selectedMagic.restriction}]</span>}
              <span style={{ color:"#888" }}> — {selectedMagic.desc}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ROSTER PANEL ───────────────────────────────────────────────────────────────
function RosterPanel({ army, roster, onRemove, onUpdate, onPrint, onClear, onReorder, totalPts }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const entryTotal = (entry) => {
    let t = typeof entry.unit.pts === "number" ? entry.unit.pts : 0;
    if (entry.mount) t += typeof entry.mount.pts === "number" ? entry.mount.pts : 0;
    if (entry.magicItem) t += entry.magicItem.cost || 0;
    return t;
  };
  const total = roster.reduce((s, e) => s + entryTotal(e), 0);
  const brackets = ptsToKBrackets(total);
  const warnings = validateRoster(roster, army, total);

  // Touch drag state
  const touchStartY = useRef(null);
  const touchDragIdx = useRef(null);

  function handleDragStart(idx) { setDragIdx(idx); }
  function handleDragOver(e, idx) { e.preventDefault(); setDragOverIdx(idx); }
  function handleDrop(idx) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    onReorder(dragIdx, idx);
    setDragIdx(null); setDragOverIdx(null);
    setExpandedIdx(null);
  }

  // Move up/down buttons for mobile
  function moveUp(idx) { if (idx > 0) { onReorder(idx, idx-1); setExpandedIdx(null); } }
  function moveDown(idx) { if (idx < roster.length-1) { onReorder(idx, idx+1); setExpandedIdx(null); } }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ padding:"10px 12px", borderBottom:`1px solid ${army.color}30`, background:"#0a0806", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"1.1rem", color:"#666", letterSpacing:1 }}>ROSTER</span>
          <div style={{ textAlign:"right" }}>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"1.2rem", color: army.accent, fontWeight:700 }}>{total}pts</span>
            <span style={{ fontSize:"0.78rem", color:"#555", marginLeft:6 }}>{brackets}k bracket</span>
          </div>
        </div>
        {/* Validation warnings */}
        {warnings.length > 0 && (
          <div style={{ marginBottom:6, padding:"4px 8px", background:"#1a0a00", border:"1px solid #6a3000", borderRadius:4 }}>
            {warnings.map((w,i) => (
              <div key={i} style={{ fontSize:"0.78rem", color:"#c07030" }}>⚠ {w}</div>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onPrint}
            style={{ flex:1, background: army.color+"30", color: army.accent, border:`1px solid ${army.color}60`, borderRadius:3, padding:"6px 0", fontSize:"0.93rem", fontFamily:"'Cinzel',serif", letterSpacing:1, cursor:"pointer" }}>
            🖨 PRINT CARDS
          </button>
          <button onClick={onClear}
            style={{ background:"#1a0a0a", color:"#883030", border:"1px solid #330a0a", borderRadius:3, padding:"6px 10px", fontSize:"0.93rem", cursor:"pointer" }}>
            ✕ CLEAR
          </button>
        </div>
      </div>

      {/* Entries */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {roster.length === 0 && (
          <div style={{ padding:20, color:"#444", fontSize:"0.97rem", fontStyle:"italic", textAlign:"center" }}>
            No units added yet.<br/>
            <span style={{ fontSize:"1.1rem" }}>Tap + next to any unit to add it.</span>
          </div>
        )}
        {roster.map((entry, idx) => {
          const isOpen = expandedIdx === idx;
          const pts = entryTotal(entry);
          const isCharacter = ["General","Hero","Wizard"].includes(entry.unit.type);
          const isDragging = dragIdx === idx;
          const isDragOver = dragOverIdx === idx;
          return (
            <div key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              style={{ borderBottom:"1px solid #111", opacity: isDragging ? 0.4 : 1, background: isDragOver ? army.color+"15" : "transparent", borderLeft: isDragOver ? `3px solid ${army.color}` : "3px solid transparent", transition:"all 0.1s" }}>
              {/* Row */}
              <div
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                style={{ padding:"8px 10px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", background: isOpen ? "#0f0d0a" : "transparent" }}
              >
                {/* Drag handle + move buttons */}
                <div style={{ display:"flex", flexDirection:"column", gap:1, marginRight:6, flexShrink:0, opacity:0.4 }}>
                  <button onClick={e => { e.stopPropagation(); moveUp(idx); }}
                    style={{ background:"none", color:"#888", fontSize:"0.7rem", padding:"0 2px", lineHeight:1, cursor: idx===0?"not-allowed":"pointer", opacity: idx===0?0.3:1 }}>▲</button>
                  <div style={{ fontSize:"0.6rem", color:"#555", textAlign:"center", cursor:"grab", lineHeight:1 }}>⠿</div>
                  <button onClick={e => { e.stopPropagation(); moveDown(idx); }}
                    style={{ background:"none", color:"#888", fontSize:"0.7rem", padding:"0 2px", lineHeight:1, cursor: idx===roster.length-1?"not-allowed":"pointer", opacity: idx===roster.length-1?0.3:1 }}>▼</button>
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontSize:"0.93rem", color:"#d4c8a8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {entry.unit.name}
                    {entry.mount && <span style={{ color: army.color, fontSize:"0.85rem" }}> + {entry.mount.name}</span>}
                  </div>
                  <div style={{ fontSize:"0.85rem", color:"#555", display:"flex", gap:4, flexWrap:"wrap", marginTop:1 }}>
                    <span style={{ color: army.accent+"cc" }}>{pts}pts</span>
                    <span>·</span>
                    <span>{entry.unit.type}</span>
                    {entry.magicItem && <span style={{ color:"#a08030" }}>✦ {entry.magicItem.name}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
                  <span style={{ fontSize:"0.65rem", color:"#444" }}>{isOpen ? "▲" : "▼"}</span>
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(idx); if (expandedIdx === idx) setExpandedIdx(null); }}
                    style={{ background:"transparent", color:"#553030", fontSize:"1.1rem", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", flexShrink:0, cursor:"pointer" }}>✕</button>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding:"0 12px 10px", background:"#0a0806", borderTop:"1px solid #1a1a1a" }}>
                  <RosterEntryEditor entry={entry} idx={idx} army={army} onUpdate={onUpdate} roster={roster} totalPts={totalPts} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PRINT VIEW ─────────────────────────────────────────────────────────────────
function PrintView({ army, roster, onClose }) {
  // Print options are now standardised — no user controls
  const printOpts = {
    layout: "portrait",
    colorMode: "faction",
    showImage: true,
    includeArmyRules: true,
    fontScale: 1.0,
  };

  const entryTotal = (entry) => {
    let t = typeof entry.unit.pts === "number" ? entry.unit.pts : 0;
    if (entry.mount) t += typeof entry.mount.pts === "number" ? entry.mount.pts : 0;
    if (entry.magicItem) t += entry.magicItem.cost || 0;
    return t;
  };
  const total = roster.reduce((s,e) => s + entryTotal(e), 0);

  // Dimensions per layout — real mm for accurate print sizing
  const baseLayouts = {
    portrait:  { w:"63mm",  h:"88mm",  label:"Portrait 2.5×3.5\"",  imgH:"28mm", baseFontPx:8.5 },
    landscape: { w:"88mm",  h:"63mm",  label:"Landscape 3.5×2.5\"", imgH:"0",    baseFontPx:8   },
    square:    { w:"63mm",  h:"63mm",  label:"Square 2.5×2.5\"",    imgH:"20mm", baseFontPx:7.5 },
  };
  const baseLay = baseLayouts[printOpts.layout];
  const scaledFontPx = Math.round(baseLay.baseFontPx * printOpts.fontScale * 10) / 10;
  // Card dimensions are FIXED mm — only font size scales with fontScale
  const scaleH = (mmStr) => mmStr;
  const lay = {
    ...baseLay,
    fontSize: `${scaledFontPx}px`,
    h: baseLay.h,
    imgH: baseLay.imgH,
  };

  // ── Colour scheme ─────────────────────────────────────────────────────────
  // "faction"   = full dark theme using army.bg + army.accent (screen-optimised)
  // "cardcolor" = mid-tone: faction-tinted dark card, white stat values (high contrast)
  // "white"     = pure white card, black text (best for printing)
  const mode = printOpts.colorMode;

  // Helper: blend two hex colours at given ratio (0=col1, 1=col2)
  function blendHex(hex1, hex2, t) {
    const p = s => parseInt(s, 16);
    const h = s => s.replace("#","");
    const [r1,g1,b1] = [p(h(hex1).slice(0,2)), p(h(hex1).slice(2,4)), p(h(hex1).slice(4,6))];
    const [r2,g2,b2] = [p(h(hex2).slice(0,2)), p(h(hex2).slice(2,4)), p(h(hex2).slice(4,6))];
    const r = Math.round(r1+(r2-r1)*t).toString(16).padStart(2,"0");
    const g = Math.round(g1+(g2-g1)*t).toString(16).padStart(2,"0");
    const b = Math.round(b1+(b2-b1)*t).toString(16).padStart(2,"0");
    return `#${r}${g}${b}`;
  }

  // Mid-tone bg: blend army.bg toward a slightly lighter shade for readability
  const midBg     = blendHex(army.bg || "#0a0806", "#1a1410", 0.7);
  const cardBg    = mode==="faction" ? (army.bg||"#0a0806") : mode==="cardcolor" ? midBg      : "#ffffff";
  const cardBorder= mode==="white"   ? "#444444"             : army.color;
  const cardText  = mode==="white"   ? "#111111"             : army.accent;
  // Muted text: faction=dim gold, cardcolor=bright white for contrast, white=dark grey
  const cardMuted = mode==="faction" ? "#999999" : mode==="cardcolor" ? "#dddddd" : "#555555";
  const statBg    = mode==="faction" ? "#00000040" : mode==="cardcolor" ? "#00000050" : "#f2f2f2";
  const statBorder= mode==="white"   ? "#cccccc" : army.color+"80";
  const divider   = mode==="white"   ? "#cccccc" : army.color+"60";
  const imgBg     = mode==="white"
    ? "linear-gradient(160deg,#e8e8e8,#d0d0d0)"
    : `linear-gradient(160deg, ${army.color}70, ${army.bg||"#0a0806"})`;
  const imgTextColor = mode==="white" ? "#aaaaaa" : army.accent;

  // ── ARMY RULES CARD ──────────────────────────────────────────────────────
  // ── SHARED CARD SHELL ──────────────────────────────────────────────────────
  // Every card: black 3mm outer (≈1/8in), 4mm corner radius, inner card with faction colour
  // imgOverlay: optional { top, left } stat overlays rendered inside the image area
  function CardShell({ children, imgUrl, imgFallbackIcon="⚔", accentColor, imgOverlay }) {
    const clr = accentColor || army.color;
    const borderUrl = IMAGES.factionBorders[army.key] || "";
    return (
      <div style={{
        width:"63mm", height:"88mm",
        background:"#000",
        borderRadius:"4mm",
        padding:"3mm",
        boxSizing:"border-box",
        pageBreakInside:"avoid", breakInside:"avoid",
        WebkitPrintColorAdjust:"exact", printColorAdjust:"exact",
        flexShrink:0,
      }}>
        <div style={{
          width:"100%", height:"100%",
          background: cardBg,
          borderRadius:"2mm",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          position:"relative",
          fontFamily:"'Cinzel',Georgia,serif",
          boxSizing:"border-box",
        }}>
          {/* Faction border overlay */}
          {borderUrl && (
            <div style={{
              position:"absolute", inset:0, zIndex:10, pointerEvents:"none",
              backgroundImage:`url(${borderUrl})`,
              backgroundSize:"100% 100%",
              backgroundRepeat:"no-repeat",
              opacity:0.6,
            }} />
          )}

          {/* ── 1:1 Image — top ~50% of inner card ── */}
          <div style={{
            width:"100%",
            flexShrink:0,
            position:"relative",
            overflow:"hidden",
            borderBottom:`1.5px solid ${cardBorder}`,
            height:"40mm",
          }}>
            {imgUrl ? (
              <img src={imgUrl} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }} />
            ) : (
              <div style={{
                width:"100%", height:"100%",
                background:`linear-gradient(160deg,${clr}55,${cardBg})`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <div style={{ fontSize:"28px", opacity:0.3 }}>{imgFallbackIcon}</div>
              </div>
            )}
            {/* Stat overlays inside the image */}
            {imgOverlay}
            {/* Faction accent bar at bottom of image */}
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              height:"2px",
              background:`linear-gradient(90deg,transparent,${clr},transparent)`,
            }} />
          </div>

          {/* Content area — passed as children */}
          {children}
        </div>
      </div>
    );
  }

  // ── BASE FONT SIZE (140% of original 8px = 11.2px) ──────────────────────
  function cardFs(mult=1) {
    const base = 11.2 * printOpts.fontScale;
    return `${Math.round(base * mult * 10)/10}px`;
  }

  // ── STAT BOX — scaled for 140% text, supports 'sm' size for overlays ──────
  function StatBox({ label, value, style={}, sm=false }) {
    const labelSz = sm ? cardFs(0.5)  : cardFs(0.6);
    const valueSz = sm ? cardFs(0.85) : cardFs(1.1);
    return (
      <div style={{
        textAlign:"center",
        background: sm ? "rgba(0,0,0,0.72)" : statBg,
        border: sm ? `1px solid rgba(255,255,255,0.25)` : `1.5px solid ${statBorder}`,
        borderRadius:"2px",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding: sm ? "0.8mm 1.2mm" : "1.5mm 1mm",
        backdropFilter: sm ? "blur(2px)" : "none",
        WebkitBackdropFilter: sm ? "blur(2px)" : "none",
        ...style,
      }}>
        <div style={{ fontSize:labelSz, color: sm ? "rgba(255,255,255,0.7)" : cardMuted, letterSpacing:"0.3px", lineHeight:1 }}>{label}</div>
        <div style={{ fontSize:valueSz, fontWeight:700, color: sm ? "#fff" : cardText, lineHeight:1.15 }}>{String(value ?? "-")}</div>
      </div>
    );
  }

  // ── UNIT CARD ─────────────────────────────────────────────────────────────
  function PrintCard({ entry }) {
    const u = entry.unit;
    const pts = entryTotal(entry);
    const imgUrl = IMAGES.units[u.id] || "";

    // Find special rules that apply to this unit
    const unitRules = (army.armyRules || []).filter(rule => {
      const rn = rule.name.toLowerCase().replace(/\(army rule\)/,'').trim();
      const un = u.name.toLowerCase();
      return un.includes(rn) || rn.includes(un) ||
        rn.split(/[\s,\/&]+/).some(w => w.length > 3 && un.includes(w));
    });

    // Stat overlays — rendered inside the image area
    const statOverlay = (
      <>
        {/* CMD / SZ / MIN / MAX — horizontal row across the TOP of the image */}
        <div style={{
          position:"absolute", top:"1.5mm", left:0, right:0,
          display:"flex", justifyContent:"flex-start",
          gap:"1mm", padding:"0 1.5mm",
          zIndex:5,
        }}>
          {[{k:"CMD",v:u.cmd},{k:"SZ",v:u.size},{k:"MIN",v:u.min},{k:"MAX",v:u.max}].map(({k,v}) =>
            <StatBox key={k} label={k} value={v} sm={true}
              style={{ minWidth:"9mm" }} />
          )}
        </div>

        {/* ATK / HITS / ARM — vertical column on the LEFT of the image */}
        <div style={{
          position:"absolute", top:"1.5mm", left:"1.5mm",
          display:"flex", flexDirection:"column",
          gap:"1mm",
          zIndex:5,
          marginTop:"8mm", /* push below the top row */
        }}>
          {[{k:"ATK",v:u.atk},{k:"HITS",v:u.hits},{k:"ARM",v:u.armour}].map(({k,v}) =>
            <StatBox key={k} label={k} value={v} sm={true}
              style={{ width:"11mm" }} />
          )}
        </div>
      </>
    );

    return (
      <CardShell imgUrl={imgUrl} imgFallbackIcon="⚔" imgOverlay={statOverlay}>
        {/* Name + pts */}
        <div style={{
          padding:"1.5mm 2.5mm 1mm",
          borderBottom:`1px solid ${divider}`,
          display:"flex", justifyContent:"space-between", alignItems:"baseline",
          flexShrink:0, background:`${cardBorder}18`,
        }}>
          <div>
            <div style={{ fontSize:cardFs(1.05), fontWeight:700, color:cardText, lineHeight:1.2 }}>{u.name}</div>
            <div style={{ fontSize:cardFs(0.68), color:cardMuted, letterSpacing:"0.8px", textTransform:"uppercase" }}>{u.type}</div>
          </div>
          <div style={{ fontSize:cardFs(1.05), fontWeight:700, color:cardText, flexShrink:0, marginLeft:"2mm" }}>{pts}pts</div>
        </div>

        {/* Special text + inline unit rules */}
        <div style={{ flex:1, padding:"1.5mm 2.5mm", overflow:"hidden" }}>
          {u.special && (
            <div style={{ fontSize:cardFs(0.78), color:cardMuted, lineHeight:1.5, fontFamily:"Georgia,serif" }}>
              {u.special}
            </div>
          )}
          {unitRules.map((r,i) => (
            <div key={i} style={{ fontSize:cardFs(0.72), color:army.color, lineHeight:1.4, marginTop:"0.8mm", fontFamily:"Georgia,serif" }}>
              <strong style={{ color:cardText }}>{r.name}:</strong> {r.desc}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:`${cardBorder}12`, flexShrink:0,
        }}>
          <div style={{ fontSize:cardFs(0.6), color:cardMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Warmaster Revolution</div>
          <div style={{ fontSize:cardFs(0.6), color:army.color, textTransform:"uppercase", letterSpacing:"0.4px", opacity:0.9 }}>{army.name}</div>
        </div>
      </CardShell>
    );
  }

  // ── MOUNT CARD ────────────────────────────────────────────────────────────
  function MountCard({ entry }) {
    const m = entry.mount;
    const imgUrl = IMAGES.units[m.id] || IMAGES.units[entry.unit.id] || "";
    return (
      <CardShell imgUrl={imgUrl} imgFallbackIcon="🐴" accentColor={army.color}>
        {/* Name bar */}
        <div style={{
          padding:"1.5mm 2.5mm 1mm",
          borderBottom:`1px solid ${divider}`,
          display:"flex", justifyContent:"space-between", alignItems:"baseline",
          flexShrink:0, background:`${cardBorder}18`,
        }}>
          <div>
            <div style={{ fontSize:cardFs(1.05), fontWeight:700, color:cardText, lineHeight:1.2 }}>{m.name}</div>
            <div style={{ fontSize:cardFs(0.68), color:cardMuted, letterSpacing:"0.8px", textTransform:"uppercase" }}>Mount · {entry.unit.name}</div>
          </div>
          {m.pts > 0 && <div style={{ fontSize:cardFs(1.0), fontWeight:700, color:cardText, flexShrink:0, marginLeft:"2mm" }}>{m.pts}pts</div>}
        </div>

        {/* Mount stats if available */}
        {(m.atk || m.hits || m.armour) && (
          <div style={{
            display:"flex", gap:"1.5px", padding:"1.5mm 1mm",
            borderBottom:`1px solid ${divider}`,
            flexShrink:0, height:"16mm",
          }}>
            {[{k:"ATK",v:m.atk},{k:"HITS",v:m.hits},{k:"ARM",v:m.armour}].filter(x=>x.v!=null).map(({k,v}) =>
              <StatBox key={k} label={k} value={v} style={{ flex:1, height:"100%" }} />
            )}
          </div>
        )}

        {/* Mount special rules */}
        <div style={{ flex:1, padding:"1.5mm 2.5mm", overflow:"hidden" }}>
          {m.special && (
            <div style={{ fontSize:cardFs(0.78), color:cardMuted, lineHeight:1.5, fontFamily:"Georgia,serif" }}>{m.special}</div>
          )}
          {!m.special && (
            <div style={{ fontSize:cardFs(0.78), color:cardMuted, opacity:0.5, fontFamily:"Georgia,serif" }}>No special rules.</div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:`${cardBorder}12`, flexShrink:0,
        }}>
          <div style={{ fontSize:cardFs(0.6), color:cardMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Mount</div>
          <div style={{ fontSize:cardFs(0.6), color:army.color, textTransform:"uppercase", letterSpacing:"0.4px", opacity:0.9 }}>{army.name}</div>
        </div>
      </CardShell>
    );
  }

  // ── MAGIC ITEM CARD ───────────────────────────────────────────────────────
  // ── MAGIC ITEM CARD (neutral colors — works across all factions) ────────
  function MagicItemCard({ mi }) {
    // neutral gold/parchment palette — not faction-coloured
    const miAccent  = "#c8a040";
    const miBg      = mode === "white" ? "#fdf6e3" : "#1a1508";
    const miBorder  = "#8a6820";
    const miText    = mode === "white" ? "#2a1a04" : "#f0d890";
    const miMuted   = mode === "white" ? "#6a4a10" : "#b89840";
    const catIcon   = { Weapon:"⚔", Device:"✦", Banner:"🏳" }[mi.category] || "✦";
    const imgUrl    = IMAGES.magicItems?.[mi.id] || "";

    // Name overlay on image — same pattern as other cards
    const nameOverlay = (
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:"linear-gradient(transparent, rgba(0,0,0,0.82))",
        padding:"6mm 2.5mm 2mm",
        zIndex:5,
      }}>
        <div style={{ fontSize:cardFs(1.08), fontWeight:700, color:"#fff", lineHeight:1.2, textShadow:"0 1px 3px #000" }}>
          {mi.name}
        </div>
      </div>
    );

    return (
      <div style={{
        width:"63mm", height:"88mm",
        background:"#000",
        borderRadius:"4mm",
        padding:"3mm",
        boxSizing:"border-box",
        pageBreakInside:"avoid", breakInside:"avoid",
        WebkitPrintColorAdjust:"exact", printColorAdjust:"exact",
        flexShrink:0,
      }}>
        <div style={{
          width:"100%", height:"100%",
          background: miBg,
          borderRadius:"2mm",
          display:"flex", flexDirection:"column",
          overflow:"hidden", position:"relative",
          fontFamily:"'Cinzel',Georgia,serif",
          boxSizing:"border-box",
          border:`1px solid ${miBorder}44`,
        }}>
          {/* Image + name overlay */}
          <div style={{ width:"100%", height:"40mm", flexShrink:0, position:"relative", overflow:"hidden", borderBottom:`1.5px solid ${miBorder}` }}>
            {imgUrl ? (
              <img src={imgUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }} />
            ) : (
              <div style={{ width:"100%", height:"100%", background:`linear-gradient(160deg,${miAccent}33,${miBg})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:"28px", opacity:0.35 }}>{catIcon}</div>
              </div>
            )}
            {nameOverlay}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${miAccent},transparent)` }} />
          </div>

          {/* Type badge row */}
          <div style={{
            padding:"1mm 2.5mm",
            borderBottom:`1px solid ${miBorder}44`,
            flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between",
            background:`${miAccent}11`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"1.5mm" }}>
              <div style={{ background:`${miAccent}22`, border:`1px solid ${miAccent}55`, borderRadius:"2px", padding:"0.5mm 2mm", fontSize:cardFs(0.65), color:miAccent, letterSpacing:"1px", textTransform:"uppercase" }}>
                {catIcon} {mi.category || "Magic Item"}
              </div>
            </div>
            <div style={{ fontSize:cardFs(0.88), fontWeight:700, color:miAccent }}>{mi.cost}pts</div>
          </div>

          {/* Equip restriction */}
          <div style={{ padding:"1mm 2.5mm", borderBottom:`1px solid ${miBorder}33`, flexShrink:0 }}>
            <div style={{ fontSize:cardFs(0.65), color:miMuted, fontStyle:"italic", lineHeight:1.4 }}>
              📋 {mi.restriction}
            </div>
          </div>

          {/* Description */}
          <div style={{ flex:1, padding:"1.5mm 2.5mm", overflow:"hidden" }}>
            <div style={{ fontSize:cardFs(0.78), color:miText, lineHeight:1.55, fontFamily:"Georgia,serif" }}>
              {mi.desc}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop:`1px solid ${miBorder}44`, padding:"1mm 2.5mm", display:"flex", justifyContent:"space-between", alignItems:"center", background:`${miAccent}0a`, flexShrink:0 }}>
            <div style={{ fontSize:cardFs(0.6), color:miMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Magic Item</div>
            <div style={{ fontSize:cardFs(0.6), color:miAccent, textTransform:"uppercase", letterSpacing:"0.4px" }}>Warmaster Revolution</div>
          </div>
        </div>
      </div>
    );
  }

    // ── SPECIAL RULE CARD (army-wide only — unit rules shown on unit card) ────
  // ── SPECIAL RULE CARD (army-wide only — unit rules shown on unit card) ────
  function SpecialRuleCard({ rule }) {
    const imgUrl = (() => {
      const rn = rule.name.toLowerCase().replace(/\(army rule\)/,'').trim().replace(/\s+/g,'_');
      const match = Object.entries(IMAGES.units || {}).find(([uid]) => uid.includes(rn));
      return match ? match[1] : "";
    })();

    // Name overlay on the image
    const nameOverlay = (
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:"linear-gradient(transparent, rgba(0,0,0,0.82))",
        padding:"6mm 2.5mm 2mm",
        zIndex:5,
      }}>
        <div style={{ fontSize:cardFs(1.08), fontWeight:700, color:"#fff", lineHeight:1.2, textShadow:"0 1px 3px #000" }}>
          {rule.name}
        </div>
      </div>
    );

    return (
      <CardShell imgUrl={imgUrl} imgFallbackIcon="📜" imgOverlay={nameOverlay}>
        {/* Type label row */}
        <div style={{
          padding:"1mm 2.5mm",
          borderBottom:`1px solid ${divider}`,
          flexShrink:0, background:`${cardBorder}18`,
          display:"flex", alignItems:"center",
        }}>
          <div style={{ fontSize:cardFs(0.68), color:army.color, textTransform:"uppercase", letterSpacing:"1px" }}>Special Rule</div>
        </div>

        {/* Description */}
        <div style={{ flex:1, padding:"1.5mm 2.5mm", overflow:"hidden" }}>
          <div style={{ fontSize:cardFs(0.82), color:cardMuted, lineHeight:1.55, fontFamily:"Georgia,serif" }}>
            {rule.desc}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:`${cardBorder}12`, flexShrink:0,
        }}>
          <div style={{ fontSize:cardFs(0.6), color:cardMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Special Rule</div>
          <div style={{ fontSize:cardFs(0.6), color:army.color, textTransform:"uppercase", letterSpacing:"0.4px", opacity:0.9 }}>{army.name}</div>
        </div>
      </CardShell>
    );
  }


  // ── SPELL CARD ────────────────────────────────────────────────────────────
  function SpellCard({ spell }) {
    const isBloodRite   = !!spell.bloodRite;
    const isInstability = !!spell.instability;
    const sKey   = spellKey(army.key || "", spell.name);
    const imgUrl = IMAGES.spells?.[sKey] || "";
    const label  = isBloodRite ? "⚔ Blood Rite" : isInstability ? "☠ Instability" : "✦ Spell";

    // Name overlay on image
    const nameOverlay = (
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:"linear-gradient(transparent, rgba(0,0,0,0.82))",
        padding:"6mm 2.5mm 2mm",
        zIndex:5,
      }}>
        <div style={{ fontSize:cardFs(1.08), fontWeight:700, color:"#fff", lineHeight:1.2, textShadow:"0 1px 3px #000" }}>
          {spell.name || spell.result}
        </div>
      </div>
    );

    return (
      <CardShell imgUrl={imgUrl} imgFallbackIcon="✨" accentColor={army.color} imgOverlay={nameOverlay}>
        {/* Type label row */}
        <div style={{
          padding:"1mm 2.5mm",
          borderBottom:`1px solid ${divider}`,
          flexShrink:0, background:`${cardBorder}18`,
          display:"flex", alignItems:"center",
        }}>
          <div style={{ fontSize:cardFs(0.68), color:army.color, textTransform:"uppercase", letterSpacing:"1px" }}>{label}</div>
        </div>

        {/* Cast / Range / Roll badges */}
        {(spell.cast || spell.range || spell.roll) && (
          <div style={{ display:"flex", gap:"1.5mm", padding:"1mm 2.5mm", borderBottom:`1px solid ${divider}`, flexShrink:0 }}>
            {spell.cast  && <StatBox label="CAST"  value={spell.cast}  style={{ flex:1, padding:"1mm" }} />}
            {spell.range && <StatBox label="RANGE" value={spell.range} style={{ flex:1, padding:"1mm" }} />}
            {spell.roll  && <StatBox label="ROLL"  value={spell.roll}  style={{ flex:1, padding:"1mm" }} />}
          </div>
        )}

        {/* Description */}
        <div style={{ flex:1, padding:"1.5mm 2.5mm", overflow:"hidden" }}>
          <div style={{ fontSize:cardFs(0.82), color:cardMuted, lineHeight:1.55, fontFamily:"Georgia,serif" }}>
            {spell.desc || spell.effect}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:`${cardBorder}12`, flexShrink:0,
        }}>
          <div style={{ fontSize:cardFs(0.6), color:cardMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Warmaster Revolution</div>
          <div style={{ fontSize:cardFs(0.6), color:army.color, textTransform:"uppercase", letterSpacing:"0.4px", opacity:0.9 }}>{army.name}</div>
        </div>
      </CardShell>
    );
  }


  return (
    <div style={{ background: mode==="white" ? "#e8e8e8" : "#111111", minHeight:"100vh" }} id="print-root">
      <GS />
      {/* Screen toolbar — hidden when printing */}
      <div className="no-print" style={{
        position:"sticky", top:0, zIndex:200,
        background:"#0d0b08", borderBottom:`2px solid ${army.color}60`,
        padding:"10px 14px", display:"flex", alignItems:"center", gap:10,
      }}>
        <button onClick={onClose}
          style={{ background:"none", border:`1px solid ${army.color}60`, color: army.color, borderRadius:5, padding:"7px 14px", fontSize:"0.95rem", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>
          ← BACK
        </button>
        <div style={{ flex:1, fontFamily:"'Cinzel',serif", color: army.accent, textAlign:"center", letterSpacing:2, fontSize:"0.9rem" }}>
          {army.name.toUpperCase()} — {total}pts — {roster.length} cards
        </div>

        <button onClick={() => window.print()}
          style={{ background:`linear-gradient(135deg,${army.color},${army.color}99)`, border:"none", color:"#fff", borderRadius:5, padding:"7px 16px", fontSize:"0.95rem", cursor:"pointer", fontFamily:"'Cinzel',serif", fontWeight:700 }}>
          🖨 PRINT
        </button>
      </div>

      {/* Cards — shown on screen + printed */}
      {(() => {
        const spellItems = [];
        if (army.spells && Array.isArray(army.spells)) army.spells.forEach(s => spellItems.push(s));
        if (army.bloodRites && Array.isArray(army.bloodRites)) army.bloodRites.forEach(s => spellItems.push({...s, bloodRite:true}));
        if (army.instabilityTable && Array.isArray(army.instabilityTable))
          army.instabilityTable.forEach(s => spellItems.push({...s, instability:true}));
        return (
          <div className="print-area" style={{ padding:"12px", display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"flex-start" }}>
            {/* Special rule cards removed — all rules displayed on unit cards */}

            {/* Spell cards */}
            {spellItems.map((spell, i) => (
              <SpellCard key={`spell-${i}`} spell={spell} />
            ))}

            {/* Unit cards */}
            {roster.map((entry, idx) => (
              <PrintCard key={`unit-${idx}`} entry={entry} />
            ))}

            {/* Mount cards — one per entry that has a mount */}
            {roster.filter(e => e.mount).map((entry, idx) => (
              <MountCard key={`mount-${idx}`} entry={entry} />
            ))}

            {/* Magic item cards — one per entry that has a magic item */}
            {roster.filter(e => e.magicItem).map((entry, idx) => (
              <MagicItemCard key={`mi-${idx}`} mi={entry.magicItem} />
            ))}
          </div>
        );
      })()}

      {/* Print CSS — injected into page */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { display: flex !important; flex-wrap: wrap !important; }
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body, .pv-root {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            overflow: visible !important;
          }
          @page { size: auto; margin: 6mm; }
        }
        /* Always show cards on screen */
        .print-area { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; justify-content: flex-start; }
      `}</style>
    </div>
  );
}


// Storage handled via Supabase in App component (see useSession hook)

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, onGuest }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit() {
    setError(""); setInfo("");
    if (!email.trim() || !password.trim()) { setError("Enter your email and password."); return; }
    setLoading(true);
    try {
      let data;
      if (mode === "signup") {
        data = await sb.signUp(email.trim(), password);
        if (data.error || data.msg) { setError(data.error?.message || data.msg || "Signup failed."); setLoading(false); return; }
        setInfo("Account created! Check your email to confirm, then log in.");
        setMode("login"); setLoading(false); return;
      } else {
        data = await sb.signIn(email.trim(), password);
        if (data.error || !data.access_token) { setError(data.error_description || data.error?.message || "Login failed. Check your details."); setLoading(false); return; }
        saveSession({ access_token: data.access_token, user_id: data.user?.id, email: data.user?.email });
        onAuth({ access_token: data.access_token, user_id: data.user?.id, email: data.user?.email });
      }
    } catch(e) {
      setError("Network error. Check your connection.");
    }
    setLoading(false);
  }

  const inputStyle = {
    width:"100%", background:"#0a0806", border:"1px solid #444", color:"#d4c8a8",
    borderRadius:6, padding:"10px 12px", fontSize:"1rem", outline:"none",
    fontFamily:"Georgia,serif", boxSizing:"border-box",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0806", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <GS />
      <div style={{ width:"100%", maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:8 }}>⚔</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.4rem", color:"#f0c040", letterSpacing:3, margin:0 }}>WARMASTER</h1>
          <p style={{ color:"#555", fontSize:"0.85rem", marginTop:4, letterSpacing:2 }}>REVOLUTION · ARMY ROSTER</p>
        </div>

        {/* Card */}
        <div style={{ background:"#0d0b08", border:"1px solid #333", borderRadius:10, padding:28 }}>
          {/* Tab switcher */}
          <div style={{ display:"flex", background:"#0a0806", borderRadius:6, padding:3, marginBottom:24, border:"1px solid #222" }}>
            {[["login","LOG IN"],["signup","SIGN UP"]].map(([m,label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setInfo(""); }}
                style={{ flex:1, padding:"8px", borderRadius:4, border:"none", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:"0.82rem", letterSpacing:1, transition:"all 0.15s",
                  background: mode===m ? "#f0c040" : "transparent",
                  color: mode===m ? "#111" : "#666",
                  fontWeight: mode===m ? 700 : 400,
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ fontSize:"0.75rem", color:"#666", fontFamily:"'Cinzel',serif", letterSpacing:1, display:"block", marginBottom:4 }}>EMAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                placeholder="your@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize:"0.75rem", color:"#666", fontFamily:"'Cinzel',serif", letterSpacing:1, display:"block", marginBottom:4 }}>PASSWORD</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                placeholder={mode==="signup" ? "Min. 6 characters" : "••••••••"} style={inputStyle} />
            </div>
          </div>

          {/* Error / info */}
          {error && <div style={{ marginTop:12, padding:"8px 12px", background:"#1a0500", border:"1px solid #6a1500", borderRadius:5, fontSize:"0.82rem", color:"#ff7060" }}>{error}</div>}
          {info  && <div style={{ marginTop:12, padding:"8px 12px", background:"#001a05", border:"1px solid #006a15", borderRadius:5, fontSize:"0.82rem", color:"#60c070" }}>{info}</div>}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ marginTop:20, width:"100%", padding:"12px", background:"linear-gradient(135deg,#c8940a,#f0c040)", border:"none", borderRadius:6, fontFamily:"'Cinzel',serif", fontSize:"1rem", fontWeight:700, letterSpacing:1, color:"#111", cursor: loading?"not-allowed":"pointer", opacity: loading?0.7:1 }}>
            {loading ? "..." : mode==="login" ? "LOG IN" : "CREATE ACCOUNT"}
          </button>

          {mode==="login" && (
            <p style={{ textAlign:"center", fontSize:"0.72rem", color:"#444", marginTop:12 }}>
              Your lists sync across all your devices
            </p>
          )}
        </div>

        {/* Guest option */}
        <div style={{ marginTop:16, textAlign:"center" }}>
          <button onClick={onGuest}
            style={{ background:"none", border:"none", color:"#444", fontSize:"0.82rem", cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:1, padding:"8px 16px", borderRadius:5, transition:"color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color="#888"}
            onMouseLeave={e => e.currentTarget.style.color="#444"}
          >
            CONTINUE AS GUEST
          </button>
          <p style={{ color:"#333", fontSize:"0.7rem", marginTop:4, lineHeight:1.5 }}>
            Army lists will not be saved between sessions
          </p>
        </div>

      </div>
    </div>
  );
}

// ── SHARE MODAL ───────────────────────────────────────────────────────────────
function ShareModal({ army, roster, totalPts, armyKey, onClose }) {
  const [copied, setCopied] = useState(false);

  // Encode roster as compact JSON → base64 → URL param
  function buildShareUrl() {
    const data = {
      a: armyKey,
      r: roster.map(e => ({
        id: e.unit.id,
        mi: e.magicItem ? e.magicItem.id : null,
        mt: e.mount ? e.mount.id : null,
      })),
    };
    const json = JSON.stringify(data);
    const b64 = btoa(encodeURIComponent(json));
    const base = window.location.origin + window.location.pathname;
    return `${base}?share=${b64}`;
  }

  const shareUrl = buildShareUrl();

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // Fallback: select the text input
      document.getElementById("share-url-input")?.select();
    });
  }

  const entryTotal = (e) => {
    let t = typeof e.unit.pts === "number" ? e.unit.pts : 0;
    if (e.mount) t += e.mount.pts || 0;
    if (e.magicItem) t += e.magicItem.cost || 0;
    return t;
  };
  const total = roster.reduce((s,e) => s + entryTotal(e), 0);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#0d0b08", border:`1px solid ${army?.color||"#444"}60`, borderRadius:10, padding:24, width:"100%", maxWidth:420 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <h3 style={{ fontFamily:"'Cinzel',serif", color: army?.accent||"#f0c040", fontSize:"1rem", letterSpacing:1, margin:0 }}>🔗 SHARE ARMY LIST</h3>
            <p style={{ fontSize:"0.75rem", color:"#555", marginTop:4 }}>{army?.name} · {roster.length} units · {total}pts</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:"1.2rem", cursor:"pointer", padding:4 }}>✕</button>
        </div>

        {/* Roster summary */}
        <div style={{ background:"#0a0806", border:`1px solid ${army?.color||"#333"}30`, borderRadius:6, padding:"10px 12px", marginBottom:16, maxHeight:140, overflowY:"auto" }}>
          {roster.map((e,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem", color:"#888", padding:"2px 0", borderBottom: i < roster.length-1 ? "1px solid #111" : "none" }}>
              <span style={{ color:"#bbb" }}>{e.unit.name}{e.mount ? ` + ${e.mount.name}` : ""}</span>
              <span style={{ color: army?.accent||"#f0c040" }}>{entryTotal(e)}pts</span>
            </div>
          ))}
        </div>

        {/* URL box */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:"0.72rem", color:"#555", fontFamily:"'Cinzel',serif", letterSpacing:1, marginBottom:6 }}>SHAREABLE LINK</div>
          <div style={{ display:"flex", gap:8 }}>
            <input id="share-url-input" readOnly value={shareUrl}
              onClick={e => e.target.select()}
              style={{ flex:1, background:"#070504", border:`1px solid ${army?.color||"#333"}40`, color:"#777", borderRadius:5, padding:"8px 10px", fontSize:"0.72rem", outline:"none", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
            />
            <button onClick={handleCopy}
              style={{ background: copied ? "#1a4a1a" : army?.color+"30", border:`1px solid ${copied ? "#2a6a2a" : army?.color+"60"}`, color: copied ? "#60c060" : army?.accent||"#f0c040", borderRadius:5, padding:"8px 14px", fontSize:"0.82rem", cursor:"pointer", fontFamily:"'Cinzel',serif", fontWeight:700, whiteSpace:"nowrap", transition:"all 0.2s" }}>
              {copied ? "✓ COPIED!" : "COPY"}
            </button>
          </div>
        </div>

        {/* Info note */}
        <p style={{ fontSize:"0.72rem", color:"#444", lineHeight:1.5, margin:0 }}>
          Anyone with this link can view your army list. The list is encoded in the URL — no account needed to view.
          Magic items and mounts are included. Send it via message, post it in a forum, or share it with your opponent before a game.
        </p>
      </div>
    </div>
  );
}


// ── SAVE MODAL ────────────────────────────────────────────────────────────────
function SaveModal({ army, roster, totalPts, onSave, onClose, session }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const entryTotal = (entry) => {
    let t = typeof entry.unit.pts === "number" ? entry.unit.pts : 0;
    if (entry.mount) t += typeof entry.mount.pts === "number" ? entry.mount.pts : 0;
    if (entry.magicItem) t += entry.magicItem.cost || 0;
    return t;
  };
  const total = roster.reduce((s,e) => s + entryTotal(e), 0);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Enter a name for this list."); return; }
    setSaving(true);
    try {
      const armyKey = Object.keys(ARMIES).find(k => ARMIES[k] === army) || "";
      const listData = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        user_id: session.user_id,
        name: trimmed,
        army_key: armyKey,
        army_name: army?.name || "",
        roster: roster,
        total_pts: total,
        updated_at: new Date().toISOString(),
      };
      const result = await sb.saveList(session.access_token, listData);
      if (result?.error || (Array.isArray(result) && result[0]?.message)) {
        throw new Error(result?.message || "Save failed");
      }
      onSave(listData);
    } catch(e) {
      setError("Save failed: " + e.message);
    }
    setSaving(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#0d0b08", border:`1px solid ${army?.color||"#444"}60`, borderRadius:8, padding:24, width:"100%", maxWidth:340 }}>
        <h3 style={{ fontFamily:"'Cinzel',serif", color: army?.accent||"#f0c040", fontSize:"1rem", letterSpacing:1, marginBottom:4 }}>SAVE ARMY LIST</h3>
        <p style={{ fontSize:"0.78rem", color:"#555", marginBottom:16 }}>{army?.name} · {roster.length} units · {total}pts</p>
        <input value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleSave()}
          placeholder="List name e.g. 'Tournament 2000pts'"
          style={{ width:"100%", background:"#0a0806", border:`1px solid ${army?.color||"#444"}60`, color:"#d4c8a8", borderRadius:5, padding:"9px 12px", fontSize:"0.95rem", outline:"none", boxSizing:"border-box", fontFamily:"Georgia,serif" }} />
        {error && <div style={{ marginTop:8, fontSize:"0.78rem", color:"#ff6050" }}>{error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:16 }}>
          <button onClick={onClose} style={{ flex:1, padding:"9px", background:"none", border:"1px solid #333", color:"#666", borderRadius:5, cursor:"pointer", fontFamily:"'Cinzel',serif" }}>CANCEL</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:2, padding:"9px", background:`linear-gradient(135deg,${army?.color||"#888"},${army?.color||"#888"}99)`, border:"none", color:"#fff", borderRadius:5, cursor: saving?"not-allowed":"pointer", fontFamily:"'Cinzel',serif", fontWeight:700, opacity: saving?0.7:1 }}>
            {saving ? "SAVING…" : "💾 SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SAVED LISTS SCREEN ────────────────────────────────────────────────────────
function SavedLists({ onBack, onLoad, session }) {
  const [lists, setLists] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    sb.getLists(session.access_token)
      .then(data => {
        if (Array.isArray(data)) setLists(data);
        else { setError("Could not load lists."); setLists([]); }
      })
      .catch(() => { setError("Network error."); setLists([]); });
  }, []);

  async function handleDelete(id) {
    setDeleting(id);
    await sb.deleteList(session.access_token, id);
    setLists(l => l.filter(x => x.id !== id));
    setDeleting(null);
  }

  function handleLoad(list) {
    const army = ARMIES[list.army_key];
    if (!army) { setError(`Army "${list.army_name}" not found.`); return; }
    onLoad({ armyKey: list.army_key, roster: list.roster || [] });
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0a0806", padding:16 }}>
      <GS />
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={onBack} style={{ background:"none", border:"1px solid #333", color:"#888", borderRadius:5, padding:"7px 14px", fontSize:"0.9rem", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>← BACK</button>
          <h2 style={{ fontFamily:"'Cinzel',serif", color:"#f0c040", fontSize:"1.1rem", letterSpacing:2, flex:1, margin:0 }}>SAVED LISTS</h2>
          <span style={{ fontSize:"0.75rem", color:"#444" }}>{session.email}</span>
        </div>

        {error && <div style={{ padding:"8px 12px", background:"#1a0500", border:"1px solid #6a1500", borderRadius:5, fontSize:"0.82rem", color:"#ff7060", marginBottom:12 }}>{error}</div>}

        {lists === null && <div style={{ color:"#444", textAlign:"center", padding:40, fontSize:"0.9rem" }}>Loading…</div>}
        {lists !== null && lists.length === 0 && <div style={{ color:"#444", textAlign:"center", padding:40, fontSize:"0.9rem", fontStyle:"italic" }}>No saved lists yet.</div>}

        {lists !== null && lists.map(list => {
          const army = ARMIES[list.army_key];
          const color = army?.color || "#888";
          const accent = army?.accent || "#f0c040";
          return (
            <div key={list.id} style={{ background:"#0d0b08", border:`1px solid ${color}40`, borderRadius:8, padding:"12px 14px", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Cinzel',serif", color: accent, fontSize:"0.95rem", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{list.name}</div>
                <div style={{ fontSize:"0.75rem", color:"#555", marginTop:2 }}>
                  {list.army_name} · {list.total_pts}pts · {Array.isArray(list.roster)?list.roster.length:0} units
                </div>
                <div style={{ fontSize:"0.68rem", color:"#333", marginTop:1 }}>
                  {list.updated_at ? new Date(list.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => handleLoad(list)}
                  style={{ background: color+"30", border:`1px solid ${color}60`, color: accent, borderRadius:5, padding:"7px 14px", fontSize:"0.82rem", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>
                  LOAD
                </button>
                <button onClick={() => handleDelete(list.id)} disabled={deleting===list.id}
                  style={{ background:"#1a0505", border:"1px solid #4a1010", color:"#884040", borderRadius:5, padding:"7px 10px", fontSize:"0.82rem", cursor:"pointer", opacity: deleting===list.id?0.5:1 }}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
// ── MAGIC ITEMS PRINT VIEW ────────────────────────────────────────────────────
function MagicItemsPrintView({ onClose }) {
  const allItems = [...MAGIC_STANDARDS, ...MAGIC_WEAPONS, ...DEVICES_OF_POWER];
  const mode = "faction"; // dark mode for magic items

  return (
    <div className="pv-root" style={{ background:"#111", minHeight:"100vh" }}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; color-adjust:exact !important; }
          html, body, .pv-root { margin:0 !important; padding:0 !important; background:#ffffff !important; height:auto !important; overflow:visible !important; }
          @page { margin:6mm; }
        }
        .mi-print-area { display:flex; flex-wrap:wrap; gap:8px; padding:12px; justify-content:flex-start; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{
        position:"sticky", top:0, zIndex:200,
        background:"#0d0b08", borderBottom:"2px solid #c8a04060",
        padding:"10px 14px", display:"flex", alignItems:"center", gap:10,
      }}>
        <button onClick={onClose}
          style={{ background:"none", border:"1px solid #c8a04060", color:"#c8a040", borderRadius:5, padding:"7px 14px", fontSize:"0.95rem", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>
          ← BACK
        </button>
        <div style={{ flex:1, fontFamily:"'Cinzel',serif", color:"#c8a040", textAlign:"center", letterSpacing:2, fontSize:"0.9rem" }}>
          ✦ MAGIC ITEMS — {allItems.length} cards
        </div>
        <button onClick={() => window.print()}
          style={{ background:"linear-gradient(135deg,#c8a040,#c8a04099)", border:"none", color:"#111", borderRadius:5, padding:"7px 16px", fontSize:"0.95rem", cursor:"pointer", fontFamily:"'Cinzel',serif", fontWeight:700 }}>
          🖨 PRINT
        </button>
      </div>

      {/* Cards */}
      <div className="mi-print-area">
        {allItems.map((mi, i) => (
          <MagicItemStandaloneCard key={i} mi={mi} />
        ))}
      </div>
    </div>
  );
}

// Standalone version of MagicItemCard that doesn't need PrintView context
function MagicItemStandaloneCard({ mi }) {
  const miAccent = "#c8a040";
  const miBg     = "#1a1508";
  const miBorder = "#8a6820";
  const miText   = "#f0d890";
  const miMuted  = "#b89840";
  const catIcon  = { Weapon:"⚔", Device:"✦", Banner:"🏳" }[mi.category] || "✦";
  const imgUrl   = (typeof IMAGES !== "undefined" && IMAGES.magicItems?.[mi.id]) || "";
  const fs = (m=1) => `${Math.round(11.2 * m * 10)/10}px`;

  return (
    <div style={{
      width:"63mm", height:"88mm",
      background:"#000", borderRadius:"4mm", padding:"3mm",
      boxSizing:"border-box", pageBreakInside:"avoid", breakInside:"avoid",
      WebkitPrintColorAdjust:"exact", printColorAdjust:"exact", flexShrink:0,
    }}>
      <div style={{
        width:"100%", height:"100%",
        background:miBg, borderRadius:"2mm",
        display:"flex", flexDirection:"column",
        overflow:"hidden", position:"relative",
        fontFamily:"'Cinzel',Georgia,serif", boxSizing:"border-box",
        border:`1px solid ${miBorder}44`,
      }}>
        {/* Image + name overlay */}
        <div style={{ width:"100%", height:"40mm", flexShrink:0, position:"relative", overflow:"hidden", borderBottom:`1.5px solid ${miBorder}` }}>
          {imgUrl ? (
            <img src={imgUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          ) : (
            <div style={{ width:"100%", height:"100%", background:`linear-gradient(160deg,${miAccent}33,${miBg})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:"28px", opacity:0.35 }}>{catIcon}</div>
            </div>
          )}
          {/* Name gradient overlay */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(0,0,0,0.82))", padding:"6mm 2.5mm 2mm", zIndex:5 }}>
            <div style={{ fontSize:fs(1.08), fontWeight:700, color:"#fff", lineHeight:1.2, textShadow:"0 1px 3px #000" }}>{mi.name}</div>
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${miAccent},transparent)` }} />
        </div>

        {/* Category + cost */}
        <div style={{ padding:"1mm 2.5mm", borderBottom:`1px solid ${miBorder}44`, flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"center", background:`${miAccent}11` }}>
          <div style={{ background:`${miAccent}22`, border:`1px solid ${miAccent}55`, borderRadius:"2px", padding:"0.5mm 2mm", fontSize:fs(0.65), color:miAccent, letterSpacing:"1px", textTransform:"uppercase" }}>
            {catIcon} {mi.category || "Magic Item"}
          </div>
          <div style={{ fontSize:fs(0.88), fontWeight:700, color:miAccent }}>{mi.cost}pts</div>
        </div>

        {/* Restriction */}
        <div style={{ padding:"1mm 2.5mm", borderBottom:`1px solid ${miBorder}33`, flexShrink:0 }}>
          <div style={{ fontSize:fs(0.65), color:miMuted, fontStyle:"italic", lineHeight:1.4 }}>📋 {mi.restriction}</div>
        </div>

        {/* Description */}
        <div style={{ flex:1, padding:"1.5mm 2.5mm", overflow:"hidden" }}>
          <div style={{ fontSize:fs(0.78), color:miText, lineHeight:1.55, fontFamily:"Georgia,serif" }}>{mi.desc}</div>
        </div>

        {/* Footer */}
        <div style={{ borderTop:`1px solid ${miBorder}44`, padding:"1mm 2.5mm", display:"flex", justifyContent:"space-between", background:`${miAccent}0a`, flexShrink:0 }}>
          <div style={{ fontSize:fs(0.6), color:miMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Magic Item</div>
          <div style={{ fontSize:fs(0.6), color:miAccent, textTransform:"uppercase", letterSpacing:"0.4px" }}>Warmaster Revolution</div>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [screen, setScreen] = useState("factions");
  const [selectedArmy, setSelectedArmy] = useState(null);
  const [previewArmy, setPreviewArmy] = useState(null);
  const [roster, setRoster] = useState([]);
  const [howToPlay, setHowToPlay] = useState(false);
  const [savedListsOpen, setSavedListsOpen] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [session, setSession] = useState(() => loadSession());
  const [sharedView, setSharedView] = useState(false);

  // Decode shared roster from URL on first load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const shareParam = params.get("share");
      if (shareParam) {
        const json = decodeURIComponent(atob(shareParam));
        const data = JSON.parse(json);
        const army = ARMIES[data.a];
        if (army && Array.isArray(data.r)) {
          const decoded = data.r.map(entry => {
            const unit = army.units.find(u => u.id === entry.id);
            if (!unit) return null;
            const magicItem = entry.mi
              ? (MAGIC_ITEMS || []).find(m => m.id === entry.mi) || null
              : null;
            const mount = entry.mt
              ? (army.units.find(u => u.id === entry.mt) || null)
              : null;
            return { unit, magicItem, mount };
          }).filter(Boolean);
          setSelectedArmy(data.a);
          setRoster(decoded);
          setScreen("builder");
          setSharedView(true);
          // Clean URL without reloading
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    } catch(e) {
      console.warn("Share URL decode failed:", e);
    }
  }, []);

  const army = selectedArmy ? ARMIES[selectedArmy] : null;
  if (army && !army.key) army.key = selectedArmy;

  // ── Auth handlers ──
  function handleAuth(sess) {
    setSession(sess);
    saveSession(sess);
  }

  function handleGuest() {
    setSession({ guest: true });
    // Don't persist — guest session dies on refresh intentionally
  }

  async function handleLogout() {
    if (session?.access_token) {
      try { await sb.signOut(session.access_token); } catch {}
    }
    saveSession(null);
    setSession(null);
    setScreen("factions");
    setSelectedArmy(null);
    setRoster([]);
  }

  // ── Roster handlers ──
  function handlePreview(key) {
    if (key === "magic_items") { setScreen("magic_items"); return; }
    setPreviewArmy(key);
  }
  function handleConfirm() { setSelectedArmy(previewArmy); setRoster([]); setPreviewArmy(null); setScreen("builder"); }
  function handleBack() { setPreviewArmy(null); setScreen("factions"); }
  function handleAddUnit(unit) {
    // Enforce only 1 General per army
    if (unit.type === "General") {
      setRoster(r => {
        if (r.some(e => e.unit.type === "General")) return r; // already have one
        return [...r, { unit, count: 1, magicItem: null, mount: null }];
      });
    } else {
      setRoster(r => [...r, { unit, count: unit.size !== "-" ? unit.size : 1, magicItem: null, mount: null }]);
    }
  }
  function handleUpdateEntry(idx, changes) { setRoster(r => r.map((e, i) => i === idx ? { ...e, ...changes } : e)); }
  function handleRemoveEntry(idx) { setRoster(r => r.filter((_, i) => i !== idx)); }
  function handleReorderEntry(fromIdx, toIdx) {
    setRoster(r => {
      const next = [...r];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }
  function handleLoadList(list) {
    const a = ARMIES[list.armyKey];
    if (!a) return;
    setSelectedArmy(list.armyKey);
    setRoster(list.roster || []);
    setSavedListsOpen(false);
    setScreen("builder");
  }
  function handleSaved() { setSaveModal(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2500); }

  const totalPts = roster.reduce((sum, e) => {
    const base = typeof e.unit.pts === "number" ? e.unit.pts : 0;
    const magic = e.magicItem ? (e.magicItem.cost || 0) : 0;
    const mount = e.mount ? (e.mount.pts || 0) : 0;
    return sum + base + magic + mount;
  }, 0);

  // ── Gate on auth ──
  if (!session) return <AuthScreen onAuth={handleAuth} onGuest={handleGuest} />;

  // ── Sub-screens ──
  if (howToPlay) return <><GS /><HowToPlay onBack={() => setHowToPlay(false)} /></>;
  if (savedListsOpen && !session?.guest) return <><GS /><SavedLists onBack={() => setSavedListsOpen(false)} onLoad={handleLoadList} session={session} /></>;
  if (previewArmy && ARMIES[previewArmy]) return <><GS /><ArmyConfirm armyKey={previewArmy} onConfirm={handleConfirm} onBack={handleBack} /></>;
  if (screen === "magic_items") return <><GS /><MagicItemsPrintView onClose={() => setScreen("factions")} /></>;
  if (screen === "factions" || !army) {
    return (
      <>
        <GS />
        <FactionSelector
          onPreview={handlePreview}
          onHowToPlay={() => setHowToPlay(true)}
          onSavedLists={() => setSavedListsOpen(true)}
          session={session}
          onLogout={handleLogout}
          isGuest={!!session?.guest}
        />
      </>
    );
  }
  if (screen === "print" && army) return <><GS /><PrintView army={army} roster={roster} onClose={() => setScreen("builder")} /></>;

  // ── Builder ──
  return (
    <>
      <GS />
      {shareModal && <ShareModal army={army} roster={roster} totalPts={totalPts} armyKey={selectedArmy} onClose={() => setShareModal(false)} />}
      {saveModal && <SaveModal army={army} roster={roster} totalPts={totalPts} onSave={handleSaved} onClose={() => setSaveModal(false)} session={session} />}
      <div style={{ minHeight:"100vh", background: army.bg || "#050505", paddingBottom:40 }}>
        <div style={{ position:"sticky", top:0, zIndex:100, background: army.bg || "#050505", borderBottom:`1px solid ${army.color}40`, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => { setScreen("factions"); setSelectedArmy(null); setRoster([]); setSharedView(false); }}
            style={{ background:"none", border:`1px solid ${army.color}40`, color: army.color, borderRadius:4, padding:"4px 10px", fontSize:"1rem", fontFamily:"'Cinzel',serif", cursor:"pointer", letterSpacing:1 }}>
            ← ARMIES
          </button>
          {sharedView && (
            <div style={{ background: army.color+"25", border:`1px solid ${army.color}50`, borderRadius:4, padding:"3px 8px", fontSize:"0.72rem", color: army.accent, fontFamily:"'Cinzel',serif", letterSpacing:1 }}>
              👁 SHARED LIST
            </div>
          )}
          <div style={{ flex:1, fontFamily:"'Cinzel',serif", fontSize:"1rem", color: army.accent, letterSpacing:2, textAlign:"center" }}>
            {army.name.toUpperCase()}
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {roster.length > 0 && !session?.guest && (
              <button onClick={() => setSaveModal(true)}
                style={{ background:"none", border:`1px solid ${army.color}50`, color: saveSuccess ? "#50c050" : army.color, borderRadius:4, padding:"4px 8px", fontSize:"0.9rem", fontFamily:"'Cinzel',serif", cursor:"pointer", letterSpacing:1 }}>
                {saveSuccess ? "✓ SAVED" : "💾 SAVE"}
              </button>
            )}
            {roster.length > 0 && (
              <button onClick={() => setShareModal(true)}
                style={{ background:"none", border:`1px solid ${army.color}50`, color: army.color, borderRadius:4, padding:"4px 8px", fontSize:"0.9rem", fontFamily:"'Cinzel',serif", cursor:"pointer", letterSpacing:1 }}>
                🔗 SHARE
              </button>
            )}
            {roster.length > 0 && (
              <button onClick={() => setScreen("print")}
                style={{ background:"none", border:`1px solid ${army.color}50`, color: army.color, borderRadius:4, padding:"4px 8px", fontSize:"0.9rem", fontFamily:"'Cinzel',serif", cursor:"pointer", letterSpacing:1 }}>
                🖨 PRINT
              </button>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:0, minHeight:"calc(100vh - 50px)" }}>
          <div style={{ width:"40%", maxWidth:200, borderRight:`1px solid ${army.color}20`, overflowY:"auto" }}>
            <UnitList army={army} armyKey={selectedArmy} roster={roster} onAddUnit={handleAddUnit} />
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            <RosterPanel army={army} roster={roster} onUpdate={handleUpdateEntry} onRemove={handleRemoveEntry} totalPts={totalPts}
              onPrint={() => setScreen("print")}
              onClear={() => setRoster([])}
              onReorder={handleReorderEntry}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;