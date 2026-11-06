/* Ilustrațiile SVG ale prăjiturilor (demo fără poze): felii în perspectivă, cozonac, ecler, savarină, tava din hero. */
window.DESEN = (function () {
  function nuanta(hex, procent) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = procent / 100;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    const h = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
    return "#" + h(r) + h(g) + h(b);
  }

  /* generator pseudo-aleator stabil, ca decorul să fie același la fiecare încărcare */
  function aleator(seed) {
    let s = seed || 7;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  /* felie în perspectivă: fața din față, latura dreaptă și capacul */
  function felie(d, opt) {
    opt = opt || {};
    const w = opt.w || 92, dx = opt.dx || 38, dy = opt.dy || -22;
    const H = d.straturi.reduce((s, x) => s + x[1], 0);
    const x0 = opt.x != null ? opt.x : 100 - (w + dx) / 2;
    const baza = opt.y != null ? opt.y : 100 + (H - dy) / 2 + 4;
    const rnd = aleator(H * 13 + d.straturi.length);
    let s = `<ellipse cx="${x0 + (w + dx) / 2}" cy="${baza + 4}" rx="${(w + dx) / 2 + 6}" ry="9" fill="rgba(0,0,0,.14)"/>`;
    let y = baza;
    d.straturi.forEach(([c, h]) => {
      const yt = y - h;
      s += `<rect x="${x0}" y="${yt}" width="${w}" height="${h + 0.4}" fill="${c}"/>`;
      s += `<polygon points="${x0 + w},${y} ${x0 + w + dx},${y + dy} ${x0 + w + dx},${yt + dy} ${x0 + w},${yt}" fill="${nuanta(c, -22)}"/>`;
      y = yt;
    });
    const sus = d.straturi[d.straturi.length - 1][0];
    let capac = nuanta(sus, 12);
    if (d.decor === "pudra") capac = "#fffaf0";
    if (d.decor === "glazura") capac = d.glazura;
    if (d.decor === "caramel") capac = "#d99436";
    if (d.decor === "nuca") capac = nuanta(sus, 8);
    const p = (a, b) => `${a},${b}`;
    s += `<polygon points="${p(x0, y)} ${p(x0 + w, y)} ${p(x0 + w + dx, y + dy)} ${p(x0 + dx, y + dy)}" fill="${capac}"/>`;
    if (d.decor === "pudra") {
      for (let i = 0; i < 26; i++) {
        const u = rnd(), v = rnd();
        s += `<circle cx="${x0 + u * w + v * dx}" cy="${y + v * dy}" r="${0.9 + rnd() * 1.3}" fill="#ffffff" opacity=".95"/>`;
      }
      s += `<rect x="${x0}" y="${y}" width="${w}" height="3" fill="#ffffff" opacity=".7"/>`;
    }
    if (d.decor === "glazura") {
      s += `<rect x="${x0}" y="${y}" width="${w}" height="6" fill="${d.glazura}"/>`;
      for (let i = 0; i < 5; i++) {
        const cx = x0 + 8 + i * (w - 16) / 4 + (rnd() - 0.5) * 6;
        s += `<ellipse cx="${cx}" cy="${y + 6}" rx="${3 + rnd() * 2}" ry="${3 + rnd() * 5}" fill="${d.glazura}"/>`;
      }
      s += `<polygon points="${p(x0 + w, y)} ${p(x0 + w + dx, y + dy)} ${p(x0 + w + dx, y + dy + 6)} ${p(x0 + w, y + 6)}" fill="${nuanta(d.glazura, -15)}"/>`;
    }
    if (d.decor === "caramel") {
      for (let i = 1; i < 4; i++) {
        const a = x0 + (w * i) / 4;
        s += `<line x1="${a}" y1="${y}" x2="${a + dx}" y2="${y + dy}" stroke="#a8621c" stroke-width="1.6"/>`;
      }
      s += `<polygon points="${p(x0 + 10, y - 3)} ${p(x0 + 34, y - 3)} ${p(x0 + 44, y - 10)} ${p(x0 + 20, y - 10)}" fill="#fff" opacity=".35"/>`;
    }
    if (d.decor === "nuca") {
      for (let i = 0; i < 9; i++) {
        const u = rnd(), v = rnd();
        const cx = x0 + 6 + u * (w - 12) + v * dx, cy = y + v * dy - 1;
        s += `<path d="M${cx - 4},${cy} q2,-5 4,-3 q2,-3 4,1 q-1,4 -4,3 q-3,2 -4,-1z" fill="#c8945a" stroke="#8a5a2c" stroke-width=".7"/>`;
      }
    }
    return s;
  }

  function cozonac() {
    return `<ellipse cx="104" cy="152" rx="70" ry="10" fill="rgba(0,0,0,.14)"/>
      <path d="M58,150 L58,92 Q58,50 112,48 Q166,50 166,92 L166,150 Z" fill="#8f4d1d"/>
      <path d="M40,152 L40,96 Q40,54 94,52 Q148,54 148,96 L148,152 Z" fill="#b8682a"/>
      <path d="M48,146 L48,98 Q48,62 94,60 Q140,62 140,98 L140,146 Z" fill="#f3d89a"/>
      <path d="M94,104 m0,0 a6,6 0 1,1 7,5 a13,13 0 1,1 -18,-14 a21,21 0 1,1 30,24 a29,29 0 0,1 -44,-12" fill="none" stroke="#5a3220" stroke-width="7" stroke-linecap="round"/>
      <path d="M52,70 Q70,56 94,55" fill="none" stroke="#e39a52" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  }

  function chec() {
    return `<ellipse cx="104" cy="150" rx="74" ry="10" fill="rgba(0,0,0,.14)"/>
      <path d="M140,148 L176,128 L176,78 L140,98 Z" fill="#8f4d1d"/>
      <path d="M36,98 L72,78 L176,78 L140,98 Z" fill="#a8612a"/>
      <path d="M36,98 Q88,86 140,98 L140,148 L36,148 Z" fill="#b8682a"/>
      <rect x="42" y="100" width="92" height="42" rx="4" fill="#f1cf86"/>
      <path d="M46,128 C62,108 74,138 88,118 C100,102 112,132 130,112" fill="none" stroke="#6a3b22" stroke-width="8" stroke-linecap="round"/>
      <path d="M50,110 C60,104 66,116 76,108" fill="none" stroke="#6a3b22" stroke-width="5" stroke-linecap="round"/>
      <path d="M44,92 L68,80 L172,80" fill="none" stroke="#fff8ea" stroke-width="5" stroke-linecap="round" opacity=".9"/>`;
  }

  function savarina() {
    return `<ellipse cx="100" cy="152" rx="62" ry="10" fill="rgba(0,0,0,.14)"/>
      <path d="M44,138 Q44,114 100,111 Q156,114 156,138 Q156,152 100,154 Q44,152 44,138Z" fill="#c97a32"/>
      <path d="M54,136 Q60,124 80,122" fill="none" stroke="#e8a35a" stroke-width="3" stroke-linecap="round"/>
      ${[52, 68, 84, 100, 116, 132, 148].map((x, i) => `<circle cx="${x}" cy="${108 - (i % 2) * 3}" r="13" fill="#fffaf0"/>`).join("")}
      <path d="M50,100 Q54,60 100,58 Q146,60 150,100 Q100,108 50,100Z" fill="#d98d3e"/>
      <path d="M64,86 Q70,68 96,64" fill="none" stroke="#f6c27a" stroke-width="5" stroke-linecap="round" opacity=".9"/>
      <circle cx="100" cy="50" r="9" fill="#c8102e"/><circle cx="97" cy="47" r="2.5" fill="#fff" opacity=".7"/>
      <path d="M100,41 q4,-10 12,-12" fill="none" stroke="#2f6b4a" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  function ecler() {
    const unul = (ty, rot) => `<g transform="translate(0 ${ty}) rotate(${rot} 100 110)">
      <rect x="28" y="96" width="144" height="40" rx="20" fill="#d9a055"/>
      <rect x="28" y="118" width="144" height="18" rx="9" fill="#b97d3a"/>
      <rect x="30" y="92" width="140" height="24" rx="12" fill="#4a2617"/>
      <path d="M48,99 L120,99" stroke="#8a5a3c" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="122" r="6" fill="#fbe58a"/></g>`;
    return `<ellipse cx="100" cy="150" rx="74" ry="10" fill="rgba(0,0,0,.14)"/>` + unul(12, -10) + unul(-24, -10);
  }

  /** SVG-ul complet al unui produs, de pus pe „farfuria” rotundă. */
  function produs(p) {
    const d = p.desen;
    let corp = "";
    if (d.tip === "felie") corp = felie(d);
    else if (d.tip === "cozonac") corp = cozonac();
    else if (d.tip === "chec") corp = chec();
    else if (d.tip === "savarina") corp = savarina();
    else if (d.tip === "ecler") corp = ecler();
    return `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">${corp}</svg>`;
  }

  /** Tava din hero: cremșnit tăiat pătrățele, cu o felie scoasă alături. */
  function tava() {
    const rnd = aleator(42);
    const cols = 4, rows = 3, x0 = 96, y0 = 120, cw = 108, ch = 92, gap = 6;
    let celule = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = x0 + c * (cw + gap), y = y0 + r * (ch + gap);
        if (r === 2 && c === 3) {
          celule += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="4" fill="#2a2422"/>`;
          continue;
        }
        celule += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="5" fill="#fff6df"/>`;
        celule += `<rect x="${x}" y="${y + ch - 8}" width="${cw}" height="8" fill="#e8c46a" opacity=".55"/>`;
        for (let i = 0; i < 14; i++) {
          celule += `<circle cx="${x + 6 + rnd() * (cw - 12)}" cy="${y + 6 + rnd() * (ch - 18)}" r="${1 + rnd() * 1.6}" fill="#ffffff"/>`;
        }
      }
    }
    const felieMare = felie(
      { straturi: [["#d9a55a", 14], ["#f6dc7a", 62], ["#fff8ea", 22], ["#d9a55a", 14]], decor: "pudra" },
      { w: 120, dx: 50, dy: -28, x: 452, y: 486 },
    );
    const nuca = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-18,0 q4,-16 18,-14 q14,-2 18,14 q-4,14 -18,13 q-14,1 -18,-13z" fill="#c8945a" stroke="#8a5a2c" stroke-width="2"/><path d="M0,-13 L0,13 M-10,-6 q6,4 0,10 M10,-6 q-6,4 0,10" stroke="#8a5a2c" stroke-width="2" fill="none"/></g>`;
    return `<svg viewBox="0 0 680 600" aria-hidden="true" focusable="false">
      <ellipse cx="330" cy="470" rx="300" ry="40" fill="rgba(0,0,0,.18)"/>
      <g transform="rotate(-8 330 280)">
        <rect x="64" y="88" width="520" height="364" rx="30" fill="#3a3330"/>
        <rect x="78" y="102" width="492" height="336" rx="20" fill="#57504b"/>
        <rect x="88" y="112" width="472" height="316" rx="14" fill="#2a2422"/>
        ${celule}
        <path d="M96,104 L540,104" stroke="#8c837d" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      </g>
      <g class="hero-felie">${felieMare}</g>
      ${nuca(70, 500, -20)}${nuca(620, 120, 30)}${nuca(600, 210, -10)}
    </svg>`;
  }

  /** Emblema rotundă din logo: o felie pe fond roșu. */
  function emblema() {
    return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill="#e8432e"/>
      <polygon points="11,30 29,30 37,25 19,25" fill="#fffaf0"/>
      <rect x="11" y="30" width="18" height="3" fill="#d9a55a"/>
      <rect x="11" y="33" width="18" height="5" fill="#f6dc7a"/>
      <rect x="11" y="38" width="18" height="2.5" fill="#d9a55a"/>
      <polygon points="29,30 37,25 37,35.5 29,40.5" fill="#c99a3a"/>
      <path d="M17,19 q3,-6 0,-11 M24,19 q3,-6 0,-11 M31,19 q3,-6 0,-11" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/>
    </svg>`;
  }

  return { produs, tava, emblema, nuanta };
})();
