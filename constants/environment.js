/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

const ENVIRONMENT = process.env.DEV === 'true' ? 'dev' : 'prod';
const IS_DEV = ENVIRONMENT === 'dev';
const IS_PROD = ENVIRONMENT === 'prod';

module.exports = {
  IS_DEV,
  IS_PROD,
  ENVIRONMENT
};