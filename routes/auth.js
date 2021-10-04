const express = require('express');

const { signUp, login, logout, forgotPassword, resetPassword, updatePassword, protect } = require('../controllers/auth');

const router = express.Router()

// AUTH ROUTES
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);

// PASSWORDS
router.patch('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.patch('/updatepassword', protect, updatePassword);

module.exports = router;