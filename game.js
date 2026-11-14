'use strict';
/* Ages of Ember – od ohně ke hvězdám */

const N = 96, TW = 64, TH = 32, OX = N * TW / 2, CX = 48, CY = 48;
const SAVE_KEY = 'odOhneKeHvezdam_v1';
const GAME_V = '1.2.3';   // při vydání zvednout (i v index.html) – prohlížeč pak stáhne nové obrázky
const DAY = 180, NIGHT_FROM = 0.68;
const T_GRASS = 0, T_DIRT = 1, T_ROCK = 2, T_WATER = 3;

const RES = {
  klacky: ['🪵', 'Klacky'], kamen: ['🪨', 'Kámen'], pazourek: ['🔻', 'Pazourek'],
  bobule: ['🍒', 'Bobule'], maso: ['🍖', 'Maso'], ryby: ['🐟', 'Ryby'], obili: ['🌾', 'Obilí'], kozesiny: ['🟤', 'Kožešiny'],
  nastroje: ['🪓', 'Nástroje'], hlina: ['🟫', 'Hlína'], keramika: ['🏺', 'Keramika'], ruda: ['🟢', 'Měděná ruda'], med: ['🟠', 'Měď'],
  cin: ['⚪', 'Cín'], bronz: ['🟡', 'Bronz'], prkna: ['🪚', 'Prkna'], mouka: ['🍚', 'Mouka'], chleb: ['🍞', 'Chléb'],
  zelruda: ['⛏️', 'Železná ruda'], zelezo: ['⚙️', 'Železo'], uhli: ['⚫', 'Uhlí'], cihly: ['🧱', 'Cihly'], ocel: ['🔩', 'Ocel'], stroje: ['🛠️', 'Stroje'], ropa: ['🛢️', 'Ropa'], plasty: ['🧴', 'Plasty'], elektronika: ['💾', 'Elektronika'], kompozity: ['🔷', 'Kompozity'], roboti: ['🤖', 'Roboti'], mince: ['🪙', 'Mince'], musle: ['🐚', 'Mušle'], vedeni: ['💡', 'Vědění']
};
const UNCAPPED = { vedeni: 1, musle: 1, mince: 1 };
// od které doby se surovina používá a od které už ne (pevné pořadí podle RES)
const RES_FROM = { hlina: 1, keramika: 1, ruda: 1, med: 1, cin: 1, bronz: 1, obili: 1, mince: 1, prkna: 2, mouka: 2, chleb: 2, zelruda: 2, zelezo: 2,
  uhli: 3, cihly: 3, ocel: 3, stroje: 3, ropa: 4, plasty: 4, elektronika: 4, kompozity: 5, roboti: 5 };
const RES_UNTIL = { pazourek: 1, bobule: 1, musle: 1 };
const ageRes = () => Object.keys(RES).filter(r => ((RES_FROM[r] || 0) <= S.age && !(RES_UNTIL[r] <= S.age)) || Math.floor(S.res[r]) > 0);

const NODE = {
  strom:    { res: 'klacky',   max: 20, regrow: 0, work: 3 },
  ker:      { res: 'bobule',   max: 20, regrow: 0, work: 4 },
  kamen:    { res: 'kamen',    max: 40, regrow: 0,  work: 5 },
  pazourek: { res: 'pazourek', max: 25, regrow: 0,  work: 5 },
  zver:     { res: 'maso',     max: 12, regrow: 45, work: 5 },
  hlina:    { res: 'hlina',    max: 30, regrow: 8,  work: 4, renew: true },
  ruda:     { res: 'ruda',     max: 30, regrow: 0,  work: 6 },
  zelruda:  { res: 'zelruda',  max: 30, regrow: 0,  work: 7 },
  uhli:     { res: 'uhli',     max: 200, regrow: 0, work: 6 },
  ropa:     { res: 'ropa',     max: 400, regrow: 0, work: 8 }
};

const JOBS = {
  klacky:   { name: 'Sběrači klacků',   node: 'strom',    color: '#8a5a2b' },
  bobule:   { name: 'Sběrači bobulí',   node: 'ker',      color: '#a02c4a', until: 1 },
  kamen:    { name: 'Sběrači kamene',   node: 'kamen',    color: '#7d7d7d', until: 1, mineBy: 'kamenolom' },
  pazourek: { name: 'Sběrači pazourku', node: 'pazourek', color: '#3d4a5c', until: 1 },
  hlina:    { name: 'Kopáči hlíny',     node: 'hlina',    color: '#a0522d', req: 'hrncirstvi', until: 0, mineBy: 'hliniště' },
  ruda:     { name: 'Horníci',          node: 'ruda',     color: '#3f9a7a', req: 'med' },
  zelruda:  { name: 'Horníci železa',   node: 'zelruda',  color: '#8a4a3a', req: 'zelezo', until: 0, mineBy: 'železný důl' },
  lov:      { name: 'Lovci',            node: 'zver',     color: '#c9772a' },
  ryby:     { name: 'Rybáři',                             color: '#3f8fb5' },
  pole:     { name: 'Rolníci',                            color: '#c9b037' },
  chov:     { name: 'Pastevci',                           color: '#9ab86a' },
  les:      { name: 'Lesníci',                            color: '#2f6a2a' },
  nastroje: { name: 'Nástrojaři',                         color: '#d6c56a' },
  hrncire:  { name: 'Hrnčíři',                            color: '#c47a45' },
  tavici:   { name: 'Taviči',                             color: '#d0603a' },
  kovari:   { name: 'Kováři',                             color: '#b8973a' },
  pilari:   { name: 'Pilaři',                             color: '#b07a3a' },
  mlynari:  { name: 'Mlynáři',                            color: '#e8e0c0' },
  pekari:   { name: 'Pekaři',                             color: '#d9a050' },
  kopaci:   { name: 'Kopáči v hliništi',                  color: '#a0522d' },
  lamaci:   { name: 'Lamači kamene',                      color: '#9a948a' },
  hutnici:  { name: 'Hutníci',                            color: '#a04030' },
  uhli:     { name: 'Horníci uhlí',     node: 'uhli',     color: '#3a3a3a', req: 'parni_stroj', until: 0, mineBy: 'uhelný důl' },
  dulnici:  { name: 'Havíři v uhelném dole',                color: '#2a2a2a' },
  banici:   { name: 'Havíři v železném dole',               color: '#6a3a2a' },
  cihlari:  { name: 'Cihláři',                            color: '#b0503a' },
  ocelari:  { name: 'Oceláři',                            color: '#6a7a8a' },
  strojari: { name: 'Strojaři',                           color: '#4a6a9a' },
  energetici: { name: 'Energetici',                       color: '#e8c030' },
  vrtari:   { name: 'Vrtaři',                             color: '#2a2a40' },
  chemici:  { name: 'Chemici',                            color: '#7ab0c0' },
  technici: { name: 'Technici',                           color: '#4ab0e0' },
  inzenyri: { name: 'Inženýři',                           color: '#a060e0' },
  robotici: { name: 'Robotici',                           color: '#e06090' },
  agronomove: { name: 'Agronomové',                       color: '#60c060' },
  stavba:   { name: 'Stavitelé',                          color: '#ece6d2' }
};
const NODE_JOB = { strom: 'klacky', ker: 'bobule', kamen: 'kamen', pazourek: 'pazourek', zver: 'lov', hlina: 'hlina', ruda: 'ruda', zelruda: 'zelruda', uhli: 'uhli' };
// práce, které se dělají v určité stavbě
const JOB_BLD = { nastroje: 'dilna', hrncire: 'hrncir', tavici: 'tavirna', kovari: 'kovarna', pole: 'pole', chov: 'ohrada', les: 'skolka', pilari: 'pila', mlynari: 'mlyn', pekari: 'pekarna', hutnici: 'hut', lamaci: 'lom', kopaci: 'hliniste',
  dulnici: 'dul_uhli', banici: 'dul_zelezo', cihlari: 'cihelna', ocelari: 'ocelarna', strojari: 'strojirna',
  energetici: 'elektrarna', vrtari: 'ropny_vrt', chemici: 'rafinerie', technici: 'elektro',
  inzenyri: 'nanotovarna', robotici: 'robotovarna', agronomove: 'vfarma' };
const JOB_BY_B = {}; for (const j in JOB_BLD) JOB_BY_B[JOB_BLD[j]] = j;

const BLD = {
  jeskyne: { r: 2, name: 'Jeskyně', names: ['Jeskyně', 'Náčelníkův dlouhý dům', 'Hrad', 'Radnice', 'Mrakodrap', 'Vesmírné centrum'], desc: 'Hlavní budova: domov, sklad a místo, kde se bádá. Její přestavbou postoupíte do dalšího věku.',
    lv: [{},
         { cost: { klacky: 40, kamen: 30, nastroje: 10, musle: 5, vedeni: 60 }, time: 150, reqs: ['lov', 'chyse', 'malby'], needPop: 12, store: 40, pop: 2, age: 1 },
         { cost: { hlina: 40, keramika: 10, bronz: 10, mince: 30, vedeni: 120 }, time: 240, reqs: ['bronz', 'chov', 'lesnictvi'], needPop: 25, store: 80, pop: 4, age: 2 },
         { cost: { kamen: 200, prkna: 80, zelezo: 20, mince: 100, vedeni: 250 }, time: 300, reqs: ['cechy', 'klaster', 'mlynarstvi'], needPop: 40, store: 120, pop: 6, age: 3 },
         { cost: { cihly: 150, ocel: 40, stroje: 20, mince: 200, vedeni: 400 }, time: 360, reqs: ['stroje', 'cihlove'], needPop: 60, store: 160, pop: 8, age: 4 },
         { cost: { ocel: 100, plasty: 60, elektronika: 40, mince: 400, vedeni: 800 }, time: 420, reqs: ['letectvi', 'panelaky'], needPop: 100, store: 200, pop: 10, age: 5 }] },
  ohniste: { until: 1, name: 'Ohniště', desc: 'Hřeje v noci, peče maso, láká pocestné a u ohně přibývá vědění. Spaluje klacky.', req: 'ohen', unique: true,
    lv: [{ cost: { klacky: 5, kamen: 5 }, time: 24 }] },
  chyse: { name: 'Chýše', names: ['Chýše', 'Chýše z kůží', 'Kamenná chýše', 'Hliněný dům', 'Roubenka', 'Cihlový činžák', 'Panelový dům', 'Arkologie'], desc: 'Bydlení pro další lidi.', req: 'chyse',
    lv: [{ cost: { klacky: 15 }, time: 40, pop: 2 },
         { cost: { klacky: 20, kozesiny: 5 }, time: 56, pop: 3 },
         { cost: { klacky: 25, kamen: 15, nastroje: 3 }, time: 80, pop: 4 },
         { cost: { hlina: 30, klacky: 20, keramika: 4 }, time: 100, pop: 5, req: 'hrncirstvi' },
         { cost: { prkna: 30, kamen: 20, hlina: 10 }, time: 120, pop: 6, req: 'tesarstvi' },
         { cost: { cihly: 40, ocel: 5, prkna: 10 }, time: 150, pop: 8, req: 'cihlove' },
         { cost: { cihly: 60, ocel: 20, plasty: 10 }, time: 180, pop: 12, req: 'panelaky' },
         { cost: { kompozity: 20, ocel: 30, elektronika: 10 }, time: 220, pop: 18, req: 'arkologie' }] },
  jama: { name: 'Zásobní jáma', names: ['Zásobní jáma', 'Větší zásobní jáma', 'Sýpka'], desc: 'Zvětšuje sklad a lidé do ní nosí suroviny. Od starověku ji přestavíte na sýpku.', req: 'chyse', until: 1,
    lv: [{ cost: { kamen: 10, klacky: 5 }, time: 32, store: 60 },
         { cost: { kamen: 25, nastroje: 2 }, time: 56, store: 150 },
         { cost: { hlina: 25, klacky: 20, keramika: 5 }, time: 80, req: 'hrncirstvi', into: 'sypka' }] },
  dilna: { name: 'Dílna pazourkáře', names: ['Dílna pazourkáře', 'Větší dílna pazourkáře', 'Kovářská dílna'], descAge: 'Od starověku se tu nástroje brousí z kamene. Kovářská dílna je kuje ze železa.', desc: 'Nástrojař tu z pazourku a klacků štípe nástroje.', req: 'nastroje',
    lv: [{ cost: { klacky: 10, kamen: 10, pazourek: 5 }, time: 48, js: { nastroje: 1 }, wk: { in: { pazourek: 2, klacky: 1 }, out: { nastroje: 1 }, t: 14 } },
         { cost: { klacky: 20, kamen: 20, nastroje: 3 }, time: 72, js: { nastroje: 2 }, wk: { in: { pazourek: 2, klacky: 1 }, out: { nastroje: 1 }, t: 14 } },
         { cost: { prkna: 15, zelezo: 5, kamen: 20 }, time: 100, js: { nastroje: 3 }, wk: { in: { zelezo: 1, prkna: 1 }, out: { nastroje: 3 }, t: 18 }, req: 'zelezo' }] },
  drevo: { name: 'Dřevorubecká chata', names: ['Dřevorubecká chata', 'Větší dřevorubecká chata', 'Dřevařský dvůr'], desc: 'V pravěku tu sběrači klacků pracují rychleji. Od starověku mohou dřevo kácet jen dřevorubci, kteří tu mají místo.', req: 'nastroje',
    lv: [{ cost: { klacky: 20, kamen: 5, nastroje: 1 }, time: 60, js: { klacky: 3 } },
         { cost: { klacky: 30, kamen: 15, nastroje: 3 }, time: 90, js: { klacky: 5 } },
         { cost: { klacky: 40, kamen: 20, nastroje: 5 }, time: 100, js: { klacky: 8 }, req: 'tesarstvi' }] },
  lom: { name: 'Kamenolom', names: ['Kamenolom', 'Větší kamenolom', 'Velký lom'], desc: 'Lamači tu lámou kámen přímo ze země – lom nikdy nedojde. V pravěku tu mají místo i sběrači pazourku.', req: 'nastroje',
    lv: [{ cost: { klacky: 15, kamen: 10, nastroje: 1 }, time: 60, js: { lamaci: 2, pazourek: 2 }, wk: { in: {}, out: { kamen: 2 }, t: 14 }, ind: true },
         { cost: { klacky: 25, kamen: 25, nastroje: 3 }, time: 90, js: { lamaci: 4, pazourek: 4 }, wk: { in: {}, out: { kamen: 2 }, t: 12 }, ind: true },
         { cost: { prkna: 30, kamen: 20, nastroje: 5 }, time: 110, js: { lamaci: 8 }, wk: { in: {}, out: { kamen: 3 }, t: 13 }, ind: true, req: 'tesarstvi' }] },
  lovec: { until: 4, name: 'Lovecká chata', desc: 'Bez ní se neloví. Lovci odtud vyrážejí na zvěř a nosí sem maso a kožešiny.', req: 'lov',
    lv: [{ cost: { klacky: 20, kamen: 5, nastroje: 2 }, time: 65, js: { lov: 2 } },
         { cost: { klacky: 30, kozesiny: 6, nastroje: 3 }, time: 95, js: { lov: 4 } }] },
  ryby: { name: 'Rybářská chata', names: ['Rybářská chata', 'Loděnice'], desc: 'Musí stát na břehu. Rybáři loví z břehu; po přestavbě na loděnici vyplouvají na člunech a nachytají mnohem víc.', req: 'rybolov', water: true,
    lv: [{ cost: { klacky: 15, kamen: 5 }, time: 50, js: { ryby: 2 } },
         { cost: { klacky: 40, kozesiny: 4, nastroje: 4 }, time: 110, js: { ryby: 4 }, boat: true }] },
  pole: { until: 5, name: 'Pole', desc: 'Obilí, které na rozdíl od keřů a zvěře nikdy nedojde. Rolníci sejí, okopávají a sklízejí.', req: 'pole',
    lv: [{ cost: { klacky: 15, nastroje: 2 }, time: 60, js: { pole: 2 }, farm: { out: { obili: 6 }, t: 45 } },
         { cost: { klacky: 25, kamen: 10, nastroje: 4 }, time: 90, js: { pole: 3 }, farm: { out: { obili: 10 }, t: 45 } }] },
  skala: { name: 'Malovaná skála', names: ['Malovaná skála', 'Malovaná skála', 'Svatyně'], desc: 'Malby a příběhy. U ohně pak přibývá vědění rychleji. Od starověku ji přestavíte na svatyni.', req: 'malby', until: 1,
    lv: [{ cost: { kamen: 15, bobule: 10 }, time: 48, know: 0.5 },
         { cost: { kamen: 30, kozesiny: 5, nastroje: 2 }, time: 72, know: 1.2 },
         { cost: { kamen: 40, keramika: 10, bronz: 2 }, time: 100, req: 'usedly', into: 'svatyne' }] },
  svatyne: { name: 'Svatyně', names: ['Svatyně', 'Škola', 'Univerzita'], desc: 'Místo vzdělanosti. S každým věkem ji lze vylepšit a vědění přibývá rychleji.', req: 'usedly',
    lv: [{ cost: { kamen: 40, keramika: 10, bronz: 2 }, time: 100, know: 1.6 },
         { cost: { cihly: 60, prkna: 30, stroje: 5 }, time: 150, know: 2.6, req: 'parni_stroj' },
         { cost: { ocel: 40, elektronika: 15, cihly: 60 }, time: 200, know: 4, req: 'elektrina' }] },
  /* ---- starověk ---- */
  hrncir: { name: 'Hrnčířská dílna', desc: 'Hrnčíři tu z hlíny tvarují nádoby a vypalují je v peci.', req: 'hrncirstvi',
    lv: [{ cost: { klacky: 20, kamen: 15, hlina: 10 }, time: 70, js: { hrncire: 2 }, wk: { in: { hlina: 2, klacky: 1 }, out: { keramika: 2 }, t: 16 } },
         { cost: { kamen: 30, hlina: 20, keramika: 5 }, time: 100, js: { hrncire: 4 }, wk: { in: { hlina: 2, klacky: 1 }, out: { keramika: 2 }, t: 16 } }] },
  sypka: { until: 3, names: ['Sýpka', 'Velká sýpka', 'Skladiště'], name: 'Sýpka', desc: 'Hliněná sýpka plná nádob. Velký sklad pro všechny suroviny. Ve středověku ji přestavíte na skladiště.', req: 'hrncirstvi',
    lv: [{ cost: { hlina: 25, klacky: 20, keramika: 5 }, time: 80, store: 150 },
         { cost: { hlina: 40, kamen: 30, keramika: 10 }, time: 110, store: 300 },
         { cost: { prkna: 30, kamen: 30 }, time: 90, req: 'tesarstvi', into: 'sklad' }] },
  hliniste: { name: 'Hliniště', names: ['Hliniště', 'Velké hliniště'], desc: 'Kopáči tu těží hlínu přímo z jámy – hliniště nikdy nedojde.', req: 'hrncirstvi',
    lv: [{ cost: { klacky: 20, kamen: 10, nastroje: 2 }, time: 60, js: { kopaci: 4 }, wk: { in: {}, out: { hlina: 2 }, t: 10 }, ind: true },
         { cost: { prkna: 20, kamen: 20, nastroje: 4 }, time: 90, js: { kopaci: 8 }, wk: { in: {}, out: { hlina: 3 }, t: 13 }, ind: true, req: 'tesarstvi' }] },
  skolka: { name: 'Lesní školka', desc: 'Lesníci sázejí v okolí mladé stromky. Za pár minut z nich vyrostou stromy, které se dají kácet.', req: 'lesnictvi',
    lv: [{ cost: { klacky: 20, kamen: 5, nastroje: 2 }, time: 60, js: { les: 2 }, plant: 7 },
         { cost: { klacky: 30, keramika: 4, nastroje: 3 }, time: 90, js: { les: 4 }, plant: 10 }] },
  ohrada: { name: 'Ohrada', desc: 'Ochočená zvířata. Pastevci se o ně starají a dávají maso a kůže, které nikdy nedojdou.', req: 'chov',
    lv: [{ cost: { klacky: 30, kamen: 5 }, time: 70, js: { chov: 2 }, farm: { out: { maso: 6, kozesiny: 1 }, t: 50 } },
         { cost: { klacky: 40, kamen: 15, obili: 20 }, time: 100, js: { chov: 3 }, farm: { out: { maso: 10, kozesiny: 1 }, t: 50 } }] },
  straz: { name: 'Strážní věž', names: ['Strážní věž', 'Kamenná strážnice'], desc: 'Strážný vidí daleko do krajiny a střílí na vlky a medvědy. Lidé v okolí věže jsou v bezpečí. V noci rozsvítí pochodně – svítí daleko a hlídá větší okolí.', req: 'lov', until: 4,
    lv: [{ cost: { klacky: 30, kamen: 15, nastroje: 2 }, time: 60, guard: 7, dmg: 10 },
         { cost: { kamen: 40, prkna: 15, zelezo: 5 }, time: 90, guard: 9, dmg: 18, req: 'zelezo' }] },
  smeniste: { r: 2, name: 'Tržiště', names: ['Tržiště', 'Větší tržiště', 'Velké tržiště'], desc: 'Tady se prodává i nakupuje. Kupci chodí častěji, zdrží se déle a nabízejí víc zboží.', req: 'obchod', unique: true,
    lv: [{ cost: { klacky: 30, kamen: 20, keramika: 5 }, time: 80, trade: 1 },
         { cost: { klacky: 40, kamen: 30, mince: 20 }, time: 110, trade: 2 },
         { cost: { prkna: 40, kamen: 60, mince: 50 }, time: 140, trade: 2, exped: true, req: 'cechy' }] },
  tavirna: { until: 3, name: 'Tavírna mědi', desc: 'Taviči v hliněné peci roztaví měděnou rudu. Spotřebuje hodně dřeva.', req: 'med',
    lv: [{ cost: { kamen: 30, hlina: 20, keramika: 5 }, time: 90, js: { tavici: 2 }, wk: { in: { ruda: 2, klacky: 3 }, out: { med: 1 }, t: 20 } },
         { cost: { kamen: 40, hlina: 30, med: 5 }, time: 120, js: { tavici: 4 }, wk: { in: { ruda: 2, klacky: 3 }, out: { med: 1 }, t: 20 } }] },
  kovarna: { until: 3, name: 'Kovárna', desc: 'Kováři slévají měď s cínem v bronz. Cín u nás není – kupuje se od kupců.', req: 'bronz',
    lv: [{ cost: { kamen: 30, klacky: 20, med: 10 }, time: 100, js: { kovari: 2 }, wk: { in: { med: 2, cin: 1, klacky: 1 }, out: { bronz: 1 }, t: 24 } }] },
  /* ---- středověk ---- */
  pila: { name: 'Pila', desc: 'Pilaři řežou z dřeva prkna.', req: 'tesarstvi',
    lv: [{ cost: { klacky: 40, kamen: 20, nastroje: 5 }, time: 90, js: { pilari: 2 }, wk: { in: { klacky: 3 }, out: { prkna: 1 }, t: 12 } },
         { cost: { prkna: 30, kamen: 30, zelezo: 3 }, time: 120, js: { pilari: 4 }, wk: { in: { klacky: 3 }, out: { prkna: 2 }, t: 14 }, req: 'zelezo' }] },
  sklad: { names: ['Skladiště', 'Velké skladiště'], name: 'Skladiště', desc: 'Velký dřevěný sklad pro všechny suroviny.', req: 'tesarstvi',
    lv: [{ cost: { prkna: 30, kamen: 30 }, time: 90, store: 300 },
         { cost: { cihly: 60, ocel: 10, prkna: 20 }, time: 120, store: 600, req: 'parni_stroj' }] },
  mlyn: { name: 'Větrný mlýn', desc: 'Mlynáři melou obilí na mouku.', req: 'mlynarstvi',
    lv: [{ cost: { prkna: 30, kamen: 30, nastroje: 5 }, time: 100, js: { mlynari: 2 }, wk: { in: { obili: 3 }, out: { mouka: 2 }, t: 14 } }] },
  pekarna: { name: 'Pekárna', desc: 'Pekaři pečou z mouky chléb. Chléb nasytí nejvíc ze všech jídel.', req: 'mlynarstvi',
    lv: [{ cost: { prkna: 20, kamen: 30, hlina: 20 }, time: 90, js: { pekari: 2 }, wk: { in: { mouka: 2, klacky: 1 }, out: { chleb: 3 }, t: 14 } }] },
  hut: { name: 'Železná huť', names: ['Železná huť', 'Vysoká pec'], desc: 'Hutníci taví železnou rudu na železo. Pec topí dřevem, vysoká pec uhlím.', req: 'zelezo',
    lv: [{ cost: { kamen: 50, hlina: 30, prkna: 10 }, time: 110, js: { hutnici: 2 }, wk: { in: { zelruda: 2, klacky: 3 }, out: { zelezo: 2 }, t: 18 } },
         { cost: { cihly: 40, kamen: 30, prkna: 20 }, time: 140, js: { hutnici: 4 }, wk: { in: { zelruda: 2, uhli: 1 }, out: { zelezo: 2 }, t: 12 }, ind: true, req: 'parni_stroj' }] },
  klaster: { r: 2, name: 'Klášter', desc: 'Mniši opisují knihy a zapisují vědění. Vědění u ohně přibývá mnohem rychleji.', req: 'klaster', unique: true,
    lv: [{ cost: { kamen: 80, prkna: 40, chleb: 20 }, time: 150, know: 2.5 }] },
  /* ---- průmyslová doba (ind = továrna, kterou lze zásobovat pásem) ---- */
  dul_uhli: { name: 'Uhelný důl', desc: 'Musí stát hned vedle ložiska uhlí. Havíři těží uhlí, dokud ložisko nevyčerpají.', req: 'parni_stroj', mine: 'uhli',
    lv: [{ cost: { prkna: 40, zelezo: 10, kamen: 30 }, time: 120, js: { dulnici: 3 }, wk: { in: {}, out: { uhli: 2 }, t: 10 }, ind: true }] },
  dul_zelezo: { name: 'Železný důl', desc: 'Musí stát hned vedle ložiska železné rudy (rezavé skály). Havíři těží rudu bez chození.', req: 'zelezo', mine: 'zelruda',
    lv: [{ cost: { prkna: 30, kamen: 30, nastroje: 5 }, time: 120, js: { banici: 3 }, wk: { in: {}, out: { zelruda: 2 }, t: 12 }, ind: true }] },
  cihelna: { name: 'Cihelna', desc: 'Z hlíny a uhlí pálí cihly.', req: 'parni_stroj',
    lv: [{ cost: { kamen: 40, prkna: 20, zelezo: 5 }, time: 110, js: { cihlari: 3 }, wk: { in: { hlina: 2, uhli: 1 }, out: { cihly: 3 }, t: 12 }, ind: true }] },
  ocelarna: { r: 2, name: 'Ocelárna', desc: 'Ze železa a uhlí vyrábí ocel.', req: 'ocel',
    lv: [{ cost: { cihly: 60, zelezo: 20, kamen: 40 }, time: 150, js: { ocelari: 3 }, wk: { in: { zelezo: 1, uhli: 1 }, out: { ocel: 1 }, t: 10 }, ind: true }] },
  strojirna: { r: 2, name: 'Strojírna', desc: 'Z oceli a prken vyrábí stroje.', req: 'stroje',
    lv: [{ cost: { cihly: 60, ocel: 15, prkna: 30 }, time: 160, js: { strojari: 3 }, wk: { in: { ocel: 1, prkna: 1 }, out: { stroje: 1 }, t: 16 }, ind: true }] },
  /* ---- moderní doba ---- */
  elektrarna: { r: 2, name: 'Elektrárna', desc: 'Spaluje uhlí a vyrábí proud. Továrny s proudem pracují o polovinu rychleji. Jedna elektrárna utáhne 6 továren.', req: 'elektrina',
    lv: [{ cost: { cihly: 60, ocel: 20, stroje: 5 }, time: 160, js: { energetici: 2 }, power: 6, burn: true }] },
  ropny_vrt: { name: 'Ropný vrt', desc: 'Musí stát hned vedle ropného ložiska (černá kaluž). Pumpuje ropu – ložisko pod vrtem se nevyčerpá. Potřebuje elektřinu.', req: 'ropa', mine: 'ropa',
    lv: [{ cost: { ocel: 20, stroje: 5, cihly: 20 }, time: 140, js: { vrtari: 3 }, wk: { in: {}, out: { ropa: 3 }, t: 10 }, ind: true }] },
  rafinerie: { r: 2, name: 'Rafinérie', desc: 'Z ropy vyrábí plasty.', req: 'ropa',
    lv: [{ cost: { ocel: 40, cihly: 40, stroje: 10 }, time: 180, js: { chemici: 3 }, wk: { in: { ropa: 2 }, out: { plasty: 1 }, t: 14 }, ind: true }] },
  elektro: { r: 2, name: 'Továrna na elektroniku', desc: 'Z plastů a oceli vyrábí elektroniku.', req: 'elektronika',
    lv: [{ cost: { ocel: 40, plasty: 20, stroje: 10 }, time: 200, js: { technici: 3 }, wk: { in: { plasty: 1, ocel: 1 }, out: { elektronika: 1 }, t: 18 }, ind: true }] },
  nadrazi: { name: 'Nádraží', desc: 'Musí stát u kolejí. Továrny a doly do 8 políček od nádraží s vlakem pracují o polovinu rychleji – jejich výrobky odveze vlak na druhé nádraží a odtud do skladu.', req: 'zeleznice', rail: true,
    lv: [{ cost: { cihly: 40, ocel: 15, prkna: 20 }, time: 140 }] },
  letiste: { r: 2, name: 'Letiště', desc: 'Letecký obchod se vzdálenými městy: velké zakázky, rychlé lety.', req: 'letectvi', unique: true,
    lv: [{ cost: { ocel: 80, cihly: 80, elektronika: 10 }, time: 240, air: true }] },
  /* ---- budoucnost ---- */
  fuze_reaktor: { r: 2, name: 'Fúzní reaktor', desc: 'Obrovské množství proudu bez uhlí a bez obsluhy. Utáhne 20 továren.', req: 'fuze',
    lv: [{ cost: { ocel: 80, elektronika: 40, cihly: 60 }, time: 240, power: 20, fusion: true }] },
  dronport: { r: 2, name: 'Dronový hangár', desc: 'Drony zásobují všechny továrny do vzdálenosti 10 políček – pracují naplno. Suroviny berou ze skladu.', req: 'drony',
    lv: [{ cost: { elektronika: 30, plasty: 40, ocel: 30 }, time: 200, drone: 10 }] },
  nanotovarna: { r: 2, name: 'Továrna na nanomateriály', desc: 'Z plastů a oceli vyrábí lehké a pevné kompozity.', req: 'nano',
    lv: [{ cost: { ocel: 60, elektronika: 20, plasty: 30 }, time: 220, js: { inzenyri: 3 }, wk: { in: { plasty: 2, ocel: 1 }, out: { kompozity: 1 }, t: 16 }, ind: true }] },
  robotovarna: { r: 2, name: 'Robotická továrna', desc: 'Z elektroniky a kompozitů skládá roboty.', req: 'robotika',
    lv: [{ cost: { kompozity: 30, elektronika: 30, ocel: 40 }, time: 240, js: { robotici: 3 }, wk: { in: { elektronika: 1, kompozity: 1 }, out: { roboti: 1 }, t: 20 }, ind: true }] },
  vfarma: { name: 'Vertikální farma', desc: 'Prosklená věž s patry plnými obilí. Sklidí mnohem víc než pole.', req: 'vfarmy',
    lv: [{ cost: { kompozity: 15, elektronika: 10, ocel: 20 }, time: 200, js: { agronomove: 2 }, farm: { out: { obili: 20 }, t: 40 } }] },
  vytah: { r: 2, name: 'Vesmírný výtah', desc: 'Lano až na oběžnou dráhu. Cesta ke hvězdám – poslední stavba lidstva.', req: 'vytah', unique: true,
    lv: [{ cost: { ocel: 300, kompozity: 150, roboti: 80, elektronika: 150, mince: 1000 }, time: 600, final: true }] }
};
// obchodní výpravy z tržiště do sousedních měst
// cena za 10 kusů na tržišti
const VAL = { klacky: 0.2, kamen: 0.3, pazourek: 0.3, bobule: 0.2, maso: 0.5, ryby: 0.4, obili: 0.3, kozesiny: 1, nastroje: 2, hlina: 0.2,
  keramika: 1.5, ruda: 0.6, med: 2.5, cin: 4, bronz: 6, prkna: 1, mouka: 0.8, chleb: 1, zelruda: 0.6, zelezo: 4, uhli: 0.5, cihly: 0.8, ocel: 6, stroje: 10, ropa: 1.5, plasty: 5, elektronika: 15, kompozity: 12, roboti: 25 };
const sellPrice = r => Math.max(1, Math.round(10 * VAL[r]));
const buyPrice = r => Math.max(2, Math.round(10 * VAL[r] * 1.7));
// co se dá v daném věku koupit
const BUYABLE = [
  ['klacky', 'kamen', 'maso', 'kozesiny'],
  ['klacky', 'kamen', 'hlina', 'obili', 'maso', 'keramika', 'ruda', 'cin'],
  ['klacky', 'kamen', 'obili', 'maso', 'keramika', 'prkna', 'zelruda', 'zelezo', 'cin'],
  ['klacky', 'kamen', 'hlina', 'keramika', 'chleb', 'prkna', 'uhli', 'cihly', 'zelezo', 'ocel'],
  ['kamen', 'hlina', 'keramika', 'chleb', 'prkna', 'uhli', 'cihly', 'ocel', 'stroje', 'ropa', 'plasty'],
  ['chleb', 'uhli', 'cihly', 'ocel', 'stroje', 'plasty', 'elektronika', 'kompozity']];
const CONTRACTS = [
  { to: 'Hradce', want: { prkna: 20 }, get: { mince: 35 } },
  { to: 'Brodu', want: { chleb: 30 }, get: { mince: 30, cin: 3 } },
  { to: 'Klášterce', want: { keramika: 15, obili: 30 }, get: { mince: 30, vedeni: 30 } },
  { to: 'Horní Vsi', want: { zelezo: 8 }, get: { mince: 45 } },
  { to: 'Lhoty', want: { kozesiny: 15, maso: 20 }, get: { mince: 30, zelezo: 3 } },
  { to: 'Týnce', want: { nastroje: 10 }, get: { mince: 40 } },
  { to: 'Kostelce', want: { med: 10, bronz: 3 }, get: { mince: 50 } },
  { to: 'Podhradí', want: { ryby: 30, chleb: 15 }, get: { mince: 35, vedeni: 20 } },
  { to: 'Města', want: { ocel: 10 }, get: { mince: 90 } },
  { to: 'Přístavu', want: { cihly: 60 }, get: { mince: 60 } },
  { to: 'Hlavního města', want: { stroje: 5 }, get: { mince: 80, vedeni: 60 } }
];
const AIR_CONTRACTS = [
  { to: 'Prahy', want: { elektronika: 10 }, get: { mince: 200, vedeni: 80 } },
  { to: 'Vídně', want: { plasty: 30 }, get: { mince: 160 } },
  { to: 'Berlína', want: { stroje: 10 }, get: { mince: 170 } },
  { to: 'Paříže', want: { ocel: 30, cihly: 60 }, get: { mince: 240 } },
  { to: 'Londýna', want: { elektronika: 20 }, get: { mince: 380, vedeni: 150 } },
  { to: 'Říma', want: { chleb: 80, maso: 60 }, get: { mince: 170 } },
  { to: 'Tokia', want: { roboti: 10 }, get: { mince: 450, vedeni: 200 } },
  { to: 'New Yorku', want: { kompozity: 30 }, get: { mince: 420 } }
];

const TECH = {
  ohen:     { name: 'Oheň', desc: 'Křesání pazourkem o pazourek. Umožní postavit ohniště.', cost: { klacky: 10, pazourek: 5 }, time: 50 },
  chyse:    { name: 'Stavba chýší', desc: 'Odemkne chýše a zásobní jámy.', req: ['ohen'], cost: { klacky: 20, vedeni: 5 }, time: 62 },
  nastroje: { name: 'Kamenné nástroje', desc: 'Sběr je o třetinu rychlejší. Odemkne dílnu pazourkáře, dřevorubeckou chatu a kamenolom.', req: ['ohen'], cost: { kamen: 10, pazourek: 10, vedeni: 5 }, time: 75 },
  rybolov:  { name: 'Rybolov', desc: 'Harpuny a vrše. Odemkne rybářskou chatu na břehu; tu lze později přestavět na loděnici.', req: ['ohen'], cost: { klacky: 15, vedeni: 4 }, time: 60 },
  malby:    { name: 'Jeskynní malby', desc: 'Odemkne malovanou skálu.', req: ['ohen'], cost: { bobule: 10, vedeni: 10 }, time: 62 },
  lov:      { name: 'Oštěpy a lov', desc: 'Odemkne loveckou chatu: maso a kožešiny.', req: ['nastroje'], cost: { klacky: 15, nastroje: 3, vedeni: 10 }, time: 88 },
  pole:     { name: 'První políčka', desc: 'Zrní zahrabané do země vyroste. Odemkne pole – jídlo, které nedojde.', req: ['nastroje'], cost: { bobule: 20, nastroje: 2, vedeni: 15 }, time: 90 },
  usedly:   { name: 'Usedlý život', age: 1, desc: 'Postup do starověku: přestavte jeskyni na náčelníkův dlouhý dům (klikněte na jeskyni).', req: ['lov', 'chyse', 'malby'], pop: 12,
    cost: { vedeni: 60, musle: 5, nastroje: 10 }, time: 150 },
  /* ---- starověk ---- */
  hrncirstvi: { name: 'Hrnčířství', desc: 'Hlína z břehů a vypálené nádoby. Odemkne kopání hlíny, hrnčířskou dílnu, sýpku a hliněné domy.', req: ['usedly'], cost: { obili: 20, vedeni: 25 }, time: 120 },
  lesnictvi:  { name: 'Lesnictví', desc: 'Odemkne lesní školku – lesníci sázejí nové stromy.', req: ['usedly'], cost: { klacky: 30, vedeni: 20 }, time: 100 },
  chov:       { name: 'Chov zvířat', desc: 'Odemkne ohradu – maso a kůže, které nedojdou.', req: ['usedly'], cost: { obili: 30, kozesiny: 5, vedeni: 25 }, time: 120 },
  med:        { name: 'Tavení mědi', desc: 'Zelený kámen ve skalách je měděná ruda. Odemkne horníky a tavírnu.', req: ['hrncirstvi'], cost: { keramika: 5, vedeni: 40 }, time: 150 },
  obchod:     { name: 'Obchod a mince', desc: 'Odemkne tržiště. Kupci pak chodí častěji a nabízejí víc.', req: ['hrncirstvi'], cost: { keramika: 8, vedeni: 30 }, time: 120 },
  bronz:      { name: 'Bronz', desc: 'Měď s cínem dá tvrdý bronz. Odemkne kovárnu; bronzové nástroje zrychlí veškerý sběr o čtvrtinu.', req: ['med', 'obchod'], cost: { med: 8, vedeni: 60 }, time: 180 },
  pismo:      { name: 'Písmo', age: 2, desc: 'Konec starověku: přestavte dlouhý dům na hrad (klikněte na něj). Písaři na hradě zapisují úrodu i smlouvy.', req: ['bronz', 'chov', 'lesnictvi'], pop: 25,
    cost: { vedeni: 120, bronz: 10, mince: 30 }, time: 240 },
  /* ---- středověk ---- */
  tesarstvi:  { name: 'Tesařství', desc: 'Pila a prkna, roubenky a velké skladiště.', req: ['pismo'], cost: { klacky: 60, nastroje: 10, vedeni: 60 }, time: 150 },
  mlynarstvi: { name: 'Mlynářství', desc: 'Větrný mlýn a pekárna – chléb nasytí nejvíc.', req: ['pismo'], cost: { obili: 60, vedeni: 60 }, time: 150 },
  cesty:      { name: 'Cesty a kolo', desc: 'Dlážděné cesty (po nich se chodí o 60 % rychleji). Sběrači vozí v trakaři dvojnásobný náklad. Kupci přijíždějí s vozy.', req: ['tesarstvi'], cost: { kamen: 60, prkna: 20, vedeni: 80 }, time: 180 },
  zelezo:     { name: 'Železo', desc: 'Železná ruda (rezavé skály), huť a kovářská dílna. Železné nástroje zrychlí sběr o čtvrtinu.', req: ['tesarstvi'], cost: { bronz: 8, vedeni: 100 }, time: 200 },
  klaster:    { name: 'Klášter', desc: 'Odemkne klášter – mniši zapisují vědění.', req: ['mlynarstvi'], cost: { chleb: 20, vedeni: 80 }, time: 160 },
  cechy:      { name: 'Cechy a tržiště', desc: 'Přestavba na velké tržiště, odkud vypravíte vlastní obchodní povozy do sousedních měst.', req: ['cesty', 'zelezo'], cost: { mince: 50, vedeni: 120 }, time: 220 },
  /* ---- průmyslová doba ---- */
  parni_stroj: { name: 'Parní stroj', desc: 'Uhlí z černých ložisek, uhelný důl a cihelna.', req: ['hrad'], cost: { zelezo: 30, prkna: 40, vedeni: 200 }, time: 200 },
  pasy:        { name: 'Dopravníky', desc: 'Dopravníky uvnitř továren a dolů – všechny továrny a doly pracují o čtvrtinu rychleji.', req: ['parni_stroj'], cost: { zelezo: 20, prkna: 30, vedeni: 200 }, time: 200 },
  ocel:        { name: 'Ocel', desc: 'Železný důl a ocelárna.', req: ['parni_stroj'], cost: { zelezo: 30, uhli: 40, vedeni: 250 }, time: 220 },
  cihlove:     { name: 'Cihlové domy', desc: 'Přestavba roubenek na cihlové činžáky pro 18 lidí.', req: ['parni_stroj'], cost: { cihly: 40, vedeni: 200 }, time: 200 },
  stroje:      { name: 'Strojírenství', desc: 'Strojírna: z oceli a prken vyrábí stroje.', req: ['ocel', 'pasy'], cost: { ocel: 20, vedeni: 300 }, time: 260 },
  /* ---- moderní doba ---- */
  elektrina:   { name: 'Elektřina', desc: 'Elektrárna na uhlí. Továrny s proudem pracují o polovinu rychleji.', req: ['radnice'], cost: { stroje: 10, ocel: 20, vedeni: 400 }, time: 240 },
  zeleznice:   { name: 'Železnice', desc: 'Koleje, nádraží a vlaky, které vozí zboží mezi nádražími.', req: ['radnice'], cost: { ocel: 40, prkna: 40, vedeni: 400 }, time: 240 },
  ropa:        { name: 'Ropa', desc: 'Ropná ložiska, ropný vrt a rafinérie (plasty).', req: ['elektrina'], cost: { stroje: 15, vedeni: 500 }, time: 260 },
  panelaky:    { name: 'Panelové domy', desc: 'Přestavba činžáků na panelové domy pro 28 lidí.', req: ['ropa'], cost: { plasty: 20, vedeni: 400 }, time: 240 },
  elektronika: { name: 'Elektronika', desc: 'Továrna na elektroniku.', req: ['ropa'], cost: { plasty: 20, ocel: 20, vedeni: 600 }, time: 280 },
  letectvi:    { name: 'Letectví', desc: 'Letiště a letecký obchod s velkými městy.', req: ['elektronika', 'zeleznice'], cost: { elektronika: 10, ocel: 40, vedeni: 700 }, time: 300 },
  /* ---- budoucnost ---- */
  fuze:      { name: 'Fúze', desc: 'Fúzní reaktor: proud pro 20 továren bez uhlí.', req: ['mrakodrap'], cost: { elektronika: 40, ocel: 80, vedeni: 1000 }, time: 300 },
  drony:     { name: 'Drony', desc: 'Dronový hangár: továrny v okolí pracují naplno.', req: ['mrakodrap'], cost: { elektronika: 30, plasty: 40, vedeni: 1000 }, time: 300 },
  nano:      { name: 'Nanomateriály', desc: 'Továrna na kompozity.', req: ['fuze'], cost: { plasty: 60, vedeni: 1200 }, time: 320 },
  vfarmy:    { name: 'Vertikální farmy', desc: 'Prosklené věže plné obilí.', req: ['drony'], cost: { elektronika: 20, vedeni: 1000 }, time: 300 },
  robotika:  { name: 'Robotika', desc: 'Robotická továrna.', req: ['nano', 'drony'], cost: { kompozity: 20, elektronika: 40, vedeni: 1500 }, time: 360 },
  arkologie: { name: 'Arkologie', desc: 'Přestavba paneláků na arkologie – zelená města pod jednou střechou pro 45 lidí.', req: ['nano'], cost: { kompozity: 30, vedeni: 1200 }, time: 320 },
  vytah:     { name: 'Vesmírný výtah', desc: 'Odemkne stavbu vesmírného výtahu – poslední cíl hry. Vyžaduje aspoň 120 obyvatel.', req: ['robotika', 'arkologie', 'vfarmy'], pop: 120, cost: { vedeni: 3000 }, time: 480 },
  mrakodrap:   { name: 'Vesmírné centrum', age: 5, desc: 'Konec moderní doby: přestavte mrakodrap na vesmírné centrum (klikněte na něj).', req: ['letectvi', 'panelaky'], pop: 100, cost: {}, time: 1 },
  radnice:     { name: 'Mrakodrap', age: 4, desc: 'Konec průmyslové doby: přestavte radnici na mrakodrap (klikněte na ni).', req: ['stroje', 'cihlove'], pop: 60, cost: {}, time: 1 },
  hrad:       { name: 'Radnice', age: 3, desc: 'Konec středověku: přestavte hrad na radnici (klikněte na něj).', req: ['cechy', 'klaster', 'mlynarstvi'], pop: 40, cost: {}, time: 1 }
};
const TECH_TREE = [
  ['Pravěk', [['ohen'], ['chyse', 'nastroje', 'rybolov', 'malby'], ['lov', 'pole'], ['usedly']]],
  ['Starověk', [['hrncirstvi', 'lesnictvi', 'chov'], ['med', 'obchod'], ['bronz'], ['pismo']]],
  ['Středověk', [['tesarstvi', 'mlynarstvi'], ['cesty', 'zelezo', 'klaster'], ['cechy'], ['hrad']]],
  ['Průmysl', [['parni_stroj'], ['pasy', 'ocel', 'cihlove'], ['stroje'], ['radnice']]],
  ['Moderní doba', [['elektrina', 'zeleznice'], ['ropa'], ['panelaky', 'elektronika'], ['letectvi'], ['mrakodrap']]],
  ['Budoucnost', [['fuze', 'drony'], ['nano', 'vfarmy'], ['robotika', 'arkologie'], ['vytah']]]
];

const OFFERS = [
  { give: { musle: 1 }, want: { kozesiny: 3 } },
  { give: { musle: 1 }, want: { nastroje: 2 } },
  { give: { musle: 1 }, want: { bobule: 25 } },
  { give: { pazourek: 8 }, want: { bobule: 10 } },
  { give: { kamen: 10 }, want: { maso: 5 } },
  { give: { nastroje: 2 }, want: { maso: 6 } },
  { give: { kozesiny: 3 }, want: { bobule: 12 } },
  { give: { maso: 6 }, want: { klacky: 15 } },
  { give: { vedeni: 5 }, want: { bobule: 15 } },
  { give: { klacky: 12 }, want: { kamen: 8 } }
];
const OFFERS2 = [
  { give: { cin: 2 }, want: { mince: 6 } },
  { give: { mince: 3 }, want: { keramika: 2 } },
  { give: { mince: 2 }, want: { obili: 15 } },
  { give: { mince: 3 }, want: { kozesiny: 3 } },
  { give: { mince: 5 }, want: { med: 2 } },
  { give: { mince: 2 }, want: { ryby: 10 } },
  { give: { mince: 4 }, want: { nastroje: 2 } },
  { give: { mince: 10 }, want: { bronz: 1 } },
  { give: { mince: 2 }, want: { maso: 8 } },
  { give: { kozesiny: 3 }, want: { mince: 3 } },
  { give: { kamen: 10 }, want: { mince: 2 } },
  { give: { vedeni: 10 }, want: { mince: 5 } },
  { give: { ruda: 6 }, want: { mince: 4 } },
  { give: { hlina: 10 }, want: { mince: 1 } }
];
const NEWS2 = [
  'Na jihu staví z pálených cihel domy vysoké jako tři muži.',
  'Za horami vládne král. Jeho písaři zapisují úrodu na hliněné destičky.',
  'Cín se těží daleko na západě, na ostrovech v mlze. Proto je tak drahý.',
  'Viděl jsem vůz s koly. Uveze víc než deset soumarů.',
  'Lidé u velké řeky počítají roky podle záplav.',
  'Ve městě za mořem si za kus kovu koupíš celou krávu.'
];
const NEWS = [
  'Za řekou prý žije kmen, který si staví chýše z mamutích klů.',
  'Na jihu je moře. Voda tam je slaná a na břehu leží mušle.',
  'Viděl jsem lidi, kteří zahrabávají zrní do země a čekají, až vyroste.',
  'Daleko na východě umějí z hlíny uplácat nádobu a vypálit ji v ohni.',
  'Potkal jsem lovce se zvířetem, které ho poslouchá. Říká mu pes.',
  'V horách prý leží zelený kámen, který v ohni změkne a teče.'
];

const OBJ = [
  { t: 'Kmen se choulí v jeskyni. Označte lidi (kliknutím nebo tažením myši) a pravým tlačítkem je pošlete na stromy a na pazourek. Nasbírejte 10 klacků a 5 pazourků.', c: () => S.res.klacky >= 10 && S.res.pazourek >= 5 },
  { t: 'Noci jsou krutě studené. Nahoře otevřete Technologie a objevte oheň.', c: () => S.research.done.ohen },
  { t: 'Postavte ohniště: vyberte ho dole v liště, umístěte do mapy. Stavět půjdou sami všichni volní lidé; další můžete poslat pravým tlačítkem na staveniště.', c: () => has('ohniste') },
  { t: 'Oheň žere klacky a lidé jídlo. Mějte v zásobě 25 bobulí a 20 klacků.', c: () => S.res.bobule >= 25 && S.res.klacky >= 20 },
  { t: 'U ohně se vypráví a přibývá vědění 💡. Vyzkoumejte stavbu chýší a postavte první chýši.', c: () => has('chyse') },
  { t: 'K ohni chodí pocestní. Až některý dorazí, něco s ním směňte.', c: () => S.stats.trades > 0 },
  { t: 'Vyzkoumejte kamenné nástroje, postavte dílnu, pošlete do ní člověka (pravým tlačítkem na dílnu) a vyrobte 5 nástrojů.', c: () => S.stats.tools >= 5 },
  { t: 'Vyzkoumejte oštěpy a lov, postavte loveckou chatu, pošlete lovce na zvěř a získejte 10 kožešin.', c: () => S.stats.hides >= 10 },
  { t: 'Kmen roste. Dosáhněte 12 obyvatel a vylepšete jednu chýši na 2. stupeň (klikněte na ni).', c: () => S.people.length >= 12 && S.blds.some(b => b.type === 'chyse' && b.lvl >= 2) },
  { t: 'Postavte dřevorubeckou chatu, kamenolom, malovanou skálu a zásobní jámu.', c: () => has('drevo') && has('lom') && has('skala') && has('jama') },
  { t: 'Poslední krok pravěku: klikněte na jeskyni a přestavte ji na náčelníkův dlouhý dům. Potřebujete 12 obyvatel a 5 mušlí – vymění vám je pocestní a občas je na břehu najdou rybáři.', c: () => S.age >= 1 },
  { t: 'Začíná starověk! Vyzkoumejte hrnčířství, postavte hliniště a hrnčířskou dílnu.', c: () => has('hrncir') },
  { t: 'Pošlete do dílny hrnčíře a vyrobte 10 nádob 🏺.', c: () => (S.stats.made.keramika || 0) >= 10 },
  { t: 'Lesy kolem osady řídnou. Vyzkoumejte lesnictví a postavte lesní školku – lesníci budou sázet nové stromy.', c: () => has('skolka') },
  { t: 'Ochočte zvířata: vyzkoumejte chov zvířat, postavte ohradu a pošlete k ní pastevce.', c: () => has('ohrada') },
  { t: 'Kupci platí mincemi 🪙. Vyzkoumejte obchod, postavte tržiště a našetřete 20 mincí.', c: () => S.res.mince >= 20 },
  { t: 'Ve skalách je zelený kámen – měděná ruda. Vyzkoumejte tavení mědi, pošlete horníky, postavte tavírnu a vyrobte 10 mědi.', c: () => (S.stats.made.med || 0) >= 10 },
  { t: 'Cín u nás není, kupte ho od kupců. Vyzkoumejte bronz, postavte kovárnu a vyrobte 5 bronzu.', c: () => (S.stats.made.bronz || 0) >= 5 },
  { t: 'Osada se mění v město. Přestavte chýše na hliněné domy, dosáhněte 25 obyvatel a přestavte dlouhý dům na hrad.', c: () => S.age >= 2 },
  { t: 'Začíná středověk! Vyzkoumejte tesařství a postavte pilu – z klacků budou prkna.', c: () => has('pila') },
  { t: 'Přestavte hliněný dům na roubenku (klikněte na něj).', c: () => S.blds.some(b => b.type === 'chyse' && b.lvl >= 5) },
  { t: 'Chléb nasytí nejvíc. Vyzkoumejte mlynářství, postavte mlýn a pekárnu a upečte 30 chlebů 🍞.', c: () => (S.stats.made.chleb || 0) >= 30 },
  { t: 'Vyzkoumejte cesty a kolo a vydlážděte aspoň 20 políček cesty (tlačítko Cesta dole) – lidé po nich chodí rychleji.', c: () => S.roads.length >= 20 },
  { t: 'Vyzkoumejte železo, pošlete horníky na železnou rudu (rezavé skály) a v huti vyrobte 10 železa.', c: () => (S.stats.made.zelezo || 0) >= 10 },
  { t: 'Vyzkoumejte klášter a postavte ho – mniši zapisují vědění.', c: () => has('klaster') },
  { t: 'Vyzkoumejte cechy, přestavte tržiště na velké tržiště a vypravte obchodní povoz do sousedního města.', c: () => S.stats.exped >= 1 },
  { t: 'Poslední krok středověku: mějte 40 obyvatel a přestavte hrad na radnici.', c: () => S.age >= 3 },
  { t: 'Začíná průmyslová doba! Vyzkoumejte parní stroj a postavte uhelný důl hned vedle černého ložiska uhlí.', c: () => has('dul_uhli') },
  { t: 'Postavte cihelnu a vypalte 50 cihel 🧱.', c: () => (S.stats.made.cihly || 0) >= 50 },
  { t: 'Vyzkoumejte dopravníky – továrny a doly budou pracovat rychleji.', c: () => !!S.research.done.pasy },
  { t: 'Vyzkoumejte ocel, postavte železný důl a ocelárnu a vyrobte 20 oceli 🔩.', c: () => (S.stats.made.ocel || 0) >= 20 },
  { t: 'Vyzkoumejte strojírenství a vyrobte 10 strojů 🛠️.', c: () => (S.stats.made.stroje || 0) >= 10 },
  { t: 'Postavte cihlové činžáky, mějte 60 obyvatel a přestavte radnici na mrakodrap.', c: () => S.age >= 4 },
  { t: 'Začíná moderní doba! Vyzkoumejte elektřinu a postavte elektrárnu – továrny s proudem pracují o polovinu rychleji.', c: () => has('elektrarna') },
  { t: 'Vyzkoumejte železnici, položte koleje a postavte na nich dvě nádraží. Továrny a doly do 8 políček od nádraží posílají výrobky vlakem a pracují rychleji. Převezte vlakem 30 kusů.', c: () => S.stats.trainCargo >= 30 },
  { t: 'Vyzkoumejte ropu, postavte ropný vrt u ropného ložiska (černá kaluž) a rafinérii a vyrobte 30 plastů 🧴.', c: () => (S.stats.made.plasty || 0) >= 30 },
  { t: 'Vyzkoumejte elektroniku a vyrobte 20 kusů elektroniky 💾.', c: () => (S.stats.made.elektronika || 0) >= 20 },
  { t: 'Vyzkoumejte letectví, postavte letiště a odbavte první let.', c: () => S.stats.flights >= 1 },
  { t: 'Poslední krok moderní doby: panelové domy, 100 obyvatel a přestavba mrakodrapu na vesmírné centrum.', c: () => S.age >= 5 },
  { t: 'Začíná budoucnost! Vyzkoumejte fúzi a postavte fúzní reaktor – proud bez uhlí.', c: () => has('fuze_reaktor') },
  { t: 'Vyzkoumejte drony a postavte dronový hangár. Drony zásobí továrny v okolí.', c: () => has('dronport') },
  { t: 'Vyzkoumejte nanomateriály a vyrobte 30 kompozitů 🔷.', c: () => (S.stats.made.kompozity || 0) >= 30 },
  { t: 'Vyzkoumejte robotiku a vyrobte 20 robotů 🤖.', c: () => (S.stats.made.roboti || 0) >= 20 },
  { t: 'Postavte vertikální farmy, přestavte paneláky na arkologie a mějte 120 obyvatel.', c: () => S.people.length >= 120 && has('vfarma') },
  { t: 'Poslední cíl: vyzkoumejte a postavte vesmírný výtah. Cesta ke hvězdám!', c: () => has('vytah') },
  { t: 'Lidstvo vyrazilo ke hvězdám. Příběh je u konce – město můžete dál rozvíjet.', c: () => false }
];

/* ---------- stav ---------- */
let S = null;
let rev = new Uint8Array(N * N), terr = new Uint8Array(N * N);
let beltMap = new Map(), beltMode = false, bdrag = null, railSet = new Set(), railMode = false, rdrag = null, railsDirty = true;
let occ = new Map(), nodeMap = new Map(), comp = new Int16Array(N * N), roadSet = new Set(), roadMode = false;
let selId = null, placing = null, modalKind = null;
const cam = { x: OX, y: (CX + CY) * TH / 2, z: 1 };
const cv = document.getElementById('c'); let ctx = cv.getContext('2d');
const tcan = document.createElement('canvas'); tcan.width = N * TW; tcan.height = N * TH + TH;
const tctx = tcan.getContext('2d');
const lcan = document.createElement('canvas'), lctx = lcan.getContext('2d');
const mouse = { x: 0, y: 0, down: false, sx: 0, sy: 0, drag: false, inside: false };
const keys = {};
const $ = id => document.getElementById(id);

/* ---------- náhoda a terén ---------- */
function hash(x, y, s) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function noise(x, y, s, sc) {
  x /= sc; y /= sc;
  const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
function genTerrain() {
  const s = S.seed;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.hypot(x - CX, y - CY);
    const e = (noise(x, y, s, 10) + 0.5 * noise(x, y, s + 1, 4)) / 1.5;
    const w = noise(x, y, s + 7, 12);
    let t = T_GRASS;
    if (w < 0.24 && d > 8) t = T_WATER;
    else if (e > 0.68 && d > 5) t = T_ROCK;
    else if (e < 0.32) t = T_DIRT;
    if (x + y < CX + CY && Math.hypot(x - (CX - 1), y - (CY - 1)) < 3.6) t = T_ROCK;
    terr[x + y * N] = t;
  }
  genComp();
}
function genComp() {
  comp.fill(-1); let c = 0;
  for (let i = 0; i < N * N; i++) {
    if (comp[i] >= 0 || terr[i] === T_WATER) continue;
    const q = [i]; comp[i] = c;
    while (q.length) {
      const k = q.pop(), x = k % N, y = (k - x) / N;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const m = nx + ny * N; if (comp[m] < 0 && terr[m] !== T_WATER) { comp[m] = c; q.push(m); }
      }
    }
    c++;
  }
}
const isWater = (x, y) => x < 0 || y < 0 || x >= N || y >= N || terr[Math.floor(x) + Math.floor(y) * N] === T_WATER;
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 0.2));
  for (let i = 1; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    if (isWater(x, y) || isWater(x + 0.1, y) || isWater(x - 0.1, y) || isWater(x, y + 0.1) || isWater(x, y - 0.1)) return false;
  }
  return true;
}
function findPath(x0, y0, x1, y1) {
  const sx = Math.floor(x0), sy = Math.floor(y0), gx = Math.floor(x1), gy = Math.floor(y1);
  if (isWater(gx, gy) || sx < 0 || sy < 0 || sx >= N || sy >= N) return null;
  const prev = new Int32Array(N * N).fill(-1), start = sx + sy * N, goal = gx + gy * N, q = [start];
  prev[start] = start;
  for (let h = 0; h < q.length && prev[goal] < 0; h++) {
    const k = q[h], x = k % N, y = (k - x) / N;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (isWater(nx, ny)) continue;
      if (dx && dy && (isWater(x + dx, y) || isWater(x, y + dy))) continue;
      const m = nx + ny * N; if (prev[m] >= 0) continue;
      prev[m] = k; q.push(m);
    }
  }
  if (prev[goal] < 0) return null;
  const path = [[x1, y1]];
  for (let k = prev[goal]; k !== start; k = prev[k]) path.unshift([k % N + 0.5, Math.floor(k / N) + 0.5]);
  return path;
}
// chůze po souši: rovně, když to jde, jinak oklikou kolem vody
function goTo(p, tx, ty, sp, dt) {
  if (p.gx !== tx || p.gy !== ty || !p.path) {
    p.gx = tx; p.gy = ty; p.nopath = false;
    p.path = los(p.x, p.y, tx, ty) ? [[tx, ty]] : findPath(p.x, p.y, tx, ty);
    if (!p.path) { p.nopath = true; p.path = []; }
  }
  if (p.nopath) return false;
  while (p.path.length > 1 && los(p.x, p.y, p.path[1][0], p.path[1][1])) p.path.shift();
  const w = p.path[0]; if (!w) { p.path = null; return true; }
  if (moveTo(p, w[0], w[1], sp, dt)) { p.path.shift(); if (!p.path.length) { p.path = null; p.gx = null; return true; } }
  return false;
}
const compAt = (x, y) => comp[Math.floor(x) + Math.floor(y) * N];
function reach(p, tx, ty) { const pc = compAt(p.x, p.y); return pc < 0 || comp[tx + ty * N] === pc; }
function waterNear(b) {
  for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
    if (!isWater(b.x + dx, b.y + dy) || b.x + dx < 0 || b.y + dy < 0 || b.x + dx >= N || b.y + dy >= N) continue;
    let k = 1; while (k < 3 && b.x + dx * (k + 1) >= 0 && b.y + dy * (k + 1) >= 0 && b.x + dx * (k + 1) < N && b.y + dy * (k + 1) < N && isWater(b.x + dx * (k + 1), b.y + dy * (k + 1))) k++;
    return { dx, dy, fx: b.x + 0.5 + dx * (k + 0.1), fy: b.y + 0.5 + dy * (k + 0.1) };
  }
  return null;
}
const bname = b => (BLD[b.type].names || [])[b.lvl - 1] || BLD[b.type].name;
// nové suroviny se objeví až s věkem, který je potřebuje – a čím pozdější věk, tím dál od osady
const ORE_AGE = { ruda: [1, 14, 5], zelruda: [2, 21, 5], uhli: [3, 28, 4], ropa: [4, 34, 4] };   // věk, min. vzdálenost, počet ložisek
const ORE_TER = { ruda: [T_ROCK, T_DIRT], zelruda: [T_ROCK, T_DIRT], uhli: [T_ROCK, T_DIRT], ropa: [T_GRASS, T_DIRT] };
function genOre(t) {
  const [age, minD, cnt] = ORE_AGE[t], hc = comp[CX + CY * N], ters = ORE_TER[t];
  const cand = [];
  for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) {
    const i = x + y * N, ti = ters.indexOf(terr[i]), d = Math.hypot(x - CX, y - CY);
    if (ti < 0 || comp[i] !== hc || occ.has(i) || d < minD || roadSet.has(i) || railSet.has(i)) continue;
    if (S.blds.some(b => Math.max(Math.abs(b.x - x), Math.abs(b.y - y)) <= 2)) continue;
    cand.push([ti * 6 + (d - minD) * 0.3 + hash(x, y, S.seed + 230) * 4, x, y]);
  }
  cand.sort((a, b) => a[0] - b[0]);
  const placed = [];
  for (const [, x, y] of cand) {
    if (placed.length >= cnt) break;
    if (placed.some(q => Math.hypot(q[0] - x, q[1] - y) < 7)) continue;   // ložiska rozházená po mapě
    placed.push([x, y]);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]].slice(0, 2 + (hash(x, y, 7) > 0.5 ? 1 : 0))) {   // shluk 2–3 políček
      const xx = x + dx, yy = y + dy, k = xx + yy * N;
      if (occ.has(k) || terr[k] === T_WATER || comp[k] !== hc) continue;
      const n = { id: S.nid++, t, x: xx, y: yy, amt: NODE[t].max, rg: 0 }; S.nodes.push(n); occ.set(k, n); nodeMap.set(n.id, n);
    }
  }
}
function genAgeOres(quiet) {
  S.oreGen = S.oreGen || {};
  for (const t in ORE_AGE) if (S.age >= ORE_AGE[t][0] && !S.oreGen[t]) {
    S.oreGen[t] = true; genOre(t);
    if (!quiet) log('Průzkumníci objevili daleko za osadou ložiska: ' + RES[NODE[t].res][1].toLowerCase() + '.');
  }
}
// ložiska rud nesmí úplně dojít: když jich v dosahu osady ubude, průzkumníci najdou nová
const oreMinD = t => ORE_AGE[t] ? ORE_AGE[t][1] : 7;
const ORE_MIN = [['kamen', 0, 6, [T_ROCK, T_DIRT]], ['ruda', 1, 4, [T_ROCK, T_DIRT]], ['zelruda', 2, 4, [T_ROCK, T_DIRT]], ['uhli', 3, 3, [T_ROCK, T_DIRT]], ['ropa', 4, 3, [T_GRASS, T_DIRT]]];
function ensureOres(quiet) {
  const hc = comp[CX + CY * N];
  for (const [t, age, min, ters] of ORE_MIN) {
    if (S.age < age || (t === 'kamen' && S.age >= 1)) continue;
    let have = S.nodes.filter(n => n.t === t && n.amt >= 1 && comp[n.x + n.y * N] === hc).length;
    if (have >= min) continue;
    const cand = [];
    for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) {
      const i = x + y * N, ti = ters.indexOf(terr[i]);
      if (ti < 0 || comp[i] !== hc || occ.has(i) || roadSet.has(i) || beltMap.has(i) || railSet.has(i) || Math.hypot(x - CX, y - CY) < oreMinD(t)) continue;
      if (S.blds.some(b => Math.max(Math.abs(b.x - x), Math.abs(b.y - y)) <= 2)) continue;
      cand.push([ti * 10 + (rev[i] ? 0 : 5) + Math.random(), x, y]);   // přednost: skála, odkrytá krajina
    }
    cand.sort((a, b) => a[0] - b[0]);
    let added = 0;
    for (const [, x, y] of cand) {
      if (have >= min) break;
      if (S.nodes.some(n => n.t === t && Math.hypot(n.x - x, n.y - y) < 4)) continue;
      const n = { id: S.nid++, t, x, y, amt: NODE[t].max, rg: 0 }; S.nodes.push(n); occ.set(x + y * N, n); nodeMap.set(n.id, n);
      have++; added++;
    }
    if (added && !quiet) log('Průzkumníci našli nové ložisko: ' + RES[NODE[t].res][1].toLowerCase() + '.');
  }
}
// hliniště u vody: když jich je málo, přibudou nová (hlína se navíc po vytěžení znovu zaplňuje)
function ensureClay() {
  const hc = comp[CX + CY * N];
  if (S.nodes.filter(n => n.t === 'hlina' && comp[n.x + n.y * N] === hc).length >= 6) return;
  let added = 0;
  for (let y = 1; y < N - 1 && added < 8; y++) for (let x = 1; x < N - 1 && added < 8; x++) {
    const i = x + y * N; if (occ.has(i) || comp[i] !== hc || terr[i] === T_WATER || terr[i] === T_ROCK || railSet.has(i) || beltMap.has(i)) continue;
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => terr[x + d[0] + (y + d[1]) * N] === T_WATER)) continue;
    if (S.blds.some(b => Math.hypot(b.x - x, b.y - y) < 2.5) || hash(x, y, S.seed + 211) > 0.35) continue;
    const n = { id: S.nid++, t: 'hlina', x, y, amt: NODE.hlina.max, rg: 0 }; S.nodes.push(n); occ.set(i, n); nodeMap.set(n.id, n); added++;
  }
}
function genNodes() {
  const s = S.seed, used = new Set();
  const put = (t, x, y) => { const k = x + y * N; if (used.has(k)) return; used.add(k); S.nodes.push({ id: S.nid++, t, x, y, amt: NODE[t].max, rg: 0 }); };
  [['strom', CX + -3, CY + 3], ['strom', CX + -4, CY + 4], ['strom', CX + -2, CY + 5], ['strom', CX + 4, CY + 4], ['strom', CX + 5, CY + 3], ['strom', CX + -5, CY + 2],
   ['ker', CX + 2, CY + 5], ['ker', CX + 3, CY + 6], ['ker', CX + 1, CY + 6], ['ker', CX + 5, CY + 1], ['ker', CX + -1, CY + 6],
   ['kamen', CX + 3, CY + -3], ['kamen', CX + 4, CY + -2], ['pazourek', CX + -4, CY + -1], ['pazourek', CX + -5, CY + 0], ['pazourek', CX + 5, CY + -2]
  ].forEach(a => put(a[0], a[1], a[2]));
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    const d = Math.hypot(x - CX, y - CY), t = terr[x + y * N], r = hash(x, y, s + 99);
    if (d < 4.5 || t === T_WATER) continue;
    if (t === T_GRASS) {
      if (noise(x, y, s + 3, 6) > 0.55 && r < 0.45) put('strom', x, y);
      else if (r > 0.965) put('ker', x, y);
      else if (r > 0.955 && d > 11) put('zver', x, y);
    } else if (t === T_ROCK) {
      if (r < 0.14) put('kamen', x, y); else if (r < 0.2) put('pazourek', x, y);
    } else if (t === T_DIRT) {
      if (r < 0.04) put('pazourek', x, y); else if (r < 0.08) put('kamen', x, y); else if (r > 0.97) put('ker', x, y);
    }
  }
}

function newState() {
  S = {
    v: 1, seed: (Math.random() * 1e9) | 0, time: 15,
    res: { klacky: 0, kamen: 0, pazourek: 0, bobule: 40, maso: 15, ryby: 0, obili: 0, kozesiny: 0, nastroje: 0, musle: 0, vedeni: 0 },
    jobs: {}, people: [], nodes: [], blds: [], nid: 1, site: null,
    research: { done: {}, cur: null }, fire: { lit: false, t: 0 },
    trader: null, nextTrader: 70, obj: 0, log: [], stats: { trades: 0, tools: 0, hides: 0 },
    debt: 0, starve: 0, grow: 0, speed: 1, won: false, rev: '', mapN: N
  };
  genTerrain(); genNodes();
  S.blds.push({ id: S.nid++, type: 'jeskyne', x: CX, y: CY, lvl: 1, t: 0 });
  for (let i = 0; i < 5; i++) addPerson();
  rev.fill(0);
  afterLoad(false);
  log('Zima se blíží. Kmen našel úkryt v jeskyni.');
}
function addPerson() {
  S.people.push({ id: S.nid++, x: CX + 0.2 + Math.random() * 1.6, y: CY + 1.2 + Math.random() * 1.5, job: null, st: 'find', t: 0, n: 0, nid: 0, carry: null, skin: Math.floor(Math.random() * 3) });
}
function afterLoad(fromSave) {
  if (fromSave) {
    genTerrain();
    for (let i = 0; i < N * N; i++) rev[i] = S.rev.charCodeAt(i) === 49 ? 1 : 0;
  }
  for (const r in RES) S.res[r] = S.res[r] || 0;
  S.fullT = S.fullT || {};
  S.keep = S.keep || { hlina: 30, klacky: 20, prkna: 20, zelezo: 10, med: 10, obili: 20 };
  if (S.keep.uhli === undefined) S.keep.uhli = 50;
  S.stats.made = S.stats.made || {};
  S.age = Math.max(S.age || 0, S.research.done.hrad ? 3 : S.research.done.pismo ? 2 : S.research.done.usedly ? 1 : 0);
  S.stats.exped = S.stats.exped || 0; S.roads = S.roads || []; roadSet = new Set(S.roads); roadMode = false;
  { const cave = S.blds.find(b => b.type === 'jeskyne'); if (cave) cave.lvl = Math.max(cave.lvl, S.age + 1); }
  if (!S.zverMax) S.zverMax = Math.max(10, S.nodes.filter(n => n.t === 'zver').length);
  S.nodes = S.nodes.filter(n => n.amt >= 1 || (NODE[n.t] && NODE[n.t].renew));
  occ.clear(); nodeMap.clear();
  S.nodes.forEach(n => { occ.set(n.x + n.y * N, n); nodeMap.set(n.id, n); });
  S.blds.forEach(b => occ.set(b.x + b.y * N, b));
  genAgeOres(true);
  if (!S.wild) genWild();
  S.rails = S.rails || []; railSet = new Set(S.rails); railMode = false; railsDirty = true;
  S.trains = S.trains || []; S.stats.trainCargo = S.stats.trainCargo || 0; S.stats.flights = S.stats.flights || 0;
  roadSet = new Set(S.roads || []); beltMap = new Map((S.belts || []).map(b => [b.k, b]));
  ensureOres(true);
  S.stats.belted = S.stats.belted || 0; S.belts = S.belts || [];
  if (S.belts.length) { for (const r in BELT_COST) addRes(r, BELT_COST[r] * S.belts.length); S.belts.forEach(bl => bl.q.forEach(it => addRes(it.r, 1))); S.belts = []; }   // pásy ze hry zmizely beltMap = new Map(S.belts.map(b => [b.k, b])); beltMode = false;
  if (S.age >= 1) flintToStone();
  S.nodes.forEach(n => { if (NODE[n.t] && !n.young && n.amt > NODE[n.t].max) n.amt = NODE[n.t].max; });
  tctx.clearRect(0, 0, tcan.width, tcan.height);
  if (terrMode === 'textury') terrDirty = true;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (rev[x + y * N]) drawTile(x, y);
  if (terrMode !== 'textury') S.roads.forEach(k => roadTile(tctx, k % N, Math.floor(k / N)));
  reveal(CX, CY, 9);
  selId = null; placing = null; selP.clear(); closeModal();
  cam.x = OX; cam.y = (CX + CY) * TH / 2;
  renderUI();
}

/* ---------- pomocné ---------- */
const has = t => S.blds.some(b => b.type === t);
const bById = id => S.blds.find(b => b.id === id);
const lvOf = b => BLD[b.type].lv[b.lvl - 1];
const isNight = () => (S.time % DAY) / DAY >= NIGHT_FROM;
const dayNo = () => Math.floor(S.time / DAY) + 1;
function storeCap() { return 60 + S.blds.reduce((a, b) => a + (lvOf(b).store || 0), 0); }
function popCap() { return 6 + S.blds.reduce((a, b) => a + (lvOf(b).pop || 0), 0); }
function addRes(r, n) { S.res[r] = UNCAPPED[r] ? S.res[r] + n : Math.min(storeCap(), S.res[r] + n); }
function canPay(c) { for (const r in c) if (Math.floor(S.res[r]) < c[r]) return false; return true; }
function pay(c) { for (const r in c) S.res[r] -= c[r]; }
function costStr(c) {
  return Object.keys(c).map(r => `<span class="${Math.floor(S.res[r]) < c[r] ? 'lack' : ''}" title="${RES[r][1]}">${RES[r][0]}${c[r]}</span>`).join(' ');
}
function log(m) { S.log.push(m); if (S.log.length > 40) S.log.shift(); toast(m); }
function toast(m) {
  const box = $('toast'), old = box.querySelectorAll('div');
  if (old.length >= 3) old[0].remove();
  const d = document.createElement('div'); d.textContent = m; box.appendChild(d);
  setTimeout(() => d.remove(), 5000);
}
function reveal(cx, cy, r) {
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(N - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(N - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (rev[x + y * N] || Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > r) continue;
    rev[x + y * N] = 1; drawTile(x, y); if (terrMode === 'textury') fogCut(x, y);
  }
}
const iso = (x, y) => [(x - y) * TW / 2 + OX, (x + y) * TH / 2];
// kam je postava otočená: podle pohybu na obrazovce; při pohybu skoro svisle dolů doprava, nahoru doleva (otočí se čelem vzad)
const faceDir = (dx, dy) => { const sx = dx - dy, sy = dx + dy; return Math.abs(sx) < 0.5 * Math.abs(sy) ? (sy > 0 ? 1 : -1) : (sx >= 0 ? 1 : -1); };
function screenToTile(sx, sy) {
  const wx = (sx - cv.width / 2) / cam.z + cam.x, wy = (sy - cv.height / 2) / cam.z + cam.y;
  const a = (wx - OX) / (TW / 2), b = wy / (TH / 2);
  return [(a + b) / 2, (b - a) / 2];
}
function home() { return S.blds.find(b => b.type === 'ohniste') || S.blds[0]; }

/* ---------- divoká zvířata ---------- */
const WILD = { vlk: { sp: 0.95, h: 36, range: 6 }, medved: { sp: 0.6, h: 46, range: 4 } };
const wildOk = (x, y) => { const i = Math.floor(x) + Math.floor(y) * N; return x >= 1 && y >= 1 && x < N - 1 && y < N - 1 && terr[i] !== T_WATER && comp[i] === comp[CX + CY * N]; };
const nearTown = (x, y, d) => S.blds.some(b => Math.hypot(b.x - x, b.y - y) < d);
function genWild() {
  S.wild = [];
  const spots = [];
  for (let y = 3; y < N - 3; y++) for (let x = 3; x < N - 3; x++) {
    const i = x + y * N, d = Math.hypot(x - CX, y - CY);
    if (d < 17 || !wildOk(x, y) || occ.has(i)) continue;
    let trees = 0; for (let yy = y - 2; yy <= y + 2; yy++) for (let xx = x - 2; xx <= x + 2; xx++) { const o = occ.get(xx + yy * N); if (o && o.t === 'strom') trees++; }
    spots.push([(trees >= 1 && trees <= 5 ? 6 : 0) + hash(x, y, S.seed + 501) * 5, x, y]);   // okraj lesa – zvířata jsou vidět
  }
  spots.sort((a, b) => b[0] - a[0]);
  const used = [];
  const take = () => { for (const [, x, y] of spots) if (!used.some(u => Math.hypot(u[0] - x, u[1] - y) < 12)) { used.push([x, y]); return [x, y]; } return null; };
  for (let k = 0; k < 4; k++) {   // vlčí smečky po 2–3
    const h = take(); if (!h) break;
    const n = 2 + (hash(h[0], h[1], 7) > 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) S.wild.push({ id: S.nid++, t: 'vlk', x: h[0] + 0.5 + i * 0.6, y: h[1] + 0.5 + (i % 2) * 0.5, hx: h[0], hy: h[1], st: 'idle', t0: Math.random() * 4, dir: 1 });
  }
  for (let k = 0; k < 3; k++) {   // medvědi samotáři
    const h = take(); if (!h) break;
    S.wild.push({ id: S.nid++, t: 'medved', x: h[0] + 0.5, y: h[1] + 0.5, hx: h[0], hy: h[1], st: 'idle', t0: Math.random() * 4, dir: 1 });
  }
}
const towerSight = l => l.guard * 2;   // strážný vidí daleko – odkryje okolí
function towerReveal() { for (const b of S.blds) { const l = lvOf(b); if (l.guard && b.seen !== b.lvl) { b.seen = b.lvl; reveal(b.x, b.y, towerSight(l)); } } }
const guardR = l => l.guard * (isNight() ? 1.5 : 1);   // v noci rozsvítí pochodně a hlídají dál
const WHP = { vlk: 40, medved: 120 }, WBITE = { vlk: 3, medved: 9 };
// bezpečno: u strážní věže, u hlavní budovy, v noci u osvětlených staveb (v pravěku u ohně)
function safeAt(x, y) {
  for (const b of S.blds) {
    const d = Math.hypot(b.x + 0.5 - x, b.y + 0.5 - y), l = lvOf(b);
    if (l.guard && d < guardR(l)) return true;
    if (b.type === 'jeskyne' && d < 5) return true;
    if (isNight() && ((S.age >= 1 && d < 2.5) || (b.type === 'ohniste' && S.fire.lit && d < 5))) return true;
  }
  return false;
}
function wildHit(w, dmg, by) {
  if (w.st === 'dead') return;
  w.hp = (w.hp ?? WHP[w.t]) - dmg; w.hurtT = 0.4;
  if (w.hp > 0) { if (w.st === 'sleep' || w.st === 'idle' || w.st === 'walk') { w.st = 'back'; } return; }
  w.st = 'dead'; w.t0 = 0;
  const loot = w.t === 'vlk' ? { kozesiny: 2, maso: 3 } : { kozesiny: 4, maso: 15 };
  for (const r in loot) addRes(r, loot[r]);
  S.stats.beasts = (S.stats.beasts || 0) + 1;
  log((w.t === 'vlk' ? 'Vlk' : 'Medvěd') + ' padl' + (by ? ' – ' + by : '') + '. Získáno ' + costPlain(loot) + '.');
}
function personHurt(p, dmg, w) {
  p.hp = (p.hp ?? 100) - dmg; if (p.job !== 'lov' || p.hp < 30) p.flee = 10;   // lovec se brání, dokud není vážně zraněný
  if (p.hp > 0) return;
  S.people.splice(S.people.indexOf(p), 1); selP.delete(p.id);
  log((w.t === 'vlk' ? 'Vlci roztrhali' : 'Medvěd zabil') + ' jednoho z osadníků! Postavte strážní věž a pošlete lovce.');
  if (!S.people.length) showModal('over');
}
function spawnWild(t) {
  for (let k = 0; k < 40; k++) {
    const x = 3 + Math.floor(Math.random() * (N - 6)), y = 3 + Math.floor(Math.random() * (N - 6));
    if (!wildOk(x, y) || occ.has(x + y * N) || Math.hypot(x - CX, y - CY) < 18 || nearTown(x, y, 14)) continue;
    S.wild.push({ id: S.nid++, t, x: x + 0.5, y: y + 0.5, hx: x, hy: y, st: 'idle', t0: 3, dir: 1 }); return true;
  }
  return false;
}
function updWild(dt) {
  if (!S.wild) return;
  const night = isNight();
  // od průmyslové doby zvěř z okolí města mizí, dřív se smečky pomalu obnovují
  S.wildT = (S.wildT || 0) + dt;
  if (S.age >= 3) {
    if (S.wildT > 60 && S.wild.length) { S.wildT = 0; const i = S.wild.findIndex(w => w.st !== 'chase' && w.st !== 'attack'); if (i >= 0) { S.wild.splice(i, 1); if (!S.wildGone) { S.wildGone = 1; log('Divoká zvěř ustupuje před rostoucím městem.'); } } }
  } else if (S.wildT > 300) {
    S.wildT = 0;
    if (S.wild.filter(w => w.st !== 'dead').length < 12) spawnWild(S.age >= 2 || Math.random() < 0.7 ? 'vlk' : 'medved');
  }
  if (S.attackAt && S.time - S.attackAt.t > 40) S.attackAt = null;
  // strážní věže střílejí
  for (const b of S.blds) {
    const l = lvOf(b); if (!l.guard) continue;
    for (const w of S.wild) if (w.st !== 'dead' && Math.hypot(w.x - b.x - 0.5, w.y - b.y - 0.5) < guardR(l)) wildHit(w, l.dmg * dt, 'strážní věž');
  }
  for (let wi = S.wild.length - 1; wi >= 0; wi--) {
    const w = S.wild[wi], def = WILD[w.t];
    if (w.hurtT) w.hurtT = Math.max(0, w.hurtT - dt);
    if (w.st === 'dead') { w.t0 += dt; if (w.t0 > 6) S.wild.splice(wi, 1); continue; }
    if (w.cd) w.cd = Math.max(0, w.cd - dt);
    // honička a útok
    if (w.st === 'chase' || w.st === 'attack') {
      const p = S.people.find(q => q.id === w.pid);
      w.t0 += dt;
      if (!p || w.t0 > (w.t === 'vlk' ? 9 : 6) || Math.hypot(w.x - w.hx, w.y - w.hy) > 14 || safeAt(p.x, p.y)) { w.st = 'back'; w.cd = 45; continue; }
      const dx = p.x - w.x, dy = p.y - w.y, d = Math.hypot(dx, dy);
      w.dir = faceDir(dx, dy); w.msx = dx - dy; w.msy = dx + dy;
      if (d > 0.45) {
        w.st = 'chase';
        const st = Math.min(d, def.sp * 2 * dt), nx = w.x + dx / d * st, ny = w.y + dy / d * st;
        if (wildOk(nx, ny)) { w.x = nx; w.y = ny; w.wd = (w.wd || 0) + st; } else { w.st = 'back'; w.cd = 20; }
      } else {
        w.st = 'attack'; w.at = (w.at || 0) + dt;
        personHurt(p, WBITE[w.t] * dt, w);
        wildHit(w, 2 * dt);   // napadený se brání holýma rukama
        if (!S.attackAt || S.time - S.attackAt.t > 20) {
          S.attackAt = { x: w.x, y: w.y, t: S.time };
          log((w.t === 'vlk' ? 'Vlci napadli' : 'Medvěd napadl') + ' osadníka! Napadený utíká domů.');
        }
      }
      continue;
    }
    if (w.st === 'back') {
      const dx = w.hx + 0.5 - w.x, dy = w.hy + 0.5 - w.y, d = Math.hypot(dx, dy);
      if (d < 0.3) { w.st = 'idle'; w.t0 = 3; continue; }
      const st = Math.min(d, def.sp * 1.4 * dt), nx = w.x + dx / d * st, ny = w.y + dy / d * st;
      if (wildOk(nx, ny)) { w.x = nx; w.y = ny; } else { w.x = w.hx + 0.5; w.y = w.hy + 0.5; }
      w.wd = (w.wd || 0) + st; w.dir = faceDir(dx, dy); w.msx = dx - dy; w.msy = dx + dy;
      continue;
    }
    // hledá kořist: vlci hlavně v noci, medvěd když ho někdo vyruší u doupěte
    if (!w.cd) {
      const k = S.age >= 2 ? 0.7 : 1;
      const R = (w.t === 'vlk' ? (night ? 5 : 2.5) : 3) * k * (w.st === 'sleep' ? 0.5 : 1);
      let prey = null, pd = R;
      for (const q of S.people) { const d = Math.hypot(q.x - w.x, q.y - w.y); if (d < pd && !safeAt(q.x, q.y)) { pd = d; prey = q; } }
      if (prey) {
        const pack = w.t === 'vlk' ? S.wild.filter(o => o.t === 'vlk' && o.st !== 'dead' && !o.cd && Math.hypot(o.x - w.x, o.y - w.y) < 6) : [w];
        for (const o of pack) { o.st = 'chase'; o.pid = prey.id; o.t0 = 0; }
        continue;
      }
    }
    // medvěd v noci spí, vlci spí přes poledne a v noci jsou čilí
    const ph = (S.time % DAY) / DAY, sleepy = w.t === 'medved' ? night : (ph > 0.25 && ph < 0.45);
    if (sleepy && w.st !== 'sleep' && w.st !== 'walk') { w.st = 'sleep'; w.t0 = 0; }
    if (w.st === 'sleep') { w.t0 += dt; if (!sleepy) { w.st = 'idle'; w.t0 = 1 + Math.random() * 2; } continue; }
    if (w.st === 'idle') {
      w.t0 -= dt;
      if (w.t0 <= 0) {   // nový cíl kolem doupěte, ale ne k osadě
        for (let k = 0; k < 8; k++) {
          const tx = w.hx + 0.5 + (Math.random() * 2 - 1) * def.range, ty = w.hy + 0.5 + (Math.random() * 2 - 1) * def.range;
          if (wildOk(tx, ty) && !nearTown(tx, ty, 9)) { w.tx = tx; w.ty = ty; w.st = 'walk'; break; }
        }
        if (w.st !== 'walk') w.t0 = 2;
      }
      continue;
    }
    if (w.st === 'walk') {
      const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
      if (d < 0.1) { w.st = 'idle'; w.t0 = 2 + Math.random() * 5; continue; }
      const st = Math.min(d, def.sp * dt), nx = w.x + dx / d * st, ny = w.y + dy / d * st;
      if (!wildOk(nx, ny)) { w.st = 'idle'; w.t0 = 1; continue; }
      w.x = nx; w.y = ny; w.wd = (w.wd || 0) + st; w.dir = faceDir(dx, dy); w.msx = dx - dy; w.msy = dx + dy;
    }
  }
}
function drawWild(w, T) {
  const [x, y] = iso(w.x, w.y), def = WILD[w.t];
  shadow(x, y, w.t === 'vlk' ? 9 : 12);
  let ok;
  if (w.st === 'dead') {
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, (6 - w.t0) / 2));
    ok = animFrame(w.t === 'medved' ? 'medved_smrt' : 'vlk_spani', w.t === 'medved' ? Math.min(7, Math.floor(w.t0 * 4)) : 7, x, y + 4, def.h, w.dir < 0);
    ctx.restore(); return;
  }
  if (w.st === 'attack') ok = animFrame(w.t + '_utok', Math.floor(T * 10 + w.id), x, y + 4, def.h, w.dir < 0);
  else if (w.hurtT && w.t === 'medved') ok = animFrame('medved_zraneni', Math.floor((0.4 - w.hurtT) * 20), x, y + 4, def.h, w.dir < 0);
  else if ((w.st === 'chase' || w.st === 'back' || w.st === 'walk') && w.msy < 0 && Math.abs(w.msy) > 0.4 * Math.abs(w.msx) && IMG[w.t + '_nahoru'].ok)
    ok = animFrame(w.t + '_nahoru', Math.floor((w.wd || 0) * (w.st === 'walk' ? 6 : 8)), x, y + 4, w.t === 'vlk' ? 27 : 33, w.msx < 0);
  else if (w.st === 'chase' || w.st === 'back') ok = animFrame(w.t === 'medved' ? 'medved_beh' : 'vlk_chuze', Math.floor((w.wd || 0) * 6), x, y + 4, def.h, w.dir < 0);
  else if (w.st === 'sleep') ok = animFrame(w.t + '_spani', Math.min(7, Math.floor(w.t0 * 3)), x, y + 4, def.h, w.dir < 0);
  else if (w.st === 'walk') ok = animFrame(w.t + '_chuze', Math.floor((w.wd || 0) * (w.t === 'vlk' ? 7 : 6)), x, y + 4, def.h, w.dir < 0);
  else ok = animFrame(w.t + '_chuze', 0, x, y + 4, def.h, w.dir < 0);
  if (!ok) ell(x, y - 6, w.t === 'vlk' ? 8 : 11, 5, w.t === 'vlk' ? '#6a6a66' : '#6a4a2a');
  if (w.hp !== undefined && w.hp < WHP[w.t]) { const k = Math.max(0, w.hp / WHP[w.t]); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 10, y - def.h + 2, 20, 3.5); ctx.fillStyle = '#e04030'; ctx.fillRect(x - 9.5, y - def.h + 2.5, 19 * k, 2.5); }
}

/* ---------- simulace ---------- */
function update(dt) {
  S.time += dt;
  const night = isNight();
  S.cold = night && !S.fire.lit;

  // oheň (od starověku hřeje hlavní budova a domácnosti – topení se platí dřevem/uhlím)
  if (S.age >= 1) {
    S.fire.lit = true;
    const k = S.blds.reduce((a, b) => a + (lvOf(b).know || 0), 0);
    S.res.vedeni += dt * S.people.length * 0.008 * (1 + k);
  } else if (has('ohniste')) {
    S.fire.t += dt;
    if (S.fire.t >= 15) {
      S.fire.t = 0;
      if (S.res.klacky >= 1) { S.res.klacky--; if (!S.fire.lit) log('Oheň zase hoří.'); S.fire.lit = true; }
      else { if (S.fire.lit) log('Oheň vyhasl! Chybějí klacky.'); S.fire.lit = false; }
    }
    if (S.fire.lit) {
      const k = S.blds.reduce((a, b) => a + (lvOf(b).know || 0), 0);
      S.res.vedeni += dt * S.people.length * 0.008 * (1 + k);
    }
  }

  // jídlo
  // zboží, které lidé spotřebovávají (od starověku); když chybí, osada neroste
  S.needT = (S.needT || 0) + dt;
  if (S.needT >= 10) {
    S.needT = 0; S.needAcc = S.needAcc || {}; const miss = [];
    for (const nd of NEEDS) {
      if (!needOn(nd)) continue;
      S.needAcc[nd.r] = (S.needAcc[nd.r] || 0) + S.people.length * nd.per / 6;
      while (S.needAcc[nd.r] >= 1) { if (S.res[nd.r] >= 1) { S.res[nd.r]--; S.needAcc[nd.r]--; } else { S.needAcc[nd.r] = 0; } }
      if (S.res[nd.r] < 1) miss.push(nd.r);
    }
    if (S.age >= 1) {   // pestrá strava
      // chybí jen tehdy, když lidé za poslední chvíli dostali méně než polovinu své porce (ne když se chléb hned sní)
      const d = S.diet || [[1, 0], [1, 0]], low = k => d[k][1] > d[k][0];
      if (low(0)) miss.push('maso');
      if (low(1)) miss.push(has('pekarna') ? 'chleb' : 'obili');
      S.dietShare = d.map(x => x[0] + x[1] ? x[0] / (x[0] + x[1]) : 1); S.diet = [[0, 0], [0, 0]];
    }
    if (miss.length && S.time - (S.fullT.needs || -99) > 60) { S.fullT.needs = S.time; log('Lidem chybí ' + miss.map(missName).join(', ') + '. Dokud to nebude, osada neporoste.'); }
    S.missing = miss;
  }
  S.debt += S.people.length * dt / 30 * (1 + 0.35 * Math.min(S.age, 5));   // v pozdějších věcích lidé jedí víc
  if (S.age >= 1) {   // a topí dřevem
    S.heat = (S.heat || 0) + S.people.length * dt / 400 * Math.min(S.age, 3);
    while (S.heat >= 1) { S.heat--; if (S.res.klacky >= 1) S.res.klacky--; else if (S.age >= 3 && S.res.uhli > (S.keep.uhli || 0)) S.res.uhli--; }   // topí se dřevem, uhlím jen když dřevo dojde (zásobu uhlí nechá)
  }
  // lidé jedí střídavě z každé skupiny jídla (od starověku maso/ryby a obilí/chléb), v rámci skupiny to, čeho je nejvíc
  const groups = foodGroups(), nut = { chleb: 2.5, maso: S.age || S.fire.lit ? 1.5 : 1, ryby: S.age || S.fire.lit ? 1.5 : 1, obili: 1, bobule: 1 };
  while (S.debt >= 1) {
    let best = null; const want = (S.dietTurn || 0) % groups.length;
    for (let gi = 0; gi < groups.length && !best; gi++) {
      const g = groups[(want + gi) % groups.length];
      for (const r of g) if (S.res[r] >= 1 && (!best || S.res[r] > S.res[best])) best = r;
    }
    if (groups.length > 1) { S.diet = S.diet || [[0, 0], [0, 0]]; S.diet[want][best && groups[want].includes(best) ? 0 : 1]++; }   // [snědeno, nahrazeno]
    if (!best && S.res.obili >= 1) best = 'obili';   // v nouzi sáhnou i na obilí pro mlýn
    if (!best) { S.debt = 1; break; }
    S.dietTurn = ((S.dietTurn || 0) + 1) % groups.length;
    S.res[best]--; S.debt -= nut[best];
  }
  // zdraví: hlad a zima ubírají, v teple a sytosti se lidé uzdravují
  const hungry = S.debt >= 1;
  if (hungry && !S.starve) log('Lidé hladoví a slábnou! Sežeňte jídlo.');
  S.starve = hungry ? (S.starve || 0) + dt : 0;
  S.hpT = (S.hpT || 0) + dt;
  if (S.hpT >= 1) {
    const k = S.hpT; S.hpT = 0;
    const loss = (hungry ? 0.8 : 0) + (S.cold ? 0.4 : 0);
    let died = 0;
    for (const p of S.people.slice()) {
      if (p.hp === undefined) p.hp = 100;
      const tough = 0.7 + hash(p.id, 3, 11) * 0.6;   // každý vydrží jinak dlouho
      p.hp = Math.max(0, Math.min(100, p.hp + (loss ? -loss * k / tough : 0.5 * k)));
      if (p.hp <= 0) { S.people.splice(S.people.indexOf(p), 1); selP.delete(p.id); died++; }
    }
    if (died) log(died === 1 ? 'Jeden člověk zemřel – ' + (hungry ? 'hlad' : 'zima') + '.' : died + ' lidí zemřelo – ' + (hungry ? 'hlad' : 'zima') + '.');
    if (!S.people.length) { showModal('over'); return; }
    // od středověku lidé, kterým dlouho chybí zboží, osadu opouštějí
    S.unhappy = (S.missing && S.missing.length && S.age >= 2) ? (S.unhappy || 0) + k : 0;
    if (S.unhappy >= 90) {
      S.unhappy = 60;
      const n = Math.max(1, Math.floor(S.people.length / 30));
      for (let i = 0; i < n && S.people.length > 5; i++) { const q = S.people.pop(); selP.delete(q.id); }
      log((n > 1 ? n + ' lidí se odstěhovalo' : 'Jedna rodina se odstěhovala') + ' – chybí jim ' + S.missing.map(missName).join(', ') + '.');
    }
  }

  // růst kmene
  // každých 30 s přijdou noví lidé (větší osada přitahuje víc lidí); důvod, proč neroste, je vidět v liště
  const foodVal = S.res.bobule + S.res.obili + (S.res.maso + S.res.ryby) * 2 + S.res.chleb * 3;
  S.growWhy = S.people.length >= popCap() ? 'Není kde bydlet – postavte domy.'
    : !S.fire.lit ? 'Je zima – rozdělejte oheň.'
    : (S.missing && S.missing.length) ? 'Lidem chybí: ' + S.missing.map(missName).join(', ') + '.' + missWhy(S.missing[0])
    : foodVal < S.people.length ? 'Málo jídla v zásobě (potřeba aspoň ' + S.people.length + ').' : '';
  S.grow += dt;
  if (S.grow >= 30) {
    S.grow = 0;
    if (!S.growWhy) {
      const n = Math.min(popCap() - S.people.length, 1 + Math.floor(S.people.length / 20));
      for (let i = 0; i < n; i++) addPerson();
      log(n > 1 ? 'Do osady přišlo ' + n + ' nových lidí.' : 'Ke kmeni se přidal nový člověk.');
    }
  }

  // místa v chatách
  for (const j in JOBS) {
    const haveP = S.people.filter(p => p.job === j), mx = (JOBS[j].until !== undefined && S.age >= JOBS[j].until) ? 0 : jobMax(j), sl = jobSlots(j);
    while (haveP.length > mx) setJob(haveP.pop(), null);
    haveP.forEach((p, i) => p.pro = i < sl);
  }

  S.people.forEach(p => updPerson(p, dt));

  updPower(dt);
  // dílny a továrny: vstupní suroviny → výrobek
  S.blds.forEach(b => {
    const l = lvOf(b); if (!l.wk) return;
    const inp = wkIn(l), keys = Object.keys(inp), ind = !!l.ind;
    const job = Object.keys(l.js)[0], w = S.people.filter(p => p.job === job && p.bid === b.id && p.atWork).length;
    if (ind) { b.buf = b.buf || {}; b.outItems = b.outItems || []; }
    const ob = ind ? outBeltOf(b) : null;
    if (ind) flushOut(b, ob);
    if (b.paused) { b.lack = 'Výroba je zastavená.'; return; }
    if (!w) { b.lack = ''; return; }
    if (ind && b.outItems.length >= 6) { b.lack = 'Pás je plný – výrobky se nemají kam odvézt.'; return; }
    // co přijelo pásem, vezme se ze zásobníku továrny; zbytek ze skladu
    const fromBuf = {}, fromGlob = {};
    keys.forEach(r => { const u = ind ? Math.min(b.buf[r] || 0, inp[r]) : 0; if (u) fromBuf[r] = u; if (inp[r] - u) fromGlob[r] = inp[r] - u; });
    const nBuf = Object.keys(fromBuf).length, local = nBuf > 0;
    b.fed = nBuf === 0 ? 0 : (Object.keys(fromGlob).length ? 1 : 2);
    if (ind && droneFed(b)) b.fed = 2;   // drony dovážejí suroviny ze skladu
    if (ind) S._pu = (S._pu || 0) + 1;
    const st = ind ? stationFor(b) : null; b.rail = !!st;
    b.t = (b.t || 0) + dt * w * [1, 1.5, 2][b.fed] * (ind && S.powerOk ? 1.5 : 1) * (ind && S.research.done.pasy ? 1.25 : 1) * (st ? 1.5 : 1) * (NEED_POWER[b.type] && !S.powerOk ? 0.2 : 1) * (1 + 0.1 * (S.perk || 0));
    b.noPower = NEED_POWER[b.type] && !S.powerOk;
    if (b.t >= l.wk.t) {
      const o0 = Object.keys(l.wk.out)[0];
      let node = null;
      if (l.mine) { node = mineNode(b, l.mine); if (!node) { b.t = l.wk.t; b.lack = 'Ložisko je vyčerpané – postavte důl jinde.'; return; } }
      if (!ob && S.res[o0] >= storeCap()) { b.t = l.wk.t; b.lack = 'Sklad je plný.'; return; }
      if (stockOf(b) >= 20) { b.t = l.wk.t; b.lack = 'U stavby je hromada výrobků – lidé je nestíhají odnášet. Postavte sklad blíž.'; return; }
      if (b.limit && S.res[o0] >= b.limit) { b.t = l.wk.t; b.lack = 'Vyrobeno dost – ve skladu je ' + Math.floor(S.res[o0]) + ' (limit ' + b.limit + ').'; return; }
      const gk = Object.keys(fromGlob);
      const held = gk.filter(r => Math.floor(S.res[r]) - fromGlob[r] < (S.keep[r] || 0));
      if (!canPay(fromGlob)) { b.t = l.wk.t; b.lack = 'Chybí suroviny: ' + gk.filter(r => S.res[r] < fromGlob[r]).map(r => RES[r][1].toLowerCase()).join(', ') + '.'; return; }
      if (held.length) { b.t = l.wk.t; b.lack = 'Šetří zásobu: ' + held.map(r => RES[r][1].toLowerCase() + ' (' + S.keep[r] + ')').join(', ') + '.'; return; }
      pay(fromGlob); for (const r in fromBuf) b.buf[r] -= fromBuf[r];
      b.t = 0; b.lack = '';
      for (const r in l.wk.out) {
        const n = l.wk.out[r];
        S.stats.made[r] = (S.stats.made[r] || 0) + n;
        if (node && node.t !== 'ropa') { node.amt -= n; }   // ropná ložiska jsou hluboká – nedojdou
        if (ob) for (let i = 0; i < n; i++) b.outItems.push(r);
        else if (st) { st.buf = st.buf || {}; st.buf[r] = (st.buf[r] || 0) + n; }   // výrobky odveze vlak
        else if (droneFed(b)) addRes(r, n);   // drony odnášejí samy
        else { b.stock = b.stock || {}; b.stock[r] = (b.stock[r] || 0) + n; }   // čeká u stavby, lidé to odnesou
      }
      if (b.type === 'ryby' && S.age <= 1 && Math.random() < 0.15) {   // na břehu se občas najde mušle
        b.stock = b.stock || {}; b.stock.musle = (b.stock.musle || 0) + 1;
        if (!S.stats.shellFound) { S.stats.shellFound = 1; log('Rybáři našli na břehu mušli! Občas nějakou přinesou.'); }
      }
      if (node && node.amt < 1) removeNode(node);
      if (o0 === 'nastroje') S.stats.tools++;
    }
  });
  updBelts(dt);

  // dorůstání
  S.regT = (S.regT || 0) + dt;
  if (S.regT >= 1) {
    S.regT -= 1;
    S.oreT = (S.oreT || 0) + 1;
    if (S.oreT >= 60) { S.oreT = 0; ensureOres(false); }
    // divoká zvěř se vrací: nová stáda přicházejí na volnou trávu dál od osady
    S.zverT = (S.zverT || 0) + 1;
    if (S.zverT >= 50) {
      S.zverT = 0;
      if (S.nodes.filter(n => n.t === 'zver').length < S.zverMax) {
        for (let k = 0; k < 40; k++) {
          const x = 2 + Math.floor(Math.random() * (N - 4)), y = 2 + Math.floor(Math.random() * (N - 4)), i = x + y * N;
          if (terr[i] !== T_GRASS || occ.has(i) || comp[i] !== comp[CX + CY * N]) continue;
          if (S.blds.some(b => Math.hypot(b.x - x, b.y - y) < 7) || (S.site && Math.hypot(S.site.x - x, S.site.y - y) < 7)) continue;
          const n = { id: S.nid++, t: 'zver', x, y, amt: 6, rg: 0 };
          S.nodes.push(n); occ.set(i, n); nodeMap.set(n.id, n);
          break;
        }
      }
    }
    for (const n of S.nodes) {
      if (n.young) { if (++n.rg >= 15) { n.rg = 0; if (++n.amt >= NODE.strom.max) n.young = false; } continue; }   // stromek roste asi 4,5 minuty, teprve dospělý jde pokácet
      const d = NODE[n.t];
      if (d.regrow && n.amt < d.max) { n.rg++; if (n.rg >= d.regrow) { n.rg = 0; n.amt++; } }
    }
    S.people.forEach(p => reveal(p.x, p.y, 5));
  }

  // stavba
  if (S.site && S.site.prog >= S.site.time) finishSite();

  // výzkum
  const rc = S.research.cur;
  if (rc) {
    rc.t += dt;
    if (rc.t >= TECH[rc.id].time) {
      S.research.done[rc.id] = true; S.research.cur = null;
      log('Objeveno: ' + TECH[rc.id].name + '!');
      if (TECH[rc.id].age) ageUp(TECH[rc.id].age);
      else if (modalKind === 'research') showModal('research');
    }
  }

  updTrader(dt);
  updExped(dt);
  updTrains(dt);
  updFlight(dt);
  updWild(dt);
  towerReveal();

  // příběh
  while (OBJ[S.obj].c()) { S.obj++; log('Splněno! Nový úkol.'); }
}

// co lidé spotřebovávají za minutu na osobu
// zboží se začne vyžadovat, až jde vyrábět (po příslušném výzkumu)
const NEEDS = [{ age: 1, r: 'keramika', per: 0.1, tech: 'hrncirstvi' }, { age: 2, r: 'prkna', per: 0.08, tech: 'tesarstvi' }, { age: 3, r: 'stroje', per: 0.02, tech: 'stroje' }, { age: 4, r: 'plasty', per: 0.05, tech: 'ropa' }, { age: 4, r: 'elektronika', per: 0.03, tech: 'elektronika' }, { age: 5, r: 'kompozity', per: 0.03, tech: 'nano' }];
const needOn = nd => S.age >= nd.age && S.research.done[nd.tech];
const missName = r => S.age >= 1 && r === 'maso' ? 'maso nebo ryby' : S.age >= 1 && r === 'obili' ? 'obilí nebo chléb' : RES[r][1].toLowerCase();
// s pekárnou jedí lidé chléb a obilí zůstane pro mlýn
const foodGroups = () => S.age >= 1 ? [['maso', 'ryby'], has('pekarna') ? ['chleb', 'bobule'] : ['chleb', 'obili', 'bobule']] : [['chleb', 'maso', 'ryby', 'obili', 'bobule']];
// moderní továrny bez dostatku proudu skoro stojí
const NEED_POWER = { rafinerie: 1, elektro: 1, nanotovarna: 1, robotovarna: 1, ropny_vrt: 1, vfarma: 1 };
// proč se chybějící zboží nevyrábí (první dílna, která ho dělá a stojí)
function missWhy(r) {
  const bs = S.blds.filter(b => { const l = lvOf(b); return l.wk && l.wk.out[r]; });
  if (!bs.length) return ' Nemáte stavbu, která ho vyrábí.';
  const st = bs.find(b => b.lack); if (st) return ' ' + bname(st) + ': ' + st.lack;
  const w = bs.reduce((a, b) => a + S.people.filter(p => p.bid === b.id).length, 0);
  return w ? ' Vyrábí se, ale nestačí – přidejte dílny.' : ' V dílnách nikdo nepracuje.';
}
const AGE_TECH = { 1: 'usedly', 2: 'pismo', 3: 'hrad', 4: 'radnice', 5: 'mrakodrap' };
// ve středověku už se pazourek nesbírá: naleziště se změní na kámen
function flintToStone() {
  // keře s bobulemi patří jen do pravěku – s příchodem starověku zmizí
  if (!S.bushGone) {
    S.bushGone = true;
    S.nodes.filter(n => n.t === 'ker').forEach(removeNode);
    S.people.forEach(p => { if (p.job === 'bobule') setJob(p, null); });
    log('Ze sběračů klacků jsou dřevorubci – pracovat můžou jen s místem v dřevorubecké chatě.');
  }
  if (!S.fireGone) {   // ohniště už není potřeba
    S.fireGone = true;
    S.blds.filter(b => b.type === 'ohniste').forEach(b => { S.blds.splice(S.blds.indexOf(b), 1); occ.delete(b.x + b.y * N); if (selId === b.id) selId = null; });
  }
  if (S.flintConv) return; S.flintConv = true;
  S.nodes.forEach(n => { if (n.t === 'pazourek') { n.t = 'kamen'; n.amt = Math.min(NODE.kamen.max, Math.round(n.amt * 1.5)); } });
  S.people.forEach(p => { if (p.job === 'pazourek') setJob(p, 'kamen'); });
}
function ageUp(a) {
  if (S.age >= a && S.research.done[AGE_TECH[a]]) return;
  S.age = Math.max(S.age, a); S.research.done[AGE_TECH[a]] = true;
  const cave = S.blds.find(b => b.type === 'jeskyne'); if (cave) cave.lvl = Math.max(cave.lvl, a + 1);
  if (a === 1) S.won = true;
  if (a >= 1) flintToStone();
  genAgeOres(false);
  showModal(['', 'win', 'win2', 'win3', 'win4', 'win5'][a]);
}
// proč zatím nejde stupeň stavby postavit ('' = jde)
function upgWhy(nx) {
  const need = (nx.reqs || (nx.req ? [nx.req] : [])).filter(r => !S.research.done[r]);
  if (need.length) return 'Nejdřív vyzkoumejte: ' + need.map(r => TECH[r].name).join(', ') + '.';
  if (nx.needPop && S.people.length < nx.needPop) return 'Potřebujete aspoň ' + nx.needPop + ' obyvatel (máte ' + S.people.length + ').';
  return '';
}
/* ---------- dopravní pásy ---------- */
const BDIR = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const STORE_T = { jeskyne: 1, jama: 1, sypka: 1, sklad: 1 };
function mineNode(b, type) {
  let best = null;
  for (const n of S.nodes) if (n.t === type && n.amt >= 1 && Math.abs(n.x - b.x) <= 1 && Math.abs(n.y - b.y) <= 1) { if (!best || n.amt > best.amt) best = n; }
  return best;
}
// pás, který vede od stavby pryč (výstup)
function outBeltOf(b) {
  for (const [dx, dy] of BDIR) {
    const bl = beltMap.get(b.x + dx + (b.y + dy) * N);
    if (bl && !(b.x + dx + BDIR[bl.d][0] === b.x && b.y + dy + BDIR[bl.d][1] === b.y)) return bl;
  }
  return null;
}
function flushOut(b, ob) {
  if (!b.outItems || !b.outItems.length) return;
  if (!ob) { b.outItems.forEach(r => addRes(r, 1)); b.outItems = []; return; }
  const last = ob.q[ob.q.length - 1];
  if (!last || last.p >= 0.3) ob.q.push({ r: b.outItems.shift(), p: 0 });
}
// pás předá zboží stavbě: sklad ho uloží, továrna si ho vezme do zásobníku
// elektrárny: spalují uhlí (z pásu nebo ze skladu) a dávají proud továrnám
function updPower(dt) {
  S.powerUse = S._pu || 0; S._pu = 0; S.powerCap = 0;
  for (const b of S.blds) {
    const l = lvOf(b); if (!l.power) continue;
    b.buf = b.buf || {};
    if (l.fusion) { b.on = true; b.lack = ''; S.powerCap += l.power; continue; }   // fúze jede sama
    const w = S.people.filter(p => p.job === 'energetici' && p.bid === b.id && p.atWork).length;
    if (!w) { b.on = false; b.lack = 'Nikdo tu nepracuje.'; continue; }
    b.bt = (b.bt || 0) + dt;
    if (b.bt >= 6 || b.on === undefined || !b.on) {
      if ((b.buf.uhli || 0) >= 1) { b.buf.uhli--; b.on = true; b.bt = 0; b.lack = ''; }
      else if (S.res.uhli >= 1) { S.res.uhli--; b.on = true; b.bt = 0; b.lack = ''; }
      else { b.on = false; b.lack = 'Chybí uhlí.'; }
    }
    if (b.on) S.powerCap += l.power;
  }
  S.powerOk = S.powerCap >= S.powerUse && S.powerCap > 0;
  S.powerShort = S.powerUse > S.powerCap;
}
function droneFed(b) {
  return S.research.done.drony && S.blds.some(d => lvOf(d).drone && Math.hypot(d.x - b.x, d.y - b.y) <= lvOf(d).drone);
}
// drony létají mezi hangárem a továrnami v dosahu
function drawDrones(T) {
  for (const d of S.blds) {
    const l = lvOf(d); if (!l.drone) continue;
    const tg = S.blds.filter(b => lvOf(b).ind && Math.hypot(d.x - b.x, d.y - b.y) <= l.drone).slice(0, 8);
    const [hx, hy] = iso(d.x + 0.5, d.y + 0.5);
    tg.forEach((b, i) => {
      const [bx, by] = iso(b.x + 0.5, b.y + 0.5), k = (Math.sin(T * 0.5 + i * 1.7) + 1) / 2;
      const x = hx + (bx - hx) * k, y = hy + (by - hy) * k, alt = 34 + Math.sin(T * 3 + i) * 3;
      ell(x, y, 5, 2, 'rgba(0,0,0,.18)');
      ctx.fillStyle = '#2a2e36'; ctx.fillRect(x - 3, y - alt - 1.5, 6, 3);
      for (const [ox, oy] of [[-5, -2], [5, -2], [-5, 2], [5, 2]]) ell(x + ox, y - alt + oy * 0.6, 3, 0.9, 'rgba(180,190,200,.8)');
      ell(x, y - alt + 2, 1.2, 1.2, `rgba(${i % 2 ? '255,60,60' : '60,255,120'},${0.5 + 0.5 * Math.sin(T * 8 + i)})`);
      if (k > 0.1 && k < 0.9) ell(x, y - alt + 4, 2, 1.6, RCOL[Object.keys(wkIn(lvOf(b)))[0]] || '#ccc');
    });
  }
}
// nádraží s vlakem v dosahu 8 políček
function stationFor(b) {
  if (!S.trains.length) return null;
  let best = null, bd = 9;
  for (const st of S.blds) {
    if (st.type !== 'nadrazi' || !S.trains.some(t => t.at === st.id || t.to === st.id)) continue;
    const d = Math.hypot(st.x - b.x, st.y - b.y); if (d <= 8 && d < bd) { bd = d; best = st; }
  }
  return best;
}
function deliver(b, r) {
  if (b.type === 'nadrazi') { b.buf = b.buf || {}; let tot = 0; for (const k in b.buf) tot += b.buf[k]; if (tot >= 60) return false; b.buf[r] = (b.buf[r] || 0) + 1; S.stats.belted++; return true; }
  if (lvOf(b).burn && r === 'uhli') { b.buf = b.buf || {}; if ((b.buf.uhli || 0) >= 10) return false; b.buf.uhli = (b.buf.uhli || 0) + 1; S.stats.belted++; return true; }
  if (STORE_T[b.type]) { if (!UNCAPPED[r] && S.res[r] >= storeCap()) return false; addRes(r, 1); S.stats.belted++; return true; }
  const l = lvOf(b);
  if (l.ind && l.wk && wkIn(l)[r]) { b.buf = b.buf || {}; if ((b.buf[r] || 0) >= 10) return false; b.buf[r] = (b.buf[r] || 0) + 1; S.stats.belted++; return true; }
  return false;
}
function updBelts(dt) {
  const v = 1.6;
  for (const bl of S.belts) {
    const q = bl.q;
    for (let i = 0; i < q.length; i++) q[i].p = Math.max(q[i].p, Math.min(i === 0 ? 1 : q[i - 1].p - 0.3, q[i].p + v * dt));
    if (q.length && q[0].p >= 1) {
      const nx = bl.k % N + BDIR[bl.d][0], ny = Math.floor(bl.k / N) + BDIR[bl.d][1], nk = nx + ny * N;
      const nb = beltMap.get(nk);
      if (nb) { const last = nb.q[nb.q.length - 1]; if (!last || last.p >= 0.3) nb.q.push({ r: q.shift().r, p: 0 }); }
      else { const o = occ.get(nk); if (o && o.type && BLD[o.type] && deliver(o, q[0].r)) q.shift(); }
    }
  }
}
function beltAt(k, d) {
  const x = k % N, y = Math.floor(k / N);
  let bl = beltMap.get(k);
  if (bl) { bl.d = d; return true; }
  if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1 || !rev[k] || terr[k] === T_WATER || occ.has(k) || railSet.has(k)) return false;
  if (!canPay(BELT_COST)) { if (!beltAt.warned) toast('Na pás chybí ' + costPlain(BELT_COST) + '.'); beltAt.warned = true; return false; }
  beltAt.warned = false; pay(BELT_COST);
  bl = { k, d, q: [] }; S.belts.push(bl); beltMap.set(k, bl); return true;
}
const BELT_COST = { prkna: 1, zelezo: 1 };
function removeBelt(k) {
  const bl = beltMap.get(k); if (!bl) return;
  S.belts.splice(S.belts.indexOf(bl), 1); beltMap.delete(k);
  for (const r in BELT_COST) addRes(r, BELT_COST[r]);
}
// tažení myší: pás jde po políčkách, směr podle pohybu
function beltDrag(sx, sy) {
  const [fx, fy] = screenToTile(sx, sy); let x = Math.floor(fx), y = Math.floor(fy);
  if (!bdrag) return;
  while (bdrag.x !== x || bdrag.y !== y) {
    const dx = x - bdrag.x, dy = y - bdrag.y;
    const st = Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
    const d = BDIR.findIndex(v => v[0] === st[0] && v[1] === st[1]);
    beltAt(bdrag.x + bdrag.y * N, d);
    bdrag.x += st[0]; bdrag.y += st[1]; bdrag.moved = true;
    if (!beltAt(bdrag.x + bdrag.y * N, d)) { bdrag.x = x; bdrag.y = y; break; }
  }
}
const RCOL = { klacky: '#8a5a2b', kamen: '#a09c92', pazourek: '#46525f', bobule: '#c2203f', maso: '#b0503c', ryby: '#9fc4d8', obili: '#d9b93a', hlina: '#8a4a2a',
  ruda: '#3f9a7a', zelruda: '#7a3a20', uhli: '#1e1e22', cihly: '#b0503a', ocel: '#8a9aaa', stroje: '#4a6a9a', zelezo: '#6a6a70', prkna: '#c8a060', keramika: '#c27a45', kozesiny: '#7a5a35' };
function drawBelts(T, vis) {
  for (const bl of S.belts) {
    const x = bl.k % N, y = Math.floor(bl.k / N); if (!vis(x, y)) continue;
    const [px, py] = iso(x, y), cxp = px, cyp = py + TH / 2, dv = BDIR[bl.d];
    ctx.beginPath(); ctx.moveTo(px, py + 3); ctx.lineTo(px + TW / 2 - 6, cyp); ctx.lineTo(px, py + TH - 3); ctx.lineTo(px - TW / 2 + 6, cyp); ctx.closePath();
    ctx.fillStyle = '#4a4744'; ctx.fill(); ctx.strokeStyle = '#26231f'; ctx.lineWidth = 1.5; ctx.stroke();
    const ux = (dv[0] - dv[1]) * TW / 2, uy = (dv[0] + dv[1]) * TH / 2, nx = -uy, ny = ux, nl = Math.hypot(nx, ny) || 1;
    ctx.strokeStyle = 'rgba(230,200,120,.55)'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const t = ((T * 1.6 + i / 3) % 1) - 0.5, ax = cxp + ux * t * 0.8, ay = cyp + uy * t * 0.8, w = 7;
      ctx.moveTo(ax - ux * 0.08 + nx / nl * w, ay - uy * 0.08 + ny / nl * w * 0.5); ctx.lineTo(ax, ay); ctx.lineTo(ax - ux * 0.08 - nx / nl * w, ay - uy * 0.08 - ny / nl * w * 0.5);
    }
    ctx.stroke();
    for (const it of bl.q) {
      const ix = cxp + ux * (it.p - 0.5), iy = cyp + uy * (it.p - 0.5) - 3;
      ell(ix, iy + 3, 4.5, 2, 'rgba(0,0,0,.35)'); ell(ix, iy, 4.2, 3.4, RCOL[it.r] || '#999');
      ctx.strokeStyle = '#1a1612'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(ix, iy, 4.2, 3.4, 0, 0, 7); ctx.stroke();
    }
  }
}
function beltIcon() {
  if (ICON.__belt) return ICON.__belt;
  const c = document.createElement('canvas'); c.width = c.height = 80; const g = c.getContext('2d');
  g.fillStyle = '#4a4744'; g.strokeStyle = '#26231f'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(8, 30); g.lineTo(52, 8); g.lineTo(72, 50); g.lineTo(28, 72); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#e6c878'; g.lineWidth = 4; g.beginPath();
  for (const t of [0, 1]) { const ox = t * 16, oy = t * -8; g.moveTo(26 + ox, 44 + oy); g.lineTo(40 + ox, 40 + oy); g.lineTo(34 + ox, 27 + oy); } g.stroke();
  [['#1e1e22', 30, 52], ['#b0503a', 50, 42]].forEach(([col, x, y]) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 7, 5, 0, 0, 7); g.fill(); });
  return (ICON.__belt = c.toDataURL());
}
function wkIn(l) {
  if (S.age >= 3 && l.wk.out.keramika && l.wk.in.klacky) { const o = Object.assign({}, l.wk.in); delete o.klacky; o.uhli = 1; return o; }
  if (!(S.age >= 1 && l.wk.in.pazourek)) return l.wk.in;
  const o = {}; for (const r in l.wk.in) { const k = r === 'pazourek' ? 'kamen' : r; o[k] = (o[k] || 0) + l.wk.in[r]; } return o;
}
function jobSlots(j) { return S.blds.reduce((a, b) => { const js = lvOf(b).js || {}; return a + (js[j] || 0) + (j === 'kamen' && S.age >= 1 ? js.pazourek || 0 : 0); }, 0); }
function jobMax(j) { return (j === 'stavba' || (JOBS[j].node && j !== 'lov' && !(j === 'klacky' && S.age >= 1))) ? 1e9 : jobSlots(j); }
const jobLocked = j => (JOBS[j].req && !S.research.done[JOBS[j].req]) || (JOBS[j].until !== undefined && S.age >= JOBS[j].until);
function toolSlots() { return jobSlots('nastroje'); }
function stopFull(p, r) {
  setJob(p, null);
  if (S.time - (S.fullT[r] || -99) > 45) { S.fullT[r] = S.time; log('Sklad je plný (' + RES[r][1].toLowerCase() + '). Lidé, kteří je nosili, přestali pracovat.'); }
}
function setJob(p, j) {
  if (j) p.hold = false;
  if (p.boat) { const b = bById(p.bid); if (b) { p.x = b.x + 0.5; p.y = b.y + 0.5; } p.boat = false; }
  p.path = null; p.gx = null; p.nopath = false; p.fishing = false;
  p.job = j; p.st = 'find'; p.carry = null; p.n = 0; p.bid = 0; p.atWork = false; p.tx = null; p.pro = false; }
function moveTo(p, tx, ty, sp, dt) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d < 0.12) return true;
  const st = Math.min(d, sp * dt);
  p.x += dx / d * st; p.y += dy / d * st; p.wd = ((p.wd || 0) + st) % 1000; p.mv = true; p.dir = faceDir(dx, dy); p.msx = dx - dy; p.msy = dx + dy;
  return false;
}
function nearestNode(p, type) {
  let best = null, bd = 1e9; const pc = compAt(p.x, p.y);
  for (const n of S.nodes) {
    if (n.t !== type || n.amt < 1 || n.young || (pc >= 0 && comp[n.x + n.y * N] !== pc)) continue;
    const d = Math.hypot(n.x - p.x, n.y - p.y);
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}
const stockOf = b => { let t = 0; for (const r in (b.stock || {})) t += b.stock[r]; return t; };
function storeNear(x, y) {
  let best = S.blds[0], bd = 1e9;
  for (const b of S.blds) { if (!STORE_T[b.type]) continue; const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } }
  return best;
}
function nearestStore(p) {
  let best = S.blds[0], bd = 1e9;
  for (const b of S.blds) {
    if (!STORE_T[b.type] && !(p.job in (lvOf(b).js || {}))) continue;
    const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function updPerson(p, dt) {
  p.mv = false;
  const tile = terr[Math.floor(p.x) + Math.floor(p.y) * N];
  const slow = (S.cold ? 0.55 : 1), sp = 1.2 * slow * (tile === T_WATER ? 0.55 : 1) * (roadSet.has(Math.floor(p.x) + Math.floor(p.y) * N) ? 1.6 : 1);
  if (p.flee > 0 || S.alarm) {   // napadený utíká domů, při poplachu se schovají všichni
    if (p.flee > 0) p.flee -= dt;
    const h = storeNear(p.x, p.y); p.fishing = false; if (p.boat) { p.boat = false; p.x = h.x + 0.5; p.y = h.y + 0.86; }
    goTo(p, h.x + 0.5 + ((p.id % 5) - 2) * 0.2, h.y + 0.9 + (p.id % 3) * 0.2, sp * (p.flee > 0 ? 1.6 : 1), dt);
    return;
  }
  if (p.job === 'lov' && S.wild) {   // lovci jdou na zvěř, která útočí nebo je blízko
    let a = null, ad = 1e9;
    for (const w of S.wild) { if (w.st === 'dead') continue; const d = Math.hypot(w.x - p.x, w.y - p.y), hostile = w.st === 'chase' || w.st === 'attack' || w.cd > 0; if ((hostile && d < 14) || d < 4) if (d < ad) { ad = d; a = w; } }
    if (a) {
      if (ad > 0.9) goTo(p, a.x, a.y, sp * 1.15, dt);
      else { p.act = true; p.dir = a.x - p.x - (a.y - p.y) >= 0 ? 1 : -1; wildHit(a, 10 * dt * (S.research.done.bronz ? 1.3 : 1) * (S.research.done.zelezo ? 1.5 : 1), 'ulovili ho lovci'); }
      return;
    }
  }
  if (!p.job && S.site && !p.hold) { setJob(p, 'stavba'); return; }   // volní lidé jdou sami stavět (kromě odvolaných)
  if (!p.job) { if (p.tx != null) goTo(p, p.tx, p.ty, sp, dt); return; }
  if (p.job === 'stavba') {
    if (!S.site) { setJob(p, null); return; }
    if (goTo(p, S.site.x + 0.5 + ((p.id % 5) - 2) * 0.16, S.site.y + 0.86, sp, dt)) { S.site.prog += dt * slow; p.act = true; }
    return;
  }
  if (p.job === 'ryby') {
    let b = p.bid && bById(p.bid);
    if (!b || b.type !== 'ryby') {
      b = S.blds.find(b => b.type === 'ryby' && S.people.filter(q => q.job === 'ryby' && q.bid === b.id).length < lvOf(b).js.ryby);
      if (!b) { setJob(p, null); return; }
      p.bid = b.id; p.st = 'toShore';
    }
    const w = waterNear(b); if (!w) { setJob(p, null); return; }
    const boat = !!lvOf(b).boat, hx = b.x + 0.5 + w.dx * 0.3, hy = b.y + 0.5 + w.dy * 0.3;
    switch (p.st) {
      default: p.st = 'toShore';
      case 'toShore': if (S.res.ryby >= storeCap()) { stopFull(p, 'ryby'); break; }
        if (goTo(p, hx, hy, sp, dt)) { p.st = boat ? 'sail' : 'fish'; p.t = 0; } break;
      case 'sail': p.boat = true; if (moveTo(p, w.fx, w.fy, sp, dt)) { p.st = 'fish'; p.t = 0; } break;
      case 'fish':
        p.act = true; p.fishing = true; p.dir = w.dx - w.dy >= 0 ? 1 : -1; p.t += dt * slow;
        if (p.t >= (boat ? 12 : 15)) { p.carry = { ryby: boat ? 4 : 2 }; p.fishing = false; p.st = boat ? 'ret' : 'drop'; }
        break;
      case 'ret': if (moveTo(p, hx, hy, sp, dt)) { p.boat = false; p.st = 'drop'; } break;
      case 'drop': addRes('ryby', p.carry ? p.carry.ryby : 0); p.carry = null; p.st = 'toShore'; break;
    }
    return;
  }
  const bt = JOB_BLD[p.job];
  if (bt) {
    let b = p.bid && bById(p.bid);
    if (!b || b.type !== bt) {
      b = S.blds.find(b => b.type === bt && S.people.filter(q => q.job === p.job && q.bid === b.id).length < ((lvOf(b).js || {})[p.job] || 0));
      if (!b) { setJob(p, null); return; }
      p.bid = b.id; p.st = 'find';
    }
    const l = lvOf(b);
    if (l.farm) {           // pole a ohrada: obdělávají a úrodu nosí do skladu
      const o0 = Object.keys(l.farm.out)[0];
      if (!p.carry && S.res[o0] >= storeCap()) { stopFull(p, o0); return; }
      if (p.st === 'back') {
        const st = nearestStore({ x: p.x, y: p.y, job: '' });
        if (goTo(p, st.x + 0.5, st.y + 0.86, sp, dt)) {
          for (const r in p.carry) { addRes(r, p.carry[r]); if (r === 'kozesiny') S.stats.hides += p.carry[r]; }
          p.carry = null; p.st = 'find';
        }
        return;
      }
      if (goTo(p, b.x + 0.5 + ((p.id % 2) ? 0.25 : -0.25), b.y + 0.55 + ((p.id % 3) - 1) * 0.15, sp, dt)) {
        p.act = true; b.t = (b.t || 0) + dt * slow;
        if (b.t >= l.farm.t) { b.t = 0; p.carry = Object.assign({}, l.farm.out); p.st = 'back'; }
      }
      return;
    }
    if (l.plant) {          // lesníci sázejí stromky
      if (p.st === 'goPlant') {
        if (occ.has(p.px + p.py * N)) { p.st = 'find'; return; }
        if (goTo(p, p.px + 0.5, p.py + 0.85, sp, dt)) { p.st = 'planting'; p.t = 0; } else if (p.nopath) p.st = 'find';
        return;
      }
      if (p.st === 'planting') {
        p.act = true; p.t += dt * slow;
        if (p.t >= 8) {
          const k = p.px + p.py * N;
          if (!occ.has(k)) { const n = { id: S.nid++, t: 'strom', x: p.px, y: p.py, amt: 2, rg: 0, young: true }; S.nodes.push(n); occ.set(k, n); nodeMap.set(n.id, n); }
          p.st = 'find'; p.t = 0;
        }
        return;
      }
      p.t = (p.t || 0) - dt;
      if (p.t <= 0) {
        const c = plantSpot(b, l.plant);
        if (c) { p.px = c[0]; p.py = c[1]; p.st = 'goPlant'; return; }
        p.t = 6;
      }
      goTo(p, b.x + 0.5 + ((p.id % 2) ? 0.3 : -0.3), b.y + 0.86, sp, dt);
      return;
    }
    if (p.st === 'haul') {   // nese výrobky do skladu
      p.atWork = false;
      const st = storeNear(p.x, p.y);
      if (goTo(p, st.x + 0.5, st.y + 0.86, sp, dt)) { for (const r in p.carry) addRes(r, p.carry[r]); p.carry = null; p.st = 'find'; }
      return;
    }
    const tot = stockOf(b);
    if (tot >= 10 || (tot >= 6 && !S.people.some(q => q.bid === b.id && q.st === 'haul'))) {
      p.carry = {}; let cap = 10;
      for (const r in b.stock) { const k = Math.min(cap, b.stock[r]); if (k > 0) { p.carry[r] = k; b.stock[r] -= k; cap -= k; } }
      p.st = 'haul'; p.atWork = false; return;
    }
    p.atWork = goTo(p, b.x + 0.5 + ((p.id % 2) ? 0.3 : -0.3), b.y + 0.86, sp, dt);
    if (p.atWork && !b.lack) { p.act = true; p.dir = (p.id % 2) ? -1 : 1; }
    return;
  }
  const type = JOBS[p.job].node, def = NODE[type];
  let n;
  switch (p.st) {
    case 'find':
      if (S.res[def.res] >= storeCap()) { stopFull(p, def.res); break; }
      n = nearestNode(p, type);
      if (!n) { if (S.time - (S.fullT['nn_' + type] || -99) > 45) { S.fullT['nn_' + type] = S.time; log('Není dostupná žádná surovina: ' + RES[def.res][1].toLowerCase() + (def.renew ? '. Hliniště se pomalu znovu zaplní.' : '.')); } setJob(p, null); break; }
      p.nid = n.id; p.st = 'go'; break;
    case 'go':
      n = nodeMap.get(p.nid);
      if (!n || n.amt < 1 || n.young) { p.st = 'find'; break; }
      if (goTo(p, n.x + 0.5 + ((p.id % 3) - 1) * 0.22, n.y + 0.85, sp, dt)) { p.st = 'work'; p.t = 0; }
      else if (p.nopath) setJob(p, null);
      break;
    case 'work':
      n = nodeMap.get(p.nid);
      if (!n || n.amt < 1) { p.st = p.n ? 'back' : 'find'; if (p.n) loadCarry(p, type); break; }
      p.act = true;
      p.t += dt * slow * (1 + 0.1 * (S.perk || 0)) * (S.research.done.nastroje ? 1.33 : 1) * (p.pro ? 1.6 : 1) * (S.research.done.bronz ? 1.25 : 1) * (S.research.done.zelezo ? 1.25 : 1);
      if (p.t >= def.work) {
        p.t = 0; n.amt--; p.n++;
        if (n.amt < 1 && !def.renew) removeNode(n);
        if (p.n >= (p.pro ? 5 : 3) * (S.research.done.cesty ? 2 : 1)) { loadCarry(p, type); p.st = 'back'; }
      }
      break;
    case 'back': {
      const s = nearestStore(p);
      if (goTo(p, s.x + 0.5, s.y + 0.86, sp, dt)) {
        for (const r in p.carry) { addRes(r, p.carry[r]); if (r === 'kozesiny') S.stats.hides += p.carry[r]; }
        p.carry = null; p.n = 0; p.st = 'find';
      }
      break;
    }
    case 'wait':
      p.t -= dt; if (p.t <= 0) p.st = 'find';
      { const h = home(); goTo(p, h.x + 0.5 + (p.id % 4) * 0.4 - 0.6, h.y + 1.5, sp * 0.5, dt); }
      break;
  }
}
function plantSpot(b, r) {
  const hc = comp[b.x + b.y * N], cand = []; let trees = 0;
  for (let y = b.y - r; y <= b.y + r; y++) for (let x = b.x - r; x <= b.x + r; x++) {
    if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1 || Math.hypot(x - b.x, y - b.y) > r) continue;
    const i = x + y * N, o = occ.get(i);
    if (o && o.t === 'strom') { trees++; continue; }
    if (o || !rev[i] || (terr[i] !== T_GRASS && terr[i] !== T_DIRT) || comp[i] !== hc) continue;
    if (S.site && Math.abs(S.site.x - x) <= 1 && Math.abs(S.site.y - y) <= 1) continue;
    if (S.blds.some(o => Math.abs(o.x - x) <= 1 && Math.abs(o.y - y) <= 1)) continue;
    if (S.people.some(q => q.st === 'goPlant' && q.px === x && q.py === y)) continue;
    cand.push([x, y]);
  }
  if (!cand.length || trees >= 20 + r * 2) return null;
  return cand[Math.floor(Math.random() * cand.length)];
}
function loadCarry(p, type) {
  // z lovu půldruhého masa, kožešina jen z každé druhé výpravy
  if (type === 'zver') { S.hideT = (S.hideT || 0) + 1; p.carry = { maso: Math.round(p.n * 1.5), kozesiny: S.hideT % 2 }; }
  else p.carry = { [NODE[type].res]: p.n };
}
function removeNode(n) {
  S.nodes.splice(S.nodes.indexOf(n), 1); nodeMap.delete(n.id); occ.delete(n.x + n.y * N);
}
function finishSite() {
  const s = S.site; S.site = null;
  if (s.upg) {
    const b = bById(s.upg); b.lvl++;
    if (lvOf(b).into) { b.type = lvOf(b).into; b.lvl = 1; b.buf = null; }   // přestavba na jinou stavbu (jáma → sýpka, skála → svatyně)
    if (lvOf(b).age) ageUp(lvOf(b).age);
    log(BLD[b.type].names ? 'Hotovo: ' + bname(b) + '.' : BLD[b.type].name + ' vylepšena na ' + b.lvl + '. stupeň.');
  } else {
    const b = { id: S.nid++, type: s.type, x: s.x, y: s.y, lvl: s.lv || 1, t: 0 };
    S.blds.push(b); occ.set(b.x + b.y * N, b);
    log('Postaveno: ' + bname(b) + '.');
    if (BLD[s.type].lv[0].final) { S.finished = true; showModal('final'); }
    if (s.type === 'ohniste') { S.fire.lit = true; S.fire.t = 0; log('Oheň hoří! Tma a zima ustupují.'); }
  }
  renderUI();
}

/* ---------- pocestní ---------- */
/* ---------- železnice ---------- */
const RAIL_COST = { ocel: 1, prkna: 1 };
function railAt(k) {
  if (railSet.has(k)) return true;
  const x = k % N, y = Math.floor(k / N);
  if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1 || !rev[k] || terr[k] === T_WATER || occ.has(k) || beltMap.has(k)) return false;
  if (!canPay(RAIL_COST)) { if (!railAt.warned) toast('Na koleje chybí ' + costPlain(RAIL_COST) + '.'); railAt.warned = true; return false; }
  railAt.warned = false; pay(RAIL_COST); S.rails.push(k); railSet.add(k); railsDirty = true; return true;
}
function removeRail(k) {
  if (!railSet.has(k)) return;
  S.rails.splice(S.rails.indexOf(k), 1); railSet.delete(k); railsDirty = true;
  for (const r in RAIL_COST) addRes(r, RAIL_COST[r]);
}
function railDrag(sx, sy) {
  const [fx, fy] = screenToTile(sx, sy), x = Math.floor(fx), y = Math.floor(fy);
  if (!rdrag) return;
  while (rdrag.x !== x || rdrag.y !== y) {
    const dx = x - rdrag.x, dy = y - rdrag.y;
    if (Math.abs(dx) >= Math.abs(dy)) rdrag.x += Math.sign(dx); else rdrag.y += Math.sign(dy);
    rdrag.moved = true;
    if (!railAt(rdrag.x + rdrag.y * N)) { rdrag.x = x; rdrag.y = y; break; }
  }
}
const stationRails = b => BDIR.map(([dx, dy]) => b.x + dx + (b.y + dy) * N).filter(k => railSet.has(k));
function railPath(from, toSet) {
  const prev = new Map(), q = [from]; prev.set(from, -1);
  for (let h = 0; h < q.length; h++) {
    const k = q[h]; if (toSet.has(k)) { const path = []; for (let c = k; c !== -1; c = prev.get(c)) path.unshift(c); return path; }
    const x = k % N, y = Math.floor(k / N);
    for (const [dx, dy] of BDIR) { const m = x + dx + (y + dy) * N; if (railSet.has(m) && !prev.has(m)) { prev.set(m, k); q.push(m); } }
  }
  return null;
}
// jeden vlak na každou trať, na které stojí aspoň dvě nádraží
function ensureTrains() {
  const cid = new Map(); let c = 0;
  for (const k of railSet) {
    if (cid.has(k)) continue;
    const q = [k]; cid.set(k, c);
    while (q.length) { const t = q.pop(), x = t % N, y = Math.floor(t / N); for (const [dx, dy] of BDIR) { const m = x + dx + (y + dy) * N; if (railSet.has(m) && !cid.has(m)) { cid.set(m, c); q.push(m); } } }
    c++;
  }
  const groups = {};
  for (const b of S.blds) if (b.type === 'nadrazi') { const r = stationRails(b)[0]; if (r !== undefined) { const g = cid.get(r); (groups[g] = groups[g] || []).push(b); } }
  S.trains = S.trains.filter(t => {
    const st = bById(t.at) || bById(t.to); const r = st && stationRails(st)[0];
    t.c = r === undefined ? -1 : cid.get(r);
    if (groups[t.c] && groups[t.c].length >= 2 && !groups[t.c].taken) { groups[t.c].taken = true; return true; }
    for (const k in t.cargo) addRes(k, t.cargo[k]);
    return false;
  });
  for (const g in groups) {
    const list = groups[g]; if (list.length < 2 || list.taken) continue;
    const st = list[0], r = stationRails(st)[0], cx = r % N + 0.5, cy = Math.floor(r / N) + 0.5;
    S.trains.push({ id: S.nid++, c: +g, at: st.id, to: 0, st: 'load', t: 0, cargo: {}, path: null, i: 0, pos: [[cx, cy], [cx, cy], [cx, cy]] });
  }
}
function updTrains(dt) {
  S.trT = (S.trT || 0) + dt;
  if (S.trT >= 2 || railsDirty) { S.trT = 0; railsDirty = false; ensureTrains(); }
  for (const b of S.blds) if (b.type === 'nadrazi') { b.outItems = b.outItems || []; flushOut(b, outBeltOf(b)); }
  for (const t of S.trains) {
    if (t.st === 'load') {
      t.t += dt; if (t.t < 3) continue;
      const a = bById(t.at); if (!a) continue;
      a.buf = a.buf || {}; a.outItems = a.outItems || [];
      for (const r in t.cargo) { for (let i = 0; i < t.cargo[r]; i++) a.outItems.push(r); S.stats.trainCargo += t.cargo[r]; }
      t.cargo = {};
      let cap = 40;
      for (const r in a.buf) { const n = Math.min(cap, a.buf[r]); if (n > 0) { t.cargo[r] = n; a.buf[r] -= n; cap -= n; } }
      const others = S.blds.filter(b => b.type === 'nadrazi' && b.id !== a.id).sort((p, q) => p.id - q.id);
      let dest = null, path = null;
      for (const b of others.filter(b => b.id > a.id).concat(others.filter(b => b.id < a.id))) {
        const from = stationRails(a), to = new Set(stationRails(b));
        for (const f of from) { path = railPath(f, to); if (path) break; }
        if (path) { dest = b; break; }
      }
      if (!dest) { t.t = 0; continue; }
      t.to = dest.id; t.path = path; t.i = 0; t.st = 'move';
    } else {
      t.i += 3 * dt;
      const at = f => { f = Math.max(0, Math.min(t.path.length - 1, f)); const i0 = Math.floor(f), i1 = Math.min(t.path.length - 1, i0 + 1), fr = f - i0, a = t.path[i0], b = t.path[i1];
        return [(a % N) + 0.5 + ((b % N) - (a % N)) * fr, Math.floor(a / N) + 0.5 + (Math.floor(b / N) - Math.floor(a / N)) * fr]; };
      t.pos = [at(t.i), at(t.i - 0.9), at(t.i - 1.8)];
      if (t.i >= t.path.length - 1) { t.st = 'load'; t.at = t.to; t.t = 0; }
    }
  }
}
function drawRails(vis) {
  for (const k of railSet) {
    const x = k % N, y = Math.floor(k / N); if (!vis(x, y)) continue;
    const [cx, cy0] = iso(x + 0.5, y + 0.5), cy = cy0;
    let nb = BDIR.filter(([dx, dy]) => railSet.has(x + dx + (y + dy) * N));
    if (!nb.length) nb = [[1, 0], [-1, 0]];
    ctx.fillStyle = '#7a7468'; ctx.beginPath(); ctx.ellipse(cx, cy, 13, 6.5, 0, 0, 7); ctx.fill();
    for (const [dx, dy] of nb) {
      const vx = (dx - dy) * TW / 4, vy = (dx + dy) * TH / 4, l = Math.hypot(vx, vy), nx = -vy / l, ny = vx / l;
      ctx.fillStyle = '#7a7468'; ctx.beginPath(); ctx.moveTo(cx + nx * 7, cy + ny * 4); ctx.lineTo(cx + vx + nx * 7, cy + vy + ny * 4); ctx.lineTo(cx + vx - nx * 7, cy + vy - ny * 4); ctx.lineTo(cx - nx * 7, cy - ny * 4); ctx.fill();
      ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i <= 2; i++) { const f = i / 2.2; ctx.moveTo(cx + vx * f + nx * 6, cy + vy * f + ny * 3.4); ctx.lineTo(cx + vx * f - nx * 6, cy + vy * f - ny * 3.4); } ctx.stroke();
      ctx.strokeStyle = '#b0b6be'; ctx.lineWidth = 1.3;
      ctx.beginPath(); for (const sgn of [1, -1]) { ctx.moveTo(cx + nx * 3.6 * sgn, cy + ny * 2 * sgn); ctx.lineTo(cx + vx + nx * 3.6 * sgn, cy + vy + ny * 2 * sgn); } ctx.stroke();
    }
  }
}
function drawTrain(t) {
  t.pos.forEach((p, i) => {
    const [sx, sy] = iso(p[0], p[1]);
    shadow(sx, sy + 2, 11);
    if (i === 0) { isoBox(sx, sy + 3, 10, 11, '#a83228', '#86281f', '#c84a3a'); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(sx + 2, sy - 18, 4, 7); }
    else { const r = Object.keys(t.cargo)[i - 1] || Object.keys(t.cargo)[0]; isoBox(sx, sy + 3, 10, 8, '#6a4a2a', '#54391f', r ? RCOL[r] || '#aaa' : '#7a5a3a'); }
  });
}
function railIcon() {
  if (ICON.__rail) return ICON.__rail;
  const c = document.createElement('canvas'); c.width = c.height = 80; const g = c.getContext('2d');
  g.fillStyle = '#7a7468'; g.beginPath(); g.moveTo(10, 50); g.lineTo(50, 10); g.lineTo(70, 30); g.lineTo(30, 70); g.closePath(); g.fill();
  g.strokeStyle = '#5a4030'; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 4; i++) { const t = 18 + i * 12; g.moveTo(t, t + 24); g.lineTo(t + 24, t); } g.stroke();
  g.strokeStyle = '#c0c6ce'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(16, 50); g.lineTo(50, 16); g.moveTo(30, 64); g.lineTo(64, 30); g.stroke();
  return (ICON.__rail = c.toDataURL());
}
/* ---------- letiště ---------- */
function genAir() { S.aircon = AIR_CONTRACTS.slice().sort(() => Math.random() - 0.5).slice(0, 3); }
function sendFlight(i) {
  const b = S.blds.find(b => b.type === 'letiste'); if (!b || S.flight || !S.aircon) return;
  const c = S.aircon[+i]; if (!c || !canPay(c.want)) return;
  pay(c.want); const a = Math.random() * Math.PI * 2;
  S.flight = { t: 0, c, ang: a }; log('Letadlo odlétá do ' + c.to + '.');
}
function updFlight(dt) {
  const f = S.flight; if (!f) return;
  f.t += dt;
  if (f.t >= 48) { for (const r in f.c.get) addRes(r, f.c.get[r]); S.stats.flights++; log('Letadlo se vrátilo z ' + f.c.to + ' a přivezlo ' + costPlain(f.c.get) + '.'); S.flight = null; S.aircon = null; }
}
function drawFlight() {
  const f = S.flight, b = S.blds.find(b => b.type === 'letiste'); if (!f || !b) return;
  let k; if (f.t < 8) k = f.t / 8; else if (f.t < 40) return; else k = (48 - f.t) / 8;
  const [bx, by] = iso(b.x + 0.5, b.y + 0.5), dx = Math.cos(f.ang), dy = Math.sin(f.ang) * 0.5, dist = k * k * 1400, alt = 10 + k * 160;
  const x = bx + dx * dist, y = by + dy * dist, dir = f.t < 8 ? 1 : -1, ang = Math.atan2(dy * dir, dx * dir);
  ell(x, y, 16, 5, 'rgba(0,0,0,.18)');
  ctx.save(); ctx.translate(x, y - alt); ctx.rotate(ang); ctx.scale(1.1, 1.1);
  poly([-4, 0, 6, -16, 10, -16, 4, 0], '#d8dce0', '#3a3a40'); poly([-4, 0, 6, 16, 10, 16, 4, 0], '#c8ccd0', '#3a3a40');
  ell(0, 0, 17, 3.6, '#f0f2f4'); ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(0, 0, 17, 3.6, 0, 0, 7); ctx.stroke();
  poly([-15, 0, -19, -7, -16, -7, -11, 0], '#c83a2a', '#3a3a40'); ell(13, -0.5, 2.2, 1.6, '#3a6a9a');
  ctx.restore();
}
function genContracts() { S.contracts = CONTRACTS.slice().sort(() => Math.random() - 0.5).slice(0, 3); }
function updExped(dt) {
  const e = S.exped; if (!e) return;
  const b = S.blds.find(b => b.type === 'smeniste');
  e.mv = false;
  if (e.st === 'go') { if (goTo(e, e.ex, e.ey, 1.0, dt) || e.nopath) { e.st = 'away'; e.t = 90; } }
  else if (e.st === 'away') { e.t -= dt; if (e.t <= 0) { e.st = 'back'; e.path = null; e.gx = null; e.nopath = false; } }
  else if (goTo(e, b ? b.x + 0.5 : e.hx, b ? b.y + 0.9 : e.hy, 1.0, dt) || e.nopath) {
    for (const r in e.c.get) addRes(r, e.c.get[r]);
    S.stats.exped++; log('Povoz se vrátil z ' + e.c.to + ' a přivezl ' + costPlain(e.c.get) + '.');
    S.exped = null; S.contracts = null;
  }
}
function sendExped(i) {
  const b = S.blds.find(b => b.type === 'smeniste' && lvOf(b).exped);
  if (!b || S.exped || !S.contracts) return;
  const c = S.contracts[+i]; if (!c || !canPay(c.want)) return;
  const hc = comp[b.x + b.y * N], cand = [];
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const d = Math.hypot(x - b.x, y - b.y); if (comp[x + y * N] === hc && d > 18 && d < 30) cand.push([x + 0.5, y + 0.5]); }
  const ep = cand.length ? cand[Math.floor(Math.random() * cand.length)] : [b.x + 0.5, b.y + 0.9];
  pay(c.want);
  S.exped = { id: 0, st: 'go', x: b.x + 0.5, y: b.y + 0.9, hx: b.x + 0.5, hy: b.y + 0.9, ex: ep[0], ey: ep[1], c, t: 0 };
  log('Povoz vyrazil do ' + c.to + '.');
}
function trLevel() { const b = S.blds.find(b => b.type === 'smeniste'); return b ? lvOf(b).trade : 0; }
function makeOffers(tl) {
  const mix = a => a.slice().sort(() => Math.random() - 0.5);
  if (!S.age) {
    const shells = OFFERS.filter(o => o.give.musle), other = mix(OFFERS.filter(o => !o.give.musle)).slice(0, 3 + tl);
    return [shells[Math.floor(Math.random() * shells.length)]].concat(other);
  }
  // pokaždé jiné zboží, množství i ceny podle věku; kupci často dávají výhodnější cenu než tržiště
  const age = Math.min(S.age, 5), pool = mix(BUYABLE[age].concat(TOPRES[age]).filter((r, i, a) => VAL[r] && a.indexOf(r) === i && r !== 'mince'));
  const n = 4 + tl * 2, out = [], rnd = (a, b) => a + Math.random() * (b - a);
  if (age <= 2) out.push({ give: { cin: 2 + Math.floor(Math.random() * 3) }, want: { mince: 0 } });
  for (const r of pool) {
    if (out.length >= n) break;
    const q = [10, 15, 20, 30][Math.floor(Math.random() * 4)];
    if (out.length % 2) out.push({ give: { mince: Math.max(1, Math.round(q * VAL[r] * rnd(0.9, 1.4))) }, want: { [r]: q } });   // kupec kupuje
    else out.push({ give: { [r]: q }, want: { mince: Math.max(2, Math.round(q * VAL[r] * rnd(1.1, 1.5))) } });                      // kupec prodává
  }
  if (Math.random() < 0.4) { const q = 10 + 10 * Math.floor(Math.random() * 3); out.push({ give: { vedeni: q }, want: { mince: Math.round(q * 0.6) } }); }
  out.forEach(o => { if (o.give.cin) o.want.mince = Math.round(o.give.cin * VAL.cin * rnd(1.1, 1.4)); });
  return out;
}
function updTrader(dt) {
  const f = S.blds.find(b => b.type === 'smeniste') || S.blds.find(b => b.type === 'ohniste') || S.blds.find(b => b.type === 'jeskyne');
  let t = S.trader;
  if (!t) {
    if (!f) return;
    S.nextTrader -= dt;
    if (S.nextTrader <= 0 && (S.fire.lit || f.type === 'smeniste')) {
      const hc = comp[f.x + f.y * N], cand = [];
      for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const d = Math.hypot(x - f.x, y - f.y); if (comp[x + y * N] === hc && d > 18 && d < 30) cand.push([x, y]); }
      if (!cand.length) { S.nextTrader = 60; return; }
      const sp0 = cand[Math.floor(Math.random() * cand.length)], sx = sp0[0] + 0.5, sy = sp0[1] + 0.5;
      const tl = trLevel(), nw = S.age ? NEWS2 : NEWS;
      S.trader = { id: 0, x: sx, y: sy, sx, sy, st: 'come', t: 80 + tl * 40, news: nw[Math.floor(Math.random() * nw.length)],
        offers: makeOffers(tl).map(o => ({ give: o.give, want: o.want, left: 2 + tl })) };
      log(S.age ? 'K osadě se blíží kupec se soumarem.' : 'K osadě se blíží pocestný.');
    }
    return;
  }
  t.mv = false;
  if (t.st === 'come') {
    if (!f) { t.st = 'leave'; return; }
    if (goTo(t, f.x + 0.9, f.y + 0.8, 1.1, dt)) { t.st = 'wait'; log(S.age ? 'Kupec dorazil. Chce obchodovat.' : 'Pocestný usedl k ohni. Chce směňovat.'); }
    else if (t.nopath) { S.trader = null; S.nextTrader = 60; }
  } else if (t.st === 'wait') {
    t.t -= dt;
    if (t.t <= 0) { t.st = 'leave'; if (modalKind === 'trade') closeModal(); log(S.age ? 'Kupec odjel dál.' : 'Pocestný se zvedl a jde dál.'); }
  } else if (goTo(t, t.sx, t.sy, 1.1, dt) || t.nopath) { S.trader = null; const tl = trLevel(); S.nextTrader = [140, 95, 65][tl] + Math.random() * [90, 60, 45][tl]; }
}

/* ---------- kreslení ---------- */
/* textury země: plynulé přechody mezi povrchy, písek na březích */
const TEX = {};
let terrMode = 'kresba', terrDirty = false, texReady = false;
const SET_KEY = 'agesOfEmber_nastaveni';
const SET = (() => { try { return Object.assign({ terr: 'krasna', autosave: 60, music: 0.6, sfx: 0.8, mute: false }, JSON.parse(localStorage.getItem(SET_KEY) || '{}')); } catch (e) { return { terr: 'krasna', autosave: 60 }; } })();
function saveSet() { try { localStorage.setItem(SET_KEY, JSON.stringify(SET)); } catch (e) { } }
function applyTerrain() {   // přepne malovaný / jednoduchý terén za běhu
  terrMode = (SET.terr === 'krasna' && texReady) ? 'textury' : 'kresba';
  if (!S) return;
  tctx.clearRect(0, 0, tcan.width, tcan.height);
  if (terrMode === 'textury') terrDirty = true;
  else { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (rev[x + y * N]) drawTile(x, y); S.roads.forEach(k => roadTile(tctx, k % N, Math.floor(k / N))); }
}
(function loadTex() {
  const names = ['zem_trava1', 'zem_trava2', 'zem_hlina1', 'zem_hlina2', 'zem_skala1', 'zem_skala2', 'zem_pisek1', 'zem_voda1'];
  let left = names.length, bad = false;
  names.forEach(n => {
    const i = new Image();
    i.onload = () => { TEX[n] = i; if (--left === 0 && !bad) { texReady = true; if (SET.terr === 'krasna') { terrMode = 'textury'; terrDirty = true; } } };
    i.onerror = () => { bad = true; --left; };
    i.src = 'img/' + n + '.png';
  });
})();
// textura natočená do izometrie se opakuje po obdélníku (tiles×TW, tiles×TH) – ten se spočítá jednou
const PROJ = {};
// mlha: malý obrázek, ve kterém se odkryté dlaždice vymazávají; při zvětšení má měkké okraje
const FS = 0.25, fcan = document.createElement('canvas');
fcan.width = Math.ceil(N * TW * FS); fcan.height = Math.ceil((N * TH + TH) * FS);
const fctx = fcan.getContext('2d');
function fogCut(x, y) {
  const [px, py] = iso(x + 0.5, y + 0.5), hw = TW / 2 * 1.25 * FS, hh = TH / 2 * 1.25 * FS, cx = px * FS, cy = py * FS;
  fctx.beginPath(); fctx.moveTo(cx, cy - hh); fctx.lineTo(cx + hw, cy); fctx.lineTo(cx, cy + hh); fctx.lineTo(cx - hw, cy); fctx.closePath(); fctx.fill();
}
function fogInit() {
  fctx.globalCompositeOperation = 'source-over'; fctx.fillStyle = '#0d0f0c'; fctx.fillRect(0, 0, fcan.width, fcan.height);
  fctx.globalCompositeOperation = 'destination-out'; fctx.fillStyle = '#000';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (rev[x + y * N]) fogCut(x, y);
}
let terrBmp = null;
function texPat(c, name, tiles, ox, oy) {
  const key = name + tiles;
  if (!PROJ[key]) {
    const pc = document.createElement('canvas'); pc.width = Math.round(tiles * TW); pc.height = Math.round(tiles * TH);
    const g = pc.getContext('2d'), p = g.createPattern(TEX[name], 'repeat'), k = tiles / TEX[name].width;
    p.setTransform(new DOMMatrix([k * TW / 2, k * TH / 2, -k * TW / 2, k * TH / 2, 0, 0]));
    g.fillStyle = p; g.fillRect(0, 0, pc.width, pc.height); PROJ[key] = pc;
  }
  const p = c.createPattern(PROJ[key], 'repeat'); p.setTransform(new DOMMatrix([1, 0, 0, 1, OX - (ox || 0), -(oy || 0)]));
  return p;
}
// dlážděná cesta – kreslí se natrvalo do obrázku terénu
// dlážděná cesta – tmavší dlažba s obrubníkem tam, kde cesta končí; s obrázkem img/zem_cesta1.png se použije ten
const ROADIMG = new Image(); ROADIMG.onload = () => { ROADIMG.ok = true; if (S) { terrDirty = terrMode === 'textury'; if (!terrDirty) S.roads.forEach(k => roadTile(tctx, k % N, Math.floor(k / N))); } }; ROADIMG.src = 'img/zem_cesta1.png';
// vyšlapaná stezka: měkký oválný flek na políčku + spojky k sousedním cestám, okraje rozmazané
const RT = document.createElement('canvas'); RT.width = 160; RT.height = 100;
function roadTile(c, x, y) {
  const [cx, cy] = iso(x + 0.5, y + 0.5), ox = cx - RT.width / 2, oy = cy - RT.height / 2;
  const g = RT.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, RT.width, RT.height);
  // tvar cesty (bez ostrých hran)
  g.filter = 'blur(3px)'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; g.lineWidth = 19;
  const mx = RT.width / 2, my = RT.height / 2;
  g.beginPath(); g.ellipse(mx, my, 20, 11, 0, 0, 7); g.fill();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    if (!roadSet.has(x + dx + (y + dy) * N)) continue;
    const vx = (dx - dy) * TW / 2, vy = (dx + dy) * TH / 2;
    g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + vx * 0.7, my + vy * 0.7); g.stroke();
  }
  g.filter = 'none';
  // výplň texturou stezky zarovnanou s mapou
  g.globalCompositeOperation = 'source-in';
  if (ROADIMG.ok) {
    const pat = g.createPattern(ROADIMG, 'repeat'), k = 3 / ROADIMG.width;
    pat.setTransform(new DOMMatrix([k * TW / 2, k * TH / 2, -k * TW / 2, k * TH / 2, OX - ox, -oy])); g.fillStyle = pat;
  } else g.fillStyle = '#9a7448';
  g.fillRect(0, 0, RT.width, RT.height);
  g.globalCompositeOperation = 'source-over';
  c.drawImage(RT, ox, oy);
}
let bmpTimer = 0;
function refreshBmp() { return;
  if (terrMode !== 'textury' || !window.createImageBitmap) return;
  terrBmp = null; clearTimeout(bmpTimer);
  bmpTimer = setTimeout(() => createImageBitmap(tcan).then(bm => { terrBmp = bm; }).catch(() => {}), 400);
}
function paintRoad(tx, ty) {
  const k = tx + ty * N;
  if (tx < 0 || ty < 0 || tx >= N || ty >= N || roadSet.has(k) || !rev[k] || terr[k] === T_WATER || occ.has(k)) return;
  if (S.res.kamen < 1) { if (!paintRoad.warned) toast('Na cestu chybí kámen.'); paintRoad.warned = true; return; }
  paintRoad.warned = false;
  S.res.kamen--; S.roads.push(k); roadSet.add(k); roadTile(tctx, tx, ty);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (roadSet.has(tx + dx + (ty + dy) * N)) roadTile(tctx, tx + dx, ty + dy);   // sousedům zmizí obrubník
  refreshBmp();
}
// cesta po celé dráze myši, i když se myš pohne rychle
function roadLine(x0, y0, x1, y1) {
  const a = screenToTile(x0, y0), b = screenToTile(x1, y1), n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.3));
  for (let i = 0; i <= n; i++) paintRoad(Math.floor(a[0] + (b[0] - a[0]) * i / n), Math.floor(a[1] + (b[1] - a[1]) * i / n));
}
function roadIcon() {
  if (ICON.__road) return ICON.__road;
  const c = document.createElement('canvas'); c.width = c.height = 80; const g = c.getContext('2d');
  g.fillStyle = '#5f8a3a'; g.beginPath(); g.moveTo(40, 8); g.lineTo(76, 40); g.lineTo(40, 72); g.lineTo(4, 40); g.closePath(); g.fill();
  const [wx, wy] = iso(0, 0); g.setTransform(0.62, 0, 0, 0.62, 40 - wx * 0.62 - 40, 18 - wy * 0.62);
  for (let i = 0; i < 3; i++) roadTile(g, i, 0);
  return (ICON.__road = c.toDataURL());
}
// terén se maluje po dílcích (CW × CH bodů), jen tam, kam se hráč dívá – velká mapa tak nezdrží start
const CW = 512, CH = 256, CPAD = 24, CNX = Math.ceil(N * TW / CW), CNY = Math.ceil((N * TH + TH) / CH);
let chunkDone = new Uint8Array(CNX * CNY), nzCan = null, shCan = null;
function renderTerrain() {   // jen připraví malování znovu od začátku
  terrDirty = false; fogInit(); chunkDone.fill(0);
  tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, tcan.width, tcan.height);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const W = tcan.width, H = tcan.height, nw = Math.ceil(W / 16), nh = Math.ceil(H / 16);
  nzCan = mk(nw, nh); shCan = mk(nw, nh);
  { const id = nzCan.getContext('2d').createImageData(nw, nh);   // šum pro střídání dvou variant textury
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
      const v = noise(x * 16 / TW * 1.4, y * 16 / TH * 1.4, S.seed + 77, 4), a = Math.max(0, Math.min(1, (v - 0.42) * 6));
      const o = (y * nw + x) * 4; id.data[o] = id.data[o + 1] = id.data[o + 2] = 255; id.data[o + 3] = a * 255;
    }
    nzCan.getContext('2d').putImageData(id, 0, 0); }
  { const id = shCan.getContext('2d').createImageData(nw, nh);   // jemné stínování, ať se textury tolik neopakují
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
      const v = noise(x * 16 / TW * 0.8, y * 16 / TH * 0.8, S.seed + 91, 3) - 0.5, o = (y * nw + x) * 4;
      if (v < 0) { id.data[o + 3] = Math.min(255, -v * 150); } else { id.data[o] = id.data[o + 1] = 255; id.data[o + 2] = 200; id.data[o + 3] = v * 60; }
    }
    shCan.getContext('2d').putImageData(id, 0, 0); }
}
const CK = {};
function chunkCanvas(name, w, h) { if (!CK[name]) { CK[name] = document.createElement('canvas'); CK[name].width = w; CK[name].height = h; } return CK[name]; }
function renderChunk(ci, cj) {
  chunkDone[ci + cj * CNX] = 1;
  const W = tcan.width, H = tcan.height, MS = 0.25;
  const X0 = ci * CW - CPAD, Y0 = cj * CH - CPAD, LW = CW + CPAD * 2, LH = CH + CPAD * 2, mw = LW * MS, mh = LH * MS;
  const L = chunkCanvas('L', LW, LH), L2 = chunkCanvas('L2', LW, LH), m0 = chunkCanvas('m0', mw, mh), m1 = chunkCanvas('m1', mw, mh);
  const lc = L.getContext('2d'), l2 = L2.getContext('2d'), c0 = m0.getContext('2d'), c1 = m1.getContext('2d');
  // políčka, která do dílku zasahují
  const tiles = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const [px, py] = iso(x + 0.5, y + 0.5);
    if (px > X0 - TW && px < X0 + LW + TW && py > Y0 - TH && py < Y0 + LH + TH) tiles.push(x, y, px, py);
  }
  const dia = (c, px, py, f) => {
    const hw = TW / 2 * f * MS, hh = TH / 2 * f * MS, cx = (px - X0) * MS, cy = (py - Y0) * MS;
    c.moveTo(cx, cy - hh); c.lineTo(cx + hw, cy); c.lineTo(cx, cy + hh); c.lineTo(cx - hw, cy); c.closePath();
  };
  const mask = (types, cut, blur) => {
    c0.globalCompositeOperation = 'source-over'; c0.clearRect(0, 0, mw, mh); c0.fillStyle = '#fff'; c0.beginPath();
    for (let k = 0; k < tiles.length; k += 4) if (types.includes(terr[tiles[k] + tiles[k + 1] * N])) dia(c0, tiles[k + 2], tiles[k + 3], 1.08);
    c0.fill();
    if (cut) {
      c0.globalCompositeOperation = 'destination-out'; c0.beginPath();
      for (let k = 0; k < tiles.length; k += 4) if (terr[tiles[k] + tiles[k + 1] * N] === T_WATER) dia(c0, tiles[k + 2], tiles[k + 3], cut);
      c0.fill();
    }
    c1.clearRect(0, 0, mw, mh); c1.filter = `blur(${blur}px)`; c1.drawImage(m0, 0, 0); c1.filter = 'none';
    return m1;
  };
  const layer = (t1, t2, tl) => {
    lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, LW, LH);
    lc.fillStyle = texPat(lc, t1, tl, X0, Y0); lc.fillRect(0, 0, LW, LH);
    if (t2) {
      l2.globalCompositeOperation = 'source-over'; l2.clearRect(0, 0, LW, LH);
      l2.fillStyle = texPat(l2, t2, tl, X0, Y0); l2.fillRect(0, 0, LW, LH);
      l2.globalCompositeOperation = 'destination-in'; l2.drawImage(nzCan, X0 / 16, Y0 / 16, LW / 16, LH / 16, 0, 0, LW, LH);
      lc.drawImage(L2, 0, 0);
    }
  };
  // skládá se do dílku s okrajem, pak se přenese jen vnitřek (bez švů)
  const T = chunkCanvas('T', LW, LH), tc = T.getContext('2d');
  tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, LW, LH);
  const put = (m) => { lc.globalCompositeOperation = 'destination-in'; lc.drawImage(m, 0, 0, LW, LH); tc.drawImage(L, 0, 0); };
  layer('zem_voda1', null, 4); put(mask([T_WATER, T_GRASS, T_DIRT, T_ROCK], 0, 1));
  tc.save(); tc.globalAlpha = 0.45; lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, LW, LH);
  lc.fillStyle = '#9fd6c8'; lc.fillRect(0, 0, LW, LH); put(mask([T_GRASS, T_DIRT, T_ROCK], 0, 7)); tc.restore();
  layer('zem_pisek1', null, 3); put(mask([T_GRASS, T_DIRT, T_ROCK], 1.0, 2));
  layer('zem_hlina1', 'zem_hlina2', 3); put(mask([T_DIRT], 1.55, 3));
  layer('zem_skala1', 'zem_skala2', 3); put(mask([T_ROCK], 1.55, 2.5));
  layer('zem_trava1', 'zem_trava2', 2.5); put(mask([T_GRASS], 1.55, 3));
  tc.save(); tc.globalCompositeOperation = 'source-atop'; tc.drawImage(shCan, X0 / 16, Y0 / 16, LW / 16, LH / 16, 0, 0, LW, LH); tc.restore();
  tctx.clearRect(X0 + CPAD, Y0 + CPAD, CW, CH);
  tctx.drawImage(T, CPAD, CPAD, CW, CH, X0 + CPAD, Y0 + CPAD, CW, CH);
  // cesty v tomto dílku
  for (const k of S.roads) { const [px, py] = iso(k % N + 0.5, Math.floor(k / N) + 0.5); if (px > X0 - 40 && px < X0 + LW + 40 && py > Y0 - 40 && py < Y0 + LH + 40) roadTile(tctx, k % N, Math.floor(k / N)); }
}
// namaluje dílky, které jsou vidět (nejvýš 2 za snímek); nevidělné dokreslí postupně
function paintChunks(x0, y0, x1, y1) {
  let n = 0;
  const a0 = Math.max(0, Math.floor(x0 / CW)), a1 = Math.min(CNX - 1, Math.floor(x1 / CW)), b0 = Math.max(0, Math.floor(y0 / CH)), b1 = Math.min(CNY - 1, Math.floor(y1 / CH));
  for (let j = b0; j <= b1 && n < 3; j++) for (let i = a0; i <= a1 && n < 3; i++) if (!chunkDone[i + j * CNX]) { renderChunk(i, j); n++; }
  if (!n) { const k = chunkDone.indexOf(0); if (k >= 0 && (paintChunks.idle = (paintChunks.idle || 0) + 1) % 6 === 0) renderChunk(k % CNX, Math.floor(k / CNX)); }
}
const TCOL = [[96, 44, 32], [31, 40, 37], [36, 9, 47], [203, 52, 35]];
function tcol(t, x, y, dl) {
  const n = noise(x, y, S.seed + 31, 5) - 0.5, h = hash(x, y, S.seed + 5) - 0.5, c = TCOL[t];
  return `hsl(${c[0] + n * 16},${c[1] + n * 8}%,${c[2] + n * 10 + h * 3 + (dl || 0)}%)`;
}
const tileAt = (x, y) => (x < 0 || y < 0 || x >= N || y >= N) ? -1 : terr[x + y * N];
function drawTile(x, y) {
  if (terrMode === 'textury') return;
  const t = terr[x + y * N], [px, py] = iso(x, y), c = tctx, H = (i) => hash(x, y, i + 100);
  c.save();
  c.beginPath(); c.moveTo(px, py - 0.6); c.lineTo(px + TW / 2 + 0.8, py + TH / 2); c.lineTo(px, py + TH + 0.6); c.lineTo(px - TW / 2 - 0.8, py + TH / 2); c.closePath(); c.clip();
  let deep = 0;
  if (t === T_WATER) deep = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].every(d => { const n = tileAt(x + d[0], y + d[1]); return n < 0 || n === T_WATER; }) ? -5 : 0;
  c.fillStyle = tcol(t, x, y, deep); c.fillRect(px - 34, py - 2, 68, 36);
  // malířské skvrny
  for (let i = 0; i < 7; i++) {
    const r = 5 + H(i * 3 + 2) * 9;
    c.fillStyle = i % 2 ? 'rgba(255,255,200,.06)' : 'rgba(0,0,0,.075)';
    c.beginPath(); c.ellipse(px + (H(i * 3) - 0.5) * 56, py + 16 + (H(i * 3 + 1) - 0.5) * 26, r, r * 0.5, 0, 0, 7); c.fill();
  }
  // přechody k sousedům: mělčina, písek na břehu, tráva přerůstá hlínu a skálu
  const E = [[1, 0, 32, 16, 0, 32], [0, 1, 0, 32, -32, 16], [-1, 0, -32, 16, 0, 0], [0, -1, 0, 0, 32, 16]];
  for (const [dx, dy, ax, ay, bx, by] of E) {
    const nt = tileAt(x + dx, y + dy); if (nt < 0 || nt === t) continue;
    let col, depth;
    if (t === T_WATER) { col = 'hsla(188,48%,50%,.5)'; depth = 9; }
    else if (nt === T_WATER) { col = 'hsla(42,46%,60%,.92)'; depth = 6.5; }
    else if (nt === T_GRASS) { col = tcol(T_GRASS, x + dx, y + dy); depth = 8; }
    else if (t === T_ROCK && nt === T_DIRT) { col = tcol(T_DIRT, x + dx, y + dy); depth = 6; }
    else continue;
    c.fillStyle = col;
    for (let i = 0; i <= 7; i++) {
      const k = i / 7, r = depth * (0.55 + hash(x * 7 + i, y * 5 + dx, dy + 77) * 0.9);
      c.beginPath(); c.ellipse(px + ax + (bx - ax) * k, py + ay + (by - ay) * k, r, r * 0.62, 0, 0, 7); c.fill();
    }
    if (nt === T_WATER) { // tmavší mokrý lem těsně u vody
      c.strokeStyle = 'rgba(60,45,20,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + ax, py + ay); c.lineTo(px + bx, py + by); c.stroke();
    }
  }
  // drobnosti
  if (t === T_GRASS) {
    c.lineWidth = 1.1; c.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const gx = px + (H(i * 5 + 30) - 0.5) * 50, gy = py + 16 + (H(i * 5 + 31) - 0.5) * 22;
      c.strokeStyle = i % 3 ? 'rgba(190,225,110,.33)' : 'rgba(15,45,10,.3)';
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx - 1.5, gy - 4); c.moveTo(gx + 1.5, gy); c.lineTo(gx + 2.5, gy - 3.5); c.moveTo(gx + 0.7, gy); c.lineTo(gx + 0.7, gy - 4.5); c.stroke();
    }
    if (H(90) > 0.86) for (let i = 0; i < 4; i++) { c.fillStyle = H(91) > 0.5 ? '#f4efd2' : '#f1cf4a'; c.beginPath(); c.arc(px + (H(i * 2 + 92) - 0.5) * 34, py + 16 + (H(i * 2 + 93) - 0.5) * 14, 1.2, 0, 7); c.fill(); }
  } else if (t === T_DIRT) {
    for (let i = 0; i < 4; i++) {
      const gx = px + (H(i * 4 + 30) - 0.5) * 46, gy = py + 16 + (H(i * 4 + 31) - 0.5) * 20, r = 1.2 + H(i * 4 + 32) * 1.8;
      c.fillStyle = 'rgba(40,28,14,.35)'; c.beginPath(); c.ellipse(gx + 0.6, gy + 0.6, r, r * 0.65, 0, 0, 7); c.fill();
      c.fillStyle = i % 2 ? '#9b9488' : '#b3a58c'; c.beginPath(); c.ellipse(gx, gy, r, r * 0.65, 0, 0, 7); c.fill();
    }
    if (H(60) > 0.6) { c.strokeStyle = 'rgba(120,150,60,.5)'; c.lineWidth = 1; const gx = px + (H(61) - 0.5) * 40, gy = py + 16 + (H(62) - 0.5) * 16; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx - 1.5, gy - 4); c.moveTo(gx + 1, gy); c.lineTo(gx + 2, gy - 3.5); c.stroke(); }
  } else if (t === T_ROCK) {
    for (let i = 0; i < 3; i++) {
      const gx = px + (H(i * 6 + 30) - 0.5) * 44, gy = py + 16 + (H(i * 6 + 31) - 0.5) * 18, w = 6 + H(i * 6 + 32) * 9;
      c.fillStyle = 'rgba(255,255,255,.09)'; c.beginPath(); c.moveTo(gx - w, gy); c.lineTo(gx - w * 0.3, gy - w * 0.45); c.lineTo(gx + w, gy - w * 0.1); c.lineTo(gx + w * 0.4, gy + w * 0.4); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(25,20,15,.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx - w, gy); c.lineTo(gx - w * 0.2, gy + w * 0.15); c.lineTo(gx + w * 0.4, gy + w * 0.4); c.stroke();
    }
    if (H(70) > 0.65) { c.fillStyle = 'rgba(90,125,50,.4)'; c.beginPath(); c.ellipse(px + (H(71) - 0.5) * 36, py + 16 + (H(72) - 0.5) * 14, 6, 3, 0, 0, 7); c.fill(); }
  } else {
    c.strokeStyle = 'rgba(255,255,255,.10)'; c.lineWidth = 1.2; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const gx = px + (H(i * 3 + 30) - 0.5) * 40, gy = py + 8 + H(i * 3 + 31) * 16; c.beginPath(); c.moveTo(gx - 6, gy); c.quadraticCurveTo(gx, gy - 2, gx + 6, gy); c.stroke(); }
  }
  c.restore();
}
function ell(x, y, rx, ry, col) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fillStyle = col; ctx.fill(); }
function poly(pts, col, stroke) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}
const shadow = (x, y, rx) => ell(x, y, rx, rx * 0.42, 'rgba(0,0,0,.25)');

/* obrázky ze složky img/s – když některý chybí, kreslí se původní jednoduchá kresba */
const IMG = {};
['jeskyne', 'ohniste', 'chyse1', 'chyse2', 'chyse3', 'jama1', 'jama2', 'dilna1', 'dilna2', 'drevo1', 'drevo2', 'lom1', 'lom2', 'lovec1', 'lovec2',
 'ryby1', 'ryby2', 'skala1', 'skala2', 'staveniste', 'strom1', 'strom2', 'strom3', 'ker', 'kamen', 'pazourek', 'zver', 'clun',
 'chyse4', 'hrncir1', 'hrncir2', 'sypka1', 'sypka2', 'skolka1', 'skolka2', 'ohrada1', 'ohrada2', 'smeniste1', 'smeniste2',
 'tavirna1', 'tavirna2', 'kovarna1', 'hlina', 'ruda', 'osel', 'hliniste1', 'hliniste2', 'straz1', 'straz2', 'jeskyne_malby', 'hlavni7', ...['p', 'r', 'z', 'l'].flatMap(k => ['ryby1_' + k, 'ryby2_' + k]), 'rybar_lod', 'rybar_lod_nahoru', 'vlk_nahoru', 'medved_nahoru', 'jelen_nahoru', 'osel_nahoru', 'vuz_nahoru', 'kupec_nahoru', 'pocestny_nahoru', 'vlk_chuze', 'vlk_utok', 'vlk_spani', 'medved_chuze', 'medved_beh', 'medved_utok', 'medved_zraneni', 'medved_smrt', 'medved_spani', 'hlavni2', 'hlavni3', 'clovek_chuze', 'clovek_prace', 'jelen_chuze',
 'hlavni4', 'chyse5', 'dilna3', 'smeniste3', 'pila1', 'pila2', 'sklad1', 'mlyn1', 'pekarna1', 'hut1', 'klaster1', 'zelruda',
 'kupec_chuze', 'pocestny_chuze', 'pole_mlade', 'pole_zrale', 'vuz', 'uhli', 'dul_uhli1', 'dul_zelezo1', 'cihelna1', 'ocelarna1', 'strojirna1', 'chyse6', 'hlavni5', 'ropa', 'elektrarna1', 'ropny_vrt1', 'rafinerie1', 'elektro1', 'nadrazi1', 'letiste1', 'chyse7', 'hlavni6', 'hut2', 'drevo3', 'lom3', 'svatyne1', 'svatyne2', 'svatyne3', 'fuze_reaktor1', 'dronport1', 'nanotovarna1', 'robotovarna1', 'vfarma1', 'vytah1', 'chyse8',
 'kupec3_chuze', 'kupec4_chuze', ...[0, 1, 2, 3, 4, 5].flatMap(a => ['chuze', 'seka', 'kope', 'sklizen', 'remeslo'].map(k => 'clovek' + a + '_' + k))].forEach(n => {
  const i = new Image(); i.onload = () => { i.ok = true; }; i.onerror = () => { i.bad = true; }; i.src = 'img/s/' + n + '.png?v=' + GAME_V; IMG[n] = i;
});
// [šířka ve hře, o kolik spodek obrázku přesahuje pod střed dlaždice]
// obrázek hlavní budovy pro každou úroveň (palác se přeskočil, hrad patří do středověku)
const MAIN_LV = [0, 1, 2, 4, 5, 6, 6];
function mainSpr(b) {
  if (b.lvl === 1) return S.research.done.malby && IMG.jeskyne_malby.ok ? 'jeskyne_malby' : 'jeskyne';
  if (b.lvl === 6) return IMG.hlavni7.ok ? 'hlavni7' : 'hlavni6';
  return 'hlavni' + MAIN_LV[b.lvl];
}
// rybářská chata a loděnice: molo vždy směrem k vodě
const FISH_DIR = { '1,0': 'p', '0,1': 'l', '-1,0': 'z', '0,-1': 'r' };   // voda vpravo dole → molo dopředu, vlevo dole → doleva…
function fishSpr(b) {
  if (!b.wdir) { const w = waterNear(b); b.wdir = w ? w.dx + ',' + w.dy : '0,1'; }
  const k = 'ryby' + b.lvl + '_' + (FISH_DIR[b.wdir] || 'p');
  return IMG[k] && IMG[k].ok ? k : 'ryby' + b.lvl;
}
const SPR_B = { jeskyne_malby: [150, 30], hlavni7: [175, 35],
  ryby1_p: [86, 21], ryby1_r: [86, 21], ryby1_z: [86, 21], ryby1_l: [86, 21], ryby2_p: [102, 25], ryby2_r: [102, 25], ryby2_z: [102, 25], ryby2_l: [102, 25], straz1: [76, 19], straz2: [78, 19], hliniste1: [92, 22], hliniste2: [124, 30], jeskyne: [150, 30], ohniste: [46, 12], chyse1: [58, 15], chyse2: [66, 17], chyse3: [72, 19], jama1: [50, 13], jama2: [56, 15],
  dilna1: [70, 18], dilna2: [76, 20], drevo1: [74, 19], drevo2: [80, 20], lom1: [78, 20], lom2: [82, 21], lovec1: [72, 18], lovec2: [80, 20],
  ryby1: [72, 18], ryby2: [86, 22], skala1: [52, 13], skala2: [60, 15],
  chyse4: [74, 19], hrncir1: [84, 21], hrncir2: [94, 23], sypka1: [56, 15], sypka2: [80, 20], skolka1: [84, 21], skolka2: [92, 23],
  ohrada1: [86, 21], ohrada2: [110, 26], smeniste1: [88, 20], smeniste2: [100, 22], tavirna1: [80, 20], tavirna2: [90, 22], kovarna1: [86, 21],
  hlavni2: [150, 30], hlavni3: [165, 33], hlavni4: [180, 36], chyse5: [76, 19], dilna3: [82, 20], smeniste3: [104, 23],
  pila1: [84, 21], pila2: [92, 22], sklad1: [92, 23], mlyn1: [76, 18], pekarna1: [78, 19], hut1: [86, 21], klaster1: [110, 26],
  dul_uhli1: [84, 21], dul_zelezo1: [84, 21], cihelna1: [90, 22], ocelarna1: [104, 25], strojirna1: [104, 25], chyse6: [80, 20], hlavni5: [185, 37],
  elektrarna1: [104, 25], ropny_vrt1: [80, 20], rafinerie1: [104, 25], elektro1: [104, 25], nadrazi1: [96, 23], letiste1: [150, 34], chyse7: [86, 21], hlavni6: [150, 30],
  fuze_reaktor1: [110, 26], dronport1: [96, 23], nanotovarna1: [104, 25], robotovarna1: [104, 25], vfarma1: [70, 17], vytah1: [120, 28], chyse8: [96, 23],
  hut2: [96, 23], drevo3: [88, 22], lom3: [92, 23], svatyne1: [70, 18], svatyne2: [80, 20], svatyne3: [96, 23] };
const SPR_N = { strom: [62, 5], ker: [36, 8], kamen: [46, 10], pazourek: [34, 8] };
// jeden snímek z animačního pásu (snímky vedle sebe, chodidla dole uprostřed)
// snímky jsou čtvercové, takže jejich počet = šířka / výška
function animFrame(name, fi, x, y, hgt, flip) {
  const i = IMG[name]; if (!i || !i.ok) return false;
  const n = Math.max(1, Math.round(i.width / i.height)), fw = i.width / n, dw = fw * hgt / i.height;
  fi = ((fi % n) + n) % n;
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(i, fi * fw, 0, fw, i.height, -dw / 2, y - hgt, dw, hgt); ctx.restore(); }
  else ctx.drawImage(i, fi * fw, 0, fw, i.height, x - dw / 2, y - hgt, dw, hgt);
  return true;
}
// jakou animaci práce má která profese
const JOB_ANIM = { klacky: 'seka', stavba: 'seka', lov: 'seka', kamen: 'kope', pazourek: 'kope', ruda: 'kope', zelruda: 'kope', hlina: 'kope',
  bobule: 'sklizen', pole: 'sklizen', les: 'sklizen', chov: 'sklizen',
  nastroje: 'remeslo', hrncire: 'remeslo', tavici: 'remeslo', kovari: 'remeslo', pilari: 'remeslo', mlynari: 'remeslo', pekari: 'remeslo', hutnici: 'remeslo', lamaci: 'kope', kopaci: 'kope',
  uhli: 'kope', dulnici: 'kope', banici: 'kope', cihlari: 'remeslo', ocelari: 'remeslo', strojari: 'remeslo', energetici: 'remeslo', vrtari: 'remeslo', chemici: 'remeslo', technici: 'remeslo' };
// nejlepší dostupný obrázek: nejdřív pro současný věk, pak pro starší; nakonec původní pravěká sada
// lidé se převléknou, až když se objeví první vynález nového věku (ne hned po přestavbě hlavní budovy)
const CLOTH_TECH = { 1: 'hrncirstvi', 2: 'tesarstvi', 3: 'parni_stroj', 4: 'elektrina', 5: 'fuze' };
function clothAge() { let a = S.age; while (a > 0 && !S.research.done[CLOTH_TECH[a]]) a--; return a; }
// kupec podle doby: středověký, průmyslový obchodník, moderní obchodník (když obrázek chybí, starší)
function traderSheet() {
  if (!S.age) return 'pocestny_chuze';
  const a = clothAge();
  for (const [n, minA] of [['kupec4_chuze', 4], ['kupec3_chuze', 3]]) if (a >= minA && IMG[n] && IMG[n].ok) return n;
  return 'kupec_chuze';
}
function sheet(kind) {
  for (let a = clothAge(); a >= 0; a--) {
    for (const k of kind === 'chuze' ? ['chuze'] : [kind, 'seka']) { const n = 'clovek' + a + '_' + k; if (IMG[n] && IMG[n].ok) return n; }
    if (a === 0) return kind === 'chuze' ? 'clovek_chuze' : 'clovek_prace';
  }
  return 'clovek_chuze';
}
function personSprite(p, x, y, d, T, band) {
  const out = '#2e1d0c';
  if (band) { ctx.beginPath(); ctx.ellipse(x, y, 7.5, 3.4, 0, 0, 7); ctx.fillStyle = band; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = out; ctx.lineWidth = 0.8; ctx.stroke(); }
  if (p.carry) {
    const r = Object.keys(p.carry)[0], cc = RCOL[r] ? { [r]: RCOL[r] } : { klacky: '#8a5a2b', kamen: '#a09c92', pazourek: '#46525f', bobule: '#c2203f', maso: '#b0503c', ryby: '#9fc4d8', obili: '#d9b93a', hlina: '#8a4a2a', ruda: '#3f9a7a' }[r] || '#888';
    ctx.fillStyle = cc; ctx.strokeStyle = out; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(x - d * 5, y - 21, 4.2, 5, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  const H = 34, flip = d < 0;
  // nové sady (clovek0_…, clovek1_…) mají postavu v políčku 170 bodů vysokou asi 133 bodů – proto větší měřítko
  const hs = n => /^clovek[45]_/.test(n) ? 47 : /^clovek[12]_/.test(n) ? 49 : /^clovek3_/.test(n) ? 45 : /^clovek\d_/.test(n) ? 42 : H;   // výška políčka podle velikosti postavy v sadě
  let sn;
  if (p.mv) { sn = sheet('chuze'); animFrame(sn, Math.floor((p.wd || 0) / 0.085), x, y + 1, hs(sn), flip); }
  else if (p.act && !p.fishing) { sn = sheet(JOB_ANIM[p.job] || 'seka'); animFrame(sn, Math.floor(T * 5 + p.id * 0.5), x, y + 1, hs(sn) * (sn === 'clovek_prace' ? 1.02 : 1), flip); }
  else { sn = sheet('chuze'); animFrame(sn, 0, x, y + 1, hs(sn), flip); }
  if (p.fishing) {
    ctx.strokeStyle = '#4a321c'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x + d * 5, y - 18); ctx.lineTo(x + d * 18, y - 32); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x + d * 18, y - 32); ctx.lineTo(x + d * 19, y + 1 + Math.sin(T * 3 + p.id) * 1.4); ctx.stroke();
  }
  if (S.cold) { ctx.fillStyle = 'rgba(170,215,255,.95)'; ctx.font = '9px Georgia'; ctx.textAlign = 'center'; ctx.fillText('❄', x, y - 38); }
  hpBar(p, x, y - 44);
  p.act = false;
}
function spr(name, x, y, w, dy, flip) {
  const i = IMG[name]; if (!i || !i.ok) return false;
  const hh = w * i.height / i.width;
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(i, -w / 2, y + dy - hh, w, hh); ctx.restore(); }
  else ctx.drawImage(i, x - w / 2, y + dy - hh, w, hh);
  return true;
}
function drawFlames(x, y, T) {
  for (let i = 0; i < 3; i++) {
    const f = Math.sin(T * (7 + i * 2.3) + i) * 2.5, hgt = 22 - i * 5 + f;
    poly([x - 8 + i * 2.7, y, x + f * 0.6, y - hgt, x + 8 - i * 2.7, y], ['#e2551a', '#f59a1d', '#ffe36b'][i]);
  }
  for (let i = 0; i < 3; i++) { const k = (T * 0.4 + i / 3) % 1; ell(x + Math.sin(T + i * 2) * 4, y - 24 - k * 34, 3 + k * 5, 3 + k * 5, `rgba(200,200,200,${0.22 * (1 - k)})`); }
}

function drawNode(n, T) {
  const [x, y] = iso(n.x + 0.5, n.y + 0.5), h = hash(n.x, n.y, 3), full = n.amt / NODE[n.t].max;
  if (n.t === 'hlina') {
    const k = 0.6 + 0.4 * full;
    if (spr('hlina', x, y, 46 * k, 9 * k, hash(n.x, n.y, 10) > 0.5)) return;
    ell(x, y + 2, 19 * k, 8.5 * k, '#5e3820'); ell(x - 1, y + 1, 15 * k, 6 * k, '#8a5232');
    ell(x + 5 * k, y + 2, 6 * k, 2.4 * k, 'rgba(130,170,200,.55)'); ell(x - 8 * k, y - 1, 4, 2.2, '#a5653d'); ell(x - 3, y - 2, 3, 1.6, '#b0714a');
    return;
  }
  if (n.t === 'ropa') {
    if (IMG.ropa && IMG.ropa.ok) { spr('ropa', x, y, 46, 9, hash(n.x, n.y, 10) > 0.5); return; }
    ell(x, y + 2, 17, 7.5, '#1a1a1e'); ell(x - 2, y + 1, 12, 5, '#0a0a0c');
    ell(x + 3, y, 5, 1.8, `rgba(120,80,200,${0.35 + 0.15 * Math.sin(T * 2)})`); ell(x - 5, y + 2, 3.5, 1.2, 'rgba(80,200,180,.3)');
    return;
  }
  if (n.t === 'uhli') {
    const k = 0.75 + 0.25 * full;
    if (IMG.uhli && IMG.uhli.ok) { shadow(x, y + 3, 15 * k); spr('uhli', x, y, 48 * k, 9 * k, hash(n.x, n.y, 10) > 0.5); return; }
    shadow(x, y + 3, 16 * k);
    poly([x - 16 * k, y + 4, x - 12 * k, y - 8 * k, x - 2, y - 13 * k, x + 12 * k, y - 8 * k, x + 16 * k, y + 4, x, y + 8], '#26262a', '#0e0e10');
    poly([x - 2, y - 13 * k, x + 12 * k, y - 8 * k, x + 16 * k, y + 4, x + 2, y + 3], '#1a1a1d');
    for (let i = 0; i < 6; i++) ell(x - 10 * k + hash(n.x, n.y, i + 50) * 22 * k, y - 9 * k + hash(n.x, n.y, i + 60) * 13 * k, 2.6, 1.6, i % 2 ? '#3a3a40' : '#121214');
    ell(x - 5 * k, y - 9 * k, 1.6, 1, 'rgba(200,210,230,.6)'); ell(x + 6 * k, y - 4 * k, 1.3, 0.8, 'rgba(200,210,230,.5)');
    return;
  }
  if (n.t === 'zelruda') {
    const k = 0.7 + 0.3 * full;
    if (IMG.zelruda.ok) { shadow(x, y + 3, 14 * k); spr('zelruda', x, y, 44 * k, 9 * k, hash(n.x, n.y, 10) > 0.5); return; }
    shadow(x, y + 3, 14 * k);
    poly([x - 14 * k, y + 3, x - 11 * k, y - 11 * k, x, y - 15 * k, x + 13 * k, y - 7 * k, x + 15 * k, y + 4, x, y + 7], '#5e5650', '#2e2a26');
    poly([x, y - 15 * k, x + 13 * k, y - 7 * k, x + 15 * k, y + 4, x + 2, y + 2], '#4c4540');
    for (let i = 0; i < 6; i++) ell(x - 9 * k + hash(n.x, n.y, i + 50) * 20 * k, y - 10 * k + hash(n.x, n.y, i + 60) * 13 * k, 2.6, 1.5, i % 2 ? '#9a4a2a' : '#7a3a20');
    return;
  }
  if (n.t === 'ruda') {
    const k = 0.7 + 0.3 * full;
    if (IMG.ruda.ok) { shadow(x, y + 3, 14 * k); spr('ruda', x, y, 44 * k, 9 * k, hash(n.x, n.y, 10) > 0.5); return; }
    shadow(x, y + 3, 14 * k);
    poly([x - 14 * k, y + 3, x - 10 * k, y - 10 * k, x + 1, y - 14 * k, x + 13 * k, y - 6 * k, x + 15 * k, y + 4, x, y + 7], '#7d7a72', '#45423c');
    poly([x + 1, y - 14 * k, x + 13 * k, y - 6 * k, x + 15 * k, y + 4, x + 2, y + 2], '#68655e');
    for (let i = 0; i < 5; i++) ell(x - 9 * k + hash(n.x, n.y, i + 50) * 20 * k, y - 9 * k + hash(n.x, n.y, i + 60) * 12 * k, 2.4, 1.6, i % 2 ? '#3fae8a' : '#2f8a6a');
    ell(x - 4 * k, y - 8 * k, 1.2, 1, '#9be8cc');
    return;
  }
  if (n.t === 'zver' && IMG.zver.ok) {
    const k = Math.min(3, Math.ceil(full * 3));
    for (let i = 0; i < k; i++) {
      // jelen obchází kolečko kolem místa, chvíli rychleji, chvíli skoro stojí a pase se; krok odpovídá ušlé dráze
      const tt = T * 0.5 + i * 2.1 + h * 6, a = 2 * (tt + 0.8 * Math.sin(tt)), R = 14, ph = a + Math.PI / 2;
      const X = x + Math.cos(a) * R + (i - 1) * 10, Y = y + Math.sin(a) * R * 0.5 + (i % 2) * 4;
      shadow(X, Y + 1, 8);
      const up = Math.cos(a) < -0.35 && IMG.jelen_nahoru.ok;   // běží od nás – pohled zezadu
      if (up) animFrame('jelen_nahoru', Math.floor(a * R * 0.8 / 3), X, Y + 2, 30, Math.sin(a) > 0);
      else if (!animFrame('jelen_chuze', Math.floor(a * R * 0.8 / 3), X, Y + 2, 27, Math.sin(a) > 0)) spr('zver', X, Y, 24, 2, Math.sin(a) < 0);
    }
    return;
  }
  if (SPR_N[n.t]) {
    const c = SPR_N[n.t], sc = n.t === 'strom' ? 0.82 + hash(n.x, n.y, 8) * 0.4 : 0.9 + h * 0.2, name = n.t === 'strom' ? 'strom' + (1 + Math.floor(hash(n.x, n.y, 9) * 3)) : n.t;
    const sy = n.young ? 0.3 + 0.7 * n.amt / NODE.strom.max : 1;
    if (IMG[name] && IMG[name].ok) { shadow(x, y + 2, c[0] * sc * sy * 0.3); spr(name, x, y, c[0] * sc * sy, c[1] * sc * sy, hash(n.x, n.y, 10) > 0.5); return; }
  }
  if (n.t === 'strom') {
    const s = 0.85 + h * 0.4;
    shadow(x, y + 2, 15 * s);
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 2.5 * s, y - 22 * s, 5 * s, 24 * s);
    const g = full > 0.3 ? 0 : 8;
    ell(x - 7 * s, y - 26 * s, 11 * s, 10 * s, `hsl(${112 - g * 4},38%,${22 + h * 5}%)`);
    ell(x + 7 * s, y - 28 * s, 11 * s, 10 * s, `hsl(${116 - g * 4},40%,${25 + h * 5}%)`);
    ell(x, y - 38 * s, 12 * s, 12 * s, `hsl(${108 - g * 4},42%,${30 + h * 5}%)`);
    ell(x - 3 * s, y - 42 * s, 5 * s, 4 * s, 'rgba(255,255,200,.13)');
  } else if (n.t === 'ker') {
    shadow(x, y + 2, 12);
    ell(x - 5, y - 4, 8, 6.5, '#2f5a22'); ell(x + 5, y - 5, 8, 7, '#376a28'); ell(x, y - 9, 8, 6.5, '#3f7a2e');
    const k = Math.ceil(full * 7);
    for (let i = 0; i < k; i++) ell(x - 9 + hash(n.x, n.y, i + 20) * 18, y - 12 + hash(n.x, n.y, i + 40) * 10, 1.7, 1.7, '#c2203f');
  } else if (n.t === 'kamen') {
    shadow(x, y + 3, 15);
    poly([x - 14, y + 2, x - 10, y - 9, x - 1, y - 12, x + 4, y + 1], '#8b8880', '#5f5c55');
    poly([x - 2, y + 4, x + 3, y - 7, x + 12, y - 5, x + 15, y + 4], '#a09c92', '#5f5c55');
    if (full > 0.4) poly([x - 7, y + 6, x - 4, y, x + 3, y + 1, x + 4, y + 7], '#77746c', '#55524c');
  } else if (n.t === 'pazourek') {
    shadow(x, y + 3, 11);
    poly([x - 9, y + 3, x - 5, y - 8, x, y + 3], '#2c333d', '#11151a');
    poly([x - 2, y + 4, x + 3, y - 11, x + 8, y + 4], '#3a4553', '#11151a');
    poly([x + 3, y - 11, x + 4.5, y - 3, x + 2, y + 2], '#8fa3b8');
    poly([x + 5, y + 5, x + 9, y - 3, x + 12, y + 5], '#252b33', '#11151a');
  } else if (n.t === 'zver') {
    const k = Math.min(3, Math.ceil(full * 3));
    for (let i = 0; i < k; i++) {
      const ox = Math.sin(T * 0.3 + i * 2.1 + h * 6) * 9 + (i - 1) * 13, oy = Math.cos(T * 0.23 + i * 1.7) * 3 + (i % 2) * 5;
      const X = x + ox, Y = y + oy, d = Math.cos(T * 0.3 + i * 2.1 + h * 6) > 0 ? 1 : -1;
      shadow(X, Y + 1, 8);
      ctx.fillStyle = '#5a3d22'; ctx.fillRect(X - 5, Y - 6, 1.6, 7); ctx.fillRect(X + 4, Y - 6, 1.6, 7);
      ell(X, Y - 9, 7.5, 4.2, '#8a5f35'); ell(X + d * 8, Y - 13, 3, 2.6, '#8a5f35');
      ctx.strokeStyle = '#d9c9a0'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(X + d * 8, Y - 15); ctx.lineTo(X + d * 6, Y - 20); ctx.moveTo(X + d * 9, Y - 15); ctx.lineTo(X + d * 11, Y - 20); ctx.stroke();
    }
  }
}
function drawTraderUp(p, T) {
  const [x, y] = iso(p.x, p.y), sg = p.msx >= 0 ? 1 : -1, fl = p.msx < 0, f = Math.floor((p.wd || 0) / 0.085);
  const sheet = S.age ? 'kupec_nahoru' : 'pocestny_nahoru';
  if (!IMG[sheet].ok) return false;
  shadow(x, y, 6.5);
  animFrame(sheet, f, x, y + 1, 33, fl);
  if (S.age) { shadow(x - sg * 11, y + 14, 10); animFrame('osel_nahoru', f, x - sg * 11, y + 16, 31, fl); }
  if (S.age >= 2 && S.research.done.cesty) { shadow(x - sg * 30, y + 42, 13); animFrame('vuz_nahoru', Math.floor(f / 2), x - sg * 30, y + 45, 36, fl); }
  return true;
}
function drawPerson(p, T, trader) {
  const [x, y] = iso(p.x, p.y), d = p.dir || 1;
  if (trader && S.age < 4 && p.mv && p.msy < 0 && Math.abs(p.msy) > 0.4 * Math.abs(p.msx) && drawTraderUp(p, T)) return;
  if (trader && S.age >= 4) drawTruck(x - d * 22, y - 2, d);
  else {
    if (trader && S.age >= 2 && S.research.done.cesty) drawCart(x - d * 32, y - 2, d);
    if (trader && S.age) drawDonkey(x - d * 15, y - 3, d, T, p.mv);
  }
  const walk = p.mv ? Math.sin(T * 9 + p.id) : 0, work = (!p.mv && p.act) ? Math.sin(T * 7 + p.id) : 0, bob = p.mv ? Math.abs(walk) * 1.2 : 0;
  const skin = ['#e0ad7f', '#cf9565', '#b87e4e'][p.skin || 0], hair = ['#2b1d0e', '#4a321c', '#6e4a26'][p.id % 3], out = '#2e1d0c';
  const band = trader ? '#c9a23a' : (p.job ? JOBS[p.job].color : null), job = trader ? 'trader' : p.job;
  if (p.boat && IMG.rybar_lod.ok) {
    const bob2 = Math.sin(T * 2 + p.id) * 1.2;
    ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 5, 19 + Math.sin(T * 3 + p.id), 4, 0, 0, 7); ctx.fill();
    if (selP.has(p.id)) { ctx.beginPath(); ctx.ellipse(x, y + 4, 20, 6, 0, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke(); }
    // člun leží na obrázku šikmo (vlevo dole – vpravo nahoře); natočí se tak, aby plul po své délce
    if (p.msy < 0 && IMG.rybar_lod_nahoru.ok) animFrame('rybar_lod_nahoru', 0, x, y + 7 + bob2, 42, p.msx < 0);   // pluje od nás: pohled zezadu
    else animFrame('rybar_lod', 0, x, y + 7 + bob2, 42, p.msx === undefined ? d > 0 : p.msx >= 0);
    hpBar(p, x, y - 40);
    return;
  }
  if (p.boat) { if (!spr('clun', x, y, 36, 8)) poly([x - 13, y - 3, x + 13, y - 3, x + 9, y + 4, x - 9, y + 4], '#7a5a34', '#3f2a14'); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 15, y + 5, 30, 1.2); }
  else shadow(x, y, 6.5);
  if (!trader && selP.has(p.id)) { ctx.beginPath(); ctx.ellipse(x, y, 10, 5, 0, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke(); }
  if (!trader && IMG.clovek_chuze.ok && IMG.clovek_prace.ok) { personSprite(p, x, y - (p.boat ? 3 : 0), d, T, band); return; }
  if (trader && animFrame(traderSheet(), p.mv ? Math.floor((p.wd || 0) / 0.085) : 0, x, y + 1, 35, d < 0)) {
    if (p.st === 'wait') {
      const yy = y - 44 + Math.sin(T * 3) * 2;
      ell(x, yy, 6.5, 6.5, '#ffe08a'); ctx.strokeStyle = out; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, yy, 6.5, 0, 7); ctx.stroke();
      ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 10px Georgia'; ctx.textAlign = 'center'; ctx.fillText('!', x, yy + 3.5);
    }
    return;
  }
  ctx.save(); ctx.translate(x, y - (p.boat ? 3 : 0)); ctx.scale(1.18, 1.18); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const b = -bob;
  const limb = (x0, y0, x1, y1, w, col) => { ctx.strokeStyle = out; ctx.lineWidth = w + 1.4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  // náklad na zádech
  if (p.carry && !trader) {
    const r = Object.keys(p.carry)[0], cc = RCOL[r] ? { [r]: RCOL[r] } : { klacky: '#8a5a2b', kamen: '#a09c92', pazourek: '#46525f', bobule: '#c2203f', maso: '#b0503c', ryby: '#9fc4d8', obili: '#d9b93a', hlina: '#8a4a2a', ruda: '#3f9a7a' }[r] || '#888';
    ctx.fillStyle = cc; ctx.strokeStyle = out; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(-d * 4.2, b - 14, 3.6, 4.4, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  if (trader) { ctx.fillStyle = '#8a6a3a'; ctx.strokeStyle = out; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(-d * 4.6, b - 13, 4.4, 5.6, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  // zadní ruka
  limb(-d * 2.8, b - 15.5, -d * 3.6 - walk * 2.4, b - 9.5, 1.9, skin);
  // nohy
  if (!p.boat) { limb(-1.6, b - 8, -1.6 + walk * 3, -0.6, 2.2, skin); limb(1.6, b - 8, 1.6 - walk * 3, -0.6, 2.2, skin); }
  // tělo: kožená halena
  ctx.fillStyle = trader ? '#6a3f8f' : ['#a8794a', '#96683c', '#b58a58'][p.id % 3]; ctx.strokeStyle = out; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-4.3, b - 7); ctx.lineTo(-3.5, b - 17); ctx.lineTo(3.5, b - 17); ctx.lineTo(4.3, b - 7); ctx.lineTo(1.5, b - 6); ctx.lineTo(-1, b - 7.4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-d * 3.2 - 0.8, b - 16.4, 1.8, 8.5);
  if (band) { ctx.fillStyle = band; ctx.fillRect(-4, b - 11.4, 8, 2.1); ctx.strokeStyle = out; ctx.lineWidth = 0.5; ctx.strokeRect(-4, b - 11.4, 8, 2.1); }
  // hlava a vlasy
  ctx.fillStyle = skin; ctx.strokeStyle = out; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(0, b - 20.6, 3.4, 3.7, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(-d * 0.6, b - 21.8, 3.8, 3.2, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-d * 2.6, b - 20.2, 1.6, 3.2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = out; ctx.fillRect(d * 1.5 - 0.4, b - 20.8, 0.9, 0.9);
  // přední ruka s nářadím
  let hx = d * 3.8 + walk * 2.4, hy = b - 9.5;
  const tool = { klacky: 'axe', kamen: 'stone', pazourek: 'stone', nastroje: 'stone', lov: 'spear', pole: 'hoe', stavba: 'axe', bobule: 'basket', trader: 'staff', hlina: 'hoe', ruda: 'axe', les: 'hoe', chov: 'staff', hrncire: 'stone', tavici: 'stone', kovari: 'axe' }[job];
  if (work && tool && tool !== 'basket' && tool !== 'spear') { hx = d * (5.5 + work * 1.5); hy = b - 13.5 - work * 4.5; }
  if (p.fishing) { hx = d * 5; hy = b - 13; }
  limb(d * 2.8, b - 15.5, hx, hy, 1.9, skin);
  ctx.lineWidth = 1.3; ctx.strokeStyle = '#4a321c';
  if (p.fishing) {
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + d * 11, hy - 11); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(hx + d * 11, hy - 11); ctx.lineTo(hx + d * 12, b + 1 + Math.sin(T * 3 + p.id) * 1.4); ctx.stroke();
  } else if (tool === 'axe' || tool === 'hoe') {
    const a = work ? work * 0.9 : 0, tx = hx + d * Math.sin(0.5 + a) * 8, ty = hy - Math.cos(0.5 + a) * 8;
    ctx.beginPath(); ctx.moveTo(hx - d * 1, hy + 2); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = tool === 'axe' ? '#8f8b82' : '#5b3a1c'; ctx.strokeStyle = out; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.ellipse(tx + d * 1.2, ty + 0.6, tool === 'axe' ? 2.4 : 2.8, 1.5, d * 0.6, 0, 7); ctx.fill(); ctx.stroke();
  } else if (tool === 'stone') {
    ctx.fillStyle = '#8f8b82'; ctx.strokeStyle = out; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(hx + d * 0.6, hy - 1, 2.1, 1.8, 0, 0, 7); ctx.fill(); ctx.stroke();
  } else if (tool === 'spear' || tool === 'staff') {
    ctx.beginPath(); ctx.moveTo(hx, 0); ctx.lineTo(hx + d * 1.2, b - 27); ctx.stroke();
    if (tool === 'spear') { ctx.fillStyle = '#9aa3ad'; ctx.strokeStyle = out; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(hx + d * 1.2 - 1.6, b - 26.5); ctx.lineTo(hx + d * 1.4, b - 31.5); ctx.lineTo(hx + d * 1.2 + 1.6, b - 26.5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  } else if (tool === 'basket') {
    ctx.fillStyle = '#b08a4a'; ctx.strokeStyle = out; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(hx + d * 0.5, hy + 1.6, 3, 2.3, 0, 0, Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c2203f'; ctx.fillRect(hx + d * 0.5 - 2, hy + 0.6, 4, 1.1);
  }
  ctx.restore(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  if (trader && p.st === 'wait') {
    const yy = y - 38 + Math.sin(T * 3) * 2;
    ell(x, yy, 6.5, 6.5, '#ffe08a'); ctx.strokeStyle = out; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, yy, 6.5, 0, 7); ctx.stroke();
    ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 10px Georgia'; ctx.textAlign = 'center'; ctx.fillText('!', x, yy + 3.5);
  }
  if (S.cold && !trader) { ctx.fillStyle = 'rgba(170,215,255,.95)'; ctx.font = '9px Georgia'; ctx.textAlign = 'center'; ctx.fillText('❄', x, y - 31 - bob); }
  if (!trader) hpBar(p, x, y - 36);
  p.act = false;
}
function drawBld(b, T) {
  const [x, y] = iso(b.x + 0.5, b.y + 0.5);
  const key = b.type === 'jeskyne' ? mainSpr(b) : b.type === 'ryby' ? fishSpr(b) : SPR_B[b.type] ? b.type : b.type + b.lvl, sc = SPR_B[key];
  if (sc && IMG[key] && IMG[key].ok) {
    if (b.id === selId) diamond(b.x, b.y, 'rgba(255,230,120,.9)', 'rgba(255,230,120,.25)');
    if (b.type !== 'jama' && b.type !== 'ohniste') shadow(x, y + 4, sc[0] * 0.36);
    spr(key, x, y, sc[0], sc[1]);
    if (b.type === 'ohniste' && S.fire.lit) drawFlames(x, y - 3, T);
    if (b.type === 'vytah') {   // lano až na oběžnou dráhu a stoupající kabina
      const hh = sc[0] * IMG[key].height / IMG[key].width, top = y + sc[1] - hh * 0.97;
      ctx.strokeStyle = 'rgba(200,220,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top - 1400); ctx.stroke();
      const k = (T * 0.05) % 1; isoBox(x, top - 10 - k * 900, 5, 8, '#f0c040', '#c09020', '#ffe080');
    }
    if (b.type === 'mlyn') { const hh = sc[0] * IMG[key].height / IMG[key].width; drawSails(x - sc[0] * 0.01, y + sc[1] - hh * 0.7, T, sc[0] * 0.42); }
    if (b.type === 'tavirna' || b.type === 'hut') {   // kouř z pece
      const hh = sc[0] * IMG[key].height / IMG[key].width, cx = x - sc[0] * (b.type === 'hut' ? 0.11 : b.lvl > 1 ? 0.2 : 0.08), cy = y + sc[1] - hh * 0.97;
      for (let i = 0; i < 3; i++) { const k = (T * 0.35 + i / 3) % 1; ell(cx + Math.sin(T + i * 2) * 3, cy - k * 34, 3 + k * 6, 3 + k * 6, `rgba(90,90,90,${0.3 * (1 - k)})`); }
    }
    return;
  }
  if (drawBld2(b, T, x, y)) return;
  if (b.type === 'jeskyne') {
    poly([x - 58, y + 8, x - 50, y - 30, x - 26, y - 58, x + 4, y - 68, x + 34, y - 52, x + 54, y - 22, x + 58, y + 8, x, y + 22], '#6f6a62', '#3f3b35');
    poly([x - 26, y - 58, x + 4, y - 68, x + 34, y - 52, x + 10, y - 44, x - 14, y - 46], '#8a857b');
    poly([x - 50, y - 30, x - 26, y - 58, x - 14, y - 46, x - 30, y - 18], '#7c776e');
    ctx.beginPath(); ctx.moveTo(x - 18, y + 14); ctx.quadraticCurveTo(x - 20, y - 26, x, y - 28); ctx.quadraticCurveTo(x + 20, y - 26, x + 18, y + 14); ctx.closePath();
    ctx.fillStyle = '#17120d'; ctx.fill();
  } else if (b.type === 'ohniste') {
    shadow(x, y + 2, 16);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ell(x + Math.cos(a) * 12, y + Math.sin(a) * 5.5, 3.2, 2.4, i % 2 ? '#8b8880' : '#a09c92'); }
    ctx.strokeStyle = '#4a2c12'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 8, y + 2); ctx.lineTo(x + 7, y - 3); ctx.moveTo(x - 7, y - 3); ctx.lineTo(x + 8, y + 2); ctx.stroke();
    if (S.fire.lit) {
      for (let i = 0; i < 3; i++) {
        const f = Math.sin(T * (7 + i * 2.3) + i) * 2.5, hgt = 20 - i * 5 + f;
        poly([x - 7 + i * 2.5, y, x + f * 0.6, y - hgt, x + 7 - i * 2.5, y], ['#e2551a', '#f59a1d', '#ffe36b'][i]);
      }
      for (let i = 0; i < 3; i++) { const k = (T * 0.4 + i / 3) % 1; ell(x + Math.sin(T + i * 2) * 4, y - 22 - k * 34, 3 + k * 5, 3 + k * 5, `rgba(200,200,200,${0.22 * (1 - k)})`); }
    } else ell(x, y - 1, 6, 2.6, '#2a2a2a');
  } else if (b.type === 'chyse') {
    shadow(x, y + 4, 24);
    if (b.lvl === 1) {
      poly([x - 20, y + 6, x, y - 34, x + 20, y + 6, x, y + 14], '#8a6a3a', '#4a321c');
      poly([x, y - 34, x + 20, y + 6, x, y + 14], '#6f5430');
      ctx.strokeStyle = '#4a321c'; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(x + i * 1.5, y - 38); ctx.lineTo(x + i * 7, y + 8); } ctx.stroke();
      poly([x - 12, y + 9, x - 8, y - 6, x - 3, y + 12], '#1c140b');
    } else if (b.lvl === 2) {
      poly([x - 24, y + 6, x - 6, y - 36, x + 6, y - 36, x + 24, y + 6, x, y + 16], '#b08a5a', '#4a321c');
      poly([x + 6, y - 36, x + 24, y + 6, x, y + 16, x, y - 36], '#8e6c42');
      ell(x - 12, y - 8, 5, 6, '#9c7648'); ell(x + 10, y - 14, 4, 5, '#7a5a36');
      ctx.strokeStyle = '#4a321c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 8, y - 42); ctx.lineTo(x + 4, y - 30); ctx.moveTo(x + 8, y - 42); ctx.lineTo(x - 4, y - 30); ctx.stroke();
      poly([x - 14, y + 10, x - 10, y - 8, x - 4, y + 13], '#1c140b');
    } else {
      poly([x - 26, y + 4, x - 26, y - 10, x, y - 2, x, y + 16], '#8b8880', '#55524c');
      poly([x + 26, y + 4, x + 26, y - 10, x, y - 2, x, y + 16], '#77746c', '#55524c');
      poly([x - 30, y - 9, x, y - 44, x + 30, y - 9, x, y + 2], '#c9a54e', '#6b5320');
      poly([x, y - 44, x + 30, y - 9, x, y + 2], '#a8873a');
      poly([x - 16, y + 9, x - 16, y - 4, x - 8, y - 1, x - 8, y + 13], '#1c140b');
    }
  } else if (b.type === 'jama') {
    ell(x, y, 20, 9.5, '#5a452a'); ell(x, y + 1, 15, 6.5, '#1c140b');
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; ell(x + Math.cos(a) * 19, y + Math.sin(a) * 9, 3.4, 2.5, i % 2 ? '#8b8880' : '#a09c92'); }
    ctx.strokeStyle = '#7a4d22'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = -2; i <= (b.lvl > 1 ? 2 : 0); i++) { ctx.moveTo(x - 14 + i * 2, y - 3 + i * 2.2); ctx.lineTo(x + 12 + i * 2, y - 5 + i * 2.2); } ctx.stroke();
  } else if (b.type === 'dilna') {
    shadow(x, y + 4, 24);
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 21, y - 22, 3, 28); ctx.fillRect(x + 18, y - 16, 3, 26); ctx.fillRect(x - 2, y - 30, 3, 14);
    poly([x - 25, y - 20, x, y - 34, x + 25, y - 14, x, y - 2], b.lvl > 1 ? '#b08a5a' : '#9a8a4a', '#4a321c');
    poly([x - 6, y + 10, x - 6, y + 2, x + 6, y, x + 6, y + 8], '#8b8880', '#55524c');
    poly([x + 8, y + 12, x + 11, y + 5, x + 14, y + 12], '#3a4553');
  } else if (b.type === 'drevo') {
    shadow(x, y + 4, 26);
    poly([x - 22, y + 4, x - 22, y - 12, x, y - 4, x, y + 14], '#7a5a34', '#3f2a14');
    poly([x + 22, y + 4, x + 22, y - 12, x, y - 4, x, y + 14], '#64482a', '#3f2a14');
    ctx.strokeStyle = '#3f2a14'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 4; i++) { ctx.moveTo(x - 22, y - 12 + i * 4); ctx.lineTo(x, y - 4 + i * 4.5); ctx.lineTo(x + 22, y - 12 + i * 4); } ctx.stroke();
    poly([x - 26, y - 11, x, y - 36, x + 26, y - 11, x, y - 2], b.lvl > 1 ? '#b08a5a' : '#8f7a44', '#4a321c');
    poly([x, y - 36, x + 26, y - 11, x, y - 2], b.lvl > 1 ? '#8e6c42' : '#74622f');
    poly([x - 14, y + 8, x - 14, y - 3, x - 7, y, x - 7, y + 11], '#1c140b');
    for (let i = 0; i < (b.lvl > 1 ? 5 : 3); i++) { const lx = x + 20 + (i % 3) * 6 - (i > 2 ? 3 : 0), ly = y + 12 - (i > 2 ? 5 : 0); ell(lx, ly, 3, 3, '#a9793f'); ell(lx, ly, 1.3, 1.3, '#6b4722'); }
  } else if (b.type === 'lom') {
    ell(x, y + 2, 26, 12, '#6b665e');
    poly([x - 24, y, x - 20, y - 16, x - 6, y - 24, x + 8, y - 20, x + 4, y - 4, x - 10, y + 4], '#8b8880', '#55524c');
    poly([x + 8, y - 20, x + 22, y - 10, x + 24, y + 2, x + 4, y - 4], '#77746c', '#55524c');
    ell(x + 2, y + 4, 13, 5.5, '#3d3a35');
    poly([x - 18, y + 12, x - 18, y + 6, x - 10, y + 4, x - 10, y + 10], '#a09c92', '#55524c');
    poly([x + 10, y + 13, x + 13, y + 5, x + 17, y + 13], '#3a4553', '#11151a');
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x + 20, y - 26, 2.5, 26); ctx.fillRect(x + 12, y - 27, 14, 2.5);
    if (b.lvl > 1) { ctx.fillRect(x - 26, y - 22, 2.5, 22); poly([x - 6, y + 14, x - 6, y + 8, x + 2, y + 6, x + 2, y + 12], '#8b8880', '#55524c'); }
  } else if (b.type === 'lovec') {
    shadow(x, y + 4, 24);
    poly([x - 22, y + 6, x - 4, y - 34, x + 4, y - 34, x + 22, y + 6, x, y + 15], b.lvl > 1 ? '#a8794a' : '#96703f', '#4a321c');
    poly([x + 4, y - 34, x + 22, y + 6, x, y + 15, x, y - 34], '#7a5a33');
    poly([x - 12, y + 10, x - 8, y - 8, x - 3, y + 13], '#1c140b');
    ctx.strokeStyle = '#e6d9b8'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(x, y - 34); ctx.lineTo(x - 7, y - 44); ctx.moveTo(x - 4, y - 39); ctx.lineTo(x - 9, y - 38);
    ctx.moveTo(x, y - 34); ctx.lineTo(x + 7, y - 44); ctx.moveTo(x + 4, y - 39); ctx.lineTo(x + 9, y - 38); ctx.stroke();
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x + 16, y - 8, 2, 20); ctx.fillRect(x + 30, y - 4, 2, 20); ctx.fillRect(x + 16, y - 8, 16, 2);
    poly([x + 19, y - 6, x + 29, y - 4, x + 28, y + 8, x + 20, y + 6], '#8a5f35', '#4a321c');
    if (b.lvl > 1) { ctx.strokeStyle = '#5b3a1c'; ctx.beginPath(); ctx.moveTo(x - 24, y + 10); ctx.lineTo(x - 18, y - 22); ctx.moveTo(x - 27, y + 8); ctx.lineTo(x - 16, y - 21); ctx.stroke(); }
  } else if (b.type === 'ryby') {
    shadow(x, y + 4, 24);
    if (b.lvl === 1) {
      ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 15, y - 4, 2.5, 14); ctx.fillRect(x + 12, y - 4, 2.5, 14); ctx.fillRect(x - 2, y + 2, 2.5, 13);
      poly([x - 18, y - 4, x - 18, y - 16, x, y - 9, x, y + 4], '#8a6a3a', '#3f2a14');
      poly([x + 18, y - 4, x + 18, y - 16, x, y - 9, x, y + 4], '#6f5430', '#3f2a14');
      poly([x - 22, y - 15, x, y - 34, x + 22, y - 15, x, y - 7], '#b9a25a', '#5a4a20');
      poly([x, y - 34, x + 22, y - 15, x, y - 7], '#9c8748');
    } else {
      poly([x - 24, y + 4, x - 24, y - 16, x, y - 7, x, y + 14], '#7a5a34', '#3f2a14');
      poly([x + 24, y + 4, x + 24, y - 16, x, y - 7, x, y + 14], '#64482a', '#3f2a14');
      poly([x - 28, y - 15, x, y - 42, x + 28, y - 15, x, y - 5], '#b08a5a', '#4a321c');
      poly([x, y - 42, x + 28, y - 15, x, y - 5], '#8e6c42');
      poly([x + 6, y + 10, x + 6, y - 2, x + 18, y - 7, x + 18, y + 5], '#1c140b');
      poly([x - 34, y + 12, x - 12, y + 12, x - 16, y + 18, x - 30, y + 18], '#8a5f35', '#3f2a14');
    }
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x + 22, y - 6, 2, 18); ctx.fillRect(x + 34, y - 2, 2, 18); ctx.fillRect(x + 22, y - 6, 14, 1.6);
    for (let i = 0; i < 3; i++) ell(x + 25.5 + i * 3.6, y + 0.5 + i * 1.2, 1.3, 4, '#b7cdd8');
  } else if (b.type === 'pole') {
    diamond(b.x, b.y, '#4a321c', '#6b4a2a');
    const gr = Math.min(1, (b.t || 0) / 45), [tx0, ty0] = iso(b.x, b.y);
    ctx.strokeStyle = 'rgba(40,25,10,.55)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 6; i++) { ctx.moveTo(tx0 - i * 5.3, ty0 + i * 2.65); ctx.lineTo(tx0 - i * 5.3 + 32, ty0 + i * 2.65 + 16); } ctx.stroke();
    ctx.strokeStyle = `hsl(${95 - gr * 50},${55 + gr * 15}%,${34 + gr * 18}%)`; ctx.lineWidth = b.lvl > 1 ? 1.8 : 1.3; ctx.beginPath();
    for (let i = 1; i < 6; i++) for (let k = 1; k < 6; k++) { const sx = tx0 - i * 5.3 + k * 5.3, sy = ty0 + i * 2.65 + k * 2.65; ctx.moveTo(sx, sy); ctx.lineTo(sx + ((i + k) % 2 ? 0.8 : -0.8), sy - 2 - gr * 7); } ctx.stroke();
  } else if (b.type === 'skala') {
    shadow(x, y + 4, 18);
    poly([x - 16, y + 8, x - 13, y - 30, x - 2, y - 44, x + 12, y - 34, x + 17, y + 6, x, y + 13], '#9a958a', '#55524c');
    poly([x - 2, y - 44, x + 12, y - 34, x + 17, y + 6, x + 4, y + 11], '#827d73');
    ctx.strokeStyle = '#9c2f1a'; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(x - 9, y - 12); ctx.lineTo(x - 9, y - 20); ctx.moveTo(x - 12, y - 17); ctx.lineTo(x - 6, y - 17); ctx.moveTo(x - 9, y - 12); ctx.lineTo(x - 12, y - 7); ctx.moveTo(x - 9, y - 12); ctx.lineTo(x - 6, y - 7);
    ctx.moveTo(x - 3, y - 26); ctx.lineTo(x + 3, y - 26); ctx.lineTo(x + 4, y - 30); ctx.moveTo(x - 2, y - 26); ctx.lineTo(x - 2, y - 22); ctx.moveTo(x + 2, y - 26); ctx.lineTo(x + 2, y - 22);
    ctx.stroke(); ell(x - 9, y - 22, 1.8, 1.8, '#9c2f1a');
    if (b.lvl > 1) { ell(x - 4, y - 34, 3, 3, '#d9a520'); }
  }
  if (b.id === selId) { diamond(b.x, b.y, 'rgba(255,230,120,.9)', null); }
}
/* stavby starověku – kreslené programem */
function isoBox(cx, cy, hw, hh, cl, cr, ct) {
  const hd = hw / 2;
  poly([cx - hw, cy, cx, cy + hd, cx, cy + hd - hh, cx - hw, cy - hh], cl, '#3a2614');
  poly([cx, cy + hd, cx + hw, cy, cx + hw, cy - hh, cx, cy + hd - hh], cr, '#3a2614');
  if (ct) poly([cx - hw, cy - hh, cx, cy + hd - hh, cx + hw, cy - hh, cx, cy - hd - hh], ct, '#3a2614');
}
function roof(cx, cy, hw, rh, cl, cr) {
  const e = hw * 1.15, hd = e / 2;
  poly([cx - e, cy, cx, cy + hd, cx, cy - rh], cl, '#3a2614');
  poly([cx, cy + hd, cx + e, cy, cx, cy - rh], cr, '#3a2614');
}
function pot(px, py, s, c) { ell(px, py, 3.2 * s, 4 * s, c || '#b5683a'); ell(px, py - 3.6 * s, 2 * s, 0.9 * s, '#5a2e14'); }
function drawBld2(b, T, x, y) {
  const t = b.type, lv = t === 'jeskyne' ? MAIN_LV[b.lvl] : b.lvl;
  if (t === 'pole' && IMG.pole_mlade && IMG.pole_mlade.ok) {
    const l = lvOf(b), gr = Math.min(1, (b.t || 0) / (l.farm ? l.farm.t : 45));
    if (b.id === selId) diamond(b.x, b.y, 'rgba(255,230,120,.9)', null);
    spr('pole_mlade', x, y, 70, 17);
    if (IMG.pole_zrale && IMG.pole_zrale.ok && gr > 0) { ctx.globalAlpha = gr; spr('pole_zrale', x, y, 70, 17); ctx.globalAlpha = 1; }
    return true;
  }
  const smoke = (cx, cy, dark) => { for (let i = 0; i < 3; i++) { const k = (T * 0.3 + i / 3) % 1; ell(cx + Math.sin(T + i * 2) * 3, cy - k * 40, 4 + k * 8, 4 + k * 8, `rgba(${dark ? '60,60,60' : '190,190,190'},${0.32 * (1 - k)})`); } };
  const brick = (cx, cy, hw, hh, roofC) => { isoBox(cx, cy, hw, hh, '#a8553a', '#8a4430', roofC || '#7a3a28'); ctx.strokeStyle = 'rgba(60,20,10,.35)'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let i = 1; i < hh / 4; i++) { ctx.moveTo(cx - hw, cy - i * 4); ctx.lineTo(cx, cy + hw / 2 - i * 4); ctx.lineTo(cx + hw, cy - i * 4); } ctx.stroke(); };
  if (t === 'vytah') {                         // vesmírný výtah
    shadow(x, y + 8, 70);
    ell(x, y + 6, 46, 20, '#8a9aaa'); ell(x, y + 2, 42, 18, '#c8d4e0'); ell(x, y, 22, 9, '#6a7a8a');
    isoBox(x, y - 2, 12, 46, '#e0e8f0', '#b8c4d0', '#f0f4f8');
    ctx.strokeStyle = 'rgba(200,220,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 50); ctx.lineTo(x, y - 1400); ctx.stroke();
    const k = (T * 0.05) % 1; isoBox(x, y - 60 - k * 900, 5, 8, '#f0c040', '#c09020', '#ffe080');
    ell(x, y - 52, 6, 6, `rgba(120,200,255,${0.5 + 0.5 * Math.sin(T * 2)})`);
  } else if (t === 'fuze_reaktor') {
    shadow(x, y + 6, 50);
    isoBox(x, y + 8, 34, 14, '#c8d0d8', '#a8b0b8', '#d8e0e8');
    ctx.fillStyle = '#e8eef4'; ctx.beginPath(); ctx.ellipse(x, y - 6, 26, 26, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#7a8a9a'; ctx.lineWidth = 1; ctx.stroke();
    const gl = 0.5 + 0.5 * Math.sin(T * 2.5);
    ctx.strokeStyle = `rgba(80,180,255,${0.5 + gl * 0.5})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y - 14, 22, 7, 0, 0, 7); ctx.stroke();
    ell(x, y - 20, 6, 6, `rgba(160,220,255,${0.6 + gl * 0.4})`);
  } else if (t === 'dronport') {
    shadow(x, y + 4, 40);
    ctx.fillStyle = '#4a5260'; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(x + Math.cos(a) * 34, y + 4 + Math.sin(a) * 17); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8c030'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + 4, 18, 9, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = '#e8e8e8'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('D', x, y + 8);
    isoBox(x + 24, y - 6, 6, 26, '#d0d8e0', '#b0b8c0', '#e0e8f0'); ell(x + 24, y - 34, 3, 3, `rgba(60,255,120,${0.5 + 0.5 * Math.sin(T * 4)})`);
  } else if (t === 'nanotovarna') {
    shadow(x, y + 6, 46);
    isoBox(x, y + 8, 38, 22, '#f0f2f6', '#d0d4dc', '#e8ecf2');
    ctx.fillStyle = `rgba(170,90,230,${0.6 + 0.3 * Math.sin(T * 2)})`; for (let i = 0; i < 5; i++) ctx.fillRect(x - 34 + i * 7, y - 4 + i * 3.6, 5, 3);
    ell(x + 10, y - 20, 10, 5, '#9a70d0'); ell(x + 10, y - 22, 6, 3, `rgba(220,180,255,${0.5 + 0.5 * Math.sin(T * 3)})`);
  } else if (t === 'robotovarna') {
    shadow(x, y + 6, 46);
    isoBox(x, y + 8, 38, 20, '#d8dce4', '#b8bcc4', '#c8ccd4');
    const a = Math.sin(T * 2) * 0.6;
    ctx.save(); ctx.translate(x + 18, y - 14); ctx.strokeStyle = '#e08030'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-1.2 + a) * 14, Math.sin(-1.2 + a) * 14); ctx.stroke();
    const ex = Math.cos(-1.2 + a) * 14, ey = Math.sin(-1.2 + a) * 14; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(0.3 - a) * 10, ey + Math.sin(0.3 - a) * 10); ctx.stroke(); ctx.restore(); ctx.lineCap = 'butt';
    ell(x - 14, y - 8, 4, 4, `rgba(255,80,140,${0.5 + 0.5 * Math.sin(T * 5)})`);
  } else if (t === 'vfarma') {
    shadow(x, y + 4, 30);
    isoBox(x, y + 4, 20, 70, 'rgba(160,210,230,.75)', 'rgba(120,180,210,.75)', '#d8f0f8');
    for (let f = 0; f < 8; f++) { ctx.fillStyle = f % 2 ? '#5aa040' : '#c8b040'; ctx.fillRect(x - 18, y - 4 - f * 8.5, 18, 3); ctx.fillRect(x + 1, y - 4 - f * 8.5, 17, 3); }
  } else if (t === 'chyse' && lv >= 8) {        // arkologie
    shadow(x, y + 6, 40);
    for (let f = 0; f < 4; f++) { const w = 32 - f * 7; isoBox(x, y + 6 - f * 16, w, 16, '#d8dce0', '#b8bcc0', '#7ab060'); }
    ell(x - 10, y - 50, 4, 3, '#5aa040'); ell(x + 8, y - 54, 4, 3, '#4a9030');
  } else if (t === 'jeskyne' && lv >= 6) {            // mrakodrap
    shadow(x, y + 8, 60);
    isoBox(x, y + 12, 34, 120, '#5a7a9a', '#3a5a7a', '#8aaac8');
    ctx.fillStyle = 'rgba(255,240,180,.75)';
    for (let f = 0; f < 18; f++) for (let i = 0; i < 4; i++) { if (hash(f, i, 7) > 0.6) continue; ctx.fillRect(x - 31 + i * 8, y - 2 - f * 6.5 + i * 4, 4, 3); ctx.fillRect(x + 4 + i * 8, y + 13 - f * 6.5 - i * 4 - 12, 4, 3); }
    ctx.fillStyle = '#9ab0c4'; ctx.fillRect(x - 1, y - 140, 2, 22); ell(x, y - 140, 2, 2, `rgba(255,60,40,${0.5 + 0.5 * Math.sin(T * 4)})`);
  } else if (t === 'chyse' && lv >= 7) {       // panelový dům
    shadow(x, y + 4, 34);
    isoBox(x, y + 4, 28, 60, '#b8b4a8', '#9a968c', '#cac6ba');
    ctx.fillStyle = '#3a4a5a';
    for (let f = 0; f < 7; f++) for (let i = 0; i < 3; i++) { ctx.fillRect(x - 25 + i * 9, y - 8 - f * 8 + i * 4.5, 5, 4); ctx.fillRect(x + 4 + i * 9, y + 6 - f * 8 - i * 4.5 - 12, 5, 4); }
  } else if (t === 'elektrarna') {
    shadow(x, y + 6, 44);
    isoBox(x + 12, y + 8, 16, 14, '#8a8a90', '#6a6a70', '#9a9aa0');
    ctx.fillStyle = '#b8b8bc'; ctx.beginPath(); ctx.moveTo(x - 30, y + 6); ctx.quadraticCurveTo(x - 20, y - 20, x - 26, y - 46); ctx.lineTo(x - 2, y - 46); ctx.quadraticCurveTo(x - 8, y - 20, x + 2, y + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(x - 12, y - 44, 10, 50); ell(x - 14, y - 46, 12, 4, '#7a7a80');
    if (b.on) for (let i = 0; i < 3; i++) { const k = (T * 0.25 + i / 3) % 1; ell(x - 14 + Math.sin(T + i) * 4, y - 50 - k * 40, 8 + k * 10, 6 + k * 8, `rgba(240,240,245,${0.5 * (1 - k)})`); }
    ctx.fillStyle = '#7a4430'; ctx.fillRect(x + 20, y - 46, 5, 40);
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 30, y + 6); ctx.lineTo(x + 34, y - 26); ctx.lineTo(x + 38, y + 6); ctx.moveTo(x + 31, y - 14); ctx.lineTo(x + 37, y - 14); ctx.stroke();
    if (b.on) ell(x + 34, y - 28, 2.4, 2.4, `rgba(255,220,60,${0.6 + 0.4 * Math.sin(T * 6)})`);
  } else if (t === 'ropny_vrt') {
    shadow(x, y + 4, 26);
    ctx.fillStyle = '#4a4a50'; ctx.fillRect(x - 18, y - 2, 36, 6);
    ctx.strokeStyle = '#2a2a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 4, y + 2); ctx.lineTo(x, y - 22); ctx.lineTo(x + 4, y + 2); ctx.stroke();
    const a = Math.sin(T * 2) * 0.35;
    ctx.save(); ctx.translate(x, y - 22); ctx.rotate(a); ctx.fillStyle = '#c8a020'; ctx.fillRect(-20, -3, 40, 6); ctx.fillStyle = '#2a2a40'; ctx.beginPath(); ctx.moveTo(18, -6); ctx.quadraticCurveTo(28, 0, 18, 8); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x + 22, y - 22 + Math.sin(a) * 20); ctx.lineTo(x + 22, y + 2); ctx.stroke();
    isoBox(x - 16, y + 4, 6, 6, '#2a2a2a', '#1a1a1a', '#3a3a3a');
  } else if (t === 'rafinerie') {
    shadow(x, y + 6, 44);
    for (const [ox, oy, r, hh] of [[-20, 6, 9, 22], [-4, 12, 9, 22], [14, 4, 7, 18]]) { ell(x + ox, y + oy, r, r * 0.5, '#9aa0a8'); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(x + ox - r, y + oy - hh, r * 2, hh); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x + ox, y + oy - hh, r, hh); ell(x + ox, y + oy - hh, r, r * 0.5, '#e0e4e8'); }
    ctx.strokeStyle = '#5a5a60'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 26, y + 6); ctx.lineTo(x + 26, y - 50); ctx.stroke();
    ell(x + 26, y - 54, 3, 5 + Math.sin(T * 9) * 1.5, '#ff9a20'); ell(x + 26, y - 53, 1.6, 3, '#ffe060');
  } else if (t === 'elektro') {
    shadow(x, y + 6, 44);
    isoBox(x, y + 8, 38, 20, '#e8ecf0', '#c8ccd2', '#d8dce2');
    ctx.fillStyle = '#4a8ac0';
    for (let i = 0; i < 5; i++) { ctx.fillRect(x - 34 + i * 7, y - 6 + i * 3.6, 5, 9); ctx.fillRect(x + 4 + i * 7, y + 12 - i * 3.6 - 12, 5, 9); }
    poly([x - 38, y - 12, x, y + 7, x + 38, y - 12, x, y - 31], '#7a8a9a', '#3a4a5a');
    ctx.fillStyle = '#3a6aa0'; ctx.fillRect(x + 20, y - 40, 3, 20); ell(x + 21.5, y - 40, 3, 3, `rgba(80,200,255,${0.5 + 0.5 * Math.sin(T * 3)})`);
  } else if (t === 'nadrazi') {
    shadow(x, y + 6, 40);
    isoBox(x - 6, y + 6, 26, 18, '#b46040', '#94503a');
    roof(x - 6, y - 12, 26, 14, '#5a5a62', '#46464e');
    ctx.fillStyle = '#5b3a1c'; [[18, 2], [32, -5]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy - 18, 2, 18));
    poly([x + 14, y - 16, x + 36, y - 27, x + 40, y - 23, x + 18, y - 12], '#7a7a82', '#3a3a40');
    ell(x - 6, y - 26, 5, 5, '#f0ead0'); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x - 6, y - 26, 5, 0, 7); ctx.stroke();
    if (b.buf) { let i = 0; for (const r in b.buf) for (let k = 0; k < Math.min(4, Math.ceil(b.buf[r] / 10)); k++, i++) isoBox(x + 22 + (i % 3) * 6, y + 10 - Math.floor(i / 3) * 5, 3, 4, RCOL[r] || '#aaa', '#555', RCOL[r] || '#aaa'); }
  } else if (t === 'letiste') {
    poly([x - 64, y + 6, x - 52, y, x + 52, y + 52 / 2 * 0 - 0, x + 64, y + 6], 'rgba(0,0,0,0)');
    ctx.fillStyle = '#5a5a60'; ctx.beginPath(); ctx.moveTo(x - 70, y - 8); ctx.lineTo(x - 54, y - 16); ctx.lineTo(x + 70, y + 46); ctx.lineTo(x + 54, y + 54); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8e8e8'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 62, y - 12); ctx.lineTo(x + 62, y + 50); ctx.stroke(); ctx.setLineDash([]);
    isoBox(x - 24, y + 22, 18, 16, '#c8ccd0', '#a8acb0'); ctx.fillStyle = '#7a8a9a'; ctx.beginPath(); ctx.ellipse(x - 24, y + 6, 18, 9, 0, Math.PI, 0); ctx.fill();
    isoBox(x + 18, y - 8, 5, 34, '#e0e0e0', '#c0c0c0'); isoBox(x + 18, y - 42, 8, 7, '#4a8ac0', '#3a6aa0', '#5a6a7a');
    if (!S.flight) { ell(x + 30, y + 30, 12, 3.2, '#f0f2f4'); poly([x + 26, y + 30, x + 32, y + 22, x + 35, y + 22, x + 33, y + 30], '#d8dce0'); }
  } else if (t === 'jeskyne' && lv >= 5) {            // radnice
    shadow(x, y + 8, 80);
    brick(x, y + 14, 54, 30, '#b88a5a');
    for (let i = 0; i < 6; i++) poly([x - 48 + i * 8, y + 4 + i * 4, x - 48 + i * 8, y - 8 + i * 4, x - 43 + i * 8, y - 6 + i * 4, x - 43 + i * 8, y + 6 + i * 4], '#e8e0c0', '#3a2614');
    poly([x - 60, y - 16, x, y + 14, x + 60, y - 16, x, y - 44], '#5a6a7a', '#2a3036');
    isoBox(x, y - 18, 12, 50, '#b46040', '#94503a');
    ell(x - 6, y - 50, 5, 5, '#f0ead0'); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, y - 50); ctx.lineTo(x - 6, y - 53); ctx.moveTo(x - 6, y - 50); ctx.lineTo(x - 4, y - 49); ctx.stroke();
    poly([x - 14, y - 66, x, y - 59, x + 14, y - 66, x, y - 90], '#4a5a6a', '#20262c');
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 1, y - 104, 2, 16); poly([x + 1, y - 104, x + 14, y - 100, x + 1, y - 96], '#c8302a');
  } else if (t === 'chyse' && lv >= 6) {       // cihlový činžák
    shadow(x, y + 4, 32);
    brick(x, y + 2, 26, 40, '#6a3a2a');
    for (let f = 0; f < 3; f++) for (let i = 0; i < 3; i++) {
      poly([x - 22 + i * 7, y - 2 - f * 12 + i * 3.5, x - 22 + i * 7, y - 9 - f * 12 + i * 3.5, x - 18 + i * 7, y - 7 - f * 12 + i * 3.5, x - 18 + i * 7, y - f * 12 + i * 3.5], '#e8d8a0', '#3a2614');
      poly([x + 6 + i * 7, y + 1 - f * 12 - i * 3.5, x + 6 + i * 7, y - 6 - f * 12 - i * 3.5, x + 10 + i * 7, y - 8 - f * 12 - i * 3.5, x + 10 + i * 7, y - 1 - f * 12 - i * 3.5], '#d8c890', '#3a2614');
    }
    ctx.fillStyle = '#6a4a3a'; ctx.fillRect(x + 12, y - 52, 5, 12); smoke(x + 14, y - 54);
  } else if (t === 'dul_uhli' || t === 'dul_zelezo') {
    shadow(x, y + 4, 30);
    isoBox(x - 8, y + 4, 14, 10, '#7a5a3a', '#5e4430');
    roof(x - 8, y - 6, 14, 10, '#4a4a4a', '#3a3a3a');
    ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2.2; ctx.beginPath();
    ctx.moveTo(x + 4, y + 6); ctx.lineTo(x + 12, y - 38); ctx.lineTo(x + 20, y + 4); ctx.moveTo(x + 7, y - 10); ctx.lineTo(x + 17, y - 10); ctx.moveTo(x + 9, y - 24); ctx.lineTo(x + 15, y - 24); ctx.stroke();
    ell(x + 12, y - 38, 5, 5, '#2a2a2a'); ell(x + 12, y - 38, 2, 2, '#888');
    const col = t === 'dul_uhli' ? ['#1e1e22', '#121214'] : ['#7a3a20', '#5a2a18'];
    for (let i = 0; i < 6; i++) ell(x + 22 + (i % 3) * 5, y + 10 - Math.floor(i / 3) * 4, 4, 3, col[i % 2]);
  } else if (t === 'cihelna') {
    shadow(x, y + 4, 32);
    brick(x - 6, y + 4, 22, 16, '#6a3a2a');
    ctx.fillStyle = '#8a4430'; ctx.fillRect(x + 14, y - 46, 7, 40); smoke(x + 17, y - 48, true);
    for (let i = 0; i < 6; i++) poly([x + 18 + (i % 3) * 5, y + 12 - Math.floor(i / 3) * 3, x + 22 + (i % 3) * 5, y + 10 - Math.floor(i / 3) * 3, x + 22 + (i % 3) * 5, y + 13 - Math.floor(i / 3) * 3, x + 18 + (i % 3) * 5, y + 15 - Math.floor(i / 3) * 3], '#b0503a', '#5a2a18');
    ell(x - 12, y + 2, 4, 3, `rgba(255,${130 + Math.sin(T * 6) * 40},40,.9)`);
  } else if (t === 'ocelarna') {
    shadow(x, y + 6, 46);
    brick(x - 4, y + 6, 36, 24, '#4a4a50');
    for (const cx of [x + 10, x + 22]) { ctx.fillStyle = '#7a4430'; ctx.fillRect(cx - 3, y - 60, 7, 50); smoke(cx, y - 62, true); }
    poly([x - 30, y + 2, x - 30, y - 10, x - 18, y - 4, x - 18, y + 8], '#1c120a'); ell(x - 24, y - 2, 4, 4, `rgba(255,${150 + Math.sin(T * 7) * 50},40,.95)`);
  } else if (t === 'strojirna') {
    shadow(x, y + 6, 46);
    brick(x, y + 6, 38, 20, '#5a6070');
    for (let i = 0; i < 4; i++) poly([x - 34 + i * 18, y - 12 + i * 0, x - 25 + i * 18, y - 24, x - 16 + i * 18, y - 12], '#6a7a8a', '#2a3036');
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2; const gx = x + 26, gy = y + 4, a = T * 1.5;
    ctx.beginPath(); ctx.arc(gx, gy, 6, 0, 7); ctx.stroke(); for (let i = 0; i < 6; i++) { const aa = a + i * Math.PI / 3; ctx.moveTo(gx + Math.cos(aa) * 6, gy + Math.sin(aa) * 6); ctx.lineTo(gx + Math.cos(aa) * 9, gy + Math.sin(aa) * 9); } ctx.stroke();
    ctx.fillStyle = '#6a4a3a'; ctx.fillRect(x - 30, y - 40, 6, 26); smoke(x - 27, y - 42, true);
  } else if (t === 'jeskyne' && lv >= 4) {          // hrad
    shadow(x, y + 8, 80);
    isoBox(x, y + 14, 58, 16, '#9a958a', '#827d73', '#aaa59a');
    const tower = (tx, ty, r, hgt) => {
      ell(tx, ty, r, r * 0.5, '#827d73'); ctx.fillStyle = '#9a958a'; ctx.fillRect(tx - r, ty - hgt, r * 2, hgt);
      ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(tx + r * 0.2, ty - hgt, r * 0.8, hgt);
      ell(tx, ty - hgt, r, r * 0.5, '#b0aba0'); for (let i = -1; i <= 1; i++) ctx.fillRect(tx + i * r * 0.6 - 2, ty - hgt - 5, 4, 5);
      poly([tx - r - 2, ty - hgt - 4, tx, ty - hgt - r * 2.4, tx + r + 2, ty - hgt - 4], '#7a2a20', '#3a1410');
    };
    tower(x - 56, y + 14, 9, 30); tower(x + 56, y + 14, 9, 30);
    isoBox(x + 4, y - 4, 26, 40, '#a8a397', '#8f8a7f', '#b8b3a8');
    poly([x - 26, y - 44, x + 4, y - 30, x + 30, y - 44, x + 4, y - 58], '#a8a397', '#45423c');
    tower(x + 4, y + 2, 7, 26); tower(x, y + 34, 9, 24);
    poly([x - 6, y + 32, x - 6, y + 20, x + 6, y + 20, x + 6, y + 32], '#3a2412');
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x + 3, y - 92, 2, 30); poly([x + 5, y - 92, x + 22, y - 87, x + 5, y - 81], '#b23a2a');
  } else if (t === 'chyse' && lv >= 5) {     // roubenka
    shadow(x, y + 4, 30);
    isoBox(x, y + 2, 24, 18, '#8a5f35', '#6e4a28');
    ctx.strokeStyle = 'rgba(40,25,10,.55)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 5; i++) { const yy = y + 2 - i * 3.6; ctx.moveTo(x - 24, yy); ctx.lineTo(x, yy + 12); ctx.lineTo(x + 24, yy); } ctx.stroke();
    roof(x, y - 16, 24, 24, '#6b4a3a', '#56392c');
    poly([x - 15, y + 7, x - 15, y - 6, x - 8, y - 2, x - 8, y + 11], '#3a2412');
    poly([x + 7, y + 2, x + 7, y - 6, x + 15, y - 10, x + 15, y - 2], '#e8d8a0', '#3a2614');
  } else if (t === 'pila') {
    shadow(x, y + 4, 30);
    ctx.fillStyle = '#5b3a1c'; [[-22, 0], [20, -4], [0, 10]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy - 22, 3, 24));
    roof(x, y - 22, 22, 10, '#8f7a44', '#74622f');
    poly([x - 16, y + 4, x + 10, y - 9, x + 14, y - 7, x - 12, y + 6], '#a9793f', '#4a2e16');
    for (let i = 0; i < 4; i++) { ell(x + 22 + (i % 2) * 6, y + 10 - Math.floor(i / 2) * 5, 3.4, 3.4, '#a9793f'); ell(x + 22 + (i % 2) * 6, y + 10 - Math.floor(i / 2) * 5, 1.4, 1.4, '#6b4722'); }
    for (let i = 0; i < 4; i++) poly([x - 30, y + 12 - i * 2, x - 14, y + 4 - i * 2, x - 14, y + 2 - i * 2, x - 30, y + 10 - i * 2], '#d0a868', '#7a5a30');
  } else if (t === 'sklad') {
    shadow(x, y + 4, 36);
    isoBox(x, y + 4, 34, 18, '#9a7448', '#7d5d38');
    roof(x, y - 14, 34, 20, '#7a5a3a', '#5e4430');
    poly([x - 18, y + 12, x - 18, y - 4, x - 6, y + 2, x - 6, y + 18], '#3a2412');
    for (let i = 0; i < 3; i++) pot(x + 26 + i * 4, y + 12 - i * 2, 0.9, '#a9793f');
  } else if (t === 'mlyn') {
    shadow(x, y + 4, 22);
    poly([x - 14, y + 6, x - 9, y - 34, x + 9, y - 34, x + 14, y + 6, x, y + 10], '#c8a878', '#5a3e20');
    poly([x, y + 10, x + 14, y + 6, x + 9, y - 34, x + 3, y - 34], '#a8885a');
    poly([x - 12, y - 33, x, y - 52, x + 12, y - 33], '#7a5a3a', '#3a2614');
    poly([x - 4, y + 8, x - 4, y - 4, x + 3, y - 4, x + 3, y + 9], '#3a2412');
    drawSails(x - 2, y - 32, T, 30);
  } else if (t === 'pekarna') {
    shadow(x, y + 4, 28);
    isoBox(x, y + 2, 22, 16, '#d2a878', '#b08458');
    roof(x, y - 14, 22, 16, '#a85a3a', '#8a4a30');
    ctx.fillStyle = '#7a6a5a'; ctx.fillRect(x + 10, y - 30, 6, 14);
    for (let i = 0; i < 3; i++) { const k = (T * 0.35 + i / 3) % 1; ell(x + 13 + Math.sin(T + i * 2) * 3, y - 32 - k * 30, 3 + k * 5, 3 + k * 5, `rgba(200,200,200,${0.25 * (1 - k)})`); }
    poly([x - 14, y + 7, x - 14, y - 5, x - 7, y - 2, x - 7, y + 10], '#3a2412');
    for (let i = 0; i < 3; i++) ell(x + 18 + i * 5, y + 10 - i * 2, 3.4, 2.2, '#c08040');
  } else if (t === 'hut') {
    shadow(x, y + 4, 30);
    poly([x - 18, y + 8, x - 12, y - 30, x + 12, y - 30, x + 18, y + 8, x, y + 12], '#6e6a62', '#35322e');
    poly([x, y + 12, x + 18, y + 8, x + 12, y - 30, x + 4, y - 30], '#5c5852');
    ell(x, y - 30, 12, 4.5, '#3a3632');
    poly([x - 6, y + 9, x - 6, y - 3, x + 3, y - 4, x + 3, y + 9], '#1c120a'); ell(x - 1, y + 3, 4, 3, `rgba(255,${120 + Math.sin(T * 7) * 40},30,.95)`);
    for (let i = 0; i < 3; i++) { const k = (T * 0.3 + i / 3) % 1; ell(x + Math.sin(T + i * 2) * 3, y - 34 - k * 40, 4 + k * 7, 4 + k * 7, `rgba(70,70,70,${0.35 * (1 - k)})`); }
    for (let i = 0; i < 3; i++) poly([x + 20 + i * 4, y + 12 - i, x + 26 + i * 4, y + 11 - i, x + 26 + i * 4, y + 13 - i, x + 20 + i * 4, y + 14 - i], '#8a8a90', '#3a3a40');
  } else if (t === 'klaster') {
    shadow(x, y + 6, 46);
    isoBox(x - 6, y + 6, 38, 22, '#b8b0a0', '#9a9284');
    roof(x - 6, y - 16, 38, 22, '#7a3a2a', '#5e2c20');
    isoBox(x + 26, y - 6, 10, 46, '#c4bcac', '#a69e90');
    poly([x + 15, y - 52, x + 26, y - 47, x + 37, y - 52, x + 26, y - 74], '#7a3a2a', '#3a1410');
    ctx.fillStyle = '#d9c070'; ctx.fillRect(x + 25, y - 86, 2, 12); ctx.fillRect(x + 21, y - 82, 10, 2);
    for (let i = 0; i < 3; i++) poly([x - 36 + i * 10, y + 2 + i * 5, x - 36 + i * 10, y - 8 + i * 5, x - 32 + i * 10, y - 6 + i * 5, x - 32 + i * 10, y + 4 + i * 5], '#3a4a6a');
    poly([x - 4, y + 22, x - 4, y + 8, x + 4, y + 4, x + 4, y + 18], '#3a2412');
  } else if (t === 'straz') {                        // strážní věž: dřevěná, později kamenná
    shadow(x, y + 4, 16);
    if (lv === 1) {
      ctx.fillStyle = '#5b3a1c'; for (const dx of [-9, 9]) ctx.fillRect(x + dx - 1.5, y - 40, 3, 44); ctx.fillRect(x - 1.5, y - 36, 3, 42);
      ctx.strokeStyle = '#4a2e14'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y - 30); ctx.moveTo(x + 9, y); ctx.lineTo(x - 9, y - 30); ctx.stroke();
      isoBox(x, y - 38, 13, 6, '#8a5a2b', '#6e4422', '#a8743e');
      poly([x - 15, y - 44, x, y - 62, x + 15, y - 44, x, y - 38], '#c9a456', '#5a3b1a');
    } else {
      isoBox(x, y + 2, 11, 44, '#b0a898', '#8e8678', '#c8c0b0');
      isoBox(x, y - 42, 14, 6, '#a09888', '#7e776a', '#bdb5a5');
      poly([x - 16, y - 48, x, y - 66, x + 16, y - 48, x, y - 42], '#9a3a2a', '#4a1a12');
    }
    ctx.fillStyle = '#e8d070'; ctx.fillRect(x - 2, y - 52, 4, 5);   // strážný
  } else if (t === 'hliniste') {
    ell(x, y + 2, 28, 13, '#6e4426'); ell(x, y + 3, 21, 9, '#4a2c16');
    ell(x + 4, y + 5, 9, 3.6, `rgba(120,160,190,${0.5 + 0.1 * Math.sin(T)})`);
    for (let i = 0; i < (lv > 1 ? 7 : 4); i++) { const a = i / 7 * 6.28; ell(x + Math.cos(a) * 25, y + 2 + Math.sin(a) * 11, 5, 3, i % 2 ? '#a5653d' : '#8a4a2a'); }
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 24, y - 16, 2, 18); ctx.fillRect(x - 24, y - 16, 10, 2); poly([x - 16, y - 14, x - 12, y - 6, x - 16, y - 4], '#8a8a8a');
  } else if (t === 'svatyne') {
    shadow(x, y + 6, 36);
    if (lv === 1) {                                     // svatyně: kamenný chrámek se sloupy
      isoBox(x, y + 6, 26, 6, '#c8c0b0', '#a8a090', '#d8d0c0');
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - 22 + i * 6, y - 18 + i * 3, 3, 22); ctx.fillRect(x + 4 + i * 6, y - 9 - i * 3, 3, 22); }
      roof(x, y - 20, 26, 14, '#b85a3a', '#984a30');
      ell(x, y - 8, 3, 3, `rgba(255,180,60,${0.6 + 0.3 * Math.sin(T * 5)})`);
    } else if (lv === 2) {                              // škola: cihlová budova se zvonkem
      isoBox(x, y + 6, 28, 22, '#b46040', '#94503a');
      for (let i = 0; i < 3; i++) { poly([x - 24 + i * 8, y - 2 + i * 4, x - 24 + i * 8, y - 12 + i * 4, x - 19 + i * 8, y - 10 + i * 4, x - 19 + i * 8, y + i * 4], '#e8e0c0', '#3a2614'); poly([x + 6 + i * 8, y + 4 - i * 4, x + 6 + i * 8, y - 6 - i * 4, x + 11 + i * 8, y - 8 - i * 4, x + 11 + i * 8, y + 2 - i * 4], '#d8d0b0', '#3a2614'); }
      roof(x, y - 16, 28, 16, '#5a5a62', '#46464e');
      isoBox(x, y - 30, 5, 10, '#e8e0d0', '#c8c0b0'); ell(x, y - 36, 3, 3, '#c8a020');
    } else {                                            // univerzita: budova s kupolí
      isoBox(x, y + 8, 34, 24, '#e8e4dc', '#c8c4bc', '#d8d4cc');
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#f4f0e8'; ctx.fillRect(x - 31 + i * 6, y - 14 + i * 3, 3, 22); }
      ctx.fillStyle = '#6a9ab0'; ctx.beginPath(); ctx.ellipse(x + 2, y - 18, 16, 16, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#3a5a6a'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#d0a030'; ctx.fillRect(x + 1, y - 40, 2, 7);
    }
  } else if (t === 'jeskyne' && lv === 2) {          // náčelníkův dlouhý dům
    shadow(x, y + 6, 62);
    isoBox(x - 10, y + 6, 40, 20, '#9a7448', '#7d5d38');
    isoBox(x + 22, y - 10, 20, 20, '#9a7448', '#7d5d38');
    poly([x - 54, y - 12, x - 10, y + 14, x + 44, y - 13, x + 44, y - 46, x - 2, y - 66], '#c9a54e', '#6b5320');
    poly([x - 10, y + 14, x + 44, y - 13, x + 44, y - 46, x - 10, y - 20], '#a8873a', '#6b5320');
    poly([x - 54, y - 12, x - 10, y + 14, x - 10, y - 20, x - 2, y - 66], '#c9a54e', '#6b5320');
    ctx.strokeStyle = 'rgba(80,60,20,.45)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 6; i++) { ctx.moveTo(x - 54 + i * 8.8, y - 12 + i * 5.2); ctx.lineTo(x - 2 + i * 1.6, y - 66 + i * 9.2); } ctx.stroke();
    poly([x - 30, y + 14, x - 30, y - 2, x - 20, y + 3, x - 20, y + 19], '#3a2412');
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 34, y - 6, 3, 24); ctx.fillRect(x - 18, y + 2, 3, 22);
    ctx.strokeStyle = '#e6d9b8'; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(x - 2, y - 66); ctx.lineTo(x - 9, y - 76); ctx.moveTo(x - 2, y - 66); ctx.lineTo(x + 5, y - 76); ctx.stroke();
    for (let i = 0; i < 2; i++) { const k = (T * 0.35 + i / 2) % 1; ell(x + 14 + Math.sin(T + i) * 3, y - 40 - k * 30, 3 + k * 6, 3 + k * 6, `rgba(200,200,200,${0.25 * (1 - k)})`); }
  } else if (t === 'jeskyne' && lv >= 3) {   // palác
    shadow(x, y + 6, 66);
    isoBox(x, y + 8, 46, 26, '#d2a878', '#b08458', '#c49a6a');
    isoBox(x + 4, y - 18, 30, 22, '#dcb486', '#ba9064', '#cfa576');
    for (let i = 0; i < 5; i++) { const cx = x - 40 + i * 9, cy = y + 10 + i * 4.5; ctx.fillStyle = '#efe0c0'; ctx.fillRect(cx - 1.6, cy - 24, 3.2, 22); }
    poly([x - 8, y + 30, x - 8, y + 12, x + 4, y + 6, x + 4, y + 24], '#4a2e16');
    ctx.fillStyle = '#7a1e18'; [[-28, -34], [34, -38]].forEach(([dx, dy]) => { ctx.fillRect(x + dx, y + dy - 22, 2, 30); poly([x + dx + 2, y + dy - 22, x + dx + 14, y + dy - 18, x + dx + 2, y + dy - 13], '#b23a2a'); });
    poly([x - 30, y - 40, x + 4, y - 23, x + 34, y - 40, x + 4, y - 56], '#a8873a', '#6b5320');
    pot(x + 30, y + 22, 1.2); pot(x + 38, y + 18, 1);
  } else if (t === 'chyse' && lv >= 4) {
    shadow(x, y + 4, 30);
    isoBox(x, y + 2, 26, 22, '#c8955e', '#a8784a', '#b98a55');
    poly([x - 26, y - 20, x, y - 7, x + 26, y - 20, x + 26, y - 24, x, y - 11, x - 26, y - 24], '#d7a873', '#3a2614');
    ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 20, y - 23, 22, 2); ctx.fillRect(x + 4, y - 17, 18, 2);
    poly([x - 17, y + 6, x - 17, y - 8, x - 9, y - 4, x - 9, y + 10], '#3a2412');
    poly([x + 9, y - 2, x + 9, y - 9, x + 15, y - 12, x + 15, y - 5], '#2a1a0c');
    pot(x + 22, y + 9, 1); pot(x + 28, y + 6, 0.8);
  } else if (t === 'hrncir') {
    shadow(x, y + 4, 28);
    isoBox(x - 8, y, 18, 13, '#a8794a', '#8a6038');
    roof(x - 8, y - 13, 18, 16, '#c9a54e', '#a8873a');
    ell(x + 16, y + 4, 11, 6, '#7a4524');
    ctx.beginPath(); ctx.ellipse(x + 16, y + 2, 10, 14, 0, Math.PI, 0); ctx.fillStyle = '#9c5a32'; ctx.fill(); ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 1; ctx.stroke();
    ell(x + 16, y - 1, 4, 3.5, `rgba(255,${140 + Math.sin(T * 6) * 30},40,.95)`);
    pot(x - 22, y + 10, 1); pot(x - 15, y + 13, 1.1, '#c27a45'); pot(x + 2, y + 13, 0.9);
    if (lv > 1) { pot(x + 8, y + 15, 1.1, '#a85a30'); ell(x + 30, y + 2, 5, 3, '#7a4524'); }
  } else if (t === 'sypka') {
    const dr = (cx, cy, s) => {
      shadow(cx, cy + 3, 18 * s);
      ctx.fillStyle = '#c49a64'; ctx.fillRect(cx - 15 * s, cy - 24 * s, 30 * s, 24 * s);
      ell(cx, cy, 15 * s, 6 * s, '#b0844f'); ctx.fillStyle = '#c49a64'; ctx.fillRect(cx - 15 * s, cy - 24 * s, 30 * s, 23 * s);
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(cx + 5 * s, cy - 24 * s, 10 * s, 23 * s);
      poly([cx - 20 * s, cy - 23 * s, cx, cy - 50 * s, cx + 20 * s, cy - 23 * s, cx, cy - 18 * s], '#c9a54e', '#6b5320');
      poly([cx, cy - 50 * s, cx + 20 * s, cy - 23 * s, cx, cy - 18 * s], '#a8873a');
      poly([cx - 4 * s, cy + 4 * s, cx - 4 * s, cy - 10 * s, cx + 4 * s, cy - 10 * s, cx + 4 * s, cy + 4 * s], '#4a2e16');
    };
    if (lv > 1) dr(x - 14, y - 4, 0.8);
    dr(x + (lv > 1 ? 8 : 0), y + 2, 1);
  } else if (t === 'skolka') {
    shadow(x - 8, y + 2, 16);
    isoBox(x - 10, y - 2, 13, 10, '#8f7a44', '#74622f');
    roof(x - 10, y - 12, 13, 12, '#7a8a3a', '#5f6e2c');
    for (let i = 0; i < (lv > 1 ? 6 : 4); i++) {
      const sx = x + 4 + (i % 3) * 9, sy = y + 2 + Math.floor(i / 3) * 7 - (i % 3) * 2;
      ell(sx, sy + 1, 4, 1.8, '#5e3820'); ctx.fillStyle = '#5b3a1c'; ctx.fillRect(sx - 0.6, sy - 7, 1.2, 7);
      ell(sx, sy - 9, 3.6 + (i % 2), 3.6, i % 2 ? '#4f9a3a' : '#3f8a2e');
    }
  } else if (t === 'ohrada') {
    diamond(b.x, b.y, null, 'rgba(110,140,60,.35)');
    const [tx, ty] = iso(b.x, b.y), pts = [[tx, ty + 3], [tx + 29, ty + 16], [tx, ty + 29], [tx - 29, ty + 16]];
    const sheep = lv > 1 ? 5 : 3;
    const drawSheep = (i) => {
      const a = T * 0.25 + i * 2.3, sx = x + Math.sin(a) * 9 + (i - sheep / 2) * 4, sy = y + Math.cos(a * 0.8 + i) * 4 + (i % 2) * 3, dd = Math.cos(a) > 0 ? 1 : -1;
      shadow(sx, sy + 1, 6); ctx.fillStyle = '#3a2a1c'; ctx.fillRect(sx - 3, sy - 3, 1.2, 4); ctx.fillRect(sx + 2, sy - 3, 1.2, 4);
      ell(sx, sy - 5, 5.5, 3.6, '#ece6d2'); ell(sx + dd * 5, sy - 6.5, 2, 1.8, '#3a2a1c');
    };
    const fence = (a, c) => {
      ctx.strokeStyle = '#6b4722'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (const h of [4, 8]) { ctx.moveTo(a[0], a[1] - h); ctx.lineTo(c[0], c[1] - h); } ctx.stroke();
      ctx.fillStyle = '#5b3a1c'; for (let k = 0; k <= 3; k++) { const px = a[0] + (c[0] - a[0]) * k / 3, py = a[1] + (c[1] - a[1]) * k / 3; ctx.fillRect(px - 1, py - 11, 2, 11); }
    };
    fence(pts[3], pts[0]); fence(pts[0], pts[1]);
    for (let i = 0; i < sheep; i++) drawSheep(i);
    fence(pts[3], pts[2]); fence(pts[2], pts[1]);
  } else if (t === 'smeniste') {
    shadow(x, y + 4, 30);
    const stall = (cx, cy, c1, c2) => {
      ctx.fillStyle = '#5b3a1c'; ctx.fillRect(cx - 13, cy - 18, 2, 20); ctx.fillRect(cx + 11, cy - 18, 2, 20);
      isoBox(cx, cy, 12, 6, '#9a7448', '#7d5d38', '#b08a5a');
      for (let k = 0; k < 4; k++) poly([cx - 15 + k * 7.5, cy - 20 - k * 0.5, cx - 7.5 + k * 7.5, cy - 20 - (k + 1) * 0.5, cx - 7.5 + k * 7.5, cy - 13, cx - 15 + k * 7.5, cy - 13], k % 2 ? c1 : c2, '#3a2614');
    };
    stall(x - 13, y - 2, '#b23a2a', '#e8d8b0'); stall(x + 13, y + 3, '#2a5ab2', '#e8d8b0');
    pot(x - 16, y - 9, 0.8); pot(x - 9, y - 8, 0.7, '#c27a45'); ell(x + 12, y - 4, 4, 2.5, '#d9b93a'); ell(x + 17, y - 3, 3, 2, '#8a5f35');
    if (lv > 1) { ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 1, y - 30, 2, 26); poly([x + 1, y - 30, x + 14, y - 27, x + 1, y - 24], '#b23a2a'); }
  } else if (t === 'tavirna') {
    shadow(x, y + 4, 28);
    poly([x - 16, y + 8, x - 11, y - 26, x + 11, y - 26, x + 16, y + 8, x, y + 12], '#8b8880', '#45423c');
    poly([x, y + 12, x + 16, y + 8, x + 11, y - 26, x + 4, y - 26], '#77746c');
    ell(x, y - 26, 11, 4, '#4a4640');
    for (let i = 0; i < 6; i++) ell(x - 12 + (i % 3) * 8, y - 18 + Math.floor(i / 3) * 12, 3, 1.6, 'rgba(0,0,0,.18)');
    const g = 160 + Math.sin(T * 7) * 40;
    poly([x - 6, y + 9, x - 6, y - 2, x + 2, y - 3, x + 2, y + 9], '#1c120a'); ell(x - 2, y + 4, 4, 3, `rgba(255,${g},40,.95)`);
    for (let i = 0; i < 3; i++) { const k = (T * 0.35 + i / 3) % 1; ell(x + Math.sin(T + i * 2) * 3, y - 30 - k * 36, 3 + k * 6, 3 + k * 6, `rgba(90,90,90,${0.3 * (1 - k)})`); }
    for (let i = 0; i < 3; i++) { ell(x + 22 + i * 3, y + 8 - i * 3, 3, 3, '#a9793f'); ell(x + 22 + i * 3, y + 8 - i * 3, 1.3, 1.3, '#6b4722'); }
    ell(x - 22, y + 8, 5, 3, '#3f9a7a');
    if (lv > 1) { ell(x + 14, y + 14, 3, 2, '#d0803a'); ell(x + 9, y + 15, 3, 2, '#d0803a'); }
  } else if (t === 'kovarna') {
    shadow(x, y + 4, 28);
    ctx.fillStyle = '#5b3a1c'; [[-22, -2], [20, -6], [-2, 10]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy - 24, 3, 26));
    roof(x, y - 24, 22, 12, '#9a8a6a', '#7d6f52');
    isoBox(x - 10, y + 2, 7, 8, '#8b8880', '#77746c', '#4a4640');
    ell(x - 10, y - 7, 4, 2, `rgba(255,${150 + Math.sin(T * 8) * 50},40,.95)`);
    poly([x + 4, y + 6, x + 4, y + 1, x + 14, y - 2, x + 14, y + 3], '#3a3a3a'); poly([x + 2, y + 1, x + 6, y - 2, x + 16, y - 5, x + 12, y - 2], '#555');
    for (let i = 0; i < 3; i++) poly([x + 14 + i * 5, y + 12 - i, x + 18 + i * 5, y + 11 - i, x + 18 + i * 5, y + 13 - i, x + 14 + i * 5, y + 14 - i], '#d9b93a', '#7a5a10');
  } else return false;
  if (b.id === selId) diamond(b.x, b.y, 'rgba(255,230,120,.9)', null);
  return true;
}
const ICON = {};
// nová stavba se staví rovnou v nejvyšším stupni, který odemkl výzkum (chýše → hliněný dům → roubenka…)
function startLv(t) {
  const own = new Set(); BLD[t].lv.forEach(l => { if (l.wk) Object.keys(l.wk.out).forEach(r => own.add(r)); if (l.farm) Object.keys(l.farm.out).forEach(r => own.add(r)); });
  let L = 0;
  BLD[t].lv.forEach((l, i) => { if (l.req && !l.into && S.research.done[l.req] && !Object.keys(l.cost || {}).some(r => own.has(r))) L = i; });
  return L;
}
const bldName = (t, L) => (BLD[t].names && BLD[t].names[L]) || BLD[t].name;
function bldIcon(t, lvl) {
  lvl = lvl || 1; const ck = t + lvl;
  if (ICON[ck]) return ICON[ck];
  const key = SPR_B[t] ? t : t + lvl, im = IMG[key];
  if (im && !im.bad) return im.ok ? (ICON[ck] = 'img/s/' + key + '.png') : null;
  if (t === 'pole' && IMG.pole_zrale && IMG.pole_zrale.ok) return (ICON[ck] = 'img/s/pole_zrale.png');
  const c = document.createElement('canvas'); c.width = c.height = 80;
  const saved = ctx; ctx = c.getContext('2d');
  const [wx, wy] = iso(0.5, 0.5), sc = 0.95;
  ctx.setTransform(sc, 0, 0, sc, 40 - wx * sc, 64 - wy * sc);
  try { drawBld({ id: -1, type: t, x: 0, y: 0, lvl, t: 30 }, 1.3); } finally { ctx = saved; }
  try { return (ICON[ck] = c.toDataURL()); } catch (e) { return null; }
}
// otáčivé lopatky větrného mlýna
function drawSails(hx, hy, T, L) {
  const a0 = T * 1.3, k = L / 30;
  for (let i = 0; i < 4; i++) {
    const a = a0 + i * Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
    ctx.strokeStyle = '#4a321c'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + c * L, hy + sn * L); ctx.stroke();
    poly([hx + c * 8 * k - sn * k, hy + sn * 8 * k + c * k, hx + c * L - sn * k, hy + sn * L + c * k, hx + c * L - sn * 7 * k, hy + sn * L + c * 7 * k, hx + c * 8 * k - sn * 7 * k, hy + sn * 8 * k + c * 7 * k], 'rgba(235,225,200,.9)', '#6b5a40');
  }
  ell(hx, hy, 2.5 * k, 2.5 * k, '#3a2614');
}
function drawCart(x, y, d) {
  if (IMG.vuz && IMG.vuz.ok) { shadow(x, y + 1, 14); spr('vuz', x, y, 40, 3, d > 0); return; }
  shadow(x, y + 1, 12);
  poly([x - 11, y - 4, x + 11, y - 4, x + 9, y - 13, x - 9, y - 13], '#8a5f35', '#3a2614');
  ell(x - 3, y - 15, 5, 3.5, '#d9c08a'); ell(x + 4, y - 15, 4.5, 3, '#c2a070');
  ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + d * 10, y - 7); ctx.lineTo(x + d * 18, y - 9); ctx.stroke();
  for (const wx of [-7, 7]) { ell(x + wx, y - 2, 4.5, 4.5, '#5b3a1c'); ell(x + wx, y - 2, 1.5, 1.5, '#2e1d0c'); }
}
function drawTruck(x, y, d) {
  shadow(x, y + 2, 18);
  isoBox(x - d * 5, y + 2, 12, 12, '#3a5a8a', '#2a466e', '#4a6a9a');
  isoBox(x + d * 11, y + 4, 7, 10, '#c83a2a', '#a02e22', '#d84a3a');
  poly([x + d * 9, y - 4, x + d * 15, y - 7, x + d * 15, y - 3, x + d * 9, y], '#9ad0f0');
  for (const wx of [-12, 2, 12]) ell(x + d * wx, y + 6, 3.4, 3.4, '#1a1a1a');
}
function drawCaravan(e, T) {
  const [x, y] = iso(e.x, e.y), d = e.dir || 1;
  drawCart(x - d * 12, y + 1, d); drawDonkey(x + d * 6, y, d, T, e.mv);
}
function drawDonkey(x, y, d, T, mv) {
  if (IMG.osel.ok) { shadow(x, y + 1, 11); spr('osel', x, y - (mv ? Math.abs(Math.sin(T * 9)) : 0), 34, 3, d > 0); return; }
  const l = mv ? Math.sin(T * 9) * 2 : 0;
  shadow(x, y + 1, 10);
  ctx.fillStyle = '#4a4038'; ctx.fillRect(x - 6 + l, y - 7, 1.8, 8); ctx.fillRect(x + 5 - l, y - 7, 1.8, 8);
  ell(x, y - 10, 9, 5, '#8a8378');
  ell(x + d * 9, y - 14, 3.2, 2.6, '#8a8378'); ell(x + d * 11.5, y - 13, 2, 1.6, '#6e675e');
  ctx.strokeStyle = '#6e675e'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x + d * 8, y - 16); ctx.lineTo(x + d * 7, y - 21); ctx.stroke();
  ell(x - 3, y - 14, 4.5, 4, '#a07a48'); ell(x + 3, y - 14, 4, 3.6, '#8a6a3a'); ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 6, y - 16, 12, 1.2);
}
function hpBar(p, x, y) {
  if (p.hp === undefined || p.hp >= 99) return;
  const k = p.hp / 100;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 9, y, 18, 3.5);
  ctx.fillStyle = k > 0.6 ? '#7fd34f' : k > 0.3 ? '#f0c030' : '#e04030'; ctx.fillRect(x - 8.5, y + 0.5, 17 * k, 2.5);
}
function drawStock(b) {
  const [x, y] = iso(b.x + 0.5, b.y + 0.5); let i = 0;
  for (const r in b.stock) for (let k = 0; k < Math.min(6, Math.ceil(b.stock[r] / 3)); k++, i++) {
    const px = x + 20 + (i % 3) * 5 - Math.floor(i / 3) * 3, py = y + 12 - Math.floor(i / 3) * 4 + (i % 3) * 2;
    isoBox(px, py, 3, 3, RCOL[r] || '#aaa', '#3a2a1a', RCOL[r] || '#aaa');
  }
}
function diamond(tx, ty, stroke, fill) {
  const [px, py] = iso(tx, ty);
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + TW / 2, py + TH / 2); ctx.lineTo(px, py + TH); ctx.lineTo(px - TW / 2, py + TH / 2); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function drawSite(s) {
  diamond(s.x, s.y, '#e9d9b0', 'rgba(120,90,50,.45)');
  const [x, y] = iso(s.x + 0.5, s.y + 0.5);
  if (s.upg) return;
  if (!spr('staveniste', x, y, 68, 17)) { ctx.fillStyle = '#5b3a1c'; ctx.fillRect(x - 18, y - 12, 2.5, 14); ctx.fillRect(x + 16, y - 12, 2.5, 14); ctx.fillRect(x - 1, y - 20, 2.5, 14); }
}
function siteBar(s) {
  const [x, y0] = iso(s.x + 0.5, s.y + 0.5), y = y0 - (s.upg ? 44 : 22), k = Math.min(1, s.prog / s.time);
  ctx.fillStyle = '#2b1d0e'; ctx.fillRect(x - 23, y - 33, 46, 8); ctx.fillStyle = '#8fd14f'; ctx.fillRect(x - 21, y - 31, 42 * k, 4);
}
// mezi budovami musí zůstat místo; velké stavby (r: 2) potřebují víc
function tooClose(tx, ty) {
  const r = (placing && BLD[placing].r) || 1;
  const hit = (x, y, type) => Math.max(Math.abs(x - tx), Math.abs(y - ty)) <= Math.max(r, BLD[type].r || 1);
  return S.blds.some(o => hit(o.x, o.y, o.type)) || (S.site && !S.site.upg && hit(S.site.x, S.site.y, S.site.type));
}
function canPlace(tx, ty) {
  if (tx < 1 || ty < 1 || tx >= N - 1 || ty >= N - 1) return false;
  const k = tx + ty * N;
  if (tooClose(tx, ty)) return false;
  const onRock = placing && (BLD[placing].mine || placing === 'lom') && terr[k] === T_ROCK;   // doly a lom jdou stavět i na skálu
  if (!rev[k] || (terr[k] !== T_GRASS && terr[k] !== T_DIRT && !onRock) || occ.has(k) || comp[k] !== comp[CX + CY * N]) return false;
  if (placing && BLD[placing].water && !waterNear({ x: tx, y: ty })) return false;
  if (placing && BLD[placing].mine && !mineNode({ x: tx, y: ty }, BLD[placing].mine)) return false;
  if (beltMap.has(k) || railSet.has(k)) return false;
  if (placing && BLD[placing].rail && !BDIR.some(([dx, dy]) => railSet.has(tx + dx + (ty + dy) * N))) return false;
  return true;
}
function render(T) {
  const W = cv.width, H = cv.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0d0f0c'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
  ctx.imageSmoothingEnabled = true;
  if (terrDirty && S) renderTerrain();
  const x0 = cam.x - W / 2 / cam.z - 80, x1 = cam.x + W / 2 / cam.z + 80, y0 = cam.y - H / 2 / cam.z - 30, y1 = cam.y + H / 2 / cam.z + 90;
  if (terrMode === 'textury' && nzCan) paintChunks(x0, y0, x1, y1);
  { // jen viditelná část terénu
    const sx = Math.max(0, x0), sy = Math.max(0, y0), ex = Math.min(tcan.width, x1), ey = Math.min(tcan.height, y1);
    if (ex > sx && ey > sy) ctx.drawImage(tcan, sx, sy, ex - sx, ey - sy, sx, sy, ex - sx, ey - sy);
  }
  if (terrMode === 'textury') ctx.drawImage(fcan, 0, 0, fcan.width / FS, fcan.height / FS);   // tma nad neprozkoumanou krajinou
  const vis = (x, y) => { const p = iso(x, y); return p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1; };
  // třpyt na vodě
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.beginPath();
  for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
    const i = tx + ty * N; if (terr[i] !== T_WATER || !rev[i]) continue;
    const w = iso(tx, ty); if (w[0] < x0 || w[0] > x1 || w[1] < y0 - 40 || w[1] > y1) continue;
    const hh = hash(tx, ty, 3), k = Math.sin(T * 1.3 + hh * 20); if (k < 0.35) continue;
    const ox = (hh - 0.5) * 30 + Math.sin(T * 0.5 + hh * 9) * 4, oy = 10 + hash(tx, ty, 4) * 12;
    ctx.moveTo(w[0] + ox - 5 * k, w[1] + oy); ctx.lineTo(w[0] + ox + 5 * k, w[1] + oy);
  }
  ctx.stroke(); ctx.lineCap = 'butt';
  if (railSet.size) drawRails(vis);
  if (S.belts.length) drawBelts(T, vis);
  if (S.site) drawSite(S.site);
  if (ping) {
    const k = (performance.now() - ping.t) / 500;
    if (k > 1) ping = null;
    else { const [px, py] = iso(ping.x, ping.y); ctx.beginPath(); ctx.ellipse(px, py, 4 + k * 12, 2 + k * 6, 0, 0, 7); ctx.strokeStyle = `rgba(255,240,150,${1 - k})`; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (railMode && mouse.inside) {
    const [fx, fy] = screenToTile(mouse.x, mouse.y), k = Math.floor(fx) + Math.floor(fy) * N;
    diamond(Math.floor(fx), Math.floor(fy), '#e9d9b0', railSet.has(k) ? 'rgba(230,200,120,.35)' : rev[k] && terr[k] !== T_WATER && !occ.has(k) && !beltMap.has(k) ? 'rgba(140,140,150,.45)' : 'rgba(255,70,50,.3)');
  }
  if (beltMode && mouse.inside) {
    const [fx, fy] = screenToTile(mouse.x, mouse.y), k = Math.floor(fx) + Math.floor(fy) * N;
    diamond(Math.floor(fx), Math.floor(fy), '#e9d9b0', beltMap.has(k) ? 'rgba(230,200,120,.35)' : rev[k] && terr[k] !== T_WATER && !occ.has(k) ? 'rgba(120,120,120,.45)' : 'rgba(255,70,50,.3)');
  }
  if (roadMode && mouse.inside) {
    const [fx, fy] = screenToTile(mouse.x, mouse.y), k = Math.floor(fx) + Math.floor(fy) * N;
    diamond(Math.floor(fx), Math.floor(fy), '#e9d9b0', rev[k] && terr[k] !== T_WATER && !occ.has(k) ? 'rgba(200,180,140,.45)' : 'rgba(255,70,50,.3)');
  }
  if (placing && mouse.inside) {
    const [fx, fy] = screenToTile(mouse.x, mouse.y), tx = Math.floor(fx), ty = Math.floor(fy);
    const ok = canPlace(tx, ty);
    diamond(tx, ty, ok ? '#9cff6b' : '#ff5a4a', ok ? 'rgba(120,255,90,.3)' : 'rgba(255,70,50,.3)');
  }
  const items = [];
  for (const n of S.nodes) if (rev[n.x + n.y * N] && vis(n.x, n.y)) items.push([n.x + n.y + 1, 0, n]);
  for (const b of S.blds) items.push([b.x + b.y + 1, 1, b]);
  for (const p of S.people) items.push([p.x + p.y, 2, p]);
  if (S.wild) for (const w of S.wild) if (rev[Math.floor(w.x) + Math.floor(w.y) * N] && vis(w.x, w.y)) items.push([w.x + w.y, 6, w]);
  if (S.trader && rev[Math.floor(S.trader.x) + Math.floor(S.trader.y) * N]) items.push([S.trader.x + S.trader.y, 3, S.trader]);
  for (const t of S.trains) if (t.pos) items.push([t.pos[0][0] + t.pos[0][1], 5, t]);
  if (S.exped && S.exped.st !== 'away' && rev[Math.floor(S.exped.x) + Math.floor(S.exped.y) * N]) items.push([S.exped.x + S.exped.y, 4, S.exped]);
  items.sort((a, b) => a[0] - b[0]);
  for (const it of items) {
    if (it[1] === 0) drawNode(it[2], T); else if (it[1] === 1) { drawBld(it[2], T); if (it[2].stock) drawStock(it[2]); }
    else if (it[1] === 4) drawCaravan(it[2], T);
    else if (it[1] === 5) drawTrain(it[2]);
    else if (it[1] === 6) drawWild(it[2], T);
    else drawPerson(it[2], T, it[1] === 3);
  }
  if (S.site) siteBar(S.site);
  drawFlight();
  drawDrones(T);
  // noc
  const ph = (S.time % DAY) / DAY;
  let a = 0;
  if (ph >= NIGHT_FROM) a = Math.min(1, (ph - NIGHT_FROM) / 0.05, (1 - ph) / 0.05);
  if (a > 0) {
    lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, W, H);
    lctx.fillStyle = `rgba(8,12,45,${0.58 * a})`; lctx.fillRect(0, 0, W, H);
    const lights = [];
    const f = S.blds.find(b => b.type === 'ohniste');
    if (f && S.fire.lit) lights.push([f, 230]);
    const main = S.blds.find(b => b.type === 'jeskyne');
    if (S.age >= 1 && main) lights.push([main, 300 + S.age * 25]);   // od starověku svítí hlavní budova (lampy, později elektřina)
    for (const o of S.blds) { const l = lvOf(o); if (l.guard) lights.push([o, guardR(l) * TW * 0.75, 0.9]); }   // strážní věže svítí daleko
    if (S.age >= 1) for (const o of S.blds) if (o !== main && o !== f && o.type !== 'pole' && !lvOf(o).guard) lights.push([o, 95 + S.age * 10, 0.55]);   // ostatní stavby svítí slaběji
    for (const [f, R, k = 1] of lights) {
      const [wx, wy] = iso(f.x + 0.5, f.y + 0.5);
      const sx = (wx - cam.x) * cam.z + W / 2, sy = (wy - cam.y) * cam.z + H / 2, r = (R + Math.sin(T * 8 + f.id) * (S.age >= 3 ? 0 : R / 30)) * cam.z;
      if (sx < -r || sy < -r || sx > W + r || sy > H + r) continue;   // mimo obrazovku
      const g = lctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(0.5, `rgba(0,0,0,${0.6 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.globalCompositeOperation = 'destination-out'; lctx.fillStyle = g; lctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.8);
      g2.addColorStop(0, `rgba(255,150,40,${0.22 * a * k})`); g2.addColorStop(1, 'rgba(255,150,40,0)');
      ctx.fillStyle = g2; ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(lcan, 0, 0);
  }
  if (box) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0); ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
  }
}

/* ---------- rozhraní ---------- */
const TOPRES = [
  ['klacky', 'kamen', 'pazourek', 'nastroje', 'kozesiny', 'vedeni', 'musle'],
  ['klacky', 'kamen', 'hlina', 'keramika', 'nastroje', 'med', 'bronz', 'mince', 'vedeni'],
  ['klacky', 'kamen', 'prkna', 'keramika', 'zelruda', 'zelezo', 'nastroje', 'mince', 'vedeni'],
  ['klacky', 'kamen', 'prkna', 'uhli', 'cihly', 'zelruda', 'zelezo', 'ocel', 'stroje', 'mince', 'vedeni'],
  ['kamen', 'prkna', 'uhli', 'cihly', 'ocel', 'stroje', 'plasty', 'elektronika', 'mince', 'vedeni'],
  ['kamen', 'ocel', 'stroje', 'plasty', 'elektronika', 'kompozity', 'roboti', 'uhli', 'mince', 'vedeni']];
// skupiny staveb ve spodní liště
const CATS = [['dum', '🏠', 'Bydlení a sklady'], ['jidlo', '🌾', 'Jídlo'], ['surov', '⛏️', 'Suroviny'], ['vyroba', '🏭', 'Výroba a energie'], ['ost', '🏛️', 'Obchod, vzdělání a doprava']];
const CAT_OF = { chyse: 'dum', jama: 'dum', sypka: 'dum', sklad: 'dum',
  straz: 'ost', ohniste: 'jidlo', pole: 'jidlo', ohrada: 'jidlo', lovec: 'jidlo', ryby: 'jidlo', mlyn: 'jidlo', pekarna: 'jidlo', vfarma: 'jidlo',
  drevo: 'surov', lom: 'surov', hliniste: 'surov', skolka: 'surov', dul_uhli: 'surov', dul_zelezo: 'surov', ropny_vrt: 'surov' };
const catOf = t => CAT_OF[t] || (['skala', 'svatyne', 'smeniste', 'klaster', 'nadrazi', 'letiste', 'dronport', 'vytah'].includes(t) ? 'ost' : 'vyroba');
const perkCost = () => Math.round(800 * Math.pow(1.6, S.perk || 0));
function renderUI() {
  JOBS.klacky.name = S.age >= 1 ? 'Dřevorubci' : 'Sběrači klacků';
  RES.klacky[1] = S.age >= 1 ? 'Klády' : 'Klacky';   // od starověku se kácí klády
  if (!S) return;
  const cap = storeCap(), free = S.people.filter(p => !p.job).length, night = isNight();
  let h = '';
  // jen suroviny důležité pro tento věk; všechno jídlo jako jedno číslo; zbytek v přehledu skladu
  const FOOD = ['chleb', 'maso', 'ryby', 'obili', 'bobule'];
  const fsum = FOOD.reduce((a, r) => a + Math.floor(S.res[r]), 0);
  h += `<span class="r" title="Jídlo celkem: ${FOOD.filter(r => S.res[r] >= 1).map(r => RES[r][1].toLowerCase() + ' ' + Math.floor(S.res[r])).join(', ') || 'nic'}${S.dietShare && S.age >= 1 ? ` – lidé dostávají ${Math.round(S.dietShare[0] * 100)} % porce masa/ryb a ${Math.round(S.dietShare[1] * 100)} % porce ${has('pekarna') ? 'chleba' : 'obilí'}` : ''}">🍽 ${fsum}${S.dietShare && S.age >= 1 && Math.min(...S.dietShare) < 0.9 ? ` <small style="color:#ffcf7a">(${has('pekarna') ? '🍞' : '🌾'} ${Math.round(S.dietShare[1] * 100)} %)</small>` : ''}</span>`;
  for (const r of TOPRES[Math.min(S.age, 5)]) {
    const v = Math.floor(S.res[r]); if (r === 'musle' && !v) continue;
    const full = !UNCAPPED[r] && v >= cap;
    h += `<span class="r" title="${RES[r][1]}${full ? ' – sklad je plný' : ''}"${full ? ' style="color:#ff9c7a;font-weight:bold"' : ''}>${RES[r][0]} ${v}</span>`;
  }
  if (S.research.done.elektrina) h += `<span class="r" title="Proud: vyrobeno / spotřeba továren"${S.powerShort ? ' style="color:#ff9c7a;font-weight:bold"' : ''}>⚡ ${S.powerCap || 0}/${S.powerUse || 0}${S.powerShort ? ' málo proudu!' : ''}</span>`;
  h += `<button data-a="store" title="Přehled všech surovin ve skladu">📦 ${cap}</button>`;
  { const weak = S.people.filter(p => p.hp !== undefined && p.hp < 50).length, avg = S.people.reduce((a, p) => a + (p.hp === undefined ? 100 : p.hp), 0) / Math.max(1, S.people.length);
    if (avg < 98) h += `<span class="r" title="Průměrné zdraví lidí${weak ? ' – ' + weak + ' je vážně oslabeno' : ''}"${avg < 60 ? ' style="color:#ff9c7a;font-weight:bold"' : ''}>❤ ${Math.round(avg)} %${S.starve ? ' hlad!' : S.cold ? ' zima!' : ''}</span>`; }
  if (S.unhappy > 0) h += `<span class="r" style="color:#ff9c7a" title="Když lidem dlouho chybí zboží, začnou se odstěhovávat.">🧳 lidé se chystají odejít</span>`;
  if (S.growWhy) h += `<span class="r" style="color:#ff9c7a" title="Osada neroste: ${S.growWhy}">😟 ${S.growWhy}</span>`;
  h += `<span class="r" title="Obyvatelé / místo k bydlení">👥 ${S.people.length}/${popCap()}</span>`;
  h += `<span class="r">${night ? '🌙 Noc' : '☀️ Den'} ${dayNo()}${S.cold ? ' – mrznou!' : ''}</span>`;
  h += `<span class="sp"></span>`;
  { const rc = S.research.cur; h += `<button data-a="research" class="${rc ? 'on' : ''}">${rc ? '🔬 ' + TECH[rc.id].name + ' ' + Math.floor(rc.t / TECH[rc.id].time * 100) + ' %' : '🌳 Technologie'}</button>`; }
  [[0, '⏸'], [1, '1×'], [2, '2×'], [4, '4×']].forEach(s => h += `<button data-a="speed" data-v="${s[0]}" class="${S.speed === s[0] ? 'on' : ''}">${s[1]}</button>`);
  if (S.wild && S.wild.length) h += `<button data-a="alarm" class="${S.alarm ? 'on' : ''}" title="Poplach: všichni se schovají u skladů. Klikněte znovu a vrátí se do práce.">🔔${S.alarm ? ' Poplach!' : ''}</button>`;
  if (S.attackAt) h += `<button data-a="gotoAttack" style="color:#a01010;font-weight:bold" title="Ukázat místo útoku">📍 Útok!</button>`;
  h += `<button data-a="mute" title="${SET.mute ? 'Zapnout zvuk' : 'Ztlumit zvuk'}">${SET.mute ? '🔇' : '🔊'}</button><button data-a="save">💾 Uložit</button><button data-a="menu">☰ Hra</button>`;
  $('top').innerHTML = h;
  { const tp = $('top').offsetHeight + 8 + 'px'; $('left').style.top = tp; $('right').style.top = tp; }

  h = `<h3>Úkol</h3><div class="obj">${OBJ[S.obj].t}</div><div class="log">`;
  S.log.slice(-5).reverse().forEach(m => h += `<div>• ${m}</div>`);
  $('left').innerHTML = h + '</div>';

  h = `<h3>Lidé</h3>`;
  const cnt = {}; S.people.forEach(p => { if (p.job) cnt[p.job] = (cnt[p.job] || 0) + 1; });
  for (const j in JOBS) {
    const sl = jobSlots(j), n = cnt[j] || 0;
    if (!n && (j === 'stavba' ? !S.site : jobLocked(j) || (jobMax(j) < 1e9 && !sl))) continue;
    const canAdd = free > 0 && n < jobMax(j) && (j !== 'stavba' || S.site) && !jobLocked(j);
    h += `<div class="job"><span class="n"><span style="color:${JOBS[j].color}">■</span> ${JOBS[j].name}${sl ? ` <small title="Kolik z nich má místo v chatě / kolik míst je">(🏠${Math.min(n, sl)}/${sl})</small>` : ''}</span><button data-a="job-" data-v="${j}" class="${n ? '' : 'off'}" title="Jeden přestane pracovat">−</button><b>${n}</b><button data-a="job+" data-v="${j}" class="${canAdd ? '' : 'off'}" title="Pošle jednoho nečinného">+</button></div>`;
  }
  h += `<div class="job"><span class="n"><span style="color:#b9a37a">■</span> Nečinní</span><b>${free}</b></div>`;
  h += `<button data-a="fillIdle" class="${free ? '' : 'off'}" style="width:100%;margin-top:4px">👷 Nečinné do volných míst</button>`;
  h += `<button data-a="idle" class="${free ? '' : 'off'}" style="width:100%;margin-top:4px">Najít nečinného (klávesa tečka)</button>`;
  h += `<div class="hint"><b>+ a −</b> pošle nečinného člověka na práci nebo ho z ní odvolá.<br><b>Levé tlačítko</b> (i tažením) lidi označí.<br><b>Pravé tlačítko</b> je pošle na surovinu (strom, keř, kámen, zvěř…) nebo na pracoviště (dílna, pole, ohrada, rybářská chata…). Pravým do trávy jen přejdou.</div>`;
  $('right').innerHTML = h;

  h = '';
  if (S.site) {
    const nb = cnt.stavba || 0;
    h += `<div class="bb">🔨 ${S.site.upg ? 'Přestavba na' : 'Staví se'}: <b>${S.site.upg ? (bById(S.site.upg) ? bldName(S.site.type, bById(S.site.upg).lvl) : BLD[S.site.type].name) : bldName(S.site.type, (S.site.lv || 1) - 1)}</b> ${Math.floor(Math.min(1, S.site.prog / S.site.time) * 100)} %<br><small>${nb ? 'Staví ' + nb + (nb === 1 ? ' člověk.' : nb < 5 ? ' lidé.' : ' lidí.') : '<span class="lack">Nikdo není volný – odvolejte někoho z práce (tlačítkem −) nebo pošlete lidi pravým tlačítkem na staveniště.</span>'}</small></div>`;
  } else if (railMode) {
    h += `<div class="bb">🛤 Kreslete koleje tažením myši. Pravým tlačítkem je zbouráte. Cena ${costStr(RAIL_COST)} za políčko. <button data-a="railEnd">Hotovo (Esc)</button></div>`;
  } else if (beltMode) {
    h += `<div class="bb">⚙ Kreslete pás tažením myši – jede směrem tahu. Klik na pás ho otočí, pravým tlačítkem ho zbouráte. Cena ${costStr(BELT_COST)} za políčko. <button data-a="beltEnd">Hotovo (Esc)</button></div>`;
  } else if (roadMode) {
    h += `<div class="bb">🛤 Kreslete cestu tažením myši – 1 kámen za políčko. <button data-a="roadEnd">Hotovo (Esc)</button></div>`;
  } else if (placing) {
    h += `<div class="bb">Klikněte do mapy, kam postavit: <b>${bldName(placing, startLv(placing))}</b> <button data-a="cancel">Zrušit (Esc)</button></div>`;
  } else {
    let any = false;
    const avail = Object.keys(BLD).filter(t => { const d = BLD[t]; return d.req && S.research.done[d.req] && !(d.unique && has(t)) && !(d.until && S.age >= d.until); });
    const cats = CATS.filter(c => avail.some(t => catOf(t) === c[0]) || (c[0] === 'ost' && (S.research.done.cesty || S.research.done.zeleznice)));
    if (!cats.some(c => c[0] === S.cat)) S.cat = cats.length ? cats[0][0] : null;
    for (const [k, ic, nm] of cats) h += `<button class="bi cat ${S.cat === k ? 'on' : ''}" data-a="cat" data-v="${k}" aria-label="${nm}" title="${nm}"><span>${ic}</span></button>`;
    if (cats.length) h += `<span class="sepb"></span>`;
    for (const t of avail) {
      const d = BLD[t];
      if (catOf(t) !== S.cat) continue;
      any = true;
      const L = startLv(t), ic = bldIcon(t, L + 1);
      h += `<button class="bi ${canPay(d.lv[L].cost) ? '' : 'off'}" data-a="build" data-v="${t}" aria-label="${bldName(t, L)}">${ic ? `<img src="${ic}" alt="">` : ''}</button>`;
    }
    if (S.cat === 'ost' && S.research.done.zeleznice) h += `<button class="bi" data-a="rail" data-v="__rail" aria-label="Koleje"><img src="${railIcon()}" alt=""></button>`;
    if (S.cat === 'ost' && S.research.done.cesty) h += `<button class="bi" data-a="road" data-v="__road" aria-label="Cesta"><img src="${roadIcon()}" alt=""></button>`;
    if (!any && !cats.length) h += `<div class="bb">Zatím není co stavět. Nahoře otevřete Technologie.</div>`;
  }
  if ($('bottom')._h !== h) { $('bottom').innerHTML = h; $('bottom')._h = h; }
  { // ikony se zmenší, aby se vždy vešly do jedné řady
    const n = $('bottom').querySelectorAll('.bi').length;
    const bs = Math.max(30, Math.min(52, Math.floor((window.innerWidth - 24) / Math.max(1, n)) - 4)) + 'px';
    if ($('bottom').style.getPropertyValue('--bs') !== bs) $('bottom').style.setProperty('--bs', bs);
  }
  renderTip();
  $('bottom').innerHTML = h;

  const b = selId && bById(selId), se = $('sel');
  if (b) {
    const d = BLD[b.type], nx = d.lv[b.lvl];
    h = `<h3>${bname(b)}${d.lv.length > 1 ? ' – stupeň ' + b.lvl : ''}</h3><div>${d.desc}${d.descAge && S.age >= 1 ? ' ' + d.descAge : ''}</div>`;
    const l = lvOf(b);
    if (l.pop && b.type !== 'jeskyne') h += `<div class="hint">Bydlí tu ${l.pop} lidí.</div>`;
    if (l.store && b.type !== 'jeskyne') h += `<div class="hint">Sklad +${l.store}.</div>`;
    if (l.js) h += `<div class="hint">Pracovní místa: ${Object.keys(l.js).map(j => JOBS[j].name.toLowerCase() + ' ' + l.js[j]).join(', ')}. Lidi sem pošlete tlačítkem + v panelu Lidé, nebo je označte a klikněte pravým tlačítkem.</div>`;
    if (l.mine) { const nd = mineNode(b, l.mine); h += `<div class="hint">Ložisko: ${nd ? 'zbývá ' + Math.floor(nd.amt) + ' ' + RES[l.mine][1].toLowerCase() : '<span class="lack">vyčerpané</span>'}.</div>`; }
    if (b.noPower) h += `<div class="hint lack">⚡ Nedostatek elektřiny – továrna jede jen na pětinu. Postavte další elektrárnu.</div>`;
    else if (NEED_POWER[b.type]) h += `<div class="hint">⚡ Potřebuje elektřinu – má jí dost.</div>`;
    if (stockOf(b)) h += `<div class="hint">📦 U stavby čeká na odnesení: ${Object.keys(b.stock).filter(r => b.stock[r] > 0).map(r => RES[r][0] + b.stock[r]).join(' ')}. Pracovníci to nosí do nejbližšího skladu.</div>`;
    if (b.rail) h += `<div class="hint">🚂 Výrobky odváží vlak – pracuje o polovinu rychleji.</div>`;
    if (false) h += `<div class="hint">${b.fed === 2 ? '⚡ Vše dováží pás – pracuje dvakrát rychleji.' : b.fed === 1 ? '⚡ Část surovin dováží pás – pracuje o polovinu rychleji. Přiveďte pásem i zbytek.' : 'Bere suroviny ze skladu. Přiveďte je pásem a bude pracovat až dvakrát rychleji.'} Na pásu dovezeno: ${Object.keys(wkIn(l)).map(r => RES[r][0] + (b.buf && b.buf[r] || 0)).join(' ')}</div>`;
    if (false) h += `<div class="hint">${outBeltOf(b) ? 'Výrobky odjíždějí po pásu.' : 'Výrobky jdou rovnou do skladu (nebo je odvezte pásem).'}</div>`;
    if (l.wk) h += `<div class="hint">Vyrábí: ${costPlain(wkIn(l))} → <b>${costPlain(l.wk.out)}</b>.${b.lack ? ` <span class="lack">${b.lack}</span>` : ''}</div>`;
    if (l.wk) {
      { const o0 = Object.keys(l.wk.out)[0]; h += `<div class="job"><span class="n"><small>Vyrábět jen do ${RES[o0][0]} ${RES[o0][1].toLowerCase()}:</small></span><button data-a="lim-">−</button><b style="width:44px">${b.limit || 'bez'}</b><button data-a="lim+">+</button></div>`; }
      h += `<div style="margin-top:4px"><button data-a="wkPause">${b.paused ? '▶ Spustit výrobu' : '⏸ Zastavit výrobu'}</button></div>`;
      Object.keys(wkIn(l)).forEach(r => h += `<div class="job"><span class="n"><small>Nechat v zásobě ${RES[r][0]} ${RES[r][1].toLowerCase()}:</small></span><button data-a="keep-" data-v="${r}">−</button><b style="width:34px">${S.keep[r] || 0}</b><button data-a="keep+" data-v="${r}">+</button></div>`);
      h += `<div class="hint">Dílna nesáhne na suroviny pod touto zásobou – zbydou na stavby. Zásoba platí pro všechny dílny.</div>`;
    }
    if (l.farm) h += `<div class="hint">Jedna sklizeň: ${costPlain(l.farm.out)}.</div>`;
    if (l.trade) h += `<div class="hint">Kupci chodí častěji a nabízejí ${4 + l.trade * 2} druhy zboží.</div>`;
    if (b.type === 'smeniste') h += `<div style="margin-top:6px"><button data-a="market">🏪 Otevřít tržiště – nákup a prodej</button></div>`;
    if (l.power) h += `<div class="hint">${b.on ? '⚡ Vyrábí proud.' : '<span class="lack">' + (b.lack || 'Stojí.') + '</span>'} Uhlí v zásobníku: ${b.buf && b.buf.uhli || 0}. Celkem proudu: ${S.powerCap} / spotřeba továren ${S.powerUse}${S.powerOk ? ' – stačí.' : ' – <span class="lack">nestačí, postavte další elektrárnu.</span>'}</div>`;
    if (b.type === 'nadrazi') {
      const tr = S.trains.find(t => t.at === b.id || t.to === b.id);
      h += `<div class="hint">Čeká na odvoz: ${b.buf && Object.keys(b.buf).filter(r => b.buf[r] > 0).map(r => RES[r][0] + b.buf[r]).join(' ') || 'nic'}.<br>${tr ? (tr.st === 'move' ? '🚂 Vlak je na cestě.' : '🚂 Vlak stojí na nádraží ' + (tr.at === b.id ? 'tady' : 'na druhém konci trati') + '.') : 'Žádný vlak – spojte kolejemi aspoň dvě nádraží.'} Továrny a doly do 8 políček sem posílají výrobky a pracují o polovinu rychleji.</div>`;
    }
    if (l.air) {
      if (!S.aircon) genAir();
      if (S.flight) h += `<div class="hint">✈ Letadlo letí do ${S.flight.c.to}, vrátí se asi za ${Math.ceil(48 - S.flight.t)} s.</div>`;
      else { h += `<div class="hint"><b>Letecký obchod</b>:</div>`; S.aircon.forEach((c, i) => h += `<div class="hint">Do ${c.to}: <span class="cost">${costStr(c.want)}</span> → ${costPlain(c.get)} <button data-a="fly" data-v="${i}" class="${canPay(c.want) ? '' : 'off'}">Letět</button></div>`); }
    }
    if (l.exped) {
      if (!S.contracts) genContracts();
      if (S.exped) h += `<div class="hint">🐴 Povoz je na cestě do ${S.exped.c.to}${S.exped.st === 'away' ? ` – vrátí se asi za ${Math.ceil(S.exped.t + 25)} s` : ''}.</div>`;
      else {
        h += `<div class="hint"><b>Obchodní výprava</b> – zboží odveze povoz do sousedního města:</div>`;
        S.contracts.forEach((c, i) => h += `<div class="hint">Do ${c.to}: <span class="cost">${costStr(c.want)}</span> → ${costPlain(c.get)} <button data-a="exped" data-v="${i}" class="${canPay(c.want) ? '' : 'off'}">Vypravit</button></div>`);
      }
    }
    if (b.type === 'ohniste') h += `<div class="hint">${S.fire.lit ? 'Hoří. Spálí 1 klacek za chvíli.' : 'Vyhaslo – chybějí klacky.'}</div>`;
    if (b.type === 'jeskyne') {
      const food = S.people.length * 60 / 40 * (1 + 0.25 * Math.min(S.age, 4)), wood = S.people.length * 60 / 400 * Math.min(S.age, 3);
      const goods = NEEDS.filter(needOn).map(nd => `${RES[nd.r][0]} ${RES[nd.r][1].toLowerCase()} asi ${Math.max(1, Math.round(S.people.length * nd.per))}`);
      h += `<div class="hint">Spotřeba za minutu: jídlo asi ${Math.round(food)}${wood ? `, ${S.age >= 3 ? 'dřevo (bez dřeva uhlí)' : 'dřevo'} na topení asi ${Math.round(wood)}` : ''}${goods.length ? ', ' + goods.join(', ') : ''}.</div>`;
      if (S.missing && S.missing.length) h += `<div class="hint lack">Chybí: ${S.missing.map(missName).join(', ')} – osada neroste.</div>`;
      if (S.age >= 1) h += `<div style="margin-top:4px"><button data-a="invite" class="${S.res.mince >= 30 && S.people.length + 2 <= popCap() ? '' : 'off'}">👥 Pozvat 2 osadníky – 🪙30</button>${S.people.length + 2 > popCap() ? ' <small class="lack">Není kde bydlet.</small>' : ''}</div>`;
    }
    if (b.type === 'jeskyne') h += `<div class="hint">Bydlí tu ${6 + (l.pop || 0)} lidí. Sklad ${60 + (l.store || 0)}.</div><button data-a="research">🌳 Technologie</button>`;
    const why = nx ? upgWhy(nx) : '';
    if (nx && nx.age) h += `<div class="hint" style="margin-top:8px"><b>🏛 Postup do ${['', 'starověku', 'středověku', 'průmyslové doby', 'moderní doby', 'budoucnosti'][nx.age]}:</b> přestavba na ${d.names[b.lvl]}.${why ? ` <span class="lack">${why}</span>` : ''}</div>`;
    if (nx && why && !nx.age) h += `<div class="hint">🔒 Další stupeň (${d.names ? d.names[b.lvl] : (b.lvl + 1) + '. stupeň'}): ${why}</div>`;
    else if (nx) h += `<div style="margin-top:6px"><button data-a="upgrade" class="${!S.site && !why && canPay(nx.cost) ? '' : 'off'}">⬆ ${d.names ? 'Přestavět: ' + d.names[b.lvl] : 'Vylepšit na ' + (b.lvl + 1) + '. stupeň'}</button> <span class="cost">${costStr(nx.cost)}</span></div>${S.site ? '<div class="hint">Nejdřív se musí dostavět rozestavěná stavba.</div>' : ''}`;
    else if (d.lv.length > 1) h += `<div class="hint">Nejvyšší stupeň v tomto věku.</div>`;
    if (b.type !== 'jeskyne') h += `<div style="margin-top:6px"><button data-a="demolish">${S.delArm === b.id ? '⚠ Opravdu zbourat? Klikněte znovu' : '🗑 Zbourat'}</button> <small>vrátí se polovina materiálu</small></div>`;
    se.innerHTML = h; se.style.display = 'block';
  } else if (selP.size) {
    const ppl = S.people.filter(p => selP.has(p.id)), c2 = {};
    ppl.forEach(p => { const k = p.job ? JOBS[p.job].name : 'Nečinní'; c2[k] = (c2[k] || 0) + 1; });
    if (!ppl.length) { selP.clear(); se.style.display = 'none'; }
    else {
      const ahp = Math.round(ppl.reduce((a, q) => a + (q.hp === undefined ? 100 : q.hp), 0) / ppl.length);
      se.innerHTML = `<h3>Vybráno: ${ppl.length} ${ppl.length === 1 ? 'člověk' : ppl.length < 5 ? 'lidé' : 'lidí'}</h3><div>${Object.keys(c2).map(k => k + ' ' + c2[k]).join(', ')}</div><div class="hint">❤ Zdraví: ${ahp} %</div><div class="hint">Pravým tlačítkem myši je pošlete pracovat.</div><button data-a="stop" style="margin-top:6px">✋ Zastavit práci</button>`;
      se.style.display = 'block';
    }
  } else se.style.display = 'none';

  $('traderBtn').textContent = S.age ? '🐴 Kupec čeká – obchodovat' : '🧳 Pocestný čeká u ohně – směnit';
  $('traderBtn').style.display = S.trader && S.trader.st === 'wait' && modalKind !== 'trade' ? 'block' : 'none';
  if (modalKind === 'research' || modalKind === 'trade') showModal(modalKind);
}

function showModal(kind) {
  modalKind = kind; let h = '';
  if (kind === 'research') {
    const pc = perkCost();
    h = `<div class="tech" style="float:right;max-width:330px;margin-left:8px"><b>📈 Zdokonalování výroby – úroveň ${S.perk || 0}</b><small>Každá úroveň zrychlí všechny dílny, továrny a sběr o 10 %. Dá se opakovat.</small><div class="tc"><span class="cost">${costStr({ vedeni: pc })}</span> <button data-a="perk" class="${S.res.vedeni >= pc ? '' : 'off'}">Zdokonalit</button></div></div><h3>🌳 Strom technologií</h3><div class="hint" style="margin-top:0">Najeďte myší na kartu a uvidíte, co výzkum přinese. Bádá se na pozadí, vždy jen jedna věc.</div>`;
    TECH_TREE.filter((_, ai) => ai <= S.age).forEach(([age, tiers]) => {
      h += `<h4 class="age">${age}</h4><div class="tree">`;
      tiers.forEach((tier, ti) => {
        if (ti) h += `<div class="arr">➜</div>`;
        h += `<div class="tier">`;
        tier.forEach(id => {
          const t = TECH[id], done = S.research.done[id], cur = S.research.cur && S.research.cur.id === id;
          const miss = (t.req || []).filter(r => !S.research.done[r]), popOk = !t.pop || S.people.length >= t.pop;
          // karta: jen název a pod ním, co je potřeba; popis se ukáže po najetí myší
          const need = `<span class="cost">${costStr(t.cost)}${t.pop ? ` <span class="${popOk ? '' : 'lack'}">👥${t.pop}</span>` : ''}</span>`;
          const st = done ? '✔ Hotovo'
            : miss.length ? `🔒 ${miss.map(r => TECH[r].name).join(', ')}`
            : t.age && !cur ? '🏛 přestavbou hlavní budovy'
            : cur ? `Bádá se… ${Math.floor(S.research.cur.t / t.time * 100)} %`
            : `${need} <button data-a="tech" data-v="${id}" class="${!S.research.cur && canPay(t.cost) && popOk ? '' : 'off'}">Bádat</button>`;
          h += `<div class="tech ${done ? 'done' : cur ? 'cur' : miss.length ? 'lock' : ''}" title="${t.desc}"><b>${t.name}</b><div class="tc">${st}</div></div>`;
        });
        h += `</div>`;
      });
      h += `</div>`;
    });
    if (S.age < TECH_TREE.length - 1) h += `<div class="hint" style="margin-top:8px">🔒 Výzkumy dalšího věku se ukážou, až přestavíte hlavní budovu.</div>`;
    h += `<div style="text-align:right;margin-top:8px"><button data-a="close">Zavřít</button></div>`;
  } else if (kind === 'trade') {
    const t = S.trader; if (!t || t.st !== 'wait') return closeModal();
    h = `<h3>${S.age ? '🐴 Kupec se soumarem' : '🧳 Pocestný u ohně'}</h3><div><i>„${t.news}“</i></div><div class="hint">Zdrží se ještě asi ${Math.ceil(t.t)} s.</div>`;
    t.offers.forEach((o, i) => {
      h += `<div class="row ${o.left ? '' : 'done'}"><div class="d">Dá vám <b>${costPlain(o.give)}</b><br>za <span class="cost">${costStr(o.want)}</span></div><div>${o.left ? `<button data-a="deal" data-v="${i}" class="${canPay(o.want) ? '' : 'off'}">Směnit (${o.left}×)</button>` : 'Vyměněno'}</div></div>`;
    });
    h += `<div style="text-align:right;margin-top:8px"><button data-a="sendoff">👋 Poslat pryč</button> <button data-a="close">Zavřít</button></div>`;
  } else if (kind === 'menu') {
    h = `<h3>☰ Hra</h3>
      <div class="row"><div class="d"><b>Uložit</b><br><small>Hra se ukládá sama každou minutu do prohlížeče.</small></div><button data-a="save">💾 Uložit teď</button></div>
      <div class="row"><div class="d"><b>Uložené hry</b><br><small>Uložit hru pod jménem nebo načíst jinou.</small></div><button data-a="saves">📂 Uložené hry</button></div>
      <div class="row"><div class="d"><b>Záloha do souboru</b><br><small>Stáhne uloženou hru jako soubor. Hodí se před mazáním dat prohlížeče.</small></div><button data-a="export">⬇ Export</button></div>
      <div class="row"><div class="d"><b>Načíst ze souboru</b><br><small>Nahradí rozehranou hru zálohou.</small></div><button data-a="import">⬆ Import</button></div>
      <div class="row"><div class="d"><b>Nová hra</b><br><small>Smaže rozehranou hru a začne znovu.</small></div><button data-a="new">Nová hra</button></div>
      <div class="row"><div class="d"><b>Hlavní menu</b><br><small>Uloží hru a vrátí se na úvodní obrazovku.</small></div><button data-a="title">🏠 Menu</button></div>
      <div class="hint">Ovládání: levé tlačítko označuje lidi a stavby, pravé posílá označené lidi pracovat. Mapu posouváte tažením pravým tlačítkem nebo klávesami WASD/šipkami, kolečkem přibližujete. Tečka najde nečinného člověka, mezerník pozastaví hru, Esc ruší výběr a stavění.</div>
      <div style="text-align:right;margin-top:8px"><button data-a="close">Zpět do hry</button></div>`;
  } else if (kind === 'saves') {
    h = '<h3>💾 Uložit / načíst hru</h3><div id="saveBox"></div>';
    $('modalBox').style.width = ''; $('modalBox').innerHTML = h; $('modal').style.display = 'flex';
    fillSaves($('modalBox').querySelector('#saveBox'), true); return;
  } else if (kind === 'confirmNew') {
    h = `<h3>Nová hra</h3><div>Opravdu smazat rozehranou hru a začít znovu?</div><div style="text-align:right;margin-top:10px"><button data-a="newYes">Ano, začít znovu</button> <button data-a="close">Ne</button></div>`;
  } else if (kind === 'intro') {
    h = `<h3>Ages of Ember</h3><p style="margin-top:-4px"><i>od ohně ke hvězdám</i></p>
      <p>Je konec doby ledové. Váš kmen – pět lidí – našel úkryt v jeskyni. Je zima, tma a v zásobě jen hrst bobulí.</p>
      <p>Odtud povede dlouhá cesta: oheň, nástroje, chýše, pole, města, továrny, vlaky… až ke hvězdám. Hra obsahuje celou cestu: pravěk, starověk, středověk, průmyslovou dobu, moderní dobu a <b>budoucnost</b> až po vesmírný výtah.</p>
      <p><b>Jak hrát:</b> lidi označíte levým tlačítkem myši (kliknutím nebo tažením rámečku) a pravým tlačítkem je pošlete pracovat – na strom, keř, kámen, zvěř nebo staveniště. Vlevo vidíte úkol, který vás vede příběhem. Dole stavíte, vždy jen jednu stavbu naráz. Nahoře je strom technologií.</p>
      <div style="text-align:right"><button data-a="close">Začít</button></div>`;
  } else if (kind === 'win') {
    h = `<h3>Začíná starověk</h3><p>Kmen už nekočuje. U ohně stojí chýše, na skále malby a na polích roste obilí. Místo pocestných teď přicházejí kupci se soumary a chtějí platit mincemi.</p>
      <p><b>Co je nového:</b> hlína a hrnčíři, lesní školka na sázení stromů, ohrada se zvířaty, tržiště pro kupce, měď, cín a bronz, hliněné domy. Nové výzkumy najdete ve stromu technologií.</p>
      <p>Jeskyně se proměnila v <b>náčelníkův dlouhý dům</b> – pojme víc lidí i zásob.</p>
      <div style="text-align:right"><button data-a="close">Pokračovat</button></div>`;
  } else if (kind === 'win2') {
    h = `<h3>Začíná středověk</h3><p>Nad osadou se tyčí hrad. Písaři na hradě zapisují úrodu, dluhy i smlouvy s kupci. Z osady u jeskyně je město s tržištěm a kovárnou.</p>
      <p><b>Co je nového:</b> pila a prkna, roubenky a skladiště, větrný mlýn a pekárna (chléb), dlážděné cesty, trakaře, železo, klášter a obchodní povozy do sousedních měst. Nové výzkumy najdete ve stromu technologií.</p>
      <div style="text-align:right"><button data-a="close">Pokračovat</button></div>`;
  } else if (kind === 'win3') {
    h = `<h3>Začíná průmyslová doba</h3><p>Hrad vystřídala radnice na náměstí – o městě teď rozhodují měšťané. Přichází parní stroj, uhlí a továrny.</p>
      <p><b>Co je nového:</b> velká ložiska uhlí a doly, které těží samy, cihelna, ocelárna a strojírna, dopravníky, které továrny zrychlí, cihlové činžáky a topení uhlím. Nové výzkumy najdete ve stromu technologií.</p>
      <div style="text-align:right"><button data-a="close">Pokračovat</button></div>`;
  } else if (kind === 'win4') {
    h = `<h3>Začíná moderní doba</h3><p>Místo radnice se nad městem tyčí mrakodrap a do města přichází elektřina.</p>
      <p><b>Co je nového:</b> elektrárna (továrny s proudem pracují o polovinu rychleji), železnice s vlaky mezi nádražími, ropa a plasty, elektronika, panelové domy a letiště s leteckým obchodem.</p>
      <div style="text-align:right"><button data-a="close">Pokračovat</button></div>`;
  } else if (kind === 'win5') {
    h = `<h3>Začíná budoucnost</h3><p>Ve středu města stojí vesmírné centrum, mezi nádražími jezdí vlaky a z letiště startují letadla do celého světa. Teď přichází poslední věk.</p>
      <p><b>Co je nového:</b> fúzní reaktor, drony zásobující továrny, kompozity a roboti, vertikální farmy, arkologie – a nakonec vesmírný výtah, cesta ke hvězdám.</p>
      <div style="text-align:right"><button data-a="close">Pokračovat</button></div>`;
  } else if (kind === 'final') {
    h = `<h3>🚀 Ke hvězdám</h3><p>Po laně vesmírného výtahu stoupá první kabina k oběžné dráze. Kmen, který se kdysi choulil v jeskyni u ohně, dnes posílá lidi ke hvězdám.</p>
      <p>Ages of Ember – od ohně ke hvězdám. <b>Příběh je u konce</b>. Děkujeme za hru! Město můžete dál rozvíjet, uložená hra zůstane.</p>
      <p class="hint">Za ${dayNo()} dní, ${S.people.length} obyvatel.</p>
      <div style="text-align:right"><button data-a="close">Pokračovat ve hře</button></div>`;
  } else if (kind === 'market') {
    const cap = storeCap(), buy = BUYABLE[Math.min(S.age, 5)];
    h = `<h3>🏪 Tržiště</h3><div class="hint" style="margin-top:0">Nakupuje a prodává se po 10 kusech. Máte <b>🪙 ${Math.floor(S.res.mince)}</b>. Prodá se jen to, co je nad nastavenou zásobou.</div>
      <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:14px"><tr style="text-align:left;border-bottom:1px solid #8a6a3a"><th>Surovina</th><th>Sklad</th><th>Koupit 10</th><th>Prodat 10</th></tr>`;
    for (const r of ageRes()) {
      if (!VAL[r] || UNCAPPED[r]) continue;
      const v = Math.floor(S.res[r]), canB = buy.includes(r), canS = v - (S.keep[r] || 0) >= 10;
      h += `<tr style="border-bottom:1px solid rgba(138,106,58,.3)${v ? '' : ';opacity:.6'}"><td>${RES[r][0]} ${RES[r][1]}</td><td>${v}/${cap}</td>
        <td>${canB ? `<button data-a="buy" data-v="${r}" class="${S.res.mince >= buyPrice(r) && v + 10 <= cap ? '' : 'off'}">🪙${buyPrice(r)}</button>` : '<small>–</small>'}</td>
        <td><button data-a="sell" data-v="${r}" class="${canS ? '' : 'off'}">+🪙${sellPrice(r)}</button></td></tr>`;
    }
    h += `</table><div class="hint">Šedé tlačítko: chybí mince, sklad je plný, nebo nemáte 10 kusů navíc. „–“ znamená, že kupci tuto surovinu v této době nevozí.</div><div style="text-align:right;margin-top:8px"><button data-a="close">Zavřít</button></div>`;
  } else if (kind === 'store') {
    const cap = storeCap();
    h = `<h3>📦 Sklad – pojme ${cap} od každé suroviny</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px 12px">`;
    for (const r of ageRes()) {
      const v = Math.floor(S.res[r]), full = !UNCAPPED[r] && v >= cap;
      h += `<div${full ? ' class="lack"' : ''} style="${v ? '' : 'opacity:.45'}">${RES[r][0]} ${RES[r][1]}: <b>${v}</b>${UNCAPPED[r] ? '' : '/' + cap}${full ? ' (plno)' : ''}</div>`;
    }
    h += `</div><div class="hint">Přebytky prodáte a chybějící zboží koupíte na tržišti. Větší sklad dají zásobní jámy, sýpky a skladiště.</div><div style="text-align:right;margin-top:8px"><button data-a="close">Zavřít</button></div>`;
  } else if (kind === 'over') {
    h = `<h3>Kmen vymřel</h3><p>Poslední z kmene podlehl hladu. Jeskyně osiřela.</p><div style="text-align:right"><button data-a="newYes">Začít znovu</button></div>`;
  }
  $('modalBox').style.width = kind === 'research' ? 'min(980px, 95vw)' : '';
  $('modalBox').innerHTML = h; $('modal').style.display = 'flex';
}
let hoverB = null;
function renderTip() {
  const el = $('tip');
  if (hoverB === '__rail' && !railMode) { el.innerHTML = `<b>Koleje</b> &nbsp;<span class="cost">${costStr(RAIL_COST)} za políčko</span><br><small>Spojte kolejemi dvě nádraží a vlak mezi nimi bude vozit zboží.</small>`; el.style.display = 'block'; return; }
  if (hoverB === '__belt' && !beltMode) { el.innerHTML = `<b>Dopravní pás</b> &nbsp;<span class="cost">${costStr(BELT_COST)} za políčko</span><br><small>Veze zboží ve směru tahu: z dolu nebo továrny do jiné továrny nebo do skladu. Továrna zásobená pásem pracuje dvakrát rychleji.</small>`; el.style.display = 'block'; return; }
  if (hoverB === '__road' && !roadMode) { el.innerHTML = '<b>Cesta</b> &nbsp;<span class="cost">🪨1 za políčko</span><br><small>Dlážděná cesta. Lidé po ní chodí o 60 % rychleji. Kreslí se tažením myši.</small>'; el.style.display = 'block'; return; }
  if (!hoverB || placing || roadMode || beltMode || railMode || S.site || !BLD[hoverB]) { el.style.display = 'none'; return; }
  const d = BLD[hoverB];
  const L = startLv(hoverB);
  el.innerHTML = `<b>${bldName(hoverB, L)}</b> &nbsp;<span class="cost">${costStr(d.lv[L].cost)}</span><br><small>${d.desc}</small>`;
  el.style.display = 'block';
}
function closeModal() { modalKind = null; $('modal').style.display = 'none'; }
function costPlain(c) { return Object.keys(c).map(r => `${RES[r][0]} ${c[r]} ${RES[r][1].toLowerCase()}`).join(', '); }

function act(a, v) {
  switch (a) {
    case 'speed': S.speed = +v; break;
    case 'save': saveGame(); toast('Hra uložena.'); break;
    case 'menu': showModal('menu'); break;
    case 'alarm': S.alarm = !S.alarm; toast(S.alarm ? 'Poplach! Lidé se schovávají u skladů.' : 'Konec poplachu – lidé se vrací do práce.'); break;
    case 'gotoAttack': if (S.attackAt) { const [ax, ay] = iso(S.attackAt.x, S.attackAt.y); cam.x = ax; cam.y = ay; } break;
    case 'saves': showModal('saves'); return;
    case 'close': closeModal(); break;
    case 'research': showModal('research'); break;
    case 'trade': showModal('trade'); break;
    case 'job+': { const q = S.people.find(p => !p.job); if (q && !jobLocked(v) && S.people.filter(p => p.job === v).length < jobMax(v) && (v !== 'stavba' || S.site)) setJob(q, v); break; }
    case 'job-': { const q = S.people.filter(p => p.job === v).pop(); if (q) { if (S.site && v !== 'stavba') setJob(q, 'stavba'); else { setJob(q, null); q.hold = true; } } break; }   // když se staví, odebraný jde rovnou stavět
    case 'build': if (!S.site && canPay(BLD[v].lv[startLv(v)].cost)) { placing = v; selId = null; } break;
    case 'cancel': placing = null; break;
    case 'upgrade': {
      const b = bById(selId); if (!b || S.site) break;
      const nx = BLD[b.type].lv[b.lvl]; if (!nx || !canPay(nx.cost) || upgWhy(nx)) break;
      pay(nx.cost); S.site = { type: b.type, x: b.x, y: b.y, prog: 0, time: nx.time, upg: b.id }; S.people.forEach(p => p.hold = false);
      break;
    }
    case 'tech': {
      const t = TECH[v];
      if (t.age || S.research.cur || S.research.done[v] || !canPay(t.cost) || (t.pop && S.people.length < t.pop) || (t.req || []).some(r => !S.research.done[r])) break;
      pay(t.cost); S.research.cur = { id: v, t: 0 }; closeModal(); toast('Bádá se: ' + t.name + '. Postup vidíte nahoře.'); break;
    }
    case 'deal': {
      const o = S.trader && S.trader.offers[+v]; if (!o || !o.left || !canPay(o.want)) break;
      pay(o.want); for (const r in o.give) addRes(r, o.give[r]); o.left--; S.stats.trades++;
      toast('Směněno.'); break;
    }
    case 'sendoff': if (S.trader && S.trader.st === 'wait') { S.trader.st = 'leave'; closeModal(); log(S.age ? 'Poslali jste kupce dál.' : 'Poslali jste pocestného dál.'); } break;
    case 'stop': S.people.forEach(p => { if (selP.has(p.id)) { setJob(p, null); p.hold = true; } }); break;
    case 'idle': {
      const idle = S.people.filter(p => !p.job); if (!idle.length) break;
      idleIdx = (idleIdx + 1) % idle.length; const q = idle[idleIdx];
      selP.clear(); selP.add(q.id); selId = null;
      const w = iso(q.x, q.y); cam.x = w[0]; cam.y = w[1]; clampCam(); break;
    }
    case 'rail': railMode = true; beltMode = false; roadMode = false; placing = null; selId = null; break;
    case 'railEnd': railMode = false; break;
    case 'fly': sendFlight(v); break;
    case 'belt': railMode = false; beltMode = true; roadMode = false; placing = null; selId = null; break;
    case 'beltEnd': beltMode = false; break;
    case 'road': beltMode = false; roadMode = true; placing = null; selId = null; break;
    case 'roadEnd': roadMode = false; break;
    case 'buy': if (VAL[v] && S.res.mince >= buyPrice(v) && S.res[v] + 10 <= storeCap()) { S.res.mince -= buyPrice(v); addRes(v, 10); toast('Koupeno 10 ' + RES[v][1].toLowerCase() + ' za ' + buyPrice(v) + ' mincí.'); } if (modalKind === 'market') showModal('market'); break;
    case 'sell': if (VAL[v] && Math.floor(S.res[v]) - (S.keep[v] || 0) >= 10) { S.res[v] -= 10; S.res.mince += sellPrice(v); toast('Prodáno 10 ' + RES[v][1].toLowerCase() + ' za ' + sellPrice(v) + ' mincí.'); } if (modalKind === 'market') showModal('market'); break;
    case 'invite': if (S.res.mince >= 30 && S.people.length + 2 <= popCap()) { S.res.mince -= 30; addPerson(); addPerson(); log('Do osady přišli dva noví osadníci.'); } break;
    case 'demolish': {
      const b = bById(selId); if (!b || b.type === 'jeskyne') break;
      if (S.delArm !== b.id) { S.delArm = b.id; break; }
      S.delArm = null;
      const back = {};
      BLD[b.type].lv.slice(0, b.lvl).forEach(l => { for (const r in (l.cost || {})) back[r] = (back[r] || 0) + l.cost[r]; });
      for (const r in back) addRes(r, Math.floor(back[r] / 2));
      for (const r in (b.buf || {})) addRes(r, b.buf[r]);
      (b.outItems || []).forEach(r => addRes(r, 1));
      S.people.forEach(p => { if (p.bid === b.id) setJob(p, null); });
      if (S.site && S.site.upg === b.id) S.site = null;
      if (b.type === 'ohniste') S.fire.lit = false;
      S.blds.splice(S.blds.indexOf(b), 1); occ.delete(b.x + b.y * N); railsDirty = true; selId = null;
      log('Zbouráno: ' + bname(b) + '.');
      break;
    }
    case 'store': showModal('store'); return;
    case 'market': showModal('market'); return;
    case 'cat': S.cat = v; break;
    case 'perk': { const c = perkCost(); if (S.res.vedeni >= c) { S.res.vedeni -= c; S.perk = (S.perk || 0) + 1; toast('Výroba zdokonalena – úroveň ' + S.perk + ' (+' + S.perk * 10 + ' %).'); } showModal('research'); return; }
    case 'lim+': { const b = bById(selId); if (b) b.limit = Math.min(storeCap(), (b.limit || 0) + 25); break; }
    case 'lim-': { const b = bById(selId); if (b) b.limit = Math.max(0, (b.limit || 0) - 25) || 0; break; }
    case 'fillIdle': {   // nečinné lidi rozdělí do volných míst ve stavbách (dřevo a kámen napřed)
      let n = 0;
      const order = ['klacky', 'lamaci'].concat(Object.keys(JOBS).filter(j => j !== 'klacky' && j !== 'lamaci' && j !== 'stavba'));
      for (const j of order) {
        if (jobLocked(j) || jobMax(j) >= 1e9) continue;
        while (S.people.filter(p => p.job === j).length < jobMax(j)) { const q = S.people.find(p => !p.job); if (!q) break; setJob(q, j); n++; }
      }
      toast(n ? 'Do práce šlo ' + n + ' lidí.' : 'Žádné volné místo – postavte další pracoviště.');
      break;
    }
    case 'wkPause': { const b = bById(selId); if (b) { b.paused = !b.paused; b.lack = ''; } break; }
    case 'keep+': S.keep[v] = Math.min(storeCap(), (S.keep[v] || 0) + 10); break;
    case 'keep-': S.keep[v] = Math.max(0, (S.keep[v] || 0) - 10); break;
    case 'exped': sendExped(v); break;
    case 'export': exportGame(); break;
    case 'import': $('file').click(); break;
    case 'new': showModal('confirmNew'); return;
    case 'newYes': newState(); saveGame(); showModal('intro'); return;
  }
  renderUI();
}

/* ---------- hudba ---------- */
// hudba/<jméno>.ogg nebo .mp3; chybějící skladba = ticho. Úvod hraje v menu, ve hře doba1–doba6.
const Music = {
  el: null, name: null, want: null, ok: true, missing: new Set(), fadeT: null,
  target() { return titleOn ? 'uvod' : modalKind === 'over' ? 'zanik' : modalKind === 'final' ? 'vitezstvi' : 'doba' + ((S ? S.age : 0) + 1); },
  once: new Set(['zanik', 'vitezstvi']),   // hrají jednou, neopakují se
  vol() { return SET.mute ? 0 : SET.music; },
  sync() {
    const w = this.target();
    if (w !== this.want) { this.want = w; this.fadeOut(); if (!this.missing.has(w)) this.load(w, ['ogg', 'mp3']); return; }
    if (this.el && this.el.paused && !this.el.ended && this.ok) this.resume();
  },
  resume() { const a = this.el; if (a) a.play().then(() => this.fadeTo(a, this.vol(), 1500)).catch(e => { if (e && e.name === 'NotAllowedError') this.ok = false; }); },
  load(w, exts) {
    if (!exts.length) { this.missing.add(w); return; }
    const a = new Audio('hudba/' + w + '.' + exts[0]);
    a.loop = !this.once.has(w); a.volume = 0; a.preload = 'auto';
    a.onerror = () => { if (this.el !== a) return; this.el = null; this.name = null; this.load(w, exts.slice(1)); };   // jen když se nenačetla aktuální skladba
    this.el = a; this.name = w;
    this.resume();
  },
  fadeTo(a, v, ms) {
    const v0 = a.volume, t0 = performance.now();
    const iv = setInterval(() => { if (this.el !== a) return clearInterval(iv); const k = Math.min(1, (performance.now() - t0) / ms); a.volume = Math.max(0, Math.min(1, v0 + (this.vol() - v0) * k)); if (k >= 1) clearInterval(iv); }, 50);
  },
  fadeOut() {
    const a = this.el; this.el = null; this.name = null; if (!a) return;
    const v0 = a.volume, t0 = performance.now();
    const iv = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / 1000); a.volume = v0 * (1 - k); if (k >= 1) { clearInterval(iv); a.pause(); a.src = ''; } }, 50);
  },
  setVol() { if (this.el) this.el.volume = this.vol(); },
};
// prohlížeč pustí zvuk až po prvním kliknutí nebo klávese
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { Music.ok = true; if (Music.el && Music.el.paused && !Music.el.ended) Music.resume(); }, true));
setInterval(() => Music.sync(), 1000);
window.setVol = (k, v) => { SET[k] = Math.max(0, Math.min(1, +v / 100)); saveSet(); Music.setVol(); };
function muteBtns() { document.querySelectorAll('[data-a="mute"]').forEach(b => { b.textContent = SET.mute ? '🔇' : '🔊'; b.title = SET.mute ? 'Zapnout zvuk' : 'Ztlumit zvuk'; }); }

/* ---------- uložené hry pod jménem ---------- */
const DESK = !!(window.Neutralino && window.NL_VERSION);   // běží jako AgesOfEmber.exe
const AUTO_NAME = 'Automatické uložení';
const Saves = {
  dir: null,
  async init() {
    if (!DESK) return;
    Neutralino.init();
    const docs = await Neutralino.os.getPath('documents');
    const base = docs + '/Ages of Ember';
    this.dir = base + '/Uložené hry';
    for (const d of [base, this.dir]) { try { await Neutralino.filesystem.createDirectory(d); } catch (e) { } }
    Neutralino.events.on('windowClose', async () => {   // při zavření okna hru uložit
      try { if (S && S.people.length && !titleOn) { saveGame(); await Saves.write(AUTO_NAME); } } catch (e) { }
      Neutralino.app.exit();
    });
  },
  clean: n => String(n || '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40),
  meta: () => ({ day: dayNo(), age: S.age, ppl: S.people.length, t: Date.now() }),
  pack() { return '{"_meta":' + JSON.stringify(this.meta()) + ',' + serialize().slice(1); },
  async list() {
    const out = [];
    if (DESK) {
      let ents = [];
      try { ents = await Neutralino.filesystem.readDirectory(this.dir); } catch (e) { return out; }
      for (const e of ents) {
        if (e.type !== 'FILE' || !/\.json$/i.test(e.entry)) continue;
        const f = this.dir + '/' + e.entry, it = { name: e.entry.replace(/\.json$/i, ''), meta: null };
        try { const head = await Neutralino.filesystem.readFile(f, { pos: 0, size: 200 }); const m = head.match(/^\{"_meta":(\{[^}]*\})/); if (m) it.meta = JSON.parse(m[1]); } catch (er) { }
        if (!it.meta) { try { it.meta = { t: (await Neutralino.filesystem.getStats(f)).modifiedAt }; } catch (er) { it.meta = {}; } }
        out.push(it);
      }
    } else {
      let idx = {}; try { idx = JSON.parse(localStorage.getItem('agesOfEmber_hry') || '{}'); } catch (e) { }
      for (const n in idx) out.push({ name: n, meta: idx[n] });
    }
    return out.sort((a, b) => (b.meta.t || 0) - (a.meta.t || 0));
  },
  async write(name) {
    name = this.clean(name); if (!name) throw new Error('jméno');
    const txt = this.pack();
    if (DESK) { await Neutralino.filesystem.writeFile(this.dir + '/' + name + '.json', txt); return name; }
    let idx = {}; try { idx = JSON.parse(localStorage.getItem('agesOfEmber_hry') || '{}'); } catch (e) { }
    localStorage.setItem('agesOfEmber_hra:' + name, txt);
    idx[name] = this.meta(); localStorage.setItem('agesOfEmber_hry', JSON.stringify(idx));
    return name;
  },
  async read(name) {
    if (DESK) return Neutralino.filesystem.readFile(this.dir + '/' + name + '.json');
    const t = localStorage.getItem('agesOfEmber_hra:' + name); if (!t) throw new Error('chybí'); return t;
  },
  async del(name) {
    if (DESK) { await Neutralino.filesystem.remove(this.dir + '/' + name + '.json'); return; }
    localStorage.removeItem('agesOfEmber_hra:' + name);
    let idx = {}; try { idx = JSON.parse(localStorage.getItem('agesOfEmber_hry') || '{}'); } catch (e) { }
    delete idx[name]; localStorage.setItem('agesOfEmber_hry', JSON.stringify(idx));
  },
};
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const AGE_NAME = ['pravěk', 'starověk', 'středověk', 'průmyslová doba', 'moderní doba', 'budoucnost'];
function saveInfo(m) {
  const d = m.t ? new Date(m.t) : null;
  return [m.day ? 'den ' + m.day : '', m.age !== undefined ? AGE_NAME[m.age] : '', m.ppl ? m.ppl + ' lidí' : '',
    d ? d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : ''].filter(Boolean).join(' · ');
}
// seznam uložených her – stejný na úvodní obrazovce i ve hře
async function fillSaves(el, withSave) {
  let h = '';
  if (withSave) {
    const def = 'Osada – den ' + dayNo();
    h += `<div class="row"><div class="d"><b>Uložit jako</b><br><input id="saveName" maxlength="40" value="${esc(def)}" style="width:95%;font:inherit;padding:3px;margin-top:3px"></div><button data-a="t_saveAs">💾 Uložit</button></div>`;
  }
  h += `<div id="saveList"><div class="hint">Načítám seznam…</div></div>`;
  h += `<div class="hint">${DESK ? 'Hry se ukládají do složky <b>Dokumenty\\Ages of Ember\\Uložené hry</b>. Soubory si můžete zkopírovat nebo poslat dál.' : 'Ve webové verzi se hry ukládají do tohoto prohlížeče. Do souboru je dostanete přes Export.'}</div>`;
  h += `<div style="text-align:right;margin-top:8px">${DESK ? '<button data-a="t_openDir">📂 Otevřít složku</button> ' : ''}<button data-a="t_file">⬆ Ze souboru…</button> <button data-a="${titleOn ? 't_back' : 'close'}">Zpět</button></div>`;
  el.innerHTML = h;
  const list = await Saves.list(), box = el.querySelector('#saveList'); if (!box) return;
  box.innerHTML = list.length ? list.map(it => `<div class="row"><div class="d"><b>${esc(it.name)}</b><br><small>${saveInfo(it.meta)}</small></div><div><button data-a="t_loadName" data-v="${esc(it.name)}">Načíst</button> <button data-a="t_delName" data-v="${esc(it.name)}" title="Smazat">🗑</button></div></div>`).join('')
    : '<div class="hint">Zatím žádné uložené hry.</div>';
}

/* ---------- úvodní obrazovka ---------- */
let titleOn = false;
const hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };
function showTitle() {
  titleOn = true; closeModal(); tPanel(null);
  $('tCont').classList.toggle('off', !hasSave());
  $('title').style.display = 'block'; muteBtns(); Music.sync();
}
function hideTitle() { titleOn = false; tPanel(null); $('title').style.display = 'none'; last = performance.now(); renderUI(); Music.sync(); }
function tPanel(kind) {
  const el = $('tpanel');
  if (!kind) { el.style.display = 'none'; return; }
  let h = '';
  if (kind === 'confirm') {
    h = `<h3>Nová hra</h3><div>Rozehraná hra se smaže a začnete znovu v jeskyni. Jestli si ji chcete schovat, dejte nejdřív ve hře ☰ Hra → Export.</div>
      <div style="text-align:right;margin-top:10px"><button data-a="t_newYes">Ano, nová hra</button> <button data-a="t_back">Zpět</button></div>`;
  } else if (kind === 'set') {
    const opt = (a, v, t, cur) => `<button data-a="${a}" data-v="${v}" class="${cur ? 'on' : ''}">${t}</button>`;
    h = `<h3>Nastavení</h3>
      <div class="row"><div class="d"><b>Vzhled krajiny</b><br><small>Jednoduchá kresba je rychlejší na slabších počítačích.</small></div><div>${opt('t_terr', 'krasna', 'Malovaná', SET.terr === 'krasna')} ${opt('t_terr', 'jednoducha', 'Jednoduchá', SET.terr !== 'krasna')}</div></div>
      <div class="row"><div class="d"><b>Hlasitost hudby</b></div><input type="range" min="0" max="100" step="5" value="${Math.round(SET.music * 100)}" oninput="setVol('music', this.value)" style="width:150px"></div>
      <div class="row"><div class="d"><b>Hlasitost zvuků</b><br><small>Zvuky přibudou v další verzi.</small></div><input type="range" min="0" max="100" step="5" value="${Math.round(SET.sfx * 100)}" oninput="setVol('sfx', this.value)" style="width:150px"></div>
      <div class="row"><div class="d"><b>Automatické ukládání</b><br><small>Hra se ukládá do prohlížeče i při zavření okna.</small></div><div>${opt('t_auto', 60, '1 min', SET.autosave === 60)} ${opt('t_auto', 300, '5 min', SET.autosave === 300)} ${opt('t_auto', 0, 'Vyp.', !SET.autosave)}</div></div>
      <div class="row"><div class="d"><b>Smazat uloženou hru</b><br><small>Vymaže rozehranou hru z tohoto prohlížeče.</small></div><button data-a="t_del" class="${hasSave() ? '' : 'off'}">Smazat</button></div>
      <div style="text-align:right;margin-top:8px"><button data-a="t_back">Zpět</button></div>`;
  } else if (kind === 'del') {
    h = `<h3>Smazat uloženou hru?</h3><div>Rozehraná hra zmizí z tohoto prohlížeče a nepůjde vrátit (jen ze zálohy v souboru).</div>
      <div style="text-align:right;margin-top:10px"><button data-a="t_delYes">Ano, smazat</button> <button data-a="t_set">Ne</button></div>`;
  } else if (kind === 'load') {
    el.innerHTML = '<h3>Načíst hru</h3><div id="saveBox"></div>'; el.style.display = 'block';
    fillSaves(el.querySelector('#saveBox'), false); return;
  } else if (kind === 'quit') {
    h = `<h3>Na shledanou!</h3><div>${hasSave() ? 'Hra je uložená. ' : ''}Teď můžete zavřít záložku prohlížeče. Až se vrátíte, dejte <b>Pokračovat</b>.</div>
      <div style="text-align:right;margin-top:10px"><button data-a="t_back">Zpět do menu</button></div>`;
  }
  el.innerHTML = h; el.style.display = 'block';
}
function titleAct(a, v) {
  switch (a) {
    case 't_new': if (hasSave() && S && S.people.length) tPanel('confirm'); else titleAct('t_newYes'); return true;
    case 't_newYes': newState(); saveGame(); hideTitle(); showModal('intro'); return true;
    case 't_cont': if (hasSave()) hideTitle(); return true;
    case 't_load': tPanel('load'); return true;
    case 't_file': $('file').click(); return true;
    case 't_openDir': if (DESK) Neutralino.os.open(Saves.dir); return true;
    case 't_saveAs': {
      const n = Saves.clean(($('saveName') || {}).value);
      if (!n) { toast('Napište jméno uložené hry.'); return true; }
      Saves.write(n).then(nm => { saveGame(); toast('Hra uložena jako „' + nm + '“.'); closeModal(); })
        .catch(() => toast('Uložení se nepovedlo.'));
      return true;
    }
    case 't_loadName':
      Saves.read(v).then(t => { loadFrom(t); delete S._meta; saveGame(); closeModal(); if (titleOn) hideTitle(); toast('Načteno: ' + v); })
        .catch(() => toast('Tuto hru se nepodařilo načíst.'));
      return true;
    case 't_delName':
      if (!confirm('Smazat uloženou hru „' + v + '“? Nepůjde to vrátit.')) return true;
      Saves.del(v).then(() => { const b = titleOn ? $('tpanel').querySelector('#saveBox') : $('modalBox').querySelector('#saveBox'); if (b) fillSaves(b, !titleOn); });
      return true;
    case 't_set': tPanel('set'); return true;
    case 't_terr': SET.terr = v; saveSet(); applyTerrain(); tPanel('set'); return true;
    case 't_auto': SET.autosave = +v; saveSet(); tPanel('set'); return true;
    case 't_del': tPanel('del'); return true;
    case 't_delYes': try { localStorage.removeItem(SAVE_KEY); } catch (e) { } newState(); showTitle(); toast('Uložená hra smazána.'); return true;
    case 't_quit':
      if (DESK) { (async () => { try { if (S && S.people.length && hasSave()) { saveGame(); await Saves.write(AUTO_NAME); } } catch (e) { } Neutralino.app.exit(); })(); return true; }
      if (S && S.people.length && hasSave()) saveGame(); tPanel('quit'); try { window.close(); } catch (e) { } return true;
    case 't_back': tPanel(null); $('tCont').classList.toggle('off', !hasSave()); return true;
    case 'title': if (S && S.people.length) saveGame(); showTitle(); return true;
    case 'mute': SET.mute = !SET.mute; saveSet(); Music.setVol(); muteBtns(); return true;
  }
  return false;
}

/* ---------- ukládání ---------- */
function serialize() {
  let s = ''; for (let i = 0; i < N * N; i++) s += rev[i] ? '1' : '0';
  S.rev = s; return JSON.stringify(S);
}
function saveGame() { try { localStorage.setItem(SAVE_KEY, serialize()); return true; } catch (e) { toast('Uložení se nepovedlo – použijte Export do souboru.'); return false; } }
function loadFrom(text) {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.people) || !Array.isArray(d.blds) || typeof d.rev !== 'string') throw new Error('bad');
  if ((d.mapN || 64) !== N) throw new Error('map');   // hra z menší mapy se načíst nedá
  S = d; afterLoad(true);
}
function exportGame() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([serialize()], { type: 'application/json' }));
  a.download = 'ages-of-ember-den' + dayNo() + '.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
$('file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { try { loadFrom(r.result); saveGame(); if (titleOn) hideTitle(); toast('Hra načtena ze souboru.'); } catch (err) { toast('Tento soubor není uložená hra.'); } };
  r.readAsText(f); e.target.value = '';
});

/* ---------- vstup ---------- */
document.addEventListener('mousedown', e => {
  const b = e.target.closest('[data-a]');
  if (!b || b.classList.contains('off')) return;
  e.preventDefault(); if (titleAct(b.dataset.a, b.dataset.v)) return; act(b.dataset.a, b.dataset.v);
});
let selP = new Set(), box = null, ping = null, idleIdx = -1;
cv.addEventListener('mousedown', e => {
  mouse.down = true; mouse.btn = e.button; mouse.drag = false; mouse.sx = e.clientX; mouse.sy = e.clientY;
  if (roadMode && e.button === 0) { const [fx, fy] = screenToTile(e.clientX, e.clientY); paintRoad(Math.floor(fx), Math.floor(fy)); }
  if (railMode && e.button === 0) { const [fx, fy] = screenToTile(e.clientX, e.clientY); rdrag = { x: Math.floor(fx), y: Math.floor(fy), moved: false }; railAt(rdrag.x + rdrag.y * N); }
  if (beltMode && e.button === 0) { const [fx, fy] = screenToTile(e.clientX, e.clientY); bdrag = { x: Math.floor(fx), y: Math.floor(fy), moved: false }; }
});
window.addEventListener('mousemove', e => {
  mouse.inside = e.target === cv;
  if (mouse.down) {
    if (!mouse.drag && Math.hypot(e.clientX - mouse.sx, e.clientY - mouse.sy) > 5) mouse.drag = true;
    if (mouse.drag) {
      if (mouse.btn === 0) { if (railMode) railDrag(e.clientX, e.clientY); else if (beltMode) beltDrag(e.clientX, e.clientY); else if (roadMode) roadLine(mouse.x, mouse.y, e.clientX, e.clientY); else if (!placing) box = { x0: mouse.sx, y0: mouse.sy, x1: e.clientX, y1: e.clientY }; }
      else { cam.x -= (e.clientX - mouse.x) / cam.z; cam.y -= (e.clientY - mouse.y) / cam.z; clampCam(); }
    }
  }
  mouse.x = e.clientX; mouse.y = e.clientY;
});
window.addEventListener('mouseup', e => {
  if (mouse.down) {
    if (box) { selectBox(e.shiftKey); box = null; }
    else if (railMode) {
      const [fx, fy] = screenToTile(e.clientX, e.clientY), k = Math.floor(fx) + Math.floor(fy) * N;
      if (mouse.btn === 2 && !mouse.drag) { if (railSet.has(k)) removeRail(k); else railMode = false; renderUI(); }
      rdrag = null;
    }
    else if (beltMode) {
      const [fx, fy] = screenToTile(e.clientX, e.clientY), k = Math.floor(fx) + Math.floor(fy) * N;
      if (mouse.btn === 0 && bdrag && !bdrag.moved) { const bl = beltMap.get(k); if (bl) bl.d = (bl.d + 1) % 4; else beltAt(k, 0); }
      if (mouse.btn === 2 && !mouse.drag) { if (beltMap.has(k)) removeBelt(k); else beltMode = false; renderUI(); }
      bdrag = null;
    }
    else if (roadMode) { if (mouse.btn === 2 && !mouse.drag) { roadMode = false; renderUI(); } }
    else if (!mouse.drag && e.target === cv) {
      if (mouse.btn === 0) clickMap(e.clientX, e.clientY, e.shiftKey);
      else if (mouse.btn === 2) command(e.clientX, e.clientY);
    }
  }
  mouse.down = false; mouse.drag = false;
});
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', e => { e.preventDefault(); cam.z = Math.max(0.5, Math.min(2.2, cam.z * (e.deltaY < 0 ? 1.12 : 0.89))); }, { passive: false });
window.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') titleAct('t_saveAs'); return; }
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape') { placing = null; roadMode = false; beltMode = false; railMode = false; selId = null; selP.clear(); if (modalKind && modalKind !== 'over') closeModal(); renderUI(); }
  if (e.key === ' ' && !modalKind) { e.preventDefault(); S.speed = S.speed ? 0 : 1; renderUI(); }
  if (e.key === '.' && !modalKind) act('idle');
});
$('bottom').addEventListener('mouseover', e => { const b = e.target.closest('[data-a=build],[data-a=road],[data-a=belt],[data-a=rail]'); hoverB = b ? b.dataset.v : null; renderTip(); });
$('bottom').addEventListener('mouseleave', () => { hoverB = null; renderTip(); });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.down = false; box = null; });
function clampCam() { cam.x = Math.max(0, Math.min(N * TW, cam.x)); cam.y = Math.max(0, Math.min(N * TH, cam.y)); }
function pScreen(p) { const w = iso(p.x, p.y); return [(w[0] - cam.x) * cam.z + cv.width / 2, (w[1] - 16 - cam.y) * cam.z + cv.height / 2]; }
function selectBox(add) {
  if (!add) selP.clear();
  selId = null;
  const x0 = Math.min(box.x0, box.x1), x1 = Math.max(box.x0, box.x1), y0 = Math.min(box.y0, box.y1), y1 = Math.max(box.y0, box.y1);
  for (const p of S.people) { const q = pScreen(p); if (q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1) selP.add(p.id); }
  renderUI();
}
function objAt(tx, ty) {
  for (const [dx, dy] of [[0, 0], [1, 1]]) { const o = occ.get(tx + dx + (ty + dy) * N); if (o && !(dx && (o.type === 'jama' || o.type === 'pole' || o.type === 'ohrada'))) return o; }
  return null;
}
function clickMap(sx, sy, shift) {
  const [fx, fy] = screenToTile(sx, sy), tx = Math.floor(fx), ty = Math.floor(fy);
  if (placing) {
    const L0 = startLv(placing), c = BLD[placing].lv[L0];
    if (S.site || !canPay(c.cost)) { placing = null; }
    else if (canPlace(tx, ty)) {
      pay(c.cost); S.site = { type: placing, x: tx, y: ty, prog: 0, time: c.time, upg: 0, lv: L0 + 1 }; placing = null; S.people.forEach(p => p.hold = false);
      let n = 0; S.people.forEach(p => { if (selP.has(p.id)) { setJob(p, 'stavba'); n++; } });
      if (!n && !S.people.some(q => !q.job)) toast('Staveniště je vytyčené, ale nikdo není volný. Odvolejte někoho z práce.');
    } else toast(BLD[placing].water ? 'Rybářská chata musí stát na břehu, hned vedle vody.' : BLD[placing].mine && !mineNode({ x: tx, y: ty }, BLD[placing].mine) ? 'Musí stát hned vedle ložiska (' + RES[BLD[placing].mine][1].toLowerCase() + ').' : BLD[placing].rail ? 'Nádraží musí stát hned vedle kolejí.' : tooClose(tx, ty) ? 'Příliš blízko jiné stavby – nechte mezi stavbami volné místo.' : (rev[tx + ty * N] ? 'Tady stavět nejde – místo je obsazené, ve vodě nebo na skále.' : 'Tady stavět nejde – místo ještě není prozkoumané.'));
    renderUI(); return;
  }
  if (S.trader && S.trader.st === 'wait' && Math.hypot(S.trader.x - fx, S.trader.y - fy - 0.3) < 1.1) { showModal('trade'); return; }
  let best = null, bd = 16 * cam.z;
  for (const p of S.people) { const q = pScreen(p), d = Math.hypot(q[0] - sx, q[1] - sy); if (d < bd) { bd = d; best = p; } }
  if (best) { if (!shift) selP.clear(); selP.add(best.id); selId = null; renderUI(); return; }
  selP.clear();
  const o = objAt(tx, ty) || occ.get(tx + 1 + ty * N) || occ.get(tx + (ty + 1) * N);
  selId = o && o.type && BLD[o.type] ? o.id : null; renderUI();
}
function command(sx, sy) {
  if (placing) { placing = null; renderUI(); return; }
  const ppl = S.people.filter(p => selP.has(p.id)); if (!ppl.length) return;
  const [fx, fy] = screenToTile(sx, sy), tx = Math.floor(fx), ty = Math.floor(fy);
  ping = { x: fx, y: fy, t: performance.now() };
  if (S.site && ((S.site.x === tx && S.site.y === ty) || (S.site.x === tx + 1 && S.site.y === ty + 1))) {
    ppl.forEach(p => setJob(p, 'stavba')); renderUI(); return;
  }
  const o = objAt(tx, ty);
  const fishing = (o && o.type === 'ryby') || (!o && isWater(fx, fy));
  if (fishing) {
    if (!has('ryby')) { toast('Do vody lidé nevkročí. Na rybolov je potřeba rybářská chata na břehu.'); renderUI(); return; }
    let n = 0;
    for (const p of ppl) {
      if (p.job !== 'ryby' && S.people.filter(q => q.job === 'ryby').length >= jobSlots('ryby')) continue;
      setJob(p, 'ryby'); if (o && o.type === 'ryby') p.bid = o.id; p.st = 'toShore'; n++;
    }
    if (!n) toast('V rybářské chatě už není volné místo.');
    renderUI(); return;
  }
  if (!ppl.some(p => reach(p, o ? o.x : tx, o ? o.y : ty))) { toast('Tam se po souši nedá dojít.'); renderUI(); return; }
  if (o && o.t) {
    if (!NODE_JOB[o.t]) { toast('Tohle se těží jen stavbou (' + (o.t === 'ropa' ? 'ropný vrt' : 'důl') + ').'); renderUI(); return; }
    const j = NODE_JOB[o.t]; let n = 0;
    if (jobLocked(j)) { toast(JOBS[j].mineBy && (JOBS[j].until !== undefined && S.age >= JOBS[j].until) ? 'Tohle se těží jen stavbou: ' + JOBS[j].mineBy + '.' : 'Nejdřív vyzkoumejte: ' + TECH[JOBS[j].req].name + '.'); renderUI(); return; }
    if (o.young) { toast('Stromek ještě roste (' + Math.round(o.amt / NODE.strom.max * 100) + ' %). Pokácet půjde, až dospěje.'); renderUI(); return; }
    for (const p of ppl) {
      if (p.job !== j && S.people.filter(q => q.job === j).length >= jobMax(j)) continue;
      setJob(p, j); p.nid = o.id; p.st = 'go'; n++;
    }
    if (!n && jobMax(j) < 1e9) { const ch = j === 'lov' ? 'loveckou' : 'dřevorubeckou'; toast(jobSlots(j) ? 'Už není volné místo – postavte další ' + ch + ' chatu.' : 'Nejdřív postavte ' + ch + ' chatu.'); }
  } else if (o && o.type && JOB_BY_B[o.type]) {
    const j = JOB_BY_B[o.type]; let n = 0;
    for (const p of ppl) {
      if (p.job === j && p.bid === o.id) { n++; continue; }
      if (S.people.filter(q => q.job === j && q.bid === o.id).length >= ((lvOf(o).js || {})[j] || 0)) break;
      setJob(p, j); p.bid = o.id; n++;
    }
    if (!n) toast('Tady už není volné místo.');
  } else {
    ppl.forEach((p, i) => { setJob(p, null); p.tx = fx + ((i % 3) - 1) * 0.4; p.ty = fy + Math.floor(i / 3) * 0.4; });
  }
  renderUI();
}
function resize() { cv.width = lcan.width = window.innerWidth; cv.height = lcan.height = window.innerHeight; }
window.addEventListener('resize', () => { resize(); if (S) renderUI(); });
window.addEventListener('beforeunload', () => { if (S && S.people.length && !titleOn) saveGame(); });

/* ---------- smyčka ---------- */
let last = performance.now(), uiT = 0, saveT = 0;
function frame(now) {
  const real = Math.min(0.1, (now - last) / 1000); last = now;
  if (titleOn) { requestAnimationFrame(frame); return; }
  const ps = 520 * real / cam.z;
  if (keys.a || keys.arrowleft) cam.x -= ps; if (keys.d || keys.arrowright) cam.x += ps;
  if (keys.w || keys.arrowup) cam.y -= ps; if (keys.s || keys.arrowdown) cam.y += ps;
  clampCam();
  const blocked = modalKind && modalKind !== 'research' && modalKind !== 'trade';
  if (!blocked && S.people.length) for (let i = 0; i < S.speed; i++) update(real);
  render(now / 1000);
  uiT += real; if (uiT > 0.4) { uiT = 0; renderUI(); }
  saveT += real; if (SET.autosave && saveT > SET.autosave) { saveT = 0; if (S.people.length) { saveGame(); if (DESK) Saves.write(AUTO_NAME).catch(() => { }); } }
  requestAnimationFrame(frame);
}

resize();
(function start() {
  let ok = false;
  try { const t = localStorage.getItem(SAVE_KEY); if (t) { try { loadFrom(t); ok = true; } catch (e) { localStorage.setItem(SAVE_KEY + '_stara', t); ok = false; } } } catch (e) { ok = false; }   // starou hru z menší mapy jen odložit
  if (!ok) newState();
  showTitle();
  if (DESK) Saves.init().then(async () => {
    if (hasSave()) return;
    try { loadFrom(await Saves.read(AUTO_NAME)); delete S._meta; saveGame(); showTitle(); } catch (e) { }
  }).catch(() => { });
  requestAnimationFrame(frame);
})();
window.__game = { get S() { return S; }, showTitle, titleAct, SET, cam, iso, update, act, render, renderTerrain, select: id => { selId = id; renderUI(); }, reveal, beltAt, BDIR, railAt, terr, comp, waterNear, setJob, loadFrom, serialize };
