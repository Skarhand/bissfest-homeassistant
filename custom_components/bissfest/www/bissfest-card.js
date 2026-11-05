// Bissfest-Dashboard-Karten: Wasser, Kaffee, Tee – je vier Varianten.
// Wird von der Integration automatisch geladen, eine Ressource ist nicht nötig.
// Entitäten werden über platform + translation_key gefunden, damit Umbenennen und
// die Sprache der Installation keine Rolle spielen.

const DOC_URL = "https://github.com/Skarhand/bissfest-homeassistant#dashboard-karten";

const TEXT = {
  de: {
    water: "Wasser", coffee: "Kaffee", tea: "Tee",
    of: "von", glasses: "Gläsern", glass_hint: "1 Glas = {ml} ml",
    cup: "Tasse", cups: "Tassen", mug: "Pott", mugs: "Pötte",
    caffeine: "Koffein", nothing: "Heute noch nichts",
    undo: "Letzten Eintrag zurücknehmen", minus: "{ml} ml abziehen",
    missing_water: "Keine Bissfest-Wassersensoren gefunden.",
    missing_coffee: "Kaffee ist in Bissfest nicht eingeschaltet.",
    missing_tea: "Tee ist in Bissfest nicht eingeschaltet.",
    failed: "Bissfest: Eintrag fehlgeschlagen ({error})",
    variant: "Variante", device: "Bissfest-Konto (nur bei mehreren nötig)", name: "Titel (optional)",
    glass_ml: "Größe eines Glases", caffeine_limit: "Koffein-Richtwert pro Tag",
    v_glass: "Glas", v_ring: "Ring", v_grid: "Gläser-Raster", v_compact: "Kompakt",
    v_row: "Tassenreihe", v_counter: "Zähler", v_mug: "Großer Becher", v_caffeine_ring: "Koffein-Ring",
    card_water: "Bissfest Wasser", card_coffee: "Bissfest Kaffee", card_tea: "Bissfest Tee",
    card_desc: "Tagesstand anzeigen und direkt eintragen.",
  },
  en: {
    water: "Water", coffee: "Coffee", tea: "Tea",
    of: "of", glasses: "glasses", glass_hint: "1 glass = {ml} ml",
    cup: "cup", cups: "cups", mug: "mug", mugs: "mugs",
    caffeine: "caffeine", nothing: "Nothing yet today",
    undo: "Undo last entry", minus: "Subtract {ml} ml",
    missing_water: "No Bissfest water sensors found.",
    missing_coffee: "Coffee is not enabled in Bissfest.",
    missing_tea: "Tea is not enabled in Bissfest.",
    failed: "Bissfest: entry failed ({error})",
    variant: "Variant", device: "Bissfest account (only needed with several)", name: "Title (optional)",
    glass_ml: "Glass size", caffeine_limit: "Daily caffeine guideline",
    v_glass: "Glass", v_ring: "Ring", v_grid: "Glass grid", v_compact: "Compact",
    v_row: "Cup row", v_counter: "Counter", v_mug: "Big mug", v_caffeine_ring: "Caffeine ring",
    card_water: "Bissfest water", card_coffee: "Bissfest coffee", card_tea: "Bissfest tea",
    card_desc: "Show today's total and log directly.",
  },
};

const text = (hass, key, vars = {}) => {
  const lang = (hass?.language || navigator.language || "de").startsWith("de") ? "de" : "en";
  return TEXT[lang][key].replace(/\{(\w+)\}/g, (_, k) => vars[k]);
};

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const GLASS_PATH = "M4 4 L10 98 Q10 100 12 100 L46 100 Q48 100 48 98 L54 4 Z";
const MUG_BODY = "M4 10 H60 V68 Q60 80 48 80 H16 Q4 80 4 68 Z";
const MUG_HANDLE = "M60 26 H68 Q76 26 76 36 V44 Q76 54 66 54 H60";
const MUG_FULL_ML = 1000; // Tee hat kein Tagesziel – der Becher ist ab 1 l voll
const MAX_ICONS = 12;
const MAX_GLASSES = 20;

