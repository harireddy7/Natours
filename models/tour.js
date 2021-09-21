const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// TOUR SCHEMA
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour name is required'],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name must be less than or equal to 40 characters'],
        minlength: [10, 'Tour name must have atleast 10 characters'],
        validate: {
            validator: function (val) {
                return validator.isAlpha(val, 'en-US', { ignore: ' ' })
            },
            message: 'Tour Name must contain only alphabets'
        }
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have a difficulty level'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty can only be either of easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be atleast 1.0 '],
        max: [5, 'Rating must not be more than 5.0 ']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour price is required']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this keyword only works when creating a new doc, not when updating
                return val < this.price; // discount should be less than actual rice
            },
            message: 'Discount price ({VALUE}) should be less than actual price' // Custom message
        },
        default: 0
    },
    summary: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON type, mongoDB provides special type & keys must cotnains atleast type & coordinates
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            description: String,
            day: Number,
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User' // add a reference of User Schema here
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// VIRTUALS
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

// QUERY MIDDLEWARE
// find middleware - executed before executing .find()
// tourSchema.pre('find', function (next) {
//     // this => current query
//     this.find({ secretTour: { $ne: true } }) // fitler out docs with secretTour !== true
//     next()
// })

// ALL MIDDLEWARES STARTING WITH .find....
tourSchema.pre(/^find/, function (next) {
    // this => current query
    this.find({ secretTour: { $ne: true } }) // fitler out docs with secretTour !== true
    this.start = Date.now()
    next()
})

// POPULATE GUIDES FROM USER SCHEMA
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    // docs => docs returned after executing query
    console.log(`Query took ${Date.now() - this.start} ms`)
    // console.log(docs)
    next()
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next()
})

// DOCUMENT MIDDLEWARE: pre - runs before .save() & .create() methods not for update
tourSchema.pre('save', function (next) {
    // console.log(this)
    this.slug = slugify(this.name, { lower: true })
    next()
})

// EMBEDDING GUIDES IN TOURS => NOT PREFERRED
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async userId => await User.findById(userId));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

// tourSchema.pre('save', function (next) {
//     console.log(this)
//     next()
// })
// tourSchema.post('save', function (savedDoc, next) {
//     console.log(savedDoc)
//     next()
// })

// TOUR MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
