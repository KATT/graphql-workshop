const { GraphQLServer } = require('graphql-yoga');

const { PORT = 3100, REST_SERVICE_URL = 'http://localhost:3101' } = process.env;

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server
  .start({
    port: PORT,
  })
  .then(http => {
    console.log(
      `> ✅  GraphQL-server is running on http://localhost:${
        http.address().port
      }`,
    );
  })
  .catch(() => {
    console.error('Server start failed', err);
    process.exit(1);
  });
