import { Resource, Resource_canAffordGeneration } from "./resource"

export interface Cost {
  resource: Resource,
  amount: number
}

export function Cost_getCostDisplayString(costs: Cost[]) {
  let costDisplayText = "";
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    costDisplayText += `<span ${!Resource_canAffordGeneration([cost]) ? 'class="cost-cant-afford"' : ''}>${cost.resource.name.charAt(0).toUpperCase() + cost.resource.name.slice(1).toLowerCase()} (${cost.amount})</span>`
    if (i < costs.length - 1) {
      costDisplayText += ", ";
    }
  }

  return costDisplayText
}