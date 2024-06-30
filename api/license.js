/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

const axios = require('axios');
const LICENSE_API = axios.create({ baseURL: 'https://amethyst.norelock.dev/api/licenses/' });

/**
 * @param {string} licenseKey
 * @returns {Promise<any | undefined>}
 */
const getLicense = async (licenseKey) => {
  let license;

  try {
    license = await LICENSE_API.get(licenseKey);
  } catch (error) {
    let status, responseError;
    
    if ('errors' in error.response.data && Array.isArray(error.response.data['errors'])) {
      const message = error.response.data['errors'][0].message;
      const keyNotFound = message.includes('not found');
      
      status = keyNotFound
        ? 404
        : 501
      responseError = keyNotFound
        ? 'License key not found in system'
        : 'Unknown licensing error'

      throw new Error({ status, responseError });
    }
  }

  if (!('data' in license))
    return;

  return license.data;
}

module.exports = {
  getLicense
}