const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const app = require('./app')

// console.log(process.env.NODE_ENV)

// MONGOOSE CONNECTION
const { DB_STRING, DB_PASSWORD } = process.env;
const CONNECTION_STRING = DB_STRING.replace('<PASSWORD>', DB_PASSWORD);

mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connected succesfully!');
})

// SERVER
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`server listening for requests on port ${PORT}`));


// uncaughtException event handler
// any syntactical errors
process.on('uncaughtException', err => {
    console.log('UNHANDLE REJECTION! Shutting down...')
    console.log(`${err.name}: ${err.message}`)
    server.close(() => {
        process.exit(1)
    })
})

// listen to unhandledRejection event
// any db connection error, nwtwork error etc.. (outsid eof express app)
process.on('unhandledRejection', err => {
    console.log('UNHANDLE REJECTION! Shutting down...')
    console.log(err)
    // close app only after server is closed - because there might be other requests already in progress
    server.close(() => {
        // 0 => success, 1 - unhandled exception
        process.exit(1)
    })
})
