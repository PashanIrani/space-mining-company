import { ALL_RESOURCES } from ".";
import { femaleNames, lastNames, maleNames } from "./names";
import { Resource, Resource_canAffordGeneration, Resource_performCostTransaction } from "./resource";
import { UI_displayStaffMembers } from './ui'

export const STAFF_TICK_FREQ_MS = 100;

export class StaffResource extends Resource {

  private _members: StaffMember[] = [];

  public build(amount: number = this.generateAmount) {
    this.members.push(new StaffMember());
    this.members = [...this.members];
    super.build(amount);
  }

  get members(): StaffMember[] {
    return this._members;
  }

  set members(value: StaffMember[]) {
    this._members = value;

    UI_displayStaffMembers(value);

  }
}

function genGender() {
  const prob = Math.random();

  let gender = 0;
  if (prob >= 0.4) gender = 1;
  if (prob >= 0.8) gender = 2;

  return gender;
}

function genFirstName(gender: number) {
  const prob = Math.random();

  if (gender == 0 || (prob < 0.5 && gender == 2)) {
    return maleNames[Math.floor(Math.random() * maleNames.length)];
  }

  if (gender == 1 || (prob >= 0.5 && gender == 2)) {
    return femaleNames[Math.floor(Math.random() * femaleNames.length)];
  }

  return "";
}

function genLastName() {
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

interface StaffName {
  firstName: string;
  lastName: string;
}

interface StaffBirthDate {
  day: number
  month: number
  year: number
}

const TICKS_PER_SEC = 1000 / STAFF_TICK_FREQ_MS;

export class StaffMember {
  private _assignment: Resource;
  private _efficiency: number;
  public gender: number;
  public name: StaffName;

  constructor(gender: number = genGender(), name: StaffName = null, efficiency: number = 1, assignment: string = null) {
    this.gender = gender;
    this.name = name || { firstName: genFirstName(this.gender), lastName: genLastName() };
    this.efficiency = efficiency;
    this.assignment = ALL_RESOURCES[assignment] || null;
    this.begin();
  }

  private begin() {
    setInterval(() => {
      this.perTickAction();
    }, STAFF_TICK_FREQ_MS)
  }

  perTickAction(): void {
    if (this.assignment instanceof Resource) {

      if (!Resource_canAffordGeneration(this.assignment.costs, this.efficiency, TICKS_PER_SEC)) return;
      if (this.assignment.amount == this.assignment.capacity || this.assignment.getSumOfBuildQueue() == (this.assignment.capacity - this.assignment.amount)) return; // check capacity is full

      Resource_performCostTransaction(this.assignment.costs, this.efficiency, TICKS_PER_SEC);

      this.assignment.build(this.assignment.generateAmount * this.efficiency, TICKS_PER_SEC)
    }
  }

  get assignment(): Resource {
    return this._assignment;
  }

  set assignment(value: Resource) {
    this._assignment = value;
  }

  get efficiency(): number {
    return this._efficiency;
  }

  set efficiency(value: number) {
    this._efficiency = value;
  }
}

