/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

const crypto = require('crypto');
const { join } = require('path');
const { read, save } = require('../utils');
const { DATABASE_PATH } = require('../constants/environment');

const FILE_NAME = 'machines.jsonc';

const machines = {
  // [ip address] = generated machine id
}

const loadMachinesId = () => {
  let json;

  try {
    json = JSON.parse(read(join(DATABASE_PATH, FILE_NAME)));
  } catch (e) {
    throw e;
  }

  if (!json)
    save(join(DATABASE_PATH, FILE_NAME), JSON.stringify(machines));

  if (json) {
    for (const [ address, id ] of Object.entries(json))
      machines[address] = id;
  }

  console.log('Loaded', Object.entries(machines).length, 'machine IDs');
};

const generateMachineId = address => {
  if (!(address in machines)) {
    const id = crypto.randomUUID();

    machines[address] = id;
    return id;
  }

  return false;
};

const getMachineId = machineId => {
  let i;
    
  for (const [ address, id ] of Object.entries(machines)) {
    if (id === machineId) {
      i = id;
      break;
    }
  }

  return i || false;
}

const saveMachinesId = () => {
  try {
    save(join(DATABASE_PATH, FILE_NAME), JSON.stringify(machines));
  } catch (e) {
    throw e;
  }

  // console.log('Saved', Object.entries(machines).length, 'machine IDs');
};

module.exports = {
  getMachineId,
  loadMachinesId,
  saveMachinesId,
  generateMachineId,
};