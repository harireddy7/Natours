const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObjByFields = (obj, ...fields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(field => {
        if (fields.includes(field)) {
            filteredObj[field] = obj[field];
        }
    })
    return filteredObj;
}

const getAllUsers = factory.getAll(User);

const getUser = factory.getOne(User);

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! please use /signup instead'
    })
}


// Do not update password through this, ONLY FOR ADMINS
const updateUser = factory.updateOne(User);

const deleteUser = factory.deleteOne(User);

// Middleware to append logged user to req params
const getMe = (req, res, next) => {
    // to be used in handlerFactory
    req.params.id = req.user.id;
    next();
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
    getMe,
};