const express = require('express');
const { isLoggedIn, protect } = require('../controllers/auth');
const { getOverview, getTour, getLoginPage, getAccount, updateUserData, getMyTours } = require('../controllers/views');
const { createBookingCheckout } = require('../controllers/booking');

const router = express.Router();

// router.use(isLoggedIn);

router.get('/', isLoggedIn, getOverview);

router.get('/tour/:slug', isLoggedIn, getTour);

router.get('/me', protect, getAccount);

router.get('/login', isLoggedIn, getLoginPage);

router.get('/my-tours', createBookingCheckout, protect, getMyTours);

// UPDATE USER DATA via FORM SUBMISSION
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
