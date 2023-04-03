import { UI_displayValue, UI_displayText, UI_updateProgressBar } from "./ui";
import { Cost, Cost_getCostDisplayString } from "./cost";
import { formatNumberString } from "./helpers";


export interface ResourceDefination {
  name: string; // name is used for linking things together
  amount: number; // the actual value of this resource at the current instance
  generateAmount: number; // The amount of resource is genereated when this resource is generated
  capacity?: number; // The max capacity of this resource
  costs: Cost[]; // the cost for generating this resource
  timeToBuildMs: number; // This is how long it would take to build this resource
  afterNewGeneration?: Function; // Function that runs after a new generation is complete
  afterDeduction?: Function; // Function that runs after this resource is deducted for a transaction
  holdToGenerateEnabled?: boolean;
}

export interface GroupResouceDefination {
  name: string,
  groupResources: Resource[]
}
// checks if all the costs are met
export function Resource_canAffordGeneration(costs: Cost[]): boolean {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];

    if (cost.resource.amount < cost.amount) {
      return false;
    }
  }

  return true;
}

// TODO: add locks to everything using these resource to fully perform transaction
export function Resource_performCostTransaction(costs: Cost[]): boolean {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];

    if (cost.resource.amount < cost.amount) {
      return false;
    }

    cost.resource.performDeduction(cost.amount);
  }

  return true;
}

export class Resource {
  readonly name: string;
  private _amount: number;
  private _generateAmount: number;
  private _capacity: number;
  private _costs: Cost[];
  private _timeToBuildMs: number;
  private _buildStatus: number; // range from 0 to 1 indicating percentage
  private _afterNewGeneration: Function;
  private _afterDeduction: Function;
  private _ratePerSec: number;
  private _holdToGenerateEnabled: boolean;

  private buildQueueCount: number = 0; // count the number of resources that need to be buildt

  constructor(defination: ResourceDefination) {
    this.name = defination.name;

    // not using private here to allow setter to run on init
    this.amount = defination.amount;
    this.generateAmount = defination.generateAmount;
    this.capacity = defination.capacity;
    this.costs = defination.costs;
    this.timeToBuildMs = defination.timeToBuildMs;
    this._holdToGenerateEnabled = defination.holdToGenerateEnabled || false;

    this._afterNewGeneration = defination.afterNewGeneration ? defination.afterNewGeneration : () => { };
    this._afterDeduction = defination.afterDeduction ? defination.afterDeduction : () => { };

    this.assignEventListeners();
    this.initRateCalculation();
  }

  private initRateCalculation() {
    let prevValue = this.amount;
    setInterval(() => {
      let rate = this.calculateRate(prevValue, this.amount);

      let timeLeftText = null;
      if (rate < 0) {
        timeLeftText = `${(this.amount / (rate * -1)).toFixed(2)}s left`;
      }

      if (rate > 0 && this.capacity) {
        timeLeftText = `${((this.capacity - this.amount) / rate).toFixed(2)}s to full`;
      }


      UI_displayText(this.name, 'rate', `${rate > 0 ? '+' : ''}${rate}/s ${timeLeftText != null ? `(${timeLeftText})` : ''}`);
      prevValue = this.amount;
    }, 1000);
  }


  private calculateRate(prevValue: number, currentValue: number) {
    return currentValue - prevValue;
  }

  private assignEventListeners() {
    const generateButton = document.getElementById(`${this.name}-generate-button`);

    if (generateButton) {
      generateButton.addEventListener('click', this.generate.bind(this))

      let intervalId: NodeJS.Timeout;

      if (this._holdToGenerateEnabled) {
        generateButton.addEventListener('mousedown', () => {
          intervalId = setInterval(() => {
            generateButton.click();
          }, 250);
        });

        generateButton.addEventListener('mouseup', () => {
          clearInterval(intervalId);
        });

        generateButton.addEventListener('mouseleave', () => {
          clearInterval(intervalId);
        });
      }
    }
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    const prevAmount = this._amount;

    if (value > this.capacity) {
      this._amount = this.capacity;
    } else {
      this._amount = value;
    }

    UI_displayValue(this.name, 'amount', this.amount);

    // Update progress bar based on ticks to give smooth animation
    const transitionTimeMs = 100;
    const timePerTransitionTick = 10;
    const totalTicks = transitionTimeMs / timePerTransitionTick;
    const amountPerTick = (this._amount - prevAmount) / totalTicks;

    let tickCount = 0;
    let progressBarUpdateInterval = setInterval(() => {

      UI_updateProgressBar(this.name, prevAmount + (amountPerTick * tickCount), this.capacity);

      if (++tickCount == totalTicks) {
        UI_updateProgressBar(this.name, this.amount, this.capacity);
        clearInterval(progressBarUpdateInterval);
      }
    }, timePerTransitionTick);

  }

