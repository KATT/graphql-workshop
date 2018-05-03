const nock = require('nock');
const _ = require('lodash');
const request = require('request-promise-native');
const { promisify } = require('util');

const server = require('../src/server');

let http;
let uri;
global.testUtils = {
  nock,
  _,
  request,
  startServer: async () => {
    http = await server.start({ port: 0 });

    const { port } = http.address();
    uri = `http://localhost:${port}`;
  },
  stopServer: async () => {
    if (http) {
      await promisify(http.close).call(http);
      http = null;
    }
  },
  uri: () => uri,
  gqlRequest: async ({ query, variables }) => {
    const opts = {
      uri,
      method: 'POST',
      json: true,
      body: { query, variables },
    };
    const body = await request(opts);

    return body;
  },
};

nock.emitter.on('no match', req => {
  if (!['127.0.0.1', 'localhost'].includes(req.hostname)) {
    const message = `Tried making unnmocked request outside of localhost.`;

    console.error(
      message,
      _.pick(req, ['method', 'port', 'hostname', 'path', 'proto']),
    );
    throw new Error(message);
  }
});
