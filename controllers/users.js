const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');

const filterObjByFields = (obj, ...fields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(field => {
        if (fields.includes(field)) {
            filteredObj[field] = obj[field];
        }
    })
    return filteredObj;
}

const getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    })
}

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    })
}

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    })
}

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    })
}

// UPDATE USER DATA
const updateMe = catchAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    // 1. check if req has passwords to update & return error
    if (password || confirmPassword) {
        return next(new AppError('Cannot update passwords through this route, use /updatepassword instead!', 400))
    }

    // 2. update user document
    // filter body by user updatable fields
    const updatableFields = ['name', 'email'];
    const updateObj = filterObjByFields(req.body, ...updatableFields)

    if (Object.keys(updateObj).length) {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, updateObj, {
            new: true,
            runValidators: true
        })
        return res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        })
    }
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: 'missing',
        data: {
            user
        }
    })
})

// DELETE USER - SET ACTIVE TO FALSE
const deleteMe = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { active: false })

    return res.status(204).json({
        status: 'success',
        data: null
    })
})

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
};