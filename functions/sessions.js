/**
 * @project Amethyst
 * @author norelockk <github.com/norelockk>
 * @License private
 * @description Licensing/Script server
 */

const crypto = require('crypto');
const { ENVIRONMENT } = require('../constants/environment');

const sessions = {
  // [license key] = {
  // uuid - generated uuid for use in loader
  // game - supported game that we going to give the actual script (cheat) for it
  // used - is used already
  // expires - when it's gonna expire if loader delays
  // }
}

const registerSession = (licenseKey, game) => {
  if (licenseKey in sessions)
    return false;

  sessions[licenseKey] = {};
  const obj = sessions[licenseKey];
  
  obj.uuid = crypto.randomUUID();
  obj.game = game;
  obj.used = false;
  obj.expires = ENVIRONMENT === 'dev'
    ? Date.now() + 999999999
    : Date.now() + 60 * 1000;

  console.log('Session registered', JSON.stringify(obj));
  return true;
}

const getSession = licenseKey => sessions[licenseKey] ?? {};

const cleanupSession = licenseKey => {
  if (!hasSession(licenseKey))
    return false;

  delete sessions[licenseKey];
  return true;
};

const cleanupSessions = () => {
  const now = Date.now();

  let cleaned = 0;

  for (const [key, session] of Object.entries(sessions)) {
    if (session.expires <= now || session.used) {
      cleaned++;
      delete sessions[key];
      console.log('Session destroyed', JSON.stringify(session));
    }
  }

  if (cleaned > 0) console.log(`Destroyed ${cleaned} sessions`);
}

let cleanSessionIntervalId
const startSessionCleaner = () => {
  if (!cleanSessionIntervalId) {
    setInterval(cleanupSessions, 3 * 1000);
  }
}

const stopSessionCleaner = () => clearInterval(cleanSessionIntervalId);

const hasSession = licenseKey => licenseKey in sessions;

module.exports = {
  getSession,
  registerSession,
  cleanupSession,
  cleanupSessions,
  stopSessionCleaner,
  startSessionCleaner,
  hasSession
}