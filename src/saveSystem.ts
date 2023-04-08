import { ALL_RESOURCES } from ".";
import { AllResourceDefination, Resource } from "./resource";
import { Store } from "./store";
import { Time } from "./time";
import { UI_displayText } from "./ui";

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

const SAVE_FREQUENCY = 1000 * 5;

export function beginSaving() {

  SaveSystem.saveAll(); // save on init first time

  setInterval(() => {
    SaveSystem.saveAll();
  }, SAVE_FREQUENCY);

  // Show time since last save
  setInterval(() => {
    let now = new Date();
    const startTimestamp = Math.floor(SaveSystem.lastSaveTime.getTime() / 1000);
    const endTimestamp = Math.floor(now.getTime() / 1000);

    const secondsElapsed = endTimestamp - startTimestamp;
    UI_displayText("time", "since-last-save", secondsElapsed == 0 ? `Saved!` : `${secondsElapsed}s since last save...`)
  }, 1000);
}
export class SaveSystem {
  static lastSaveTime: Date;

  static saveAll() {
    this.saveResources();
    this.saveTime();
    this.saveStoreItems();
    this.lastSaveTime = new Date();
  }

  static saveTime() {
    let timeData = {
      minute: Time.minute,
      hour: Time.hour,
      day: Time.day,
      month: Time.month,
      year: Time.year
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

  static saveResources() {
    let resourceData: ResourceData = {};

    for (const key in ALL_RESOURCES) {

      const resource = ALL_RESOURCES[key];

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