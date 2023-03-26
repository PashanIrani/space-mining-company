export function UI_displayValue(name: string, valueType: string, value: number) {
  const element = document.getElementById(`${name}-${valueType}`);

  if (element && value != null)
    element.innerHTML = value.toString();
}