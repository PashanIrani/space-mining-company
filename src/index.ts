import { Resource, GroupResource, AllResourceDefination } from "./resource"
import { Time } from './time'
import './styles/index.scss';
import { PacingManger } from "./pacingManager";
import { Store, StoreItem } from "./store";
import { SaveSystem, beginSaving } from "./saveSystem";

const DEV = true;
const SAVE_ENABLED = true;

const savedTimeData = SAVE_ENABLED ? SaveSystem.loadTime() : null;

if (savedTimeData) {
  Time.setInitTime(savedTimeData.minute, savedTimeData.hour, savedTimeData.day, savedTimeData.month, savedTimeData.year);
} else {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based index, so add 1
  const currentDay = currentDate.getDate();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  SaveSystem.saveNewGameDate(currentMinute, currentHour, currentDay, currentMonth, currentYear);
  Time.setInitTime(currentMinute, currentHour, currentDay, currentMonth, currentYear);
}

let newGameDate = SaveSystem.loadNewGameDate();
Time.setNewGameTime(newGameDate.minute, newGameDate.hour, newGameDate.day, newGameDate.month, newGameDate.year);


const labor = new Resource({
  name: 'labor',
  label: 'Labor',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 0,
  holdToGenerateAmount: 0,
  timeCost: 1,
  enabled: true
});

const coffee = new Resource({
  name: 'coffee',
  label: 'Coffee',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [{ resource: 'labor', amount: 1 }, { resource: 'funds', amount: 2 }],
  timeToBuildMs: 0,
  holdToGenerateAmount: 0,
  timeCost: 1,
  enabled: false,
});

const energyGroup = new GroupResource({
  name: 'energyGroup',
  label: 'Energy',
  groupResources: [{ resource: labor, multiplier: 1 }, { resource: coffee, multiplier: 15 }]
});

const funds = new Resource({
  name: 'funds',
  label: 'Funds',
  amount: 0,
  generateAmount: 1,
  capacity: 1000,
  costs: [{ resource: 'energyGroup', amount: 10 }],
  timeToBuildMs: 1000,
  enabled: false,
});


export const ALL_RESOURCES: AllResourceDefination = { labor, funds, coffee, energyGroup };

const pm = new PacingManger(ALL_RESOURCES, SAVE_ENABLED);

const store = new Store({
  'profit1': {
    displayName: 'Capital Boost',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'energyGroup', amount: 25 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: null,
    level: 1,
  },
  'profit2': {
    displayName: 'Capital Boost (2)',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: 'funds', amount: 20 }, { resource: 'energyGroup', amount: 50 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'profit1',
    level: 2,
  },
  'energy-enableHoldGeneration': {
    displayName: 'Anti-Carpal Tunnel Cream',
    displayDescription: "Enables generation button to be held down. (10 clicks/sec)",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: () => {
      for (const key in ALL_RESOURCES) {
        let resource = ALL_RESOURCES[key];
        resource.holdToGenerateAmount = 10;
      }
    },
    purchased: false,
    dependsOn: null,
  },
  'enableStats': {
    displayName: 'System Update',
    displayDescription: "Updates OS to show system stats.",
    costs: [{ resource: 'funds', amount: 1 }, { resource: 'energyGroup', amount: 1 }],
    onPurchase: () => {
      pm.showWindow('stats');
    },
    purchased: false,
    dependsOn: null,
  },
  'enableCoffee': {
    displayName: 'Coffee Machine',
    displayDescription: "Purchase a coffee machine. Enables generation of [coffee].",
    costs: [{ resource: 'funds', amount: 1 }, { resource: 'energyGroup', amount: 1 }],
    onPurchase: () => {
      coffee.enabled = true;
      pm.showWindow(coffee.name);
    },
    purchased: false,
    dependsOn: null,
  }
});



if (SAVE_ENABLED) {
  SaveSystem.loadResources(ALL_RESOURCES);
  SaveSystem.loadStoreItems();
}

Store.reDraw();
pm.check();

// add callbacks to each resource
for (const key in ALL_RESOURCES) {
  let resource = ALL_RESOURCES[key];
  resource.init();
  resource.onAmountUpdate(() => {
    Store.reDraw();
    pm.check();
  })
}

beginSaving();

