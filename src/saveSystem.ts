import { ALL_RESOURCES, staff } from ".";
import { Cost } from "./cost";
import { PacingManger } from "./pacingManager";
import { GroupResource } from "./resource";
import { StaffMember, TICKS_PER_SEC } from "./staff";
import { Store, StoreItem } from "./store";
import { Time } from "./time";
import { UI_displayText } from "./ui";

const RESOURCES = "resources";
const LAST_SAVE = "last_save_time";
const STORE_ITEMS = "storeItems";
const STORE_DATA = "storeData";
const INTRODUCED_WINDOWS = "introducedWindows";
const TIME = "timeData";
const NEW_GAME_TIME = "newGametimeData";
const LOGS = "logs";
const STAFF = "staff";
const AUTOSAVEFREQ = "autoSaveFreq";

interface ResourceData {
  amount: number,
  generateAmount: number,
  capacity: number,
  timeToBuildMs: number,
  holdToGenerateAmount: number,
  buildQueue: number[],
  buildStatus: number,
  timeCost: number,
  enabled: boolean,
}

interface ResourceDataCollection {
  [key: string]: ResourceData
}

export class SaveSystem {
  static AUTO_SAVE_FREQ = 10000; // can only be whole seconds, not .5s 
  static lastSaveTime: number;



  static startAutoSaving() {
    var loadingScreen = document.createElement("div");
    loadingScreen.className = "loading-screen";
    var loadingText = document.createElement("p");
    loadingText.textContent = "Loading...";
    loadingScreen.appendChild(loadingText);
    document.body.appendChild(loadingScreen);

    this.loadLastSaveTime();
    this.loadResources();
    this.loadStoreItems();
    this.loadIntroducedWindows();
    this.loadTime();
    this.loadStaff();


    this.timeTillNextSave = this.getSavedAutoSaveFreq() || this.AUTO_SAVE_FREQ;

    loadingScreen.parentNode.removeChild(loadingScreen);

  }

  static getSavedAutoSaveFreq(): number {
    const autosaveFreqString = localStorage.getItem(AUTOSAVEFREQ);
    const autosaveFreq = parseInt(autosaveFreqString, 10);

    // Check if parsing was successful
    if (!isNaN(autosaveFreq)) {
      // Use the parsed number
      return autosaveFreq;
    }

    return null;
  }

  static get timeTillNextSave(): number {
    return this.AUTO_SAVE_FREQ;
  }

  static staticSaveInterval: NodeJS.Timeout;
  static staticSaveTimerInterval: NodeJS.Timeout;

  static set timeTillNextSave(value: number) {
    this.AUTO_SAVE_FREQ = value;
    let timeTillNextSave = this.AUTO_SAVE_FREQ;

    clearInterval(this.staticSaveTimerInterval);
    clearInterval(this.staticSaveInterval);

    this.displaySecTillNextSave(timeTillNextSave);
    this.staticSaveTimerInterval = setInterval(() => {
      timeTillNextSave -= 1000;
      if (timeTillNextSave <= 0) timeTillNextSave = this.AUTO_SAVE_FREQ;
      this.displaySecTillNextSave(timeTillNextSave);
    }, 1000);

    this.staticSaveInterval = setInterval(() => {
      this.saveAll();

    }, this.AUTO_SAVE_FREQ);
  }

  static displaySecTillNextSave(timeTillNextSave: number) {
    UI_displayText('save', 'time-till-next-save', `${timeTillNextSave / 1000} `)
    UI_displayText('save', 'backup-status', `${timeTillNextSave === this.AUTO_SAVE_FREQ ? '[Backup in progress]' : '[Backup pending]'}`)
  }

  static saveAll() {
    this.saveResources();
    this.saveStoreItems();
    this.saveIntroducedWindows();
    this.saveTime();
    this.saveLog();
    this.saveStaff();

    localStorage.setItem(AUTOSAVEFREQ, this.AUTO_SAVE_FREQ + '');

    // Save current Time
    localStorage.setItem(LAST_SAVE, new Date().getTime() + "");
    console.log('Saved.');
  }

