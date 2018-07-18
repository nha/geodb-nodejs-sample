const test_ = require('tape')
// as browser-tap is weirdly bundled, ensure compatibility between node and browser
const test = test_.default || test_

const geodb = require('geodb').api
require('websocket')

const GEODB_USER_TOKEN = process.env.GEODB_USER_TOKEN
const GEODB_API_KEY = process.env.GEODB_API_KEY

test('geodb connect', t => {
  geodb.init({
    host: 'geodb.io',
    type: 'ws',
    protocol: 'https',
  })

  geodb.on('error', evt => t.fail('should not have an error'))

  geodb.on('connect', evt => {
    t.pass('connected')

    t.end()
  })

  t.pass('init')

  geodb.connect({
    userToken: GEODB_USER_TOKEN,
    apiKey: GEODB_API_KEY,
  })

  t.pass('connecting')
})

test('geodb publish', async t => {
  const message = {
    m: 'hello',
  }

  geodb.on('error', evt => t.fail('should not have an error'))

  await new Promise((resolve, reject) =>
    geodb.subscribe(
      {
        channel: '#test',
        location: {
          radius: '50km',
          lon: 2.3522,
          lat: 48.8566,
          annotation: 'Paris',
        },
      },
      (err, data, metadata) => {
        if (err) return reject(err)

        if (data[0] === 'subscribe-ok') return resolve()

        t.deepEqual(data.payload, message, 'should receive the message')

        t.end()
      },
    ),
  )

  t.pass('subscribed')

  await new Promise((resolve, reject) =>
    geodb.publish(
      {
        payload: message,
        channel: '#test',
        location: {
          lon: 2.1204,
          lat: 48.8049,
          annotation: 'Versailles',
        },
      },
      (err, data, metadata) => (err ? reject(err) : resolve()),
    ),
  )
})

const wait = delay => new Promise(resolve => setTimeout(resolve, delay))

test('geodb disconnect', async t => {
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
  if (typeof process !== 'undefined') process.exit()
})
