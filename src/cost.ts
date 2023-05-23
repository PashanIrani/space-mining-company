import { AllResourceDefination, Resource, Resource_canAffordGeneration } from "./resource"
import { ALL_RESOURCES } from ".";
import { formatNumberToString } from "./helpers";
export interface Cost {
  resource: string,
  amount: number
}

export function Cost_getCostDisplayString(costs: Cost[]) {
  if (!ALL_RESOURCES) return;

  if (costs.length == 0) {
    return "FREE"
  }

  let costDisplayText = "";

  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    console.log(ALL_RESOURCES[cost.resource].unitSymbol);

    costDisplayText += `<span ${!Resource_canAffordGeneration([cost]) ? 'class="cost-cant-afford"' : ''}>${ALL_RESOURCES[cost.resource].label.charAt(0).toUpperCase() + ALL_RESOURCES[cost.resource].label.slice(1).toLowerCase()} (${formatNumberToString(ALL_RESOURCES[cost.resource].amount, 2)}${ALL_RESOURCES[cost.resource].unitSymbol || ''}/${formatNumberToString(cost.amount, 2)}${ALL_RESOURCES[cost.resource].unitSymbol || ''})</span>`
    if (i < costs.length - 1) {
      costDisplayText += ", ";
    }
  }

  return costDisplayText;
}