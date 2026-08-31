const form = document.querySelector("#calculator-form");
const titleInput = document.querySelector("#daily-title");
const input = document.querySelector("#daily-income");
const modeInputs = document.querySelectorAll('input[name="calc-mode"]');
const clearButton = document.querySelector("#clear-button");
const copyButton = document.querySelector("#copy-button");
const toast = document.querySelector("#toast");
const modeTitle = document.querySelector("#mode-title");
const modeDescription = document.querySelector("#mode-description");
const expensesCard = document.querySelector("#expenses-card");
const expensesLabel = document.querySelector("#expenses-label");
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
  travelSavings: document.querySelector("#result-travel-savings"),
  partner: document.querySelector("#result-partner"),
  pocket: document.querySelector("#result-pocket"),
  personalSavings: document.querySelector("#result-personal-savings"),
};

let latestBreakdown = null;
let toastTimer = null;

const modes = {
  split60: {
    label: "60/40",
    description: "Se separa 60% para reposicion y se reparte el 40% restante.",
    expensesLabel: "Reposicion",
    expensesNote: "60% del ingreso total",
    netNote: "40% restante",
    expensesRate: 0.6,
    netRate: 0.4,
    shareNetLabel: "40%",
    shareExpenseLabel: "60%",
    baseName: "Fondo Neto",
  },
  split70: {
    label: "70/30",
    description: "Se separa 30% para gastos y se reparte el 70% restante.",
    expensesLabel: "Gastos de Consultorio",
    expensesNote: "30% del ingreso total",
    netNote: "70% restante",
    expensesRate: 0.3,
    netRate: 0.7,
    shareNetLabel: "70%",
    shareExpenseLabel: "30%",
    baseName: "Fondo Neto",
  },
  full: {
    label: "100%",
    description: "No se separan gastos y el reparto usa el total ingresado.",
    expensesLabel: "Gastos de Consultorio",
    expensesNote: "Sin separar gastos",
    netNote: "100% del ingreso total",
    expensesRate: 0,
    netRate: 1,
    shareNetLabel: "100%",
    shareExpenseLabel: "0%",
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

function formatWhatsappMoney(value) {
  const hasDecimals = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  })
    .format(value)
    .replace(/\s/g, " ");
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
  const selectedInput = Array.from(modeInputs).find((inputNode) => inputNode.checked);
  return selectedInput ? selectedInput.value : "split70";
}

function calculateBreakdown(total, mode = getCurrentMode()) {
  const modeConfig = modes[mode];
  const expenses = total * modeConfig.expensesRate;
  const net = total * modeConfig.netRate;
  const fima = net * 0.5;
  const generalSavings = net * 0.2;
  const travelSavings = net * 0.1;
  const partner = net * 0.2;
  const pocket = partner * 0.7;
  const personalSavings = partner * 0.3;

  return {
    mode,
    total,
    expenses,
    net,
    fima,
    generalSavings,
    travelSavings,
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
  const usesFullBase = getCurrentMode() === "full";
  modeTitle.textContent = mode.label;
  modeDescription.textContent = mode.description;
  expensesCard.classList.toggle("is-hidden", usesFullBase);
  expensesLabel.textContent = mode.expensesLabel;
  netLabel.textContent = mode.baseName;
  expensesNote.textContent = mode.expensesNote;
  netNote.textContent = mode.netNote;

  baseNotes.forEach((note) => {
    note.textContent = note.textContent.replace(/Fondo Neto|Ingreso Total/g, mode.baseName);
  });
}

function buildClipboardText(breakdown) {
  const mode = modes[breakdown.mode];
  const usesFullBase = breakdown.mode === "full";
  const baseLabel = usesFullBase ? "Base a Repartir" : "Fondo Neto a Repartir";
  const shareExpenseLabel = breakdown.mode === "split60" ? "Reposicion" : "Gastos Consultorio";
  const customTitle = titleInput.value.trim();
  const lines = [
    "💰 Cierre Diario",
    "",
    `Ingreso Total: ${formatWhatsappMoney(breakdown.total)}`,
    `${baseLabel} (${mode.shareNetLabel}): ${formatWhatsappMoney(breakdown.net)}`,
    "",
    "Distribución:",
    `🔹 Fima (50%): ${formatWhatsappMoney(breakdown.fima)}`,
    `🔹 Ahorro Gral (20%): ${formatWhatsappMoney(breakdown.generalSavings)}`,
    `🔹 Ahorro Viajes (10%): ${formatWhatsappMoney(breakdown.travelSavings)}`,
    `🔹 Saldo Personal (20%): ${formatWhatsappMoney(breakdown.partner)}`,
    "",
    "Detalle Personal:",
    `💸 Bolsillo (70%): ${formatWhatsappMoney(breakdown.pocket)}`,
    `🏦 Ahorro Personal (30%): ${formatWhatsappMoney(breakdown.personalSavings)}`,
  ];

  if (customTitle) {
    lines.splice(1, 0, `*${customTitle}*`);
  }

  if (!usesFullBase) {
    lines.splice(
      customTitle ? 4 : 3,
      0,
      `${shareExpenseLabel} (${mode.shareExpenseLabel}): ${formatWhatsappMoney(breakdown.expenses)}`
    );
  }

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

async function shareText(text) {
  if (!navigator.share) {
    await copyText(text);
    showToast("Resumen copiado para compartir");
    return;
  }

  try {
    await navigator.share({
      title: "Cierre Diario",
      text,
    });
  } catch (error) {
    if (error.name !== "AbortError") {
      await copyText(text);
      showToast("No se pudo compartir. Resumen copiado.");
    }
  }
}

function resetCalculator() {
  latestBreakdown = null;
  titleInput.value = "";
  input.value = "";
  renderResults(calculateBreakdown(0, getCurrentMode()));
  copyButton.disabled = true;
  titleInput.focus();
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

modeInputs.forEach((modeInput) => {
  modeInput.addEventListener("change", () => {
    renderMode();

    if (!latestBreakdown) {
      renderResults(calculateBreakdown(0));
      return;
    }

    latestBreakdown = calculateBreakdown(latestBreakdown.total);
    renderResults(latestBreakdown);
  });
});

clearButton.addEventListener("click", resetCalculator);

copyButton.addEventListener("click", async () => {
  if (!latestBreakdown) {
    return;
  }

  const text = buildClipboardText(latestBreakdown);

  try {
    await shareText(text);
  } catch {
    showToast("No se pudo compartir ni copiar el resumen.");
  }
});

renderMode();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
