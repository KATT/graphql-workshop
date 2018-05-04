const nock = require('nock');
const _ = require('lodash');
const request = require('request-promise-native');
const { promisify } = require('util');

const server = require('../src/server');

const { REST_SERVICE_URL = 'http://localhost:3101' } = process.env;

let http;
let uri;
global.testUtils = {
  nock,
  _,
  request,
  startServer: async () => {
    nock.cleanAll();
    http = await server.start({ port: 0 });

    const { port } = http.address();
    uri = `http://localhost:${port}`;
  },
  stopServer: async () => {
    nock.cleanAll();
    if (http) {
      await promisify(http.close).call(http);
      http = null;
    }
  },
  uri: () => uri,
  gqlRequest: async ({ query, variables }) => {
    const res = await request({
      uri,
      method: 'POST',
      json: true,
      body: { query, variables },
      resolveWithFullResponse: true,
    });

    return res;
  },
  mock: (path, data) => {
    nock(REST_SERVICE_URL)
      .get(path)
      .reply(200, data);
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
