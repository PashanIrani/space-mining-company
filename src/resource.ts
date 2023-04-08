import { UI_displayValue, UI_displayText, UI_updateProgressBar } from "./ui";
import { Cost, Cost_getCostDisplayString } from "./cost";
import { formatNumberString } from "./helpers";
import { Time } from "./time";
import { ALL_RESOURCES } from ".";

export interface ResourceDefination {
  name: string; // name is used for linking things together
  label: string // name shown on screen
  amount: number; // the actual value of this resource at the current instance
  generateAmount: number; // The amount of resource is genereated when this resource is generated
  capacity?: number; // The max capacity of this resource
  costs: Cost[]; // the cost for generating this resource
  timeToBuildMs: number; // This is how long it would take to build this resource
  afterNewGeneration?: (amount: number, amountDelta: number) => void; // Function that runs after a new generation is complete
  afterDeduction?: Function; // Function that runs after this resource is deducted for a transaction
  holdToGenerateAmount?: number;
  timeCost?: number; // amount of time incremented per generation
}

export type AllResourceDefination = { [key: string]: Resource };

export interface GroupResouceDefination {
  name: string,
  label: string // name shown on screen
  groupResources: { resource: Resource, multiplier: number }[]
}
// checks if all the costs are met
export function Resource_canAffordGeneration(costs: Cost[]): boolean {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];

    if (ALL_RESOURCES[cost.resource].amount < cost.amount) {
      return false;
    }
  }

  return true;
}

// TODO: add locks to everything using these resource to fully perform transaction
export function Resource_performCostTransaction(costs: Cost[]): boolean {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];

    if (ALL_RESOURCES[cost.resource].amount < cost.amount) {
      return false;
    }

    ALL_RESOURCES[cost.resource].performDeduction(cost.amount);
  }

  return true;
}

export class Resource {
  readonly name: string;
  readonly label: string;
  private _amount: number;
  private _generateAmount: number;
  private _capacity: number;
  private _costs: Cost[];
  private _timeToBuildMs: number;
  private _buildStatus: number = 0; // range from 0 to 1 indicating percentage of the current build
  private _afterNewGeneration: Function;
  private _afterDeduction: Function;
  private _ratePerSec: number;
  private _holdToGenerateAmount: number;

  private _timeCost: number;

  private _updatedFromSave: boolean = false; // set this to true after loading values from a save. To trigger in-progress builds to finish

  public buildQueue: number[] = []; // keeps track of builds being queued and how much amount to generate, incase generateAmount changes while still in queue
  private onAmountUpdateCallbacks: Function[] = []; // holds functions that need to be called when amount is updated.

  private holdIntervalId: NodeJS.Timeout; // points to interval created for mouse hold behaviour

  constructor(defination: ResourceDefination) {
    this._afterNewGeneration = defination.afterNewGeneration ? defination.afterNewGeneration : () => { };
    this._afterDeduction = defination.afterDeduction ? defination.afterDeduction : () => { };


    this.name = defination.name;
    this.label = defination.label;

    // not using private here to allow setter to run on init
    this.generateAmount = defination.generateAmount;
    this.capacity = defination.capacity;
    this._costs = defination.costs;
    this.amount = defination.amount;
    this.timeToBuildMs = defination.timeToBuildMs;
    this.holdToGenerateAmount = defination.holdToGenerateAmount || 0;
    this.timeCost = defination.timeCost || 0;

    this.assignEventListeners();
    this.initRateCalculation();

  }

