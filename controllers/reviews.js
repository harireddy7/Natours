const Review = require('../models/review');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// GET ALL REVIEWS
const getAllReviews = factory.getAll(Review);

// Middleware
const setTourUserForReview = (req, res, next) => {
    // review, rating - req.body, tour - req.parmas & user - req.user
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

// GET A REVIEW
const getReview = factory.getOne(Review);

// CREATE A NEW REVIEW
const createReview = factory.createOne(Review)

// UPDATE REVIEW
const updateReview = factory.updateOne(Review);

// DELETE REVIEW
const deleteReview = factory.deleteOne(Review);

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    deleteReview,
    updateReview,
    setTourUserForReview,
}