import { ALL_RESOURCES, WorkableResourceList } from ".";
import { Cost_getCostDisplayString } from "./cost";
import { formatNumberToString, randomIntFromInterval } from "./helpers";
import { Resource_canAffordGeneration } from "./resource";
import { StaffMember } from "./staff";
import { Store, StoreDefination } from "./store";
import { Time } from "./time";

export function UI_displayValue(name: string, valueType: string, value: number, decimals: number = 0, charLength: number = -1) {
  if (value !== 0 && !value)
    return;

  const elements = document.querySelectorAll(`.${name}-${valueType}`);

  elements.forEach(element => {
    element.innerHTML = formatNumberToString(value, decimals, charLength);
  });
}

export function UI_displayText(name: string, valueType: string, text: string) {
  const elements = document.querySelectorAll(`.${name}-${valueType}`);

  elements.forEach(element => {
    element.innerHTML = text;
  });
}

export function UI_updateProgressBar(name: string, amount: number = 0, capacity: number = 1) {
  const elements = document.querySelectorAll(`.${name}-progress-bar`);

  elements.forEach(element => {
    element.innerHTML = `<progress max="${capacity}" value="${amount}"></progress>`;
  });
}
// Shows HTML element with id of `name`-window
export function UI_showWindow(name: string) {
  const element = document.getElementById(`${name}-window`);

  if (element) {
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    element.style.position = 'static';
  }

}
// Hides HTML element with id of `name`-window
export function UI_hideWindow(name: string) {
  const element = document.getElementById(`${name}-window`);

  if (element) {
    element.style.visibility = 'hidden';
    element.style.opacity = '0';
    element.style.position = 'absolute';
  }
}

let lastStoreState: {
  [key: string]: {
    disbaled: boolean,
    cost: string,
    visible: boolean,
    name: string,
  }
} = null;

export function UI_consoleFullScreen() {
  const element = document.getElementById(`log-screen-container`);

  element.classList.add('full-screen')
  element.scrollTop = element.scrollHeight;

}

export function UI_consoleWindowedScreen() {
  const element = document.getElementById(`log-screen-container`);
  element.classList.remove('full-screen');
  element.scrollTop = element.scrollHeight;
}

export function UI_drawStore(storeItems: StoreDefination) {


  // Draw First Time
  if (lastStoreState == null) {
    lastStoreState = {};

    // clear all containers
    for (const key in storeItems) {
      const container = document.getElementById(`${key.split('-')[0]}-store-content-container`);
      if (!container) continue;
      container.innerHTML = '';
    }

    for (const key in storeItems) {

      const container = document.getElementById(`${key.split('-')[0]}-store-content-container`);
      console.log(`${key.split('-')[0]}-store-content-container`, container);

      if (!container) continue;
      lastStoreState[key] = { visible: false, cost: '', disbaled: false, name: '' };

      if (storeItems[key].purchased) continue;
      if (storeItems[key].dependsOn && !storeItems[storeItems[key].dependsOn]?.purchased) continue; // if dependsOn has not been purchased, skip

      lastStoreState[key].visible = true; // set visible to true

      let cantAfford = !Resource_canAffordGeneration(storeItems[key].costs);
      lastStoreState[key].disbaled = cantAfford;

      const itemContainer = document.createElement('div');
      itemContainer.id = `${key}-container`;
      itemContainer.classList.add('store-item-container');

      if (cantAfford)
        itemContainer.classList.add('disabled');

      const itemInfoContainer = document.createElement('div');
      itemInfoContainer.classList.add('store-item-info');

      const nameElement = document.createElement('p');
      nameElement.id = `${key}-name`;
      nameElement.innerHTML = `<b>${storeItems[key].displayName}</b>`;
      lastStoreState[key].name = storeItems[key].displayName;

      const descriptionElement = document.createElement('p');
      descriptionElement.textContent = storeItems[key].displayDescription;

      const costElement = document.createElement('p');
      costElement.id = `${key}-cost`;
      let costString = `Cost: ${Cost_getCostDisplayString(storeItems[key].costs)}`
      costElement.innerHTML = costString;
      lastStoreState[key].cost = costElement.innerHTML;

      itemInfoContainer.appendChild(nameElement);
      itemInfoContainer.appendChild(descriptionElement);
      itemInfoContainer.appendChild(costElement);

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('store-item-button-container');

      const buttonElement = document.createElement('button');
      buttonElement.id = `${key}-generate-button`;
      buttonElement.textContent = 'Buy';
      buttonElement.disabled = cantAfford;

      buttonElement.addEventListener('click', () => Store.buyItem(key));

      buttonContainer.appendChild(buttonElement);

      itemContainer.appendChild(itemInfoContainer);
      itemContainer.appendChild(buttonContainer);

      container.appendChild(itemContainer);
    }
  } else {
    for (const key in storeItems) {
      const container = document.getElementById(`${key.split('-')[0]}-store-content-container`);
      if (!container) continue;

      let isVisble: boolean = true;
      if (storeItems[key].purchased) isVisble = false;
      if (storeItems[key].dependsOn && !storeItems[storeItems[key].dependsOn]?.purchased) isVisble = false;
      if (lastStoreState[key].visible != isVisble) {
        lastStoreState = null;
        break;
      }

      if (lastStoreState[key].name != storeItems[key].displayName) {
        lastStoreState[key].name = storeItems[key].displayName;
        let nameElement = document.getElementById(`${key}-name`);
        if (nameElement) {
          nameElement.innerHTML = `<b>${storeItems[key].displayName}</b>`
        }
      }

      let costString = Cost_getCostDisplayString(storeItems[key].costs);
      if (lastStoreState[key].cost != costString) {
        let costElement = document.getElementById(`${key}-cost`);
        if (costElement) {
          costElement.innerHTML = costString;
          lastStoreState[key].cost = costElement.innerHTML;
        }
      }

      let cantAfford = !Resource_canAffordGeneration(storeItems[key].costs);

      if (lastStoreState[key].disbaled != cantAfford) {
        let button = document.getElementById(`${key}-generate-button`) as HTMLButtonElement;
        let container = document.getElementById(`${key}-container`);

        if (button && container) {
          if (cantAfford) {
            container?.classList.add('disabled');
            button.disabled = true;
          } else {
            container?.classList.remove('disabled');
            button.disabled = false;
          }
        }

        lastStoreState[key].disbaled = cantAfford;
      }
    }
  }

}


