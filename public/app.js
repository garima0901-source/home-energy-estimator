const T = {
  sv: {
    eyebrow: "Solceller · värmepump · batteri",
    title: "Vad skulle ditt hus spara?",
    lede: "Svara på några frågor om ditt hus. Vi räknar med veckans elpriser i ditt elområde och solinstrålningen just där du bor.",
    sec_home: "Ditt hus",
    postcode: "Postnummer",
    size: "Boyta (m²)",
    built: "Byggår",
    built_pre1960: "Före 1960",
    built_1960: "1960–1979",
    built_1980: "1980–1999",
    built_2000: "2000 eller senare",
    residents: "Antal i hushållet",
    heating: "Hur värms huset i dag?",
    h_direct_electric: "Direktverkande el",
    h_air_air_hp: "Luft/luft-värmepump",
    h_air_water_hp: "Luft/vatten-värmepump",
    h_ground_source_hp: "Bergvärme",
    h_oil: "Olja",
    h_district_heating: "Fjärrvärme",
    h_pellets_wood: "Pellets eller ved",
    kwh: "Elförbrukning per år (kWh)",
    kwh_ph: "Står på din elräkning",
    optional: "(valfritt)",
    roof: "Åt vilket håll lutar taket?",
    roof_south: "Söder",
    roof_ew: "Öst/väst",
    roof_north: "Norr",
    roof_unsure: "Vet ej",
    ev: "Vi planerar att skaffa elbil",
    sec_plans: "Dina planer",
    own: "Äger du huset?",
    yes: "Ja",
    no: "Nej",
    timeline: "När vill du komma igång?",
    t_3m: "Inom 3 månader",
    t_year: "Inom ett år",
    t_curious: "Är bara nyfiken",
    notes: "Något mer vi borde veta?",
    notes_ph: "T.ex. taket byttes 2019, höga elräkningar i vintras …",
    sec_contact: "Vart ska vi skicka kalkylen?",
    first: "Förnamn",
    last: "Efternamn",
    email: "E-post",
    phone: "Telefon",
    consent: "Jag vill att en energirådgivare kontaktar mig om kalkylen. Uppgifterna används bara för det.",
    submit: "Räkna på mitt hus",
    ph_title: "Så här räknar vi",
    ph_1: "Vi hittar ditt elområde (SE1–SE4) och hämtar veckans spotpriser.",
    ph_2: "Vi hämtar hur mycket solel ett tak ger där du bor (EU:s PVGIS-data).",
    ph_3: "Vi jämför dina kostnader i dag med värmepump, solceller och batteri.",
    load_1: "Hittar ditt elområde …",
    load_2: "Hämtar veckans elpriser …",
    load_3: "Räknar på solinstrålningen …",
    load_4: "Skriver din sammanfattning …",
    per_year: "per år",
    savings_label: "uppskattad besparing per år",
    no_savings_label: "dyrare per år på dagens siffror",
    today: "I dag",
    with_bundle: "Med paketet",
    co2: "mindre CO₂ per år",
    solar_size: "solceller",
    solar_prod: "solel per år",
    price_area: "Elområde",
    spot_week: "Spotpris senaste veckan",
    solar_yield: "Solel per kWp här",
    breakdown: "Så räknade vi",
    b_heat: "Värmebehov (värme + varmvatten)",
    b_household: "Hushållsel",
    b_elprice: "Elpris inkl. nät, skatt och moms",
    b_heating_today: "Uppvärmning i dag",
    b_household_today: "Hushållsel i dag",
    b_hp: "El till ny värmepump",
    b_grid: "Köpt el med paketet",
    b_bill: "Elräkning med paketet",
    b_export: "Intäkt för såld solel",
    b_sub: "Månadsavgift × 12",
    caveat: "Preliminär uppskattning, inte en offert. Bygger på schablonvärden och offentliga data.",
    footer: "Konceptprojekt byggt som del av en jobbansökan. Inte kopplat till eller godkänt av Elvy. Data: elprisetjustnu.se (Nord Pool), EU JRC PVGIS, OpenStreetMap.",
    err_generic: "Något gick fel. Försök igen om en stund.",
    err_fields: "Kontrollera de markerade fälten.",
    nav_how: "Så funkar det",
    guide_title: "Granskar du projektet? Börja här",
    guide_intro: "Välj ett exempelhushåll. Formuläret fylls i och kalkylen körs direkt.",
    guide_hide: "Dölj guiden",
    guide_show: "Visa guiden för granskare",
    ex_hot: "Karin, Stockholm",
    ex_hot_sub: "Direktel, vill börja snart → het lead",
    ex_curious: "Johan, Göteborg",
    ex_curious_sub: "Fjärrvärme, bara nyfiken → nurture",
    ex_renter: "Leila, Malmö",
    ex_renter_sub: "Hyr sitt hus → ej aktuell",
    guide_1: "Läs resultatet som husägaren ser det.",
    guide_2: "Scrolla till \"Behind the scenes\": varje steg i CRM-flödet visas där.",
    guide_3: "Kör samma exempel igen: kontakten och affären uppdateras i stället för att dubbleras.",
    guide_more: "Läs hela genomgången: Så funkar det →",
  },
  en: {
    eyebrow: "Solar · heat pump · battery",
    title: "What would your home save?",
    lede: "Answer a few questions about your house. We use this week's electricity prices in your area and the actual sunlight where you live.",
    sec_home: "Your home",
    postcode: "Postcode",
    size: "Living area (m²)",
    built: "Built",
    built_pre1960: "Before 1960",
    built_1960: "1960–1979",
    built_1980: "1980–1999",
    built_2000: "2000 or later",
    residents: "People in the household",
    heating: "How is the house heated today?",
    h_direct_electric: "Direct electric",
    h_air_air_hp: "Air-to-air heat pump",
    h_air_water_hp: "Air-to-water heat pump",
    h_ground_source_hp: "Ground source heat pump",
    h_oil: "Oil",
    h_district_heating: "District heating",
    h_pellets_wood: "Pellets or wood",
    kwh: "Electricity use per year (kWh)",
    kwh_ph: "It's on your electricity bill",
    optional: "(optional)",
    roof: "Which way does the roof face?",
    roof_south: "South",
    roof_ew: "East/west",
    roof_north: "North",
    roof_unsure: "Not sure",
    ev: "We're planning to get an electric car",
    sec_plans: "Your plans",
    own: "Do you own the house?",
    yes: "Yes",
    no: "No",
    timeline: "When would you like to start?",
    t_3m: "Within 3 months",
    t_year: "Within a year",
    t_curious: "Just curious",
    notes: "Anything else we should know?",
    notes_ph: "E.g. roof replaced in 2019, high bills last winter …",
    sec_contact: "Where should we send the estimate?",
    first: "First name",
    last: "Last name",
    email: "Email",
    phone: "Phone",
    consent: "I'd like an energy advisor to contact me about this estimate. My details are used only for that.",
    submit: "Calculate for my home",
    ph_title: "How we calculate",
    ph_1: "We find your price area (SE1–SE4) and fetch this week's spot prices.",
    ph_2: "We look up how much solar power a roof produces where you live (EU PVGIS data).",
    ph_3: "We compare your costs today with a heat pump, solar panels and a battery.",
    load_1: "Finding your price area …",
    load_2: "Fetching this week's prices …",
    load_3: "Checking the sunlight …",
    load_4: "Writing your summary …",
    per_year: "per year",
    savings_label: "estimated savings per year",
    no_savings_label: "more per year on today's numbers",
    today: "Today",
    with_bundle: "With bundle",
    co2: "less CO₂ per year",
    solar_size: "solar",
    solar_prod: "solar power per year",
    price_area: "Price area",
    spot_week: "Spot price, last 7 days",
    solar_yield: "Solar yield per kWp here",
    breakdown: "How we calculated this",
    b_heat: "Heat demand (space + hot water)",
    b_household: "Household electricity",
    b_elprice: "Electricity price incl. grid, tax, VAT",
    b_heating_today: "Heating today",
    b_household_today: "Household electricity today",
    b_hp: "Electricity for new heat pump",
    b_grid: "Electricity bought with bundle",
    b_bill: "Electricity bill with bundle",
    b_export: "Income from exported solar",
    b_sub: "Monthly fee × 12",
    caveat: "Indicative estimate, not a quote. Based on standard values and public data.",
    footer: "Concept project built as part of a job application. Not affiliated with or endorsed by Elvy. Data: elprisetjustnu.se (Nord Pool), EU JRC PVGIS, OpenStreetMap.",
    err_generic: "Something went wrong. Please try again in a moment.",
    err_fields: "Please check the highlighted fields.",
    nav_how: "How it works",
    guide_title: "Reviewing this project? Start here",
    guide_intro: "Pick an example household. The form fills itself in and the estimate runs straight away.",
    guide_hide: "Hide the guide",
    guide_show: "Show the reviewer guide",
    ex_hot: "Karin, Stockholm",
    ex_hot_sub: "Direct electric, wants to start soon → hot lead",
    ex_curious: "Johan, Gothenburg",
    ex_curious_sub: "District heating, just curious → nurture",
    ex_renter: "Leila, Malmö",
    ex_renter_sub: "Rents the house → not eligible",
    guide_1: "Read the result the way the homeowner sees it.",
    guide_2: "Scroll to \"Behind the scenes\": every step of the CRM flow is shown there.",
    guide_3: "Run the same example again: the contact and deal are updated instead of duplicated.",
    guide_more: "Read the full walkthrough: How it works →",
  },
};

