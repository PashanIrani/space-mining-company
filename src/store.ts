import { Cost } from "./cost";
import { Resource_canAffordGeneration, Resource_performCostTransaction } from "./resource";
import { UI_drawStore } from "./ui";

interface StoreItem {
  displayName: string, // Name used to display in UI
  displayDescription: string, // Description show on UI
  costs: Cost[], // the cost for generating this resource
  onPurchase: Function, // called once purchased
  dependsOn: string | null // doesn't show up in UI until store item with this name is purchased
  purchased: boolean;// indicates if this store item is purchased
}

export type StoreDefination = {
  [key: string]: StoreItem
};

export class Store {
  private static _items: StoreDefination;

  constructor(items: StoreDefination = null) {
    if (items) {
      Store.items = items;
    }

    setInterval(() => {
      UI_drawStore(Store.items);
    }, 250);
  }


  static get items() {
    return Store._items;
  }

  static set items(value: StoreDefination) {
    Store._items = value;
    UI_drawStore(this.items);
  }

  static buyItem(key: string) {
    if (!Resource_canAffordGeneration(Store.items[key].costs)) {
      return;
    }

    Resource_performCostTransaction(Store.items[key].costs);
    Store.items[key].purchased = true;
    Store.items[key].onPurchase();
    Store.items = { ...Store.items }; // to make setter run

  }
}