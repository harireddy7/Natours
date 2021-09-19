const express = require('express');

const { signUp, login, forgotPassword, resetPassword, updatePassword, protect } = require('../controllers/auth');

const router = express.Router()

// AUTH ROUTES
router.post('/signup', signUp);
router.post('/login', login);

// PASSWORDS
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.patch('/updatepassword', protect, updatePassword);

module.exports = router;