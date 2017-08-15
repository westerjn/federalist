const fs = require('fs');
const path = require('path');

const SiteWideErrorLoader = require('../services/SiteWideErrorLoader');
const config = require('../../config');

function loadAssetManifest() {
  const manifestPath = path.join(__dirname, '..', '..', 'webpack-manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

let webpackAssets = loadAssetManifest();

function defaultContext() {
  if (process.env.NODE_ENV === 'development') {
    // reload the webpack assets during development so we don't have to
    // restart the server for front end changes
    webpackAssets = loadAssetManifest();
  }

  const siteDisplayEnv = config.app.app_env !== 'production' ? config.app.app_env : null;

  const context = {
    isAuthenticated: false,
    webpackAssets,
    siteDisplayEnv,
  };

  return context;
}

module.exports = {
  home(req, res) {
    // redirect to main app if is authenticated
    if (req.session.authenticated) {
      return res.redirect('/sites');
    }

    return res.render('home.njk', defaultContext());
  },

  app(req, res) {
    // TODO: Do this check on the router instead?
    // TODO: Perhaps add a "You are not authenticated" flash message?
    if (!req.session.authenticated) {
      return res.redirect('/');
    }

    const context = defaultContext();

    context.isAuthenticated = true;
    context.username = req.user.username;
    context.siteWideError = SiteWideErrorLoader.loadSiteWideError();

    const frontendConfig = {
      TEMPLATES: config.templates,
      PREVIEW_HOSTNAME: config.app.preview_hostname,
    };

    context.frontendConfig = frontendConfig;

    return res.render('app.njk', context);
  },

  robots(req, res) {
    const PROD_CONTENT = 'User-Agent: *\nDisallow: /preview\n';
    const DENY_ALL_CONTENT = 'User-Agent: *\nDisallow: /\n';

    res.set('Content-Type', 'text/plain');

    // If this is the production instance and the request came to the production hostname
    if (config.app.app_env === 'production' &&
      config.app.hostname === `https://${req.hostname}`) {
      // then send the production robots.txt content
      return res.send(PROD_CONTENT);
    }

    // otherwise send the "deny all" robots.txt content
    return res.send(DENY_ALL_CONTENT);
  },
};
