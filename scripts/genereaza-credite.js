/*
 * Generează site/credite.html din site/credite-foto.json.
 * Rulare: node scripts/genereaza-credite.js
 */
const fs = require("fs");
const path = require("path");

const radacina = path.join(__dirname, "..", "site");
const credite = JSON.parse(fs.readFileSync(path.join(radacina, "credite-foto.json"), "utf8"));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const carduri = credite.map((c) => {
  const licenta = c.licentaUrl
    ? `<a href="${esc(c.licentaUrl)}" target="_blank" rel="noopener license">${esc(c.licenta)}</a>`
    : esc(c.licenta);
  return `      <li class="credit">
        <img src="${esc(c.variante[0])}" width="400" height="400" loading="lazy" decoding="async" alt="">
        <div class="credit__text">
          <b class="titlu">${esc(c.folositPentru)}</b>
          <span>„${esc(c.titluCommons)}” de <b>${esc(c.autor)}</b></span>
          <span>Licență: ${licenta} · ${esc(c.modificari)}</span>
          <a href="${esc(c.pagina)}" target="_blank" rel="noopener">Pagina pe Wikimedia Commons →</a>
        </div>
      </li>`;
}).join("\n");

const html = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Credite foto · Tava Bunicii</title>
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#f4f1ec">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
    body { padding-bottom: 0; }
    .credite { max-width: 1100px; margin: 0 auto; padding: 24px 16px 64px; display: flex; flex-direction: column; gap: 20px; }
    .credite h1 { font-size: 52px; line-height: .9; }
    .credite > p { max-width: 640px; color: var(--gri-1); line-height: 1.55; }
    .credite__lista { display: grid; gap: 12px; }
    .credit { display: flex; gap: 16px; align-items: center; padding: 16px; border-radius: 24px; background: #fff; }
    .credit img { width: 88px; height: 88px; flex-shrink: 0; border-radius: 50%; object-fit: cover; }
    .credit__text { display: flex; min-width: 0; flex-direction: column; gap: 4px; font-size: 14px; color: var(--gri-1); overflow-wrap: anywhere; }
    .credit__text .titlu { font-size: 20px; color: var(--negru); }
    .credit__text a { color: var(--rosu); font-weight: 700; }
    @media (min-width: 768px) {
      .credite { padding: 48px 32px 96px; }
      .credite h1 { font-size: 84px; }
      .credite__lista { grid-template-columns: 1fr 1fr; gap: 16px; }
    }
  </style>
</head>
<body>
  <div class="banner-demo" role="note"><span class="punct" aria-hidden="true"></span>Machetă demonstrativă · comenzile nu sunt reale</div>
  <main class="credite">
    <a href="index.html" class="pill pill--alb pill--sm" style="align-self:flex-start">← Înapoi la site</a>
    <h1 class="titlu">Credite foto<span class="rosu">.</span></h1>
    <p>Toate fotografiile prăjiturilor provin de pe Wikimedia Commons și sunt folosite conform licențelor de mai jos (domeniu public, CC BY sau CC BY-SA). Pozele au fost decupate pătrat, redimensionate și ușor ajustate ca luminozitate. Unde nu am găsit exact prăjitura, am folosit una asemănătoare (marcată „înlocuitor”).</p>
    <ul class="credite__lista">
${carduri}
    </ul>
    <p>Machetă demo · Site realizat de <a href="https://cristianweb.ro" target="_blank" rel="noopener" style="color:var(--negru);text-decoration:underline">CristianWeb</a></p>
  </main>
</body>
</html>
`;

fs.writeFileSync(path.join(radacina, "credite.html"), html);
console.log(`credite.html: ${credite.length} poze`);
