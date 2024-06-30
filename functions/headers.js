/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

const { GAME_HEADER,  MACHINE_HEADER, LICENSE_HEADER } = require('../constants/headers.js');

const checkHeaders = headers => {
  const gameId = GAME_HEADER in headers ? headers[GAME_HEADER] : undefined;
  // const machineId = MACHINE_HEADER in headers ? headers[MACHINE_HEADER] : undefined;
  const licenseKey = LICENSE_HEADER in headers ? headers[LICENSE_HEADER] : undefined;

  const required = [];

  if (!gameId || gameId.length === 0)
    required.push('GameId');

  // if (!machineId || machineId.length === 0)
  //   required.push('MachineId');

  if (!licenseKey || licenseKey.length === 0)
    required.push('LicenseKey');

  return required;
};

module.exports = {
  checkHeaders
};