let lang = localStorageGet("lang") || "sv";

// Example households for reviewers. Same data as scripts/test-flow.ts.
const EXAMPLES = {
  hot: {
    home: { postcode: "164 40", houseSizeM2: 150, buildPeriod: "1960_1979", heatingType: "direct_electric", residents: 4, roofFacing: "south", planningEv: true, ownsHome: true, timeline: "within_3_months", notes: "Our winter bills were awful last year. Roof was replaced in 2019." },
    contact: { firstName: "Karin", lastName: "Lindqvist", email: "karin@example.com", phone: "070-123 45 67" },
  },
  curious: {
    home: { postcode: "413 19", houseSizeM2: 110, buildPeriod: "2000_plus", heatingType: "district_heating", residents: 2, roofFacing: "east_west", planningEv: false, ownsHome: true, timeline: "just_curious", notes: "" },
    contact: { firstName: "Johan", lastName: "Berg", email: "johan@example.com", phone: "" },
  },
  renter: {
    home: { postcode: "211 45", houseSizeM2: 90, buildPeriod: "pre1960", heatingType: "oil", residents: 3, roofFacing: "unsure", planningEv: false, ownsHome: false, timeline: "within_year", notes: "" },
    contact: { firstName: "Leila", lastName: "Haddad", email: "leila@example.com", phone: "" },
  },
};
let lastExample = null; // example behind the shown result
let pendingExample = null; // example about to be submitted
let lastResult = null;

