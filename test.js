const test_ = require('tape')
// as browser-tap is weirdly bundled, ensure compatibility between node and browser
const test = test_.default || test_

const api =  require('geodb').api
console.log('Testing version', {version: api.version,
                                commitVersion: api.commitVersion,
                                buildNum: api.buildNum})

const geoInst = require('geodb').inst
require('websocket')

const GEODB_USER_TOKEN = process.env.GEODB_USER_TOKEN
const GEODB_API_KEY = process.env.GEODB_API_KEY
const GEODB_HOST = process.env.GEODB_HOST || 'geodb.io';
const GEODB_PROTOCOL = process.env.GEODB_PROTOCOL || 'https';
const GEODB_TYPE = process.env.GEODB_TYPE || 'ws';
const GEODB_TIMEOUT = process.env.GEODB_TIMEOUT || 10000;

test('test setup', t => {

  if(!GEODB_USER_TOKEN) {
    t.fail('missing user token');
  } else {
    t.pass('user token');
  }

  if(!GEODB_API_KEY) {
    t.fail('missing api key');
  } else {
    t.pass('api key');
  }

  t.end()
});

const opts = {
      host: GEODB_HOST,
      type: GEODB_TYPE,
      protocol: GEODB_PROTOCOL
};

const channel = "#test-node-" + new Date().getTime();

console.log('Connecting with ', JSON.stringify(opts, null, 2));

const geodb = geoInst.make(opts);

test('geodb connect', {timeout: GEODB_TIMEOUT}, t => {

  geodb.on('error', evt => t.fail('should not have an error'))

  geodb.on('connect', evt => {
    t.pass('connected')

    if(evt[1].auth.status === 'authenticated') {
      t.pass('authenticated');
    } else {
      t.fail('not authenticated');
    }
    t.end()
  })

  t.pass('init')

  geodb.connect({
    userToken: GEODB_USER_TOKEN,
    apiKey: GEODB_API_KEY,
  })

  t.pass('connecting')
})

test('geodb publish', {timeout: GEODB_TIMEOUT}, async t => {
  const message = {
    m: 'hello',
    d: new Date()
  }

  console.log('onError set');
  geodb.on('error', evt => t.fail('should not have an error'))

  await new Promise((resolve, reject) =>
    geodb.subscribe(
      {
        channel: channel,
        location: {
          radius: '50km',
          lon: 2.3522,
          lat: 48.8566,
          annotation: 'Paris',
        },
      },
      (err, data, metadata) => {
        console.log("SUB", err, data, metadata);
        if (err) return reject(err)

        if (data[0] === 'subscribeOk') return resolve()

        t.deepEqual(data.payload, message, 'should receive the message')

        t.end()
      },
    ).then((data) => {
      console.log('subscribe data', data);
    })
    .catch((err) => {
     console.log('sub catch err', err);
    })
  )

  t.pass('subscribed')

  console.log('PUBLISHING');
  await new Promise((resolve, reject) => {
    console.log('CALLING PUBLSH');
    geodb.publish(
      {
        payload: message,
        channel: channel,
        location: {
          lon: 2.1204,
          lat: 48.8049,
          annotation: 'Versailles',
        },
      },
      (err, data, metadata) => {
       console.log('publish CB', err, data, metadata);
       (err ? reject(err) : resolve())
      },
    ).then((data) => {
      console.log('Publish then', data);
    })
    .catch((err) => {
      console.log('publish catch err', err);
    })
   }
  )
})

const wait = delay => new Promise(resolve => setTimeout(resolve, delay))

test('geodb disconnect', {timeout: GEODB_TIMEOUT},  async t => {
  geodb.on('error', evt => t.fail('should not have an error'))

  geodb.on('disconnect', evt => {
    t.pass('disconnected')

    t.end()
  })

  t.assert(
    geodb.connectionState()['open?'],
    'should be connected at this point',
  )

  geodb.disconnect()

  t.assert(
    !geodb.connectionState()['open?'],
    'should be disconnected after disconnection',
  )

  // I feel like this is cheating :{
  t.end()
  if (typeof process.exit !== 'undefined') process.exit()
})
