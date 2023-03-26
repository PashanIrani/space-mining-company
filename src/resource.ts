import { UI_displayValue } from "./ui";

export class Resource {
  readonly name: string;
  private _amount: number;
  private _capacity: number;

  constructor(name: string, amount: number, capacity: number) {
    this.name = name;

    // not using private here to allow setter to run on init
    this.amount = amount; 
    this.capacity = capacity;
  }

  get amount(): number {
    return this._amount;
  }
  
  set amount(value: number) {
    this._amount = value;
    
    // check if gone over capacity
    if (this._amount > this._capacity) {
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
}