const $ = (s, el = document) => el.querySelector(s);
const form = $("#form");
const resultEl = $("#result");

function localStorageGet(k) {
  try { return localStorage.getItem(k); } catch { return null; }
}
function localStorageSet(k, v) {
  try { localStorage.setItem(k, v); } catch {}
}

function t(key) {
  return T[lang][key] ?? key;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  if (lastResult) renderResult(lastResult);
}

document.querySelectorAll(".lang button").forEach((b) =>
  b.addEventListener("click", () => {
    lang = b.dataset.lang;
    localStorageSet("lang", lang);
    applyLang();
  }),
);

const kr = (n) => `${Math.round(n).toLocaleString("sv-SE")} kr`;
const num = (n) => Math.round(n).toLocaleString("sv-SE");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function fillExample(key) {
  const ex = EXAMPLES[key];
  if (!ex) return;
  const els = form.elements;
  for (const [k, v] of Object.entries({ ...ex.home, ...ex.contact })) {
    const el = els[k];
    if (!el) continue;
    if (el instanceof RadioNodeList) {
      for (const r of el) r.checked = r.value === String(v);
    } else if (el.type === "checkbox") {
      el.checked = Boolean(v);
    } else {
      el.value = v;
    }
  }
  els.consent.checked = true;
  pendingExample = key;
  form.requestSubmit();
}

document.querySelectorAll("[data-example]").forEach((b) =>
  b.addEventListener("click", () => {
    fillExample(b.dataset.example);
    if (window.innerWidth >= 960) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }),
);

const guide = $("#guide");
const guideShow = $("#guideShow");
function setGuide(visible) {
  guide.hidden = !visible;
  guideShow.hidden = visible;
  localStorageSet("guideHidden", visible ? "" : "1");
}
$("#guideClose").addEventListener("click", () => setGuide(false));
guideShow.addEventListener("click", () => setGuide(true));
if (localStorageGet("guideHidden") === "1") setGuide(false);

function readForm() {
  const f = new FormData(form);
  const v = (k) => (f.get(k) ?? "").toString().trim();
  return {
    language: lang,
    home: {
      postcode: v("postcode"),
      houseSizeM2: Number(v("houseSizeM2")),
      buildPeriod: v("buildPeriod"),
      heatingType: v("heatingType"),
      residents: Number(v("residents")),
      annualKwh: v("annualKwh") ? Number(v("annualKwh")) : undefined,
      roofFacing: v("roofFacing"),
      planningEv: f.get("planningEv") === "on",
      ownsHome: v("ownsHome") === "true",
      timeline: v("timeline"),
      notes: v("notes") || undefined,
    },
    contact: {
      firstName: v("firstName"),
      lastName: v("lastName"),
      email: v("email"),
      phone: v("phone"),
      consent: f.get("consent") === "on",
    },
  };
}

