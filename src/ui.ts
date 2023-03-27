import { randomIntFromInterval } from "./helpers";

export function UI_displayValue(name: string, valueType: string, value: number) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && value != null)
    element.innerHTML = value.toFixed(3).toString();
}

export function UI_displayText(name: string, valueType: string, text: string) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && text != null)
    element.innerHTML = text;
}

export function applyRandomClass() {
  const elements = document.querySelectorAll('*:not(body):not(html)');
  const randomIndex = Math.floor(Math.random() * elements.length);
  const element = elements[randomIndex];

  // Apply the random class for a random time between 50ms and 10ms
  const randomTime = randomIntFromInterval(10, 50)
  element.classList.add('glitch-fx');
  setTimeout(() => {
    element.classList.remove('glitch-fx');
  }, randomTime);

  // Call this function again after a random time between 3 and 20 seconds
  const randomInterval = randomIntFromInterval(10, 15000)
  setTimeout(applyRandomClass, randomInterval);
}