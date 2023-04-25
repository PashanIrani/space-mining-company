import { Resource, GroupResource, AllResourceDefination } from "./resource"
import { TIME_TICK_SPEED, Time } from './time'
import './styles/index.scss';
import { PacingManger } from "./pacingManager";
import { Store, StoreItem } from "./store";
import { UI_log, UI_showWindow } from "./ui";
import { SaveSystem } from "./saveSystem";
import { StaffMember, StaffResource } from "./staff";

// Check game version, if not equal, alert and reset game to avoid error
// TODO: Once game is in stable version, remove this.
export const GAME_VERSION = 1;
const savedVersion = localStorage.getItem('version');
if (savedVersion != null && JSON.parse(savedVersion) != GAME_VERSION) {
  alert("Game should will reset now since game versions don't match");
  localStorage.clear();
  location.reload();
}

const DEV: boolean = false;
// save current version
if (savedVersion == null) {
  localStorage.setItem('version', JSON.stringify(GAME_VERSION));
}

if (!SaveSystem.loadLog()) {
  UI_log("Welcome to Space Mining Company!");
}

// INIT TIME
const currentDate = new Date();

const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based index, so add 1
const currentDay = currentDate.getDate();
const currentHour = currentDate.getHours();
const currentMinute = currentDate.getMinutes();

Time.setInitTime(currentMinute, currentHour, currentDay, currentMonth, currentYear);


const labor = new Resource({
  name: 'labor',
  label: 'Labor',
  amount: 0,
  generateAmount: DEV ? 100 : 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 100,
  holdToGenerateAmount: 0,
  timeCost: 1,
  enabled: true
});

const coffee = new Resource({
  name: 'coffee',
  label: 'Coffee',
  amount: 0,
  generateAmount: 1,
  capacity: 5,
  costs: [{ resource: 'labor', amount: 2 }, { resource: 'funds', amount: 10 }],
  timeToBuildMs: 10000,
  holdToGenerateAmount: 0,
  timeCost: 5,
  enabled: false,
});

const energyGroup = new GroupResource({
  name: 'energyGroup',
  label: 'Energy',
  groupResources: [{ resource: labor, multiplier: 1 }]
});

const funds = new Resource({
  name: 'funds',
  label: 'Funds',
  amount: 0,
  generateAmount: 1,
  capacity: 10,
  costs: [{ resource: 'energyGroup', amount: 15 }],
  timeToBuildMs: DEV ? 300 : 3000,
  enabled: false,
  timeCost: 10,
});

export const staff = new StaffResource({
  name: 'staff',
  label: 'Staff',
  amount: 0,
  generateAmount: 1,
  capacity: 5,
  costs: [{ resource: 'funds', amount: DEV ? 1 : 100 }],
  timeToBuildMs: DEV ? 350 : 35000,
  enabled: false,
  timeCost: 5,
});

export const ALL_RESOURCES: AllResourceDefination = { labor, funds, coffee, energyGroup, staff };

export const WorkableResourceList: string[] = ['labor', 'funds', 'coffee'];

PacingManger.init(ALL_RESOURCES);

const store = new Store({
  'enable-stats': {
    displayName: 'System Update',
    displayDescription: "Updates OS to show system stats.",
    costs: [{ resource: 'energyGroup', amount: 100 }, { resource: 'funds', amount: 6 }],
    onPurchase: () => {
      PacingManger.showWindow('stats');
      UI_log('The system has been updated, and you are now able to access information about it.');
    },
    purchased: false,
    dependsOn: null,
  },
  'enable-hiring': {
    displayName: 'Recruit Help',
    displayDescription: "Will enable the ablity to hire.",
    costs: [{ resource: 'energyGroup', amount: DEV ? 1 : 100 }, { resource: 'funds', amount: DEV ? 2 : 200 }],
    onPurchase: () => {
      UI_showWindow('staff');
      UI_log("Recruitment program installed.");
    },
    purchased: false,
    dependsOn: 'enable-stats',
  }, 'energy-enableHoldGeneration': {
    displayName: 'Anti-Carpal Tunnel Cream',
    displayDescription: "Allows for sustained holding of generation buttons. (3 clicks/sec)",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: () => {
      for (const key in ALL_RESOURCES) {
        let resource = ALL_RESOURCES[key];
        resource.holdToGenerateAmount = 2;
      }
    },
    purchased: false,
    dependsOn: 'enable-stats',
  },
  'funds-gen': {
    displayName: 'Funds Boost',
    displayDescription: "Doubles the amount of [funds] generated.",
    costs: [{ resource: 'funds', amount: 5 }, { resource: 'energyGroup', amount: 25 }],
    onPurchase: (self: StoreItem) => {
      funds.generateAmount *= 2;
      self.level += 1;
      self.displayName = `Funds Boost (${self.level})`;
      self.costs[0].amount *= 1.2;
      self.costs[1].amount *= 1.2;
      self.purchased = false;
    },
    purchased: false,
    dependsOn: 'enable-stats',
    level: 0,
  },
  'labor-genAmount': {
    displayName: 'Amplify Labor',
    displayDescription: "Doubles the amount of [labor] generated.",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'energyGroup', amount: 50 }],
    onPurchase: (self: StoreItem) => {
      labor.generateAmount *= 2;
      self.level += 1;
      debugger
      self.displayName = `Amplify Labor Boost (${self.level})`;
      self.costs[0].amount *= 1.2;
      self.costs[1].amount *= 1.2;
      self.purchased = false;
    },
    purchased: false,
    dependsOn: 'enable-stats',
    level: 0
  },
  'enableCoffee': {
    displayName: 'Coffee Machine',
    displayDescription: "Purchase a coffee machine. Enables generation of [coffee].",
    costs: [{ resource: 'funds', amount: 50 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: (self: StoreItem) => {
      coffee.enabled = true;
      PacingManger.showWindow(coffee.name);
      energyGroup.drawCompositionDetails();
      self.level += 1;
      self.displayName = `Coffee Machine (${self.level})`;
      self.costs[0].amount *= 1.2;
      self.costs[1].amount *= 1.2;
      self.purchased = false;
      UI_log("Coffee Machine Purchased!");
    },
    purchased: false,
    dependsOn: 'enable-hiring',
    level: 0
  }
});

Store.reDraw();
PacingManger.check();

SaveSystem.startAutoSaving();
// add callbacks to each resource
for (const key in ALL_RESOURCES) {
  let resource = ALL_RESOURCES[key];
  resource.init();
  resource.onAmountUpdate(() => {
    Store.reDraw();
    PacingManger.check();
  })
}

setTimeout(() => {
  Store.reDraw();
}, 10);

