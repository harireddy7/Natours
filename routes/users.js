const express = require('express');

const { protect, restrictTo } = require('../controllers/auth');
const { getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto } = require('../controllers/users')

const router = express.Router()

// all protected routes
router.use(protect);

// Logged user routes
router.get('/me', getMe, getUser);
router.patch('/updateme', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteme', deleteMe);

// All the routes under this are only accessible to admin
router.use(restrictTo('admin'));

// USER ROUTES
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);


module.exports = router;