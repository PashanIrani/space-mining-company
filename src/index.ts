import { Resource, GroupResource } from "./resource"
import { Time } from './time'
import { doGlitchEffect } from "./ui"
import './styles/index.scss';
import { PacingManger } from "./pacingManager";
import { Store, StoreDefination, StoreItem } from "./store";
const DEV = true;

const currentDate = new Date();

const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based index, so add 1
const currentDay = currentDate.getDate();

const time = new Time(0, 0, currentDay, currentMonth, currentYear);

const energy = new Resource({
  name: 'energy',
  amount: 0,
  generateAmount: DEV ? 100 : 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 0,
  holdToGenerateAmount: 0
});

const funds = new Resource({
  name: 'funds',
  amount: 0,
  generateAmount: 1,
  capacity: 10,
  costs: [{ resource: energy, amount: 10 }],
  timeToBuildMs: 1000,
});

const ALL_RESOURCES = [energy, funds];

const store = new Store({
  'profit1': {
    displayName: 'Capital Boost',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: funds, amount: 10 }, { resource: energy, amount: 25 }],
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
    costs: [{ resource: funds, amount: 20 }, { resource: energy, amount: 50 }],
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
    costs: [{ resource: funds, amount: 40 }, { resource: energy, amount: 100 }],
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
    costs: [{ resource: funds, amount: 80 }, { resource: energy, amount: 200 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'profit3',
    level: 4,
  },
  'energy-enableHoldGeneration': {
    displayName: 'Anti-Carpal Tunnel Cream',
    displayDescription: "Enables [Energy] generation button to be held down. (4 clicks/sec)",
    costs: [{ resource: funds, amount: 9.99 }, { resource: energy, amount: 100 }],
    onPurchase: () => {
      energy.holdToGenerateAmount = 4;
    },
    purchased: false,
    dependsOn: null,
  },
  'energy-increaseGenerationAmount': {
    displayName: 'Motivational Speech',
    displayDescription: "Generate twice as much [Energy].",
    costs: [{ resource: funds, amount: 100 }, { resource: energy, amount: 100 }],
    onPurchase: () => {
      energy.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'energy-enableHoldGeneration',
  },
});

const pm = new PacingManger({ energy, funds });

ALL_RESOURCES.forEach(resource => {
  resource.onAmountUpdate(() => {
    Store.reDraw();
    pm.check();
  })
})