const STYLE = `
  :host { display: block; height: 100%; }
  ha-card { height: 100%; box-sizing: border-box; padding: 14px; display: flex; flex-direction: column;
    justify-content: center; gap: 10px; color: var(--primary-text-color); }
  .title { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--secondary-text-color); }
  .title ha-icon { color: var(--c); --mdc-icon-size: 20px; }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .big { font-size: 26px; font-weight: 500; line-height: 1.2; }
  .value { font-size: 15px; font-weight: 500; white-space: nowrap; }
  .sub { font-size: 13px; color: var(--secondary-text-color); }
  .side { display: flex; align-items: center; gap: 14px; }
  .side > div { flex: 1; min-width: 0; }
  .center { display: flex; justify-content: center; }
  .row { display: flex; gap: 6px; }
  [data-more] { cursor: pointer; }
  button { flex: 1; min-width: 0; min-height: 38px; padding: 6px 4px; border: 0; border-radius: 10px;
    font: inherit; font-size: 13px; color: var(--primary-text-color); cursor: pointer; white-space: nowrap;
    background: color-mix(in srgb, var(--c) 16%, transparent); }
  button:hover { background: color-mix(in srgb, var(--c) 26%, transparent); }
  button:focus-visible { outline: 2px solid var(--c); outline-offset: 1px; }
  button:disabled { opacity: .5; cursor: default; }
  button.icon { flex: 0 0 40px; --mdc-icon-size: 18px; }
  .head button.icon { flex: 0 0 36px; min-height: 32px; }
  button.tile { padding: 8px; line-height: 1.3; background: color-mix(in srgb, var(--c) 12%, transparent); }
  button.tile .big { display: block; }
  button.tile .sub { display: block; }
  .bar { height: 8px; border-radius: 4px; overflow: hidden; background: var(--divider-color); }
  .bar span { display: block; height: 100%; background: var(--c); }
  .cells { display: flex; gap: 4px; }
  .cell { flex: 1; height: 26px; border-radius: 4px; overflow: hidden; display: flex; align-items: flex-end;
    background: var(--divider-color); }
  .cell span { display: block; width: 100%; background: var(--c); }
  .icons { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 6px; min-height: 32px; color: var(--c); }
  .icons .small { --mdc-icon-size: 22px; }
  .icons .large { --mdc-icon-size: 32px; }
  .ring { position: relative; width: 112px; height: 112px; }
  .ring div { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
    justify-content: center; }
  .ring b { font-size: 20px; font-weight: 500; }
  .msg { font-size: 14px; color: var(--secondary-text-color); text-align: center; padding: 12px 0; }
`;

class BissfestCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this._busy = false;
  }

  static getConfigElement() {
    const editor = document.createElement("bissfest-card-editor");
    editor.cardClass = this;
    return editor;
  }

  static getStubConfig() {
    return { variant: this.variants[0] };
  }

  setConfig(config) {
    const cls = this.constructor;
    if (config.variant && !cls.variants.includes(config.variant)) {
      throw new Error(`Unbekannte Variante: ${config.variant} (${cls.variants.join(", ")})`);
    }
    this._config = { variant: cls.variants[0], ...cls.defaults, ...config };
    this._lookup = null;
    this._signature = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const ids = this._ids();
    const signature = JSON.stringify(
      [hass.language, ...Object.values(ids).map((id) => {
        const s = hass.states[id];
        return [s?.state, s?.attributes.goal_ml];
      })]
    );
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  getCardSize() {
    return this._config?.variant === "compact" ? 2 : 3;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 4, rows: "auto" };
  }

  // Entitäten des gewählten Kontos: translation_key → entity_id
  _ids() {
    const entities = this._hass?.entities;
    if (!entities) return {};
    if (this._lookup?.source === entities) return this._lookup.ids;
    const keys = this.constructor.sensorKeys;
    const ids = {};
    let device = this._config?.device;
    for (const entry of Object.values(entities)) {
      if (entry.platform !== "bissfest" || !keys.includes(entry.translation_key)) continue;
      device = device || entry.device_id;
      if (entry.device_id === device) ids[entry.translation_key] = entry.entity_id;
    }
    this._lookup = { source: entities, ids, device };
    return ids;
  }

  _num(key) {
    const value = parseFloat(this._hass.states[this._ids()[key]]?.state);
    return Number.isNaN(value) ? null : value;
  }

  _fmt(value, digits = 0) {
    if (value === null || value === undefined) return "–";
    return new Intl.NumberFormat(this._hass?.language || undefined, { maximumFractionDigits: digits }).format(value);
  }

  _t(key, vars) {
    return text(this._hass, key, vars);
  }

  _title(icon, fallback) {
    return `<div class="title"><ha-icon icon="${icon}"></ha-icon>${esc(this._config.name || fallback)}</div>`;
  }

  _ring(share, color, big, small, more) {
    const length = 2 * Math.PI * 48;
    const filled = Math.min(Math.max(share, 0), 1) * length;
    return `<div class="center"><div class="ring" data-more="${more}">
      <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r="48" fill="none" stroke="var(--divider-color)" stroke-width="10"/>
        <circle cx="56" cy="56" r="48" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
          stroke-dasharray="${filled.toFixed(1)} ${length.toFixed(1)}" transform="rotate(-90 56 56)"/>
      </svg>
      <div><b>${big}</b><span class="sub">${small}</span></div>
    </div></div>`;
  }

  _render() {
    if (!this._config) return;
    const body = this._hass ? this._body() : "";
    this.shadowRoot.innerHTML =
      `<style>${STYLE}</style><ha-card style="--c: ${this.constructor.color}">${body}</ha-card>`;
    if (this._busy) this.shadowRoot.querySelectorAll("button").forEach((b) => (b.disabled = true));
  }

  _onClick(ev) {
    const button = ev.target.closest("button[data-service]");
    if (button) {
      this._call(button.dataset.service, JSON.parse(button.dataset.payload));
      return;
    }
    const more = ev.target.closest("[data-more]");
    if (more?.dataset.more) {
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        detail: { entityId: more.dataset.more }, bubbles: true, composed: true,
      }));
    }
  }

  async _call(service, data) {
    if (this._busy) return;
    this._ids();
    const entryId = this._hass.devices?.[this._lookup?.device]?.config_entries?.[0];
    this._busy = true;
    this._render();
    try {
      await this._hass.callService("bissfest", service, entryId ? { ...data, config_entry_id: entryId } : data);
    } catch (err) {
      this.dispatchEvent(new CustomEvent("hass-notification", {
        detail: { message: this._t("failed", { error: err?.message || err }) }, bubbles: true, composed: true,
      }));
    }
    this._busy = false;
    this._render();
  }

  _button(label, service, payload, extra = "") {
    return `<button ${extra} data-service="${service}" data-payload="${esc(JSON.stringify(payload))}">${label}</button>`;
  }
}

