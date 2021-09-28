const Tour = require('../models/tour')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory');
const AppError = require('../utils/appError')

// const APIFeatures = require('../utils/APIFeatures')

const aliasTop5Routes = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';
    next()
}

// Get Tours
const getAllTours = factory.getAll(Tour);

// Get Tour by Id
const getTour = factory.getOne(Tour, { path: 'reviews' });

// Add new tour
const createTour = factory.createOne(Tour);

// Update Tour
const updateTour = factory.updateOne(Tour)

// Delete Tour
const deleteTour = factory.deleteOne(Tour);

const getTourStats = catchAsync(async (req, res) => {
    // Aggregate pipeline => query passes through each stage inside the array & the documents gets transformed
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } } // filter document by fields
        },
        {
            $group: { // group and create new fields in each document to store aggregate results & return them
                // _id takes a field name that needs to be grouped,
                _id: { $toUpper: '$difficulty' }, // here docs are grouped by $difficulty field & calculate aggregates on different difficulty levels
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { minPrice: 1 }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

const getMonthlyPlan = catchAsync(async (req, res) => {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
        {
            // unwind will return each document with each index in array
            // eg: places: ['india','paris','venice'] => {..., places: 'india'}, {..., places: 'paris'}, { ..., places: 'venice' }
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' }, // $month return month from the date object
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            // add a new field from existing field
            $addFields: {
                month: {
                    $arrayElemAt: [
                        ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], '$_id'
                    ]
                },

            }
        },
        {
            $sort: { numTourStarts: -1 }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})

// /tours-within/:distance/center/:latlong/unit/:unit
// /tours-within/200/center/17.513762, 78.447500/unit/mi
const getToursWithinDistance = catchAsync(async (req, res, next) => {
    const { distance, latlong, unit } = req.params;
    const [lat, long] = latlong.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !long) {
        next(new AppError('Latitude and longitude must of format lat,long', 400));
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } }
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours
    })
})

// /distances/:latlong/unit/:unit
const getDistances = catchAsync(async (req, res, next) => {
    const { latlong, unit } = req.params;
    const [lat, long] = latlong.split(',');

    if (!lat || !long) {
        next(new AppError('Latitude and longitude must of format lat,long', 400));
    }

    // To convert distances in meters to miles or kms
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const distances = await Tour.aggregate([
        {
            // geoNear always should be the 1st stage for GeoSpatial aggregation
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [long * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: distances
    })
})

module.exports = {
    aliasTop5Routes,
    getTourStats,
    getMonthlyPlan,
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    getToursWithinDistance,
    getDistances
};