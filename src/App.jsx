import { useState, useRef, useEffect, useCallback } from "react";

// ── INLINE SVG ICON SET ──────────────────────────────────────────────────────
// Tiny inline SVGs for card text — crisp at any print size.
// Usage: <Icon.terror size={12} /> or {Icon.terror()} in JSX
const _I = (paths, vb="0 0 24 24") => ({ size=12, color="currentColor", style={} } = {}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} width={size} height={size}
    fill={color} style={{ display:"inline-block", verticalAlign:"middle", flexShrink:0, ...style }}
    aria-hidden="true">{paths}</svg>
);

const Icon = {
  // ── Combat ──
  terror:       _I(<path d="M12 2C9 2 7 4 7 7c0 1.5.5 2.8 1.3 3.8L7 14h2l.5 3h5l.5-3h2l-1.3-3.2C16.5 9.8 17 8.5 17 7c0-3-2-5-5-5zm-2 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4 3h4l.5 1h-5l.5-1zM9 19h6v2H9z"/>),
  noTerror:     _I(<><path d="M12 2C9 2 7 4 7 7c0 1.5.5 2.8 1.3 3.8L7 14h2l.5 3h5l.5-3h2l-1.3-3.2C16.5 9.8 17 8.5 17 7c0-3-2-5-5-5zm-2 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM9 19h6v2H9z" opacity=".4"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" fill="none"/></>),
  attack:       _I(<path d="M14.1 2l-1.4 1.4 3.5 3.5-3.2 3.2-3.5-3.5L8.1 8l3.5 3.5-6.4 6.4c-.8.8-.8 2 0 2.8.8.8 2 .8 2.8 0l6.4-6.4 3.5 3.5 1.4-1.4-3.5-3.5 3.2-3.2 3.5 3.5L24 11.3z"/>),
  charge:       _I(<path d="M4 12h10m0 0l-4-4m4 4l-4 4m6-10l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>),
  pursue:       _I(<path d="M4 12h12m-4-5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>),
  noDriveBack:  _I(<><path d="M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".35"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5"/></>),
  noEvade:      _I(<><path d="M7 17l3-4 2 2 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".35"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5"/></>),
  frenzy:       _I(<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>),

  // ── Movement & Position ──
  fly:          _I(<path d="M12 4c-1 0-3 1.5-5 4.5C5 11.5 3 13 2 13c1 1 3 1 5-.5 0 1-1 4-1 6h2c.5-2 2-4 4-5 2 1 3.5 3 4 5h2c0-2-1-5-1-6 2 1.5 4 1.5 5 .5-1 0-3-1.5-5-4.5S13 4 12 4z"/>),
  infiltrate:   _I(<><path d="M12 4a4 4 0 0 0-4 4c0 2.5 4 8 4 8s4-5.5 4-8a4 4 0 0 0-4-4z" opacity=".6"/><circle cx="12" cy="8" r="1.5"/><path d="M8 18h8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></>),
  vision360:    _I(<><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/><ellipse cx="12" cy="12" rx="5" ry="3.5"/><circle cx="12" cy="12" r="1.5"/></>),
  noLoS:        _I(<><ellipse cx="12" cy="12" rx="6" ry="4" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4"/><circle cx="12" cy="12" r="2" opacity=".4"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5"/></>),

  // ── Ranged ──
  shoot:        _I(<path d="M2 12l7-7v4h6V5l7 7-7 7v-4H9v4z"/>),
  breath:       _I(<path d="M4 12c0-3 2-6 5-7 0 2 1 3 3 3s3-1 3-3c3 1 5 4 5 7 0 4-3 8-8 8s-8-4-8-8z"/>),
  armourPierce: _I(<><path d="M12 3l-8 5v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V8l-8-5z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2.5"/></>),
  noArmour:     _I(<><path d="M12 3l-8 5v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V8l-8-5z" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4"/><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5"/></>),

  // ── Command ──
  command:      _I(<path d="M3 12l4-8h2l-3 7h4l-6 10 2-7H3zm10 0l4-8h2l-3 7h4l-6 10 2-7h-3z"/>),
  noBrigade:    _I(<><rect x="3" y="8" width="7" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".4"/><rect x="14" y="8" width="7" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".4"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5"/></>),

  // ── Special ──
  regen:        _I(<path d="M12 4V1L8 5l4 4V6c3.3 0 6 2.7 6 6 0 1-.3 2-.7 2.8l1.5 1.5c.7-1.3 1.2-2.7 1.2-4.3 0-4.4-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6 0-1 .3-2 .7-2.8L5.2 7.7C4.5 9 4 10.3 4 12c0 4.4 3.6 8 8 8v3l4-4-4-4v3z"/>),
  badlyHurt:    _I(<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM12 12l3-3h-6z"/>),
  instability:  _I(<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c1 0 2 2 2 5s-1 5-2 5-2-2-2-5 1-5 2-5zm-4 4c0-1 2-2 3-1s0 3-1 4-3-2-2-3zm8 0c1-1 2 2 2 3s-2 2-3 1 0-3 1-4z"/>),
  magic:        _I(<path d="M12 2l2.4 7.2H22l-6 4.5 2.4 7.3L12 16.5 5.6 21l2.4-7.3-6-4.5h7.6z"/>),
  noMagic:      _I(<><path d="M12 2l2.4 7.2H22l-6 4.5 2.4 7.3L12 16.5 5.6 21l2.4-7.3-6-4.5h7.6z" opacity=".35"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5"/></>),
  separateOrder:_I(<><rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">1</text></>),
  wild:         _I(<path d="M1 21h22L12 2 1 21zm11-3h-1v-1h1v1zm0-3h-1v-4h1v4z"/>),
};

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
  { id:"sceptre_sovereignty",category:"Device",name:"Sceptre of Sovereignty",cost:30,restriction:"General only. One per army.",          desc:"A General may ignore one Blunder roll made by himself or any other character; the order is treated as successful instead. General only. Maximum one per army." },
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
    emp_general: "https://cdn.midjourney.com/a673dfd7-26a3-411f-aaa3-70831426bae6/0_1.png",
    emp_hero: "https://cdn.midjourney.com/a734d0dd-9747-427f-b055-741b24f776ce/0_2.png",
    emp_wizard: "https://cdn.midjourney.com/803fd065-a19e-4fde-a257-4771e5af38f4/0_2.png",
    emp_griffon: "",
    emp_warAltar: "https://cdn.midjourney.com/ca9c3e44-d2a2-456e-9981-eae360459e3d/0_3.png",
    emp_halberdiers: "https://cdn.midjourney.com/1c5e596b-c68e-486e-9219-41ea636058ff/0_3.png",
    emp_crossbowmen: "https://cdn.midjourney.com/d3eb0830-0e75-4f23-bd5b-e00da1942dff/0_3.png",
    emp_handgunners: "https://cdn.midjourney.com/4a4d08a5-f233-4834-b611-3dd21fd75d3c/0_2.png",
    emp_flagellants: "https://cdn.midjourney.com/a9a3dae9-8730-4483-bf14-9635ac02bb0d/0_1.png",
    emp_skirmishers: "https://cdn.midjourney.com/2aa9dedf-9ae7-491c-8ef4-0684de0763cf/0_0.png",
    emp_knights: "https://cdn.midjourney.com/54273de2-0a0b-4a79-ba59-56a22b5699ef/0_3.png",
    emp_pistoliers: "https://cdn.midjourney.com/c091c6ab-4149-46a0-9e43-4f87384b47d3/0_0.png",
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
    vc_general: "https://cdn.midjourney.com/41226841-a9eb-4605-aaa6-6a7f4ab21811/0_1.png",
    vc_vampire: "https://cdn.midjourney.com/f8b62b7b-a262-40f0-8e98-b22ece614cb5/0_3.png",
    vc_necromancer: "https://cdn.midjourney.com/f2627b59-f86c-4793-a632-3c56c066e95b/0_3.png",
    vc_wingedNightmare: "https://cdn.midjourney.com/67e07802-ea12-42b0-a963-9b88315cf1d9/0_0.png",
    vc_blackCoach: "https://cdn.midjourney.com/c569e6f3-c169-4797-9008-ec5d5c8346d9/0_3.png",
    vc_skeletons: "https://cdn.midjourney.com/a57d3525-cf85-45fa-8199-3b1238adab07/0_3.png",
    vc_zombies: "https://cdn.midjourney.com/329acde1-5b63-4f69-91db-c66debf53936/0_3.png",
    vc_ghouls: "https://cdn.midjourney.com/570198f6-8939-4f1c-908e-1ef1de170cfb/0_2.png",
    vc_graveGuard: "https://cdn.midjourney.com/6bd48e15-b3a8-4182-a5bd-aee8d89b64a5/0_3.png",
    vc_etherealHost: "https://cdn.midjourney.com/6e7f776d-127d-4205-a0f2-e551152a2e99/0_2.png",
    vc_blackKnights: "https://cdn.midjourney.com/93e3fd1d-3b99-4683-9697-bfbcecf06ffe/0_3.png",
    vc_direWolves: "https://cdn.midjourney.com/f7c5d761-4576-41d0-aaad-45de43fc84ac/0_0.png",
    vc_fellBats: "https://cdn.midjourney.com/14ce396e-da56-46ec-99c1-63a923dac6a8/0_3.png",
    ca_general: "https://cdn.midjourney.com/3bfcaadc-6a1b-49bf-8c79-f6f90b334348/0_1.png",
    ca_hero: "https://cdn.midjourney.com/082c18e7-8cba-4939-848f-402a1320a507/0_0.png",
    ca_sorcerer: "https://cdn.midjourney.com/b7c7784a-f87a-4106-8c7c-0e77f9b2bd0f/0_2.png",
    ca_chariot_mount: "https://cdn.midjourney.com/34a73c52-33b4-4055-b9d8-ce7db7e5e14c/0_2.png",
    ca_celestialDragon: "https://cdn.midjourney.com/263f7f34-44d7-42b5-8290-3da802a00f0e/0_0.png",
    ca_tiger: "",
    ca_qilin: "",
    ca_bannermen: "",
    ca_crossbows: "",
    ca_handguns: "",
    ca_terracottaWarriors: "",
    ca_maneaters: "",
    ca_chariots: "",
    ca_imperialCavalry: "",
    ca_huCavalry: "",
    ca_rocketLauncher: "",
    ca_tripleBows: "",
  },
  // ── Spell art ─────────────────────────────────────────────────────────────
  spells: {
    albion_downpour: "",
    albion_mists_of_albion: "",
    albion_storm_of_hail: "",
    albion_summon_fenbeast: "",
    araby_djinn_summons: "https://cdn.midjourney.com/711526b0-93d3-4119-ad68-7b371332c92d/0_3.png",
    araby_mirage: "https://cdn.midjourney.com/99056651-0ad6-4af3-8966-f59c18096740/0_3.png",
    araby_sand_storm: "https://cdn.midjourney.com/69ea1074-8e07-483e-8ccd-8a22ccd9376f/0_2.png",
    araby_sunstrike: "https://cdn.midjourney.com/6f9caba1-386e-407c-ab8b-e38199a6606d/0_0.png",
    beastmen_chaos_bolt: "",
    beastmen_hunting_for_gore: "",
    beastmen_power_of_herd: "",
    beastmen_traitor_kin: "",
    bretonnia_aerial_shield: "https://cdn.midjourney.com/c8a0fa25-15c1-441e-820d-3ace26433cd9/0_1.png",
    bretonnia_eerie_mist: "https://cdn.midjourney.com/79d31b1b-64ce-4c11-977c-0a94c5608571/0_2.png",
    bretonnia_ladys_favour: "https://cdn.midjourney.com/f68e6863-a09a-4760-bbd2-e7d52a91cabb/0_2.png",
    bretonnia_shield_of_combat: "https://cdn.midjourney.com/e68148e3-87a0-4147-8a33-58e4b95ce562/0_3.png",
    cathay_ferocity_of_tigers: "",
    cathay_glory_of_cathay: "",
    cathay_lion_dogs_attack: "",
    cathay_tranquility_of_heaven: "",
    chaos_anger_of_the_gods: "https://cdn.midjourney.com/67130d75-aa56-4410-8789-d2cc99e64e8c/0_3.png",
    chaos_boon_of_chaos: "https://cdn.midjourney.com/05ffdfc6-7e0c-4e67-80e7-edbd0c522b02/0_0.png",
    chaos_dwarfs_flaming_hand: "",
    chaos_dwarfs_meteor_storm: "",
    chaos_dwarfs_volcanic_eruption: "",
    chaos_dwarfs_word_of_fear: "",
    chaos_rage_of_chaos: "https://cdn.midjourney.com/c06bfb4d-553e-4771-ab2d-4f0061691263/0_3.png",
    chaos_curse_of_chaos: "https://cdn.midjourney.com/25b4f79b-6cfb-4b2a-91c1-77ede6edc92e/0_1.png",
    daemons_daemonic_rage: "",
    daemons_frenzy_of_chaos: "",
    daemons_sorcerous_blast: "",
    daemons_summon_daemons: "",
    dark_elves_black_horror: "https://cdn.midjourney.com/368fa3d3-45fc-427b-988b-a1be944df032/0_0.png",
    dark_elves_dominion: "https://cdn.midjourney.com/550e326c-e3f1-40e8-917f-e7c307b7a513/0_1.png",
    dark_elves_doom_bolt: "https://cdn.midjourney.com/632472a4-8d39-4f54-8db3-dcad30ada2a7/0_1.png",
    dark_elves_soul_stealer: "https://cdn.midjourney.com/e9c629e0-d3c7-4f0c-a38f-79d42aa79092/0_2.png",
    dogs_of_war_ball_of_flame: "https://cdn.midjourney.com/8aedf188-8a3f-4912-ad05-42caf1e8c66a/0_1.png",
    dogs_of_war_voice_of_command: "https://cdn.midjourney.com/b13c185d-2e2d-4db7-a550-ab49e5c4b070/0_3.png",
    dogs_of_war_weird_enchantment: "https://cdn.midjourney.com/4a495fda-752a-4de7-ace5-c84ea54ddc8f/0_0.png",
    dogs_of_war_teleport: "https://cdn.midjourney.com/c5a5fef6-1af0-4b44-8fa2-fca0e4d37d5c/0_0.png",
    empire_ball_of_flame: "https://cdn.midjourney.com/384cc5a7-f77e-4e35-b0c6-2cb85ed88aaa/0_3.png",
    empire_voice_of_command: "https://cdn.midjourney.com/57b56aee-ce9b-4228-a768-d14c612915e8/0_1.png",
    empire_weird_enchantment: "https://cdn.midjourney.com/07d7e7c2-3391-4455-8888-bc4091b37020/0_1.png",
    empire_teleport: "https://cdn.midjourney.com/bf191600-c45a-464a-b256-ea4314f32bba/0_2.png",
    goblin_army_brain_busta: "",
    goblin_army_gerroff: "",
    goblin_army_mork_save_uz: "",
    goblin_army_waaagh: "",
    high_elves_hail_of_destruction: "https://cdn.midjourney.com/e82eaef5-9615-41bb-918a-c2f0176999c7/0_1.png",
    high_elves_heavens_fire: "https://cdn.midjourney.com/210b331f-bfa9-4a8d-bf35-76c02292bea7/0_3.png",
    high_elves_light_of_battle: "https://cdn.midjourney.com/c8745d39-2cf9-4e4b-bc94-a2491344b17e/0_0.png",
    high_elves_storm_of_stone: "https://cdn.midjourney.com/4cc8cf6a-d926-4d6d-a5ac-7ae389a2910d/0_0.png",
    kislev_chill: "https://cdn.midjourney.com/e7438352-d260-4e90-b2ba-12b6e32c435f/0_3.png",
    kislev_freeze: "https://cdn.midjourney.com/93951612-cb2b-45ce-8e5d-99eb9e2e168f/0_2.png",
    kislev_icy_blast: "https://cdn.midjourney.com/8603d116-7978-4b9e-b128-6877cc803abf/0_0.png",
    kislev_monster_bear: "https://cdn.midjourney.com/22a58930-bc7d-4d56-98d3-1809e22a1506/0_1.png",
    lizardmen_gaze_of_sotek: "https://cdn.midjourney.com/63a2c732-01be-4c75-af8b-996069dababc/0_2.png",
    lizardmen_mazdamundis_revenge: "https://cdn.midjourney.com/64597222-a7f0-4d7b-9fec-78952a1f1288/0_0.png",
    lizardmen_shield_of_the_old_ones: "https://cdn.midjourney.com/9ca2fef8-9a83-4410-ae33-5ec5e9ced196/0_3.png",
    lizardmen_wings_of_the_jungle: "https://cdn.midjourney.com/52334b7b-9abb-4e95-99cb-bdf351bcfee2/0_1.png",
    nippon_divine_wind: "",
    nippon_honour_of_ancestors: "",
    nippon_kami_strike: "",
    nippon_spirit_ward: "",
    norse_aspect_of_wulfen: "",
    norse_eye_of_the_raven: "",
    norse_thunder_of_fowor: "",
    ogre_kingdoms_bone_cruncher: "",
    ogre_kingdoms_bull_gorger: "https://cdn.midjourney.com/c76c2d7e-7e9c-425f-b57b-794db6eb83c4/0_1.png",
    ogre_kingdoms_tooth_cracker: "https://cdn.midjourney.com/c5df1e7c-4b4d-495c-bd8c-23825ed2f551/0_0.png",
    ogre_kingdoms_troll_guts: "https://cdn.midjourney.com/c3bf52d0-5376-4301-99c4-087c52ee057e/0_1.png",
    orcs_foot_of_gork: "https://cdn.midjourney.com/ca6aa1a9-78de-425b-a41a-d4675f534a14/0_1.png",
    orcs_gerroff: "https://cdn.midjourney.com/4f8533b9-7c50-4879-a500-0e38f2782c6d/0_2.png",
    orcs_gotcha: "https://cdn.midjourney.com/c2522d31-729b-439c-b006-d0b6ec0bbd5a/0_0.png",
    skaven_death_frenzy: "https://cdn.midjourney.com/ebcf1392-085d-4802-bbc0-fe96552cfe7a/0_1.png",
    skaven_plague: "https://cdn.midjourney.com/fe3394c4-4d27-47a2-8abe-af634949de10/0_0.png",
    skaven_warp_lightning: "https://cdn.midjourney.com/66c70ff1-8d4f-4fb8-9694-f2565acc65d8/0_2.png",
    skaven_wither: "https://cdn.midjourney.com/884b0423-e0ae-4d62-acd6-d07a899b061f/0_1.png",
    tomb_kings_desert_wind: "https://cdn.midjourney.com/f6096eab-bfa6-443b-b410-e3dc02f15ad0/0_2.png",
    tomb_kings_incantation_of_summoning: "https://cdn.midjourney.com/c0c49bfd-8b5a-4320-9b44-33dfe2611488/0_2.png",
    tomb_kings_raise_dead: "https://cdn.midjourney.com/4b1989d0-f6d2-4329-94d2-4c8fcdd0ff0c/0_0.png",
    tomb_kings_touch_of_death: "https://cdn.midjourney.com/3ef7e529-c53d-4265-9b97-123e473d0510/0_0.png",
    vampire_counts_death_bolt: "https://cdn.midjourney.com/bb112a3c-7484-4d97-9bd2-0ffbd34c1543/0_2.png",
    vampire_counts_raise_dead: "https://cdn.midjourney.com/f9720ad7-e11d-4ac0-8a70-c2b85ff5d630/0_0.png",
    vampire_counts_vanhels_danse_macabre: "https://cdn.midjourney.com/60a2f5db-33b6-46b0-8070-194176a2dccf/0_2.png",
    vampire_counts_vile_curse: "https://cdn.midjourney.com/04b37fba-89f7-4b76-ac3a-9eb196c5e3be/0_3.png",
    witch_hunters_divine_curse: "",
    witch_hunters_doctrine_of_sigmar: "",
    witch_hunters_holy_fervour: "",
    witch_hunters_sanctuary: "",
    wood_elves_call_of_the_hunt: "https://cdn.midjourney.com/719db5c2-e395-4df7-ae93-9e6eba9c3898/0_2.png",
    wood_elves_fury_of_the_forest: "https://cdn.midjourney.com/d4e7a551-398f-4007-9a52-825735a2db34/0_3.png",
    wood_elves_tree_singing: "https://cdn.midjourney.com/2cb5a932-ab31-4ce7-99c5-44c7482f1cac/0_0.png",
    wood_elves_twilight_host: "https://cdn.midjourney.com/da98c9b6-36e9-4f56-b7e9-973dde0775c9/0_3.png",
  },
  // ── Magic item art (neutral — used across all factions) ───────────────────
  magicItems: {
    battle_banner: "https://cdn.midjourney.com/3bb1ecb3-0dc3-4577-a307-771253ca5dab/0_3.png",
    banner_shielding_sup: "https://cdn.midjourney.com/cb041ccd-19c4-4a38-ae96-bd7141b3544d/0_1.png",
    banner_shielding_maj: "https://cdn.midjourney.com/cb041ccd-19c4-4a38-ae96-bd7141b3544d/0_2.png",
    banner_shielding_min: "https://cdn.midjourney.com/38c115d6-1140-4226-a276-d97e91d997d3/0_1.png",
    banner_fortitude_maj: "https://cdn.midjourney.com/b0777871-c92c-48b6-9610-8ddc23b7c410/0_0.png",
    banner_fortitude_min: "https://cdn.midjourney.com/33ee82b3-1f59-4e83-b7cf-9072045ff578/0_2.png",
    banner_steadfastness_sup: "https://cdn.midjourney.com/2ae07b37-ab10-40e6-8353-9133792089ce/0_3.png",
    banner_steadfastness_maj: "https://cdn.midjourney.com/2ae07b37-ab10-40e6-8353-9133792089ce/0_1.png",
    banner_steadfastness_min: "https://cdn.midjourney.com/0ca59731-f5d7-4d37-8461-2468ac94a544/0_1.png",
    banner_fortune: "https://cdn.midjourney.com/c9605304-a85a-4ff3-a726-7766af5dad10/0_0.png",
    sword_destruction: "https://cdn.midjourney.com/8f8c6e8f-65fa-4df9-b9b3-689667130cb6/0_2.png",
    sword_fate: "https://cdn.midjourney.com/9b48f7d2-ceb2-4922-b39a-de497bbf5380/0_2.png",
    sword_cleaving: "https://cdn.midjourney.com/ea5cd931-585c-41a2-a33b-b2dfc0a87bdf/0_1.png",
    sword_might: "https://cdn.midjourney.com/598ccc91-e860-4697-94a5-658c6570c0a1/0_2.png",
    crown_command: "https://cdn.midjourney.com/509a3c62-7211-4a4f-bdbd-6c0b8f3ac9ad/0_1.png",
    helm_dominion: "https://cdn.midjourney.com/6e7175de-c33b-455c-ab02-650a04e4e815/0_2.png",
    orb_majesty: "https://cdn.midjourney.com/ae7ca5cc-26c0-4364-8e80-4ddd5ce4ce91/0_0.png",
    ring_magic: "https://cdn.midjourney.com/9e2b4b72-0160-42ff-91a7-f34626dbe68c/0_1.png",
    staff_spellbinding: "https://cdn.midjourney.com/e853fd61-4694-4839-abe9-b625fcd0c415/0_3.png",
    sceptre_sovereignty: "https://cdn.midjourney.com/3902da52-172f-4a93-a2b4-5bc0ebc08a78/0_2.png",
    scroll_dispelling: "https://cdn.midjourney.com/5bbfd824-958d-4568-b4ec-524c68a432f3/0_1.png",
    wand_power: "https://cdn.midjourney.com/780637a0-1558-476a-8f2c-536e367141ba/0_0.png",
    rod_repetition: "https://cdn.midjourney.com/2fba20c3-66be-4627-91d7-7213c85182f5/0_3.png",
  },
};

// ── FLAVOR TEXT ─────────────────────────────────────────────────────────────
// Short atmospheric quotes for unit cards with room to spare
const FLAVOR = {
  emp_halberdiers: "The backbone of every battle the Empire has survived.",
  emp_crossbowmen: "Aim at the gap in the armour. There is always a gap.",
  emp_handgunners: "The roar of powder ends more arguments than reason.",
  emp_knights: "Steel-clad, debt-free, and pointed at the enemy.",
  tk_skeletonCavalry: "They rode in life. In death, they ride still.",
  cha_hounds: "They have tasted blood from a thousand battlefields.",
  cha_warriors: "Forged in the wastes. Bound to slaughter.",
  cha_marauderHorsemen: "They ride south to take what the gods demand.",
  cha_chaosKnights: "Each bears the blessing of a dark god upon their plate.",
  orc_warriors: "They live to fight. Everything else is waiting.",
  orc_goblins: "Countless as cockroaches and nearly as brave.",
  orc_blackOrcs: "Even other Orcs give them room to swing.",
  orc_boarRiders: "The boar doesn't care what it tramples. Neither does the rider.",
  orc_rockLobber: "Sometimes the rock comes back. That's also fine.",
  he_spearmen: "Their phalanx has held since before men had kingdoms.",
  he_archers: "Each arrow is loosed with the patience of centuries.",
  he_silverHelms: "They charge as silver light cuts through winter fog.",
  he_reavers: "Swift enough to be gone before the enemy turns around.",
  dwf_warriors: "Short of stature. Long of grudge. Hard of skull.",
  dwf_hammerers: "The hammer falls. It has always fallen. It always will.",
  dwf_cannon: "Dwarf engineering: loud, reliable, and deeply satisfying.",
  sk_clanrats: "Many blades make light work of courage.",
  sk_stormvermin: "Stronger, meaner, and marginally less likely to flee.",
  sk_ratOgres: "Madness given sinew. Hunger given fists.",
  lz_saurus: "Cold eyes. Colder blood. Older than memory.",
  br_menAtArms: "They serve so their lords need not bleed.",
  br_bowmen: "Every peasant owes his lord a thousand arrows.",
  br_squires: "Eager to prove themselves. Less eager to die.",
  ki_axemen: "Kislev winters breed hard men with harder axes.",
  de_warriors: "They do not merely fight. They inflict.",
  de_crossbowmen: "Bolts tipped in spite, aimed with cold precision.",
  de_darkRiders: "Fleet as malice, cruel as winter on the open sea.",
  vc_zombies: "Death is not the end. It is merely a change of orders.",
  vc_graveGuard: "They remember what it was to be feared.",
  ar_spearmen: "They guard the gate as their fathers did before them.",
  ar_bowmen: "The desert wind carries arrows as readily as sand.",
  ar_knights: "Silk robes beneath steel plate, death beneath both.",
  ar_magicCarpets: "The sky is just another battlefield.",
  dow_crossbowmen: "They sell their aim to whoever meets the asking price.",
  dow_handgunners: "Loud, acrid, and devastatingly convincing.",
  dow_swordsmen: "A clean blade keeps better than loyalty.",
  dow_lightCavalry: "In, out, and gone before the dust settles.",
  dow_knights: "Their lance is for hire. Their honour, negotiable.",
  ok_ogreBulls: "Nothing personal. Just hungry.",
  ok_ironguts: "The gut-plate is decorative. The fists are not.",
  ok_sabretusks: "They outrun the wind and outfight the foolish.",
  ok_scrapLauncher: "Waste nothing. If it fits in the bucket, it flies.",
  al_warriors: "Painted in woad, hardened by rain, unbowed by empire.",
  al_slingers: "A stone well-thrown needs no blessing to kill.",
  al_wolfhounds: "The wolves of Albion do not bark before they bite.",
  ga_spearChukka: "It don't need to be accurate. Just frequent.",
  wh_halberdiers: "Their faith is in steel, not scripture.",
  wh_militia: "Pitchforks and righteous fury go only so far.",
  wh_knights: "Their crusade has no end. Their enemies have no mercy.",
  cd_blackOrcs: "Chained in the forge-pits. Unchained on the field.",
  cd_bullCentaurs: "Half craftsman, half beast — wholly murderous.",
  we_gladeRiders: "They move through the forest like wind through leaves.",
  bm_bestigors: "They are what the forest becomes when left to its rage.",
  bm_centigors: "Wild, drunk, and twice as fast as reason permits.",
  bm_chaosHounds: "Born hungry. Never sated. Always faster than you.",
  nr_bondsmen: "Every bond is tested. Steel holds longer than oaths.",
  nr_huscarls: "The last to retreat. Often, the last to survive.",
  nr_huntsmen: "They track prey through snow that swallows armies whole.",
  nr_cavalry: "They ride to war like they ride to feast — loudly.",
  ca_bannermen: "Where the banner stands, the line holds.",
  ca_crossbows: "The bolt cares nothing for the rank of its target.",
  ca_handguns: "Thunder speaks where words have failed.",
  ca_maneaters: "Far from home, and glad of it.",
  ca_imperialCavalry: "Jade armour. Iron discipline. Unstoppable momentum.",
  ca_tripleBows: "Three bolts. One heartbeat. One fewer enemy.",
  ni_ashigaru: "They hold the line so the samurai may advance.",
  ni_ashigaruBowmen: "Release together. Strike as one. Fall as none.",
};

// Helper: slugify spell name to match IMAGES.spells keys
function spellKey(armyKey, spellName) {
  return (armyKey + "_" + spellName)
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const ARMIES = {

  empire: {
    name:"The Empire", color:"#c8940a", bg:"#0f0c02", accent:"#f0c040",
    lore:"The largest human nation of the Old World, fielding disciplined soldiers, battle wizards and fearsome war machines.",
    armyRules:[{name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun (3+ counts as 4+, 4+ as 5+, 5+ as 6+, 6+ gives no save). One Crossbowmen unit per 1000pts can be replaced by Handgunners at +10pts, still counting for Crossbowmen min/max."}, {name:"Flagellants", desc:"Always use initiative to charge an enemy if possible; cannot be given orders instead. Never evade. Cannot be driven back by shooting and do not roll for drive backs. Must pursue or advance if victorious. Unaffected by terror — no -1 Attack modifier."}, {name:"Skirmishers", desc:"Not deployed independently. Any infantry unit (except Flagellants) may add one Skirmisher stand, making the unit 4 stands total. Skirmishers share the unit Armour value, fight as part of the unit and can be removed as a casualty. Their casualties never count for Command penalties and they never cause Irregular Formation."}, {name:"Pistoliers", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies. Still needs Line of Sight from front edge to charge."}, {name:"Helblaster", desc:"Range 30cm. Atk by range: 0–10cm = 8, 11–20cm = 4, 21–30cm = 2. Target must be visible; shoots in a straight line, never into combat. Each time it fires roll for malfunction: on a 1, roll again — 1–3 = destroyed, 4–6 = no fire this turn (fires normally next turn). Cannot be driven back by shooting; crew hold their ground on that result."}, {name:"Steam Tank", desc:"Always def (5+ to hit). Cannot be driven back or routed by shooting. No brigade; no character may join. 360° vision. Shoots 30cm, armour piercing. On double-6 order: roll Malfunction chart. In combat: may advance, cannot pursue. At badly hurt: halved to 3H/2A."}, {name:"Griffon", desc:"Generals, Wizards and Heroes can ride Griffons. Flies (move 100cm), adds +2 Attacks to rider. Unit causes terror. Max 1 per army."}, {name:"War Altar", desc:"Only one War Altar in the entire army regardless of size. Can only be a mount for a Wizard (who becomes the Grand Theogonist). Adds +1 Attack. Once per battle the Grand Theogonist may add +1 to a casting dice result (announce before rolling)."}],
        spells:[{name:"Ball of Flame", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Wizard in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks (including your own units). Unengaged units can be driven back (even friends); engaged units carry over hits into combat."}, {name:"Voice of Command", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade, no supporting charge. The unit moves as if it had received an order. Character stands that have joined the unit do not move with it."}, {name:"Weird Enchantment", cast:"4+", range:"30cm", desc:"Cast on any enemy unit (no LoS). Lasts until end of opponent's next turn. Unit moves at half pace in all situations, even when charging. The unit counts all enemies as terrifying (-1 Attack), even if normally immune to terror. If the unit would normally cause terror it ceases to do so. Undead and Daemon targets do not count enemies as terrifying but all other penalties apply."}, {name:"Teleport", cast:"2+", range:"N/A", desc:"The Wizard vanishes and reappears anywhere on the battlefield. Move the Wizard to any position on the table — he may leave or join a unit. Once Teleported, he may cast a second (different) spell this turn, potentially casting two spells total."}],
    playstyle:"A versatile, well-rounded army. Solid infantry, powerful war machines and support magic make the Empire strong in defence and capable of punishing aggression. Best played with layered brigades.",
    fluff:"The Empire is the mightiest of all human nations, stretching from the Grey Mountains to the Worlds Edge. Divided into rival Elector States yet united under a single Emperor, its armies blend veteran state soldiery, fanatic warrior-priests, thunderous cannons and Colleges of Magic wizards. Where other realms field purer forces, the Empire fields everything \u2014 a grinding, adaptive war machine that has survived every Chaos incursion for two millennia.",
    traits:["Diverse combined arms", "Powerful artillery", "Battle wizards", "State troops backbone"],
    strengths:"War machines, flexible unit mix, Steam Tank",
    weaknesses:"Infantry mediocre individually \u2014 relies on combined arms",
    generalCmd:9,
    units:[
      { id:"emp_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"emp_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"emp_wizard", name:"Wizard", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"emp_griffon", name:"Griffon", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"emp_warAltar", name:"War Altar", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"Wizard only may ride (becomes Grand Theogonist). +1 Attack. Once per battle: +1 to spell casting roll (announce before rolling).", upgrades:[], magic:[] },
      { id:"emp_halberdiers", name:"Halberdiers", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Standard Empire core infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_crossbowmen", name:"Crossbowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:2, max:"-", special:"Shoot 30cm.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_handgunners", name:"Handgunners", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:"-", max:3, special:"Armour piercing: enemy armour one worse. Up to 1 per 1000pts can replace Crossbowmen and count toward their min/max.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_flagellants", name:"Flagellants", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Immune to terror. Must pursue/advance.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_skirmishers", name:"Skirmishers", type:"Infantry", atk:"4", hits:"3", armour:"0 or 6+", cmd:"-", size:"+1", pts:20, min:"-", max:"-", special:"Attached to any infantry (except Flagellants) as an extra stand. Brings unit to 4 stands.", upgrades:[], magic:[] },
      { id:"emp_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Standard heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_pistoliers", name:"Pistoliers", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:4, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"emp_helblaster", name:"Helblaster", type:"Artillery", atk:"1/8-4-2", hits:"2", armour:"0", cmd:"-", size:1, pts:50, min:"-", max:1, special:"Range varies by distance (8/4/2 attacks). Armour piercing. Roll 1s: 1-2=Fizzle; 3=Misfire (no shots); 4+=Ka-boom! (destroyed, but 6 auto-hits on charging foe).", upgrades:[], magic:[] },
      { id:"emp_cannon", name:"Cannon", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"0", cmd:"-", size:2, pts:85, min:"-", max:1, special:"Bouncing cannonball. See rulebook p.74.", upgrades:[], magic:[] },
      { id:"emp_steamTank", name:"Steam Tank", type:"Machine", atk:"3/3", hits:"4", armour:"3+", cmd:"-", size:1, pts:130, min:"-", max:1, special:"Always counts as defended. Cannot be driven back or routed by shooting. Cannot brigade. No character may join. 360° vision. Shoots 30cm, armour piercing. On double-6 order: roll Malfunction chart.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  tomb_kings: {
    name:"Tomb Kings", color:"#c8a44a", bg:"#0a0800", accent:"#f0d060",
    lore:"Ancient undead rulers of the desert, commanding skeletal armies that never tire, never waver, and never retreat.",
    armyRules:[{name:"Undead (Army Rule)", desc:"All Undead units never act on initiative and only move in the Command phase if given orders. They are unaffected by: the -1 Command penalty for enemy within 20cm; the -1 Combat penalty for fighting terrifying troops; and the Confusion rule — they cannot become confused for any reason."}, {name:"Carrion", desc:"Carrion can fly. They can always return to a character by homing back at the start of the Command phase without requiring an order."}, {name:"Bone Giant", desc:"Causes terror. When a Tomb King (not a Liche Priest) issues an order to a Bone Giant or brigade containing one, apply a -1 Command penalty. No penalty when a Liche Priest issues the order."}, {name:"Sphinx", desc:"Causes terror. With 4-5 accumulated hits at end of Shooting or Combat phase (while not engaged) it becomes Badly Hurt — all accumulated hits discounted, Hits and Attacks halved for the rest of battle (3 Hits, 2 Attacks)."}, {name:"Skull Chukka", desc:"Stone Thrower. When a unit is driven back by Skull Chukka hits, any drive-back dice cause Confusion on rolls of 4, 5 or 6 (rather than 6 as normal). Roll the Skull Chukka dice separately if other hits were also inflicted."}, {name:"Tomb King", desc:"Once per battle, the Tomb King can use his burial magic to give all stands in one unit within 20cm a +1 Combat Attack bonus for the duration of one Combat phase."}],
        spells:[{name:"Raise Dead", cast:"5+", range:"30cm", desc:"Cast on a combat within 30cm (no LoS). Places a 3-stand Skeleton unit in contact with the engagement; fails if stands cannot be legally placed. Raised dead do not count as charging; ignored for breakpoint and VPs. One Raise Dead per engagement per turn. Placement cannot split the engagement."}, {name:"Touch of Death", cast:"4+", range:"N/A", desc:"Cast when the Liche Priest has joined a unit in combat. The target enemy unit touching the Priest's unit takes three attacks worked out in the usual way. Any hits scored are carried over into the first round of combat and count as having been struck in the combat itself."}, {name:"Doom and Despair", cast:"4+", range:"60cm", desc:"Cast on any enemy unit within range regardless of whether the Wizard can see it or not. The spell takes effect until the end of the opposing player's following turn. Whilst the spell lasts the unit cannot charge and if engaged in combat will not pursue or advance — even units otherwise obliged to do so. Even Undead are not immune."}, {name:"Death Bolt", cast:"5+", range:"30cm", desc:"Cast on one enemy unit within range. The Wizard must be able to see his target. Three shooting attacks are worked out and no armour saves apply. The target can be driven back as with ordinary shooting. Cannot be cast on a unit engaged in combat."}],
    playstyle:"An attrition army immune to psychology. Skeleton units are cheap and numerous; Chariots are the offensive backbone. Magic is critical \u2014 Liche Priests keep the host moving. Build brigades around chariot charges.",
    fluff:"Beneath the searing sands of Nehekhara lie the mummified remains of an ancient civilisation, entombed for millennia in vast pyramid-cities. When desecrators disturb their rest, the Tomb Kings stir \u2014 rising not as mindless shuffling corpses but as proud warrior-kings commanding the same armies that brought the ancient world to its knees, now animated by sacred incantations and bound to serve for eternity.",
    traits:["Undead \u2014 immune to terror", "Liche Priest magic", "Chariots as core", "Desert monsters"],
    strengths:"Undead immunity, chariots, cheap skeletons",
    weaknesses:"Low attack values on most infantry",
    generalCmd:9,
    units:[
      { id:"tk_general", name:"Tomb King", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:130, min:1, max:1, special:"Command range covers entire battlefield. Once per battle: +1 Attack to one unit within 20cm for one Combat phase.", upgrades:[], magic:["devices"] },
      { id:"tk_lichePriest", name:"Liche Priest", type:"Wizard", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:2, special:"Command range 60cm. Casts spells. No -1 penalty when ordering Bone Giants.", upgrades:[], magic:["weapons","devices"] },
      { id:"tk_zombieDragon", name:"Zombie Dragon", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"Tomb King or Liche Priest may ride. Flies (move 100cm). Causes terror. Breath attack: 20cm, 3 attacks (rider must have joined a unit and not be engaged in combat).", upgrades:[], magic:[] },
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
    armyRules:[{name:"Ogres", desc:"If an Ogre unit can use initiative to charge an enemy unit of humans at the start of the Command phase it must do so automatically — commanders cannot prevent it. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Trolls", desc:"Distance Command penalties to Trolls are always doubled (40cm = -2, 60cm = -4, etc.). Trolls regenerate wounds: in each combat round after whole stands are removed, Trolls automatically regenerate one outstanding hit. Regenerated hits still count towards the combat result."}, {name:"Harpies", desc:"Harpies are based facing the long edge of the base like infantry. They can fly. A unit of Harpies cannot be joined by a character."}, {name:"Dragon Ogres", desc:"Dragon Ogres are immune to terror."}, {name:"Chaos Spawn", desc:"Spawn have -1 Command penalty unless in a brigade with more non-Spawn than Spawn units. Up to two Spawn can be in any brigade without counting towards maximum brigade size. Spawn cause terror in combat. Cannot be driven back by shooting. Must pursue or advance if victorious. 15cm shooting range and 360 degree vision."}, {name:"Chaos Dragon", desc:"Generals, Wizards and Heroes can ride a Chaos Dragon. Flies (move 100cm), adds +3 Attacks to rider. Dragon breathes fire at 20cm range with 3 Attacks (rider must have joined a unit, not engaged in combat). Unit causes terror."}],
        spells:[{name:"Boon of Chaos", cast:"4+", range:"N/A", desc:"The Sorcerer must have joined a unit in combat. Every stand in that unit, including the Sorcerer and any other characters, adds +1 to its Attacks value for the duration of the following Combat phase."}, {name:"Anger of the Gods", cast:"4+", range:"30cm", desc:"Cast on the Sorcerer himself. Affects all enemy units within 30cm. Lasts until end of the opposing player's following turn. All affected enemy units suffer a -1 Command penalty per order (applied based on distance at time of each order)."}, {name:"Rage of Chaos", cast:"5+", range:"30cm", desc:"Cast on a friendly unit in combat within range (no LoS needed). Lasts for the next Combat phase. Each stand gains +1 attack. The unit causes terror (-1 atk penalty to enemy in combat if not already suffering it). Only one unit per combat engagement may benefit from Rage at a time."},
      { name:"Curse of Chaos", cast:"5+", range:"30cm",
        desc:"Cast on one enemy unit within range. The Sorcerer must be able to see his target. Three shooting attacks are worked out and no armour saves apply. The target can be driven back as with ordinary shooting. Cannot be cast on a unit engaged in combat." }],
    playstyle:"A small, elite army. Every unit hits hard \u2014 Chaos Warriors and Knights are among the best in the game. You will be outnumbered. Win by smashing enemy lines in decisive charges before attrition kills you.",
    fluff:"From the frozen wastes beyond Kislev they come \u2014 the Chaos Warriors, men so consumed by devotion to the Dark Gods that they have become something other than human. Alongside hordes of Marauder tribesmen, terrifying Chaos Knights, spell-hurling Sorcerers and abominations like Dragon Ogres and Chaos Spawn, they represent an existential threat to every civilised nation. When the Chaos tide rises, the world trembles.",
    traits:["Elite heavy warriors", "Devastating cavalry", "Powerful monsters", "High points cost"],
    strengths:"Best infantry and cavalry stats in the game",
    weaknesses:"Expensive \u2014 small numbers, very limited artillery",
    generalCmd:9,
    units:[
      { id:"cha_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"cha_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"cha_sorcerer", name:"Sorcerer", type:"Wizard", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
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
        spells:[{name:"Foot of Gork", cast:"6+", range:"50cm", desc:"Cast on any unengaged enemy unit within range (no LoS needed). The unit suffers 6 attacks. Cannot be driven back by the Foot of Gork (it descends from above)."}, {name:"Gotcha!", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Shaman in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Gerroff!!!", cast:"5+", range:"60cm", desc:"Cast on any unengaged enemy unit within range (no LoS needed). The enemy unit is driven back 1D6×5cm towards its own table edge. Cannot be routed by this drive back. If the unit leaves the table it rolls as normal."}, {name:"Waaagh!", cast:"4+", range:"30cm", desc:"Cast on a friendly unit of Orcs or Goblins (including Black Orcs, Wolf Riders, Boar Boyz — not Trolls, Ogres, Giants or non-greenskins) engaged in combat within range (no LoS needed). Every stand in the unit, including characters, gains +1 Attack for the following Combat phase."}],
    playstyle:"Overwhelming mass of bodies backed by hard-hitting monsters and trolls. Animosity can cause chaos in your own lines \u2014 build brigades to mitigate it. Let the greenskin tide roll forward and drown the enemy.",
    fluff:"The Orc tribes of the Old World need little reason to go to war \u2014 a good scrap is its own reward. When a powerful Warboss emerges to unite the clans under a single Waaagh!, entire regions tremble. Greenskin hordes pour south in an unstoppable tide of violence, noise and barely-contained chaos. Their greatest weakness is themselves.",
    traits:["Massive numbers", "Animosity mechanic", "Varied unit types", "Giants and trolls"],
    strengths:"Numbers, monsters, cheap options",
    weaknesses:"Animosity can cost orders at critical moments",
    generalCmd:8,
    units:[
      { id:"orc_general", name:"Orc General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:8, size:1, pts:95, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"orc_hero", name:"Orc Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_shaman", name:"Orc Shaman", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_goblinHero", name:"Goblin Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_goblinShaman", name:"Goblin Shaman", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"orc_wyvern", name:"Wyvern", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Shaman may ride. Flies (move 100cm). Unit causes terror.", upgrades:[], magic:[] },
      { id:"orc_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Shaman may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"orc_warriors", name:"Orc Warriors", type:"Infantry", atk:"4", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core orc infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_goblins", name:"Goblins", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:2, max:"-", special:"Shoot 15cm (bows).", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_blackOrcs", name:"Black Orcs", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Elite orcs.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_trolls", name:"Trolls", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Regenerate 1 hit per combat round. Command penalty for distance doubled.", upgrades:[], magic:[] },
      { id:"orc_ogres", name:"Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:"-", max:1, special:"Must charge humans on initiative.", upgrades:[], magic:[] },
      { id:"orc_boarRiders", name:"Boar Riders", type:"Cavalry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Heavy orc cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_wolfRiders", name:"Wolf Riders", type:"Cavalry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_wolfChariots", name:"Wolf Chariots", type:"Chariot", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:3, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"orc_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Must be given separate order. Rolls on Giant Goes Wild if order fails. At 5–7 hits: badly hurt, halved.", upgrades:[], magic:[] },
      { id:"orc_rockLobber", name:"Rock Lobber", type:"Artillery", atk:"1/3", hits:"3", armour:"0", cmd:"-", size:1, pts:75, min:"-", max:1, special:"Stone Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  high_elves: {
    name:"High Elves", color:"#1060c0", bg:"#010510", accent:"#50a0ff",
    lore:"Ancient guardians of Ulthuan and the world's greatest bulwark against Chaos, fielding disciplined warriors and mighty dragons.",
    armyRules:[{name:"Archers", desc:"High Elf Archers add +1 to their dice roll when making Shooting attacks. They score a hit against targets in the open on 3+, defended on 4+, and fortified on 5+."}, {name:"Giant Eagles", desc:"Giant Eagles can fly."}, {name:"Dragons", desc:"Fly (100cm). Dragon Rider units and units with a Dragon-riding character cause terror. Breath attack: 20cm, 3 atk, hits on 4+; used in addition to normal attacks. Magic items cannot augment breath. At 4–5 hits (not engaged): badly hurt, halved to 3H/3A/2 breath attacks. Individual Dragon mounts: rider remounts on the surviving stand."}, {name:"High Elf Wizard", desc:"High Elf Mages can re-roll a failed spell on any dice result except a 1. If a spell is failed because a 1 is rolled, no re-roll is permitted."}],
        spells:[{name:"Storm of Stone", cast:"6+", range:"30cm", desc:"Affects every enemy unit within range. Each unit takes 3 attacks. Unengaged units are not driven back (assault comes from below). Engaged units carry over hits into combat."}, {name:"Light of Battle", cast:"5+", range:"30cm", desc:"Affects every friendly unit within range. Lasts for the following Combat phase. Every unit and character that has joined a unit gains +1 attack (can be allocated to any stand, a different stand each round)."}, {name:"Heaven's Fire", cast:"4+", range:"30cm", desc:"Cast on a friendly unengaged missile-armed infantry or cavalry unit within range (no LoS to target needed). Cannot be cast on artillery. The unit can shoot twice this turn. The second shot is always at -1 to hit."}, {name:"Hail of Destruction", cast:"5+", range:"30cm", desc:"Cast on one enemy unit within range. The Mage must be able to see his target. Cannot be directed at a unit engaged in combat. Three shooting attacks are worked out and no armour saves apply. The target can be driven back as with ordinary shooting."}],
    playstyle:"A premium army where every unit is better than its equivalent elsewhere. The Command 10 General gives outstanding reliability. Use superior shooting to soften targets, then deliver decisive cavalry and dragon charges.",
    fluff:"From their island kingdom of Ulthuan, the High Elves have stood as the world's foremost bulwark against Chaos since time immemorial. Ancient beyond reckoning, their warriors train for centuries before seeing battle. Their Silver Helm cavalry are unmatched, their archers deadly, and their Dragon riders among the most feared creatures in existence. They fight not for conquest but for survival \u2014 and will not countenance failure.",
    traits:["Command 10 General", "Superior archers", "Dragons", "Balanced elite force"],
    strengths:"Command 10, reliable orders, all-round excellence",
    weaknesses:"Expensive \u2014 few units relative to points",
    generalCmd:10,
    units:[
      { id:"he_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:10, size:1, pts:180, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"he_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"he_wizard", name:"Wizard", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"he_giantEagle_mount", name:"Giant Eagle Mount", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"he_dragon_mount", name:"Dragon Mount", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm). Causes terror. Fire breath: 20cm, 3 attacks at 4+.", upgrades:[], magic:[] },
      { id:"he_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Wizard may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"he_spearmen", name:"Spearmen", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core High Elf infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_archers", name:"Archers", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:1, max:"-", special:"+1 to shooting dice rolls (hit on 3+ in open, 4+ defended, 5+ fortified).", upgrades:[], magic:["standards","weapons"] },
      { id:"he_silverHelms", name:"Silver Helms", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Elite heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_reavers", name:"Reavers", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:3, special:"Fast light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_chariots", name:"Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:3, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"he_giantEagles", name:"Giant Eagles", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Flies.", upgrades:[], magic:[] },
      { id:"he_dragonRider", name:"Dragon Rider", type:"Monster", atk:"6/3", hits:"6", armour:"4+", cmd:"-", size:1, pts:270, min:"-", max:1, special:"Causes terror. Flies. Fire breath: 20cm, 3 attacks at 4+. At 4–5 hits: badly hurt, halved to 3H, 3/2A.", upgrades:[], magic:[] },
      { id:"he_boltThrower", name:"Elven Bolt Thrower", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:55, min:"-", max:1, special:"Bolt Thrower with skewer rule.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  dwarfs: {
    name:"Dwarfs", color:"#8b4513", bg:"#050202", accent:"#cd7f32",
    lore:"Stubborn mountain folk with the finest artillery in the world and warriors who hold grudges for generations.",
    armyRules:[{name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun. One Handgunner unit per 1000pts can replace a Warrior unit while still counting for Warriors min/max value."}, {name:"Rangers", desc:"One unit per 1000pts may infiltrate instead of deploying normally. Give an infiltration order to a point in dense terrain or on any table edge except the enemy’s — Cmd range is unlimited for this order. On success, the unit appears there. Cannot appear within 20cm of any enemy unit at deployment."}, {name:"Troll Slayers", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier. Add +1 Attack when fighting Monster stands. Victory points are scored differently: if any stands remain at end of battle the full points value goes to the opponent; if all stands are destroyed no victory points are scored by either side."}, {name:"Gyrocopter", desc:"Can fly. Acts like artillery in most respects but is a flying machine. Has its own special rules for movement."}, {name:"Hero (Oathstone)", desc:"A Hero may carry an Oathstone (+15pts). Once per battle, invoke it: both the Hero and all stands of the joined unit (except Troll Slayers) gain +1 Attack per stand and are Immune to Terror until the end of that Combat phase."}, {name:"Runesmith (Anti-Magic)", desc:"If an enemy Wizard within 50cm casts a spell, the Runesmith can attempt to dispel it on a D6 roll of 4+. Only one attempt per spell. A Runesmith with the Anvil of Doom may add +1 to this roll once per battle and can strike the Anvil to grant units within 20cm Terror Immunity."}],
    spells:[],
    playstyle:"The ultimate defensive army. Dwarf Warriors are the hardest infantry to kill. Multiple artillery pieces punish approaching enemies. Runesmiths neutralise enemy magic. Hold ground, shoot everything, then counter-charge.",
    fluff:"Dwelling in their mountain strongholds since before men walked the earth, the Dwarfs are a proud and stubborn race nursing grudges that span millennia. Their warriors are shorter than men but far tougher, clad in the finest gromril armour. Behind them roar Cannons, Flame Cannons and whirring Gyrocopters. Dwarfs never forget an insult, never break their word, and never, ever retreat.",
    traits:["Toughest infantry", "Finest artillery", "No cavalry", "Runesmiths dispel magic"],
    strengths:"Best infantry toughness, best artillery, anti-magic",
    weaknesses:"No cavalry, slow, vulnerable to flanking",
    generalCmd:10,
    units:[
      { id:"dwf_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:10, size:1, pts:155, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"dwf_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"dwf_runesmith", name:"Runesmith", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Can dispel spells (Staff/Scroll of Spellbinding allowed).", upgrades:[], magic:["devices"] },
      { id:"dwf_anvil", name:"Anvil of Doom", type:"Special", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:50, min:"-", max:1, special:"Attached to Runesmith. +1 Attack. In Shooting phase: roll D6, on 4+ all Dwarf units within 20cm are immune to Terror until start of next turn.", upgrades:[], magic:[] },
      { id:"dwf_warriors", name:"Warriors", type:"Infantry", atk:"3", hits:"4", armour:"4+", cmd:"-", size:3, pts:110, min:2, max:"-", special:"Tough core infantry. One Handgunner unit per 1000pts may replace a Warrior unit and count for Warrior min/max.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_handgunners", name:"Handgunners", type:"Infantry", atk:"3/1", hits:"4", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Armour piercing: enemy armour one worse.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_rangers", name:"Rangers", type:"Infantry", atk:"3/1", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"One unit per 1000pts may infiltrate. Can pursue any troop type.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_trollSlayers", name:"Troll Slayers", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:80, min:"-", max:1, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Immune to terror. Must pursue. +1 vs Monsters. If any survive: enemy scores full VPs. If a Troll Slayer unit is destroyed no victory points are scored by either side.", upgrades:[], magic:["standards","weapons"] },
      { id:"dwf_cannon", name:"Cannon", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"6+", cmd:"-", size:2, pts:90, min:"-", max:1, special:"Bouncing cannonball. See rulebook p.74.", upgrades:[], magic:[] },
      { id:"dwf_flameCannon", name:"Flame Cannon", type:"Artillery", atk:"1/2D6", hits:"2", armour:"6+", cmd:"-", size:1, pts:50, min:"-", max:1, special:"Range 30cm. 2D6 attacks (if double: misfire). On double: roll on Flame Cannon Misfire Chart.", upgrades:[], magic:[] },
      { id:"dwf_gyrocopter", name:"Gyrocopter", type:"Machine", atk:"1/3", hits:"3", armour:"5+", cmd:"-", size:1, pts:75, min:"-", max:1, special:"Flies (move 60cm). Armour piercing (counts armour one worse). 360° vision. Must be given separate orders; cannot brigade or be joined by characters.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  skaven: {
    name:"Skaven", color:"#6b8e23", bg:"#030402", accent:"#9acd32",
    lore:"Devious ratmen swarming from underground warrens, wielding deadly warp-powered war machines and overwhelming numbers.",
    armyRules:[{name:"Strength in Numbers (Army Rule)", desc:"Brigades may be of any size and are not restricted to the normal four unit maximum."}, {name:"Vermintide (Army Rule)", desc:"Skaven units that win a round of combat can choose to pursue retreating enemy regardless of troop type. Any Skaven unit (including artillery) can pursue any enemy (including flyers, cavalry and chariots). Normal terrain and fortified status restrictions still apply."}, {name:"Under the Lash (Army Rule)", desc:"All Skaven characters — General, Heroes and Wizards alike — have a Command range of only 20cm. Even the General's range is reduced to 20cm."}, {name:"Jezzails", desc:"Count enemy armour values as one worse than normal (3+ becomes 4+, 5+ becomes 6+, 6+ gives no save)."}, {name:"Plague Monks", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Rat Swarms", desc:"Cannot be driven back by shooting and do not roll for drive backs. Can only be supported by other Rat Swarm stands (not other infantry), though they can support other infantry as normal. Cannot be given magic items."}, {name:"Gutter Runners", desc:"Shoot with throwing stars/darts at 15cm range with 360 degree vision. May infiltrate: issue an infiltration order to a point in dense terrain or on any table edge except the enemy's. On success the unit appears there. Infiltrators can attempt infiltration again on subsequent turns if they fail."}, {name:"Screaming Bell", desc:"The Screaming Bell is a Machine mounted on a 40x60mm base. Can only move as part of a brigade. All friendly units touching the Bell are immune to terror. Heroes/Warlocks within 30cm get +1 Command. Enemy characters within 30cm get -1 Command."}],
        spells:[
      { name:"Wither", cast:"4+", range:"30cm", desc:"Cast on an enemy unit engaged in combat within range (no LoS needed). Lasts for the following Combat phase. Every stand in the unit, including characters that have joined the unit, deducts -1 from its Attacks value." },
      { name:"Warp Lightning", cast:"5+", range:"30cm", desc:"3 shooting attacks that ignore all armour. Wizard must see target. Cannot target a unit in combat. Target can be driven back as with ordinary shooting." },
      { name:"Death Frenzy", cast:"5+", range:"30cm", desc:"Cast on a friendly unit in combat within range. Roll D6s one at a time (max 1 per stand in unit) — total is bonus attacks for that combat phase. If any die repeats a previous result, all Death Frenzy attacks hit your own unit instead. Rebounded attacks are struck only once in the first round of combat, not each round." },
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
      { id:"sk_ratSwarms", name:"Rat Swarms", type:"Infantry", atk:"2", hits:"3", armour:"0", cmd:"-", size:3, pts:25, min:2, max:"-", special:"Cannot be driven back. Cannot be supported by other infantry types (only other Rat Swarms). Can support other infantry as normal. Cannot have magic items.", upgrades:[], magic:[] },
      { id:"sk_gutterRunners", name:"Gutter Runners", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:2, special:"Shoot 15cm, 360° vision. Can infiltrate. No -1 Command penalty in dense terrain. Characters ignore Under the Lash when ordering Gutter Runners.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_ratOgres", name:"Rat Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Powerful monsters.", upgrades:[], magic:["standards","weapons"] },
      { id:"sk_warpLightning", name:"Warp Lightning Cannon", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:60, min:"-", max:1, special:"Range 40cm, 3 attacks. Move 20cm (10cm half-pace). If double 1s rolled to hit, the cannon becomes confused (including stand and shoot).", upgrades:[], magic:[] },
      { id:"sk_doomWheel", name:"Doom Wheel", type:"Machine", atk:"5", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"Move 20cm. Causes terror. D6 bonus attacks when charging targets in the open (in addition to normal +1 for charging).", upgrades:[], magic:[] },
      { id:"sk_screamingBell", name:"Screaming Bell", type:"Machine", atk:"0", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"Cannot move on initiative. May only move in a brigade with infantry. Destroyed if forced to retreat from combat. Cannot be driven back. Each Shooting phase, roll D6 per enemy unit within 20cm: on 6, that unit is confused (no save). Gains the best armour save of any friendly infantry within 10cm.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  lizardmen: {
    name:"Lizardmen", color:"#1a7a3a", bg:"#010502", accent:"#30d060",
    lore:"Ancient servants of the Old Ones, guided by the mighty Slann Mage-Priests and cold-blooded Saurus warriors.",
    armyRules:[{name:"Born in Jungle (Army Rule)", desc:"No command penalty is applied to any units in the Lizardmen army on account of dense terrain. The Lizardmen are used to communicating through thick jungle by instinct and subsonic noises inaudible to other races."}, {name:"Skinks", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Reptilian", desc:"Reptilian troops (Saurus, Temple Guard, Kroxigor, Cold One Riders) can only be issued an order by a character within 20cm. If Reptilian units are in a brigade, all Reptilian units must be within 20cm of the character issuing the order."}, {name:"Salamanders", desc:"Not deployed independently. Any Skink infantry unit may add one Salamander stand (+pts cost). Salamanders fight with their Skink unit. In shooting, use the Salamander’s own attacks (not the Skinks’). In combat, resolve Salamander attacks separately using its own Attack value. Destroyed if its Skink unit is destroyed. Max one Salamander per Skink unit."}, {name:"Stegadon", desc:"Uses a 40x60mm base. Causes terror. Can only brigade with Skink units (not Skinks with Salamanders, not other units, not other Stegadons). The crew has 15cm shooting range and 360 degree vision."}, {name:"Slann Mage Palanquin", desc:"The Slann General has Cmd 0 and cannot give orders — only Skink Heroes command. The Slann casts spells with +1 to casting rolls; all Wizards within 20cm also get +1. May ride a Stegadon (terror, breath attack retained). When on Stegadon, the Slann’s full-table Cmd range applies to his unit only. Up to 2 Palanquin Bodyguards (Temple Guard) may be attached."}],
        spells:[{name:"Gaze of Sotek", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat. Treated as 3 shooting attacks but armour has no effect. The unit can be driven back as with ordinary shooting."}, {name:"Mazdamundi's Revenge", cast:"4+", range:"60cm", desc:"Cast on any enemy unit within range (no LoS needed). Takes effect until end of opposing player's next turn. The unit cannot charge and if in combat will not pursue or advance — even units otherwise compelled to do so."}, {name:"Wings of the Jungle", cast:"5+", range:"N/A", desc:"Cast on the unengaged friendly unit the Wizard has joined. That unit moves as if it had received an order. The Wizard moves with it. Other characters that have joined the unit do not move."}, {name:"Shield of the Old Ones", cast:"5+", range:"30cm", desc:"Cast on a friendly unit engaged in combat (no LoS needed). Lasts for the following Combat phase. The unit's Armour value counts as 1 better (max 4+): 0→6+, 6+→5+, 5+→4+."}],
    playstyle:"Unique: the Slann General has Command 0 \u2014 succeeds on almost any roll but must be close. Cold-blooded Saurus are tough fighters; Terradons and Stegadons provide shock and terror. Dense terrain is your friend.",
    fluff:"Created by the mystical Old Ones as instruments of cosmic order, the Lizardmen of Lustria are ancient beyond comprehension. At their apex float the vast Slann Mage-Priests, borne on golden palanquins, their minds brushing the fabric of reality. Below them march cold-blooded Saurus warriors and nimble Skink skirmishers, while Stegadons crash through jungle and foe alike like living siege engines.",
    traits:["Command 0 Slann General", "Reptilian 20cm command range", "Massive monsters", "Born in Jungle"],
    strengths:"Slann Command 0, tough infantry, terrifying monsters",
    weaknesses:"20cm command range \u2014 brigades must stay very tight",
    generalCmd:0,
    units:[
      { id:"lz_slann", name:"Slann Mage Palanquin", type:"General", atk:"+2", hits:"-", armour:"-", cmd:0, size:1, pts:95, min:1, max:1, special:"Command 0. Cannot give orders directly — Skink characters within 20cm use Divine Guidance (no blunders on DG rolls). Command range covers entire battlefield. Casts spells. Can re-roll failed spells (except natural 1). Can cast through Skink Shamans within 20cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_saurusHero", name:"Saurus Hero", type:"Hero", atk:"+2", hits:"-", armour:"-", cmd:6, size:1, pts:45, min:"-", max:1, special:"Command range 20cm (Reptilian — all Reptilian units must be within 20cm to receive orders).", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_skinkHero", name:"Skink Hero", type:"Hero", atk:"+0", hits:"-", armour:"-", cmd:8, size:1, pts:70, min:"-", max:3, special:"Command range 60cm. Reptilian units must be within 20cm to receive orders.", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_skinkShaman", name:"Skink Shaman", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:1, special:"Command range 20cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"lz_stegadon_mount", name:"Stegadon Mount", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:90, min:"-", max:1, special:"Slann only may ride. +3 Attacks. Causes terror. No other character can ride a Stegadon.", upgrades:[], magic:[] },
      { id:"lz_carnosaur", name:"Carnosaur", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:65, min:"-", max:1, special:"Saurus Hero may ride. +2 Attacks. Causes terror.", upgrades:[], magic:[] },
      { id:"lz_skinks", name:"Skinks", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:35, min:2, max:"-", special:"Shoot 15cm, 360° vision. Salamander stands may be added.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_saurus", name:"Saurus", type:"Infantry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:75, min:2, max:"-", special:"Reptilian.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_templeGuard", name:"Temple Guard", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Reptilian. Elite guard.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_salamander", name:"Salamander", type:"Infantry", atk:"2/2", hits:"3", armour:"0", cmd:"-", size:"+1", pts:25, min:"-", max:2, special:"Attached to Skink unit as extra stand. Salamander Venom: -1 armour save for enemy hit by shooting.", upgrades:[], magic:[] },
      { id:"lz_kroxigor", name:"Kroxigor", type:"Infantry", atk:"5", hits:"3", armour:"4+", cmd:"-", size:3, pts:135, min:"-", max:2, special:"Reptilian. Heavy infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_coldOneRiders", name:"Cold One Riders", type:"Cavalry", atk:"4", hits:"3", armour:"4+", cmd:"-", size:3, pts:140, min:"-", max:2, special:"Reptilian. Elite cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"lz_terradons", name:"Terradons", type:"Monster", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flies. Shoot 15cm, 360° vision.", upgrades:[], magic:[] },
      { id:"lz_stegadon", name:"Stegadon", type:"Monster", atk:"10/3", hits:"10", armour:"4+", cmd:"-", size:1, pts:225, min:"-", max:1, special:"Causes terror. At 6-9 hits (not engaged): Badly Hurt — Hits/Attacks halved to 5/2. Can only brigade with Skinks. 15cm shooting, 360° vision.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  bretonnia: {
    name:"Bretonnia", color:"#1a4a8a", bg:"#010308", accent:"#3070d0",
    lore:"A feudal kingdom of honourable knights blessed by the Lady of the Lake, backed by masses of expendable peasantry.",
    armyRules:[{name:"Feudal Society (Army Rule)", desc:"Calculate army withdrawal differently: only count Knights, Grail Knights and Pegasus Knights at the start of the game. Once half or more of these units are lost, the army must withdraw. Peasants and other infantry do not count."}, {name:"Peasants", desc:"Peasants suffer an additional -1 Command penalty when ordered. This penalty is waived if the Peasant unit is in a brigade with at least one non-Peasant unit. Cannot use initiative to charge (but can evade as usual). Capable of supporting charges. When they charge, they receive no bonus attack modifier."}, {name:"Knights", desc:"Always use initiative to charge an enemy if possible; cannot be given orders instead. Never evade. Immune to terror — no -1 Attack modifier."}, {name:"Grail Knights", desc:"In addition to Knight rules, if charging an enemy in the open they receive an additional +1 Attack modifier (same as chariots and monsters)."}, {name:"Trebuchet", desc:"40×60mm base. Can move or shoot, not both. Destroyed if driven back 10cm+ by shooting. Requires LoS; shoots straight from barrel, 60cm range. Uses Stone Thrower rules (hits def and fort units). Malfunction on 1: roll again — 1–3 = destroyed, 4–6 = no fire this turn. Cannot shoot into combat."}, {name:"Hippogriff Mount", desc:"Only the General can ride a Hippogriff. Flies (move 100cm), adds +2 Attacks. Unit causes terror."}],
        spells:[{name:"Shield of Combat", cast:"4+", range:"N/A", desc:"Cast on the unit the Enchantress has joined. Lasts until end of opposing player's following turn. The unit may re-roll any failed armour rolls during the Combat phase. This does not include hits from enemy missile fire during a charge (covered by Aerial Shield). Only one re-roll is ever permitted."}, {name:"Eerie Mist", cast:"4+", range:"30cm", desc:"Cast on any enemy unit within range (no LoS needed). Lasts until end of opposing player's following turn. The unit cannot use initiative. Any order to the unit or brigade suffers -1 Command penalty."}, {name:"Aerial Shield", cast:"5+", range:"30cm", desc:"Cast on a friendly unit (no LoS needed). Lasts until beginning of next Bretonnian Shooting phase. All enemies that shoot at the enchanted unit get -1 on shooting rolls (minimum 6+ regardless of other modifiers)."}, {name:"Lady's Favour", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade, no supporting charge. The unit moves as if it had received an order. Characters that have joined do not move."}],
    playstyle:"A cavalry-focused army where Knights always charge on initiative. Use them as your strike force. Peasant units are cheap filler \u2014 keep them brigaded with Knights to avoid their command penalty.",
    fluff:"A feudal realm of chivalric tradition, Bretonnia is ruled by a warrior nobility who dedicate their lives to feats of arms and the quest for the Grail. Blessed by the Lady of the Lake, Grail Knights are touched by divinity. Below them masses of expendable Peasant levies form a backdrop to the glittering cavalry charge \u2014 unstoppable, honour-bound, glorious.",
    traits:["Always-charging Knights", "Feudal withdrawal rule", "Peasant limitations", "Grail Knights elite"],
    strengths:"Powerful knight charges, Trebuchet",
    weaknesses:"Peasants are a liability; knights must always charge",
    generalCmd:9,
    units:[
      { id:"br_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Feudal: withdrawal based only on Knights/Grail Knights/Pegasus Knights lost.", upgrades:[], magic:["devices"] },
      { id:"br_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"br_enchantress", name:"Enchantress", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"br_unicorn", name:"Unicorn", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"Enchantress only. +1 Attack. Once per battle: +1 to spell casting roll.", upgrades:[], magic:[] },
      { id:"br_pegasus", name:"Pegasus", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Hero/Enchantress may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"br_hippogriff", name:"Hippogriff", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General only may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"br_grailReliquae", name:"Grail Reliquae", type:"Special", atk:"-", hits:"-", armour:"-", cmd:"-", size:1, pts:60, min:"-", max:1, special:"Given to one Peasant unit — that unit and touching Peasant units become Grail Pilgrims: immune to terror, no -1 Command penalty, +1 Attack, must charge on initiative, cannot be driven back or confused. Still no +1 for charging in open.", upgrades:[], magic:[] },
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
    armyRules:[{name:"Winged Lancers", desc:"Receive +1 Attack in the first round of every combat when fighting to the front. Immune to Terror."}, {name:"Horse Archers and Cossacks", desc:"Kislevite Horsemen have 15cm shooting range and 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Bowmen", desc:"One unit of Bowmen per 1000pts can replace a unit of Axemen while still counting for Axemen min/max value."}, {name:"Red Guard", desc:"Armed with handguns in addition to long axes. Count enemy Armour values as one worse when shot (3+ = 4+, 4+ = 5+, 5+ = 6+, 6+ = no save)."}, {name:"Bears", desc:"Defined as infantry for movement purposes but add +1 Attack when charging an enemy in the open (like monsters and chariots). Can only give and receive support from other Bear units. Must pursue retreating enemies where possible. Never count as defended outside dense terrain."}, {name:"War Wagon", desc:"Cannot charge; moves 20cm. May end a move of up to 5cm in laager (360° vision). Laager: 3 shots/30cm, 6 attacks from any direction; cannot move next turn. Line: 2 shots/30cm, moves 20cm, def. No brigade with cavalry. Never driven back — retreats 5cm in formation instead. In combat: no advance or pursue. If routed in laager: destroyed. If forced onto a unit: both destroyed."}, {name:"Tzarina Upgrade", desc:"The General may be upgraded to the Tzarina (+25pts, max 1 per army). She casts spells as a Wizard and may carry a Wizard magic item. Once per battle she may add +1 to a casting dice result (announce before rolling)."}],
        spells:[{name:"Monster Bear!", cast:"5+", range:"N/A", desc:"The Wizard must have joined a unit engaged in combat. Lasts for the following Combat phase. The unit causes terror and the Wizard gains +2 Attacks. Note: if the Tzarina casts this she adds +4 total (+2 General, +2 spell)."}, {name:"Icy Blast", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat. Treated as 3 shooting attacks but armour has no effect — all targets count as having no armour. The unit can be driven back as with ordinary shooting."}, {name:"Chill", cast:"4+", range:"30cm", desc:"Cast on an enemy unit engaged in combat and within range (no LoS needed). Lasts for the following Combat phase. Every stand in the unit, including characters, deducts -1 from its Attacks value."}, {name:"Freeze", cast:"6+", range:"60cm", desc:"Cast on any enemy unit not engaged in combat within range (no LoS needed). Roll a D6 — if the score exceeds the unit's Hits value, one stand is destroyed (no save). If not, no effect. Cannot cause drive back."}],
    playstyle:"A fast, mobile army dominating open ground. Horse Archers screen and harry; Winged Lancers deliver the killing blow. The War Wagon is a powerful firebase. Avoid dense terrain \u2014 you want room to manoeuvre.",
    fluff:"Between the Empire and the Realm of Chaos stands Kislev \u2014 a cold, windswept land hardened by centuries of brutal winters and Chaos raids. Kislevite armies are dominated by cavalry: swift Horse Archers, heavy Cossacks and the feared Winged Lancers whose charge has broken many a Chaos warband. Their shamans call upon the elemental spirits of ice and storm.",
    traits:["Cavalry-heavy", "Good missile units", "War Wagon anchor", "Winged Lancer shock troops"],
    strengths:"Fast and mobile, great shooting cavalry",
    weaknesses:"Weaker in dense terrain; lighter infantry",
    generalCmd:9,
    units:[
      { id:"ki_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ki_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ki_shaman", name:"Shaman", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ki_bear", name:"Bear Mount", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Shaman may ride a Bear. +1 Attack.", upgrades:[], magic:[] },
      { id:"ki_yozhin", name:"Yozhin of the Bog", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:40, min:"-", max:1, special:"Shaman only may ride Yozhin. +1 Attack. No terrain restriction for water/boggy/swamp. Unit joined by Yozhin-riding Shaman causes terror.", upgrades:[], magic:[] },
      { id:"ki_tzarina", name:"Tzarina", type:"Special", atk:"+0", hits:"-", armour:"-", cmd:"-", size:1, pts:25, min:"-", max:1, special:"Attached to General. Ice Queen: special ice magic ability.", upgrades:[], magic:[] },
      { id:"ki_wingedLancers", name:"Winged Lancers", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"+1 Attack in first round when fighting to front. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_horseArchers", name:"Horse Archers", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:2, max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_cossacks", name:"Cossacks", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:2, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_bowmen", name:"Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Standard missile troops.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_redGuard", name:"Red Guard", type:"Infantry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:1, special:"Handguns: armour piercing (enemy armour one worse).", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_axemen", name:"Axemen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Core infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ki_bears", name:"Bears", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:90, min:"-", max:1, special:"+1 Attack charging in open (like monster). Can only give/receive support from other Bears. Must pursue and must advance if able. Never count as defended outside dense terrain.", upgrades:[], magic:[] },
      { id:"ki_warWagon", name:"War Wagon", type:"Artillery", atk:"4/4", hits:"4", armour:"4+", cmd:"-", size:2, pts:125, min:"-", max:1, special:"4 shooting + 4 combat attacks. Shoot 360°, 30cm. Armour piercing. Two stands: wagon and team.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  dark_elves: {
    name:"Dark Elves", color:"#6010a0", bg:"#040008", accent:"#9020e0",
    lore:"Bitter exiles of Naggaroth devoted to Khaine, fielding merciless warriors and monstrous beasts.",
    armyRules:[{name:"Crossbowmen and Dark Riders", desc:"These units have repeating crossbows. They shoot twice (2 attacks per stand) at targets within 15cm, and once (1 per stand) at 16-30cm range. Against charging enemies they shoot once per stand regardless of range."}, {name:"Witch Elves", desc:"Always charge on initiative; cannot be given orders instead. Never evade. Cannot be driven back by shooting. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Cold One Knights", desc:"Add +1 Attack in the first round of each combat when fighting to the front (front edge or frontal corners contact). Cannot form brigades except with other Cold One Knight units."}, {name:"War Hydra", desc:"Cannot brigade even with other War Hydras. Causes terror. Breathes fire: 20cm range, 2 Attacks. After all hits are struck in a round (if not slain), the Hydra automatically regenerates 1 hit suffered that round. Regenerated hits still count towards the combat result."}, {name:"Dark Elf General", desc:"If a Hero or Sorceress rolls a double 6 when issuing orders, the General must either lose 1 Command value (e.g. 10 becomes 9) or execute the failed underling — the character is removed as a casualty but does not count for enemy victory points. If the General rolls a double 6 (blunder), the General automatically loses 1 Command value regardless."}],
        spells:[{name:"Doom Bolt", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Sorceress in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Black Horror", cast:"6+", range:"50cm", desc:"Cast on a visible enemy unit not engaged in combat. The unit suffers 4 attacks with no armour saves. The unit is not driven back — the vortex sucks victims down."}, {name:"Dominion", cast:"4+", range:"60cm", desc:"Cast on any enemy unit within range (no LoS needed). Takes effect until end of opposing player's next turn. The unit cannot charge and will not pursue or advance — even units otherwise compelled to do so."}, {name:"Soul Stealer", cast:"5+", range:"N/A", desc:"Cast when the Sorceress has joined a unit in combat. Targets one enemy unit touching the Sorceress's unit. Three shooting attacks are worked out and no armour saves apply. Hits are carried over into the first round of combat and count as having been struck in the combat itself."}],
    playstyle:"An aggressive high-risk army. Repeating crossbows generate huge shooting volume. Cold One Knights cannot brigade \u2014 use them as independent hammers. The execution mechanic means characters may be killed for blunders.",
    fluff:"Exiled from Ulthuan ten thousand years ago, the Dark Elves of Naggaroth have nursed their hatred into something magnificent and terrible. Witch Elves driven to ecstatic frenzy, Cold One-riding knights, and monstrous War Hydras march alongside soldiers whose repeating crossbows can riddle an enemy unit before it reaches combat. Beauty and death are the same thing in Naggarond.",
    traits:["Repeating crossbows", "Execution mechanic", "Cold One Knights", "Witch Elves frenzy"],
    strengths:"Massive shooting volume, elite cavalry",
    weaknesses:"Execution mechanic punishes bad dice; Cold Ones can't brigade",
    generalCmd:10,
    units:[
      { id:"de_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:10, size:1, pts:155, min:1, max:1, special:"If Hero/Sorceress rolls double-6, General loses 1 Command or executes them (remove, no VPs). Blunder by General also loses 1 Command. Minimum Command 8.", upgrades:[], magic:["devices"] },
      { id:"de_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"de_sorceress", name:"Sorceress", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"de_manticore", name:"Manticore", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"General/Hero/Sorceress may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"de_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Sorceress may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"de_cauldronBlood", name:"Cauldron of Blood", type:"Chariot Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"Sorceress only may ride. +2 Attacks. +1 to spell casting roll once per battle (announce before rolling). Reduces Sorceress movement to 30cm. Requires at least 1 unit of Witch Elves in the army.", upgrades:[], magic:[] },
      { id:"de_spearmen", name:"Spearmen", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core Dark Elf infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_crossbowmen", name:"Crossbowmen", type:"Infantry", atk:"3/2", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:1, max:"-", special:"Repeating crossbow: shoot twice at ≤15cm (6 attacks), once at ≤30cm (3 attacks). 1 attack/stand when shooting at chargers.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_witchElves", name:"Witch Elves", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:2, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_darkRiders", name:"Dark Riders", type:"Cavalry", atk:"3/2", hits:"3", armour:"6+", cmd:"-", size:3, pts:95, min:"-", max:3, special:"Repeating crossbow: shoot twice at ≤15cm. 1 attack/stand at chargers.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_coldOneKnights", name:"Cold One Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:130, min:"-", max:3, special:"+1 Attack in first round of each combat when fighting to front. Cannot brigade except with other Cold One Knights.", upgrades:[], magic:["standards","weapons"] },
      { id:"de_harpies", name:"Harpies", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:65, min:"-", max:1, special:"Flies. Based on long edge. Cannot be joined by characters.", upgrades:[], magic:[] },
      { id:"de_warHydra", name:"War Hydra", type:"Monster", atk:"6/2", hits:"4", armour:"4+", cmd:"-", size:1, pts:125, min:"-", max:1, special:"Causes terror. Cannot brigade. Breathes fire: 20cm, 2 attacks. Regenerates 1 hit per combat round (after removing stands). Regenerated hits count for combat results.", upgrades:[], magic:[] },
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
        desc:"Fresh Daemons emerge from the warp to reinforce their beleaguered kindred. Cast on any friendly Daemon unit of three stands that has lost one or two stands as casualties (no LoS needed). The unit regains one stand, placed behind, in front or beside another stand. If already in combat, the stand may be placed touching the enemy and counts as charging if the unit charged." },
      { name:"Daemonic Rage", cast:"5+", range:"30cm",
        desc:"Magical energy surges through daemonic bodies. Affects every friendly unit within 30cm range — lasts during the following Combat phase. Every unit gains a bonus +1 attack that can be allocated to any stand in the unit and can be allocated to a different stand in each combat round." },
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
        special:"Command range 60cm. Casts spells. Daemon units with only 1 stand remaining and further than 20cm from any friendly Daemon Wizard get -1 to Daemonic Instability rolls. Daemonic Instability.",
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
        spells:[{name:"Raise Dead", cast:"5+", range:"30cm", desc:"Cast on a combat within 30cm (no LoS). Places a 3-stand Skeleton unit in contact with the engagement; fails if stands cannot be legally placed. Raised dead do not count as charging; ignored for breakpoint and VPs. One Raise Dead per engagement per turn. Placement cannot split the engagement."}, {name:"Vanhel's Danse Macabre", cast:"5+", range:"40cm", desc:"Cast on any friendly unit except Ghouls within range (no LoS needed). Affects a single unit only — no brigade, no supporting charge. The unit moves as if it had received an order. Characters that have joined do not move."}, {name:"Death Bolt", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not engaged in combat. Treated as 3 shooting attacks with no armour saves. The unit can be driven back as with ordinary shooting."}, {name:"Curse of Years", cast:"6+", range:"N/A", desc:"Cast when the Wizard has joined a unit in combat. Targets one enemy unit touching the Wizard's unit. The unit takes six attacks worked out in the usual way. Hits are carried over into the first round of combat and count as having been struck in the first round for purposes of working out combat results."}],
    playstyle:"Undead immunity makes this army psychologically unbreakable. The Vampire Lord doubles as a Wizard. Ethereal Hosts ignore armour entirely. Build a solid infantry core and use Dire Wolves and Fell Bats to threaten flanks.",
    fluff:"In the cursed lands of Sylvania dwell the Vampire Counts \u2014 ancient undead nobles who rule over legions of risen dead. Driven by insatiable hunger and iron will, they marshal skeletal warriors, shambling Zombies, spectral Wraith-hosts and galloping Black Knights in a relentless crusade against the living. At their head stands the Vampire Lord \u2014 warrior, sorcerer and monster in one immortal form.",
    traits:["Undead immunity", "Vampire Lord also a Wizard", "Black Knights cavalry", "Ethereal Host ignores armour"],
    strengths:"Undead immunity, Ethereal Hosts, versatile characters",
    weaknesses:"Many units have low attack values",
    generalCmd:9,
    units:[
      { id:"vc_general", name:"Vampire Lord", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:150, min:1, max:1, special:"Command range covers entire battlefield. Also a Wizard: casts spells. Can take General OR Wizard magic items.", upgrades:[], magic:["weapons","devices"] },
      { id:"vc_vampire", name:"Vampire", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"vc_necromancer", name:"Necromancer", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
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
        spells:[{name:"Sand Storm", cast:"4+", range:"30cm", desc:"Cast on the Sorcerer himself. Lasts until end of opposing player's following turn. All enemy units within 30cm of the Sorcerer suffer -1 Command penalty when orders are issued to them."}, {name:"Mirage", cast:"4+", range:"60cm", desc:"Place an illusionary unit (chosen from the Araby list) within 60cm of the Sorcerer and more than 20cm from any enemy. The illusion cannot move or fight but is treated as real by the enemy until contacted. While the Mirage is on the table the Wizard cannot cast any other spells."}, {name:"Sunstrike", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Wizard in any direction. Each unit under the line takes 3 shooting attacks (including your own units). Unengaged units can be driven back (even friends); engaged units carry over hits."}, {name:"Curse of the Djinn", cast:"6+", range:"30cm", desc:"Cast on one enemy unit within range. The target must re-roll all successful armour saves for the following close combat phase. If the Sorcerer has a Djinn, the spell is cast on 5+ instead of 6+."}],
    playstyle:"An exotic, fast-moving army with unique options. Djinn-mounted wizards can shoot and fight. Magic Carpet cavalry fly. Elephants cause terror but can stampede. Blend missile cavalry harassment with elephant charges.",
    fluff:"South of the Old World lie the golden desert kingdoms of Araby \u2014 a land of ancient learning, extravagant wealth and powerful magic. Their armies march behind banners of silk, mounted on swift desert horses or lumbering War Elephants, their sorcerers carried aloft on Flying Carpets or bound Djinn. To face Araby is to face mystery.",
    traits:["Flying Carpets", "War Elephants", "Djinn sorcery", "Good cavalry mix"],
    strengths:"Unique flying options, elephants cause terror",
    weaknesses:"Elephants can stampede; coordination is complex",
    generalCmd:9,
    units:[
      { id:"ar_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ar_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ar_wizard", name:"Wizard", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ar_flyingCarpet", name:"Flying Carpet", type:"Chariot Mount", atk:"+0", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Wizard may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"ar_elephant_mount", name:"Elephant Mount", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:65, min:"-", max:1, special:"General/Hero/Wizard may ride. +2 Attacks. Causes terror. Cannot join a unit of friendly cavalry.", upgrades:[], magic:[] },
      { id:"ar_djinn", name:"Djinn", type:"Monstrous Mount", atk:"+2/+2", hits:"-", armour:"-", cmd:"-", size:1, pts:90, min:"-", max:1, special:"General/Hero/Wizard may ride. +2 Attacks in combat and +2 shooting attacks (only when character has joined a unit). Flies. Unit joined by Djinn causes terror.", upgrades:[], magic:[] },
      { id:"ar_spearmen", name:"Spearmen", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Core infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_bowmen", name:"Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:2, max:"-", special:"Archers.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_guards", name:"Guards", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:65, min:"-", max:4, special:"Sultan's elite guard. First order from General each turn at Command 10 (no penalties).", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_knights", name:"Knights", type:"Cavalry", atk:"3", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:"-", max:"-", special:"Heavy cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_desertRiders", name:"Desert Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_camelRiders", name:"Camel Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"5+", cmd:"-", size:3, pts:100, min:"-", max:2, special:"Ignore distance command modifiers. -1 Command penalty for all orders to them.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_magicCarpets", name:"Magic Carpets", type:"Cavalry", atk:"1/2", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flying cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"ar_elephants", name:"Elephants", type:"Monster", atk:"5", hits:"4", armour:"5+", cmd:"-", size:3, pts:200, min:"-", max:1, special:"Causes terror. Cannot brigade with cavalry. If would become confused, Stampedes instead (D6: 1-2 toward nearest enemy, 3-4 away from enemy, 5 toward nearest friend, 6 away from friend). Cannot be given orders while stampeding.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  dogs_of_war: {
    name:"Dogs of War", color:"#808020", bg:"#050500", accent:"#c0c030",
    lore:"Mercenary companies from across the Old World, hiring out to the highest bidder with diverse troops and tactics.",
    armyRules:[{name:"Pikemen", desc:"No def or fort benefit in dense terrain or on fortress walls. Count as def in the open vs. frontal attacks (enemy hit on 5+). Flanked or rear attacks: no defensive benefit, normal hits apply. Cannot charge on initiative. +1 atk when charged to the front by cavalry or chariots; no +1 for charging."}, {name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun. One Crossbowmen unit per 1000pts can be replaced by Handgunners at +10pts, still counting for Crossbowmen min/max."}, {name:"Ogres", desc:"Must use initiative to charge enemy human units within 20cm at start of Command phase. Automatic — commanders cannot prevent it. 'Humans' includes most men but not Dwarfs or Elves."}, {name:"Light Cavalry", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies."}, {name:"Giants", desc:"Must be given separate orders; cannot brigade with other troops (can brigade with other Giants). On a failed order, roll on the Giant Goes Wild chart. Giants with 5-7 hits while not engaged become Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Giants cause terror."}, {name:"Paymaster", desc:"Only one Paymaster per army. If the Pay Wagon is used, the Paymaster may add +1 to all his Command checks for a single turn only."}],
        spells:[{name:"Ball of Flame", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Wizard in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks. Unengaged units can be driven back; engaged units carry over hits into combat."}, {name:"Voice of Command", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade, no supporting charge. The unit moves as if it had received an order. Character stands that have joined do not move with it."}, {name:"Weird Enchantment", cast:"4+", range:"30cm", desc:"Cast on any enemy unit (no LoS needed). Lasts until end of opposing player's following turn. The unit moves at half pace in all situations. Counts all enemies as terrifying (-1 Attack), even if normally immune to terror. If the unit would normally cause terror it ceases to do so. Undead and Daemon targets do not count enemies as terrifying but all other penalties apply."},
      { name:"Teleport", cast:"2+", range:"N/A",
        desc:"The Wizard vanishes to reappear anywhere on the battlefield. Move the Wizard to any new position on the table — he can leave or join a unit if he wishes. Once moved, he can cast a second (different) spell this turn. A Wizard that Teleports can therefore potentially cast two spells that turn." }],
    playstyle:"The most diverse army in the game. You can field Dwarfs, Ogres, Birdmen, Giants and Knights together. The Paymaster's Pay Wagon provides morale bonuses. Build a balanced force exploiting the best of every culture.",
    fluff:"Coin is the language that all people speak. The Dogs of War are mercenary companies from every corner of the Old World, selling their blades to whoever can afford them. Tilean pike blocks march beside Norse Marauders; Dwarf engineers maintain the Galloper Guns; even Ogres hire out for plunder. Led by their Paymaster, these disparate warriors fight with surprising cohesion when the gold is good.",
    traits:["Mixed races in one army", "Dwarfs and Ogres available", "Pikemen formation bonus", "Paymaster morale rules"],
    strengths:"Incredible unit variety, Dwarfs and Ogres in one list",
    weaknesses:"No single specialisation; coordination complex",
    generalCmd:9,
    units:[
      { id:"dow_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"dow_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"dow_paymaster", name:"Paymaster", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Special Paymaster rules.", upgrades:[], magic:["weapons","devices"] },
      { id:"dow_wizard", name:"Wizard", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
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
      { id:"dow_galloperguns", name:"Galloper Guns", type:"Artillery", atk:"1/2+bounce", hits:"2", armour:"0", cmd:"-", size:2, pts:85, min:"-", max:1, special:"Light cannon. Range 40cm. Move 20cm (10cm half-pace). Can shoot at charging enemies.", upgrades:[], magic:[] },
      { id:"dow_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"dow_birdmen", name:"Birdmen of Catrazza", type:"Infantry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flies. Crossbow (30cm range). Based on long edge. Can be pursued by any enemy type.", upgrades:[], magic:["standards","weapons"] },
    ],
    upgradeRules:{}
  },

  ogre_kingdoms: {
    name:"Ogre Kingdoms", color:"#a05020", bg:"#060300", accent:"#e07030",
    lore:"Massive, brutal warriors from the mountains who eat everything and fear nothing.",
    armyRules:[{name:"Bull Ogres / Ogre infantry", desc:"If any Ogre infantry unit can use initiative to charge an enemy human unit within 20cm at start of Command phase, it must do so automatically. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Leadbelchers", desc:"15cm shooting range, 2 shooting attacks per unit. Shooting attacks impose a -1 penalty to armour rolls."}, {name:"Yhetees", desc:"Add +1 Attack when charging in the open (like monsters and chariots). Can only give/receive support from other Yhetee stands. Must pursue retreating enemies where possible and must advance into combat if able."}, {name:"Gnoblars", desc:"Shoot as if with bows at 15cm range. Cannot be supported by non-Gnoblar infantry (can support others as normal). Cannot have magic items. Characters cannot join Gnoblar units."}, {name:"Gorgers", desc:"Always -1 Command penalty when ordered due to beastly nature. Always ignore distance Command modifiers when receiving orders. Can pursue any retreating enemy type. May infiltrate onto the battlefield instead of deploying normally. Gorgers don't suffer -1 Command penalty for Dense Terrain."}, {name:"Slave Giant", desc:"Must be given separate orders; cannot brigade. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}],
        spells:[{name:"Tooth Cracker", cast:"3+", range:"30cm", desc:"Target friendly unit cannot be driven back or confused until your next turn."}, {name:"Bone Cruncher", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Counts as 3 shooting attacks with no armour save. Causes drive back as normal shooting."}, {name:"Bull Gorger", cast:"4+", range:"N/A", desc:"The Butcher must have joined a unit. Adds +1 Attack for each stand in the unit including the Butcher's own stand. Lasts for the following Combat phase."}, {name:"Troll Guts", cast:"5+", range:"30cm", desc:"Cast on a friendly unit in combat. Each stand in the affected unit gains +1 Hit during the following Combat phase."}],
    playstyle:"Pure aggression. Bull Ogres must charge humans on initiative \u2014 use this as a feature, not a bug. Ironguts and Rhinox Riders are devastating. Gnoblars screen your approach cheaply. Every engagement should end in one round.",
    fluff:"High in the mountains east of the Old World dwell the Ogres \u2014 massive, brutish beings driven by an insatiable hunger. They eat everything: livestock, enemies, the occasional ally. Rhinox-riding Maneaters charge like siege weapons; Yhetees howl through snowstorms; Gorgers emerge from underground to attack where least expected.",
    traits:["All units hit like monsters", "Must charge humans on initiative", "Rhinox Riders cause terror", "Gnoblars as cheap filler"],
    strengths:"Extremely high damage output, terrifying cavalry",
    weaknesses:"Forced charges can be exploited; limited shooting",
    generalCmd:9,
    units:[
      { id:"ok_tyrant", name:"Tyrant", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ok_bruiser", name:"Bruiser", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ok_butcher", name:"Butcher", type:"Wizard", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ok_bullRhinox", name:"Bull Rhinox", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:65, min:"-", max:1, special:"Tyrant/Bruiser/Butcher may ride. +2 Attacks. Causes terror.", upgrades:[], magic:[] },
      { id:"ok_bullOgres", name:"Bull Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:2, max:"-", special:"Must charge humans on initiative.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_leadbelchers", name:"Leadbelchers", type:"Infantry", atk:"3/2", hits:"4", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Cannon range 15cm, 2 attacks. -1 armour saves against their shots.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_ironguts", name:"Ironguts", type:"Infantry", atk:"4", hits:"4", armour:"4+", cmd:"-", size:3, pts:140, min:"-", max:2, special:"Elite Ogre warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_yhetees", name:"Yhetees", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:90, min:"-", max:2, special:"+1 Attack when charging in open (like monster). Can only support/be supported by other Yhetees. Must pursue.", upgrades:[], magic:[] },
      { id:"ok_gnoblars", name:"Gnoblars", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:"-", max:4, special:"Shoot 15cm (bows). Cannot be supported by other types. Cannot have magic items. Characters cannot join.", upgrades:[], magic:[] },
      { id:"ok_gorgers", name:"Gorgers", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"-1 Command penalty. Ignore distance modifiers. Can infiltrate. Can pursue any type.", upgrades:[], magic:[] },
      { id:"ok_rhinoxRiders", name:"Rhinox Riders", type:"Cavalry", atk:"5", hits:"4", armour:"5+", cmd:"-", size:3, pts:200, min:"-", max:1, special:"Immune to terror. +1 Attack when charging enemy in the open.", upgrades:[], magic:["standards","weapons"] },
      { id:"ok_sabretusks", name:"Sabretusks", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:1, special:"Fast hunting cats.", upgrades:[], magic:[] },
      { id:"ok_slaveGiant", name:"Slave Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"ok_scrapLauncher", name:"Scrap Launcher", type:"Artillery", atk:"1/3", hits:"3", armour:"0", cmd:"-", size:1, pts:75, min:"-", max:1, special:"Stone Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  albion: {
    name:"Albion", color:"#507030", bg:"#030502", accent:"#80b040",
    lore:"Mist-shrouded isle of fierce barbarian chieftains, druids, giants and great wolfhounds.",
    armyRules:[{name:"Ogres", desc:"If an Ogre unit can use initiative to charge an enemy human unit within 20cm at start of Command phase, it must do so automatically. 'Humans' includes Chaos Warriors and Marauders but not Dwarfs or Elves."}, {name:"Giant", desc:"Must be given separate orders; cannot brigade with other troops. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}, {name:"Fenbeast", desc:"Cannot be deployed normally; summoned by a Druid via the Summon Fenbeast spell. Causes terror. If their Druid is slain, Fenbeasts are confused until a new Druid moves within 20cm. Regeneration: at the start of each Combat phase, restore one destroyed stand in base contact. Badly Hurt: at 3 hits, attacks halved to 2."}],
        spells:[{name:"Downpour", cast:"4+", range:"30cm", desc:"Until the start of the Druid player's next turn, all enemy units within 30cm of the casting Druid suffer -1 to their Command."}, {name:"Storm of Hail", cast:"5+", range:"30cm", desc:"Targets a single visible enemy unit within range. Counts as 3 shooting attacks ignoring any armour save. The target can be driven back as for shooting."}, {name:"Mists of Albion", cast:"5+", range:"30cm", desc:"Cast on a single unengaged friendly Infantry unit within range (no LoS needed). Lasts until start of caster's next turn or until the target moves. The target counts as Defended even in open terrain."}, {name:"Summon Fenbeast", cast:"6+", range:"30cm", desc:"Summons a Fenbeast under the casting Druid's control. Cannot have more Fenbeasts on table than Druids. Fenbeasts may only be ordered by Druids, cannot brigade, have no points value and do not count for breakpoint or victory points."}],
    playstyle:"A classic barbarian army of chariots, cavalry and monster support. Wolfhounds are cheap and fast. Chariots are required minimums and form the offensive core. Giants add shock value. Simple, direct, effective.",
    fluff:"Lost in the mists of the northern ocean lies Albion \u2014 a wild, rain-soaked isle of standing stones, ancient power and fierce tribal warriors. The natives paint themselves for war and hurl themselves at invaders from chariots and horseback with savage ferocity. Giant wolfhounds the size of ponies run at their sides. Albion may seem barbaric \u2014 but it has never been conquered.",
    traits:["Chariots as core", "Massive wolfhound packs", "Giants available", "Druid magic"],
    strengths:"Strong chariots, cheap wolfhounds, giant support",
    weaknesses:"Limited range and shooting options",
    generalCmd:9,
    units:[
      { id:"al_general", name:"Chieftain General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"al_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"al_druid", name:"Druid", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"al_giantEagle_mount", name:"Giant Eagle Mount", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"Druid only may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"al_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Hero/Druid may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"al_warriors", name:"Warriors", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core Albion warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_slingers", name:"Slingers", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:1, max:6, special:"Shoot 15cm.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_ogres", name:"Ogres", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:105, min:"-", max:2, special:"Must charge humans on initiative.", upgrades:[], magic:[] },
      { id:"al_wolfhounds", name:"Wolfhounds", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:6, special:"Fast war hounds.", upgrades:[], magic:[] },
      { id:"al_cavalry", name:"Cavalry", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:4, special:"Albion horse cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_chariots", name:"Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:1, max:4, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"al_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"al_giantEagles", name:"Giant Eagles", type:"Monster", atk:"2", hits:"3", armour:"6+", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Flies.", upgrades:[], magic:[] },
      { id:"al_fenbeast", name:"Fenbeast", type:"Monster", atk:"6", hits:"4", armour:"5+", cmd:"-", size:1, pts:"-", min:"-", max:1, special:"Special individual unit. Cannot be fielded normally — see special rules. Causes terror. Druid has +1 Command (Cmd 8) when ordering Fenbeasts.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  goblin_army: {
    name:"Goblin Army", color:"#1a6010", bg:"#010400", accent:"#50b020",
    lore:"A vast all-goblin horde of wolf riders, night goblins, pump wagons and lumbering giants.",
    armyRules:[{name:"Goblins", desc:"A Goblin unit can shoot as if it had bows at 15cm range. Up to two units per 1000pts can be replaced by Squig Herd while still counting for the Goblin min/max value."}, {name:"Trolls", desc:"Distance Command penalties to Trolls are always doubled (40cm = -2, 60cm = -4). Trolls regenerate: in each combat round after whole stands are removed, Trolls automatically regenerate one outstanding hit. Regenerated hits still count towards the combat result."}, {name:"Wolf Riders", desc:"15cm shooting range with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies. Still needs Line of Sight from front edge to charge."}, {name:"Pump Wagon", desc:"Does not move by initiative or orders. Instead it always moves once automatically up to 1D6x10cm during the Command phase (no Command roll required). This can happen at any time during the Command phase but cannot interrupt orders or other movements. In the combat round it charges/pursues/advances, a Pump Wagon receives D6 Attacks in addition to normal extra charge attacks."}, {name:"Giants", desc:"Must be given separate orders; cannot brigade with other troops (can brigade with other Giants). On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}],
        spells:[{name:"Mork Save Uz!", cast:"5+", range:"30cm", desc:"Cast on any friendly unit within 30cm. The unit gains a 5+ save (worked out normally) until the beginning of their next turn. If the unit already has a saving roll, choose which to use — may not take both."}, {name:"Gerroff!!!", cast:"5+", range:"60cm", desc:"Cast on any unengaged enemy unit within range (no LoS needed). The enemy unit is driven back 1D6×5cm towards its own table edge. Cannot be routed by this drive back."}, {name:"Brain Busta", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Treated as 3 shooting attacks but armour has no effect. Can cause drive back as normal shooting."}, {name:"Waaagh!", cast:"4+", range:"30cm", desc:"Cast on a friendly unit of Goblins (including Squig Herds, Wolf Riders, Wolf Chariots, Pump Wagons — not Trolls, Giants, or non-greenskins) engaged in combat (no LoS needed). Every stand in the unit, including characters that have joined the unit, gains +1 Attack for the following Combat phase."}],
    playstyle:"Masses of cheap goblins backed by hard-hitting Trolls and chaotic Pump Wagons. Win by sheer volume and troll-fuelled brawls in the middle. Pump Wagons are hilarious and occasionally devastating.",
    fluff:"When left entirely to their own devices \u2014 without even Orcs to boss them about \u2014 Goblins organise. Sort of. A Goblin Warboss of sufficient cunning can marshal Wolf Rider hordes, Night Goblin mobs clutching their beloved Squigs, lumbering Trolls and the utterly unpredictable Pump Wagons into a force perfectly capable of burying an enemy in sheer green numbers.",
    traits:["All-goblin force", "Pump Wagons auto-move", "Trolls regenerate", "Low command values"],
    strengths:"Very cheap troops, trolls, unpredictable pump wagons",
    weaknesses:"Low stats, low command values",
    generalCmd:8,
    units:[
      { id:"ga_general", name:"Goblin Warboss", type:"General", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"ga_hero", name:"Goblin Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:4, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ga_shaman", name:"Goblin Shaman", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:6, size:1, pts:30, min:"-", max:2, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"ga_chariot_mount", name:"Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"Warboss/Hero/Shaman may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"ga_wyvern", name:"Wyvern", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Warboss/Hero/Shaman may ride. Flies (move 100cm). Unit causes terror.", upgrades:[], magic:[] },
      { id:"ga_goblins", name:"Goblins", type:"Infantry", atk:"2/1", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:4, max:"-", special:"Shoot 15cm. Up to 2 per 1000pts replaced by Squig Herds.", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_squigHerd", name:"Squig Herd", type:"Infantry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:30, min:"-", max:"-", special:"Counts toward Goblin min/max (max 2 per 1000pts).", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_trolls", name:"Trolls", type:"Infantry", atk:"5", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:4, special:"Regenerate 1 hit per combat round. Command penalty for distance doubled.", upgrades:[], magic:[] },
      { id:"ga_wolfRiders", name:"Wolf Riders", type:"Cavalry", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_wolfChariots", name:"Wolf Chariots", type:"Chariot", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:4, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"ga_pumpWagon", name:"Pump Wagon", type:"Chariot", atk:"D6", hits:"3", armour:"5+", cmd:"-", size:1, pts:50, min:"-", max:2, special:"Auto-moves 1D6×10cm (no order needed). D6 attacks when charging/pursuing/advancing; D3 when charged or retreating. Cannot brigade. Cannot be driven back. Ignores confusion. Characters cannot join. No VPs; does not count for break value.", upgrades:[], magic:[] },
      { id:"ga_giant", name:"Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"ga_doomDiver", name:"Doom Diver", type:"Artillery", atk:"1/3", hits:"2", armour:"0", cmd:"-", size:2, pts:80, min:"-", max:1, special:"Range 60cm. Normal armour saves apply. Cannot shoot at charging enemies.", upgrades:[], magic:[] },
      { id:"ga_spearChukka", name:"Spear Chukka", type:"Artillery", atk:"1/2+skewer", hits:"2", armour:"0", cmd:"-", size:2, pts:65, min:"-", max:2, special:"Bolt Thrower.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  witch_hunters: {
    name:"Witch Hunters", color:"#505050", bg:"#030303", accent:"#909090",
    lore:"Fanatical warriors of righteousness hunting Chaos and Undead with purging fire and righteous steel.",
    armyRules:[{name:"Chaos and Undead Definitions (Army Rule)", desc:"'Chaos' means Chaos, Daemons, Beastmen, Chaos Dwarf and Skaven armies. 'Undead' means Tomb Kings and Vampire Counts armies (including Ghouls). These definitions apply to all special rules that reference 'Chaos or Undead'."}, {name:"Zealots", desc:"Gain +1 Attack in the first round of combat against Undead or Chaos (regardless of who charged). Always use initiative to charge Undead or Chaos enemies if possible. Must pursue or advance if victorious against Undead or Chaos."}, {name:"Handgunners", desc:"Count enemy Armour values as one worse when shot by a handgun (3+ = 4+, 4+ = 5+, 5+ = 6+, 6+ = no save)."}, {name:"Flagellants", desc:"Always charge on initiative; cannot be ordered instead. Never evade. Cannot be driven back by shooting; no drive-back rolls. Must pursue or advance if victorious. Unaffected by terror (no -1 atk)."}, {name:"Warhounds", desc:"Warhound stands are not deployed independently. Any infantry unit may add one Warhound stand, making the unit 4 stands total. Warhounds share the unit Armour, fight as part of the unit and can be removed as a casualty. Warhound casualties never count for Command penalties and they never cause Irregular Formation."}, {name:"Pistoliers", desc:"Shooting range 15cm with 360 degree vision — stands draw line of sight from all edges for evading and shooting, including at charging enemies. Still needs Line of Sight from front edge to charge."}],
        spells:[{name:"Sanctuary", cast:"5+", range:"N/A", desc:"The Warrior Priest must be with the unit. The unit counts as Defended (even in open); if already Defended it counts as Fortified — including Cavalry. Effect lasts until the unit moves, the Priest leaves it, or he casts another spell."}, {name:"Doctrine of Sigmar", cast:"5+", range:"30cm", desc:"Cast on any unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade. The unit moves as if it had received an order. Characters that have joined do not move."}, {name:"Holy Fervour", cast:"4+", range:"N/A", desc:"The Warrior Priest must be with the unit. Each stand in the unit, including character stands, gains +1 Attack during the following Combat phase."}, {name:"Divine Curse", cast:"4+", range:"30cm", desc:"Cast on any enemy unit within range (no LoS). Lasts until end of opponent's next turn. Unit moves at half pace, even when charging. Unit counts all enemies as terrifying (-1 Atk) even if normally immune. If unit normally causes terror, it ceases to. Undead/Daemon targets do not count enemies as terrifying but all other penalties apply."}],
    playstyle:"A specialised Empire variant optimised against Chaos and Undead opponents. Zealots charge those enemies for free and fight with bonus attacks. Stack Handgunners for armour-piercing fire. Best against specific matchups.",
    fluff:"In a world riven by Chaos corruption and undead horror, the Witch Hunters stand as humanity's last line of sanity. Armed with pistols, torches and unshakeable faith, they lead armies of fanatic Zealots who gain supernatural courage when facing Chaos or the Undead \u2014 fighting beings that would break ordinary soldiers with righteous fury instead of fear.",
    traits:["Zealots bonus vs Chaos/Undead", "Heavy on Handgunners", "Warrior Priest spells", "Righteous fury theme"],
    strengths:"Zealot bonuses vs Chaos/Undead, lots of handguns",
    weaknesses:"Mediocre against non-Chaos/Undead opponents",
    generalCmd:9,
    units:[
      { id:"wh_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"wh_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"wh_warriorPriest", name:"Warrior Priest", type:"Wizard", atk:"+1", hits:"-", armour:"-", cmd:7, size:1, pts:55, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
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
    armyRules:[{name:"Blunderbusses", desc:"15cm shooting range, 2 shooting attacks. Hits impose -1 penalty to armour rolls. One unit per 1000pts can replace a Warrior unit while still counting for Warriors min/max value."}, {name:"Hobgoblins", desc:"15cm shooting range with 360 degree vision. Hobgoblins and Hobgoblin Wolf Riders may not brigade with Black Orcs or Orc Slaves unless a unit of Chaos Dwarfs or Blunderbusses is also in the brigade."}, {name:"Orc Slaves", desc:"Suffer an additional -1 Command penalty when ordered. This penalty is waived if brigaded with Black Orcs, Chaos Dwarfs or Blunderbusses."}, {name:"Earthshaker Cannon", desc:"Acts as a Stone Thrower. Drive-back from Earthshaker shots causes Confusion on rolls of 4+ (instead of the normal 6+). Units in base contact with the target unit also risk Confusion on a roll of 6 (roll for each such unit)."}, {name:"Death Rocket", desc:"Stone Thrower style, fires 1D6 attacks per shot. Hits allow armour saves at -1 penalty. If D6 roll is 1: misfire (roll on Death Rocket Misfire Chart)."}, {name:"Sorcerer Lord Upgrade", desc:"The General may upgrade to Sorcerer Lord (+25pts). Sorcerer Lord can cast spells like a Wizard and may carry Wizard-restricted magic items. Once per battle: +1 to casting roll."}],
        spells:[{name:"Flaming Hand", cast:"4+", range:"N/A", desc:"The Sorcerer must have joined a unit in combat. Automatically makes 3 attacks on one enemy unit touching the Sorcerer's unit. Hits are carried over into the first round of combat and count as having been struck in combat."}, {name:"Volcanic Eruption", cast:"6+", range:"30cm", desc:"Each enemy unit within 30cm takes 3 attacks (normal way). Units are not driven back. Engaged units carry over hits into the first round of combat."}, {name:"Word of Fear", cast:"4+", range:"30cm", desc:"Cast on any friendly unit within range (no LoS needed). The unit counts as causing terror for the duration of the Combat phase."}, {name:"Meteor Storm", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Sorcerer in any direction. Each unit under the line takes 3 shooting attacks (including your own units). Unengaged units can be driven back (even friends); engaged units carry over hits."}],
    playstyle:"A hybrid of Dwarf toughness and Chaos aggression with slave infantry. The Earthshaker is the best stone thrower available. Great Taurus gives characters terrifying mobility. Mix Chaos Dwarfs and Blunderbusses for a devastating combined arms centre.",
    fluff:"Deep in the Dark Lands, in the shadow of the Tower of Zharr-Naggrund, dwell the Chaos Dwarfs \u2014 a civilisation twisted by dark sorcery into cruel, hat-wearing slavers. They enslave Orcs and Hobgoblins as expendable infantry, ride monstrous fire-breathing Taurus beasts, and build the most devastating siege weapons in the world. Their Sorcerer-Priests literally turn to stone over centuries of dark power.",
    traits:["Best stone thrower in game", "Flying Great Taurus mount", "Enslaved orc soldiers", "Lammasu anti-magic"],
    strengths:"Earthshaker cannon, tough core infantry, flying characters",
    weaknesses:"Slave troops have limitations; expensive core",
    generalCmd:9,
    units:[
      { id:"cd_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. May upgrade to Sorcerer Lord (+25pts): can cast spells, +1 to one spell per battle.", upgrades:[], magic:["devices"] },
      { id:"cd_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"cd_sorcerer", name:"Sorcerer", type:"Wizard", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"cd_greatTaurus", name:"Great Taurus", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Any character may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"cd_lammasu", name:"Lammasu", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:35, min:"-", max:1, special:"Sorcerer only. Flies (move 100cm). Once per turn: dispel one hostile spell within 30cm on 4+.", upgrades:[], magic:[] },
      { id:"cd_chaosDwarfs", name:"Chaos Dwarfs", type:"Infantry", atk:"3", hits:"4", armour:"4+", cmd:"-", size:3, pts:110, min:2, max:4, special:"Core Chaos Dwarf infantry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_blunderbusses", name:"Blunderbusses", type:"Infantry", atk:"3/2", hits:"4", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:2, special:"Range 15cm, 2 attacks. -1 to enemy armour saves. Up to 1 per 1000pts replaces Chaos Dwarf unit.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_hobgoblins", name:"Hobgoblins", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:45, min:"-", max:"-", special:"Shoot 15cm, 360° vision. Cannot brigade with Black Orcs/Orc Slaves unless Chaos Dwarfs present.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_blackOrcs", name:"Black Orcs", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Elite orc slaves.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_orcSlaves", name:"Orc Slaves", type:"Infantry", atk:"4", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:2, special:"-1 Command penalty (waived if brigaded with Black Orcs/Chaos Dwarfs/Blunderbusses).", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_hobgoblinWolfRiders", name:"Hobgoblin Wolf Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:"-", special:"Shoot 15cm, 360° vision. Cannot brigade with Black Orcs/Orc Slaves unless Chaos Dwarfs present.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_bullCentaurs", name:"Bull Centaurs", type:"Cavalry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:140, min:"-", max:2, special:"Powerful cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"cd_earthshaker", name:"Earthshaker Cannon", type:"Artillery", atk:"1/3", hits:"3", armour:"6+", cmd:"-", size:1, pts:90, min:"-", max:1, special:"Stone Thrower. Drive-backs cause Confusion on 4+. Adjacent units confused on 6. Max 1 Earthshaker+Death Rocket per 1000pts.", upgrades:[], magic:[] },
      { id:"cd_deathRocket", name:"Death Rocket", type:"Artillery", atk:"1/1D6", hits:"2", armour:"6+", cmd:"-", size:1, pts:60, min:"-", max:1, special:"Stone Thrower style, fires 1D6 attacks per shot. Hits allow armour saves at -1 penalty. If D6 roll is 1: misfire (roll on Death Rocket Misfire Chart). Max 1 Earthshaker+Death Rocket per 1000pts.", upgrades:[], magic:[] },
      { id:"cd_boltThrower", name:"Bolt Thrower", type:"Artillery", atk:"1/2+skewer", hits:"2", armour:"0", cmd:"-", size:2, pts:65, min:"-", max:1, special:"Bolt Thrower with skewer rule.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  wood_elves: {
    name:"Wood Elves", color:"#2a6020", bg:"#020501", accent:"#40a030",
    lore:"Guardians of the enchanted forest of Loren, masters of ambush and the bow, aided by the forest's living denizens.",
    armyRules:[{name:"Woodland Folk (Army Rule)", desc:"All Wood Elf infantry does not suffer the usual -1 Command penalty when within woodland."}, {name:"Glade Guard", desc:"Add +1 to shooting dice rolls (hit on 3+ in open, 4+ defended, 5+ fortified)."}, {name:"Wardancers", desc:"Not deployed independently. Any Glade Guard or Eternal Guard unit may add one Wardancer stand (making 4 stands total). Wardancers share the unit Armour, fight as part of the unit and can be removed as a casualty. Their casualties never count for Command penalties and they never cause Irregular Formation."}, {name:"Waywatchers", desc:"Add +1 to shooting dice rolls AND resolve attacks at -1 to enemy Armour value. May also infiltrate: issue an infiltration order to a point in dense terrain or any table edge except the enemy's. On success the unit appears there."}, {name:"Forest Spirits (Dryads, Treekin, Treeman)", desc:"Immune to terror. Suffer -1 Command penalty when ordered by General or Noble (not Spell Weaver). The Treeman Ancient and Branchwraith are Hero characters."}, {name:"Wild Riders", desc:"+1 Attack in the first round of every combat when fighting to the front."}],
        spells:[{name:"Tree Singing", cast:"5+", range:"30cm", desc:"Cast on a single unengaged friendly Infantry unit within range (no LoS needed). Lasts until start of caster's next turn or until target moves. The target Infantry unit counts as Defended even in open terrain."}, {name:"Twilight Host", cast:"5+", range:"30cm", desc:"Target unit causes terror until the Wood Elf's next magic phase."}, {name:"Call of the Hunt", cast:"5+", range:"30cm", desc:"Cast on an unengaged friendly unit within range (no LoS needed). The unit may make a charge move into contact with the nearest visible enemy. Enemy may not shoot at the chargers."}, {name:"Fury of the Forest", cast:"6+", range:"60cm", desc:"Makes 3 shooting attacks on all enemy units within 10cm of a chosen wooded terrain piece. Units get no armour save if within the wooded terrain. Unengaged units are not driven back. Engaged units carry over hits."}],
    playstyle:"Masters of terrain. Woodland Folk units suffer no command penalty in dense terrain \u2014 turn forests into fortresses. Waywatchers infiltrate and pick off weak units. Treemen anchor your line.",
    fluff:"Within the enchanted forest of Athel Loren dwell the Wood Elves \u2014 ancient guardians grown as much a part of the forest as the trees themselves. They do not conquer; they protect. Those who threaten the forest meet ghostly Waywatchers materialising from nowhere, Glade Guard arrows darkening the sky, and eventually the slow inevitable advance of living Treemen who have seen ten thousand years pass.",
    traits:["Woodland Folk \u2014 dense terrain bonus", "Waywatcher ambush", "Treemen monsters", "Forest Dragon"],
    strengths:"Dense terrain mastery, infiltrating Waywatchers, solid all-round",
    weaknesses:"Weaker in open terrain; limited heavy hitting outside Treeman",
    generalCmd:10,
    units:[
      { id:"we_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:10, size:1, pts:155, min:1, max:1, special:"Command range covers entire battlefield. Woodland Folk: no -1 Command penalty in woodland.", upgrades:[], magic:["devices"] },
      { id:"we_noble", name:"Noble", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"we_treemanAncient", name:"Treeman Ancient", type:"Hero", atk:"+3", hits:"-", armour:"-", cmd:8, size:1, pts:130, min:"-", max:1, special:"Command range 60cm. -1 Command when ordering non-Forest Spirit units. Can only join Forest Spirit units. Can cast Tree Singing spell. Units joined cause terror. Cannot take magic items.", upgrades:[], magic:[] },
      { id:"we_branchwraith", name:"Branchwraith", type:"Hero", atk:"+2", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. -1 Command when ordering non-Forest Spirit units. Can only join Forest Spirit units. Can cast Tree Singing spell. Cannot take magic items.", upgrades:[], magic:[] },
      { id:"we_spellWeaver", name:"Spell Weaver", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"we_giantStag", name:"Giant Stag", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"General/Noble/Spell Weaver may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"we_unicorn", name:"Unicorn", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"Spell Weaver only may ride. +1 Attack. Once per battle: +1 to spell roll.", upgrades:[], magic:[] },
      { id:"we_warhawk_mount", name:"Warhawk Mount", type:"Monstrous Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:15, min:"-", max:1, special:"General/Noble/Spell Weaver may ride. Flies (move 100cm).", upgrades:[], magic:[] },
      { id:"we_forestDragon", name:"Forest Dragon", type:"Monstrous Mount", atk:"+3", hits:"-", armour:"-", cmd:"-", size:1, pts:100, min:"-", max:1, special:"General/Noble/Spell Weaver may ride. Flies (move 100cm). Causes terror. Breath attack: 20cm, 3 attacks (rider must have joined a unit, not engaged).", upgrades:[], magic:[] },
      { id:"we_gladeGuard", name:"Glade Guard", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:2, max:4, special:"+1 to shooting dice rolls. Wardancer stands may be added.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_eternalGuard", name:"Eternal Guard", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:"-", max:3, special:"Woodland Folk. Wardancer stands may be added.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_wardancers", name:"Wardancers", type:"Infantry", atk:"4", hits:"3", armour:"0 or 5+", cmd:"-", size:"+1", pts:30, min:"-", max:4, special:"Attached to Glade Guard or Eternal Guard as extra stand.", upgrades:[], magic:[] },
      { id:"we_waywatchers", name:"Waywatchers", type:"Infantry", atk:"1/2", hits:"3", armour:"0", cmd:"-", size:2, pts:60, min:"-", max:1, special:"+1 to shooting, -1 enemy armour vs shots. Can infiltrate (ambush). 2-stand unit.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_dryads", name:"Dryads", type:"Infantry", atk:"4", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:1, max:"-", special:"Forest spirits. Woodland Folk.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_treekin", name:"Treekin", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"Forest spirits. Woodland Folk.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_gladeRiders", name:"Glade Riders", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:90, min:"-", max:3, special:"Light cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_wildRiders", name:"Wild Riders", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:2, special:"+1 Attack in first round of every combat when fighting to front.", upgrades:[], magic:["standards","weapons"] },
      { id:"we_warhawkRiders", name:"Warhawk Riders", type:"Monster", atk:"2/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:85, min:"-", max:1, special:"Flies. Shoot 15cm, 360° vision.", upgrades:[], magic:[] },
      { id:"we_treeman", name:"Treeman", type:"Monster", atk:"6", hits:"4", armour:"4+", cmd:"-", size:1, pts:130, min:"-", max:1, special:"Forest spirit. Causes terror. Can enter woods with no command penalty but cannot get Defended status there.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  beastmen: {
    name:"Beastmen", color:"#6b4010", bg:"#040200", accent:"#a06020",
    lore:"Savage half-beasts of the forest, devoted to Chaos, ambushing from the dark woods.",
    armyRules:[{name:"The Things in the Woods (Army Rule)", desc:"Beastmen infantry do not suffer the usual -1 Command penalty when within woodland."}, {name:"Gor and Ungor Ambushers", desc:"Up to half Gor units and half Ungor units (both rounded down) may be Ambushers. They are not deployed at the start. Each Cmd phase, instead of ordering them, place one in dense terrain not occupied by enemy and at least 20cm from any enemy — this counts as their move. Each unit may ambush once. If the terrain is within 20cm of an enemy at game start, no ambush there."}, {name:"Minotaurs (Bloodlust)", desc:"Minotaurs always use initiative to charge if possible and cannot be given orders instead. Never use initiative to evade. Must pursue or advance if victorious. Immune to terror. Cannot be driven back by shooting and never roll for drive backs."}, {name:"Chaos Spawn", desc:"Spawn have -1 Command penalty unless in a brigade with more non-Spawn than Spawn units. Up to two Spawn per brigade without counting towards brigade maximum. Cause terror in combat. Cannot be driven back by shooting. Must pursue or advance if victorious. 15cm shooting range and 360 degree vision."}, {name:"Dragon Ogres", desc:"Dragon Ogres are immune to terror."}],
        spells:[{name:"Traitor Kin", cast:"4+", range:"30cm", desc:"Cast on any enemy Cavalry, Chariot or Monster unit within range (no LoS needed). Lasts until end of opposing player's next turn. The unit cannot use initiative. Orders to the unit or its brigade suffer -1 Command penalty."}, {name:"Hunting for Gore!", cast:"5+", range:"30cm", desc:"Cast on an unengaged friendly unit within range (no LoS needed). Affects a single unit only — no brigade. The unit moves as if it had received an order. Characters that have joined do not move."}, {name:"Chaos Bolt", cast:"5+", range:"30cm", desc:"Cast on a visible enemy unit not in combat. Treated as 3 shooting attacks but armour has no effect. Can cause drive back as normal shooting."}, {name:"Power of Herd", cast:"6+", range:"30cm", desc:"Cast on all Gor, Ungor and Centigor units engaged in combat within range (no LoS needed). Each affected unit receives +1 Attack per stand (including characters) for the duration of its first following combat engagement. Bonus does not apply when units advance into next enemies."}],
    playstyle:"Ambush is everything. Up to half your core infantry can deploy using ambush rules. Push into dense terrain. Minotaurs always charge and cannot be driven back \u2014 use them as shock hammers.",
    fluff:"Deep in the forests of the Old World dwell creatures neither man nor beast but something horrible in between. The Beastmen descend from settlements at night, driven by dark devotion to Chaos and primal hatred of civilisation. Led by towering Doombulls and cunning Bray Shamans, they are at their most dangerous in forest depths where ambush is everything and civilised tactics count for nothing.",
    traits:["Woodland Folk", "Ambush up to half core infantry", "Minotaur frenzy", "Chaos Spawn surprise"],
    strengths:"Ambush deployment, Woodland Folk, Minotaur hammers",
    weaknesses:"Weaker in open terrain; minotaurs cannot evade",
    generalCmd:9,
    units:[
      { id:"bm_beastlord", name:"Beastlord", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Woodland Folk.", upgrades:[], magic:["devices"] },
      { id:"bm_doombull", name:"Doombull", type:"Hero", atk:"+2", hits:"-", armour:"-", cmd:6, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Causes terror. Gors/Ungors/Bestigors joined by Doombull become subject to Bloodlust until end of following Beastmen Command phase.", upgrades:[], magic:["weapons","devices"] },
      { id:"bm_wargor", name:"Wargor", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"bm_brayShaman", name:"Bray Shaman", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"bm_tuskgorChariot", name:"Tuskgor Chariot Mount", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:10, min:"-", max:1, special:"Beastlord/Wargor may ride. +1 Attack.", upgrades:[], magic:[] },
      { id:"bm_gor", name:"Gor", type:"Infantry", atk:"4", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Woodland Folk. Up to half total Gor/Ungor may ambush.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_ungor", name:"Ungor", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:45, min:2, max:"-", special:"Woodland Folk. Shoot 15cm. Up to half total Gor/Ungor may ambush.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_bestigors", name:"Bestigors", type:"Infantry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:75, min:"-", max:2, special:"Woodland Folk. Elite beastmen.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_minotaurs", name:"Minotaurs", type:"Infantry", atk:"5", hits:"4", armour:"0", cmd:"-", size:3, pts:80, min:"-", max:2, special:"Bloodlust: always charge on initiative, immune to terror, cannot be driven back, must pursue.", upgrades:[], magic:[] },
      { id:"bm_centigors", name:"Centigors", type:"Cavalry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:75, min:"-", max:2, special:"Shoot 15cm, 360° vision.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_chaosHounds", name:"Chaos Hounds", type:"Cavalry", atk:"3", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:6, special:"Fast war hounds.", upgrades:[], magic:[] },
      { id:"bm_tuskgorChariots", name:"Tuskgor Chariots", type:"Chariot", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:95, min:"-", max:4, special:"+1 Attack when charging in open.", upgrades:[], magic:["standards","weapons"] },
      { id:"bm_dragonOgres", name:"Dragon Ogres", type:"Monster", atk:"6", hits:"4", armour:"5+", cmd:"-", size:3, pts:230, min:"-", max:1, special:"Immune to terror.", upgrades:[], magic:[] },
      { id:"bm_chaosSpawn", name:"Chaos Spawn", type:"Monster", atk:"3/3", hits:"4", armour:"3+", cmd:"-", size:1, pts:110, min:"-", max:2, special:"Causes terror. Cannot be driven back. Must pursue. Shoot 15cm 360°.", upgrades:[], magic:[] },
      { id:"bm_shaggoth", name:"Dragon Ogre Shaggoth", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:160, min:"-", max:1, special:"Causes terror. Must be given separate orders; cannot brigade. At 5-7 hits (not engaged): Badly Hurt — Hits/Attacks halved to 4 each.", upgrades:[], magic:[] },
    ],
    upgradeRules:{}
  },

  norse: {
    name:"Norse", color:"#406080", bg:"#010305", accent:"#6090c0",
    lore:"Fearless raiders from the frozen north, with berserkers, mammoths and the Valkyries of the gods.",
    armyRules:[{name:"Berserkers", desc:"Always use initiative to charge an enemy if possible; cannot be given orders instead. Never evade. Cannot be driven back by shooting and do not roll for drive backs. Must pursue or advance if victorious. Immune to terror — no -1 Attack modifier."}, {name:"Ulfwerener", desc:"Based facing the short edge like cavalry. Receive +1 Attack when charging in the open (like monsters and chariots). Can pursue cavalry and chariots. Cannot support or be supported. Cannot take magic items. Only characters with the Were Kin upgrade may join them."}, {name:"Storm Giant", desc:"Must be given separate orders; cannot brigade. On failed order roll on Giant Goes Wild chart. With 5-7 accumulated hits while not engaged, becomes Badly Hurt — Hits and Attacks halved (4 Hits, 4 Attacks). Causes terror."}, {name:"War Mammoth", desc:"Uses a 40x60mm base. Causes terror. Can attack troops on ramparts with its trunk or batter wall sections. Infantry may assault fortress walls via the Mammoth. At 6-9 hits (not engaged): Badly Hurt — Hits/Attacks halved to 5 Hits, 4 Attacks."}],
        spells:[{name:"Aspect of Wulfen", cast:"4+", range:"30cm", desc:"Cast on any friendly unit within range (no LoS needed). The unit counts as causing terror for the duration of the Combat phase."}, {name:"Thunder of Fo'Wor", cast:"5+", range:"30cm", desc:"Draw a 30cm line from the Shaman in any direction (stops at blocking terrain). Each unit under the line takes 3 shooting attacks (including your own units). Unengaged units can be driven back (even friends); engaged units carry over hits."}, {name:"Eye of the Raven", cast:"5+", range:"N/A", desc:"Re-roll one single D6 at any point from now through the end of the opponent’s next turn (including their turn). Applies to any roll — orders, magic, artillery, shooting, or combat — but only ONE die in that roll (e.g. one die of a 3D6 drive back). Cannot be used for Instability or Giant Goes Wild. Only one Eye of the Raven active at a time."}, {name:"Spite of Low'Key", cast:"5+", range:"30cm",
        desc:"Cast on all enemy characters within 30cm of the Shaman. Lasts until end of enemy Command phase. All affected enemy characters that roll a double when issuing orders have those orders count as blunders. Works on all doubles (1-1 through 5-5). The enemy General is excepted as he cannot blunder."}],
    playstyle:"An aggressive hard-hitting infantry army with monster support. Huscarls are excellent heavy infantry. Berserkers always charge and cannot evade. The War Mammoth is devastating in open battles and can batter fortress walls.",
    fluff:"In the frozen seas north of the Empire, Viking warriors launch their longships toward warmer shores. The Norse are fearless raiders who worship gods of war, storm and death. Their Berserkers fight in a trance-like fury; and when they march overland, War Mammoths break walls and trample armies flat. They come for glory, for plunder, and for the joy of battle.",
    traits:["Huscarls elite infantry", "Berserkers frenzy", "War Mammoth siege capability", "Valkyries fly"],
    strengths:"Strong infantry, War Mammoth destroys fortifications",
    weaknesses:"Berserkers are unpredictable; limited shooting",
    generalCmd:9,
    units:[
      { id:"nr_jarl", name:"Jarl", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield.", upgrades:[], magic:["devices"] },
      { id:"nr_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"nr_shaman", name:"Shaman", type:"Wizard", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Casts spells.", upgrades:[], magic:["weapons","devices"] },
      { id:"nr_wereKin", name:"Were Kin", type:"Special Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:40, min:"-", max:1, special:"+1 Attack. Causes terror. Any character may take (including Shaman). Can join Ulfwerener units.", upgrades:[], magic:[] },
      { id:"nr_hornOfResounding", name:"Horn of Resounding", type:"Chariot Mount", atk:"+1", hits:"-", armour:"-", cmd:"-", size:1, pts:20, min:"-", max:1, special:"Shaman only may ride. +1 Attack. Once per battle: +1 to all Command checks for a single turn.", upgrades:[], magic:[] },
      { id:"nr_bondsmen", name:"Bondsmen", type:"Infantry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:60, min:2, max:"-", special:"Core Norse warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_huscarls", name:"Huscarls", type:"Infantry", atk:"4", hits:"3", armour:"4+", cmd:"-", size:3, pts:110, min:1, max:4, special:"Elite Norse warriors.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_huntsmen", name:"Huntsmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Missile troops.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_berserkers", name:"Berserkers", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:1, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_ulfwerener", name:"Ulfwerener", type:"Infantry", atk:"4", hits:"4", armour:"6+", cmd:"-", size:3, pts:110, min:"-", max:4, special:"Based on short edge (like cavalry). +1 Attack charging in open. Can pursue cavalry/chariots. Cannot give/receive support. Only joined by Were Kin characters. No magic items.", upgrades:[], magic:[] },
      { id:"nr_cavalry", name:"Cavalry", type:"Cavalry", atk:"3", hits:"3", armour:"5+", cmd:"-", size:3, pts:90, min:"-", max:1, special:"Standard Norse cavalry.", upgrades:[], magic:["standards","weapons"] },
      { id:"nr_stormGiant", name:"Storm Giant", type:"Monster", atk:"8", hits:"8", armour:"5+", cmd:"-", size:1, pts:135, min:"-", max:1, special:"Causes terror. Separate order. Giant Goes Wild if order fails.", upgrades:[], magic:[] },
      { id:"nr_warMammoth", name:"War Mammoth", type:"Monster", atk:"8", hits:"10", armour:"5+", cmd:"-", size:1, pts:180, min:"-", max:1, special:"Causes terror. Can batter fortress walls. Infantry may assault walls via Mammoth. At 6-9 hits (not engaged): Badly Hurt — Hits/Attacks halved to 5H/4A.", upgrades:[], magic:[] },
      { id:"nr_valkyries", name:"Valkyries", type:"Monster", atk:"2", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:"-", max:1, special:"Flies. Always charge on initiative; cannot be given orders instead. Cannot evade. Immune to terror (no -1 Attack modifier).", upgrades:[], magic:[] },
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
      { id:"ca_general", name:"General", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Brigades of up to 6 units allowed if ≥2 Bannermen included (no cavalry/chariots/Terracotta Warriors).", upgrades:[], magic:["devices"] },
      { id:"ca_hero", name:"Hero", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:2, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ca_sorcerer", name:"Sorcerer", type:"Wizard", atk:"+0", hits:"-", armour:"-", cmd:7, size:1, pts:45, min:"-", max:1, special:"Command range 60cm. Casts spells. +1 Command when ordering Terracotta Warriors.", upgrades:[], magic:["weapons","devices"] },
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
    armyRules:[{name:"Honour and Duty (Army Rule)", desc:"A Nippon army adds 1 to the number of units that must be lost before the army will withdraw. For example an army of 16 units will normally withdraw once 8 are destroyed — with this rule, it will not withdraw until 9 are destroyed."}, {name:"Ashigaru Tepo (Handguns)", desc:"Ashigaru Tepo use black powder handguns. Units hit by Ashigaru Tepo suffer -1 penalty to their armour rolls (armour piercing)."}, {name:"Bushido (Samurai)", desc:"Samurai live by a strict code of honour. They cannot use initiative to evade and roll 1 fewer die for drive backs."}, {name:"Mikata", desc:"Mikata always use initiative to charge if possible; cannot be given orders instead. Never evade. Cannot be driven back by shooting and do not roll for drive backs. Must pursue or advance if victorious. Unaffected by terror — no -1 Attack modifier."}, {name:"Ninja", desc:"15cm shooting range with 360 degree vision. May infiltrate: issue an infiltration order to a point in dense terrain or on any table edge except the enemy's (Command range extends over entire table for infiltration). On success the unit appears there."}, {name:"Shugenja", desc:"If an enemy Wizard within 50cm casts a spell, the Shugenja can attempt to dispel it on a D6 roll of 4+. Only one attempt per spell even with multiple Shugenjas. Also adds +1 to Daemonic Instability table rolls for friendly Daemon units within 20cm. Shugenjas may take a Dispel Scroll."}, {name:"Temple Daemons", desc:"Oni, Komainu and Tengu are Temple Daemons: immune to terror, cannot take magic items. Subject to Daemonic Instability — test at start of own Command phase if unit has suffered casualties: 0-1 = lose a stand; 2-3 = become confused; 4-5 = no effect (or cease confusion); 6 = regain a stand."}, {name:"Shogun Blunder Rule", desc:"If a Nippon Hero (Daimyo or Shugenja, not the Shogun) rolls double 6, they must roll on the Blunder table with -1 penalty. If the result is 'You must be crazy', the -1 Command penalty must be applied to a Samurai or Samurai Cavalry unit if one was being ordered or was in the brigade being ordered."}],
        spells:[],
    playstyle:"A disciplined army that fights with stubborn honour. Samurai and Samurai Cavalry cannot evade \u2014 position them carefully. The Honour and Duty rule means you need one more unit lost before withdrawal. Ninja infiltrators threaten artillery.",
    fluff:"On islands far to the east lies a land of rigid honour, meticulous ceremony and devastating martial tradition. The samurai warriors of Nippon have perfected the art of war over centuries of civil conflict. They march in disciplined formations behind silk banners, their blades among the finest in the world. Alongside them march bound spirit creatures \u2014 Tengu bird-men, Komainu lion-dogs \u2014 called forth by Shugenja priests.",
    traits:["Bushido \u2014 Samurai cannot evade", "Honour and Duty \u2014 harder to break", "Shrine summons spirits", "Ninja infiltrators"],
    strengths:"Stubborn, hard to break, Ninja disruption",
    weaknesses:"Samurai cannot evade \u2014 positioning is critical",
    generalCmd:9,
    units:[
      { id:"ni_shogun", name:"Shogun", type:"General", atk:"+2", hits:"-", armour:"-", cmd:9, size:1, pts:125, min:1, max:1, special:"Command range covers entire battlefield. Honour and Duty: army needs 1 extra unit lost before withdrawal.", upgrades:[], magic:["devices"] },
      { id:"ni_daimyo", name:"Daimyo", type:"Hero", atk:"+1", hits:"-", armour:"-", cmd:8, size:1, pts:80, min:"-", max:1, special:"Command range 60cm.", upgrades:[], magic:["weapons","devices"] },
      { id:"ni_shugenja", name:"Shugenja", type:"Hero", atk:"+0", hits:"-", armour:"-", cmd:8, size:1, pts:90, min:"-", max:1, special:"Command range 60cm. Anti-magic: can attempt to dispel enemy spells within 50cm on 4+ (D6). Only one attempt per spell even with multiple Shugenjas.", upgrades:[], magic:["weapons","devices"] },
      { id:"ni_tatsu", name:"Tatsu (Dragon)", type:"Monstrous Mount", atk:"+2", hits:"-", armour:"-", cmd:"-", size:1, pts:80, min:"-", max:1, special:"Shogun/Daimyo/Shugenja may ride. Flies (move 100cm). Causes terror.", upgrades:[], magic:[] },
      { id:"ni_shrine", name:"Shrine", type:"Special", atk:"-", hits:"-", armour:"-", cmd:"-", size:1, pts:50, min:1, max:1, special:"Once per battle: +1 to Shugenja's dispel roll. In Shooting phase: roll D6, on 4+ all Nippon units within 20cm are immune to Terror until start of next turn.", upgrades:[], magic:[] },
      { id:"ni_ashigaru", name:"Ashigaru", type:"Infantry", atk:"3", hits:"3", armour:"6+", cmd:"-", size:3, pts:45, min:1, max:"-", special:"Core spearmen.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_ashigaruBowmen", name:"Ashigaru Bowmen", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:55, min:"-", max:"-", special:"Standard archers.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_ashigaruTeppo", name:"Ashigaru Teppo", type:"Infantry", atk:"3/1", hits:"3", armour:"0", cmd:"-", size:3, pts:65, min:"-", max:2, special:"Armour piercing: -1 to enemy armour saves.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_samurai", name:"Samurai", type:"Infantry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:2, max:4, special:"Bushido: cannot evade, -1 drive-back dice.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_mikata", name:"Mikata (Ronin & Monks)", type:"Infantry", atk:"5", hits:"3", armour:"0", cmd:"-", size:3, pts:70, min:"-", max:2, special:"Always charge on initiative. Cannot evade. Cannot be driven back. Must pursue. Immune to terror.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_ninja", name:"Ninja", type:"Infantry", atk:"3/1", hits:"3", armour:"6+", cmd:"-", size:3, pts:60, min:"-", max:2, special:"Shoot 15cm, 360° vision. Can infiltrate. Ignore penalties for dense terrain. Count as Gutter Runners for Scout Rules.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_oni", name:"Oni", type:"Infantry", atk:"4", hits:"4", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:1, special:"Spirit Ogres. Temple Daemon: immune to terror, Daemonic Instability, cannot be given magic items.", upgrades:[], magic:[] },
      { id:"ni_samuraiCavalry", name:"Samurai Cavalry", type:"Cavalry", atk:"4", hits:"3", armour:"5+", cmd:"-", size:3, pts:110, min:"-", max:3, special:"Bushido: cannot evade, -1 drive-back dice.", upgrades:[], magic:["standards","weapons"] },
      { id:"ni_komainu", name:"Komainu", type:"Cavalry", atk:"2", hits:"3", armour:"0", cmd:"-", size:3, pts:40, min:"-", max:3, special:"Spirit lion-dogs. Temple Daemon: immune to terror, Daemonic Instability. +1 Attack when charging in open.", upgrades:[], magic:[] },
      { id:"ni_tengu", name:"Tengu", type:"Monster", atk:"2", hits:"3", armour:"5+", cmd:"-", size:3, pts:80, min:"-", max:1, special:"Flies. Spirit creatures. Temple Daemon: immune to terror, Daemonic Instability. Based facing long edge like infantry.", upgrades:[], magic:[] },
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
    colorMode: "print",
    showImage: true,
    includeArmyRules: true,
    fontScale: 1.0,
  };

  // Back-side print mode: "fronts" | "separate" | "sidebyside"
  const [backMode, setBackMode] = useState("fronts");

  const entryTotal = (entry) => {
    let t = typeof entry.unit.pts === "number" ? entry.unit.pts : 0;
    if (entry.mount) t += typeof entry.mount.pts === "number" ? entry.mount.pts : 0;
    if (entry.magicItem) t += entry.magicItem.cost || 0;
    return t;
  };
  const total = roster.reduce((s,e) => s + entryTotal(e), 0);

  // Dimensions per layout — real mm for accurate print sizing
  const baseLayouts = {
    portrait:  { w:"63.5mm",  h:"88.9mm",  label:"Portrait 2.5×3.5\"",  imgH:"28mm", baseFontPx:8.5 },
    landscape: { w:"88.9mm",  h:"63.5mm",  label:"Landscape 3.5×2.5\"", imgH:"0",    baseFontPx:8   },
    square:    { w:"63.5mm",  h:"63.5mm",  label:"Square 2.5×2.5\"",    imgH:"20mm", baseFontPx:7.5 },
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
  // "print"     = light parchment card, dark text — optimised for physical printing
  // "faction"   = full dark theme using army.bg + army.accent (screen-optimised)
  // "cardcolor" = mid-tone: faction-tinted dark card, white stat values (high contrast)
  // "white"     = pure white card, black text
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
  // "print" mode: light parchment with faction-tinted header strip, all text near-black
  const cardBg    = mode==="print"   ? "#f8f2e0"              : mode==="faction" ? (army.bg||"#0a0806") : mode==="cardcolor" ? midBg : "#ffffff";
  const cardBorder= (mode==="white"||mode==="print") ? army.color : army.color;
  const cardText  = (mode==="white"||mode==="print") ? "#1a1208"  : army.accent;
  // Description text — always near-black for print, dim for dark modes
  const descText  = (mode==="white"||mode==="print") ? "#2a2010"  : mode==="cardcolor" ? "#dddddd" : "#aaaaaa";
  // Muted text: labels, subtitles
  const cardMuted = mode==="print"   ? "#4a3820"              : mode==="faction" ? "#999999" : mode==="cardcolor" ? "#dddddd" : "#555555";
  const statBg    = mode==="print"   ? army.color+"22"        : mode==="faction" ? "#00000040" : mode==="cardcolor" ? "#00000050" : "#f2f2f2";
  const statBorder= (mode==="white"||mode==="print") ? army.color+"99" : army.color+"80";
  const divider   = (mode==="white"||mode==="print") ? army.color+"55" : army.color+"60";
  const imgBg     = (mode==="white"||mode==="print")
    ? "linear-gradient(160deg,#e8e4d8,#d4ceba)"
    : `linear-gradient(160deg, ${army.color}70, ${army.bg||"#0a0806"})`;
  const imgTextColor = (mode==="white"||mode==="print") ? "#888888" : army.accent;
  // Header strip bg behind unit name — faction-tinted for print mode
  const headerBg  = mode==="print"   ? army.color+"28"        : `${cardBorder}18`;

  // ── ARMY RULES CARD ──────────────────────────────────────────────────────
  // ── SHARED CARD SHELL ──────────────────────────────────────────────────────
  // Every card: black 3mm outer (≈1/8in), 4mm corner radius, inner card with faction colour
  // imgOverlay: optional { top, left } stat overlays rendered inside the image area
  function CardShell({ children, imgUrl, imgFallbackIcon="⚔", accentColor, imgOverlay }) {
    const clr = accentColor || army.color;
    const borderUrl = IMAGES.factionBorders[army.key] || "";
    return (
      <div style={{
        width:"63.5mm", height:"88.9mm", maxHeight:"88.9mm", minHeight:"88.9mm",
        background:"#000",
        borderRadius:"4mm",
        padding:"3mm",
        boxSizing:"border-box",
        overflow:"hidden",
        pageBreakInside:"avoid", breakInside:"avoid",
        WebkitPrintColorAdjust:"exact", printColorAdjust:"exact",
        flexShrink:0, flexGrow:0,
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
          border: mode==="print" ? `1px solid ${army.color}60` : "none",
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

          {/* ── Image area — fixed height for uniform card layout ── */}
          <div style={{
            width:"100%",
            height:"40mm",
            flexShrink:0,
            position:"relative",
            overflow:"hidden",
            borderBottom:`1.5px solid ${cardBorder}`,
          }}>
            {imgUrl ? (
              <img src={imgUrl} alt="" referrerPolicy="no-referrer"
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
        <div style={{ fontSize:valueSz, fontWeight:700, color: sm ? "#fff" : cardText, lineHeight:1.15 }}>{String(value ?? "-")}</div>      </div>
    );
  }

  // ── KEYWORD BADGE SYSTEM ──────────────────────────────────────────────────
  // Maps common Warmaster keywords to compact colored pill badges.
  // Each entry: { label, color (pill bg), patterns (regex alternatives to match in special text) }
  const BADGES = [
    { label:"TERROR",       color:"#8b0000", patterns:[/causes? terror/i] },
    { label:"UNDEAD",       color:"#663399", patterns:[/\bundead\b/i] },
    { label:"FLY",          color:"#4169e1", patterns:[/can fly\b/i, /unit can fly/i, /may fly\b/i, /\bflies\b/i] },
    { label:"CHARGE +1",    color:"#8b0000", patterns:[/\+1 attack(?:s)? (?:bonus )?(?:when|if|in|on)(?: they| it)? charg(?:e|es|ing)/i] },
    { label:"PURSUE",       color:"#4169e1", patterns:[/will always pursue/i, /must always pursue/i, /always pursues/i, /must pursue\b/i] },
    { label:"NO EVADE",     color:"#4169e1", patterns:[/cannot evade/i, /can(?:'t| ?not) evade/i] },
    { label:"NO DRIVE BACK",color:"#556b2f", patterns:[/cannot be driven back/i, /can(?:'t| ?not) be driven back/i, /never driven back/i] },
    { label:"FRENZY",       color:"#8b0000", patterns:[/(?:is|are) frenzied/i] },
    { label:"360°",         color:"#556b2f", patterns:[/360[°˚]/i, /can see all around/i] },
    { label:"AP",           color:"#8b0000", patterns:[/ignore armou?r (?:when|in|on|during) shooting/i, /count the enemy(?:'s)? armou?r as 0/i] },
    { label:"BREATH",       color:"#b8860b", patterns:[/breath attack/i] },
    { label:"REGEN",        color:"#556b2f", patterns:[/regenerat(?:e|es|ion)/i] },
    { label:"INSTABILITY",  color:"#663399", patterns:[/(?:is|are) unstable/i, /instability/i] },
    { label:"NO BRIGADE",   color:"#555555", patterns:[/cannot be brigaded/i, /can(?:'t| ?not) be brigaded/i] },
    { label:"WILD",         color:"#b8860b", patterns:[/(?:is|are) wild/i] },
  ];

  // Extract matching badges from special text, return { badges, remainingText }
  function extractBadges(specialText) {
    if (!specialText) return { badges: [], remainingText: "" };
    // Split into sentences, match each against badge patterns
    const sentences = specialText.split(/(?<=\.)\s+/);
    const matched = [];
    const kept = [];

    for (const sentence of sentences) {
      let badged = false;
      for (const badge of BADGES) {
        if (matched.some(m => m.label === badge.label)) continue; // already matched
        for (const pat of badge.patterns) {
          if (pat.test(sentence)) {
            matched.push(badge);
            badged = true;
            break;
          }
        }
        if (badged) break;
      }
      if (!badged) kept.push(sentence);
    }

    return { badges: matched, remainingText: kept.join(" ").trim() };
  }

  // Render a row of badge pills
  function BadgeStrip({ badges }) {
    if (!badges.length) return null;
    return (
      <div style={{
        display:"flex", flexWrap:"wrap", gap:"1mm",
        padding:"0.8mm 2.5mm",
        borderBottom:`1px solid ${divider}`,
      }}>
        {badges.map((b, i) => (
          <span key={i} style={{
            display:"inline-block",
            background: b.color,
            color: "#fff",
            fontSize: cardFs(0.55),
            fontWeight: 700,
            padding: "0.3mm 1.5mm",
            borderRadius: "1.5mm",
            letterSpacing: "0.3px",
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            fontFamily: "'Cinzel',Georgia,serif",
          }}>
            {b.label}
          </span>
        ))}
      </div>
    );
  }

  // ── UNIT CARD ─────────────────────────────────────────────────────────────
  function PrintCard({ entry }) {
    const u = entry.unit;
    const pts = entryTotal(entry);
    const imgUrl = IMAGES.units[u.id] || "";

    // Extract keyword badges from special text
    const { badges, remainingText } = extractBadges(u.special);

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
          flexShrink:0, background: headerBg,
        }}>
          <div>
            <div style={{ fontSize:cardFs(1.05), fontWeight:700, color:cardText, lineHeight:1.2 }}>{u.name}</div>
            <div style={{ fontSize:cardFs(0.68), color:cardMuted, letterSpacing:"0.8px", textTransform:"uppercase" }}>{u.type}</div>
          </div>
          <div style={{ fontSize:cardFs(1.05), fontWeight:700, color:cardText, flexShrink:0, marginLeft:"2mm" }}>{pts}pts</div>
        </div>

        {/* Badge strip */}
        <BadgeStrip badges={badges} />

        {/* Remaining special text + inline unit rules */}
        <div style={{ padding:"1.5mm 2.5mm", flexShrink:0 }}>
          {remainingText ? (
            <div style={{ fontSize:cardFs(0.78), color:descText, lineHeight:1.5, fontFamily:"Georgia,serif" }}>
              {remainingText}
            </div>
          ) : null}
          {unitRules.map((r,i) => (
            <div key={i} style={{ fontSize:cardFs(0.72), color:descText, lineHeight:1.4, marginTop:"0.8mm", fontFamily:"Georgia,serif" }}>
              <strong style={{ color:cardText }}>{r.name}:</strong> {r.desc}
            </div>
          ))}
          {FLAVOR[u.id] ? (
            <div style={{ fontSize:cardFs(0.68), color:cardMuted, lineHeight:1.4, marginTop:"1.5mm", fontStyle:"italic", fontFamily:"Georgia,serif" }}>
              {FLAVOR[u.id]}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background: headerBg, flexShrink:0, marginTop:"auto",
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
    const { badges: mountBadges, remainingText: mountRemaining } = extractBadges(m.special);
    return (
      <CardShell imgUrl={imgUrl} imgFallbackIcon="🐴" accentColor={army.color}>
        {/* Name bar */}
        <div style={{
          padding:"1.5mm 2.5mm 1mm",
          borderBottom:`1px solid ${divider}`,
          display:"flex", justifyContent:"space-between", alignItems:"baseline",
          flexShrink:0, background: headerBg,
        }}>
          <div>
            <div style={{ fontSize:cardFs(1.05), fontWeight:700, color:cardText, lineHeight:1.2 }}>{m.name}</div>
            <div style={{ fontSize:cardFs(0.68), color:cardMuted, letterSpacing:"0.8px", textTransform:"uppercase" }}>Mount · {entry.unit.name}</div>
          </div>
          {m.pts > 0 ? <div style={{ fontSize:cardFs(1.0), fontWeight:700, color:cardText, flexShrink:0, marginLeft:"2mm" }}>{m.pts}pts</div> : null}
        </div>

        {/* Mount stats if available */}
        {(m.atk || m.hits || m.armour) ? (
          <div style={{
            display:"flex", gap:"1.5px", padding:"1.5mm 1mm",
            borderBottom:`1px solid ${divider}`,
            flexShrink:0, height:"16mm",
          }}>
            {[{k:"ATK",v:m.atk},{k:"HITS",v:m.hits},{k:"ARM",v:m.armour}].filter(x=>x.v!=null).map(({k,v}) =>
              <StatBox key={k} label={k} value={v} style={{ flex:1, height:"100%" }} />
            )}
          </div>
        ) : null}

        {/* Badge strip */}
        <BadgeStrip badges={mountBadges} />

        {/* Mount special rules */}
        <div style={{ padding:"1.5mm 2.5mm", flexShrink:0 }}>
          {mountRemaining ? (
            <div style={{ fontSize:cardFs(0.78), color:descText, lineHeight:1.5, fontFamily:"Georgia,serif" }}>{mountRemaining}</div>
          ) : (
            <div style={{ fontSize:cardFs(0.78), color:descText, opacity:0.5, fontFamily:"Georgia,serif" }}>No special rules.</div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background: headerBg, flexShrink:0, marginTop:"auto",
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
    // Print-friendly parchment palette for magic items
    const miAccent  = "#8a5a10";
    const miBg      = (mode==="print"||mode==="white") ? "#f8f2e0" : "#1a1508";
    const miBorder  = "#8a6820";
    const miText    = (mode==="print"||mode==="white") ? "#1a1208" : "#f0d890";
    const miMuted   = (mode==="print"||mode==="white") ? "#4a3010" : "#b89840";
    const miHeaderBg= (mode==="print"||mode==="white") ? "#c8940a28" : "#c8940a18";
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
        width:"63.5mm", height:"88.9mm", maxHeight:"88.9mm", minHeight:"88.9mm",
        background:"#000",
        borderRadius:"4mm",
        padding:"3mm",
        boxSizing:"border-box",
        overflow:"hidden",
        pageBreakInside:"avoid", breakInside:"avoid",
        WebkitPrintColorAdjust:"exact", printColorAdjust:"exact",
        flexShrink:0, flexGrow:0,
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
          {/* Image + name overlay — fixed height for uniform layout */}
          <div style={{ width:"100%", height:"40mm", flexShrink:0, position:"relative", overflow:"hidden", borderBottom:`1.5px solid ${miBorder}` }}>
            {imgUrl ? (
              <img src={imgUrl} alt="" referrerPolicy="no-referrer" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }} />
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
            background: miHeaderBg,
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
          <div style={{ padding:"1.5mm 2.5mm", flexShrink:0 }}>
            <div style={{ fontSize:cardFs(0.78), color:miText, lineHeight:1.55, fontFamily:"Georgia,serif" }}>
              {mi.desc}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop:`1px solid ${miBorder}44`, padding:"1mm 2.5mm", display:"flex", justifyContent:"space-between", alignItems:"center", background: miHeaderBg, flexShrink:0, marginTop:"auto" }}>
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
          flexShrink:0, background: headerBg,
          display:"flex", alignItems:"center",
        }}>
          <div style={{ fontSize:cardFs(0.68), color:army.color, textTransform:"uppercase", letterSpacing:"1px" }}>Special Rule</div>
        </div>

        {/* Description */}
        <div style={{ padding:"1.5mm 2.5mm", flexShrink:0 }}>
          <div style={{ fontSize:cardFs(0.82), color:descText, lineHeight:1.55, fontFamily:"Georgia,serif" }}>
            {rule.desc}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background: headerBg, flexShrink:0, marginTop:"auto",
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
          flexShrink:0, background: headerBg,
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
        <div style={{ padding:"1.5mm 2.5mm", flexShrink:0 }}>
          <div style={{ fontSize:cardFs(0.82), color:descText, lineHeight:1.55, fontFamily:"Georgia,serif" }}>
            {spell.desc || spell.effect}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop:`1px solid ${divider}`, padding:"1mm 2.5mm",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background: headerBg, flexShrink:0, marginTop:"auto",
        }}>
          <div style={{ fontSize:cardFs(0.6), color:cardMuted, textTransform:"uppercase", letterSpacing:"0.4px" }}>Warmaster Revolution</div>
          <div style={{ fontSize:cardFs(0.6), color:army.color, textTransform:"uppercase", letterSpacing:"0.4px", opacity:0.9 }}>{army.name}</div>
        </div>
      </CardShell>
    );
  }



  // ── CARD BACK ─────────────────────────────────────────────────────────────
  function CardBack() {
    const clr = army.color;
    const acc = mode==="print" ? "#1a1208" : army.accent;
    const backBg = mode==="print" ? "#f5f0e4" : `linear-gradient(160deg, #0d0b08 0%, #1a1208 50%, #0d0b08 100%)`;
    const backBorder = mode==="print" ? `2px solid ${clr}` : `1.5px solid ${clr}`;
    return (
      <div style={{
        width:"63.5mm", height:"88.9mm", maxHeight:"88.9mm", minHeight:"88.9mm",
        background:"#000",
        borderRadius:"4mm",
        padding:"3mm",
        boxSizing:"border-box",
        overflow:"hidden",
        pageBreakInside:"avoid", breakInside:"avoid",
        WebkitPrintColorAdjust:"exact", printColorAdjust:"exact",
        flexShrink:0, flexGrow:0,
      }}>
        <div style={{
          width:"100%", height:"100%",
          borderRadius:"2mm",
          background: backBg,
          border: backBorder,
          boxSizing:"border-box",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Corner ornaments */}
          {[["0","0",""],["0","auto","scaleX(-1)"],["auto","0","scaleY(-1)"],["auto","auto","scale(-1,-1)"]].map(([t,r,tf],i)=>(
            <div key={i} style={{
              position:"absolute", top:t!=="auto"?"3mm":undefined, bottom:t==="auto"?"3mm":undefined,
              left:r!=="auto"?"3mm":undefined, right:r==="auto"?"3mm":undefined,
              width:"7mm", height:"7mm",
              transform:tf,
              borderTop:`1.5px solid ${clr}`,
              borderLeft:`1.5px solid ${clr}`,
              borderRadius:"0.8mm 0 0 0",
              opacity: mode==="print" ? 1 : 0.8,
            }}/>
          ))}

          {/* Decorative pattern lines — print visible */}
          <div style={{
            position:"absolute", inset:"8mm",
            border:`1px solid ${clr}33`,
            borderRadius:"1mm",
            pointerEvents:"none",
          }} />

          {/* Crossed swords motif */}
          <div style={{ fontSize:"22px", marginBottom:"3mm", opacity: mode==="print" ? 0.85 : 0.7, filter: mode==="print" ? "none" : `drop-shadow(0 0 4px ${clr})`, color: mode==="print" ? clr : undefined }}>
            ⚔
          </div>

          {/* WARMASTER title */}
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize:"10.5pt",
            fontWeight:900,
            letterSpacing:"4px",
            color: acc,
            textTransform:"uppercase",
            textShadow: mode==="print" ? "none" : `0 0 8px ${clr}`,
            marginBottom:"1.5mm",
          }}>
            WARMASTER
          </div>

          {/* Divider line */}
          <div style={{
            width:"70%", height:"1.5px",
            background: mode==="print" ? clr : `linear-gradient(90deg, transparent, ${clr}, transparent)`,
            marginBottom:"1.5mm",
          }}/>

          {/* REVOLUTION subtitle */}
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize:"7pt",
            fontWeight:700,
            letterSpacing:"5px",
            color: clr,
            textTransform:"uppercase",
            opacity: mode==="print" ? 1 : 0.9,
            marginBottom:"4mm",
          }}>
            REVOLUTION
          </div>

          {/* Army name */}
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize:"6pt",
            letterSpacing:"2px",
            color: mode==="print" ? "#4a3820" : acc,
            opacity: mode==="print" ? 0.8 : 0.5,
            textTransform:"uppercase",
          }}>
            {army.name}
          </div>

          {/* Bottom accent bar */}
          <div style={{
            position:"absolute", bottom:"4mm", left:"8mm", right:"8mm",
            height:"1.5px",
            background: mode==="print" ? clr : `linear-gradient(90deg, transparent, ${clr}80, transparent)`,
            opacity: mode==="print" ? 0.6 : 1,
          }}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: (mode==="white"||mode==="print") ? "#d8d4c8" : "#111111", minHeight:"100vh" }} id="print-root">
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

        {/* Back-mode selector */}
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          {[
            { id:"fronts",     label:"Fronts Only" },
            { id:"separate",   label:"+ Backs (2 sheets)" },
            { id:"sidebyside", label:"+ Backs (side by side)" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setBackMode(opt.id)}
              style={{
                background: backMode===opt.id ? `linear-gradient(135deg,${army.color},${army.color}99)` : "none",
                border:`1px solid ${army.color}60`,
                color: backMode===opt.id ? "#fff" : army.color,
                borderRadius:4, padding:"5px 10px", fontSize:"0.78rem",
                cursor:"pointer", fontFamily:"'Cinzel',serif", fontWeight:700,
                whiteSpace:"nowrap",
              }}>
              {opt.label}
            </button>
          ))}
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

        // Build flat list of all front cards
        const frontCards = [
          ...spellItems.map((spell, i) => <SpellCard key={`spell-${i}`} spell={spell} />),
          ...roster.map((entry, idx) => <PrintCard key={`unit-${idx}`} entry={entry} />),
          ...roster.filter(e => e.mount).map((entry, idx) => <MountCard key={`mount-${idx}`} entry={entry} />),
          ...roster.filter(e => e.magicItem).map((entry, idx) => <MagicItemCard key={`mi-${idx}`} mi={entry.magicItem} />),
        ];
        const cardCount = frontCards.length;

        if (backMode === "fronts") {
          return (
            <div className="print-area" style={{ padding:"12px", display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"flex-start", alignItems:"flex-start" }}>
              {frontCards}
            </div>
          );
        }

        if (backMode === "sidebyside") {
          // Pair each front with its back, side by side
          return (
            <div className="print-area" style={{ padding:"12px", display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"flex-start", alignItems:"flex-start" }}>
              {frontCards.map((card, i) => (
                <div key={i} style={{ display:"flex", gap:"4mm", pageBreakInside:"avoid", breakInside:"avoid" }}>
                  {card}
                  <CardBack />
                </div>
              ))}
            </div>
          );
        }

        if (backMode === "separate") {
          // Page 1: all fronts. Page break. Page 2: backs in same order (mirror columns for duplex)
          return (
            <>
              <div className="print-area" style={{ padding:"12px", display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"flex-start", alignItems:"flex-start" }}>
                {frontCards}
              </div>
              <div className="page-break-before" style={{ pageBreakBefore:"always", breakBefore:"page" }} />
              <div className="print-area backs-page" style={{ padding:"12px", display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"flex-start" }}>
                {frontCards.map((_, i) => <CardBack key={`back-${i}`} />)}
              </div>
            </>
          );
        }

        return null;
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
          html, body, .pv-root, #print-root {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            overflow: visible !important;
          }
          .print-area {
            background: #ffffff !important;
            padding: 0 !important;
            gap: 0mm !important;
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
      width:"63.5mm", height:"88.9mm", maxHeight:"88.9mm", minHeight:"88.9mm",
      background:"#000", borderRadius:"4mm", padding:"3mm",
      boxSizing:"border-box", overflow:"hidden", pageBreakInside:"avoid", breakInside:"avoid",
      WebkitPrintColorAdjust:"exact", printColorAdjust:"exact", flexShrink:0, flexGrow:0,
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
            <img src={imgUrl} alt="" referrerPolicy="no-referrer" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
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
        <div style={{ padding:"1.5mm 2.5mm", flexShrink:0 }}>
          <div style={{ fontSize:fs(0.78), color:miText, lineHeight:1.55, fontFamily:"Georgia,serif" }}>{mi.desc}</div>
        </div>

        {/* Footer */}
        <div style={{ borderTop:`1px solid ${miBorder}44`, padding:"1mm 2.5mm", display:"flex", justifyContent:"space-between", background:`${miAccent}0a`, flexShrink:0, marginTop:"auto" }}>
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