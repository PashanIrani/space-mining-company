import { formatNumberString } from "./helpers";
import { UI_displayText } from "./ui";

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MAX_MINUTE = 59;
const MAX_HOUR = 23;
const MAX_MONTH = 12;

export const TIME_TICK_SPEED = 1000 * 5; // 8 Mins per day
export class Time {
  static _minute: number;
  static _hour: number;
  static _day: number;
  static _month: number;
  static _year: number;

  static newGameTime: { minute: number, hour: number, day: number, month: number, year: number };

  static setInitTime(minute: number = 0, hour: number = 0, day: number = 1, month: number = 1, year: number = 0) {

    this.minute = minute;
    this.hour = hour;
    this.day = day;
    this.month = month;
    this.year = year;


    this.setNewGameTime(minute, hour, day, month, year);
    this.startTime();
  }

  static setNewGameTime(minute: number = 0, hour: number = 0, day: number = 1, month: number = 1, year: number = 0) {
    this.newGameTime = { minute, hour, day, month, year }
    UI_displayText('time', 'established', `${this.getFormatedDate(this.newGameTime.day, this.newGameTime.month, this.newGameTime.year)} @ ${this.getFormatedTime(this.newGameTime.hour, this.newGameTime.minute)}`)
  }

  static get minute() {
    return this._minute;
  }

  static set minute(value: number) {
    console.log(value);

    if (value >= MAX_MINUTE) {
      this.hour += Math.floor(value / (MAX_MINUTE));
      value = value % (MAX_MINUTE);
      console.log(value % (MAX_MINUTE), Math.floor(value / (MAX_MINUTE)));

    }

    this._minute = value;
    UI_displayText('time', 'formattedTime', this.getFormatedTime());
  }

  static get hour() {
    return this._hour;
  }

  static set hour(value: number) {
    if (value == MAX_HOUR + 1) {
      value = 0;
      this.day++;
    }

    this._hour = value;
    UI_displayText('time', 'formattedTime', this.getFormatedTime());
    UI_displayText('time', 'timeOfDayLabel', this.getLabelOfTime());
  }

  static get day() {
    return this._day;
  }

  static set day(value: number) {
    if (value == DAYS_PER_MONTH[this.month - 1] + 1) {
      value = 1; // first day is 1 not 0
      this.month++;
    }
    this._day = value;
    UI_displayText('time', 'formattedDate', this.getFormatedDate());
  }

  static get month() {
    return this._month;
  }

  static set month(value: number) {
    if (value == MAX_MONTH + 1) {
      value = 1; // first month is also a 1 not 0
      this.year++;
    }

    this._month = value;
    UI_displayText('time', 'formattedDate', this.getFormatedDate());
  }

  static get year() {
    return this._year;
  }

  static set year(value: number) {
    this._year = value;
    UI_displayText('time', 'formattedDate', this.getFormatedDate());
  }

  static tick() {
    this.minute++;
  }

  static startTime() {
    setInterval(this.tick.bind(this), TIME_TICK_SPEED);
  }

  static getFormatedTime(hour: number = this.hour, minute: number = this.minute): string {
    let ampm = "AM";
    let formattedHour = hour;

    if (hour >= 12) {
      ampm = "PM";
      formattedHour = hour % 12;
    }

    if (formattedHour === 0) {
      formattedHour = 12;
    }

    return `${formattedHour}:${formatNumberString(minute, 0, 2)} ${ampm}`;
  }


  static getFormatedDate(day: number = this.day, month: number = this.month, year: number = this.year): string {
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

    const formattedMonth = months[month - 1]; // adjust for zero-based index

    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
    } else if (day === 2 || day === 22) {
      suffix = "nd";
    } else if (day === 3 || day === 23) {
      suffix = "rd";
    }

    return `${day}${suffix} ${formattedMonth}, ${year}`;
  }

  static getLabelOfTime(hour: number = this.hour): string {
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

  static getCurrentTimestamp() {
    return this.year === undefined ? '' : `[${this.year}-${this.month}-${this.day} ${this.getFormatedTime()}] `;
  }
}


