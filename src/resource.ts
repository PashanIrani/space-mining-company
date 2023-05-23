import { UI_displayValue, UI_displayText, UI_updateProgressBar, UI_log } from "./ui";
import { Cost, Cost_getCostDisplayString } from "./cost";
import { convertTime, formatNumberToString } from "./helpers";
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
  enabled: boolean; // true is resource has been introduced to player, false if not
  buildDescriptions?: string[]; // a description of the build
}

export type AllResourceDefination = { [key: string]: Resource };

export interface GroupResouceDefination {
  name: string,
  label: string // name shown on screen
  groupResources: { resource: Resource, multiplier: number }[]
}

// checks if all the costs are met
export function Resource_canAffordGeneration(costs: Cost[], efficiency: number = 1, splitBy: number = 1): boolean {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];

    if (ALL_RESOURCES[cost.resource].amount < (cost.amount / splitBy) * efficiency) {
      return false;
    }
  }

  return true;
}

// TODO: add locks to everything using these resource to fully perform transaction
export function Resource_performCostTransaction(costs: Cost[], efficiency: number = 1, splitBy: number = 1): boolean {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];

    if (ALL_RESOURCES[cost.resource].amount < (cost.amount / splitBy) * efficiency) {
      return false;
    }

    ALL_RESOURCES[cost.resource].performDeduction((cost.amount / splitBy) * efficiency);
  }

  return true;
}

export class Resource {
  readonly name: string;
  private _label: string;
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

  private _buildDescriptions: string[];

  private _timeCost: number;
  private _enabled: boolean;

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
    this.enabled = defination.enabled;

    this._buildDescriptions = defination.buildDescriptions || null;

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