  get capacity(): number {
    return this._capacity;
  }

  set capacity(value: number) {
    this._capacity = value;
    UI_displayValue(this.name, 'capacity', this.capacity);
    UI_updateProgressBar(this.name, this.amount, this.capacity);
  }

  get costs(): Cost[] {
    return this._costs;
  }

  set costs(value: Cost[]) {
    this._costs = value;
    UI_displayText(this.name, 'costs', Cost_getCostDisplayString(this.costs));
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

    let queueString = '';
    if (this.buildQueueCount > 1) {
      queueString = ` +${this.buildQueueCount - 1}`
    }
    if (this.buildStatus == 0) {
      UI_displayText(this.name, 'buildStatus', '');
    } else {
      UI_displayText(this.name, 'buildStatus', `[${formatNumberString(Math.round(this.buildStatus * 100), 0, -1)}%${queueString}]`);
    }
  }

  // Generates the resource, returns true or false based on if it was a success.
  public generate(): boolean {
    if (!Resource_canAffordGeneration(this.costs)) return false;

    Resource_performCostTransaction(this.costs);

    this.buildQueueCount++;

    if (this.buildQueueCount > 1)
      return;

    this.initiateBuild();



    return true;
  }

  private initiateBuild() {
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
        this.buildQueueCount--;
        this.checkIfToInitateAnotherBuild();
      }, this.timeToBuildMs);

    } else {
      this.build();
      this.buildQueueCount--;
      this.checkIfToInitateAnotherBuild();
    }
  }

  private checkIfToInitateAnotherBuild() {
    if (this.buildQueueCount > 0) {
      this.initiateBuild();
    }
  }

  //! Only run after it is fully okay to build after checks with canAffordGeneration() and ONLY after Resource_performCostTransaction()
  private build() {
    this.amount += this.generateAmount;
    this._afterNewGeneration();
  }

  performDeduction(amountToDeduct: number) {
    this.amount -= amountToDeduct;
    this._afterDeduction();
  }
}

export class GroupResource extends Resource {
  private _groupResources: Resource[]; // range from 0 to 1 indicating percentage
  private _lastAccessedResource: number = 0;

  constructor(defination: GroupResouceDefination) {
    // send some dummy data that won't really be used through a GroupResource
    super({
      name: defination.name,
      amount: 0,
      generateAmount: 1,
      costs: [],
      timeToBuildMs: 0,
    });

    this._groupResources = defination.groupResources;
    setInterval(this.calculateTotalAmount.bind(this), 100);
  }

  private calculateTotalAmount() {
    let sum = 0;

    for (let i = 0; i < this._groupResources.length; i++) {
      sum += this._groupResources[i].amount;
    }

    this.amount = sum;
  }

  get groupResources(): Resource[] {
    return this._groupResources;
  }

  set groupResources(value: Resource[]) {
    this._groupResources = value;
  }

  get lastAccessedResource(): number {
    return this._lastAccessedResource;
  }

  set lastAccessedResource(value: number) {
    this._lastAccessedResource = value;
  }

  performDeduction(amountToDeduct: number) {
    // Get index of which resource to deduct from next
    let firstResouceToCheck = this.lastAccessedResource + 1 <= this.groupResources.length - 1
      ? this.lastAccessedResource + 1
      : 0;

    let run = true;
    let i = firstResouceToCheck;
    while (run) {

      if (i >= this.groupResources.length) {
        i = 0;
      }

      const resourceOf = this.groupResources[i];

      if (resourceOf.amount >= amountToDeduct) {
        this.lastAccessedResource = i;
        resourceOf.performDeduction(amountToDeduct);
        run = false;
      }
      i++;
    }


  }
}