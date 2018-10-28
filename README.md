# geodb-js-sample

How to GeoDB in JS with webpack

# Usage

Export you Api Key, and User Token, found in https://geodb.io/dashboard/security

```sh
export GEODB_USER_TOKEN="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export GEODB_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Run:

`node index.js`


# Multiple consumers

In a terminal:
```sh
 export GEODB_DEMO_ROLE=PRODUCER
 export GEODB_DEMO_CHANNEL=sometestchannel
 node index.js
```

Then do the same in another terminal, but this time launch a new consumer.
Repeat this as much as you want.

```sh
 export GEODB_DEMO_ROLE=CONSUMER
 export GEODB_DEMO_CHANNEL=sometestchannel
 node index.js
```

# Tests

run `npm run test:browser` visit http://localhost:8083, open the console

alternatively run `npm run test` to run the same test in node

# Questions/support

Feel free to [get in touch](https://geodb.io/doc/latest/get_help.html) with us!
