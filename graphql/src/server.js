const { GraphQLServer } = require('graphql-yoga');
const DataLoader = require('dataloader');
const request = require('request-promise-native');
const querystring = require('querystring');
const _ = require('lodash');

const { REST_SERVICE_URL = 'http://localhost:3101' } = process.env;

const resolvers = {
  Query: {
    hello: (source, args, ctx) => `Hello ${args.name || 'World'}`,
  },
};

const server = new GraphQLServer({
  typeDefs: __dirname + '/schema.graphql',
  resolvers,
  context: req => {
    return {
      // userById: new DataLoader(async ids => {
      //   // build query str based on passed in ids
      //   // batch fetch user ids
      //   // map ids to corresponding id in list
      //   return users;
      // }),
    };
  },
});

module.exports = server;
