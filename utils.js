const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs');
const { dirname } = require('path');

function save(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, data, { encoding: 'utf-8' });
}

function read(filePath) {
  if (existsSync(filePath)) {
    return readFileSync(filePath, { encoding: 'utf-8' });
  }

  return false;
}

function getAddress(request) {
  let ipAddress;

  // Check Cloudflare headers
  if (request.headers['cf-connecting-ip']) {
    ipAddress = request.headers['cf-connecting-ip'];
  }
  // Check standard proxy headers
  else if (request.headers['x-forwarded-for']) {
    ipAddress = request.headers['x-forwarded-for'].split(',').shift();
  }
  else if (request.headers['x-real-ip']) {
    ipAddress = request.headers['x-real-ip'];
  }
  // Default to remote address if no proxy headers are present
  else {
    ipAddress = request.connection.remoteAddress;
  }

  return ipAddress;
}

module.exports = { save, read, getAddress };
