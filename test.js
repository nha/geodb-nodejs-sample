const test_ = require('tape')
// as browser-tap is weirdly bundled, ensure compatibility between node and browser
const test = test_.default || test_

const api =  require('geodb').api
console.log('Testing version', {version: api.version,
                                commitVersion: api.commitVersion,
                                buildNum: api.buildNum})

const geoInst = require('geodb').create

require('websocket')

const GEODB_USER_TOKEN = process.env.GEODB_USER_TOKEN
const GEODB_API_KEY = process.env.GEODB_API_KEY
const GEODB_HOST = process.env.GEODB_HOST || 'geodb.io';
const GEODB_PROTOCOL = process.env.GEODB_PROTOCOL || 'https';
const GEODB_TYPE = process.env.GEODB_TYPE || 'ws';
const GEODB_TIMEOUT = process.env.GEODB_TIMEOUT || 10000;

test('test setup', t => {

  process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error.message);
    t.fail('unhandledRejection')
  });

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

  geodb.on('error', evt => t.fail('should not have an error', evt))

  geodb.on('ready', evt => {
    t.pass('ready')

    if(evt.auth.status === 'authenticated') {
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

var subscriptionId;

test('geodb pubsub', {timeout: GEODB_TIMEOUT}, async t => {
  const message = {
    m: 'hello',
    b: true,
    n: [1.2, null, Infinity],
    d: new Date()
  }

  geodb.on('error', evt => t.fail('should not have an error'))

  const subscriptionRes = await geodb.subscribe(
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
      if (err) t.fail('subscribe cb err')
      t.deepEqual(data, message, 'should receive the message')
      t.end()
    }
  ).catch((err) => t.fail('subscribe failed'))

  subscriptionId = subscriptionRes.data.id;

  await geodb.publish(
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
      if (err) t.fail('pubslish cb err')
      if(data.publishedCount === 1) t.pass('published to 1')
    },
  ).then((data) => t.pass('published'))
   .catch((err) => t.fail('publish failed'))

})

test('geodb reader', {timeout: GEODB_TIMEOUT}, async t => {

  const reader = await geodb.reader({subscriptionId: subscriptionId,
                               startMessageId: "earliest"})
        .then(reader => {
          t.pass('create reader')
          return reader
        })
        .catch(err => {
          t.fail('cannot create reader')
        });

   await reader.readNext()
        .then(msg => {
          t.pass('reader: can read next')
          t.end()
        })
        .catch(err => {
          t.fail('reader: cannot read next')
        });
})

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
