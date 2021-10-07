const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// MULTER

// STORE IMG TO DISK
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

// STORE IMG TO MEMORY AS BUFFER
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! please upload only images.', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadUserPhoto = upload.single('photo');

// RESIZE UPLOADED PHOTO IN MEMORY
const resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) next();

    // To access filename in updateme controller
    req.file.filename =  `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
})

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

    if (req.file) {
        updateObj.photo = req.file.filename;
    }

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
    uploadUserPhoto,
    resizeUserPhoto,
};