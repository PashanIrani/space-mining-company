import { Resource, GroupResource, AllResourceDefination } from "./resource"
import { TIME_TICK_SPEED, Time } from './time'
import './styles/index.scss';
import { PacingManger } from "./pacingManager";
import { Store, StoreItem } from "./store";
import { UI_log, doGlitchEffect, shakeScreen } from "./ui";

const DEV = true;
const SAVE_ENABLED = true;


UI_log("Welcome to Space Mining Company!");

// INIT TIME
const currentDate = new Date();

const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based index, so add 1
const currentDay = currentDate.getDate();
const currentHour = currentDate.getHours();
const currentMinute = currentDate.getMinutes();

Time.setInitTime(currentMinute, currentHour, currentDay, currentMonth, currentYear, true);
Time.setNewGameTime(currentMinute, currentHour, currentDay, currentMonth, currentYear);



const labor = new Resource({
  name: 'labor',
  label: 'Labor',
  amount: 0,
  generateAmount: 1,
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
  capacity: 1,
  costs: [{ resource: 'labor', amount: 1 }, { resource: 'funds', amount: 2 }],
  timeToBuildMs: 5000,
  holdToGenerateAmount: 0,
  timeCost: 5,
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
  timeToBuildMs: 500,
  enabled: false,
  timeCost: 10,
});


export const ALL_RESOURCES: AllResourceDefination = { labor, funds, coffee, energyGroup };

const pm = new PacingManger(ALL_RESOURCES, SAVE_ENABLED);

const store = new Store({
  'enableStats': {
    displayName: 'System Update',
    displayDescription: "Updates OS to show system stats.",
    costs: [{ resource: 'energyGroup', amount: 15 }],
    onPurchase: () => {
      pm.showWindow('stats');
      UI_log('The system has been updated, and you are now able to access information about it.');
    },
    purchased: false,
    dependsOn: null,
  },
  'enable-hiring': {
    displayName: 'Recruit Help',
    displayDescription: "Will enable the ablity to hire.",
    costs: [{ resource: 'energyGroup', amount: 500 }, { resource: 'funds', amount: 1000 }],
    onPurchase: () => {
      // TODO
      UI_log("Recruitment program installed.");
    },
    purchased: false,
    dependsOn: 'enableStats',
  },
  'profit1': {
    displayName: 'Funds Boost',
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
    displayName: 'Funds Boost (2)',
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
    displayDescription: "Allows for sustained holding of generation buttons. (4 clicks/sec)",
    costs: [{ resource: 'funds', amount: 10 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: () => {
      for (const key in ALL_RESOURCES) {
        let resource = ALL_RESOURCES[key];
        resource.holdToGenerateAmount = 4;
      }
    },
    purchased: false,
    dependsOn: 'enableStats',
  },
  'energy-enableHoldGeneration2': {
    displayName: 'Super Anti-Carpal Tunnel Cream',
    displayDescription: "Doubles the effect. (4 -> 8 clicks/sec)",
    costs: [{ resource: 'funds', amount: 500 }, { resource: 'energyGroup', amount: 250 }],
    onPurchase: () => {
      for (const key in ALL_RESOURCES) {
        let resource = ALL_RESOURCES[key];
        resource.holdToGenerateAmount = 4;
      }
    },
    purchased: false,
    dependsOn: 'increase-labor-generationAmount',
  },
  'increase-labor-generationAmount': {
    displayName: 'Amplify Labor',
    displayDescription: "Doubles the amount of [labor] generated.",
    costs: [{ resource: 'funds', amount: 100 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: () => {
      labor.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'enableStats',
  }, 'increase-labor-generationAmount2': {
    displayName: 'Amplify Labor (2)',
    displayDescription: "Doubles the amount of [labor] generated.",
    costs: [{ resource: 'funds', amount: 250 }, { resource: 'energyGroup', amount: 200 }],
    onPurchase: () => {
      labor.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'increase-labor-generationAmount',
  }, 'increase-labor-generationAmount3': {
    displayName: 'Amplify Labor (3)',
    displayDescription: "Doubles the amount of [labor] generated.",
    costs: [{ resource: 'funds', amount: 500 }, { resource: 'energyGroup', amount: 750 }],
    onPurchase: () => {
      labor.generateAmount *= 2;
    },
    purchased: false,
    dependsOn: 'increase-labor-generationAmount2',
  },
  'enableCoffee': {
    displayName: 'Coffee Machine',
    displayDescription: "Purchase a coffee machine. Enables generation of [coffee].",
    costs: [{ resource: 'funds', amount: 50 }, { resource: 'energyGroup', amount: 100 }],
    onPurchase: () => {
      coffee.enabled = true;
      pm.showWindow(coffee.name);
      energyGroup.drawCompositionDetails();
      UI_log("Coffee Machine Purchased!");
    },
    purchased: false,
    dependsOn: null,
  },
  'coffee-capacity1': {
    displayName: 'Coffee Enjoyer',
    displayDescription: "Become a coffee enjoyer. Increases capacity of [coffee] to 2.",
    costs: [{ resource: 'energyGroup', amount: 115 }],
    onPurchase: () => {
      coffee.capacity = 2;
    },
    purchased: false,
    dependsOn: 'enableCoffee',
  }, 'coffee-capacity2': {
    displayName: 'Coffee Enthusiast',
    displayDescription: "Become a coffee enthusiast. Increases capacity of [coffee] to 5.",
    costs: [{ resource: 'energyGroup', amount: 130 }],
    onPurchase: () => {
      coffee.capacity = 5;
    },
    purchased: false,
    dependsOn: 'coffee-capacity1',
  }, 'coffee-capacity3': {
    displayName: 'Coffee Addict',
    displayDescription: "Become a coffee enthusiast. Increases capacity of [coffee] to 10.",
    costs: [{ resource: 'energyGroup', amount: 175 }],
    onPurchase: () => {
      coffee.capacity = 10;
    },
    purchased: false,
    dependsOn: 'coffee-capacity2',
  }, 'coffee-capacity4': {
    displayName: 'Coffeeholic',
    displayDescription: "Become a Coffeeholic. Increases capacity of [coffee] to 20.",
    costs: [{ resource: 'energyGroup', amount: 250 }],
    onPurchase: () => {
      coffee.capacity = 20;
    },
    purchased: false,
    dependsOn: 'coffee-capacity3',
  }, 'coffee-capacity5': {
    displayName: 'Java Junkie',
    displayDescription: "Become a Java Junkie. Increases capacity of [coffee] to 50.",
    costs: [{ resource: 'energyGroup', amount: 400 }],
    onPurchase: () => {
      coffee.capacity = 50;
    },
    purchased: false,
    dependsOn: 'coffee-capacity4',
  }, 'coffee-capacity6': {
    displayName: 'Coffee Pot',
    displayDescription: "Become a walking, talking coffee pot. Increases capacity of [coffee] to 100.",
    costs: [{ resource: 'energyGroup', amount: 850 }],
    onPurchase: () => {
      coffee.capacity = 100;
    },
    purchased: false,
    dependsOn: 'coffee-capacity5',
  }
});

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

