import { randomIntFromInterval } from "./helpers";

export function UI_displayValue(name: string, valueType: string, value: number, decimals: number = 3) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && value != null)
    element.innerHTML = value.toFixed(3).toString();
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
    console.log(element.style);

    element.style.display = 'none';
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