class BissfestWaterCard extends BissfestCard {
  static variants = ["glass", "ring", "grid", "compact"];
  static defaults = { glass_ml: 200 };
  static sensorKeys = ["water", "water_percent"];
  static color = "#378add";

  _buttons() {
    const add = (ml) => this._button(`+${ml} ml`, "add_water", { ml });
    const minus = this._t("minus", { ml: 200 });
    return `<div class="row">${add(200)}${add(500)}${this._button(
      '<ha-icon icon="mdi:minus"></ha-icon>', "add_water", { ml: -200 },
      `class="icon" aria-label="${esc(minus)}" title="${esc(minus)}"`
    )}</div>`;
  }

  _body() {
    const ids = this._ids();
    if (!ids.water) return `<div class="msg">${this._t("missing_water")}</div>`;
    const ml = this._num("water");
    const goal = this._hass.states[ids.water]?.attributes.goal_ml;
    const share = goal ? (ml || 0) / goal : 0;
    const percent = this._num("water_percent") ?? Math.round(share * 100);
    const name = this._config.name ? this._title("mdi:cup-water", "") : "";
    const amount = `${this._fmt(ml)} ml`;
    const goalText = `${this._t("of")} ${this._fmt(goal)} ml`;
    const buttons = this._buttons();

    switch (this._config.variant) {
      case "ring":
        return name + this._ring(share, "var(--c)", `${this._fmt(percent)} %`, amount, ids.water) + buttons;
      case "grid": {
        const size = Math.max(Number(this._config.glass_ml) || 200, 1);
        const glasses = Math.min(Math.ceil((goal || 2000) / size), MAX_GLASSES);
        const filled = (ml || 0) / size;
        const cells = Array.from({ length: glasses }, (_, i) => {
          const level = Math.min(Math.max(filled - i, 0), 1) * 100;
          return `<div class="cell"><span style="height: ${level}%"></span></div>`;
        }).join("");
        return `${this._title("mdi:cup-water", this._t("water"))}
          <div data-more="${ids.water}"><span class="big">${this._fmt(filled, 1)}</span>
          <span class="sub">${this._t("of")} ${glasses} ${this._t("glasses")}</span></div>
          <div class="cells">${cells}</div>
          <div class="sub">${this._t("glass_hint", { ml: this._fmt(size) })}</div>${buttons}`;
      }
      case "compact":
        return `<div class="head">${this._title("mdi:cup-water", this._t("water"))}
          <span class="value" data-more="${ids.water}">${this._fmt(ml)} / ${this._fmt(goal)} ml</span></div>
          <div class="bar"><span style="width: ${Math.min(share, 1) * 100}%"></span></div>${buttons}`;
      default: {
        const top = 100 - Math.min(share, 1) * 96;
        return `${name}<div class="side" data-more="${ids.water}">
          <svg width="58" height="104" viewBox="0 0 58 104" aria-hidden="true">
            <clipPath id="glass"><path d="${GLASS_PATH}"/></clipPath>
            <rect x="0" y="${top.toFixed(1)}" width="58" height="104" fill="var(--c)" clip-path="url(#glass)"/>
            <path d="${GLASS_PATH}" fill="none" stroke="var(--secondary-text-color)" stroke-width="1.5"/>
          </svg>
          <div><div class="big">${amount}</div><div class="sub">${goalText} · ${this._fmt(percent)} %</div></div>
        </div>${buttons}`;
      }
    }
  }
}

