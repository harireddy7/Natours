const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/users')

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
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app;