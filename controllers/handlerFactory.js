const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/APIFeatures");

exports.getAll = Model => catchAsync(async (req, res) => {
    // TO ALLOW NESTED GET REVIEWS ON TOUR
    let filter = {}
    if (req.params.tourId) {
        filter = { tour: req.params.tourId };
    }

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    
    // READ QUERY STATS
    // const doc = await features.query.explain();

    const doc = await features.query;


    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: doc
    });
})

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
        return next(new AppError('Tour not found', 404))
    }

    res.status(200).json({
        status: 'success',
        data: doc
    })
})

exports.createOne = Model => catchAsync(async (req, res) => {
    const doc = await Model.create({ ...req.body });
    res.status(201).json({
        status: 'success',
        data: doc
    })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!doc) {
        return next(new AppError('Document not found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: doc
    })
})

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) {
        return next(new AppError('Docuement not found', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
})