    if (this.buildStatus > 0) {
      this.initiateBuild();
    }
  }

  // Registers a callback that will be called when amount is updated
  onAmountUpdate(callbackFn: Function) {
    this.onAmountUpdateCallbacks.push(callbackFn);
  }

  // Calculates Rate
  private initRateCalculation() {
    let prevValue = this.amount;

    setInterval(() => {
      let rate = this.amount - prevValue;

      let timeLeftText = null;
      if (rate < 0) {
        timeLeftText = `${convertTime(this.amount / (rate * -1))} till empty`;
      }

      if (rate > 0 && this.capacity) {
        timeLeftText = `${convertTime(((this.capacity - this.amount) / rate))} to full`;
      }


      UI_displayText(this.name, 'rate', `${rate > 0 ? '+' : ''}${formatNumberToString(rate, 3)}/s ${timeLeftText != null ? `(${timeLeftText})` : ''}`);
      prevValue = this.amount;
    }, 1000);
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
      generateButton.addEventListener('click', () => { this.generate() });

      generateButton.addEventListener('mousedown', this.mouseHoldStart.bind(this));
      generateButton.addEventListener('mouseup', this.mouseHoldEnd.bind(this));
      generateButton.addEventListener('mouseleave', this.mouseHoldEnd.bind(this));

      generateButton.addEventListener('touchstart', this.mouseHoldStart.bind(this));
      generateButton.addEventListener('touchend', this.mouseHoldEnd.bind(this));
      generateButton.addEventListener('touchcancel', this.mouseHoldEnd.bind(this));
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

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  get timeCost(): number {
    return this._timeCost;
  }

  set timeCost(value: number) {
    this._timeCost = value;
    UI_displayValue(this.name, 'time-cost', this.timeCost, 2);
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
    UI_displayText(this.name, 'label', this.label);
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
    UI_displayText(this.name, 'hold-amount', value > 0 ? `Hold for +${value} clicks/sec` : '')
  }

  get generateAmount(): number {
    return this._generateAmount;
  }

  set generateAmount(value: number) {
    this._generateAmount = value;
    UI_displayValue(this.name, 'generate-amount', value, 2)
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
      queueString = `(${this.buildQueue.length})`
    }

    let itemOverflowText = '';
    if (this.amount + this.buildQueue[0] > this.capacity) {
      itemOverflowText = 'Overflow Error!'
    }

    let currentBuildDescription = '';
    let bs = this.buildStatus;
    let showStepPercentage = false;
    if (this._buildDescriptions) {
      let index = Math.floor(value * this._buildDescriptions.length);
      currentBuildDescription = this._buildDescriptions[index];
      bs = (value - (index * (1 / this._buildDescriptions.length))) / (1 / this._buildDescriptions.length)
      showStepPercentage = this._buildDescriptions.length > 1
    }

    if (this.buildStatus == 0) {
      UI_displayText(this.name, 'buildStatus', '');
    } else {
      UI_displayText(this.name, 'buildStatus', `+${formatNumberToString(this.buildQueue[0], 2)} [${formatNumberToString(Math.round(this.buildStatus * 100), 0, -1)}%: ${currentBuildDescription}${showStepPercentage ? ' <' + formatNumberToString(Math.round(bs * 100), 0, -1) + '%>' : ''}] ${queueString} ${itemOverflowText}`);
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

  public getSumOfBuildQueue() {
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
        if (this.timeToBuildMs <= this.timeCost) {
          console.error("TimeToBuildMS CANNOT be less than timeCost for ", this.name);
        }

        const timePerCostMin = this.timeToBuildMs / this.timeCost;
        timeCostTickInterval = setInterval(() => {
          Time.minute += 1;
        }, timePerCostMin);
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
  public build(amount: number = this.generateAmount, splitBy: number = 1) {
    amount = amount / splitBy;
    this.amount += amount;
    this._afterNewGeneration(this.amount, amount);

    if (this.timeToBuildMs == 0)
      Time.minute += (this.timeCost / splitBy);
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
      enabled: true
    });

    this.groupResources = defination.groupResources;

    // Re-calculate when one of the amounts changes
    for (let i = 0; i < this._groupResources.length; i++) {
      this._groupResources[i].resource.onAmountUpdate(this.calculateTotalAmount.bind(this));
    }

    this.calculateTotalAmount();
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

    this.drawCompositionDetails();
  }

  get lastAccessedResource(): number {
    return this._lastAccessedResource;
  }

  set lastAccessedResource(value: number) {
    this._lastAccessedResource = value;
  }

  drawCompositionDetails() {
    // Show details of how this resource is composed
    let displayString = `<p>${this.label} derived from:</p>`;
    displayString += "<ul>"
    for (let i = 0; i < this._groupResources.length; i++) {
      const groupResource = this._groupResources[i];
      if (groupResource.resource.enabled)
        displayString += `<li>1 ${groupResource.resource.label} -> ${groupResource.multiplier} ${this.label}</li>`
      UI_displayText(this.name, `${groupResource.resource.name}-weight`, `${groupResource.multiplier} ${this.label}`)
    }
    displayString += "</ul>"

    UI_displayText(this.name, 'composition-details', displayString);
  }

  performDeduction(amountToDeduct: number) {
    // Get index of which resource to deduct from next
    let firstResouceToCheck = this.lastAccessedResource + 1 <= this.groupResources.length - 1
      ? this.lastAccessedResource + 1
      : 0;

    let run = true;
    let i = firstResouceToCheck;

    while (amountToDeduct > 0) {
      if (i >= this.groupResources.length) {
        i = 0;
      }

      const resourceOf = this.groupResources[i];

      if (resourceOf.resource.amount * resourceOf.multiplier >= amountToDeduct) {
        resourceOf.resource.performDeduction(amountToDeduct / resourceOf.multiplier);
        amountToDeduct -= amountToDeduct;
      } else {
        amountToDeduct -= resourceOf.resource.amount * resourceOf.multiplier;
        resourceOf.resource.performDeduction(resourceOf.resource.amount);
      }

      this.lastAccessedResource = i;
      i++;
    }
  }
}
