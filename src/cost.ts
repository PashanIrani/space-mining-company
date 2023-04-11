import { AllResourceDefination, Resource, Resource_canAffordGeneration } from "./resource"
import { ALL_RESOURCES } from ".";
export interface Cost {
  resource: string,
  amount: number
}

export function Cost_getCostDisplayString(costs: Cost[]) {
  if (costs.length == 0) {
    return "FREE"
  }

  let costDisplayText = "";

  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    costDisplayText += `<span ${!Resource_canAffordGeneration([cost]) ? 'class="cost-cant-afford"' : ''}>${ALL_RESOURCES[cost.resource].label.charAt(0).toUpperCase() + ALL_RESOURCES[cost.resource].label.slice(1).toLowerCase()} (${cost.amount})</span>`
    if (i < costs.length - 1) {
      costDisplayText += ", ";
    }
  }

  return costDisplayText;
}