function showLoading() {
  const keys = ["load_1", "load_2", "load_3", "load_4"];
  resultEl.innerHTML = `<div class="placeholder card loading"><ol class="ph-steps">${keys
    .map((k) => `<li>${esc(t(k))}</li>`)
    .join("")}</ol></div>`;
  const items = resultEl.querySelectorAll("li");
  let i = 0;
  items[0].classList.add("active");
  return setInterval(() => {
    if (i >= items.length - 1) return;
    items[i].classList.replace("active", "done");
    items[++i].classList.add("active");
  }, 900);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const exampleKey = pendingExample;
  pendingExample = null;
  const errEl = $("#formError");
  errEl.hidden = true;
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));

  if (!form.checkValidity()) {
    form.querySelectorAll(":invalid").forEach((el) => el.setAttribute("aria-invalid", "true"));
    errEl.textContent = t("err_fields");
    errEl.hidden = false;
    form.querySelector(":invalid")?.focus();
    return;
  }

  const btn = $("#submit");
  btn.disabled = true;
  const timer = showLoading();
  if (window.innerWidth < 960) resultEl.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const res = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readForm()),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.fields) {
        Object.values(data.fields).length && markServerErrors(data.details);
        errEl.textContent = t("err_fields");
      } else {
        errEl.textContent = data.error || t("err_generic");
      }
      errEl.hidden = false;
      resultEl.innerHTML = "";
      return;
    }
    lastResult = data;
    lastExample = exampleKey;
    renderResult(data);
  } catch {
    errEl.textContent = t("err_generic");
    errEl.hidden = false;
    resultEl.innerHTML = "";
  } finally {
    clearInterval(timer);
    btn.disabled = false;
  }
});

function markServerErrors(issues = []) {
  for (const issue of issues) {
    const name = issue.path[issue.path.length - 1];
    form.querySelector(`[name="${name}"]`)?.setAttribute("aria-invalid", "true");
  }
}

function renderResult({ estimate: e, homeowner: h, behindTheScenes: b }) {
  const saves = e.annualSavingsSek >= 0;
  const max = Math.max(e.today.totalCostSek, e.withBundle.totalCostSek);
  const pct = (v) => `${Math.max(4, (v / max) * 100).toFixed(1)}%`;
  const paragraphs = h.summary.split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");

  resultEl.innerHTML = `
    <article class="card">
      <p class="headline">${esc(h.headline)}</p>
      <p class="big ${saves ? "" : "neg"}">${kr(Math.abs(e.annualSavingsSek))}</p>
      <p class="sub">${esc(saves ? t("savings_label") : t("no_savings_label"))}${saves ? ` · ${e.savingsPercent}%` : ""}</p>

      <div class="bars">
        <div class="bar-row"><span>${esc(t("today"))}</span><div class="bar"><i style="width:${pct(e.today.totalCostSek)}"></i></div><span class="bar-val">${kr(e.today.totalCostSek)}</span></div>
        <div class="bar-row"><span>${esc(t("with_bundle"))}</span><div class="bar after"><i style="width:${pct(e.withBundle.totalCostSek)}"></i></div><span class="bar-val">${kr(e.withBundle.totalCostSek)}</span></div>
      </div>

      <div class="stats">
        <div class="stat co2"><b>${num(e.co2ReductionKg)} kg</b><span>${esc(t("co2"))}</span></div>
        <div class="stat"><b>${e.withBundle.solarKwp} kWp</b><span>${esc(t("solar_size"))}</span></div>
        <div class="stat"><b>${num(e.withBundle.solarProductionKwh)} kWh</b><span>${esc(t("solar_prod"))}</span></div>
      </div>

      <div class="chips">
        <span class="chip">${esc(t("price_area"))}: ${esc(e.inputs.priceArea)} · ${esc(e.inputs.place)}</span>
        <span class="chip">${esc(t("spot_week"))}: ${Math.round(e.live.spotLast7DaysSekPerKwh * 100)} öre/kWh</span>
        <span class="chip">${esc(t("solar_yield"))}: ${num(e.live.solarKwhPerKwp)} kWh</span>
      </div>
    </article>

    <article class="card summary">
      ${paragraphs}
      <p class="next">${esc(h.nextStep)}</p>
      <details class="breakdown">
        <summary>${esc(t("breakdown"))}</summary>
        <table>
          <tr><td>${esc(t("b_heat"))}</td><td>${num(e.inputs.heatDemandKwh)} kWh</td></tr>
          <tr><td>${esc(t("b_household"))}</td><td>${num(e.inputs.householdKwh)} kWh</td></tr>
          <tr><td>${esc(t("b_elprice"))}</td><td>${e.inputs.fullElectricityPriceSekPerKwh.toFixed(2).replace(".", ",")} kr/kWh</td></tr>
          <tr><td>${esc(t("b_heating_today"))}</td><td>${kr(e.today.heatingCostSek)}</td></tr>
          <tr><td>${esc(t("b_household_today"))}</td><td>${kr(e.today.householdElectricityCostSek)}</td></tr>
          <tr><td>${esc(t("b_hp"))}</td><td>${num(e.withBundle.heatPumpKwh)} kWh</td></tr>
          <tr><td>${esc(t("b_grid"))}</td><td>${num(e.withBundle.gridPurchaseKwh)} kWh</td></tr>
          <tr><td>${esc(t("b_bill"))}</td><td>${kr(e.withBundle.energyBillSek)}</td></tr>
          <tr><td>${esc(t("b_export"))}</td><td>−${kr(e.withBundle.exportIncomeSek)}</td></tr>
          <tr><td>${esc(t("b_sub"))}</td><td>${kr(e.withBundle.subscriptionSek)}</td></tr>
        </table>
      </details>
      <p class="caveat">${esc(t("caveat"))}</p>
    </article>

    ${renderBehindTheScenes(b)}
  `;
}

