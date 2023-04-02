import { Resource } from "./resource";
import { UI_displayValue, UI_displayText } from "./ui";

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MAX_MINUTE = 59;
const MAX_HOUR = 23;
const MAX_MONTH = 12;

export class Time {
  private _minute: number;
  private _hour: number;
  private _day: number;
  private _month: number;
  private _year: number;


  constructor(minute: number = 0, hour: number = 0, day: number = 1, month: number = 1, year: number = 0) {
    this.minute = minute;
    this.hour = hour;
    this.day = day;
    this.month = month;
    this.year = year;

    this.startTime();

  }

  get minute() {
    return this._minute;
  }

  set minute(value: number) {
    if (value == MAX_MINUTE + 1) {
      value = 0;
      this.hour++;
    }

    this._minute = value;
    UI_displayValue('time', 'minuteValue', this._minute, 0, 2);
  }

  get hour() {
    return this._hour;
  }

  set hour(value: number) {
    if (value == MAX_HOUR + 1) {
      value = 0;
      this.day++;
    }

    this._hour = value;
    UI_displayValue('time', 'hourValue', this._hour, 0, 2);
  }

  get day() {
    return this._day;
  }

  set day(value: number) {
    if (value == DAYS_PER_MONTH[this.month - 1] + 1) {
      value = 1; // first day is 1 not 0 bro
      this.month++;
    }
    this._day = value;
    UI_displayValue('time', 'dayValue', this._day);
  }

  get month() {
    return this._month;
  }

  set month(value: number) {
    if (value == MAX_MONTH + 1) {
      value = 1; // first month is also a 1 not 0
      this.year++;
    }

    this._month = value;
    UI_displayValue('time', 'monthValue', this._month);
  }

  get year() {
    return this._year;
  }

  set year(value: number) {
    this._year = value;
    UI_displayValue('time', 'yearValue', this._year);
  }

  tick() {
    this.minute++;
  }

  startTime() {
    setInterval(this.tick.bind(this), 250);
  }
}


