const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const postRoute = require('./post.route');
const paymentRoute = require('./payment.route');
const docsRoute = require('./docs.route');
const cardsRoute = require('./card.route');
const contactRoute = require('./contact.route');
const subscriptionRoute = require('./subscription.route')
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/posts',
    route: postRoute,
  },
  {
    path: '/payment',
    route: paymentRoute,
  },
  {
    path: '/cards',
    route: cardsRoute ,
  },
  {
    path: '/createInquiry',
    route: contactRoute ,
  },
  {
    path: '/subscription',
    route: subscriptionRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
