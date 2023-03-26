export function UI_displayValue(name: string, valueType: string, value: number) {
  document.getElementById(`${name}-${valueType}`).innerHTML = value.toString();
}