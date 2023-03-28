import { Resource, GroupResource } from "./resource"
import { Time } from './time'
import { applyRandomClass } from "./ui"
// const energy = new Resource({ name: 'energy', 0, 10, []});
// const funds = new Resource('funds', 0, 100, [{ resource: energy, amount: 5 }]);


const timeDelta = new Resource({
  name: 'timeDelta',
  amount: 0,
  generateAmount: 1,
  costs: [],
  timeToBuildMs: 0
})

const energy = new Resource({
  name: 'energy',
  amount: 0,
  generateAmount: 1,
  capacity: 8,
  costs: [],
  timeToBuildMs: 0,
  afterDeduction: () => {
    console.log('brh');

    timeDelta.amount += 1;
  }
});

const energy2 = new Resource({
  name: 'energy2',
  amount: 0,
  generateAmount: 1,
  capacity: 8,
  costs: [],
  timeToBuildMs: 0,
});

const humans = new Resource({
  name: 'humans',
  amount: 1,
  generateAmount: 1,
  costs: [],
  timeToBuildMs: 0,
});

const workHours = new GroupResource({
  name: 'workHours',
  groupResources: [energy, energy2]
});

const humanWorkHours = new Resource({
  name: 'humanWorkHours',
  amount: 0,
  generateAmount: 1,
  capacity: 40 * humans.amount, // todo Make sure this is updated when humans GO UP!
  costs: [{ resource: workHours, amount: 1 }],
  timeToBuildMs: 10
});

const timeManager = new Time(0, new Date(), timeDelta);

for (let i = 0; i < 12; i++) {
  applyRandomClass();
}