const { GraphQLServer } = require('graphql-yoga');

const { REST_SERVICE_URL = 'http://localhost:3101' } = process.env;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
};

const server = new GraphQLServer({
  typeDefs: __dirname + '/schema.graphql',
  resolvers,
});

module.exports = server;
