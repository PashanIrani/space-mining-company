import { Resource } from "./resource";
import { UI_displayValue, UI_displayText } from "./ui";

export class Time {
  private _delta: number;
  private _startDate: Date;
  constructor(startDelta: number = 0, startDate: Date, timeDeltaResource: Resource) {
    this.delta = startDelta;

    this._startDate = startDate;

    const date = this._startDate;
    const year = date.getFullYear().toString().slice(2);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format the date and time with a retro sci-fi feel
    const formattedDate = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const formattedDateTime = `${formattedDate} ${formattedTime}`;

    UI_displayText('time', 'startDate', formattedDateTime);

    setInterval(() => {
      timeDeltaResource.amount += 0.016667; // one day every 20 mins
    }, 60 * 1000);
  }


  get delta(): number {
    return this._delta;
  }

  set delta(newValue: number) {
    this._delta = newValue;
    UI_displayValue('time', 'delta', this.delta);
    console.log('huh');

  }


  addHours(hours: number) {
    this.delta += hours;
  }
}