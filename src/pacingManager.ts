import { Resource } from "./resource";
import { UI_hideWindow, UI_showWindow } from "./ui";

export class PacingManger {
  private _resources: any;
  public introducedWindows: string[]; // holds names of each window that has been introduced to the player

  constructor(resources: any, saveEnabled: boolean) {
    this._resources = resources;
    let alreadyIntroducedWindows = saveEnabled ? localStorage.getItem('pacing') : null;

    if (alreadyIntroducedWindows == null) {
      this.introducedWindows = [];
    } else {
      this.introducedWindows = JSON.parse(alreadyIntroducedWindows);
    }

    let hideWindows = [this._resources.funds.name, 'store', this._resources.coffee.name, 'stats'];

    for (let i = 0; i < hideWindows.length; i++) {
      if (this.introducedWindows.includes(hideWindows[i])) continue;
      UI_hideWindow(hideWindows[i]);
    }

  }

  check() {
    if (this._resources.labor.amount >= 10) {
      this.showWindow(this._resources.funds.name);
      this._resources.funds.enabled = true;
    }

    if (this._resources.funds.amount >= 5) {
      this.showWindow('store');
    }
  }

  showWindow(name: string) {
    if (this.introducedWindows.includes(name)) return;

    UI_showWindow(name);
    this.introducedWindows.push(name);
    localStorage.setItem('pacing', JSON.stringify(this.introducedWindows));
  }
}