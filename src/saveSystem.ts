import { AllResourceDefination, Resource } from "./resource";
import { Store } from "./store";
import { Time } from "./time";

const RESOURCES = "resources";
const STORE_ITEMS = "storeItems";
const TIME = "timeData";

interface ResourceData {
  [key: string]: {
    amount: number,
    generateAmount: number,
    capacity: number,
    timeToBuildMs: number,
    holdToGenerateAmount: number,
    buildQueue: number[],
    buildStatus: number,
  }
}

export class SaveSystem {
  static saveAll(ALL_RESOURCES: AllResourceDefination, time: Time) {
    this.saveResources(ALL_RESOURCES);
    this.saveTime(time);
    this.saveStoreItems();
  }

  static saveTime(time: Time) {
    let timeData = {
      minute: time.minute,
      hour: time.hour,
      day: time.day,
      month: time.month,
      year: time.year
    }

    localStorage.setItem(TIME, JSON.stringify(timeData));
  }

  static loadTime() {
    let timeData = localStorage.getItem(TIME);
    if (timeData === null) return null;

    return JSON.parse(timeData);
  }

  static saveStoreItems() {
    let purchasedItemsKeys = [];
    for (const key in Store.items) {
      if (Store.items[key].purchased) {
        purchasedItemsKeys.push(key);
      }
    }

    localStorage.setItem(STORE_ITEMS, JSON.stringify(purchasedItemsKeys));
  }

  static loadStoreItems() {
    let purchasedStoreItemsData = localStorage.getItem(STORE_ITEMS);
    if (purchasedStoreItemsData === null) return;

    purchasedStoreItemsData = JSON.parse(purchasedStoreItemsData);

    for (let i = 0; i < purchasedStoreItemsData.length; i++) {
      const purchasedItem = purchasedStoreItemsData[i];
      Store.items[purchasedItem].purchased = true;
    }
  }

  static saveResources(resources: AllResourceDefination) {
    let resourceData: ResourceData = {};

    for (const key in resources) {
      const resource = resources[key];

      resourceData[resource.name] = {
        amount: resource.amount,
        generateAmount: resource.generateAmount,
        capacity: resource.capacity,
        timeToBuildMs: resource.timeToBuildMs,
        holdToGenerateAmount: resource.holdToGenerateAmount,
        buildQueue: resource.buildQueue,
        buildStatus: resource.buildStatus,
      }
    }

    localStorage.setItem(RESOURCES, JSON.stringify(resourceData));
  }

  static loadResources(resources: AllResourceDefination) {
    let resourcesDataString = localStorage.getItem(RESOURCES);

    if (resourcesDataString == null) return;

    let resourcesData: ResourceData = JSON.parse(resourcesDataString);

    for (const key in resources) {
      const resource = resources[key];
      resource.amount = resourcesData[key].amount;
      resource.generateAmount = resourcesData[key].generateAmount;
      resource.capacity = resourcesData[key].capacity;
      resource.timeToBuildMs = resourcesData[key].timeToBuildMs;
      resource.holdToGenerateAmount = resourcesData[key].holdToGenerateAmount;
      resource.buildQueue = resourcesData[key].buildQueue;
      resource.buildStatus = resourcesData[key].buildStatus;
      resource.updatedFromSave = true;
    }
  }
}