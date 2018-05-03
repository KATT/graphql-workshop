const server = require('./server');

const { PORT = 3100 } = process.env;

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
