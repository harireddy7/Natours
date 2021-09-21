const express = require('express');
const { getAllUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users')

const router = express.Router()


// USER ROUTES
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;