export function UI_log(text: string, showTimestamp: boolean = true) {
  let logScreenContainer = document.getElementById("log-screen-container");
  document.getElementById("log-screen").innerHTML += `<br>${showTimestamp ? Time.getCurrentTimestamp() : ''}${text}`;

  logScreenContainer.scrollTop = logScreenContainer.scrollHeight;
}

export function UI_shakeScreen(times = 5) {
  for (let i = 0; i < 600; i++) {
    doGlitchEffect(times);
  }
}


export function UI_displayStaffMembers(members: StaffMember[], onFireCallback: Function) {
  let staffListContainer = document.getElementById("staff-list-container");
  let html = ""
  html = `<div class="staff-container">`;

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    html += `<div class="staff-member-container">`
    html += `<div class="face-container"><div class="face">${member.pic}</div></div>`;
    html += `<div class="staff-info-container">`;
    html += `<div> ${i + 1}. ${member.name.firstName} ${member.name.lastName} (${member.gender == 0 ? '♂' : member.gender == 1 ? '♀' : '⚥'})</div>`
    html += `<div>Age: <span class="staff-member-${member.id}-age"></span></div>`
    html += `<div>Efficiency: <span class="staff-member-${member.id}-efficiency"></span></div>`

    html += "</div>"
    html += `<div class="staff-effect-container">`
    html += `<div>Contribution: <span class="staff-member-${member.id}-gen-rate"></span></div>`;
    html += `<div>Impact: <span class="staff-member-${member.id}-spend-rate"></span></div>`;
    html += "</div>"
    html += `<div class="staff-assignment-selector-container">`
    html += `<button id="staff-fire-button-${member.id}">FIRE</button>`
    html += `<select id="staff-job-${member.id}">`
    html += `<option value="null">---</option>`
    WorkableResourceList.forEach(r => {
      if (ALL_RESOURCES[r].enabled) {
        html += `<option value="${r}" ${member.assignment?.name == ALL_RESOURCES[r].name ? 'selected' : ''}>${ALL_RESOURCES[r].label}</option>`;
      }
    })
    html += "</select>"
    html += "</div>"
    html += "</div>"
  }

  if (members.length == 0) {
    html += "<p>You have no staff members</p>"
  }
  html += "</div>";
  staffListContainer.innerHTML = html;


  // Add event listeners to each dropdown
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const dropdown = document.getElementById(`staff-job-${member.id}`) as HTMLSelectElement;
    dropdown.addEventListener('change', () => {
      handleStaffJobChange(dropdown.value, member);
      UI_displayStaffMembers(members, onFireCallback);
    });

    const fireButton = document.getElementById(`staff-fire-button-${member.id}`);
    fireButton.addEventListener('click', () => {
      onFireCallback(member.id);
      UI_log(`${member.name.firstName} ${member.name.lastName} as been relieved of ${member.gender == 0 ? 'his' : member.gender == 1 ? 'her' : 'their'} duties.`)
    });
    member.UI_triggerUpdate();
  }
}

export function UI_calculateSunBrightness(hour: number, minute: number) {
  var totalMinutes = (hour * 60) + minute;

  const totalMinutesInDay = (23 * 60) + 59;
  let dayPercentage = totalMinutes / totalMinutesInDay;

  let sunBrightness = (0.5 * (Math.sin((dayPercentage * 2 * Math.PI) + (Math.PI / 2)) + 1))

  // document.body.style.filter = "grayscale(" + (sunBrightness * 0.4) + ")";
  // Define the start and end colors
  var startColor = [45, 82, 123]; // RGB values for #3c6ea5
  var endColor = [60, 110, 165]; // RGB values for #010101

  // Calculate the intermediate color values
  var r = Math.round(startColor[0] * sunBrightness + endColor[0] * (1 - sunBrightness));
  var g = Math.round(startColor[1] * sunBrightness + endColor[1] * (1 - sunBrightness));
  var b = Math.round(startColor[2] * sunBrightness + endColor[2] * (1 - sunBrightness));

  // Set the background color of the body element
  document.body.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
}

function handleStaffJobChange(resourceType: string, staffMember: StaffMember) {
  console.log(`Assigning ${resourceType} job to ${staffMember.name.firstName} ${staffMember.name.lastName}`);
  staffMember.assignment = ALL_RESOURCES[resourceType];
}

function doGlitchEffect(count: number) {

  if (count <= 0) return;
  const elements = document.querySelectorAll('*:not(body):not(html)');
  const randomIndex = Math.floor(Math.random() * elements.length);
  const element = elements[randomIndex];

  const randomTime = randomIntFromInterval(10, 50)
  element.classList.add('glitch-fx');
  setTimeout(() => {
    element.classList.remove('glitch-fx');
  }, randomTime);

  const randomInterval = randomIntFromInterval(10, 150)

  setTimeout(() => {
    doGlitchEffect(count - 1)
  }, randomInterval);
}

