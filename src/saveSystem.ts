import { ALL_RESOURCES } from ".";
import { AllResourceDefination, Resource } from "./resource";
import { Store } from "./store";
import { TIME_TICK_SPEED, Time } from "./time";
import { UI_displayText, UI_log } from "./ui";

const RESOURCES = "resources";
const STORE_ITEMS = "storeItems";
const TIME = "timeData";
const INIT_TIME = "initTimeData";
const LOGS = "logs";
const LAST_SAVE_TIME = "last_save_time";

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

const SAVE_FREQUENCY = 1000;

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
    UI_displayText("save", "next", secondsElapsed == 0 ? `Next Save: Saving...` : `Next Save: In ${(SAVE_FREQUENCY / 1000) - secondsElapsed} seconds.`)
  }, 1000);
}
export class SaveSystem {
  static lastSaveTime: Date;

  static saveAll() {
    this.saveResources();
    this.saveTime();
    this.saveStoreItems();
    this.saveLog();
    this.markSave();
    this.lastSaveTime = new Date();
  }

  // marks last saved time 
  static markSave() {
    localStorage.setItem(LAST_SAVE_TIME, new Date().getTime() + "");
  }

  static saveTime() {
    let timeData = {
      minute: Time.minute,
      hour: Time.hour,
      day: Time.day,
      month: Time.month,
      year: Time.year
    }
    console.log(JSON.stringify(timeData));

    localStorage.setItem(TIME, JSON.stringify(timeData));
  }

  static saveNewGameDate(minute: number = 0, hour: number = 0, day: number = 1, month: number = 1, year: number = 0) {
    let timeData = {
      minute: minute,
      hour: hour,
      day: day,
      month: month,
      year: year
    }

    UI_log(`Company Established: ${Time.getFormatedDate(day, month, year)} @${Time.getFormatedTime(hour, minute)}`);
    localStorage.setItem(INIT_TIME, JSON.stringify(timeData));
    // console.log('hmmm', JSON.stringify(timeData));

  }

  static loadNewGameDate() {
    let timeData = localStorage.getItem(INIT_TIME);
    if (timeData === null) return null;

    return JSON.parse(timeData);
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
      resource.updatedFromSave(true, this.getLastOfflineTime());
    }
  }

  static saveLog() {
    localStorage.setItem(LOGS, document.getElementById('log-screen').innerHTML);
  }

  static getLastOfflineTime(): number {
    let lastTime: any = localStorage.getItem(LAST_SAVE_TIME);

    if (lastTime == null) return null;

    let currentTime = new Date().getTime();
    let totalDurationOffline = currentTime - Number(lastTime);

    return totalDurationOffline;
  }
  static loadLog(): boolean {
    let logScreenContainer = document.getElementById("log-screen-container");
    let savedLog = localStorage.getItem(LOGS);

    let set = false;
    if (savedLog) {
      document.getElementById("log-screen").innerHTML = savedLog;
      set = true;
    }
    logScreenContainer.scrollTop = logScreenContainer.scrollHeight;
    return set;
  }
}