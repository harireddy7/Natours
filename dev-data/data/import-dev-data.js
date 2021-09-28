const mongoose = require('mongoose');
const dotenv = require('dotenv')
const fs = require('fs');
const Tour = require('../../models/tour')
const Review = require('../../models/review');
const User = require('../../models/user');

dotenv.config({ path: './.env' })

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


// READ FILE
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await User.create(users);
        await Tour.create(tours);
        await Review.create(reviews);
        console.log('Data inserted successfully!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

// DELETE DATA IN DB
const deleteData = async () => {
    try {
        await User.deleteMany();
        await Tour.deleteMany();
        await Review.deleteMany();
        console.log('All Tours deleted successfully!')
    } catch (err) {
        console.log(err)
    }
    process.exit()
}

// console.log(process.argv)
if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}