  init() {
    this.costs = this._costs; // trigger change 

    // when a cost's amount is updated, update string for this resource by give each cost resource a callback
    for (let i = 0; i < this.costs.length; i++) {
      const cost = this.costs[i];
      ALL_RESOURCES[cost.resource].onAmountUpdate(() => {
        UI_displayText(this.name, 'costs', Cost_getCostDisplayString(this.costs));
      });
    }
  }
  onAmountUpdate(callbackFn: Function) {
    this.onAmountUpdateCallbacks.push(callbackFn);
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

  // If generate button is held down, this method will generate clicks _holdToGenerateAmount time per sec
  private mouseHoldStart() {
    if (this.holdToGenerateAmount === 0) return;

    const generateButton = document.getElementById(`${this.name}-generate-button`);

    if (generateButton) {
      this.holdIntervalId = setInterval(() => {
        generateButton.click();
      }, 1000 / this._holdToGenerateAmount);
    }
  }

  private mouseHoldEnd() {
    if (this.holdToGenerateAmount === 0) return;
    clearInterval(this.holdIntervalId);
  }

  private assignEventListeners() {
    const generateButton = document.getElementById(`${this.name}-generate-button`);

    if (generateButton) {
      generateButton.addEventListener('click', this.generate.bind(this));

      generateButton.addEventListener('mousedown', this.mouseHoldStart.bind(this));
      generateButton.addEventListener('mouseup', this.mouseHoldEnd.bind(this));
      generateButton.addEventListener('mouseleave', this.mouseHoldEnd.bind(this));
    }
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    let delta = value - this._amount;

    if (value > this.capacity) {
      this._amount = this.capacity;
    } else {
      this._amount = value;
    }

    // call on amoutn update callbacks
    this.onAmountUpdateCallbacks.forEach(fn => fn());

    UI_updateProgressBar(this.name, this.amount, this.capacity);
    UI_displayValue(this.name, 'amount', this.amount, 2);
  }

  get capacity(): number {
    return this._capacity;
  }

  set capacity(value: number) {
    this._capacity = value;
    UI_displayValue(this.name, 'capacity', this.capacity, 2);
    UI_updateProgressBar(this.name, this.amount, this.capacity);
  }

  get timeCost(): number {
    return this._timeCost;
  }

  set timeCost(value: number) {
    this._timeCost = value;
    UI_displayValue(this.name, 'time-cost', this.capacity, 2);
  }


  get costs(): Cost[] {
    return this._costs;
  }

  set costs(value: Cost[]) {
    this._costs = value;
    UI_displayText(this.name, 'costs', Cost_getCostDisplayString(this.costs));
  }

  get holdToGenerateAmount(): number {
    return this._holdToGenerateAmount;
  }

  set holdToGenerateAmount(value: number) {
    this._holdToGenerateAmount = value;

    // reset event listeners

    UI_displayText(this.name, 'hold-amount', value > 0 ? `Hold for +${value} clicks/sec` : '')
  }

  get generateAmount(): number {
    return this._generateAmount;
  }

  set generateAmount(value: number) {
    this._generateAmount = value;
    UI_displayValue(this.name, 'generate-amount', value)
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
    if (this.buildQueue.length > 1) {
      queueString = ` +${this.buildQueue.length - 1}`
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
    if (this.amount == this.capacity || this.getSumOfBuildQueue() == (this.capacity - this.amount)) return false; // check capacity is full

    Resource_performCostTransaction(this.costs);

    this.buildQueue.push(this.generateAmount);

    // if another build is already happening, wait unitl it's finished
    if (this.buildQueue.length > 1)
      return;

    this.initiateBuild();



    return true;
  }

  get updatedFromSave(): boolean {
    return this._updatedFromSave;
  }

  //! will only be called once, which will be set if resource's data was loaded from a save. This is to ensure any inprogress builds will continue again
  set updatedFromSave(value: boolean) {
    this._updatedFromSave = value;

    if (value) {
      if (this.buildStatus > 0) {
        this.initiateBuild();
      }
    }
  }

  private getSumOfBuildQueue() {
    let sum = 0;
    for (let i = 0; i < this.buildQueue.length; i++) {
      sum += this.buildQueue[i];

    }
    return sum
  }
  private initiateBuild() {
    if (this.timeToBuildMs > 0) {
      const timePerPercent = this.timeToBuildMs / 100; // the frequency of build percentage update
      // const timeBeforeBuild = this.timeObject.minute;

      const percentTickInterval = setInterval(() => {
        this.buildStatus += 0.01;
      }, timePerPercent);


      let timeCostTickInterval: NodeJS.Timer = null;
      // Increment minutes as it build
      if (this.timeCost > 1) {
        const timePerTimeCostMin = this.timeToBuildMs / this.timeCost;
        timeCostTickInterval = setInterval(() => {
          Time.minute += 1;
        }, timePerTimeCostMin);
      }

      setTimeout(() => {
        this.build(this.buildQueue.shift());
        clearInterval(percentTickInterval);

        // Clear timeCost update interval
        if (this.timeCost > 1) {
          clearInterval(timeCostTickInterval);
        } else if (this.timeCost == 1) { // if timecost was 1, then simply increment at the end, as there was no need to do it with ticks
          Time.minute += 1;
        }

        this.buildStatus = 0;
        this.checkIfToInitateAnotherBuild();
      }, this.timeToBuildMs * (1 - this.buildStatus));

    } else {
      this.build(this.buildQueue.shift());
      this.checkIfToInitateAnotherBuild();
    }
  }

  private checkIfToInitateAnotherBuild() {
    if (this.buildQueue.length > 0) {
      this.initiateBuild();
    }
  }

  //! Only run after it is fully okay to build after checks with canAffordGeneration() and ONLY after Resource_performCostTransaction()
  private build(amount: number = this.generateAmount) {
    this.amount += amount;
    this._afterNewGeneration(this.amount, amount);

    if (this.timeToBuildMs == 0)
      Time.minute += this.timeCost;
  }

  performDeduction(amountToDeduct: number) {
    this.amount -= amountToDeduct;
    this._afterDeduction();
  }
}

export class GroupResource extends Resource {
  private _groupResources: { resource: Resource, multiplier: number }[]; // range from 0 to 1 indicating percentage
  private _lastAccessedResource: number = 0;

  constructor(defination: GroupResouceDefination) {
    // send some dummy data that won't really be used through a GroupResource
    super({
      name: defination.name,
      label: defination.label,
      amount: 0,
      generateAmount: 1,
      costs: [],
      timeToBuildMs: 0,
    });

    this._groupResources = defination.groupResources;

    // Re-calculate when one of the amounts changes
    for (let i = 0; i < this._groupResources.length; i++) {
      this._groupResources[i].resource.onAmountUpdate(this.calculateTotalAmount.bind(this));
    }
  }

  private calculateTotalAmount() {
    let sum = 0;

    for (let i = 0; i < this._groupResources.length; i++) {
      sum += this._groupResources[i].resource.amount * this._groupResources[i].multiplier;
    }

    this.amount = sum;
  }

  get groupResources(): { resource: Resource, multiplier: number }[] {
    return this._groupResources;
  }

  set groupResources(value: { resource: Resource, multiplier: number }[]) {
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

      if (resourceOf.resource.amount * resourceOf.multiplier >= amountToDeduct) {
        this.lastAccessedResource = i;
        resourceOf.resource.performDeduction(amountToDeduct / resourceOf.multiplier);
        run = false;
      }
      i++;
    }


  }
}