// The CRM view is always in English: it shows what the sales team sees.
function renderBehindTheScenes(b) {
  const icon = { done: "✓", skipped: "–", error: "!" };
  const s = b.salesBrief;
  const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  return `
    <article class="card bts" lang="en">
      <h2>Behind the scenes</h2>
      <p class="sub">What just happened in the CRM. A salesperson sees this; the homeowner wouldn't.</p>
      ${lastExample && b.crm.steps.some((st) => st.action === "Look up contact by email" && st.detail.startsWith("No match"))
        ? `<p class="tryagain">Try this: <button type="button" data-rerun>run the same example again</button>. The CRM will recognise the email and update this contact and deal instead of creating duplicates.</p>`
        : ""}
      <div class="badges">
        <span class="badge">CRM: ${b.crm.mode === "hubspot" ? "HubSpot (live)" : "Demo (in-memory)"}</span>
        <span class="badge">Text: ${b.generatedBy === "claude" ? "Claude" : "Template (no API key)"}</span>
        ${b.crm.owner ? `<span class="badge">Owner: ${esc(b.crm.owner.name)}</span>` : ""}
      </div>
      <ol class="steps">
        ${b.crm.steps
          .map(
            (st) => `<li class="${st.status}"><span class="ic">${icon[st.status]}</span><span><b>${esc(st.action)}</b>: ${esc(st.detail)}${
              st.url ? ` · <a href="${esc(st.url)}" target="_blank" rel="noopener">open in HubSpot</a>` : ""
            }</span></li>`,
          )
          .join("")}
      </ol>

      <div class="score"><b>${b.lead.score}</b><span class="tier ${b.lead.tier}">${b.lead.tier.replace("_", " ")}</span></div>
      <ul class="reasons">${b.lead.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>

      <div class="brief">
        <h3>Sales brief</h3>
        <p>${esc(s.oneLiner)}</p>
        <p><strong>Why they might buy</strong></p>${list(s.motivations)}
        <p><strong>Likely objections</strong></p>${list(s.likelyObjections.map((o) => `${o.objection}: ${o.suggestedResponse}`))}
        <p><strong>Opening line:</strong> ${esc(s.openingLine)}</p>
        <p><strong>Next best action:</strong> ${esc(s.nextBestAction)}</p>
        ${s.dataQualityFlags.length ? `<p><strong>Check on the call</strong></p>${list(s.dataQualityFlags)}` : ""}
      </div>
    </article>`;
}

applyLang();

resultEl.addEventListener("click", (e) => {
  if (e.target.closest("[data-rerun]") && lastExample) fillExample(lastExample);
});

// Deep links for reviewers: /?example=hot runs that household on load.
const exampleParam = new URLSearchParams(location.search).get("example");
if (exampleParam && EXAMPLES[exampleParam]) fillExample(exampleParam);
