const AppError = require('../utils/appError')

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    })
}

const sendErrorProd = (err, res) => {
    // Operational errors
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        // Programming errors || syntactical errors (any mistakes in the code)

        // console.error('ERROR: ', err);

        res.status(err.statusCode).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errorString = Object.values(err.errors).map(errField => errField.message).join('. ')
    const message = `Invalid input data. ${errorString}`
    return new AppError(message, 400);
}

module.exports = (err, req, res, next) => {
    // console.log(err.stack)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = err

        // Invalid document _id error 
        if (error.name === 'CastError') error = handleCastErrorDB(error)

        // duplicate field error while creating/updating data
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)

        // validation error
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)

        console.log(error)
        sendErrorProd(error, res);
    }
}