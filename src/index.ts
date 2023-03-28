import { Resource, GroupResource } from "./resource"
import { Time } from './time'
import { doGlitchEffect } from "./ui"
import './styles/index.scss';
import { PacingManger } from "./pacingManager";

const energy = new Resource({
  name: 'energy',
  amount: 0,
  generateAmount: 1,
  capacity: 100,
  costs: [],
  timeToBuildMs: 0,
});

const funds = new Resource({
  name: 'funds',
  amount: 0,
  generateAmount: 1,
  costs: [{ resource: energy, amount: 1 }],
  timeToBuildMs: 0,
});

for (let i = 0; i < 12; i++) {
  doGlitchEffect();
}

const pm = new PacingManger({ energy, funds });
setInterval(pm.check.bind(pm), 1000);
