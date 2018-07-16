const geodb = require('geodb');
const websocket = require('websocket');

const USER_TOKEN=process.env.GEODB_USER_TOKEN;
const API_KEY=process.env.GEODB_API_KEY;
const PROTO=process.env.GEODB_PROTOCOL || 'https';
const TYPE=process.env.GEODB_TYPE || 'ws';
const HOST=process.env.GEODB_HOST || 'geodb.io';


if (!USER_TOKEN) {
  console.log('Missing USER_TOKEN');
}

if (!API_KEY) {
  console.log('Missing API_KEY');
}

test('geodb is awesome', () => {
  expect(geodb.api.awesome).toBe(true);
});

//
// TODO simple tests
// geodb.connect({userToken: USER_TOKEN,
//                apiKey: API_KEY,
//                host: HOST});
