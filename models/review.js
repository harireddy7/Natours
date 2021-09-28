const mongoose = require('mongoose');
const Tour = require('./tour');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!'],
        trim: true
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be atleast 1.0 '],
        max: [5, 'Rating must not be more than 5.0 '],
        required: [true, 'Rating is required!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belongs to a tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belongs to a user!']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// INDEXES
// Unique user & tour combo
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

// STATIC METHODS
// CALCULATE AVERAGE RATINGS
reviewSchema.statics.calAverageRatings = async function(tourId) {
    // this in static method points to MODEL
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: 'tour',
                numRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        },
        {
            $project: { _id: 0, numRatings: 1, avgRating: { $round: ["$avgRating", 1] } }
        }
    ]);
    // console.log(stats)
    const statsLength = stats.length
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: statsLength ? stats[0].numRatings : 0,
        ratingsAverage: statsLength ? stats[0].avgRating : 0
    });
}

reviewSchema.post('save', function () {
    // this points to current doc to be saved
    // this.constructor points to Model on which doc is created
    this.constructor.calAverageRatings(this.tour)
})

// QUERY MIDDLEWARE
// Calculate average ratings when UPDATE & DELETE REVIEW
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // this => current query
    this.reviewQ = await this.findOne();
    next()
})

reviewSchema.post(/^findOneAnd/, async function() {
    // Update/Delete query is already executed at this point
    await this.reviewQ?.constructor.calAverageRatings(this.reviewQ.tour)
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