class BissfestDrinkCard extends BissfestCard {
  _service(size) {
    return ["add_drink", { kind: this.constructor.kind, size }];
  }

  _undo() {
    const label = esc(this._t("undo"));
    return this._button('<ha-icon icon="mdi:undo"></ha-icon>', "undo_drink", { kind: this.constructor.kind },
      `class="icon" aria-label="${label}" title="${label}"`);
  }

  _add(size, label, extra) {
    return this._button(label, ...this._service(size), extra);
  }

  _word(count, one, many) {
    return this._t(count === 1 ? one : many);
  }

  _buttons(undo = true) {
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    return `<div class="row">${this._add("cup", cap(this._t("cup")))}${this._add("mug", cap(this._t("mug")))}${
      undo ? this._undo() : ""}</div>`;
  }

  _summary(cups, mugs, ml, mg) {
    return `${this._fmt(cups)} ${this._word(cups, "cup", "cups")} · ${this._fmt(mugs)} ${this._word(mugs, "mug", "mugs")}
      · ${this._fmt(ml)} ml · ${this._fmt(mg)} mg ${this._t("caffeine")}`;
  }

  _icons(cups, mugs, icon) {
    const total = (cups || 0) + (mugs || 0);
    if (!total) return `<div class="icons"><span class="sub">${this._t("nothing")}</span></div>`;
    const shownCups = Math.min(cups || 0, MAX_ICONS);
    const shownMugs = Math.min(mugs || 0, MAX_ICONS - shownCups);
    const rest = total - shownCups - shownMugs;
    return `<div class="icons">${
      `<ha-icon class="small" icon="${icon}"></ha-icon>`.repeat(shownCups)}${
      `<ha-icon class="large" icon="${icon}"></ha-icon>`.repeat(shownMugs)}${
      rest > 0 ? `<span class="sub">+${rest}</span>` : ""}</div>`;
  }

  _counter(cups, mugs, ml, mg, icon, label) {
    const tile = (size, count, one, many) => this._add(size,
      `<span class="big">${this._fmt(count)}</span><span class="sub">${this._word(count, one, many)} +</span>`,
      'class="tile"');
    return `<div class="head">${this._title(icon, label)}${this._undo()}</div>
      <div class="row">${tile("cup", cups, "cup", "cups")}${tile("mug", mugs, "mug", "mugs")}</div>
      <div class="sub">${this._fmt(ml)} ml · ${this._fmt(mg)} mg ${this._t("caffeine")}</div>`;
  }

  _compact(ml, mg, icon, label, more) {
    return `<div class="head">${this._title(icon, label)}
      <span class="value" data-more="${more}">${this._fmt(ml)} ml · ${this._fmt(mg)} mg</span></div>${this._buttons()}`;
  }

  _body() {
    const { kind, icon } = this.constructor;
    const ids = this._ids();
    if (!ids[`${kind}_ml`]) return `<div class="msg">${this._t(`missing_${kind}`)}</div>`;
    const cups = this._num(`${kind}_cups`);
    const mugs = this._num(`${kind}_mugs`);
    const ml = this._num(`${kind}_ml`);
    const mg = this._num(`${kind}_caffeine`);
    const label = this._t(kind);
    const name = this._config.name ? this._title(icon, "") : "";
    const more = ids[`${kind}_ml`];

    switch (this._config.variant) {
      case "counter":
        return this._counter(cups, mugs, ml, mg, icon, label);
      case "compact":
        return this._compact(ml, mg, icon, label, more);
      case "ring":
      case "mug":
        return name + this._special(ml, mg, ids);
      default:
        return `${name}<div data-more="${more}">${this._icons(cups, mugs, icon)}</div>
          <div class="sub">${this._summary(cups, mugs, ml, mg)}</div>${this._buttons()}`;
    }
  }
}

class BissfestCoffeeCard extends BissfestDrinkCard {
  static kind = "coffee";
  static icon = "mdi:coffee";
  static color = "#ba7517";
  static variants = ["row", "ring", "counter", "compact"];
  static defaults = { caffeine_limit: 400 };
  static sensorKeys = ["coffee_cups", "coffee_mugs", "coffee_ml", "coffee_caffeine"];

