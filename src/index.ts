import { Resource, GroupResource } from "./resource"
import { Time } from './time'
import { doGlitchEffect } from "./ui"
import './styles/index.scss';
import { PacingManger } from "./pacingManager";
import { Store } from "./store";
const DEV = false;

const currentDate = new Date();

const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based index, so add 1
const currentDay = currentDate.getDate();

const time = new Time(0, 0, currentDay, currentMonth, currentYear);

const energy = new Resource({
  name: 'energy',
  amount: 0,
  generateAmount: 5,
  capacity: 100,
  costs: [],
  timeToBuildMs: 0,
  holdToGenerateAmount: 0
});

const funds = new Resource({
  name: 'funds',
  amount: 0,
  generateAmount: DEV ? 1000 : 1,
  costs: [{ resource: energy, amount: 10 }],
  timeToBuildMs: DEV ? 10 : 1000,
});

const ALL_RESOURCES = [energy, funds];

const store = new Store({
  'profit1': {
    displayName: 'Profit Duplication',
    displayDescription: "Results in a doubling of profits.",
    costs: [{ resource: funds, amount: 20 }, { resource: energy, amount: 100 }],
    onPurchase: () => {
      funds.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: null,
  },
  'enableEnergyHoldGeneration': {
    displayName: 'Profit Duplicdasasdasation',
    displayDescription: "Results in a doubling of profits.",
    costs: [{ resource: funds, amount: 20 }, { resource: energy, amount: 100 }],
    onPurchase: () => {
      energy.holdToGenerateAmount = 4;
    },
    purchased: false,
    dependsOn: null,
  },
});

const pm = new PacingManger({ energy, funds });

ALL_RESOURCES.forEach(resource => {
  resource.onAmountUpdate(() => {
    Store.reDraw();
    pm.check();
  })
})
