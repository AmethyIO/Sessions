/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

// Setup .env config file
require('dotenv').config();

// Modules
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');

const { getLicense } = require('./api/license.js');
const {
  getSession,
  registerSession,
  stopSessionCleaner,
  startSessionCleaner,
  hasSession
} = require('./functions/sessions.js');
const { checkHeaders } = require('./functions/headers.js');
const { GAMES_PATH, ENVIRONMENT, IS_DEV } = require('./constants/environment.js');
const { SUPPORTED_GAMES } = require('./constants/games.js');
const { GAME_HEADER, LICENSE_HEADER, MACHINE_HEADER } = require('./constants/headers.js');
const { loadMachinesId, getMachineId, generateMachineId, saveMachinesId } = require('./functions/machineId.js');
const { getAddress } = require('./utils.js');

// Constants
const SERVER_PORT = IS_DEV ? 5000 : process.env.LICENSING_PORT ?? 80;

// Server worker
const server = express();

server.set('trust proxy', true);

server.use(cors());
server.use(express.json());
server.use(express.static('public'));

server.get('/request', async (request, response) => {
  for (const [key, value] of Object.entries(request.headers))
    request.headers[key] = typeof value === 'string' ? value.toLowerCase() : value;

  const address = getAddress(request);

  const required = checkHeaders(request.headers, 'request');
  if (required.length > 0)
    return response.status(403).send({ error: `${required.join(', ')} is required` });

  if (!getMachineId(address))
    return response.status(403).send({ error: 'Invalid machine ID' });

  const licenseKey = LICENSE_HEADER in request.headers ? request.headers[LICENSE_HEADER] : undefined;

  if (hasSession(licenseKey)) {
    const { expires } = getSession(licenseKey);
    const remainingTime = Math.ceil((expires - Date.now()) / 1000);

    return response.status(429).send({ error: `Wait ${remainingTime} more seconds to request script again` });
  }

  let licenseData
  try {
    licenseData = await getLicense(licenseKey)
  } catch (error) {
    return response.status(error.status).send({ error: error.responseError });
  }

  if (!licenseData) return response.status(501).send({ error: 'License server error' });

  if (('status' in licenseData) && licenseData.status !== 'active')
    return response.status(401).send({ error: 'License is not active' });

  const game = GAME_HEADER in request.headers ? request.headers[GAME_HEADER] : undefined;
  if (!SUPPORTED_GAMES[game])
    return response.status(404).send({ error: 'Game not found/unsupported' });

  const registered = registerSession(licenseKey, game);
  if (registered) {
    const { uuid, expires } = getSession(licenseKey);

    return response.send({ path: uuid, expires });
  }

  return response.send(':waves:');
});

server.get('/get/:sid', async (request, response) => {
  for (const [key, value] of Object.entries(request.headers))
    request.headers[key] = typeof value === 'string' ? value.toLowerCase() : value;

  const address = getAddress(request);

  const { sid } = request.params;

  const required = checkHeaders(request.headers, 'get');
  if (required.length > 0)
    return response.status(403).send({ error: `${required.join(', ')} is required` });

  const licenseKey = LICENSE_HEADER in request.headers ? request.headers[LICENSE_HEADER] : undefined;

  let licenseData
  try {
    licenseData = await getLicense(licenseKey)
  } catch (error) {
    return response.status(error.stats).send({ error: error.responseError });
  }

  if (!licenseData)
    return;

  if (!getMachineId(address))
    return response.status(403).send({ error: 'Invalid machine ID' });

  const session = getSession(licenseKey);
  if (!session) return response.status(404).send({ error: 'Session does not exist' });
  if (session.uuid !== sid || session.used) return response.status(400).send({ error: 'Invalid session' });

  session.used = true;

  const gamePath = path.join(GAMES_PATH, ENVIRONMENT, `${session.game}.js`);
  if (!fs.existsSync(gamePath)) return response.status(404).send({ error: 'Game script not found, please contact developers' });

  const script = fs.readFileSync(gamePath, 'utf-8');
  return response.setHeader('content-type', 'application/javascript').send(script);
});

server.get('/mid', (request, response) => {
  const address = getAddress(request);

  let mid;

  if (address && typeof address === 'string') {
    if (!getMachineId(address))
      mid = generateMachineId(address);
    else mid = getMachineId(address);
  }

  return response.json({ mid });
});

server.use((_, response) => response.status(403).send({ error: 'Access denied' }));

// Server bootstrap
function bootstrap() {
  console.log(`License server session activating on ${ENVIRONMENT} environment..`);

  server.listen(SERVER_PORT, () => {
    console.log('License server session hosting on port', SERVER_PORT);
  });

  startSessionCleaner();
  loadMachinesId();
  setInterval(saveMachinesId, 5000);
}

bootstrap();