  _special(ml, mg, ids) {
    const limit = Math.max(Number(this._config.caffeine_limit) || 400, 1);
    const color = (mg || 0) > limit ? "var(--error-color, #db4437)" : "var(--c)";
    return this._ring((mg || 0) / limit, color, `${this._fmt(mg)} mg`,
      `${this._t("of")} ${this._fmt(limit)} mg`, ids.coffee_caffeine) + this._buttons();
  }
}

class BissfestTeaCard extends BissfestDrinkCard {
  static kind = "tea";
  static icon = "mdi:tea";
  static color = "#1d9e75";
  static variants = ["row", "mug", "counter", "compact"];
  static defaults = {};
  static sensorKeys = ["tea_cups", "tea_mugs", "tea_ml", "tea_caffeine"];

  _special(ml, mg, ids) {
    const top = 79 - Math.min((ml || 0) / MUG_FULL_ML, 1) * 69;
    return `<div class="side" data-more="${ids.tea_ml}">
      <svg width="80" height="84" viewBox="0 0 80 84" aria-hidden="true">
        <clipPath id="mug"><path d="${MUG_BODY}"/></clipPath>
        <rect x="0" y="${top.toFixed(1)}" width="64" height="84" fill="var(--c)" clip-path="url(#mug)"/>
        <path d="${MUG_BODY}" fill="none" stroke="var(--secondary-text-color)" stroke-width="2"/>
        <path d="${MUG_HANDLE}" fill="none" stroke="var(--secondary-text-color)" stroke-width="2"/>
      </svg>
      <div><div class="big">${this._fmt(ml)} ml</div><div class="sub">${this._fmt(mg)} mg ${this._t("caffeine")}</div></div>
    </div>${this._buttons()}`;
  }
}

class BissfestCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  connectedCallback() {
    this._load();
  }

  // ha-form wird von HA erst bei Bedarf geladen – über den Editor einer Standardkarte nachholen
  async _load() {
    if (!customElements.get("ha-form") && window.loadCardHelpers) {
      try {
        const helpers = await window.loadCardHelpers();
        const card = await helpers.createCardElement({ type: "tile", entity: "sun.sun" });
        await card.constructor.getConfigElement();
      } catch (err) {
        console.warn("Bissfest: Editor konnte ha-form nicht laden", err);
      }
    }
    this._update();
  }

  _schema() {
    const cls = this.cardClass;
    const label = (v) => text(this._hass, v === "ring" && cls === BissfestCoffeeCard ? "v_caffeine_ring" : `v_${v}`);
    const schema = [
      { name: "variant", required: true, selector: { select: { mode: "dropdown",
        options: cls.variants.map((value) => ({ value, label: label(value) })) } } },
      { name: "name", selector: { text: {} } },
      { name: "device", selector: { device: { filter: { integration: "bissfest" } } } },
    ];
    const variant = this._config?.variant;
    if (cls === BissfestWaterCard && variant === "grid") {
      schema.push({ name: "glass_ml", selector: { number: { min: 50, max: 1000, step: 50, mode: "box", unit_of_measurement: "ml" } } });
    }
    if (cls === BissfestCoffeeCard && variant === "ring") {
      schema.push({ name: "caffeine_limit", selector: { number: { min: 50, max: 1000, step: 10, mode: "box", unit_of_measurement: "mg" } } });
    }
    return schema;
  }

  _update() {
    if (!this._hass || !this._config || !this.cardClass || !customElements.get("ha-form")) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (field) => text(this._hass, field.name);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: ev.detail.value }, bubbles: true, composed: true,
        }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = { ...this.cardClass.defaults, variant: this.cardClass.variants[0], ...this._config };
    this._form.schema = this._schema();
  }
}

const define = (tag, cls) => {
  if (!customElements.get(tag)) customElements.define(tag, cls);
};
define("bissfest-card-editor", BissfestCardEditor);
define("bissfest-water-card", BissfestWaterCard);
define("bissfest-coffee-card", BissfestCoffeeCard);
define("bissfest-tea-card", BissfestTeaCard);

window.customCards = window.customCards || [];
for (const kind of ["water", "coffee", "tea"]) {
  const type = `bissfest-${kind}-card`;
  if (window.customCards.some((card) => card.type === type)) continue;
  window.customCards.push({
    type,
    name: text(null, `card_${kind}`),
    description: text(null, "card_desc"),
    preview: true,
    documentationURL: DOC_URL,
  });
}
