const express = require('express');

const { protect } = require('../controllers/auth');
const { getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, deleteMe } = require('../controllers/users')

const router = express.Router()

router.patch('/updateme', protect, updateMe);
router.delete('/deleteme', protect, deleteMe);

// USER ROUTES
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);


module.exports = router;