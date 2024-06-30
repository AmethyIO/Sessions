/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

const path = require('path');

const ENVIRONMENT = process.env.DEV === 'true' ? 'dev' : 'prod';
const IS_DEV = ENVIRONMENT === 'dev';
const IS_PROD = ENVIRONMENT === 'prod';

const GAMES_PATH = path.join(__dirname, 'games');
const DATABASE_PATH = path.join(__dirname, 'database');

module.exports = {
  IS_DEV,
  IS_PROD,
  GAMES_PATH,
  ENVIRONMENT,
  DATABASE_PATH
};