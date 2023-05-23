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

    let amountText = '';
    if (ALL_RESOURCES[cost.resource].unitSymbol.infront) {
      amountText = `${ALL_RESOURCES[cost.resource].unitSymbol.icon || ''}${formatNumberToString(ALL_RESOURCES[cost.resource].amount, 2)}`;
    } else {
      amountText = `${formatNumberToString(ALL_RESOURCES[cost.resource].amount, 2)}${ALL_RESOURCES[cost.resource].unitSymbol.icon || ''}`;
    }
    let neededText = '';
    if (ALL_RESOURCES[cost.resource].unitSymbol.infront) {
      neededText = `${ALL_RESOURCES[cost.resource].unitSymbol.icon || ''}${formatNumberToString(cost.amount, 2)}`;
    } else {
      neededText = `${formatNumberToString(cost.amount, 2)}${ALL_RESOURCES[cost.resource].unitSymbol.icon || ''}`;
    }

    costDisplayText += `<span ${!Resource_canAffordGeneration([cost]) ? 'class="cost-cant-afford"' : ''}>${ALL_RESOURCES[cost.resource].label.charAt(0).toUpperCase() + ALL_RESOURCES[cost.resource].label.slice(1).toLowerCase()} (${amountText}/${neededText})</span>`
    if (i < costs.length - 1) {
      costDisplayText += ", ";
    }
  }

  return costDisplayText;
}