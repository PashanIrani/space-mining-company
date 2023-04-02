import { randomIntFromInterval } from "./helpers";

export function UI_displayValue(name: string, valueType: string, value: number, decimals: number = 0, charLength: number = -1) {
  if (value !== 0 && !value)
    return;

  const element = document.getElementById(`${name}-${valueType}`);

  // Round the value to the specified number of decimal places
  let roundedValue = value.toFixed(decimals);

  // Split the rounded value into its integer and fractional parts
  if (charLength > 0) {
    let [intPart, fracPart] = roundedValue.split(".");

    if (intPart.length < charLength) {
      intPart = "0".repeat(charLength - intPart.length) + intPart;
    }

    if (fracPart == undefined) {
      roundedValue = intPart;
    } else {
      roundedValue = intPart + "." + fracPart
    }
  }

  if (element && value != null)
    element.innerHTML = roundedValue;
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