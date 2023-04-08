import { Resource, GroupResource, AllResourceDefination } from "./resource"
import { Time } from './time'
import './styles/index.scss';
import { PacingManger } from "./pacingManager";
import { Store } from "./store";
import { SaveSystem, beginSaving } from "./saveSystem";

const DEV = true;
const SAVE_ENABLED = true;

const savedTimeData = SAVE_ENABLED ? SaveSystem.loadTime() : null;

if (savedTimeData) {
  Time.setInitTime(savedTimeData.minute, savedTimeData.hour, savedTimeData.day, savedTimeData.month, savedTimeData.year);
} else {
  Time.setInitTime(0, 0, 0, 1, 0);
}

const labor = new Resource({
  name: 'labor',
  label: 'Labor',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 0,
  holdToGenerateAmount: 0,
  timeCost: 1
});

const coffee = new Resource({
  name: 'coffee',
  label: 'coffee',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [{ resource: 'labor', amount: 1 }, { resource: 'funds', amount: 2 }],
  timeToBuildMs: 0,
  holdToGenerateAmount: 0,
  timeCost: 1
});

const energyGroup = new GroupResource({
  name: 'energyGroup',
  label: 'Energy',
  groupResources: [{ resource: labor, multiplier: 1 }, { resource: coffee, multiplier: 10 }]
});

const funds = new Resource({
  name: 'funds',
  label: 'funds',
  amount: 0,
  generateAmount: 1,
  capacity: 1000,
  costs: [{ resource: 'energyGroup', amount: 10 }],
  timeToBuildMs: 1000,
});


export const ALL_RESOURCES: AllResourceDefination = { labor, funds, coffee, energyGroup };

const store = new Store({
  'profit1': {
    displayName: 'Capital Boost',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'labor', amount: 25 }],
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
    costs: [{ resource: 'funds', amount: 20 }, { resource: 'labor', amount: 50 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'profit1',
    level: 2,
  },
  'profit3': {
    displayName: 'Capital Boost (3)',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: 'funds', amount: 40 }, { resource: 'labor', amount: 100 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'profit2',
    level: 3,
  },
  'profit4': {
    displayName: 'Capital Boost (4)',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: 'funds', amount: 80 }, { resource: 'labor', amount: 200 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'profit3',
    level: 4,
  },
  'energy-enableHoldGeneration': {
    displayName: 'Anti-Carpal Tunnel Cream',
    displayDescription: "Enables generation button to be held down. (10 clicks/sec)",
    costs: [{ resource: 'funds', amount: 9.99 }, { resource: 'labor', amount: 100 }],
    onPurchase: () => {
      for (const key in ALL_RESOURCES) {
        let resource = ALL_RESOURCES[key];
        resource.holdToGenerateAmount = 10;
      }
    },
    purchased: false,
    dependsOn: null,
  },
  'energy-increaseGenerationAmount': {
    displayName: 'Motivational Speech',
    displayDescription: "Generate twice as much [Energy].",
    costs: [{ resource: 'funds', amount: 100 }, { resource: 'labor', amount: 100 }],
    onPurchase: () => {
      labor.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'energy-enableHoldGeneration',
  },
});


const pm = new PacingManger(ALL_RESOURCES, SAVE_ENABLED);

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
    console.log(`${key} redraw`);

    Store.reDraw();
    pm.check();
  })
}

beginSaving();

