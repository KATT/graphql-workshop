const { GraphQLServer } = require('graphql-yoga');
const DataLoader = require('dataloader');
const request = require('request-promise-native');
const querystring = require('querystring');

const { REST_SERVICE_URL = 'http://localhost:3101' } = process.env;

const resolvers = {
  Query: {
    hello: (source, args) => `Hello ${args.name || 'World'}`,
  },
};

const server = new GraphQLServer({
  typeDefs: __dirname + '/schema.graphql',
  resolvers,
});

module.exports = server;
