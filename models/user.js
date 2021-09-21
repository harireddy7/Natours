const crypto = require('crypto');
const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'user name is required'],
        trim: true,
        minlength: [2, 'Name must have atleast 2 characters'],
        maxlength: [20, 'Name must be less than or equal to 20 characters']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid Email']
    },
    // path of them image in files
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must have atleast 8 characters'],
        maxlength: [20, 'Password must be less than or equal to 20 characters'],
        select: false
        // validate: [
        //     // {
        //     //     validator: function (val) {
        //     //         return validator.isStrongPassword(val)
        //     //     },
        //     //     message: 'Password must contain atleast 1 number, special character, caps & small letters'
        //     // },
        //     // This works only one CREATE/SAVE, not on UPDATE
        //     {
        //         validator: function (val) {
        //             return val === this.confirmPassword
        //         },
        //         message: `Passwords doesn't match`
        //     }
        // ]
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return val === this.password
            },
            message: `Passwords doesn't match`
        }
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['customer', 'guide', 'lead-guide', 'admin'],
        default: 'customer'
    },
    passwordResetToken: String,
    passwordResetExpires: Date
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    // update password updated key in db only if password is changed for existed document
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.comparePassword = async function (clientPsd, userPsd) {
    return await bcrypt.compare(clientPsd, userPsd);
}

// check if password is changed after issuing a token to user
// jwt timestamp > password changed timestamp => token is issued after passwords are changed => password doesn't changed
// jwt timestamp < password changed timestamp => token is freshly issued recently after passwords are changed (hence passwordChangedAt timestamp is greater or most recent time)
userSchema.methods.checkPsdChangedAfterJwt = function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const psdTime = +new Date(this.passwordChangedAt);
        const jwtTime = jwtTimestamp * 1000;
        return jwtTime < psdTime;
    }

    // password doesn't change after issuing current token
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    // store encrypted reset token to db alog with expiry time
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // console.log({ token, resetDB: this.passwordResetToken })
    // return normal reset token
    return token;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
