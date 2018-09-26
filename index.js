const geoInst = require('geodb').inst
const websocket = require('websocket')

const USER_TOKEN = process.env.GEODB_USER_TOKEN
const API_KEY = process.env.GEODB_API_KEY

console.log('Hello GeoDB')

if (!USER_TOKEN) {
  console.log('Missing USER_TOKEN')
}

if (!API_KEY) {
  console.log('Missing API_KEY')
}

const geodb = geoInst.make({
  host: 'geodb.io',
  type: 'ws',
  protocol: 'https',
})

const channel = "#test-node-" + new Date().getTime();

const publish = function publish() {
  console.log('Publishing!')

  geodb.publish(
    {
      payload: {
        msg: 'anything goes in the payload',
      },
      channel: channel,
      location: {
        lon: 2.1204,
        lat: 48.8049,
        annotation: 'Versailles',
      },
    },
    (err, data, metadata) => {
      console.log('published', err, data, metadata)
    },
  )
}

const subscribe = function subscribe() {
  return geodb.subscribe(
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
      console.log('data received in Paris#test', err, data, metadata)
    },
  )
}

geodb.on('ready', evt => {
  console.log('Ready', evt)
  // subscribe
  subscribe()
  // publish to it once every 2.5 secs
  setInterval(publish, 2500)
})

geodb.on('error', evt => {
  console.log('error')
})

geodb.on('disconnect', evt => {
  console.log('Disconnected')
  process.exit()
})

geodb.connect({
  userToken: USER_TOKEN,
  apiKey: API_KEY,
})
console.log('Connecting...')

const describe = function describe() {
  console.log('connectionState', geodb.connectionState())
  console.log('authStatus', geodb.authStatus())
  console.log('listSubscriptions', geodb.listSubscriptions())
  console.log('listHandlers', geodb.listHandlers())
}

// setInterval(describe, 5000);

setTimeout(() => {
  console.log('Disconnecting after 40 secs')
  geodb.disconnect()
}, 40000)
