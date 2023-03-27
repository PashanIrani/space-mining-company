export function UI_displayValue(name: string, valueType: string, value: number) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && value != null)
    element.innerHTML = value.toString();
}

export function UI_displayText(name: string, valueType: string, text: string) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && text != null)
    element.innerHTML = text;
}