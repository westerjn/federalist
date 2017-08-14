const config = require('./config');

const logger = require('winston');

logger.level = config.log.level;
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });

// If settings present, start New Relic
const env = require('./services/environment.js')();

if (env.NEW_RELIC_APP_NAME && env.NEW_RELIC_LICENSE_KEY) {
  logger.info(`Activating New Relic: ${env.NEW_RELIC_APP_NAME}`);
  require('newrelic'); // eslint-disable-line global-require
} else {
  logger.warn('Skipping New Relic Activation');
}

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressWinston = require('express-winston');
const session = require('express-session');
const PostgresStore = require('connect-session-sequelize')(session.Store);
const responses = require('./api/responses');
const passport = require('./api/services/passport');
const RateLimit = require('express-rate-limit');
const router = require('./api/routers');

const app = express();
const sequelize = require('./api/models').sequelize;

config.session.store = new PostgresStore({ db: sequelize });

// TODO: ejs doesn't support blocks -- might want to replace with one that does
// because it will make templatizing difficult
app.engine('html', require('ejs').renderFile);

// When deployed we are behind a proxy, but we want to be
// able to access the requesting user's IP in req.ip, so
// 'trust proxy' must be enabled.
app.enable('trust proxy');

app.use(session(config.session));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(responses);

app.use((req, res, next) => {
  res.set('Cache-Control', 'max-age=0');
  next();
});

if (logger.levels[logger.level] >= 2) {
  app.use(expressWinston.logger({
    transports: [
      new logger.transports.Console({ colorize: true }),
    ],
    requestWhitelist: expressWinston.requestWhitelist.concat('body'),
  }));
}
app.use(expressWinston.errorLogger({
  transports: [
    new logger.transports.Console({ json: true, colorize: true }),
  ],
}));

const limiter = new RateLimit(config.rateLimiting);
app.use(limiter); // must be set before router is added to app

app.use(router);

module.exports = app;
