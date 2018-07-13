const geodb = require('geodb').api;
const websocket = require('websocket');

const USER_TOKEN=process.env.GEODB_USER_TOKEN;
const API_KEY=process.env.GEODB_API_KEY;



function sum(a, b) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
