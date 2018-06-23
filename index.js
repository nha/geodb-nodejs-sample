const geodb = require('geodb').api;
const websocket = require('websocket');

const USER_TOKEN=process.env.GEODB_USER_TOKEN;
const API_KEY=process.env.GEODB_API_KEY;

console.log('Hello GeoDB');

if (!USER_TOKEN) {
  console.log('Missing USER_TOKEN');
}

if (!API_KEY) {
  console.log('Missing API_KEY');
}

geodb.init({host: 'geodb.io',
            type: "ws",
            protocol: "https"});

const publish = function publish() {
  console.log('Publishing!');

  geodb.publish({
    "payload": {
      "msg": "anything goes in the payload"
    },
    "channel": "#test",
    "location": {
      "lon": 2.1204,
      "lat": 48.8049,
      "annotation": "Versailles"
    }
  }, (err, data, metadata) => {
    console.log("published", err, data, metadata);
  });
};

const subscribe = function subscribe() {
  return geodb.subscribe({
    "channel": "#test",
    "location": {
      "radius": "50km",
      "lon": 2.3522,
      "lat": 48.8566,
      "annotation": "Paris"
    }
  }, (err, data, metadata) => {
    console.log("data received in Paris#test", err, data, metadata);
  });
};

geodb.on('connect', (evt) => {
  if(evt.authStatus.status === 'authenticated') {
    setInterval(publish, 1000);
    subscribe();
  } else {
    console.log('Check env variables');
  }
});

geodb.on('error', (evt) => {
  console.log('error', evt);
});

geodb.on('disconnect', (evt) => {
  console.log('disconnect', evt);
});

geodb.connect({userToken: USER_TOKEN,
               apiKey: API_KEY});


const describe = function describe () {
  console.log('connectionState', geodb.connectionState());
  console.log('authStatus', geodb.authStatus());
  console.log('listSubscriptions', geodb.listSubscriptions());
  console.log('listHandlers', geodb.listHandlers());
};

setInterval(describe, 5000);
