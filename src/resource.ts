import { UI_displayValue, UI_displayText } from "./ui";
import { Cost } from "./cost";

export interface ResourceDefination {
  name: string; // name is used for linking things together
  amount: number; // the actual value of this resource at the current instance
  generateAmount: number; // The amount of resource is genereated when this resource is generated
  capacity: number; // The max capacity of this resource
  costs: Cost[]; // the cost for generating this resource
  timeToBuildMs: number; // This is how long it would take to build this resource
}
export class Resource {
  readonly name: string;
  private _amount: number;
  private _generateAmount: number;
  private _capacity: number;
  private _costs: Cost[];
  private _timeToBuildMs: number;
  private _buildStatus: number; // range from 0 to 1 indicating percentage

  constructor(defination: ResourceDefination) {
    this.name = defination.name;

    // not using private here to allow setter to run on init
    this.amount = defination.amount;
    this.generateAmount = defination.generateAmount;
    this.capacity = defination.capacity;
    this.costs = defination.costs;
    this.timeToBuildMs = defination.timeToBuildMs;

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

    UI_displayValue(this.name, 'amount', this.amount);
  }

  get capacity(): number {
    return this._capacity;
  }

  set capacity(value: number) {
    this._capacity = value;
    UI_displayValue(this.name, 'capacity', this.capacity);
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

  get timeToBuildMs(): number {
    return this._timeToBuildMs;
  }

  set timeToBuildMs(value: number) {
    this._timeToBuildMs = value;
  }

  get buildStatus(): number {
    return this._buildStatus;
  }

  set buildStatus(value: number) {
    this._buildStatus = value;
    if (this.buildStatus == 0) {
      UI_displayText(this.name, 'buildStatus', '');
    } else {
      UI_displayText(this.name, 'buildStatus', `${Math.round(this.buildStatus * 100)}%`);
    }
  }

  // Generates the resource, returns true or false based on if it was a success.
  generate(): boolean {
    if (this.canAffordGeneration()) {
      this.performCostTransaction();
      if (this.timeToBuildMs > 0) {
        const timePerPercent = this.timeToBuildMs / 100; // the frequency of build percentage update

        this.buildStatus = 0;
        const percentTickInterval = setInterval(() => {
          this.buildStatus += 0.01;
        }, timePerPercent);

        setTimeout(() => {
          this.build();
          clearInterval(percentTickInterval);
          this.buildStatus = 0;
        }, this.timeToBuildMs);

      } else {
        this.build();
      }

      return true;
    }

    return false;
  }

  build() {
    this.amount += this.generateAmount;
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