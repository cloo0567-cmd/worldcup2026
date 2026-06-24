const https = require('https');

exports.handler = async function(event) {
  const API_KEY = process.env.FOOTBALL_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'API key non configurata nel pannello Netlify' })
    };
  }

  const type = (event.queryStringParameters && event.queryStringParameters.type) || 'standings';

  let path;
  if (type === 'standings') {
    path = '/v4/competitions/WC/standings?season=2026';
  } else if (type === 'matches') {
    path = '/v4/competitions/WC/matches?season=2026';
  } else {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Tipo non valido' })
    };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.football-data.org',
      path: path,
      method: 'GET',
      headers: {
        'X-Auth-Token': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          },
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: err.message })
      });
    });

    req.end();
  });
};
