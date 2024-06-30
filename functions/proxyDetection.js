const axios = require('axios');

const proxyDetector = async (req, res, next) => {
  const ip = req.clientIp || req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Check if the request is coming through Cloudflare
  if (req.headers['cf-connecting-ip']) {
    console.log('Request is coming through Cloudflare, skipping proxy check.');
    return next();
  }

  // Check for common proxy headers
  const proxyHeaders = [
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'via',
    'forwarded',
    'x-real-ip'
  ];

  const isProxy = proxyHeaders.some(header => req.headers[header]);

  if (isProxy) {
    return res.status(403).json({ error: 'Proxy detected' });
  }

  // Optionally use a third-party API to check if the IP is a known proxy
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    if (response.data && response.data.org && response.data.org.includes('proxy')) {
      return res.status(403).json({ error: 'Proxy detected' });
    }
  } catch (error) {
    console.error('Error checking IP:', error);
  }

  next();
};

module.exports = proxyDetector;