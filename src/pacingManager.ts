import { Resource } from "./resource";
import { UI_hideWindow, UI_showWindow } from "./ui";

export class PacingManger {
  private _resources: any;

  constructor(resources: any) {
    this._resources = resources;

    UI_hideWindow(this._resources.funds.name);
    UI_hideWindow('store');
  }

  check() {
    if (this._resources.energy.amount >= 10) {
      UI_showWindow(this._resources.funds.name);
    }

    if (this._resources.funds.amount >= 10) {
      UI_showWindow('store');
    }
  }
}