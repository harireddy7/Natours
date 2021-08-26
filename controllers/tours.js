const Tour = require('../models/tour')
const APIFeatures = require('../utils/APIFeatures')

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// const checkID = (req, res, next, value) => {
//     console.log(`Tour ID: ${value}`)
//     const reqTour = tours.find(tour => tour.id === +value)
//     if (!reqTour) {
//         return res.status(404).json({
//             status: 'failure',
//             message: 'Invalid Id'
//         })
//     }
//     next();
// }

// const checkBody = (req, res, next) => {
//     const { name, price } = req.body;
//     console.log(req.body)
//     if (!name || !price) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Invalid body!'
//         })
//     }
//     next();
// }


const aliasTop5Routes = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';
    next()
}

// Get Tours
const getAllTours = async (req, res) => {
    try {
        // // 1A FILTER OUT COMMON QUERY PARAMS
        // const excludedFields = ['page', 'sort', 'limit', 'fields']
        // const queryObj = Object.keys(req.query).filter(key => !excludedFields.includes(key)).reduce((acc, field) => ({ ...acc, [field]: req.query[field] }), {});

        // // 1B. ADVANCED FILTERING
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        // // console.log(queryStr)

        // let query = null;
        // if (Object.keys(req.query).length) {
        //     query = Tour.find(JSON.parse(queryStr))
        // } else {
        //     query = Tour.find()
        // }

        // // 2. SORTING
        // // &sort=price (asc) &sort=-price (desc)
        // if (req.query.sort) {
        //     // console.log(req.query.sort)
        //     const sortBy = req.query.sort.replace(/[,]/g, ' ')
        //     query = query.sort(sortBy)
        // } else {
        //     query = query.sort('-createdAt')
        // }

        // 3. PROJECTING || FIELD LIMITING
        // if (req.query.fields) {
        //     const fields = req.query.fields.replace(/[,]/g, ' ')
        //     query = query.select(fields)
        // } else {
        //     query = query.select('-__v')
        // }

        // 4. PAGINATION
        // // page=2&limit=10 => page1 - 1-10, page2 - 11-20, page3 - 21-30
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments() // number of tour docs
        //     if (skip >= numTours) throw new Error('Page doesn\'t exist')
        // }


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
    } catch (err) {
        res.status(404).json({
            status: 'failure',
            message: err.message
        })
    }
}

// Get Tour by Id
const getTour = async (req, res) => {
    try {
        const reqTour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: 'success',
            data: {
                tour: reqTour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failure',
            message: err.message
        })
    }
}

// Add new tour
const createTour = async (req, res) => {
    try {
        const newTour = await Tour.create({ ...req.body });
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })

    } catch (err) {
        // ValidatorError or Duplicate key error
        res.status(400).json({
            status: 'failure',
            message: err.message
        })
    }
}

// Update Tour
const updateTour = async (req, res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            data: {
                tour: updatedTour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failure',
            message: err
        })
    }
}

// Delete Tour
const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: {
                tour: null
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failure',
            message: err
        })
    }
}

const getTourStats = async (req, res) => {
    try {
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
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } } // Filter out docs with _id as EASY
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failure',
            message: err
        })
    }
}

const getMonthlyPlan = async (req, res) => {
    try {
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
            // {
            //     $project: { _id: 0 } // 0 means omit that field from document
            // },
            {
                $sort: { numTourStarts: -1 }
            },
            // {
            //     $limit: 1
            // }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failure',
            message: err
        })
    }
}

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