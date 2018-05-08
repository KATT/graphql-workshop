const nextRoutes = require('next-routes');
const routes = nextRoutes();

routes.add('post', '/post/:slug');

module.exports = routes;
