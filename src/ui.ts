import { Cost_getCostDisplayString } from "./cost";
import { formatNumberString, randomIntFromInterval } from "./helpers";
import { Resource_canAffordGeneration } from "./resource";
import { Store, StoreDefination } from "./store";

export function UI_displayValue(name: string, valueType: string, value: number, decimals: number = 0, charLength: number = -1) {
  if (value !== 0 && !value)
    return;

  const element = document.getElementById(`${name}-${valueType}`);



  if (element && value != null)
    element.innerHTML = formatNumberString(value, decimals, charLength);
}

export function UI_displayText(name: string, valueType: string, text: string) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && text != null)
    element.innerHTML = text;
}

export function UI_updateProgressBar(name: string, amount: number = 0, capacity: number = 1) {
  const element = document.getElementById(`${name}-progress-bar`);

  if (element) {
    element.innerHTML = `<progress max="${capacity}" value="${amount}"></progress>`
  }
}

export function UI_showWindow(name: string) {
  const element = document.getElementById(`${name}-window`);

  if (element) {
    element.style.display = 'block';
  }
}

export function UI_hideWindow(name: string) {
  const element = document.getElementById(`${name}-window`);

  if (element) {
    element.style.display = 'none';
  }
}

export function UI_drawStore(storeItems: StoreDefination) {
  const element = document.getElementById("store-content-container");

  if (!element) return;

  element.innerHTML = '';

  for (const key in storeItems) {
    if (storeItems[key].purchased) continue

    element.innerHTML += `<div class="store-item-container">
    <div class="store-item-info">
      <p><b>${storeItems[key].displayName}</b></p>
      <p>${storeItems[key].displayDescription}</p>
      <p>Cost: ${Cost_getCostDisplayString(storeItems[key].costs)}</p>
    </div>
    <div class="store-item-button-container">
      <button id="${key}-generate-button" ${!Resource_canAffordGeneration(storeItems[key].costs) ? 'disabled' : ''}>Buy</button>
    </div>
    </div>`;

    document.getElementById(`${key}-generate-button`).addEventListener('click', () => Store.buyItem(key))
  }
}

export function doGlitchEffect() {
  const elements = document.querySelectorAll('*:not(body):not(html)');
  const randomIndex = Math.floor(Math.random() * elements.length);
  const element = elements[randomIndex];

  const randomTime = randomIntFromInterval(10, 50)
  element.classList.add('glitch-fx');
  setTimeout(() => {
    element.classList.remove('glitch-fx');
  }, randomTime);

  const randomInterval = randomIntFromInterval(10, 15000)
  setTimeout(doGlitchEffect, randomInterval);
}