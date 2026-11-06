/* Tava Bunicii – logica demo: coș, meniu, platou, zile de copt, precomandă de Crăciun. */
(function () {
  "use strict";
  const { FIRMA, CULORI, PRODUSE, GRUPURI, OCAZII, PLATOU, LIVRARE, COPT, CRACIUN } = window.TAVA;
  const DESEN = window.DESEN;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  let observator = null;
  const dupaId = Object.fromEntries(PRODUSE.map((p) => [p.id, p]));

  const lei = (v) => {
    const r = Math.round(v * 100) / 100;
    return (Number.isInteger(r) ? String(r) : r.toFixed(2).replace(".", ",")) + " lei";
  };
  /* „1 bucată”, „2 bucăți”, „20 de bucăți” */
  const plural = (n, unu, multe) => (n === 1 ? `1 ${unu}` : `${n} ${n % 100 >= 20 || n % 100 === 0 ? "de " : ""}${multe}`);
  const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function stilCard(culoare) {
    const c = CULORI[culoare];
    return {
      card: `background:${c.fundal};color:${c.text}`,
      plus: c.inchis ? "background:#fff;color:#141110" : "background:#141110;color:#fff",
      chipPret: c.inchis ? "background:rgba(255,255,255,.14)" : "background:rgba(255,255,255,.55)",
    };
  }
  /* poza rotundă (img/<id>-400|800.webp), decupată cu object-fit: cover; `decor` = fără text alternativ */
  const poza = (id, sizes, alt) =>
    `<img src="img/${id}-400.webp" srcset="img/${id}-400.webp 400w, img/${id}-800.webp 800w" sizes="${sizes}" width="400" height="400" loading="lazy" decoding="async" alt="${escape(alt)}">`;
  const farfurie = (p, sizes, decor) =>
    `<span class="farfurie"><span class="farfurie__disc">${poza(p.poza || p.id, sizes || "120px", decor ? "" : p.nume)}</span></span>`;
  const patrat = (l) => l.poza
    ? `<img class="patrat" src="img/${l.poza}-400.webp" width="400" height="400" loading="lazy" decoding="async" alt="">`
    : `<span class="patrat" style="background:${l.culoare}" aria-hidden="true">${l.emoji || ""}</span>`;
  const unitateBucata = (p) => p.unitateBucata || "buc.";

  /* ================= Stocare (cu try/catch: merge și fără localStorage) ================= */
  const stocare = {
    citeste(k, implicit) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : implicit; } catch (e) { return implicit; } },
    scrie(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* fără stocare */ } },
  };

  /* ================= Zilele de copt ================= */
  const LUNI = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];
  const ZILE_SAPT = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function zileDeCopt() {
    const azi = new Date(); azi.setHours(0, 0, 0, 0);
    const rez = [];
    const d = new Date(azi); d.setDate(d.getDate() + 1); // comenzile se dau cu cel puțin o zi înainte
    while (rez.length < COPT.cateZile) {
      if (COPT.zile.includes(d.getDay())) {
        const idx = rez.length;
        const h = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % 97;
        let libere;
        if (idx === 0) libere = 2 + (h % 3);
        else if (idx === 1) libere = h % 2 === 0 ? 0 : 5;
        else libere = Math.min(COPT.capacitate, 8 + (h % 15) + idx);
        rez.push({ iso: iso(d), zi: ZILE_SAPT[d.getDay()], data: d.getDate(), luna: LUNI[d.getMonth()], libere });
      }
      d.setDate(d.getDate() + 1);
    }
    return rez;
  }
  const ZILE = zileDeCopt();
  const ziDupaIso = (v) => ZILE.find((z) => z.iso === v);
  const textZi = (z) => `${z.zi}, ${z.data} ${z.luna}`;

  /* ================= Starea coșului ================= */
  const CHEIE = "tava-bunicii-cos-v1";
  const stare = Object.assign(
    { linii: [], zi: null, mod: "livrare", craciunConfirmati: 0 },
    stocare.citeste(CHEIE, {}),
  );
  if (!ziDupaIso(stare.zi) || ziDupaIso(stare.zi).libere === 0) stare.zi = (ZILE.find((z) => z.libere > 0) || ZILE[0]).iso;
  let confirmare = null;

  const salveaza = () => stocare.scrie(CHEIE, { linii: stare.linii, zi: stare.zi, mod: stare.mod, craciunConfirmati: stare.craciunConfirmati });

  const subtotal = () => stare.linii.reduce((s, l) => s + l.pret * l.cantitate, 0);
  const numarProduse = () => stare.linii.reduce((s, l) => s + l.cantitate, 0);
  const taxaLivrare = () => (stare.mod === "ridicare" || subtotal() === 0 || subtotal() >= LIVRARE.prag ? 0 : LIVRARE.taxa);
  const craciunInCos = () => stare.linii.filter((l) => l.tip === "craciun").reduce((s, l) => s + l.cantitate, 0);
  const craciunRezervati = () => Math.min(CRACIUN.stoc, CRACIUN.rezervate + stare.craciunConfirmati + craciunInCos());

  function adaugaLinie(linie, cantitate) {
    const existent = stare.linii.find((l) => l.cheie === linie.cheie);
    if (existent) existent.cantitate += cantitate;
    else stare.linii.push(Object.assign({}, linie, { cantitate }));
    confirmare = null;
    salveaza();
    actualizeazaCos(true);
  }

  function adaugaProdus(id, unitate) {
    const p = dupaId[id];
    const kg = unitate === "kg";
    adaugaLinie({
      cheie: `${id}:${unitate}`, tip: "produs", id, nume: p.nume,
      detaliu: kg ? "1 kg" : `1 ${unitateBucata(p) === "felie" ? "felie" : "bucată"}`,
      unitate, pret: kg ? p.kg : p.bucata, culoare: CULORI[p.culoare].fundal, poza: p.id,
    }, 1);
    toast(`${p.nume} ${kg ? "(1 kg) " : ""}e în coș`);
  }

  /* ================= Toast ================= */
  let timerToast = 0;
  function toast(text) {
    const el = $("[data-toast]");
    el.textContent = text;
    el.classList.add("vizibil");
    clearTimeout(timerToast);
    timerToast = setTimeout(() => el.classList.remove("vizibil"), 1800);
  }

  /* „+” care arată scurt o bifă după apăsare */
  function butonPlus(el, actiune) {
    el.addEventListener("click", () => {
      actiune();
      el.innerHTML = '<span class="bifa-mica">✓</span>';
      clearTimeout(el._t);
      el._t = setTimeout(() => { el.textContent = "+"; }, 900);
    });
  }

  /* ================= Logo, hero ================= */
  $$("[data-emblema]").forEach((el) => { el.innerHTML = DESEN.emblema(); });

  const vedeta = dupaId.cremsnit;
  $("[data-card-rapid]").innerHTML = `
    <div class="card-rapid__nume"><span>${vedeta.eticheta}</span><span class="titlu">${vedeta.nume}</span></div>
    <span class="titlu card-rapid__pret">${lei(vedeta.bucata)}</span>
    <button type="button" class="plus" aria-label="Adaugă ${vedeta.nume} în coș">+</button>`;
  butonPlus($("[data-card-rapid] .plus"), () => adaugaProdus("cremsnit", "bucata"));

  /* ================= 3. Favoritele bunicii ================= */
  const favorite = ["cremsnit", "amandine", "cozonac"].map((id) => dupaId[id]);
  $("[data-favorite]").innerHTML = favorite.map((p, i) => {
    const s = stilCard(p.culoare);
    return `<article class="card-pref grup" style="${s.card}">
      <div class="card-pref__poza">${farfurie(p, "(max-width: 767px) 220px, 320px")}</div>
      <div class="card-pref__corp">
        <span class="card-pref__nr">N° ${String(i + 1).padStart(2, "0")}${p.eticheta ? " · " + p.eticheta : ""}</span>
        <h3 class="titlu card-pref__nume">${p.nume}</h3>
        <p class="card-pref__desc">${p.descriere}</p>
        <div class="card-pref__jos">
          <span class="card-pref__pret"><small>de la</small>${lei(p.bucata)}</span>
          <button type="button" class="plus plus--md-lg" style="${s.plus}" aria-label="Adaugă ${p.nume} în coș" data-plus="${p.id}">+</button>
        </div>
      </div>
    </article>`;
  }).join("");
  $$("[data-favorite] [data-plus]").forEach((b) => butonPlus(b, () => adaugaProdus(b.dataset.plus, "bucata")));

  /* ================= 5. Meniul complet ================= */
  let unitate = "bucata";
  function deseneazaMeniu() {
    $("[data-meniu-grupuri]").innerHTML = GRUPURI.map((g) => {
      const produse = PRODUSE.filter((p) => p.grup === g.id);
      return `<section class="grup-sectiune" id="grup-${g.id}">
        <div class="grup-sectiune__cap"><h3 class="titlu">${g.titlu}</h3><span>${g.subtitlu} · ${plural(produse.length, "prăjitură", "prăjituri")}</span></div>
        <div class="grila">${produse.map((p) => {
          const s = stilCard(p.culoare);
          const kg = unitate === "kg";
          return `<article class="card-meniu grup" style="${s.card}">
            <span class="card-meniu__poza">${farfurie(p, "(max-width: 767px) 96px, 114px")}</span>
            <h4 class="titlu card-meniu__nume">${p.nume}</h4>
            <p class="card-meniu__desc">${p.descriere}</p>
            <div class="card-meniu__jos">
              <span class="card-meniu__pret" style="${s.chipPret}"><b>${lei(kg ? p.kg : p.bucata)}</b><span class="card-meniu__unit">/ ${kg ? "kg" : unitateBucata(p)}</span></span>
              <button type="button" class="plus plus--xs" style="${s.plus}" aria-label="Adaugă ${p.nume} (${kg ? "1 kg" : "1 bucată"}) în coș" data-plus="${p.id}">+</button>
            </div>
          </article>`;
        }).join("")}</div>
      </section>`;
    }).join("");
    $$("[data-meniu-grupuri] [data-plus]").forEach((b) => butonPlus(b, () => adaugaProdus(b.dataset.plus, unitate)));
    observaFarfurii();
  }
  $("[data-grupuri-nav]").innerHTML = GRUPURI.map((g, i) => {
    const n = PRODUSE.filter((p) => p.grup === g.id).length;
    return `<a href="#grup-${g.id}" class="grup-link${i === 0 ? " activ" : ""}" data-grup-link="${g.id}"><span>${g.titlu}</span><span>· ${n}</span></a>`;
  }).join("");
  $$("[data-unitate]").forEach((b) => b.addEventListener("click", () => {
    unitate = b.dataset.unitate;
    $$("[data-unitate]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    deseneazaMeniu();
  }));
  deseneazaMeniu();

  /* grupul activ din bara laterală urmează derularea */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((intrari) => {
      intrari.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id.replace("grup-", "");
        $$("[data-grup-link]").forEach((a) => a.classList.toggle("activ", a.dataset.grupLink === id));
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    GRUPURI.forEach((g) => io.observe(document.getElementById("grup-" + g.id)));
  }

  /* ================= 4. Fă-ți platoul ================= */
  const platou = { ocazie: OCAZII[0].id, persoane: PLATOU.implicit };
  $("[data-disc-platou]").innerHTML = farfurie(dupaId.amandine, "(max-width: 767px) 96px, 160px", true);

  function calculeazaPlatou() {
    const o = OCAZII.find((x) => x.id === platou.ocazie);
    const total = platou.persoane * o.perPersoana;
    const intrari = Object.entries(o.mix).map(([id, f]) => ({ id, exact: total * f }));
    intrari.forEach((x) => { x.buc = Math.floor(x.exact); });
    let rest = total - intrari.reduce((s, x) => s + x.buc, 0);
    intrari.slice().sort((a, b) => (b.exact - b.buc) - (a.exact - a.buc)).forEach((x) => { if (rest > 0) { x.buc++; rest--; } });
    const linii = intrari.filter((x) => x.buc > 0).map((x) => ({ produs: dupaId[x.id], buc: x.buc, pret: x.buc * dupaId[x.id].bucata }));
    const brut = linii.reduce((s, l) => s + l.pret, 0);
    const reducere = platou.persoane >= 80 ? 0.1 : platou.persoane >= 40 ? 0.05 : 0;
    const final = Math.round(brut * (1 - reducere));
    return { o, total, linii, brut, reducere, final, kg: (total * PLATOU.gramePeBucata) / 1000, tavi: Math.ceil(total / PLATOU.bucatiPeTava) };
  }

  $("[data-ocazii]").innerHTML = OCAZII.map((o) => `
    <button type="button" class="optiune" role="radio" aria-checked="${o.id === platou.ocazie}" data-ocazie="${o.id}">
      <span class="optiune__sus"><span class="optiune__emoji" aria-hidden="true">${o.emoji}</span><span class="bifa" aria-hidden="true"></span></span>
      <span class="optiune__nume">${o.nume}</span>
      <span class="optiune__desc">${o.perPersoana} prăjituri / pers.</span>
    </button>`).join("");
  $$("[data-ocazie]").forEach((b) => b.addEventListener("click", () => {
    platou.ocazie = b.dataset.ocazie;
    $$("[data-ocazie]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    deseneazaPlatou();
  }));

  const glisor = $("[data-persoane-glisor]");
  function seteazaPersoane(n) {
    platou.persoane = Math.max(PLATOU.minPersoane, Math.min(PLATOU.maxPersoane, n));
    glisor.value = platou.persoane;
    deseneazaPlatou();
  }
  $$("[data-persoane]").forEach((b) => b.addEventListener("click", () => seteazaPersoane(platou.persoane + (b.dataset.persoane === "+" ? PLATOU.pas : -PLATOU.pas))));
  glisor.addEventListener("input", () => seteazaPersoane(Number(glisor.value)));

  function deseneazaPlatou() {
    const r = calculeazaPlatou();
    $("[data-persoane-valoare]").textContent = platou.persoane;
    $("[data-persoane='-']").disabled = platou.persoane <= PLATOU.minPersoane;
    $("[data-persoane='+']").disabled = platou.persoane >= PLATOU.maxPersoane;
    $("[data-nota-ocazie]").textContent = `${r.o.nota} Calculăm ${r.o.perPersoana} prăjituri de persoană. De la 40 de persoane ai 5% reducere, de la 80, 10%.`;
    $("[data-bon-titlu]").textContent = `Platou de ${r.o.nume.toLowerCase()}`;
    $("[data-bon-linii]").innerHTML = r.linii.map((l) => `
      <li class="bon__linie">${farfurie(l.produs, "44px", true)}
        <span class="bon__linie-nume"><b>${l.produs.nume}</b><span>${l.buc} buc. × ${lei(l.produs.bucata)}</span></span>
        <span class="bon__linie-pret">${lei(l.pret)}</span></li>`).join("");
    $("[data-bon-info]").innerHTML = `<span>${r.total} bucăți</span><span>≈ ${r.kg.toFixed(1).replace(".", ",")} kg</span><span>${plural(r.tavi, "tavă", "tăvi")}</span>` +
      (r.reducere ? `<span class="reducere">−${Math.round(r.reducere * 100)}% · economisești ${lei(r.brut - r.final)}</span>` : "");
    $("[data-bon-total]").textContent = lei(r.final);
    $("[data-bon-perpers]").textContent = `adică ${lei(Math.round((r.final / platou.persoane) * 100) / 100)} de persoană`;
  }
  deseneazaPlatou();

  $("[data-adauga-platou]").addEventListener("click", () => {
    const r = calculeazaPlatou();
    adaugaLinie({
      cheie: `platou:${platou.ocazie}:${platou.persoane}`, tip: "platou", id: "platou",
      nume: `Platou de ${r.o.nume.toLowerCase()}`,
      detaliu: `${platou.persoane} persoane · ${r.total} buc. · ${r.linii.map((l) => l.produs.nume).join(", ")}`,
      pret: r.final, culoare: "#e8432e", emoji: r.o.emoji, poza: r.linii[0].produs.id,
    }, 1);
    toast(`Platoul pentru ${platou.persoane} persoane e în coș`);
  });

  const bannerPlatou = $("[data-deschide-platou]");
  const configurator = $("#configurator-platou");
  function deschidePlatou(deschis) {
    configurator.hidden = !deschis;
    bannerPlatou.setAttribute("aria-expanded", String(deschis));
    if (deschis) observaFarfurii();
  }
  bannerPlatou.addEventListener("click", () => deschidePlatou(configurator.hidden));
  $$("[data-deschide-platou-link]").forEach((a) => a.addEventListener("click", () => deschidePlatou(true)));

  /* ================= 7. Ziua de copt și livrarea ================= */
  function deseneazaZile() {
    $("[data-zile]").innerHTML = ZILE.map((z) => `
      <button type="button" class="zi" role="radio" aria-checked="${z.iso === stare.zi}" ${z.libere === 0 ? "disabled" : ""} data-zi="${z.iso}"
        aria-label="${textZi(z)}, ${z.libere === 0 ? "complet" : plural(z.libere, "loc liber", "locuri libere")}">
        <span class="zi__nume">${z.zi}</span>
        <span class="titlu zi__data">${z.data}</span>
        <span class="zi__luna">${z.luna}</span>
        <span class="zi__locuri${z.libere > 0 && z.libere <= 5 ? " putine" : ""}">${z.libere === 0 ? "Complet" : z.libere <= 5 ? `Ultimele ${z.libere}` : `${z.libere} locuri`}</span>
      </button>`).join("");
    $$("[data-zi]").forEach((b) => b.addEventListener("click", () => alegeZi(b.dataset.zi)));
    $$("[data-mod]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mod === stare.mod)));
    const z = ziDupaIso(stare.zi);
    $("[data-zi-aleasa]").innerHTML = `Ai ales: <b>${textZi(z)}</b> · ${stare.mod === "livrare" ? "livrare acasă, între 10:00 și 18:00" : "ridicare din Giroc, 9:00 – 18:00"}.`;
  }
  function alegeZi(v) { stare.zi = v; salveaza(); deseneazaZile(); actualizeazaCos(); }
  function alegeMod(m) { stare.mod = m; salveaza(); deseneazaZile(); actualizeazaCos(); }
  $$("[data-mod]").forEach((b) => b.addEventListener("click", () => alegeMod(b.dataset.mod)));
  deseneazaZile();

  /* ================= 8. Cozonac de Crăciun ================= */
  const craciun = { varianta: CRACIUN.variante[0].id, cantitate: 1 };
  $("[data-disc-craciun]").innerHTML = farfurie({ poza: "cozonac-craciun", nume: "Cozonac de Crăciun" }, "(max-width: 767px) 150px, 190px");
  $("[data-variante]").innerHTML = CRACIUN.variante.map((v) => `
    <button type="button" class="varianta" role="radio" aria-checked="${v.id === craciun.varianta}" data-varianta="${v.id}">
      <span class="bifa" aria-hidden="true"></span><span class="varianta__nume">${v.nume}</span><span class="varianta__pret">${lei(v.pret)}</span>
    </button>`).join("");
  $$("[data-varianta]").forEach((b) => b.addEventListener("click", () => {
    craciun.varianta = b.dataset.varianta;
    $$("[data-varianta]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    deseneazaCraciun();
  }));
  $$("[data-qty]").forEach((b) => b.addEventListener("click", () => {
    craciun.cantitate += b.dataset.qty === "+" ? 1 : -1;
    deseneazaCraciun();
  }));
  function deseneazaCraciun() {
    const rez = craciunRezervati();
    const ramas = CRACIUN.stoc - rez;
    craciun.cantitate = Math.max(1, Math.min(craciun.cantitate, Math.max(1, Math.min(5, ramas))));
    const v = CRACIUN.variante.find((x) => x.id === craciun.varianta);
    $("[data-stoc-rezervati]").textContent = rez;
    $("[data-stoc-umplere]").style.width = `${(rez / CRACIUN.stoc) * 100}%`;
    $("[data-stoc-bara]").setAttribute("aria-valuenow", String(rez));
    $("[data-stoc-ramas]").textContent = ramas > 0 ? `Mai sunt ${plural(ramas, "cozonac", "cozonaci")}.` : "Toți cozonacii au fost rezervați.";
    $("[data-qty-valoare]").textContent = craciun.cantitate;
    $("[data-qty='-']").disabled = craciun.cantitate <= 1;
    $("[data-qty='+']").disabled = craciun.cantitate >= Math.min(5, ramas);
    $("[data-pret-craciun]").textContent = lei(v.pret * craciun.cantitate);
    $("[data-rezerva]").disabled = ramas <= 0;
  }
  $("[data-rezerva]").addEventListener("click", () => {
    const v = CRACIUN.variante.find((x) => x.id === craciun.varianta);
    const ramas = CRACIUN.stoc - craciunRezervati();
    const n = Math.min(craciun.cantitate, ramas);
    if (n <= 0) return;
    adaugaLinie({
      cheie: v.id, tip: "craciun", id: v.id, nume: "Cozonac de Crăciun", detaliu: `${v.nume} · 1 kg · livrare ${CRACIUN.livrare}`,
      pret: v.pret, culoare: "#2f6b4a", emoji: "🎄", poza: "cozonac-craciun",
    }, n);
    toast(`${plural(n, "cozonac rezervat", "cozonaci rezervați")} în coș`);
    craciun.cantitate = 1;
  });
  deseneazaCraciun();

  /* ================= Coșul: insigne, bara mobilă, mini-coș, sertar ================= */
  function actualizeazaCos(puls) {
    const n = numarProduse();
    $$("[data-numar-cos]").forEach((b) => {
      b.textContent = n;
      b.setAttribute("aria-label", `${n} produse în coș`);
      if (puls) { b.classList.remove("puls"); void b.offsetWidth; b.classList.add("puls"); }
    });
    const total = subtotal() + taxaLivrare();
    $("[data-bara-cos]").textContent = n > 0 ? `${n} ${n === 1 ? "produs" : "produse"} · ${lei(total)}` : "Coș · 0 lei";
    deseneazaMiniCos();
    deseneazaCraciun();
    if (!$("[data-cos]").hidden) deseneazaSertar();
  }

  function deseneazaMiniCos() {
    const linii = stare.linii;
    const livr = taxaLivrare();
    $("[data-mini-cos]").innerHTML = `
      <h3 class="titlu">Coșul tău</h3>
      ${linii.length === 0 ? `<p class="mini-cos__gol">Coșul e gol. Apasă „+” pe orice prăjitură ca s-o adaugi.</p>` : `
      <ul>${linii.slice(0, 4).map((l) => `
        <li>${patrat(l)}
          <div class="mini-cos__nume"><p>${l.cantitate > 1 ? `<span style="color:var(--gri-2)">${l.cantitate}× </span>` : ""}${escape(l.nume)}</p><p>${escape(l.detaliu)}</p></div>
          <span class="mini-cos__pret">${lei(l.pret * l.cantitate)}</span></li>`).join("")}
        ${linii.length > 4 ? `<li style="font-size:14px;color:var(--gri-2)">+ încă ${linii.length - 4} produse în coș</li>` : ""}
      </ul>`}
      <div class="rand-livrare"><span>${stare.mod === "ridicare" ? "Ridicare Giroc" : "Livrare"}</span><b>${livr === 0 ? "0 lei" : lei(livr)}</b></div>
      <div class="rand-total"><span>Total</span><span class="titlu">${lei(subtotal() + livr)}</span></div>
      <button type="button" class="pill pill--rosu pill--lg" ${linii.length === 0 ? "disabled" : ""} data-deschide-cos-mini>Finalizează comanda</button>`;
    const b = $("[data-deschide-cos-mini]");
    if (b) b.addEventListener("click", deschideCos);
  }

  const sertar = $("[data-cos]");
  const fundal = $("[data-cos-fundal]");
  let ultimulFocus = null;
  function deschideCos() {
    ultimulFocus = document.activeElement;
    deseneazaSertar();
    sertar.hidden = false;
    fundal.hidden = false;
    document.body.classList.add("fara-scroll");
    $("[data-inchide-cos]").focus();
  }
  function inchideCos() {
    sertar.hidden = true;
    fundal.hidden = true;
    document.body.classList.remove("fara-scroll");
    if (confirmare) { confirmare = null; }
    if (ultimulFocus && ultimulFocus.focus) ultimulFocus.focus();
  }
  $$("[data-deschide-cos]").forEach((b) => b.addEventListener("click", deschideCos));
  $("[data-inchide-cos]").addEventListener("click", inchideCos);
  fundal.addEventListener("click", inchideCos);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sertar.hidden) inchideCos();
    if (e.key === "Tab" && !sertar.hidden) {
      const focusabile = $$("button:not([disabled]), input, select, textarea, a[href]", sertar);
      const primul = focusabile[0], ultimul = focusabile[focusabile.length - 1];
      if (e.shiftKey && document.activeElement === primul) { e.preventDefault(); ultimul.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimul) { e.preventDefault(); primul.focus(); }
    }
  });

  const formular = { nume: "", telefon: "", adresa: "", note: "" };

  function deseneazaSertar() {
    const corp = $("[data-cos-corp]");
    if (confirmare) {
      corp.innerHTML = `<div class="confirmare">
        <span class="confirmare__icon" aria-hidden="true">✓</span>
        <h3 class="titlu">Mulțumim, ${escape(confirmare.nume.split(" ")[0])}!</h3>
        <p>Comanda <b>${confirmare.cod}</b> a fost înregistrată pentru <b>${confirmare.zi}</b>, ${confirmare.mod}. Total: <b>${lei(confirmare.total)}</b>.</p>
        <p>Într-un site real, bunica te-ar suna acum să confirme. Aceasta este o machetă: comanda nu a fost trimisă nicăieri.</p>
        <button type="button" class="pill pill--alb pill--md" data-inapoi>Înapoi la prăjituri</button>
      </div>`;
      $("[data-inapoi]").addEventListener("click", inchideCos);
      return;
    }
    if (stare.linii.length === 0) {
      corp.innerHTML = `<div class="cos__gol"><p>Coșul e gol. Apasă „+” pe orice prăjitură ca s-o adaugi, sau fă-ți un platou pentru o masă mare.</p>
        <a href="#meniu" class="pill pill--rosu pill--md" data-spre-meniu>Vezi prăjiturile</a></div>`;
      $("[data-spre-meniu]").addEventListener("click", inchideCos);
      return;
    }
    const sub = subtotal(), livr = taxaLivrare(), lipsa = LIVRARE.prag - sub;
    const doarCraciun = stare.linii.every((l) => l.tip === "craciun");
    corp.innerHTML = `
      <div class="cos__bloc">
        ${stare.linii.map((l, i) => `
          <div class="rand-cos">
            ${patrat(l)}
            <div class="rand-cos__info"><b>${escape(l.nume)}</b><small>${escape(l.detaliu)}</small>
              <div class="qty"><button type="button" data-cant="${i}" data-pas="-1" aria-label="Scade cantitatea pentru ${escape(l.nume)}">−</button><b>${l.cantitate}</b><button type="button" data-cant="${i}" data-pas="1" aria-label="Crește cantitatea pentru ${escape(l.nume)}">+</button></div>
            </div>
            <span class="rand-cos__pret">${lei(l.pret * l.cantitate)}</span>
          </div>`).join("")}
      </div>
      <div class="cos__bloc">
        <h3 class="titlu">${doarCraciun ? "Cum le primești" : "Ziua de copt"}</h3>
        ${doarCraciun ? `<p style="font-size:14px;color:var(--gri-1)">Cozonacii de Crăciun se livrează pe ${CRACIUN.livrare}.</p>` : `
        <div class="cos__zi fara-scrollbar">${ZILE.map((z) => `<button type="button" aria-pressed="${z.iso === stare.zi}" ${z.libere === 0 ? "disabled" : ""} data-cos-zi="${z.iso}">${z.zi.slice(0, 3)} ${z.data} ${z.luna}</button>`).join("")}</div>`}
        <div class="cos__segment" role="group" aria-label="Livrare sau ridicare">
          <button type="button" aria-pressed="${stare.mod === "livrare"}" data-cos-mod="livrare">Livrare</button>
          <button type="button" aria-pressed="${stare.mod === "ridicare"}" data-cos-mod="ridicare">Ridicare Giroc</button>
        </div>
        ${stare.linii.some((l) => l.tip === "craciun") && !doarCraciun ? `<p style="font-size:13px;color:var(--gri-1)">🎄 Cozonacii de Crăciun vin separat, pe ${CRACIUN.livrare}.</p>` : ""}
      </div>
      <form class="cos__bloc" novalidate data-formular>
        <h3 class="titlu">Datele tale</h3>
        <div class="camp"><label for="f-nume">Nume</label><input id="f-nume" name="nume" autocomplete="name" value="${escape(formular.nume)}" required></div>
        <div class="camp"><label for="f-tel">Telefon</label><input id="f-tel" name="telefon" type="tel" inputmode="tel" autocomplete="tel" placeholder="07xx xxx xxx" value="${escape(formular.telefon)}" required></div>
        ${stare.mod === "livrare" ? `<div class="camp"><label for="f-adresa">Adresa de livrare</label><input id="f-adresa" name="adresa" autocomplete="street-address" placeholder="Strada, număr, localitate" value="${escape(formular.adresa)}" required></div>` : ""}
        <div class="camp"><label for="f-note">Mențiuni (opțional)</label><textarea id="f-note" name="note" placeholder="Ex.: fără nucă la amandine, scris „La mulți ani, Ana!”">${escape(formular.note)}</textarea></div>
        <div class="cos__rezumat">
          <div class="rand"><span>Subtotal</span><b>${lei(sub)}</b></div>
          <div class="rand"><span>${stare.mod === "ridicare" ? "Ridicare din Giroc" : "Livrare"}</span><span class="${livr === 0 ? "verde" : ""}">${livr === 0 ? "0 lei" : lei(livr)}</span></div>
          ${stare.mod === "livrare" && lipsa > 0 ? `<p class="cos__progres">Mai adaugă <b>${lei(lipsa)}</b> și livrarea e gratuită.</p>` : ""}
          <div class="rand-total"><span>Total</span><span class="titlu">${lei(sub + livr)}</span></div>
        </div>
        <button type="submit" class="pill pill--rosu pill--lg">Trimite comanda</button>
      </form>`;

    $$("[data-cant]", corp).forEach((b) => b.addEventListener("click", () => {
      const l = stare.linii[Number(b.dataset.cant)];
      l.cantitate += Number(b.dataset.pas);
      if (l.cantitate <= 0) stare.linii.splice(Number(b.dataset.cant), 1);
      salveaza();
      actualizeazaCos();
      const tinta = $(`[data-cant="${b.dataset.cant}"][data-pas="${b.dataset.pas}"]`, corp);
      (tinta || $("[data-inchide-cos]")).focus();
    }));
    $$("[data-cos-zi]", corp).forEach((b) => b.addEventListener("click", () => alegeZi(b.dataset.cosZi)));
    $$("[data-cos-mod]", corp).forEach((b) => b.addEventListener("click", () => alegeMod(b.dataset.cosMod)));
    const form = $("[data-formular]", corp);
    form.addEventListener("input", (e) => { if (e.target.name) formular[e.target.name] = e.target.value; });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let primaEroare = null;
      $$(".camp", form).forEach((c) => {
        const input = $("input", c);
        if (!input) return;
        let ok = input.value.trim().length > 1;
        if (input.name === "telefon") ok = /^(\+?40|0)7\d{8}$/.test(input.value.replace(/[\s.-]/g, ""));
        c.classList.toggle("camp--eroare", !ok);
        if (!ok && !primaEroare) primaEroare = input;
      });
      if (primaEroare) { primaEroare.focus(); toast("Verifică numele, telefonul și adresa"); return; }
      const z = ziDupaIso(stare.zi);
      confirmare = {
        nume: formular.nume.trim(),
        cod: "TB-" + String(Date.now()).slice(-5),
        zi: doarCraciun ? CRACIUN.livrare : textZi(z),
        mod: stare.mod === "livrare" ? "cu livrare acasă" : "cu ridicare din Giroc",
        total: sub + livr,
      };
      stare.craciunConfirmati += craciunInCos();
      stare.linii = [];
      salveaza();
      actualizeazaCos();
      deseneazaSertar();
      $("[data-inapoi]").focus();
    });
  }

  /* ================= Navigația mobilă ================= */
  const butonMeniu = $("[data-buton-meniu]");
  const meniuMobil = $("#meniu-mobil");
  function comutaMeniu(deschis) {
    meniuMobil.hidden = !deschis;
    butonMeniu.setAttribute("aria-expanded", String(deschis));
    butonMeniu.setAttribute("aria-label", deschis ? "Închide meniul" : "Deschide meniul");
    butonMeniu.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#141110" stroke-width="2" stroke-linecap="round" aria-hidden="true">${deschis ? '<path d="M6 6l12 12M18 6 6 18"/>' : '<path d="M4 7h16M4 12h16M4 17h16"/>'}</svg>`;
  }
  butonMeniu.addEventListener("click", () => comutaMeniu(meniuMobil.hidden));
  $$("a", meniuMobil).forEach((a) => a.addEventListener("click", () => comutaMeniu(false)));
  document.addEventListener("click", (e) => { if (!meniuMobil.hidden && !e.target.closest(".nav-mobil")) comutaMeniu(false); });

  /* ================= „Pop”-ul farfuriilor la intrarea în ecran ================= */
  function observaFarfurii() {
    if (!("IntersectionObserver" in window)) return;
    if (!observator) {
      observator = new IntersectionObserver((intrari) => {
        intrari.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("pop"); observator.unobserve(e.target); } });
      }, { threshold: 0.2 });
    }
    $$(".farfurie:not(.pop)").forEach((el) => observator.observe(el));
  }
  observaFarfurii();

  actualizeazaCos();
  void FIRMA;
})();
