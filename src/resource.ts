import { UI_displayValue } from "./ui";
import { Cost } from "./cost";

export interface ResourceDefination {
  name: string; // name is used for linking things together
  amount: number; // the actual value of this resource at the current instance
  generateAmount: number; // The amount of resource is genereated when this resource is generated
  capacity: number; // The max capacity of this resource
  costs: Cost[]; // the cost for generating this resource
}
export class Resource {
  readonly name: string;
  private _amount: number;
  private _generateAmount: number;
  private _capacity: number;
  private _costs: Cost[];

  constructor(defination: ResourceDefination) {
    this.name = defination.name;

    // not using private here to allow setter to run on init
    this.amount = defination.amount;
    this.generateAmount = defination.generateAmount;
    this.capacity = defination.capacity;
    this.costs = defination.costs;

    this._assignEventListeners();
  }

  private _assignEventListeners() {
    const generateButton = document.getElementById(`${this.name}-generate-button`);

    if (generateButton) {
      generateButton.addEventListener('click', this.generate.bind(this))
    }
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    this._amount = value;

    // check if gone over capacity
    if (this._capacity != null && this._amount > this._capacity) {
      this._amount = this.capacity;
    }

    UI_displayValue(this.name, 'amount', this._amount);
  }

  get capacity(): number {
    return this._capacity;
  }

  set capacity(value: number) {
    this._capacity = value;
    UI_displayValue(this.name, 'capacity', this._capacity);
  }

  get costs(): Cost[] {
    return this._costs;
  }

  set costs(value: Cost[]) {
    this._costs = value;
  }

  get generateAmount(): number {
    return this._generateAmount;
  }

  set generateAmount(value: number) {
    this._generateAmount = value;
  }

  // Generates the resource, returns true or false based on if it was a success.
  generate(): boolean {
    if (this.canAffordGeneration()) {
      this.performCostTransaction();
      this.amount += this.generateAmount;
      return true;
    }

    return false;
  }

  // checks if all the costs are met
  canAffordGeneration(): boolean {
    for (let i = 0; i < this.costs.length; i++) {
      const cost = this.costs[i];

      if (cost.resource.amount < cost.amount) {
        return false;
      }
    }

    return true;
  }

  // TODO: add locks to everything using these resource to fully perform transaction
  performCostTransaction(): boolean {
    for (let i = 0; i < this.costs.length; i++) {
      const cost = this.costs[i];

      if (cost.resource.amount < cost.amount) {
        return false;
      }

      cost.resource.amount -= cost.amount;
    }

    return true;
  }
}