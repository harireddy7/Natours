const express = require('express');
const morgan = require('morgan');
const authRouter = require('./routes/auth');
const tourRouter = require('./routes/tours');
const userRouter = require('./routes/users');
const globalErrorHandler = require('./controllers/errors');
const AppError = require('./utils/appError');

const app = express();

// 1. Middlewares

// Morgan Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Body Parser
app.use(express.json())

// Custom Logger
// app.use((req, res, next) => {
// 	console.log(`${req.method} request of URL ${req.url} from ${req.headers.host} at ${new Date().toDateString()} - ${new Date().toTimeString()}`)
// 	next()
// })

// SERVE STATIC FILES FROM A FOLDER
app.use(express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'response from natours api'
    })
})

// 2. ROUTERS
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'failure',
    //     message: `Can't find ${req.method} ${req.url} on the server`
    // })

    // const err = new Error(`Can't find ${req.method} ${req.url} on the server`)
    // err.status = 'failure'
    // err.statusCode = 404
    // // passing any data to next() is treated as an error by express & sent to gobal error middleware
    // next(err)

    next(new AppError(`Can't find ${req.method} ${req.url} on the server`, 404))
})

// Global Error Middleware
app.use(globalErrorHandler)

module.exports = app;