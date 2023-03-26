import { Resource } from "./resource"

const energy = new Resource('energy', 0, 100);


setInterval(() => { energy.amount++}, 10);
