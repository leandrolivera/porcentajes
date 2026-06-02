const form = document.querySelector("#calculator-form");
const input = document.querySelector("#daily-income");
const fullBaseToggle = document.querySelector("#full-base-toggle");
const clearButton = document.querySelector("#clear-button");
const copyButton = document.querySelector("#copy-button");
const toast = document.querySelector("#toast");
const modeTitle = document.querySelector("#mode-title");
const modeDescription = document.querySelector("#mode-description");
const netLabel = document.querySelector("#net-label");
const expensesNote = document.querySelector("#expenses-note");
const netNote = document.querySelector("#net-note");
const baseNotes = document.querySelectorAll(".base-note");

const resultNodes = {
  total: document.querySelector("#result-total"),
  expenses: document.querySelector("#result-expenses"),
  net: document.querySelector("#result-net"),
  fima: document.querySelector("#result-fima"),
  generalSavings: document.querySelector("#result-general-savings"),
  partner: document.querySelector("#result-partner"),
  pocket: document.querySelector("#result-pocket"),
  personalSavings: document.querySelector("#result-personal-savings"),
};

let latestBreakdown = null;
let toastTimer = null;

const modes = {
  split: {
    label: "30/70",
    description: "Se separa 30% para gastos y se reparte el 70% restante.",
    expensesNote: "30% del ingreso total",
    netNote: "70% restante",
    baseName: "Fondo Neto",
  },
  full: {
    label: "100%",
    description: "No se separan gastos y el reparto usa el total ingresado.",
    expensesNote: "Sin separar gastos",
    netNote: "100% del ingreso total",
    baseName: "Ingreso Total",
  },
};

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value) {
  return currency.format(value).replace(/\s/g, " ");
}

function parseAmount(value) {
  const raw = value.trim().replace(/\s/g, "");
  let normalized = raw;

  if (raw.includes(",")) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else if ((raw.match(/\./g) || []).length > 1 || /^\d{1,3}(\.\d{3})+$/.test(raw)) {
    normalized = raw.replace(/\./g, "");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return Number.NaN;
  }

  return Number(normalized);
}

function getCurrentMode() {
  return fullBaseToggle.checked ? "full" : "split";
}

function calculateBreakdown(total, mode = getCurrentMode()) {
  const usesFullBase = mode === "full";
  const expenses = usesFullBase ? 0 : total * 0.3;
  const net = usesFullBase ? total : total * 0.7;
  const fima = net * 0.5;
  const generalSavings = net * 0.2;
  const partner = net * 0.3;
  const pocket = partner * 0.8;
  const personalSavings = partner * 0.2;

  return {
    mode,
    total,
    expenses,
    net,
    fima,
    generalSavings,
    partner,
    pocket,
    personalSavings,
  };
}

function renderResults(breakdown) {
  Object.entries(breakdown).forEach(([key, value]) => {
    if (!resultNodes[key]) {
      return;
    }

    resultNodes[key].textContent = formatMoney(value);
  });
}

function renderMode() {
  const mode = modes[getCurrentMode()];
  modeTitle.textContent = mode.label;
  modeDescription.textContent = mode.description;
  netLabel.textContent = mode.baseName;
  expensesNote.textContent = mode.expensesNote;
  netNote.textContent = mode.netNote;

  baseNotes.forEach((note) => {
    note.textContent = note.textContent.replace(/Fondo Neto|Ingreso Total/g, mode.baseName);
  });
}

function buildClipboardText(breakdown) {
  const mode = modes[breakdown.mode];
  const lines = [
    "Cierre de caja diario",
    `Modo: ${mode.label}`,
    `Ingresos Totales: ${formatMoney(breakdown.total)}`,
    "",
    `Gastos de Consultorio (${mode.expensesNote}): ${formatMoney(breakdown.expenses)}`,
    `${mode.baseName} (${mode.netNote}): ${formatMoney(breakdown.net)}`,
    "",
    `Fima (50% del ${mode.baseName}): ${formatMoney(breakdown.fima)}`,
    `Ahorro General (20% del ${mode.baseName}): ${formatMoney(breakdown.generalSavings)}`,
    `Socio Principal Bruto (30% del ${mode.baseName}): ${formatMoney(breakdown.partner)}`,
    "",
    `Bolsillo Personal (80% del Socio): ${formatMoney(breakdown.pocket)}`,
    `Ahorro Personal (20% del Socio): ${formatMoney(breakdown.personalSavings)}`,
  ];

  return lines.join("\n");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

function resetCalculator() {
  latestBreakdown = null;
  input.value = "";
  renderResults(calculateBreakdown(0, getCurrentMode()));
  copyButton.disabled = true;
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const total = parseAmount(input.value);

  if (!Number.isFinite(total) || total < 0) {
    showToast("Ingresá un monto válido");
    input.focus();
    return;
  }

  latestBreakdown = calculateBreakdown(total);
  renderResults(latestBreakdown);
  copyButton.disabled = false;
});

fullBaseToggle.addEventListener("change", () => {
  renderMode();

  if (!latestBreakdown) {
    renderResults(calculateBreakdown(0));
    return;
  }

  latestBreakdown = calculateBreakdown(latestBreakdown.total);
  renderResults(latestBreakdown);
});

clearButton.addEventListener("click", resetCalculator);

copyButton.addEventListener("click", async () => {
  if (!latestBreakdown) {
    return;
  }

  const text = buildClipboardText(latestBreakdown);

  try {
    await copyText(text);
    showToast("Resultados copiados");
  } catch {
    showToast("No se pudo copiar. Probá abrir la app con servidor local.");
  }
});

renderMode();
