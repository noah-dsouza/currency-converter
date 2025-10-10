import { currencyToFlagCode } from "./currency-to-flag.js";

const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY;
const API_URL = import.meta.env.VITE_CURRENCY_API_URL;

const inputAmount = document.getElementById("inputSourceCurrency");
const inputSourceSelect = document.getElementById("inputSourceSelect");
const inputTargetSelect = document.getElementById("inputTargetSelect");
const imageSource = document.getElementById("imageSourceCurrency");
const imageTarget = document.getElementById("imageTargetCurrency");
const swapButton = document.getElementById("swapButton");
const resultBox = document.getElementById("resultBox");
const datalist = document.getElementById("currencyList");

// Build datalist
Object.keys(currencyToFlagCode).forEach((code) => {
  const opt = document.createElement("option");
  opt.value = code;
  datalist.appendChild(opt);
});

// Default values (USD → CAD)
inputSourceSelect.value = "USD";
inputTargetSelect.value = "CAD";
updateFlag(imageSource, inputSourceSelect.value);
updateFlag(imageTarget, inputTargetSelect.value);
convertCurrency();

// Helpers
function updateFlag(imgEl, currencyCode) {
  const flagCode = currencyToFlagCode[currencyCode.toUpperCase()];
  if (!flagCode) {
    imgEl.src = "https://flagsapi.com/US/flat/64.png"; // fallback just in case
    return;
  }
  imgEl.src = `https://flagsapi.com/${flagCode.toUpperCase()}/flat/64.png`;
}

async function fetchExchangeRate(base, target) {
  try {
    const res = await fetch(`${API_URL}?base_currency=${base}&currencies=${target}`, {
      headers: { apikey: API_KEY },
    });
    const data = await res.json();
    return data.data[target].value;
  } catch {
    return null;
  }
}

async function convertCurrency() {
  const amount = parseFloat(inputAmount.value) || 0;
  const base = inputSourceSelect.value.toUpperCase();
  const target = inputTargetSelect.value.toUpperCase();

  if (!currencyToFlagCode[base] || !currencyToFlagCode[target]) {
    resultBox.textContent = "Invalid currency";
    return;
  }

  const rate = await fetchExchangeRate(base, target);
  if (!rate) {
    resultBox.textContent = "API Error – check .env key";
    return;
  }

  const converted = (amount * rate).toFixed(2);
  resultBox.textContent = `${amount} ${base} = ${converted} ${target}`;
}

// Live updates
[inputAmount, inputSourceSelect, inputTargetSelect].forEach((el) => {
  el.addEventListener("input", () => {
    updateFlag(imageSource, inputSourceSelect.value);
    updateFlag(imageTarget, inputTargetSelect.value);
    convertCurrency();
  });
});

// Swap button
swapButton.addEventListener("click", () => {
  const temp = inputSourceSelect.value;
  inputSourceSelect.value = inputTargetSelect.value;
  inputTargetSelect.value = temp;
  updateFlag(imageSource, inputSourceSelect.value);
  updateFlag(imageTarget, inputTargetSelect.value);
  convertCurrency();
});
