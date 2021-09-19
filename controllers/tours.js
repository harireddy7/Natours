const Tour = require('../models/tour')
const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const aliasTop5Routes = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';
    next()
}

// Get Tours
const getAllToursAsync = async (req, res) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
}

// Get Tour by Id
const getTourAsync = async (req, res, next) => {
    const reqTour = await Tour.findById(req.params.id)

    if (!reqTour) {
        return next(new AppError('Tour not found', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: reqTour
        }
    })
}

// Add new tour
const createTourAsync = async (req, res) => {
    const newTour = await Tour.create({ ...req.body });
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
}

// Update Tour
const updateTourAsync = async (req, res, next) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!updatedTour) {
        return next(new AppError('Tour not found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: updatedTour
        }
    })
}

// Delete Tour
const deleteTourAsync = async (req, res, next) => {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id)
    if (!deletedTour) {
        return next(new AppError('Tour not found', 404))
    }
    res.status(204).json({
        status: 'success',
        data: {
            tour: null
        }
    })
}

const getTourStatsAsync = async (req, res) => {
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
}

const getMonthlyPlanAsync = async (req, res) => {
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
}

const getAllTours = catchAsync(getAllToursAsync);
const getTour = catchAsync(getTourAsync);
const createTour = catchAsync(createTourAsync);
const updateTour = catchAsync(updateTourAsync);
const deleteTour = catchAsync(deleteTourAsync);
const getTourStats = catchAsync(getTourStatsAsync);
const getMonthlyPlan = catchAsync(getMonthlyPlanAsync);

module.exports = {
    aliasTop5Routes,
    getTourStats,
    getMonthlyPlan,
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour
};