  static saveResources() {
    let resourceData: ResourceDataCollection = {};

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
        timeCost: resource.timeCost,
        enabled: resource.enabled,
      }
    }

    localStorage.setItem(RESOURCES, JSON.stringify(resourceData));
  }

  static loadLastSaveTime() {
    let lastSave = localStorage.getItem(LAST_SAVE);
    if (lastSave == null) {
      this.lastSaveTime = new Date().getTime();
    } else {
      this.lastSaveTime = Number(lastSave);
    }

  }
  static loadResources() {

    const resourceDataString = localStorage.getItem(RESOURCES);
    if (resourceDataString == null) {
      return;
    }

    const resourceData = JSON.parse(resourceDataString);

    for (const key in resourceData) {
      // Calculate how much of the Build Queue is completed
      // this.advanceBuildQueue(resourceData[key], this.getOfflineMs());

      // Add data to game
      ALL_RESOURCES[key].capacity = resourceData[key].capacity;
      ALL_RESOURCES[key].generateAmount = resourceData[key].generateAmount;
      ALL_RESOURCES[key].timeToBuildMs = resourceData[key].timeToBuildMs;
      ALL_RESOURCES[key].holdToGenerateAmount = resourceData[key].holdToGenerateAmount;
      ALL_RESOURCES[key].buildQueue = resourceData[key].buildQueue;
      ALL_RESOURCES[key].buildStatus = resourceData[key].buildStatus;
      ALL_RESOURCES[key].timeCost = resourceData[key].timeCost;
      ALL_RESOURCES[key].amount = resourceData[key].amount;
      ALL_RESOURCES[key].enabled = resourceData[key].enabled;
    }


  }

  static saveStoreItems() {
    let purchasedItemsKeys = [];
    let itemData: {
      [key: string]:
      {
        costs: Cost[],
        displayName: string,
        level: number
      }
    } = {};

    for (const key in Store.items) {
      if (Store.items[key].purchased) {
        purchasedItemsKeys.push(key);
      }

      itemData[key] = {
        costs: Store.items[key].costs,
        displayName: Store.items[key].displayName,
        level: Store.items[key].level
      }
    }

    localStorage.setItem(STORE_ITEMS, JSON.stringify(purchasedItemsKeys));
    localStorage.setItem(STORE_DATA, JSON.stringify(itemData));
  }

  static loadStoreItems() {
    let purchasedStoreItemsData = localStorage.getItem(STORE_ITEMS);
    if (purchasedStoreItemsData === null) return;

    purchasedStoreItemsData = JSON.parse(purchasedStoreItemsData);

    for (let i = 0; i < purchasedStoreItemsData.length; i++) {
      const purchasedItem = purchasedStoreItemsData[i];
      Store.items[purchasedItem].purchased = true;
    }

    let storeDataString = localStorage.getItem(STORE_DATA);
    if (storeDataString === null) return;

    let storeData = JSON.parse(storeDataString);

    for (const key in Store.items) {
      Store.items[key].costs = storeData[key].costs;
      Store.items[key].displayName = storeData[key].displayName;
      Store.items[key].level = storeData[key].level;
    }

    Store.reDraw();
  }


  static saveIntroducedWindows() {
    localStorage.setItem(INTRODUCED_WINDOWS, JSON.stringify(PacingManger.introducedWindows));
  }

  static loadIntroducedWindows() {
    let introducedWindows = localStorage.getItem(INTRODUCED_WINDOWS);
    if (introducedWindows) {
      PacingManger.introducedWindows = JSON.parse(introducedWindows);
      PacingManger.check();
    }
  }

  static saveTime() {
    let timeData = {
      minute: Time.minute,
      hour: Time.hour,
      day: Time.day,
      month: Time.month,
      year: Time.year
    }

    if (this.isNewGame()) {
      localStorage.setItem(NEW_GAME_TIME, JSON.stringify(timeData));
    }

    localStorage.setItem(TIME, JSON.stringify(timeData));
  }

  static loadTime() {
    let timeDataString = localStorage.getItem(TIME);
    if (timeDataString === null) return;

    const timeData = JSON.parse(timeDataString);
    Time.minute = timeData.minute;
    Time.hour = timeData.hour;
    Time.day = timeData.day;
    Time.month = timeData.month;
    Time.year = timeData.year;

    let newGameTimeDataString = localStorage.getItem(NEW_GAME_TIME);
    if (newGameTimeDataString === null) return;

    const newGameTime = JSON.parse(newGameTimeDataString);
    Time.setNewGameTime(newGameTime.minute, newGameTime.hour, newGameTime.day, newGameTime.month, newGameTime.year);
  }

  static saveLog() {
    localStorage.setItem(LOGS, document.getElementById('log-screen').innerHTML);
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

  static saveStaff() {
    let data: any[] = [];
    staff.members.forEach(staff => {
      data.push({
        id: staff.id,
        gender: staff.gender,
        name: staff.name,
        efficiency: staff.efficiency,
        assignment: staff.assignment?.name,
        birthdate: { day: staff.birthDate.day, month: staff.birthDate.month, year: staff.birthDate.year },
        pic: staff.pic
      })
    });

    localStorage.setItem(STAFF, JSON.stringify(data));
  }

  static loadStaff() {
    let savedMembers = localStorage.getItem(STAFF);
    if (savedMembers) {
      let details: any[] = JSON.parse(savedMembers);
      let members: StaffMember[] = [];
      details.forEach(detail => {
        members.push(new StaffMember(detail.id, detail.efficiency, detail.gender, detail.name, detail.assignment, detail.birthdate, detail.pic));
      })
      staff.members = members;
    }

    // this.advanceStaffWork(this.getOfflineMs());
  }

  static isNewGame(): boolean {
    return localStorage.getItem(LAST_SAVE) == null;
  }


  static getOfflineMs() {
    const now = new Date().getTime();
    return now - this.lastSaveTime;
  }

  static advanceStaffWork(ms: number) {
    let totalTicks = TICKS_PER_SEC * (ms / 1000);

    staff.members.forEach(staff => {
      console.log(`Number of ticks for staff done offline: ${totalTicks}`);

      for (let i = 0; i < totalTicks; i++) {
        staff.perTickAction();
      }
    });
  }
  // Advances build Queue
  static advanceBuildQueue(resourceData: ResourceData, ms: number) {
    let totalTimeCost = 0;

    while (resourceData.buildQueue.length > 0 && ms > 0) {
      let timeNeededForCurrent = (1 - resourceData.buildStatus) * resourceData.timeToBuildMs; // get the number of MS needed for current build
      ms -= timeNeededForCurrent;

      // partial build
      if (ms < 0) {
        let percentageBuilt = 1 - ((ms * -1) / timeNeededForCurrent);
        resourceData.buildStatus += percentageBuilt;
        totalTimeCost += resourceData.timeCost * percentageBuilt;
        ms = 0; // done
      } else {
        totalTimeCost += resourceData.timeCost * (1 - resourceData.buildStatus);
        resourceData.buildStatus = 0; // built
        resourceData.amount += resourceData.buildQueue.shift();
      }
    }

    Time.minute += totalTimeCost;
  }

}