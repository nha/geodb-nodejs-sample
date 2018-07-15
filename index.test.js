const geodb = require('geodb');
const websocket = require('websocket');

const USER_TOKEN=process.env.GEODB_USER_TOKEN;
const API_KEY=process.env.GEODB_API_KEY;

test('geodb is awesome', () => {
  expect(geodb.api.awesome).toBe(true);
});
