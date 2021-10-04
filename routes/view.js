const express = require('express');
const { isLoggedIn, protect } = require('../controllers/auth');
const { getOverview, getTour, getLoginPage, getAccount } = require('../controllers/views');

const router = express.Router();

// router.use(isLoggedIn);

router.get('/', isLoggedIn, getOverview);

// middleware to add csp for mapbox
const mapboxCSP = (req, res, next) => {
  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );
  next();
};

router.get('/tour/:slug', isLoggedIn, mapboxCSP, getTour);

router.get('/me', protect, getAccount);

router.get('/login', isLoggedIn, getLoginPage);

module.exports = router;
