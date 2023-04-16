import { Cost_getCostDisplayString } from "./cost";
import { formatNumberString, randomIntFromInterval } from "./helpers";
import { Resource_canAffordGeneration } from "./resource";
import { Store, StoreDefination } from "./store";
import { Time } from "./time";

export function UI_displayValue(name: string, valueType: string, value: number, decimals: number = 0, charLength: number = -1) {
  if (value !== 0 && !value)
    return;

  const elements = document.querySelectorAll(`.${name}-${valueType}`);

  elements.forEach(element => {
    element.innerHTML = formatNumberString(value, decimals, charLength);
  });
}

export function UI_displayText(name: string, valueType: string, text: string) {
  const elements = document.querySelectorAll(`.${name}-${valueType}`);

  elements.forEach(element => {
    element.innerHTML = text;
  });
}

export function UI_updateProgressBar(name: string, amount: number = 0, capacity: number = 1) {
  const elements = document.querySelectorAll(`.${name}-progress-bar`);

  elements.forEach(element => {
    element.innerHTML = `<progress max="${capacity}" value="${amount}"></progress>`;
  });
}
// Shows HTML element with id of `name`-window
export function UI_showWindow(name: string) {
  const element = document.getElementById(`${name}-window`);

  if (element) {
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    element.style.position = 'static';
  }

}
// Hides HTML element with id of `name`-window
export function UI_hideWindow(name: string) {
  const element = document.getElementById(`${name}-window`);

  if (element) {
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    element.style.position = 'absolute';
  }
}

export function UI_drawStore(storeItems: StoreDefination) {
  const container = document.getElementById("store-content-container");

  if (!container) return;

  container.innerHTML = '';

  for (const key in storeItems) {
    if (storeItems[key].purchased) continue;
    if (storeItems[key].dependsOn && !storeItems[storeItems[key].dependsOn]?.purchased) continue; // if dependsOn has not been purchased, skip

    let cantAfford = !Resource_canAffordGeneration(storeItems[key].costs);

    const itemContainer = document.createElement('div');
    itemContainer.classList.add('store-item-container');
    if (cantAfford)
      itemContainer.classList.add('disabled');



    const itemInfoContainer = document.createElement('div');
    itemInfoContainer.classList.add('store-item-info');

    const nameElement = document.createElement('p');
    nameElement.innerHTML = `<b>${storeItems[key].displayName}</b>`;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = storeItems[key].displayDescription;

    const costElement = document.createElement('p');
    costElement.innerHTML = `Cost: ${Cost_getCostDisplayString(storeItems[key].costs)}`;

    itemInfoContainer.appendChild(nameElement);
    itemInfoContainer.appendChild(descriptionElement);
    itemInfoContainer.appendChild(costElement);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('store-item-button-container');

    const buttonElement = document.createElement('button');
    buttonElement.id = `${key}-generate-button`;
    buttonElement.textContent = 'Buy';
    buttonElement.disabled = cantAfford;

    buttonElement.addEventListener('click', () => Store.buyItem(key));

    buttonContainer.appendChild(buttonElement);

    itemContainer.appendChild(itemInfoContainer);
    itemContainer.appendChild(buttonContainer);

    container.appendChild(itemContainer);
  }
}


export function UI_log(text: string) {
  let logScreenContainer = document.getElementById("log-screen-container");
  document.getElementById("log-screen").innerHTML += `<br>${Time.getCurrentTimestamp()}${text}`;

  logScreenContainer.scrollTop = logScreenContainer.scrollHeight;
}

export function UI_shakeScreen(times = 5) {
  for (let i = 0; i < 600; i++) {
    doGlitchEffect(times);
  }
}

function doGlitchEffect(count: number) {

  if (count <= 0) return;
  const elements = document.querySelectorAll('*:not(body):not(html)');
  const randomIndex = Math.floor(Math.random() * elements.length);
  const element = elements[randomIndex];

  const randomTime = randomIntFromInterval(10, 50)
  element.classList.add('glitch-fx');
  setTimeout(() => {
    element.classList.remove('glitch-fx');
  }, randomTime);

  const randomInterval = randomIntFromInterval(10, 150)

  setTimeout(() => {
    doGlitchEffect(count - 1)
  }, randomInterval);
}