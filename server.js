const mongoose = require('mongoose');
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config({ path: './config.env' })
// console.log(process.env)

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
}).catch(() => {
    // console.log(err)
    console.log('Error connecting to DB!');
});

// SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`server listening for requests on port ${PORT}`));