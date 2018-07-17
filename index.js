const test_ = require('tape')
// as browser-tap is weirdly bundled, ensure compatibility between node and browser
const test = test_.default || test_

const geodb = require('geodb').api
const key = require('./key')
require('websocket')

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
    userToken: key.GEODB_USER_TOKEN,
    apiKey: key.GEODB_API_KEY,
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
      }
    )
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
      (err, data, metadata) => (err ? reject(err) : resolve())
    )
  )
})

test('geodb disconnect', async t => {
  geodb.on('error', evt => t.fail('should not have an error'))

  geodb.on('disconnect', evt => {
    t.pass('disconnected')

    t.end()
  })

  geodb.disconnect()
})
