/* Tava Bunicii – datele demo (brand inventat). Prețurile sunt în lei. */
window.TAVA = (function () {
  const FIRMA = {
    nume: "Tava Bunicii",
    anFondare: 1998,
    telefonAfisat: "0722 198 198",
    telefonLink: "tel:+40722198198",
    email: "comenzi@tavabunicii.ro",
    adresa: "Str. Trandafirilor 12, Giroc",
    oras: "jud. Timiș",
    program: "Ridicare: joi – sâmbătă, 9:00 – 18:00",
  };

  /* Culorile cardurilor, aceleași nume și valori ca în sistemul Mama Mia (lib/culori). */
  const CULORI = {
    coral: { fundal: "#ff6b4a", text: "#141110", inchis: false },
    galben: { fundal: "#f5c230", text: "#141110", inchis: false },
    verde: { fundal: "#2f6b4a", text: "#ffffff", inchis: true },
    bej: { fundal: "#efe6d8", text: "#141110", inchis: false },
    albastru: { fundal: "#3d7bd9", text: "#ffffff", inchis: true },
    mov: { fundal: "#2b1d3a", text: "#ffffff", inchis: true },
    alb: { fundal: "#ffffff", text: "#141110", inchis: false },
    rosu: { fundal: "#e8432e", text: "#ffffff", inchis: true },
    maro: { fundal: "#6b3a1e", text: "#ffffff", inchis: true },
    bordo: { fundal: "#8e1b1b", text: "#ffffff", inchis: true },
    bleu: { fundal: "#bfe3f2", text: "#141110", inchis: false },
    portocaliu: { fundal: "#d98a1e", text: "#141110", inchis: false },
    piersica: { fundal: "#f6c7b0", text: "#141110", inchis: false },
    "verde-sos": { fundal: "#4e7a2f", text: "#ffffff", inchis: true },
  };

  /*
   * Cele 12 prăjituri. `bucata` = prețul pe bucată, `kg` = prețul pe kilogram.
   * `desen` descrie ilustrația (straturile feliei, de jos în sus).
   */
  const PRODUSE = [
    {
      id: "cremsnit", nume: "Cremșnit", grup: "crema", culoare: "galben", eticheta: "Cea mai comandată",
      descriere: "Foietaj cu unt, cremă de vanilie din ouă de țară și un strat de frișcă.",
      bucata: 12, kg: 85,
      desen: { tip: "felie", straturi: [["#d9a55a", 10], ["#f6dc7a", 46], ["#fff8ea", 16], ["#d9a55a", 10]], decor: "pudra" },
    },
    {
      id: "amandine", nume: "Amandine", grup: "nuca", culoare: "coral", eticheta: "Rețeta din 1998",
      descriere: "Blat de cacao însiropat, cremă de ciocolată cu unt și glazură fondantă.",
      bucata: 11, kg: 80,
      desen: { tip: "felie", straturi: [["#5a3220", 18], ["#8a5634", 14], ["#5a3220", 18], ["#8a5634", 14], ["#5a3220", 14]], decor: "glazura", glazura: "#f2d9a0" },
    },
    {
      id: "cozonac", nume: "Cozonac cu nucă", grup: "tara", culoare: "verde", eticheta: "Dospit 12 ore",
      descriere: "Aluat cu unt și ouă de țară, umplutură generoasă de nucă și cacao.",
      bucata: 9, kg: 70, unitateBucata: "felie",
      desen: { tip: "cozonac" },
    },
    {
      id: "savarina", nume: "Savarine", grup: "crema", culoare: "piersica",
      descriere: "Blat pufos însiropat cu rom și portocală, umplut cu frișcă.",
      bucata: 10, kg: 78,
      desen: { tip: "savarina" },
    },
    {
      id: "alba", nume: "Albă ca zăpada", grup: "crema", culoare: "bej",
      descriere: "Foi cu miere de salcâm și cremă de griș cu lămâie.",
      bucata: 9, kg: 68,
      desen: { tip: "felie", straturi: [["#d8a868", 8], ["#fffaf0", 22], ["#d8a868", 8], ["#fffaf0", 22], ["#d8a868", 8]], decor: "pudra" },
    },
    {
      id: "dobos", nume: "Doboș", grup: "nuca", culoare: "maro",
      descriere: "Șase foi de pandișpan, cremă de ciocolată și capac de caramel.",
      bucata: 12, kg: 88,
      desen: { tip: "felie", straturi: [["#f0cf8a", 7], ["#6a3b22", 6], ["#f0cf8a", 7], ["#6a3b22", 6], ["#f0cf8a", 7], ["#6a3b22", 6], ["#f0cf8a", 7], ["#6a3b22", 6], ["#c9802a", 9]], decor: "caramel" },
    },
    {
      id: "ecler", nume: "Ecler cu vanilie", grup: "crema", culoare: "mov",
      descriere: "Aluat opărit, cremă de vanilie bourbon și glazură de ciocolată.",
      bucata: 8, kg: 90,
      desen: { tip: "ecler" },
    },
    {
      id: "mascota", nume: "Mascota", grup: "nuca", culoare: "bordo",
      descriere: "Blat cu nucă măcinată, cremă de cacao cu unt și glazură.",
      bucata: 11, kg: 82,
      desen: { tip: "felie", straturi: [["#a87a4f", 16], ["#6e3f26", 22], ["#a87a4f", 16], ["#3b2014", 8]], decor: "nuca" },
    },
    {
      id: "placinta", nume: "Plăcintă cu mere", grup: "tara", culoare: "verde-sos",
      descriere: "Aluat fraged cu unt, mere rase, scorțișoară și zahăr vanilat.",
      bucata: 7, kg: 55,
      desen: { tip: "felie", straturi: [["#e2b066", 12], ["#efd28c", 30], ["#e2b066", 12]], decor: "pudra" },
    },
    {
      id: "lamaita", nume: "Lămâiță", grup: "crema", culoare: "bleu",
      descriere: "Foi fragede și cremă de lămâie cu unt, răcoritoare.",
      bucata: 9, kg: 70,
      desen: { tip: "felie", straturi: [["#e6bb73", 9], ["#fbe58a", 20], ["#e6bb73", 9], ["#fbe58a", 20], ["#e6bb73", 9]], decor: "pudra" },
    },
    {
      id: "negresa", nume: "Negresă cu nucă", grup: "nuca", culoare: "albastru",
      descriere: "Blat umed de cacao cu bucăți de nucă și glazură de ciocolată.",
      bucata: 8, kg: 65,
      desen: { tip: "felie", straturi: [["#4a2a1b", 40], ["#2a160e", 8]], decor: "nuca" },
    },
    {
      id: "chec", nume: "Chec marmorat", grup: "tara", culoare: "portocaliu",
      descriere: "Chec cu unt, vanilie și cacao, ca la bunica duminica.",
      bucata: 6, kg: 48, unitateBucata: "felie",
      desen: { tip: "chec" },
    },
  ];

  const GRUPURI = [
    { id: "crema", titlu: "Cu cremă", subtitlu: "vanilie, lămâie, frișcă" },
    { id: "nuca", titlu: "Cu nucă și cacao", subtitlu: "ciocolată, caramel, nucă" },
    { id: "tara", titlu: "Ca la bunica", subtitlu: "cozonac, plăcintă, chec" },
  ];

  /*
   * Platoul: pentru fiecare ocazie, câte bucăți pe persoană și mixul (procente din total).
   * Reducere: 5% de la 40 de persoane, 10% de la 80.
   */
  const OCAZII = [
    { id: "botez", nume: "Botez", emoji: "👶", perPersoana: 4, nota: "Prăjituri fine, cu cremă, pentru masa festivă.",
      mix: { cremsnit: 0.25, ecler: 0.2, savarina: 0.2, amandine: 0.2, dobos: 0.15 } },
    { id: "aniversare", nume: "Aniversare", emoji: "🎂", perPersoana: 3, nota: "Un pic din toate, cu multă ciocolată.",
      mix: { amandine: 0.25, ecler: 0.2, cremsnit: 0.2, dobos: 0.2, mascota: 0.15 } },
    { id: "sarbatori", nume: "Sărbători", emoji: "🎄", perPersoana: 3, nota: "Cozonac și prăjiturile de tavă de la masa de sărbători.",
      mix: { cozonac: 0.3, alba: 0.2, mascota: 0.2, lamaita: 0.15, negresa: 0.15 } },
    { id: "pomana", nume: "Pomană", emoji: "🕯️", perPersoana: 2, nota: "Prăjituri simple, de împărțit, ambalate pe bucată.",
      mix: { cozonac: 0.35, placinta: 0.25, negresa: 0.2, chec: 0.2 } },
  ];

  const PLATOU = { minPersoane: 10, maxPersoane: 150, pas: 5, implicit: 30, gramePeBucata: 90, bucatiPeTava: 40 };

  const LIVRARE = { prag: 200, taxa: 15, zona: "Timișoara, Giroc, Dumbrăvița, Moșnița, Chișoda" };

  /* Zilele de copt: joi (4), vineri (5), sâmbătă (6). Capacitate pe zi, în comenzi. */
  const COPT = { zile: [4, 5, 6], capacitate: 30, cateZile: 6 };

  const CRACIUN = {
    stoc: 200, rezervate: 162, livrare: "22 – 23 decembrie",
    variante: [
      { id: "craciun-nuca", nume: "Cu nucă și cacao", pret: 65 },
      { id: "craciun-rahat", nume: "Cu nucă și rahat", pret: 68 },
      { id: "craciun-mac", nume: "Cu mac și stafide", pret: 62 },
    ],
  };

  return { FIRMA, CULORI, PRODUSE, GRUPURI, OCAZII, PLATOU, LIVRARE, COPT, CRACIUN };
})();
