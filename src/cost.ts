import { Resource } from "./resource"

export interface Cost {
  resource: Resource,
  amount: number
}

export function Cost_getCostDisplayString(costs: Cost[]) {
  let costDisplayText = "";
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    costDisplayText += `${cost.resource.name.charAt(0).toUpperCase() + cost.resource.name.slice(1).toLowerCase()} (${cost.amount})`
    if (i < costs.length - 1) {
      costDisplayText += ", ";
    }
  }

  return costDisplayText
}