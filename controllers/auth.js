const { promisify } = require('util')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

const sendTokenToClient = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly: true // cannot let browser to view/update cookie
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // only on https connections 
    res.cookie('jwt', token, cookieOptions);

    // remove password key from user to be sent to client
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        user
    })
}

// SIGNUP
const signUp = catchAsync(async (req, res, next) => {
    const { name, email, password, confirmPassword, passwordChangedAt, role } = req.body;
    const newUser = await User.create({ name, email, password, confirmPassword, passwordChangedAt, role });

    sendTokenToClient(newUser, 201, res);
})

// LOGIN
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. check email & password are valid
    if (!email || !password) {
        return next(new AppError('Provide valid email and password!', 400));
    }

    // 2. check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password'); // select password to compare it with client's password

    if (!user || !await user.comparePassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3. if all good, send back new token
    sendTokenToClient(user, 200, res);
})

// PROTECT ROUTE
const protect = catchAsync(async (req, res, next) => {
    // 1) check token exists
    const { authorization } = req.headers
    let token;
    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1]
    }
    if (!token || token === 'null') {
        return next(new AppError('You are not authorised, please log in', 401))
    }

    // 2) check if token is valid (verify token)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if the user exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError(`User doesn't exists, please log in again!`))
    }

    // 4) check if currentUser changed password after token is issued
    if (currentUser.checkPsdChangedAfterJwt(decoded.iat)) {
        return next(new AppError('User recently changed password, please log in again!', 401))
    }

    // TOKEN VERIFICATION PASSED!
    // Grant access to current user
    req.user = currentUser;

    next()
})

// restrict an activity to particular roles only
const restrictTo = (...roles) => (req, res, next) => {
    // roles => admin, lead-guide, guide, customer
    // get req.user from protect middleware after passing token check
    if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action', 403))
    }
    next()
}

// FORGOT PASSWORD
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    // 1. check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('User not found!', 404));
    }

    // 2. Generate random token to reset password
    const resetToken = user.createPasswordResetToken();
    // save user after storing token in current document
    await user.save({ validateBeforeSave: false });

    // 3. send reset token via mail
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with new password to ${resetURL}\n\n\nIf you didn't forget your password, please ignore this email`

    try {
        await sendEmail({
            email,
            subject: 'Reset Password (expires in 10mins)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to your registered email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await User.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending email. Please try again later!', 500));
    }
})

// RESET PASSWORD
const resetPassword = catchAsync(async (req, res, next) => {
    // 1. get user based on reset token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2. if token has not expires & there is user, set new password
    if (!user) {
        return next(new AppError('Token is invalid or expired!', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3. update passwordChangedAt property on user document
    // Done in userSchema pre save
    // 4. log the user in & send jwt
    sendTokenToClient(user, 200, res);
})

// UPDATE PASSWORD
const updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, password, confirmPassword } = req.body;
    if (!currentPassword || !password || !confirmPassword) {
        return next(new AppError('missing required parameters!', 400));
    }

    // 1. get user from db
    const user = await User.findById(req.user.id).select('+password');

    // 2. check if old password is correct
    if (!await user.comparePassword(currentPassword, user.password)) {
        return next(new AppError('Incorrect current password!', 401));
    }

    // 3. if so, update password to db
    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save();

    // 4. send back new jwt tokens
    sendTokenToClient(user, 200, res);
})

module.exports = {
    signUp,
    login,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword,
};

/*
    signup user:
        take all the needed data from client
            check for required field validation
                remove confirmPassword field from storing to db & encrypt password
                create a new token & store new user along with token & encrypted password
                login the user after successful signup by sending back token & user data

    login:
        check if user & password are exists
            check if user exists & password is correct
                send back token to client if all good


    protect:
        check token exists
            check if token is valid
                check if the user exists
                    check if user changed password after token is issued

            NOTE: Also check if user is accessing old token even after generating new token?

*/