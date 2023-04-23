import { ALL_RESOURCES } from ".";
import { femaleNames, lastNames, maleNames } from "./names";
import { Resource, Resource_canAffordGeneration, Resource_performCostTransaction } from "./resource";
import { Time } from "./time";
import { UI_displayStaffMembers } from './ui'

export const STAFF_TICK_FREQ_MS = 100;

export class StaffResource extends Resource {

  private _members: StaffMember[] = [];

  public build(amount: number = this.generateAmount) {
    this.members.push(new StaffMember(this.onStaffMemberUpdate.bind(this), 0.1));
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


export class StaffMember {
  private _assignment: Resource;
  private _efficiency: number;
  public gender: number;
  public name: StaffName;
  public birthDate: StaffBirthDate;
  private _age: number;
  private _pic: string;
  private _genRatePerSec: number;

  private onStaffUpdateCallback: Function;

  constructor(onStaffUpdateCallback: Function = () => { }, efficiency: number = 1, gender: number = genGender(), name: StaffName = null, assignment: string = null, birthDate: StaffBirthDate = Time.generateDay(), pic: string = generateRandomLennyFace()) {
    this.onStaffUpdateCallback = onStaffUpdateCallback;
    this.gender = gender;
    this.name = name || { firstName: genFirstName(this.gender), lastName: genLastName() };
    this.efficiency = efficiency;
    this.assignment = ALL_RESOURCES[assignment] || null;
    this.birthDate = birthDate;
    this.age = calculateAge(this.birthDate);
    this.genRatePerSec = 0;


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
      let totalTickIncludingTimeToBuild = this.assignment.timeToBuildMs > 0 ? TICKS_PER_SEC * (this.assignment.timeToBuildMs / 1000) : TICKS_PER_SEC;
      if (!Resource_canAffordGeneration(this.assignment.costs, this.efficiency, totalTickIncludingTimeToBuild)) return;
      if (this.assignment.amount == this.assignment.capacity || this.assignment.getSumOfBuildQueue() == (this.assignment.capacity - this.assignment.amount)) return; // check capacity is full

      Resource_performCostTransaction(this.assignment.costs, this.efficiency, totalTickIncludingTimeToBuild);

      let generate = this.assignment.generateAmount * this.efficiency;
      this.assignment.build(generate, totalTickIncludingTimeToBuild)
      this.genRatePerSec = generate / (totalTickIncludingTimeToBuild / TICKS_PER_SEC);
    } else {
      this.genRatePerSec = 0;
    }
  }

  get assignment(): Resource {
    return this._assignment;
  }

  set assignment(value: Resource) {
    this._assignment = value;
    this.onStaffUpdateCallback();
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
    let updateUI = false;
    if (this._genRatePerSec != value) {
      updateUI = true;
    }

    this._genRatePerSec = value;

    if (updateUI)
      this.onStaffUpdateCallback();
  }

  get age(): number {
    return this._age;
  }


  set age(value: number) {
    let updateUI = false;
    if (this._age != value) {
      updateUI = true;
    }
    this._age = value;

    if (updateUI)
      this.onStaffUpdateCallback();
  }

  get efficiency(): number {
    return this._efficiency;
  }

  set efficiency(value: number) {
    this._efficiency = value;
  }
}

function generateRandomLennyFace() {
  const eyes = ["⊙ ⊙", "◉ ◉", "◕ ◕", "• •", "o o", "° °", "¬ ¬", "ಠ ಠ", "ʘ ʘ", " ͡°  ͡°", "⩾ ⩽", "•̀ •́", "⸟ ⸟",
    "⟃ ⟃", "ᵔ ᵔ", "⌐■ ■", "￣ ￣", "* *", "ó ò", "ꗞ ꗞ", "⇀ ↼", "ȍ ȍ", "⩹ ⩺", "❍ ❍", "` `", "ⱺ ⱺ", "☉ ☉", "꘠ ꘠",
    "^ ^", "´• •`", "⏓ ⏓", "$ $", "Ꝋ Ꝋ", "> >", "ᗒ ᗕ", "⩿ ⪀", "⚆ ⚆", "@ @"];
  const mouth = ["‿", "︿", "▽", "◡", "ω", "Д", "∀", "з", "ε", "¯", "´", ".", "^", "﹀", "⌔", "ᗨ", "⋃", "⩌", "ᗝ", "෴", "﹏"];

  const randomEyes = eyes[Math.floor(Math.random() * eyes.length)];
  const randomMouth = mouth[Math.floor(Math.random() * mouth.length)];

  return randomEyes + "<br />" + randomMouth;
}

