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
  generateAmount: DEV ? 10 : 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 100,
  holdToGenerateAmount: 0,
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
  capacity: 1000,
  costs: [{ resource: 'energyGroup', amount: 15 }],
  timeToBuildMs: DEV ? 300 : 3000,
  enabled: false,
});

export const staff = new StaffResource({
  name: 'staff',
  label: 'Staff',
  amount: 0,
  generateAmount: 1,
  capacity: 5,
  costs: [{ resource: 'funds', amount: DEV ? 1 : 50 }],
  timeToBuildMs: DEV ? 350 : 10000,
  enabled: false,
});

export const ALL_RESOURCES: AllResourceDefination = { labor, funds, coffee, energyGroup, staff };

export const WorkableResourceList: string[] = ['labor'];

PacingManger.init(ALL_RESOURCES);

const store = new Store({
  'main-enable-stats': {
    displayName: 'System Update',
    displayDescription: "Updates OS to show system stats.",
    costs: [{ resource: 'funds', amount: 6 }],
    onPurchase: () => {
      PacingManger.showWindow('stats');
      UI_log('The system has been updated, and you are now able to access information about it.');
    },
    purchased: false,
    dependsOn: null,
  },
  'main-enable-hiring': {
    displayName: 'Recruit Help',
    displayDescription: "Will enable the ablity to hire.",
    costs: [{ resource: 'energyGroup', amount: DEV ? 1 : 100 }, { resource: 'funds', amount: DEV ? 2 : 25 }],
    onPurchase: () => {
      PacingManger.showWindow('staff');
      UI_log("Recruitment program installed.");
    },
    purchased: false,
    dependsOn: 'main-enable-stats',
  }, 'main-energy-enableHoldGeneration': {
    displayName: 'Anti-Carpal Tunnel Cream',
    displayDescription: "Allows for sustained holding of generation buttons. (5 clicks/sec)",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: () => {
      for (const key in ALL_RESOURCES) {
        let resource = ALL_RESOURCES[key];
        resource.holdToGenerateAmount = 5;
      }
    },
    purchased: false,
    dependsOn: 'main-enable-stats',
  },
  'funds-gen': {
    displayName: 'Funds Boost',
    displayDescription: "Additional 3% of [funds] generated.",
    costs: [{ resource: 'funds', amount: 0.2 }, { resource: 'energyGroup', amount: 1 }],
    onPurchase: (self: StoreItem) => {
      funds.generateAmount *= 1.03;
      self.level += 1;
      self.displayName = `Funds Boost (${self.level})`;
      self.costs[0].amount *= 1.05;
      self.costs[1].amount *= 1.05;
      self.purchased = false;
    },
    purchased: false,
    dependsOn: 'main-enable-stats',
    level: 0,
  },
  'labor-genAmount': {
    displayName: 'Amplify Labor',
    displayDescription: "Additional 3% of [labor] generated.",
    costs: [{ resource: 'funds', amount: 0.35 }, { resource: 'energyGroup', amount: 2 }],
    onPurchase: (self: StoreItem) => {
      labor.generateAmount *= 1.03;
      self.level += 1;
      self.displayName = `Amplify Labor Boost (${self.level})`;
      self.costs[0].amount *= 1.05;
      self.costs[1].amount *= 1.05;
      self.purchased = false;
    },
    purchased: false,
    dependsOn: 'main-enable-stats',
    level: 0
  },
  'labor-capacity': {
    displayName: 'Dedication To the Company',
    displayDescription: "Additional 25% of [labor] capacity.",
    costs: [{ resource: 'funds', amount: 20 }, { resource: 'energyGroup', amount: 35 }],
    onPurchase: (self: StoreItem) => {
      labor.capacity *= 1.25;
      self.level += 1;
      self.displayName = `Dedication To the Company (${self.level})`;
      self.costs[0].amount *= 2.75;
      self.costs[1].amount *= 2.72;
      self.purchased = false;
    },
    purchased: false,
    dependsOn: 'main-enable-stats',
    level: 0
  },
  'main-enable-coffee': {
    displayName: 'Coffee Machine',
    displayDescription: "Purchase a coffee machine. Enables generation of [coffee].",
    costs: [{ resource: 'funds', amount: 50 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: (self: StoreItem) => {
      coffee.enabled = true;
      PacingManger.showWindow(coffee.name);
      energyGroup.drawCompositionDetails();
      UI_log("Coffee Machine Purchased!");
    },
    purchased: false,
    dependsOn: 'main-enable-hiring',
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

