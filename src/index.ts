import { Resource } from "./resource"

// const energy = new Resource({ name: 'energy', 0, 10, []});
// const funds = new Resource('funds', 0, 100, [{ resource: energy, amount: 5 }]);

const labor = new Resource({
  name: 'labor',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 0
})

const wood = new Resource({
  name: 'wood',
  amount: 0,
  generateAmount: 1,
  capacity: 500,
  costs: [{ resource: labor, amount: 10 }],
  timeToBuildMs: 5000
})

const gold = new Resource({
  name: 'gold',
  amount: 0,
  generateAmount: 5,
  capacity: 100,
  costs: [{ resource: labor, amount: 5 }, { resource: wood, amount: 20 }],
  timeToBuildMs: 5000
})

const food = new Resource({
  name: 'food',
  amount: 0,
  generateAmount: 10,
  capacity: 500,
  costs: [{ resource: labor, amount: 5 }],
  timeToBuildMs: 3000
})

const stone = new Resource({
  name: 'gold',
  amount: 0,
  generateAmount: 2,
  capacity: 200,
  costs: [{ resource: labor, amount: 5 }, { resource: wood, amount: 10 }],
  timeToBuildMs: 7000
})

const iron = new Resource({
  name: 'iron',
  amount: 0,
  generateAmount: 1,
  capacity: 50,
  costs: [{ resource: labor, amount: 5 }, { resource: wood, amount: 10 }, { resource: stone, amount: 5 }],
  timeToBuildMs: 15000
})

const oil = new Resource({
  name: 'oil',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [{ resource: labor, amount: 10 }, { resource: wood, amount: 10 }, { resource: iron, amount: 5 }],
  timeToBuildMs: 20000
})