import { Resource } from "./resource"

// const energy = new Resource({ name: 'energy', 0, 10, []});
// const funds = new Resource('funds', 0, 100, [{ resource: energy, amount: 5 }]);

const energy = new Resource({
  name: 'energy',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: []
})

const funds = new Resource({
  name: 'funds',
  amount: 0,
  generateAmount: 1,
  capacity: null,
  costs: [{ resource: energy, amount: 5 }]
})