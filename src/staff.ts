import { ALL_RESOURCES } from ".";
import { Cost } from "./cost";
import { formatNumberToString, randomIntFromInterval } from "./helpers";
import { femaleNames, lastNames, maleNames } from "./names";
import { Resource, Resource_canAffordGeneration, Resource_performCostTransaction } from "./resource";
import { Time } from "./time";
import { UI_displayStaffMembers, UI_displayText } from './ui'

export const STAFF_TICK_FREQ_MS = 100;

export class StaffResource extends Resource {

  private _members: StaffMember[] = [];

  public build(amount: number = this.generateAmount) {
    this.members.push(new StaffMember(this.members.length, randomIntFromInterval(1, 40) / 100));
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

  onStaffMemberUpdate() {
    UI_displayStaffMembers(this._members);
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

export const TICKS_PER_SEC = 1000 / STAFF_TICK_FREQ_MS;

function calculateAge(birthDate: StaffBirthDate) {
  const birthMonth = birthDate.month - 1;
  const birthDay = birthDate.day;
  const birthYear = birthDate.year;

  const currentMonth = Time.month - 1;
  const currentDay = Time.day;
  const currentYear = Time.year;

  let age = currentYear - birthYear;

  // Adjust age if birthday has not yet occurred this year
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age;
}

export enum StaffAction { PROCASTINATE, WORKING, REST, EAT };

export class StaffMember {
  public id: number;
  private _assignment: Resource;
  private _efficiency: number;
  public gender: number;
  public name: StaffName;
  public birthDate: StaffBirthDate;
  private _age: number;
  private _pic: string;
  private _genRatePerSec: number;
  private _spendRatePerSec: Cost[] = [];
  private _currentAction: StaffAction;
  private _sallary: Cost;

  constructor(id: number, efficiency: number = 1, gender: number = genGender(), name: StaffName = null, assignment: string = null, birthDate: StaffBirthDate = Time.generateDay(), pic: string = generateRandomLennyFace()) {
    this.id = id;
    this.gender = gender;
    this.name = name || { firstName: genFirstName(this.gender), lastName: genLastName() };
    this.efficiency = efficiency;
    this.assignment = ALL_RESOURCES[assignment] || null;
    this.birthDate = birthDate;
    this.age = calculateAge(this.birthDate);
    this.genRatePerSec = 0;
    this.sallary = { resource: 'funds', amount: randomIntFromInterval(40, 125) }

    this.pic = pic;
    this.begin();
  }

  private begin() {
    setInterval(() => {
      this.perTickAction();

    }, STAFF_TICK_FREQ_MS);

    setInterval(() => {
      // this.age = calculateAge(this.birthDate);
    }, 2500);
  }

  perTickAction(): void {

    if (this.assignment instanceof Resource) {
      let totalSecs = this.assignment.timeToBuildMs < 1000 ? 1 : this.assignment.timeToBuildMs / 1000;
      let totalTickIncludingTimeToBuild = TICKS_PER_SEC * totalSecs;

      // Check if should generate
      let cantAfford = !Resource_canAffordGeneration(this.assignment.costs, this.efficiency, totalTickIncludingTimeToBuild);
      let atCapacity = this.assignment.amount == this.assignment.capacity || this.assignment.getSumOfBuildQueue() == (this.assignment.capacity - this.assignment.amount);
      if (cantAfford || atCapacity) {
        this.genRatePerSec = 0;
        return;
      }

      // Perform cost transaction, and determine how much is spent for display purposes
      if (Resource_performCostTransaction(this.assignment.costs, this.efficiency, totalTickIncludingTimeToBuild)) {
        let spending: Cost[] = [];
        this.assignment.costs.forEach(cost => {
          spending.push({
            amount: (cost.amount * this.efficiency) / (totalTickIncludingTimeToBuild / TICKS_PER_SEC),
            resource: cost.resource
          })
        });

        this.spendRatePerSec = spending;
      } else {
        this.spendRatePerSec = [];
      }

      // Determine generate amount and then generate
      let generate = this.assignment.generateAmount * this.efficiency;
      this.assignment.build(generate, totalTickIncludingTimeToBuild);
      this.genRatePerSec = generate / (totalTickIncludingTimeToBuild / TICKS_PER_SEC);

      // advance time used by staff
      Time.minute += (this.assignment.timeCost * this.efficiency) / totalTickIncludingTimeToBuild;
    } else {
      this.genRatePerSec = 0;
    }
  }

  get assignment(): Resource {
    return this._assignment;
  }

  set assignment(value: Resource) {
    this._assignment = value;
  }

  get sallary(): Cost {
    return this._sallary;
  }

  set sallary(value: Cost) {
    this._sallary = value;
  }

  get pic(): string {
    return this._pic;
  }

  set pic(value: string) {
    this._pic = value;
  }

  get genRatePerSec(): number {
    return this._genRatePerSec;
  }

  set genRatePerSec(value: number) {
    this._genRatePerSec = value;

    if (this.assignment) {
      let sign = this.genRatePerSec >= 0 ? '+' : '-';
      UI_displayText('staff-member', `${this.id}-gen-rate`, `${sign}${formatNumberToString(this.genRatePerSec, 3)} ${this.assignment.label}/s`);
    } else {
      UI_displayText('staff-member', `${this.id}-gen-rate`, `none`);
    }
  }

  get spendRatePerSec(): Cost[] {
    return this._spendRatePerSec;
  }

  set spendRatePerSec(value: Cost[]) {
    this._spendRatePerSec = value;

    let displayText = "none";

    if (this.assignment) {
      displayText = "";
      for (let i = 0; i < this.spendRatePerSec.length; i++) {
        const spending = this.spendRatePerSec[i];

        let sign = spending.amount >= 0 ? '-' : '+'; // these should be flipped, not a bug
        displayText += `${sign}${formatNumberToString(spending.amount, 3)} ${ALL_RESOURCES[spending.resource].label}/s`;

        if (i < this.spendRatePerSec.length - 1) displayText += ", "
      }

      if (this.spendRatePerSec.length == 0) {
        displayText = "none";
      }

    }

    UI_displayText('staff-member', `${this.id}-spend-rate`, displayText);
  }

  get age(): number {
    return this._age;
  }


  set age(value: number) {
    this._age = value;
    UI_displayText('staff-member', `${this.id}-age`, this.age + "");
  }

  get efficiency(): number {
    return this._efficiency;
  }

  set efficiency(value: number) {
    this._efficiency = value;
    UI_displayText('staff-member', `${this.id}-efficiency`, (this.efficiency * 100) + "%");
  }

  UI_triggerUpdate() {
    this.age = this.age;
    this.efficiency = this.efficiency;
    this.genRatePerSec = this.genRatePerSec;
    this.spendRatePerSec = this.spendRatePerSec;
  }
}

function generateRandomLennyFace() {
  const eyes = ["⊙ ⊙", "◉ ◉", "◕ ◕", "• •", "o o", "° °", "¬ ¬", "ಠ ಠ", "ʘ ʘ", " ͡°  ͡°", "⩾ ⩽", "•̀ •́", "⸟ ⸟",
    "⟃ ⟃", "ᵔ ᵔ", "⌐■ ■", "￣ ￣", "* *", "ó ò", "ꗞ ꗞ", "⇀ ↼", "ȍ ȍ", "⩹ ⩺", "❍ ❍", "` `", "ⱺ ⱺ", "☉ ☉", "꘠ ꘠",
    "^ ^", "´• •`", "⏓ ⏓", "$ $", "Ꝋ Ꝋ", " > > ", "ᗒ ᗕ", "⩿ ⪀", "⚆ ⚆", "@@"];
  const mouth = ["‿", "︿", "▽", "◡", "ω", "Д", "∀", "з", "ε", "¯", "´", ".", "^", "﹀", "⌔", "ᗨ", "⋃", "⩌", "ᗝ", "෴", "﹏"];

  const randomEyes = eyes[Math.floor(Math.random() * eyes.length)];
  const randomMouth = mouth[Math.floor(Math.random() * mouth.length)];

  return randomEyes + "<br />" + randomMouth;
}

