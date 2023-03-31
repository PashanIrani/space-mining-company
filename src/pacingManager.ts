import { Resource } from "./resource";
import { UI_hideWindow, UI_showWindow } from "./ui";

export class PacingManger {
  private _resources: any;

  constructor(resources: any) {
    this._resources = resources;

    UI_hideWindow(this._resources.funds.name);
  }

  check() {
    if (this._resources.energy.amount >= 10) {
      UI_showWindow(this._resources.funds.name);
    }
  }
}