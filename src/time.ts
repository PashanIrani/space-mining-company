import { formatNumberString } from "./helpers";
import { Resource } from "./resource";
import { UI_displayValue, UI_displayText } from "./ui";

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MAX_MINUTE = 59;
const MAX_HOUR = 23;
const MAX_MONTH = 12;

const TIME_TICK_SPEED = 1000 * 60;
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
    if (value >= MAX_MINUTE + 1) {
      value = 0;
      this.hour++;
    }

    this._minute = value;
    // UI_displayValue('time', 'minuteValue', this._minute, 0, 2);
    UI_displayText('time', 'formattedTime', this.getFormatedTime());
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
    UI_displayText('time', 'formattedTime', this.getFormatedTime());
    UI_displayText('time', 'timeOfDayLabel', this.getLabelOfTime());
  }

  get day() {
    return this._day;
  }

  set day(value: number) {
    if (value == DAYS_PER_MONTH[this.month - 1] + 1) {
      value = 1; // first day is 1 not 0
      this.month++;
    }
    this._day = value;
    UI_displayText('time', 'formattedDate', this.getFormatedDate());
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
    // UI_displayValue('time', 'monthValue', this._month);
    UI_displayText('time', 'formattedDate', this.getFormatedDate());
  }

  get year() {
    return this._year;
  }

  set year(value: number) {
    this._year = value;
    // UI_displayValue('time', 'yearValue', this._year);
    UI_displayText('time', 'formattedDate', this.getFormatedDate());
  }

  tick() {
    this.minute++;
  }

  startTime() {
    setInterval(this.tick.bind(this), TIME_TICK_SPEED);
  }

  getFormatedTime(): string {
    let ampm = "AM";
    let formattedHour = this.hour;

    if (this.hour >= 12) {
      ampm = "PM";
      formattedHour = this.hour % 12;
    }

    if (formattedHour === 0) {
      formattedHour = 12;
    }

    const formattedMins = this.minute < 10 ? `0${this.minute}` : this.minute;

    return `${formattedHour}:${formatNumberString(this.minute, 0, 2)} ${ampm}`;
  }

  getFormatedDate(): string {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const formattedMonth = months[this.month - 1]; // adjust for zero-based index

    let suffix = "th";
    if (this.day === 1 || this.day === 21 || this.day === 31) {
      suffix = "st";
    } else if (this.day === 2 || this.day === 22) {
      suffix = "nd";
    } else if (this.day === 3 || this.day === 23) {
      suffix = "rd";
    }

    return `${this.day}${suffix} ${formattedMonth}, ${this.year}`;
  }

  getLabelOfTime(): string {
    let hour = this.hour;

    if (hour < 4) {
      return "Late Night";
    } else if (hour < 6) {
      return "Early Morning";
    } else if (hour < 9) {
      return "Morning";
    } else if (hour < 12) {
      return "Late Morning";
    } else if (hour < 14) {
      return "Noon";
    } else if (hour < 16) {
      return "Afternoon";
    } else if (hour < 18) {
      return "Late Afternoon";
    } else if (hour < 20) {
      return "Early Evening";
    } else if (hour < 22) {
      return "Evening";
    } else {
      return "Late Evening";
    }
  }

}


