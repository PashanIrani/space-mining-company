import { Resource } from "./resource";
import { UI_hideWindow, UI_shakeScreen, UI_showWindow } from "./ui";

export class PacingManger {
  static _resources: any;
  static introducedWindows: string[]; // holds names of each window that has been introduced to the player

  static init(resources: any) {
    this._resources = resources;

    this.introducedWindows = [];

    let hideWindows = [this._resources.funds.name, 'store', this._resources.coffee.name, 'stats', 'staff'];

    for (let i = 0; i < hideWindows.length; i++) {
      if (this.introducedWindows.includes(hideWindows[i])) continue;
      UI_hideWindow(hideWindows[i]);
    }

  }

  static check() {
    this.introducedWindows.forEach(windowName => {
      this.showWindow(windowName);
    });

    if (this._resources.labor.amount >= 10) {
      this.showWindow(this._resources.funds.name);
      this._resources.funds.enabled = true;
    }

    if (this._resources.funds.amount >= 5) {
      this.showWindow('store');
    }
  }

  static showWindow(name: string) {

    UI_showWindow(name);
    if (this.introducedWindows.includes(name)) return;
    this.introducedWindows.push(name);
    UI_shakeScreen();
  }
}