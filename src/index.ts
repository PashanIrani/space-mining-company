import { Resource } from "./resource"
import { Time } from './time'

// const energy = new Resource({ name: 'energy', 0, 10, []});
// const funds = new Resource('funds', 0, 100, [{ resource: energy, amount: 5 }]);


const timeDelta = new Resource({
  name: 'timeDelta',
  amount: 0,
  generateAmount: 1,
  costs: [],
  timeToBuildMs: 0
})

const labor = new Resource({
  name: 'labor',
  amount: 0,
  generateAmount: 1,
  capacity: 8,
  costs: [{ resource: timeDelta, amount: -1 }],
  timeToBuildMs: 0
});

const rest = new Resource({
  name: 'rest',
  amount: 0,
  generateAmount: 0,
  costs: [{ resource: labor, amount: 1 }, { resource: timeDelta, amount: -1 }],
  timeToBuildMs: 0
});

const timeManager = new Time(0, new Date(), timeDelta);